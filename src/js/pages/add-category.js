import { addCategory, requireAuth } from '../api/api.js';
requireAuth();

const categoryForm          = document.getElementById('categoryForm');
const catNameInput          = document.getElementById('catName');
const catTypeSelect         = document.getElementById('catType');
const budgetLimitContainer  = document.getElementById('budgetLimitContainer');
const budgetLimitInput      = document.getElementById('budgetLimit');
const catNameError          = document.getElementById('catNameError');
const catTypeError          = document.getElementById('catTypeError');
const budgetLimitError      = document.getElementById('budgetLimitError');

function toggleBudgetLimit() {
  const isExpense = catTypeSelect.value === 'expense';
  budgetLimitContainer.style.display = isExpense ? 'block' : 'none';
  budgetLimitInput.required = isExpense;
  if (!isExpense) { budgetLimitInput.value = ''; budgetLimitInput.classList.remove('invalid', 'valid'); budgetLimitError.classList.remove('show'); }
}

function validateField(field) {
  const errorElement = document.getElementById(field.id + 'Error');
  let isValid = true, message = '';
  field.classList.remove('valid', 'invalid');
  field.setAttribute('aria-invalid', 'false');
  if (errorElement) errorElement.classList.remove('show');
  if (field.required && !field.value.trim()) { isValid = false; message = field.dataset.requiredError || `${field.labels[0].textContent} is required.`; }
  else if (field === catNameInput) {
    if (!/^[a-zA-Z0-9\s\-_&]{2,}$/.test(field.value.trim())) { isValid = false; catNameError.textContent = 'Name must be at least 2 characters (letters, numbers, spaces, -, _, &).'; }
    else { catNameError.textContent = 'Category name is required.'; }
  } else if (field === budgetLimitInput && catTypeSelect.value === 'expense') {
    if (field.value === '' || parseFloat(field.value) < 0) { isValid = false; budgetLimitError.textContent = 'Budget must be 0 or greater.'; }
    else { budgetLimitError.textContent = 'Budget limit is required for expense categories.'; }
  }
  if (!isValid) { field.classList.add('invalid'); field.setAttribute('aria-invalid', 'true'); if (errorElement) errorElement.classList.add('show'); }
  else if (field.required || field.value.trim()) { field.classList.add('valid'); }
  return isValid;
}

function validateForm() {
  let valid = validateField(catNameInput) && validateField(catTypeSelect);
  if (catTypeSelect.value === 'expense') valid = validateField(budgetLimitInput) && valid;
  return valid;
}

function clearValidationStates() {
  document.querySelectorAll('input, select').forEach(f => { f.classList.remove('valid', 'invalid'); f.setAttribute('aria-invalid', 'false'); });
  document.querySelectorAll('.error-message').forEach(e => e.classList.remove('show'));
  catNameError.textContent = 'Category name is required.';
  catTypeError.textContent = 'Please select a category type.';
  budgetLimitError.textContent = 'Budget limit is required for expense categories.';
}

catTypeSelect.addEventListener('change', toggleBudgetLimit);
catNameInput.addEventListener('input', () => validateField(catNameInput));
catTypeSelect.addEventListener('change', () => validateField(catTypeSelect));
budgetLimitInput.addEventListener('input', () => validateField(budgetLimitInput));

categoryForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  if (!validateForm()) { const f = document.querySelector('.invalid'); if (f) f.focus(); alert('Please correct the errors.'); return; }
  const categoryData = { name: catNameInput.value.trim(), type: catTypeSelect.value };
  if (categoryData.type === 'expense') categoryData.budget = parseFloat(budgetLimitInput.value);
  try {
    await addCategory(categoryData);
    alert(`✅ Category "${categoryData.name}" Added Successfully!`);
    this.reset(); toggleBudgetLimit(); clearValidationStates(); catNameInput.focus();
  } catch (error) {
    alert(`❌ Failed to add category: ${error.message}`);
  }
});

categoryForm.addEventListener('reset', function() { setTimeout(() => { toggleBudgetLimit(); clearValidationStates(); }, 10); });

document.addEventListener('DOMContentLoaded', () => { toggleBudgetLimit(); clearValidationStates(); catNameInput.focus(); });
