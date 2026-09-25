require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// async function main() {
//   const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

//   const result = await model.embedContent("Do you have this in a smaller size?");
//   const embedding = result.embedding.values;

//   console.log("Embedding length:", embedding.length);
//   console.log("First 5 values:", embedding.slice(0, 5));
// }

const { ChromaClient } = require("chromadb");
const client = new ChromaClient({ path: "http://localhost:8000" });

async function embed(text) {
  const embedModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  const result = await embedModel.embedContent(text);
  return result.embedding.values;
}

async function main() {
  const collection = await client.getOrCreateCollection({ name: "test_messages" });

  const messages = [
    "Do you have this in a smaller size?",
    "What time does the store close?",
    "Can I return this if it doesn't fit?",
  ];

  for (let i = 0; i < messages.length; i++) {
    const vector = await embed(messages[i]);
    await collection.add({
      ids: [`msg-${i}`],
      embeddings: [vector],
      documents: [messages[i]],
    });
  }

  const queryVector = await embed("Is there a medium available?");
  const results = await collection.query({
    queryEmbeddings: [queryVector],
    nResults: 1,
  });

  console.log("Top matches:", results.documents);
}

main();