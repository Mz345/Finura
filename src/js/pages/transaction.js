import { getAllTransactions, getUserCategories, updateTransaction, deleteTransaction, requireAuth, toDate } from '../api/api.js';
requireAuth();

document.addEventListener('DOMContentLoaded', () => {
  let allTransactions = [], allCategories = [];

  const searchInput      = document.getElementById('search-input');
  const typeFilter       = document.getElementById('type-filter');
  const categoryFilter   = document.getElementById('category-filter');
  const dateRangeFilter  = document.getElementById('date-range-filter');
  const tableBody        = document.getElementById('transactions-table-body');
  const editModal        = document.getElementById('edit-modal');
  const editForm         = document.getElementById('edit-form');
  const closeModalBtn    = document.getElementById('close-modal-btn');
  const cancelEditBtn    = document.getElementById('cancel-edit-btn');

  const formatCurrency     = (a)    => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(a);
  const formatDate         = (d)    => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatDateForInput = (d)    => d.toISOString().split('T')[0];

  searchInput.addEventListener('input', filterAndRenderTransactions);
  typeFilter.addEventListener('change', filterAndRenderTransactions);
  categoryFilter.addEventListener('change', filterAndRenderTransactions);
  dateRangeFilter.addEventListener('change', filterAndRenderTransactions);

  async function init() {
    try {
      [allTransactions, allCategories] = await Promise.all([getAllTransactions(), getUserCategories()]);
      populateCategoryFilter(categoryFilter);
      filterAndRenderTransactions();
    } catch (err) { console.error(err); }
  }
  init();

  function populateCategoryFilter(el) {
    el.innerHTML = '<option value="all">All Categories</option>';
    allCategories.forEach(cat => { const o = document.createElement('option'); o.value = cat; o.textContent = cat; el.appendChild(o); });
  }

  function filterAndRenderTransactions() {
    const searchTerm = searchInput.value.toLowerCase();
    const selType    = typeFilter.value;
    const selCat     = categoryFilter.value;
    const selDate    = dateRangeFilter.value;
    let filtered     = [...allTransactions];
    if (searchTerm) filtered = filtered.filter(tx => tx.description.toLowerCase().includes(searchTerm) || tx.category.toLowerCase().includes(searchTerm));
    if (selType !== 'all') filtered = filtered.filter(tx => tx.type === selType);
    if (selCat  !== 'all') filtered = filtered.filter(tx => tx.category === selCat);
    if (selDate !== 'all') {
      const now = new Date(); let start;
      if (selDate === 'this-month')  start = new Date(now.getFullYear(), now.getMonth(), 1);
      if (selDate === 'last-month')  start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      if (selDate === 'this-year')   start = new Date(now.getFullYear(), 0, 1);
      if (start) filtered = filtered.filter(tx => toDate(tx.date) >= start);
    }
    renderTable(filtered);
  }

  function renderTable(transactions) {
    const countEl = document.getElementById('transaction-count');
    tableBody.innerHTML = '';
    countEl.textContent = `Showing ${transactions.length} of ${allTransactions.length} transactions`;
    if (!transactions.length) { tableBody.innerHTML = `<tr class="no-transactions-row"><td colspan="6">No transactions found.</td></tr>`; return; }
    transactions.forEach(tx => {
      const isIncome = tx.type === 'income';
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${formatDate(toDate(tx.date))}</td>
        <td class="description-cell"><span class="icon-circle ${tx.type}"><i class="fa-solid ${isIncome ? 'fa-arrow-up' : 'fa-arrow-down'}"></i></span>${tx.description}</td>
        <td>${tx.category}</td>
        <td><span class="type-tag ${tx.type}">${tx.type}</span></td>
        <td class="amount ${tx.type}">${isIncome ? '+' : ''}${formatCurrency(tx.amount)}</td>
        <td class="actions-cell">
          <i class="fa-solid fa-pencil edit-btn" title="Edit" data-id="${tx._id}" data-type="${tx.type}"></i>
          <i class="fa-solid fa-trash delete-btn" title="Delete" data-id="${tx._id}" data-type="${tx.type}"></i>
        </td>`;
      tableBody.appendChild(row);
    });
  }

  function openEditModal(tx) {
    document.getElementById('edit-id').value          = tx._id;
    document.getElementById('edit-type').value        = tx.type;
    document.getElementById('edit-amount').value      = tx.amount;
    document.getElementById('edit-description').value = tx.description;
    document.getElementById('edit-date').value        = formatDateForInput(toDate(tx.date));
    const editCategorySelect = document.getElementById('edit-category');
    populateCategoryFilter(editCategorySelect);
    editCategorySelect.value = tx.category;
    editModal.classList.add('show');
  }

  function closeEditModal() { editModal.classList.remove('show'); editForm.reset(); }

  tableBody.addEventListener('click', (e) => {
    const editBtn   = e.target.closest('.edit-btn');
    const deleteBtn = e.target.closest('.delete-btn');
    if (editBtn) { const tx = allTransactions.find(t => t._id === editBtn.dataset.id); if (tx) openEditModal(tx); }
    if (deleteBtn) handleDeleteTransaction(deleteBtn.dataset.id);
  });

  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const updatedData = {
      amount: parseFloat(document.getElementById('edit-amount').value),
      description: document.getElementById('edit-description').value,
      category: document.getElementById('edit-category').value,
      date: document.getElementById('edit-date').value,
    };
    try {
      const updated = await updateTransaction(id, updatedData);
      const idx = allTransactions.findIndex(tx => tx._id === id);
      if (idx !== -1) allTransactions[idx] = updated;
      allTransactions.sort((a, b) => toDate(b.date) - toDate(a.date));
      filterAndRenderTransactions(); closeEditModal();
      alert('Transaction updated successfully!');
    } catch (err) { console.error(err); alert('Failed to update transaction.'); }
  });

  async function handleDeleteTransaction(id) {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await deleteTransaction(id);
      allTransactions = allTransactions.filter(tx => tx._id !== id);
      filterAndRenderTransactions();
      alert('Transaction deleted successfully!');
    } catch (err) { console.error(err); alert('Failed to delete transaction.'); }
  }

  closeModalBtn.addEventListener('click', closeEditModal);
  cancelEditBtn.addEventListener('click', closeEditModal);
  editModal.addEventListener('click', (e) => { if (e.target === editModal) closeEditModal(); });

  document.getElementById('add-income-btn').addEventListener('click', () => window.location.href = '/income');
  document.getElementById('add-expense-btn').addEventListener('click', () => window.location.href = '/expense');
});
