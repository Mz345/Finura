import { getReportData, requireAuth } from '../api/api.js';
requireAuth();

let expenseChartInstance = null, weeklyChartInstance = null;
const yearSelect   = document.getElementById('report-year');
const monthSelect  = document.getElementById('report-month');
const summaryIncomeEl         = document.getElementById('summary-income');
const summaryIncomeChangeEl   = document.getElementById('summary-income-change');
const summaryExpensesEl       = document.getElementById('summary-expenses');
const summaryExpensesChangeEl = document.getElementById('summary-expenses-change');
const summarySavingsEl        = document.getElementById('summary-savings');
const summarySavingsChangeEl  = document.getElementById('summary-savings-change');
const summaryRateEl           = document.getElementById('summary-rate');
const summaryRateStatusEl     = document.getElementById('summary-rate-status');
const expenseCtx              = document.getElementById('expenseBreakdownChart');
const expenseLegendContainer  = document.getElementById('expenseBreakdownLegend');
const weeklyCtx               = document.getElementById('weeklySpendingChart');
const incomeSourcesContainer  = document.getElementById('incomeSourcesBars');

const formatCurrency = (a) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(a);
const formatPercent  = (v) => { if (v === Infinity) return '+∞%'; if (isNaN(v)) return 'N/A'; return (v >= 0 ? '+' : '') + v.toFixed(1) + '%'; };
const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function populateDateFilters() {
  const currentYear  = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  for (let y = currentYear; y >= currentYear - 4; y--) {
    const o = document.createElement('option'); o.value = y; o.textContent = y; yearSelect.appendChild(o);
  }
  yearSelect.value = currentYear;
  months.forEach((m, i) => { const o = document.createElement('option'); o.value = i; o.textContent = m; monthSelect.appendChild(o); });
  monthSelect.value = currentMonth;
}

async function loadReportData() {
  try {
    const year  = parseInt(yearSelect.value);
    const month = parseInt(monthSelect.value);
    const data  = await getReportData(year, month);
    renderSummary(data);
    renderExpenseBreakdown(data.selectedPeriod.expensesByCategory);
    renderWeeklySpending(data.selectedPeriod.weeklySpending);
    renderIncomeSources(data.selectedPeriod.incomeByCategory, data.selectedPeriod.totalIncome);
  } catch (err) { console.error('Report load error:', err); }
}

function renderSummary(data) {
  const { selectedPeriod, incomeChangePercent, expenseChangePercent, savingsChangePercent } = data;
  summaryIncomeEl.textContent   = formatCurrency(selectedPeriod.totalIncome);
  summaryExpensesEl.textContent = formatCurrency(selectedPeriod.totalExpenses);
  summarySavingsEl.textContent  = formatCurrency(selectedPeriod.netSavings);
  summaryRateEl.textContent     = selectedPeriod.savingsRate.toFixed(1) + '%';
  summaryIncomeChangeEl.textContent   = `${formatPercent(incomeChangePercent)} vs last period`;
  summaryIncomeChangeEl.className     = `card-change ${incomeChangePercent >= 0 ? 'positive' : 'negative'}`;
  summaryExpensesChangeEl.textContent = `${formatPercent(expenseChangePercent)} vs last period`;
  summaryExpensesChangeEl.className   = `card-change ${expenseChangePercent >= 0 ? 'negative' : 'positive'}`;
  summarySavingsChangeEl.textContent  = `${formatPercent(savingsChangePercent)} vs last period`;
  summarySavingsChangeEl.className    = `card-change ${savingsChangePercent >= 0 ? 'positive' : 'negative'}`;
  let status = 'Poor', cls = 'poor';
  if (selectedPeriod.savingsRate > 20) { status = 'Excellent'; cls = 'good'; }
  else if (selectedPeriod.savingsRate > 10) { status = 'Good'; cls = 'good'; }
  else if (selectedPeriod.savingsRate > 0)  { status = 'Fair'; cls = 'fair'; }
  summaryRateStatusEl.textContent = status;
  summaryRateStatusEl.className   = `card-status ${cls}`;
}

function renderExpenseBreakdown(expensesByCategory) {
  const labels = Object.keys(expensesByCategory), amounts = Object.values(expensesByCategory);
  const total  = amounts.reduce((s, a) => s + a, 0);
  if (expenseChartInstance) expenseChartInstance.destroy();
  expenseLegendContainer.innerHTML = '';
  if (!labels.length) { expenseLegendContainer.innerHTML = '<p>No expense data for this period.</p>'; return; }
  const colors = ['#27A87A','#1A202C','#F8C346','#A0AEC0','#4A5568','#FBBF24','#3B82F6','#EF4444'];
  const bgColors = labels.map((_, i) => colors[i % colors.length]);
  expenseChartInstance = new Chart(expenseCtx, {
    type: 'doughnut',
    data: { labels, datasets: [{ data: amounts, backgroundColor: bgColors, borderColor: '#FFFFFF', borderWidth: 4, cutout: '70%' }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
  });
  labels.forEach((label, i) => {
    const pct  = total > 0 ? (amounts[i] / total) * 100 : 0;
    const item = document.createElement('div'); item.className = 'legend-item-custom';
    item.innerHTML = `<span class="legend-dot" style="background-color:${bgColors[i]};"></span><span class="legend-label">${label}</span><span class="legend-amount">${formatCurrency(amounts[i])}</span><span class="legend-percent">(${pct.toFixed(1)}%)</span>`;
    expenseLegendContainer.appendChild(item);
  });
}

function renderWeeklySpending(weeklyData) {
  if (weeklyChartInstance) weeklyChartInstance.destroy();
  weeklyChartInstance = new Chart(weeklyCtx, {
    type: 'bar',
    data: { labels: ['Week 1','Week 2','Week 3','Week 4'], datasets: [{ label: 'Weekly Spending', data: weeklyData, backgroundColor: '#27A87A', borderRadius: 4, maxBarThickness: 40 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true }, x: { grid: { display: false } } } }
  });
}

function renderIncomeSources(incomeByCategory, totalIncome) {
  incomeSourcesContainer.innerHTML = '';
  const sorted = Object.entries(incomeByCategory).sort(([, a], [, b]) => b - a);
  if (!sorted.length) { incomeSourcesContainer.innerHTML = '<p>No income data for this period.</p>'; return; }
  sorted.forEach(([cat, amount]) => {
    const pct  = totalIncome > 0 ? (amount / totalIncome) * 100 : 0;
    const item = document.createElement('div'); item.className = 'income-bar-item';
    item.innerHTML = `<div class="income-bar-header"><span class="income-label">${cat}</span><span class="income-amount-percent"><span class="income-amount">${formatCurrency(amount)}</span><span class="income-percent">(${pct.toFixed(1)}%)</span></span></div><div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${pct}%;"></div></div>`;
    incomeSourcesContainer.appendChild(item);
  });
}

yearSelect.addEventListener('change', loadReportData);
monthSelect.addEventListener('change', loadReportData);

document.addEventListener('DOMContentLoaded', () => { populateDateFilters(); loadReportData(); });
