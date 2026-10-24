import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini client server-side
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Search grounding endpoint
app.post('/api/search-grounding', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'Query is required' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Chưa cấu hình GEMINI_API_KEY trên server. Bạn vẫn có thể mở trực tiếp câu hỏi trên Google Search!',
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Trả lời ngắn gọn, chính xác bằng tiếng Việt dựa trên thông tin tìm kiếm mới nhất từ Google: ${query.trim()}`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || 'Không có câu trả lời được tạo ra.';
    const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const webSearchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

    const citations = rawChunks
      .map((c: any) => ({
        title: c.web?.title || 'Trang web nguồn',
        url: c.web?.uri || '',
      }))
      .filter((c: any) => Boolean(c.url));

    return res.json({
      text,
      citations,
      webSearchQueries,
    });
  } catch (err: any) {
    console.error('Error in search grounding API:', err);
    return res.status(500).json({
      error: err.message || 'Lỗi khi tra cứu kết quả Google Grounding',
    });
  }
});

// Dev server or Production static serving
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port} in ${isProduction ? 'production' : 'development'} mode`);
  });
}

startServer();
