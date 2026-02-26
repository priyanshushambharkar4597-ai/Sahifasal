


const express = require('express');
const cors    = require('cors');
const path    = require('path');

require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


app.use(express.static(__dirname));


app.post('/api/chat', async (req, res) => {
  const { messages, system } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const groqMessages = [
    { role: 'system', content: system || 'You are KrishiBot, a helpful agriculture assistant.' },
    ...messages
  ];

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model:       'llama3-70b-8192',
        max_tokens:  1000,
        temperature: 0.7,
        messages:    groqMessages
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.error?.message || 'Groq API error' });
    }

    const data = await response.json();
    const replyText = data.choices?.[0]?.message?.content || 'Sorry, no response generated.';

    res.json({
      content: [{ type: 'text', text: replyText }]
    });

  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});


app.get('/test', (req, res) => {
  res.json({
    status:     'KrishiBot server is running!',
    keyLoaded:  !!process.env.GROQ_API_KEY,
    keyPreview: process.env.GROQ_API_KEY
      ? process.env.GROQ_API_KEY.slice(0, 8) + '...'
      : 'MISSING'
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n✅ KrishiBot server running at http://localhost:${PORT}`);
  console.log(`   Groq API key: ${process.env.GROQ_API_KEY ? '✓ Loaded' : '✗ Missing – check your .env file'}\n`);
});
