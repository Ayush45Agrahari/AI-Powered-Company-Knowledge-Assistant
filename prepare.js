import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { OllamaEmbeddings } from '@langchain/ollama';
import { PineconeStore } from '@langchain/pinecone';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Pinecone as PineconeClient } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
dotenv.config();

const embeddings = new OllamaEmbeddings({
  model: 'nomic-embed-text',
  baseUrl: 'http://127.0.0.1:11434',
});

const pinecone = new PineconeClient();
const pineconeIndex = pinecone.index(process.env.PINECONE_INDEX_NAME);

export function getVectorStore(companyId) {
  return new PineconeStore(embeddings, {
    pineconeIndex,
    namespace: companyId,
    maxConcurrency: 5,
  });
}

export async function indexDocument(filePath, companyId) {
  const loader = new PDFLoader(filePath, { splitPages: false });
  const docs = await loader.load();
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 200 });

  const documents = [];
  for (const doc of docs) {
    const texts = await splitter.splitText(doc.pageContent);
    for (const chunk of texts) {
      documents.push({
        pageContent: chunk,
        metadata: {
          source: filePath,
          title: doc.metadata?.title ?? filePath,
        },
      });
    }
  }

  const companyStore = getVectorStore(companyId);
  await companyStore.addDocuments(documents);
  console.log(`Indexed ${documents.length} chunks for companyId=${companyId}`);
}
