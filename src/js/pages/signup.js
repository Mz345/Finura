import { signUpWithEmail, redirectIfLoggedIn } from '../api/api.js';

redirectIfLoggedIn();

document.addEventListener('DOMContentLoaded', () => {
  const multiStepForm      = document.getElementById('multiStepForm');
  const formSteps          = Array.from(multiStepForm.querySelectorAll('.form-step'));
  const nextButtons        = multiStepForm.querySelectorAll('.next-btn');
  const backButtons        = multiStepForm.querySelectorAll('.back-btn');
  const progressFill       = document.getElementById('progress-fill');
  const stepCounter        = document.getElementById('step-counter');
  const stepTitleText      = document.getElementById('step-title-text');
  const firstNameInput     = document.getElementById('firstName');
  const lastNameInput      = document.getElementById('lastName');
  const emailInput         = document.getElementById('email');
  const passwordInput      = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  let currentStep = 0;
  const stepTitles = ["Personal Information", "Account Security", "Confirmation"];

  const validateStep = (stepIndex) => {
    const errorDiv = formSteps[stepIndex].querySelector('.error-message');
    errorDiv.textContent = '';
    if (stepIndex === 0) {
      const nameRegex = /^[a-zA-Z\s]{2,}$/;
      if (!nameRegex.test(firstNameInput.value.trim()) || !nameRegex.test(lastNameInput.value.trim())) {
        errorDiv.textContent = 'Please enter a valid first and last name.';
        return false;
      }
    }
    if (stepIndex === 1) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
      if (!emailRegex.test(emailInput.value.trim())) { errorDiv.textContent = 'Please enter a valid email address.'; return false; }
      if (!passwordRegex.test(passwordInput.value)) { errorDiv.textContent = 'Password must be 8+ characters with uppercase, lowercase, number, and special character.'; return false; }
      if (passwordInput.value !== confirmPasswordInput.value) { errorDiv.textContent = 'Passwords do not match.'; return false; }
    }
    return true;
  };

  const updateFormSteps = () => {
    formSteps.forEach((step, index) => step.classList.toggle('active', index === currentStep));
    progressFill.style.width = `${(currentStep / (formSteps.length - 1)) * 100}%`;
    stepCounter.textContent  = `Step ${currentStep + 1} of ${formSteps.length}`;
    stepTitleText.textContent = stepTitles[currentStep];
  };

  const populateConfirmation = () => {
    document.getElementById('confirm-firstName').textContent = firstNameInput.value.trim();
    document.getElementById('confirm-lastName').textContent  = lastNameInput.value.trim();
    document.getElementById('confirm-email').textContent     = emailInput.value.trim();
  };

  nextButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (validateStep(currentStep) && currentStep < formSteps.length - 1) {
        currentStep++;
        if (currentStep === 2) populateConfirmation();
        updateFormSteps();
      }
    });
  });

  backButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (currentStep > 0) { currentStep--; updateFormSteps(); }
    });
  });

  multiStepForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name     = `${firstNameInput.value.trim()} ${lastNameInput.value.trim()}`;
    const email    = emailInput.value.trim();
    const password = passwordInput.value;
    const submitButton = e.submitter;
    submitButton.disabled = true;
    submitButton.textContent = 'Creating Account...';
    try {
      await signUpWithEmail(name, email, password);
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('SignUp Error:', error.message);
      const errorDiv = formSteps[currentStep].querySelector('.error-message');
      errorDiv.textContent = 'Failed to create account. ' + error.message;
      submitButton.disabled = false;
      submitButton.textContent = 'Confirm & Create Account';
    }
  });

  updateFormSteps();
});
