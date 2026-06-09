/**
 * Implementing plan
 * stage1 Indexing
 * 1.Load the document -pdf,text
 * 2.chunk the document
 * 3.Generate vector embeddings
 * 4.store the vector embedding -Vector Database
 * 
 * stage2 .Using the Chatbot
 * 1.set LLM
 * 2.add retrival step
 * 3.pass input+relevant information
 */
import {indexDocument} from "./prepare.js";
const filePath='./cg-internal-docs.pdf'
await indexDocument(filePath);
console.log("PDF indexed successfully");