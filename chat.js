import Groq from 'groq-sdk';
import readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';
import { getVectorStore } from './prepare.js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const __filename = fileURLToPath(import.meta.url);

export async function generate(question, companyId) {
  // simple heuristics for greetings / small-talk
  const isGreeting = (q) => {
    if (!q) return false;
    const s = q.trim().toLowerCase();
    const greetings = [
      'hi', 'hello', 'hey', "what's up", 'whats up', 'good morning', 'good afternoon', 'good evening', 'how are you', 'how r u', 'how are u', 'thanks', 'thank you'
    ];
    return greetings.some(g => s.startsWith(g) || s === g);
  };

  if (isGreeting(question)) {
    // allow general conversational replies for greetings/small talk
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a friendly conversational assistant. Answer greetings and small talk naturally.' },
        { role: 'user', content: question },
      ],
      model: 'llama-3.3-70b-versatile',
    });
    return chatCompletion.choices[0].message.content;
  }

  const companyStore = getVectorStore(companyId);
  const relevantChunks = await companyStore.similaritySearch(question, 3);

  console.log(`Retrieved ${relevantChunks.length} chunks for companyId=${companyId}`);
  if (relevantChunks.length) {
    console.log(relevantChunks.slice(0, 3).map((chunk, index) => ({
      index: index + 1,
      metadata: chunk.metadata,
      preview: chunk.pageContent.slice(0, 120),
    })));
  }

  if (!relevantChunks.length) {
    return "This question doesn't appear to be related to the company's documents. I can't answer company-specific questions without relevant documents. For greetings or general chit-chat I can reply normally.";
  }

  const context = relevantChunks
    .map((chunk, index) => `Context ${index + 1}: ${chunk.pageContent}`)
    .join('\n\n');

  const System_prompt = `You are an assistant for question-answering tasks. Use ONLY the provided context to answer the question. If the answer is not contained in the context, reply: \"I don't know (not enough company information)\".`;
  const userQuery = `Question: ${question}\n\nContext:\n${context}\n\nAnswer:`;

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: System_prompt },
      { role: 'user', content: userQuery },
    ],
    model: 'llama-3.3-70b-versatile',
  });

  return chatCompletion.choices[0].message.content;
}

export async function chat() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  while (true) {
    const question = await rl.question('You: ');
    if (question === '/bye') {
      break;
    }

    const answer = await generate(question);
    console.log(`Assistant: ${answer}`);
  }

  rl.close();
}

if (process.argv[1] === __filename) {
  await chat();
}
