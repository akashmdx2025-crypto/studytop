// source_handbook: week11-hackathon-preparation
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import pdf from 'pdf-parse';

import { chunkText } from './src/lib/chunker';
import { logAICall, getLogs } from './src/lib/logger';
import { DocumentStats } from './src/lib/types';

const PORT = Number(process.env.PORT) || 3000;
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

async function startServer() {
  try {
    // Vite middleware setup
    if (process.env.NODE_ENV !== 'production') {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    // Only listen if NOT on Vercel
    if (!process.env.VERCEL) {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
      });
    }
  } catch (error) {
    console.error('SERVER_STARTUP_ERROR:', error);
    process.exit(1);
  }
}

startServer();

export default app;
