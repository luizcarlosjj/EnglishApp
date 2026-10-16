import express from 'express';
import { config } from 'dotenv';
import chatHandler from './api/chat.js';
import sessionsHandler from './api/sessions.js';
import configHandler from './api/config.js';

config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.get('/api/config', configHandler);
app.post('/api/chat', chatHandler);
app.get('/api/sessions', sessionsHandler);
app.post('/api/sessions', sessionsHandler);
app.options('/api/*', (req, res) => res.sendStatus(200));

app.listen(3000, () => {
  console.log('\n  WhatsApp English Simulator');
  console.log('  Running at http://localhost:3000\n');
  const missing = ['OPENAI_API_KEY','SUPABASE_URL','SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY']
    .filter(k => !process.env[k]);
  if (missing.length) {
    console.warn('  WARNING: Missing env vars:', missing.join(', '));
    console.warn('  Copy .env.example to .env and fill in your keys.\n');
  }
});
