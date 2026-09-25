
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function embedText(text){
  const embedModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  const result = await embedModel.embedContent(text);
  return result.embedding.values;
}

const { ChromaClient } = require("chromadb");
const chromaClient = new ChromaClient({ path: "http://localhost:8000" });

let messageCollection;

async function initChroma() {
  messageCollection = await chromaClient.getOrCreateCollection({ name: "chat_messages" });
  console.log("Chroma collection ready");
}

initChroma();

const app = express();
app.use(cors());
app.use(express.json());
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/message", async(req, res) => {
  const { role, text, targetLanguage } = req.body;

    try{
       const queryVector = await embedText(text);// 1. Embed the incoming message
       const retrievedContext = await messageCollection.query({  // 2. retrieving embedded messages
    queryEmbeddings: [queryVector],
    nResults: 3,
  });
  console.log("Top Matches", retrievedContext.documents)

      // 3. Generate reply (existing logic, we'll adjust the prompt next step)
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      systemInstruction: `You are a translation assistant helping a retail staff member and a customer communicate naturally, even though they speak different languages. You will receive some relevant earlier context from the conversation, followed by a new message. Use the earlier context only to understand meaning and references (e.g. "it," "that," "the red one") — do not translate or repeat the context itself. Translate only the new message into ${targetLanguage}, preserving the speaker's tone and intent. Respond with only the translated new message — no extra commentary, no repeated context, no explanation.`,
    });
    const contextText = retrievedContext.documents[0].join(" | ");
    const result = await model.generateContent(
    `Relevant earlier context: ${contextText}\n\nNew message to translate: ${text}`
    );
    const translatedText = result.response.text();

    res.json({ reply: translatedText });

        // 4. Store this message AFTER generating the reply
    await messageCollection.add({
      ids: [`msg-${Date.now()}`],
      embeddings: [queryVector],
      documents: [text],
    });

    }
    catch(error){
      console.error("Error:", error);
    res.status(500).json({ error: "Something went wrong." });
    }
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});

