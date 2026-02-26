
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

  console.log('process.env');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/chat', async (req, res) => {
  try {
    if (!process.env.API_KEY) {
      return res.status(500).json({ error: 'API_KEY is missing in .env file' });
    }

    

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'KrishiBot'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        max_tokens: req.body.max_tokens || 1000,
        messages: req.body.messages
      })
    });

    const data = await response.json();
    console.log('📩 Response status:', response.status);

    if (!response.ok || data.error) {
      console.error('❌ Error:', data.error || data);
      return res.status(response.status || 500).json({
        error: data.error?.message || 'API error'
      });
    }

    console.log('✅ Success!');
    res.json(data);

  } catch (err) {
    console.error('❌ Server error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.use(express.static(path.join(__dirname)));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ KrishiBot server running on http://localhost:${PORT}`);
  console.log(`🔑 API Key: ${process.env.API_KEY ? 'YES (' + process.env.API_KEY.slice(0,10) + '...)' : 'MISSING!'}`);
});
