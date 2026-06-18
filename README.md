# AI-Powered-Company-Knowledge-Assistant

## Overview

AI-Powered-Company-Knowledge-Assistant is a Retrieval-Augmented Generation (RAG) application that allows users to ask questions from company documents (PDFs). The chatbot retrieves relevant information from stored document embeddings and generates accurate responses using Llama 3.3 through Groq.

## Features

* PDF document ingestion
* Automatic text chunking
* Embedding generation using Ollama (nomic-embed-text)
* Vector storage using Pinecone
* Semantic search and retrieval
* Llama 3.3 powered responses via Groq
* Express.js API backend

## Tech Stack

* Node.js
* Express.js
* LangChain
* Ollama
* Pinecone
* Groq API
* PDF Loader

## Project Structure

company-chatbot/

├── index.js

├── prepare.js

├── chat.js

├── server.js

├── package.json

├── .gitignore

└── README.md

## Installation

Clone the repository:

git clone https://github.com/YOUR_USERNAME/AI-Powered-Company-Knowledge-Assistant

cd company-chatbot

Install dependencies:

npm install

## Environment Variables

Create a .env file:

GROQ_API_KEY=your_key

PINECONE_API_KEY=your_key

PINECONE_INDEX_NAME=your_index_name

## Run the Project

Index PDF:

npm start

Run server:

node server.js

## Workflow

PDF → Chunking → Embeddings → Pinecone → Retrieval → Groq LLM → Response

## Future Improvements

* React Frontend
* Multiple PDF Support
* User Authentication
* Chat History
* Deployment on Render/Vercel

## Author

Ayush Agrahari
