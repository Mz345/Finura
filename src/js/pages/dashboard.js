import {
  getMonthlyExpensesByCategory,
  getExpensesTrend,
  getRecentTransactions,
  getDashboardSummary,
  requireAuth,
  toDate
} from '../api/api.js';
import '../components/DonutChart.js';
import '../components/LineChart.js';

requireAuth();

const formatAsCurrency = (amount) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0
}).format(amount);

async function loadDashboard() {
  try {
    const [summary, categoryData, trendData, transactions] = await Promise.all([
      getDashboardSummary(),
      getMonthlyExpensesByCategory(),
      getExpensesTrend(),
      getRecentTransactions()
    ]);

    document.getElementById('total-income-box-insight').textContent  = formatAsCurrency(summary.totalIncome);
    document.getElementById('total-expense-box-insight').textContent = formatAsCurrency(summary.totalExpenses);
    document.getElementById('balance-left-box-insight').textContent  = formatAsCurrency(summary.balance);

    const expenseChartComponent = document.getElementById('expenseCategoryChart');
    expenseChartComponent.data = {
      labels: Object.keys(categoryData),
      amounts: Object.values(categoryData)
    };

    const lineChartComponent = document.getElementById('expenseTrendChart');
    lineChartComponent.data = { labels: trendData.labels, amounts: trendData.amounts };

    renderTransactions(transactions);
  } catch (err) {
    console.error('Dashboard load error:', err);
  }
}

function renderTransactions(transactions) {
  const listContainer = document.getElementById('recentTransactionsList');
  listContainer.innerHTML = '';
  if (!transactions.length) {
    listContainer.innerHTML = `<p class="no-transactions">No recent activity found.</p>`;
    return;
  }
  transactions.forEach(tx => {
    const isIncome = tx.type === 'income';
    const iconClass = isIncome ? 'fa-arrow-up' : 'fa-arrow-down';
    const amountPrefix = isIncome ? '+' : '';
    const formattedAmount = formatAsCurrency(tx.amount).replace('₹', '');
    const item = document.createElement('div');
    item.className = `transaction-item ${tx.type}`;
    item.innerHTML = `
      <div class="transaction-icon"><i class="fa-solid ${iconClass}"></i></div>
      <div class="transaction-details">
        <div class="description">${tx.description}</div>
        <div class="date">${formatRelativeDate(toDate(tx.date))}</div>
      </div>
      <div class="transaction-amount">
        <div class="amount">${amountPrefix}₹${formattedAmount}</div>
        <div class="type">${tx.type}</div>
      </div>`;
    listContainer.appendChild(item);
  });
}

function formatRelativeDate(date) {
  const diffDays = Math.floor((new Date() - date) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays <= 7)  return `${diffDays} days ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

loadDashboard();
