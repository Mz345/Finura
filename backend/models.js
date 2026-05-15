const mongoose = require('mongoose');

// ─── User ────────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true },
  avatarUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});
exports.User = mongoose.model('User', userSchema);

// ─── Category ─────────────────────────────────────────────────────────────────
const categorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:   { type: String, required: true },
  type:   { type: String, enum: ['income', 'expense'], required: true },
  budget: { type: Number, default: 0 }   // only meaningful for expense
});
exports.Category = mongoose.model('Category', categorySchema);

// ─── Transaction (income or expense) ─────────────────────────────────────────
const txSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:        { type: String, enum: ['income', 'expense'], required: true },
  amount:      { type: Number, required: true },
  category:    { type: String, required: true },
  description: { type: String, required: true },
  date:        { type: Date, required: true },
  notes:       { type: String, default: '' }
});
exports.Transaction = mongoose.model('Transaction', txSchema);
