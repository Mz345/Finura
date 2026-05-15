import { getAllCategories, updateCategory, deleteCategory, requireAuth } from '../api/api.js';
requireAuth();

let allCategories = [];
const listContainer    = document.getElementById('categories-list');
const addCategoryBtn   = document.getElementById('add-category-btn');
const editModal        = document.getElementById('edit-modal');
const editForm         = document.getElementById('edit-form');
const closeModalBtn    = document.getElementById('close-modal-btn');
const cancelEditBtn    = document.getElementById('cancel-edit-btn');
const editTypeSelect   = document.getElementById('edit-type');
const editBudgetContainer = document.getElementById('edit-budget-container');

document.addEventListener('DOMContentLoaded', () => {

  async function loadCategories() {
    try {
      allCategories = await getAllCategories();
      renderCategories();
    } catch (err) { listContainer.innerHTML = '<p class="no-categories">Error loading categories.</p>'; }
  }

  function renderCategories() {
    listContainer.innerHTML = '';
    if (!allCategories.length) { listContainer.innerHTML = '<p class="no-categories">No categories found. Click "Add New Category" to start.</p>'; return; }
    allCategories.forEach(cat => {
      const item = document.createElement('div'); item.className = 'category-item';
      item.innerHTML = `
        <span class="type-tag ${cat.type}">${cat.type}</span>
        <div class="category-info">
          <div class="name">${cat.name}</div>
          ${cat.type === 'expense' ? `<div class="budget">Budget: ₹${cat.budget.toLocaleString()}</div>` : ''}
        </div>
        <div class="category-actions">
          <button class="action-btn edit-btn" data-id="${cat._id}" aria-label="Edit ${cat.name}"><i class="fa-solid fa-pencil"></i></button>
          <button class="action-btn delete-btn" data-id="${cat._id}" aria-label="Delete ${cat.name}"><i class="fa-solid fa-trash"></i></button>
        </div>`;
      listContainer.appendChild(item);
    });
  }

  addCategoryBtn.addEventListener('click', () => window.location.href = '/category');

  listContainer.addEventListener('click', (e) => {
    const editBtn   = e.target.closest('.edit-btn');
    const deleteBtn = e.target.closest('.delete-btn');
    if (editBtn)   { const cat = allCategories.find(c => c._id === editBtn.dataset.id);   if (cat) openEditModal(cat); }
    if (deleteBtn) handleDelete(deleteBtn.dataset.id);
  });

  function openEditModal(cat) {
    document.getElementById('edit-id').value   = cat._id;
    document.getElementById('edit-name').value = cat.name;
    editTypeSelect.value = cat.type;
    if (cat.type === 'expense') { editBudgetContainer.style.display = 'block'; document.getElementById('edit-budget').value = cat.budget; }
    else { editBudgetContainer.style.display = 'none'; document.getElementById('edit-budget').value = ''; }
    editModal.classList.add('show');
  }

  function closeEditModal() { editModal.classList.remove('show'); editForm.reset(); }

  editTypeSelect.addEventListener('change', () => { editBudgetContainer.style.display = editTypeSelect.value === 'expense' ? 'block' : 'none'; });

  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const updatedData = { name: document.getElementById('edit-name').value.trim(), type: editTypeSelect.value, budget: document.getElementById('edit-budget').value || 0 };
    if (!updatedData.name) { alert('Category name cannot be empty.'); return; }
    try {
      await updateCategory(id, updatedData);
      alert('Category updated successfully!');
      closeEditModal();
      loadCategories();
    } catch (err) { alert('Error: Could not update category.'); }
  });

  async function handleDelete(id) {
    const cat = allCategories.find(c => c._id === id);
    if (!cat) return;
    if (!confirm(`Are you sure you want to delete "${cat.name}"? This cannot be undone.`)) return;
    try {
      await deleteCategory(id);
      alert('Category deleted successfully.');
      loadCategories();
    } catch (err) { alert('Error: Could not delete category.'); }
  }

  closeModalBtn.addEventListener('click', closeEditModal);
  cancelEditBtn.addEventListener('click', closeEditModal);
  editModal.addEventListener('click', (e) => { if (e.target === editModal) closeEditModal(); });

  loadCategories();
});
