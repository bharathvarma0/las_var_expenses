const express  = require('express');
const cors     = require('cors');
const { initDB } = require('./database');

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: ${origin} not allowed`));
  },
}));
app.use(express.json());

app.use('/api/users',      require('./routes/users'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/budgets',    require('./routes/budgets'));
app.use('/api/expenses',   require('./routes/expenses'));

app.get('/health', (_, res) => res.json({ ok: true }));

// Initialize DB schema + seed, then start (or export for Vercel)
let ready = false;
const init = initDB()
  .then(() => { ready = true; console.log('✅ DB ready'); })
  .catch(err => { console.error('DB init failed:', err); process.exit(1); });

// Vercel exports the app; local dev listens on a port
if (require.main === module) {
  init.then(() => {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
  });
}

module.exports = app;
