import { getBudgetOverview, requireAuth } from '../api/api.js';
requireAuth();

const formatAsCurrency = (a) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(a);

async function loadBudget() {
  try {
    const budgetData = await getBudgetOverview();
    if (!budgetData || !budgetData.length) { console.log('No budget data found.'); return; }
    renderSummaryCards(budgetData);
    renderAlerts(budgetData);
    renderCategories(budgetData);
  } catch (err) { console.error('Budget load error:', err); }
}

function renderSummaryCards(budgetData) {
  const totalBudget   = budgetData.reduce((s, c) => s + c.budget, 0);
  const totalSpent    = budgetData.reduce((s, c) => s + c.spent, 0);
  const remaining     = totalBudget - totalSpent;
  const spentPct      = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  document.querySelector('#total-budget .card-amount').textContent   = formatAsCurrency(totalBudget);
  document.querySelector('#total-spent .card-amount').textContent    = formatAsCurrency(totalSpent);
  document.querySelector('#total-spent .card-subtitle').textContent  = `${spentPct.toFixed(1)}% of budget`;
  document.querySelector('#remaining .card-amount').textContent      = formatAsCurrency(remaining);
  const healthEl = document.querySelector('#budget-health .health-status');
  let health = 'Good';
  if (spentPct >= 90 && spentPct <= 100) health = 'Fair';
  else if (spentPct > 100)               health = 'Poor';
  healthEl.querySelector('span').textContent = health;
}

function renderAlerts(budgetData) {
  const container = document.getElementById('alerts-container');
  container.innerHTML = '';
  const exceeded = budgetData.filter(c => c.status === 'Exceeded');
  const warning  = budgetData.filter(c => c.status === 'Warning');
  if (exceeded.length) {
    const el = document.createElement('div'); el.className = 'alert alert-danger';
    el.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> You've exceeded your budget in ${exceeded.length} category: ${exceeded.map(c => c.name).join(', ')}.`;
    container.appendChild(el);
  }
  if (warning.length) {
    const el = document.createElement('div'); el.className = 'alert alert-warning';
    el.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> You're close to your budget limit in ${warning.length} categor${warning.length > 1 ? 'ies' : 'y'}: ${warning.map(c => c.name).join(', ')}.`;
    container.appendChild(el);
  }
}

function renderCategories(budgetData) {
  const container = document.getElementById('budget-categories-list');
  container.innerHTML = '';
  budgetData.forEach(cat => {
    const item = document.createElement('div'); item.className = 'category-item';
    const statusClass   = cat.status.toLowerCase().replace(' ', '-');
    const remainingText = cat.remaining >= 0 ? `${formatAsCurrency(cat.remaining)} left` : `${formatAsCurrency(Math.abs(cat.remaining))} over`;
    item.innerHTML = `
      <div class="category-header"><h4>${cat.name}</h4><span class="status-tag ${statusClass}">${cat.status}</span></div>
      <div class="category-amount">
        <span class="spent-budget">${formatAsCurrency(cat.spent)} / ${formatAsCurrency(cat.budget)}</span>
        <p class="remaining ${cat.remaining >= 0 ? 'positive' : 'negative'}">${remainingText}</p>
      </div>
      <div class="progress-bar-container"><div class="progress-bar ${statusClass}" style="width: ${Math.min(cat.percentageUsed, 100)}%;"></div></div>
      <div class="category-footer"><span>${cat.percentageUsed.toFixed(1)}% used</span><span>${(100 - cat.percentageUsed).toFixed(1)}% remaining</span></div>`;
    container.appendChild(item);
  });
}

document.getElementById('add-category-btn').addEventListener('click', () => window.location.href = '/category');
document.getElementById('manage-category-btn').addEventListener('click', () => window.location.href = '/managecategory');

loadBudget();
