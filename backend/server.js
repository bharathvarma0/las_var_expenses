const express   = require('express');
const cors      = require('cors');

const app = express();

app.use(cors()); // Same-domain on Netlify; open for local dev
app.use(express.json());

app.use('/api/users',      require('./routes/users'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/budgets',    require('./routes/budgets'));
app.use('/api/expenses',   require('./routes/expenses'));

app.get('/health', (_, res) => res.json({ ok: true }));

// Only start the server when run directly (local dev)
if (require.main === module) {
  const { initDB } = require('./database');
  const PORT = process.env.PORT || 3001;
  initDB()
    .then(() => app.listen(PORT, () => console.log(`Backend on port ${PORT}`)))
    .catch(err => { console.error('DB init failed:', err); process.exit(1); });
}

module.exports = app;
