// src/js/api/api.js
// Replaces Firebase - all calls go to our Express/MongoDB backend

const BASE = ''; // same origin

// ─── Token helpers ────────────────────────────────────────────────────────────
export const getToken    = ()        => localStorage.getItem('finura_token');
export const setToken    = (t)       => localStorage.setItem('finura_token', t);
export const removeToken = ()        => localStorage.removeItem('finura_token');
export const getUser     = ()        => JSON.parse(localStorage.getItem('finura_user') || 'null');
export const setUser     = (u)       => localStorage.setItem('finura_user', JSON.stringify(u));
export const removeUser  = ()        => localStorage.removeItem('finura_user');

export function isLoggedIn() { return !!getToken(); }

export function requireAuth() {
  if (!isLoggedIn()) { window.location.href = '/login'; }
}

export function redirectIfLoggedIn() {
  if (isLoggedIn()) { window.location.href = '/dashboard'; }
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(BASE + path, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════════════════
export async function signUpWithEmail(name, email, password) {
  const data = await apiFetch('/api/auth/signup', {
    method: 'POST', body: JSON.stringify({ name, email, password })
  });
  setToken(data.token);
  setUser(data.user);
  return data;
}

export async function signInWithEmail(email, password) {
  const data = await apiFetch('/api/auth/login', {
    method: 'POST', body: JSON.stringify({ email, password })
  });
  setToken(data.token);
  setUser(data.user);
  return data;
}

export function logoutUser() {
  removeToken();
  removeUser();
  window.location.href = '/login';
}

// ═══════════════════════════════════════════════════════════════════════════════
// USER PROFILE
// ═══════════════════════════════════════════════════════════════════════════════
export const getUserProfile     = ()           => apiFetch('/api/user/profile');
export const updateUserProfile  = (name)       => apiFetch('/api/user/profile', { method: 'PATCH', body: JSON.stringify({ name }) });
export const getUserStats       = ()           => apiFetch('/api/user/stats');

// Alias kept for compatibility
export const updateUserProfileName = (name)    => updateUserProfile(name);

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════════════════════════════════════════════
export const getAllCategories         = ()     => apiFetch('/api/categories');
export const getUserCategories        = ()     => apiFetch('/api/categories/names');
export const getUserExpenseCategories = ()     => apiFetch('/api/categories/names?type=expense');
export const getUserIncomeCategories  = ()     => apiFetch('/api/categories/names?type=income');

export const addCategory    = (data) => apiFetch('/api/categories', { method: 'POST', body: JSON.stringify(data) });
export const updateCategory = (id, data) => apiFetch(`/api/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteCategory = (id)  => apiFetch(`/api/categories/${id}`, { method: 'DELETE' });

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSACTIONS
// ═══════════════════════════════════════════════════════════════════════════════
export const getAllTransactions = () => apiFetch('/api/transactions');

export const addExpense = (data) => apiFetch('/api/transactions', {
  method: 'POST', body: JSON.stringify({ ...data, type: 'expense' })
});

export const addIncome = (data) => apiFetch('/api/transactions', {
  method: 'POST', body: JSON.stringify({ ...data, type: 'income' })
});

export const updateTransaction = (id, data) => apiFetch(`/api/transactions/${id}`, {
  method: 'PATCH', body: JSON.stringify(data)
});

export const deleteTransaction = (id) => apiFetch(`/api/transactions/${id}`, { method: 'DELETE' });

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
export const getDashboardSummary          = () => apiFetch('/api/dashboard/summary');
export const getMonthlyExpensesByCategory = () => apiFetch('/api/dashboard/expenses-by-category');
export const getExpensesTrend             = () => apiFetch('/api/dashboard/expenses-trend');
export const getRecentTransactions        = () => apiFetch('/api/dashboard/recent-transactions');

// Aliases used by some pages
export const getMonthlyTotalIncome    = () => getDashboardSummary().then(d => d.totalIncome);
export const getMonthlyTotalExpenses  = () => getDashboardSummary().then(d => d.totalExpenses);

// ═══════════════════════════════════════════════════════════════════════════════
// BUDGET
// ═══════════════════════════════════════════════════════════════════════════════
export const getBudgetOverview = () => apiFetch('/api/budget/overview');

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════════════════════════════════════════
export const getReportData = (year, month) => apiFetch(`/api/reports?year=${year}&month=${month}`);

// ─── Date utility (replaces Firestore Timestamp.toDate()) ────────────────────
// MongoDB returns ISO strings, so we just use new Date(tx.date)
export function toDate(dateValue) {
  if (!dateValue) return new Date();
  if (dateValue instanceof Date) return dateValue;
  return new Date(dateValue);
}
