import express from 'express';
import path from 'path';
// Using standard pdf-parse import as a fallback if PDFParse class fails
import pdf from 'pdf-parse';

import { chunkText } from '../src/lib/chunker';
import { logAICall, getLogs } from '../src/lib/logger';
import { DocumentStats } from '../src/lib/types';

const app = express();

app.use(express.json({ limit: '20mb' }));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/logs', (req, res) => {
  res.json(getLogs());
});

app.post('/api/log-ai-call', (req, res) => {
  try {
    logAICall(req.body);
    res.json({ status: 'ok' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/upload', async (req, res) => {
  try {
    const { fileName, fileType, content } = req.body; // content is base64
    let text = '';

    if (fileType === 'application/pdf') {
      const buffer = Buffer.from(content, 'base64');
      // Standard pdf-parse usage: pdf(buffer)
      const pdfData = await pdf(buffer);
      text = pdfData.text;
    } else {
      text = Buffer.from(content, 'base64').toString('utf-8');
    }

    // Cleanup text
    text = text.replace(/\n\s*\n/g, '\n').trim();

    const chunks = chunkText(text);
    
    const stats: DocumentStats = {
      wordCount: text.split(/\s+/).length,
      charCount: text.length,
      chunkCount: chunks.length,
    };

    res.json({ stats, chunks });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// For Vercel, we don't need the static file serving here if we use rewrites properly.
// The frontend will be served as a static site.

export default app;
