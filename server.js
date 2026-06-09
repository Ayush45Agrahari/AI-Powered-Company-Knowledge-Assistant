import cors from 'cors';
import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { generate } from './chat.js';
import { indexDocument } from './prepare.js';

const app = express();
const port = 3001;
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('frontend'));

app.get('/', (req, res) => {
  res.sendFile(path.resolve('frontend', 'index.html'));
});

app.post('/upload', async (req, res) => {
  try {
    const { companyId, fileName, fileBase64 } = req.body;
    if (!companyId || !fileName || !fileBase64) {
      return res.status(400).json({ message: 'companyId, fileName, and fileBase64 are required' });
    }

    const uploadDir = path.resolve('uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, `${Date.now()}-${fileName}`);
    const buffer = Buffer.from(fileBase64, 'base64');
    await fs.writeFile(filePath, buffer);

    await indexDocument(filePath, companyId);
    res.json({ message: 'Document indexed successfully', companyId });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error?.message || 'Failed to upload and index document' });
  }
});

app.post('/chat', async (req, res) => {
  try {
    const { message, companyId } = req.body;
    if (!message || !companyId) {
      return res.status(400).json({ message: 'message and companyId are required' });
    }

    console.log('Received message:', message, 'companyId:', companyId);
    const result = await generate(message, companyId);
    res.json({ message: result });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: error?.message || 'Failed to process chat request' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port : ${port}`);
});