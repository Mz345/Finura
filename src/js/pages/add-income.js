import { addIncome, getUserIncomeCategories, requireAuth } from '../api/api.js';
requireAuth();

const form             = document.getElementById('incomeForm');
const amountInput      = document.getElementById('amount');
const descriptionInput = document.getElementById('description');
const categorySelect   = document.getElementById('category');
const dateInput        = document.getElementById('date');
const notesInput       = document.getElementById('notes');
const submitBtn        = document.getElementById('submitBtn');
const amountError      = document.getElementById('amount-error');
const descriptionError = document.getElementById('description-error');
const categoryError    = document.getElementById('category-error');
const dateError        = document.getElementById('date-error');

const today = new Date().toISOString().split('T')[0];
dateInput.setAttribute('max', today);
dateInput.value = today;

async function populateCategories() {
  try {
    const categories = await getUserIncomeCategories();
    categorySelect.innerHTML = '<option value="">Select category</option>';
    if (!categories.length) {
      categorySelect.innerHTML += '<option value="" disabled>No income categories found</option>';
    } else {
      categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat; option.textContent = cat;
        categorySelect.appendChild(option);
      });
    }
  } catch (error) {
    categorySelect.innerHTML = '<option value="" disabled>Error loading categories</option>';
  }
}
populateCategories();

function validateField(field, errorElement) {
  let isValid = true, message = '';
  const value = field.value.trim();
  field.setAttribute('aria-invalid', 'false');
  errorElement.textContent = '';
  errorElement.style.display = 'none';
  field.classList.remove('error');
  if (field.required && value === '') {
    isValid = false;
    message = `${field.labels[0].textContent.replace(' *', '').replace('(Optional)', '').trim()} is required.`;
  } else if (field === amountInput) {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) { isValid = false; message = 'Please enter a valid positive amount.'; }
    else if (num > 9999999.99) { isValid = false; message = 'Amount cannot exceed ₹9,999,999.99.'; }
  } else if (field === descriptionInput) {
    if (value.length < 2) { isValid = false; message = 'Description must be at least 2 characters.'; }
    else if (value.length > 100) { isValid = false; message = 'Description cannot exceed 100 characters.'; }
  } else if (field === dateInput) {
    const sel = new Date(value + 'T00:00:00'), tod = new Date(today + 'T00:00:00');
    const tenYearsAgo = new Date(); tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
    if (isNaN(sel.getTime())) { isValid = false; message = 'Please enter a valid date.'; }
    else if (sel > tod) { isValid = false; message = 'Date cannot be in the future.'; }
    else if (sel < tenYearsAgo) { isValid = false; message = 'Date cannot be more than 10 years ago.'; }
  }
  if (!isValid) { field.setAttribute('aria-invalid', 'true'); errorElement.textContent = message; errorElement.style.display = 'block'; field.classList.add('error'); }
  return isValid;
}

function validateForm() {
  const v = validateField(amountInput, amountError) & validateField(descriptionInput, descriptionError) & validateField(categorySelect, categoryError) & validateField(dateInput, dateError);
  submitBtn.disabled = !v;
  submitBtn.classList.toggle('active', !!v);
  return v;
}

amountInput.addEventListener('input', validateForm);
descriptionInput.addEventListener('input', validateForm);
categorySelect.addEventListener('change', validateForm);
dateInput.addEventListener('change', validateForm);
amountInput.addEventListener('blur', () => {
  if (validateField(amountInput, amountError)) { const v = amountInput.value.trim(); if (v) amountInput.value = parseFloat(v).toFixed(2); }
  validateForm();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validateForm()) { const f = form.querySelector('[aria-invalid="true"]'); if (f) f.focus(); alert('Please correct the errors.'); return; }
  const formData = { amount: parseFloat(amountInput.value), description: descriptionInput.value.trim(), category: categorySelect.value, date: dateInput.value, notes: notesInput.value.trim() };
  submitBtn.disabled = true; submitBtn.textContent = 'Adding...';
  try {
    await addIncome(formData);
    alert(`✅ Income "${formData.description}" added successfully!`);
    form.reset();
    dateInput.value = today;
    populateCategories();
  } catch (error) {
    alert(`❌ Failed to add income: ${error.message}`);
  } finally {
    submitBtn.textContent = 'Add Income';
    validateForm();
  }
});

form.addEventListener('reset', () => {
  setTimeout(() => {
    dateInput.value = today;
    [amountError, descriptionError, categoryError, dateError].forEach(e => { e.textContent = ''; e.style.display = 'none'; });
    [amountInput, descriptionInput, categorySelect, dateInput].forEach(f => { f.setAttribute('aria-invalid', 'false'); f.classList.remove('error'); });
    validateForm();
  }, 0);
});
