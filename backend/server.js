require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const { User, Category, Transaction } = require('./models');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'finura_secret_change_in_prod';
const MONGO_URI  = process.env.MONGO_URI  || 'mongodb://localhost:27017/finura';
const PORT       = process.env.PORT        || 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..')));

// ─── Auth middleware ──────────────────────────────────────────────────────────
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const startOfMonth = (y, m) => new Date(y, m, 1);
const endOfMonth   = (y, m) => new Date(y, m + 1, 1);

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/auth/signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const avatarUrl = `https://robohash.org/${encodeURIComponent(name + Date.now())}`;
    const user = await User.create({ name, email, password: hashed, avatarUrl });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name, email, avatarUrl } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// USER PROFILE ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/user/profile
app.get('/api/user/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/user/profile
app.patch('/api/user/profile', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(req.userId, { name }, { new: true }).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/user/stats
app.get('/api/user/stats', auth, async (req, res) => {
  try {
    const [income, expenses] = await Promise.all([
      Transaction.find({ userId: req.userId, type: 'income' }),
      Transaction.find({ userId: req.userId, type: 'expense' })
    ]);
    const totalIncome    = income.reduce((s, t) => s + t.amount, 0);
    const totalExpenses  = expenses.reduce((s, t) => s + t.amount, 0);
    res.json({ totalTransactions: income.length + expenses.length, totalIncome, totalExpenses });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/categories
app.get('/api/categories', auth, async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { userId: req.userId };
    if (type) filter.type = type;
    const cats = await Category.find(filter).sort({ name: 1 });
    res.json(cats);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/categories/names  — returns just category names (unique)
app.get('/api/categories/names', auth, async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { userId: req.userId };
    if (type) filter.type = type;
    const cats = await Category.find(filter).sort({ name: 1 });
    res.json(cats.map(c => c.name));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/categories
app.post('/api/categories', auth, async (req, res) => {
  try {
    const { name, type, budget } = req.body;
    if (!name || !type) return res.status(400).json({ error: 'Name and type are required' });
    const cat = await Category.create({ userId: req.userId, name, type, budget: budget || 0 });
    res.status(201).json(cat);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/categories/:id
app.patch('/api/categories/:id', auth, async (req, res) => {
  try {
    const cat = await Category.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    res.json(cat);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/categories/:id
app.delete('/api/categories/:id', auth, async (req, res) => {
  try {
    await Category.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSACTION ROUTES  (income + expenses unified)
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/transactions
app.get('/api/transactions', auth, async (req, res) => {
  try {
    const txs = await Transaction.find({ userId: req.userId }).sort({ date: -1 });
    res.json(txs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/transactions
app.post('/api/transactions', auth, async (req, res) => {
  try {
    const { type, amount, category, description, date, notes } = req.body;
    if (!type || !amount || !category || !description || !date)
      return res.status(400).json({ error: 'type, amount, category, description, date are required' });
    const tx = await Transaction.create({
      userId: req.userId, type,
      amount: parseFloat(amount), category, description,
      date: new Date(date), notes: notes || ''
    });
    res.status(201).json(tx);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/transactions/:id
app.patch('/api/transactions/:id', auth, async (req, res) => {
  try {
    const update = { ...req.body };
    if (update.date) update.date = new Date(update.date);
    if (update.amount) update.amount = parseFloat(update.amount);
    const tx = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      update, { new: true }
    );
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });
    res.json(tx);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/transactions/:id
app.delete('/api/transactions/:id', auth, async (req, res) => {
  try {
    await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD DATA ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/dashboard/summary  — monthly totals
app.get('/api/dashboard/summary', auth, async (req, res) => {
  try {
    const now = new Date();
    const start = startOfMonth(now.getFullYear(), now.getMonth());
    const end   = endOfMonth(now.getFullYear(), now.getMonth());

    const txs = await Transaction.find({ userId: req.userId, date: { $gte: start, $lt: end } });
    let totalIncome = 0, totalExpenses = 0;
    txs.forEach(t => { if (t.type === 'income') totalIncome += t.amount; else totalExpenses += t.amount; });

    res.json({ totalIncome, totalExpenses, balance: totalIncome - totalExpenses });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/dashboard/expenses-by-category  — current month
app.get('/api/dashboard/expenses-by-category', auth, async (req, res) => {
  try {
    const now = new Date();
    const start = startOfMonth(now.getFullYear(), now.getMonth());
    const end   = endOfMonth(now.getFullYear(), now.getMonth());

    const txs = await Transaction.find({ userId: req.userId, type: 'expense', date: { $gte: start, $lt: end } });
    const map = {};
    txs.forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount; });
    res.json(map);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/dashboard/expenses-trend  — last 6 months
app.get('/api/dashboard/expenses-trend', auth, async (req, res) => {
  try {
    const now = new Date();
    const labels = [];
    const monthlyTotals = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(d.toLocaleString('default', { month: 'short' }));
      monthlyTotals[`${d.getFullYear()}-${d.getMonth()}`] = 0;
    }

    const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const end   = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const txs = await Transaction.find({ userId: req.userId, type: 'expense', date: { $gte: start, $lt: end } });
    txs.forEach(t => {
      const key = `${t.date.getFullYear()}-${t.date.getMonth()}`;
      if (monthlyTotals.hasOwnProperty(key)) monthlyTotals[key] += t.amount;
    });

    res.json({ labels, amounts: Object.values(monthlyTotals) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/dashboard/recent-transactions
app.get('/api/dashboard/recent-transactions', auth, async (req, res) => {
  try {
    const txs = await Transaction.find({ userId: req.userId }).sort({ date: -1 }).limit(8);
    res.json(txs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// BUDGET OVERVIEW ROUTE
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/budget/overview
app.get('/api/budget/overview', auth, async (req, res) => {
  try {
    const now = new Date();
    const start = startOfMonth(now.getFullYear(), now.getMonth());
    const end   = endOfMonth(now.getFullYear(), now.getMonth());

    const [cats, txs] = await Promise.all([
      Category.find({ userId: req.userId, type: 'expense' }),
      Transaction.find({ userId: req.userId, type: 'expense', date: { $gte: start, $lt: end } })
    ]);

    const spentMap = {};
    txs.forEach(t => { spentMap[t.category] = (spentMap[t.category] || 0) + t.amount; });

    const overview = cats.map(cat => {
      const spent = spentMap[cat.name] || 0;
      const remaining = cat.budget - spent;
      const pct = cat.budget > 0 ? (spent / cat.budget) * 100 : 0;
      let status = 'On Track';
      if (pct >= 90 && pct <= 100) status = 'Warning';
      else if (pct > 100)          status = 'Exceeded';
      return { id: cat._id, name: cat.name, budget: cat.budget, spent, remaining, percentageUsed: pct, status };
    });

    res.json(overview);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTS ROUTE
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/reports?year=2025&month=9
app.get('/api/reports', auth, async (req, res) => {
  try {
    const year  = parseInt(req.query.year)  || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth();

    const selStart  = startOfMonth(year, month);
    const selEnd    = endOfMonth(year, month);
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear  = month === 0 ? year - 1 : year;
    const prevStart = startOfMonth(prevYear, prevMonth);
    const prevEnd   = endOfMonth(prevYear, prevMonth);

    const aggregate = async (start, end) => {
      const txs = await Transaction.find({ userId: req.userId, date: { $gte: start, $lt: end } });
      let totalIncome = 0, totalExpenses = 0;
      const incomeByCategory = {}, expensesByCategory = {};
      const expensesByWeek = [0, 0, 0, 0];

      txs.forEach(t => {
        if (t.type === 'income') {
          totalIncome += t.amount;
          incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
        } else {
          totalExpenses += t.amount;
          expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
          const weekIdx = Math.min(Math.floor((t.date.getDate() - 1) / 7), 3);
          expensesByWeek[weekIdx] += t.amount;
        }
      });

      const netSavings  = totalIncome - totalExpenses;
      const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
      return { totalIncome, totalExpenses, netSavings, savingsRate, incomeByCategory, expensesByCategory, weeklySpending: expensesByWeek };
    };

    const calc = (cur, prev) => {
      if (prev === 0 && cur > 0)  return Infinity;
      if (prev === 0 && cur === 0) return 0;
      return ((cur - prev) / prev) * 100;
    };

    const [sel, prev] = await Promise.all([aggregate(selStart, selEnd), aggregate(prevStart, prevEnd)]);

    res.json({
      selectedPeriod: { year, month, ...sel },
      previousPeriod: prev,
      incomeChangePercent:  calc(sel.totalIncome,   prev.totalIncome),
      expenseChangePercent: calc(sel.totalExpenses,  prev.totalExpenses),
      savingsChangePercent: calc(sel.netSavings,     prev.netSavings)
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── HTML page routes ─────────────────────────────────────────────────────────
const pages = ['dashboard', 'income', 'expense', 'category', 'managecategory', 'transaction', 'budget', 'reports', 'profile', 'signup', 'login'];
pages.forEach(p => {
  app.get(`/${p}`, (req, res) => {
    const map = { income: 'income', expense: 'expense', category: 'category', reports: 'reports', profile: 'profile' };
    const file = map[p] ? `${p}.html` : `${p}.html`;
    res.sendFile(path.join(__dirname, '..', file));
  });
});

// ─── Connect & Start ──────────────────────────────────────────────────────────
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Finura server running at http://localhost:${PORT}`));
  })
  .catch(err => { console.error('❌ MongoDB connection error:', err); process.exit(1); });
