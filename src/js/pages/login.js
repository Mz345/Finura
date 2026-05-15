import { signInWithEmail, redirectIfLoggedIn } from '../api/api.js';

redirectIfLoggedIn();

const loginForm      = document.getElementById('login-form');
const togglePassword = document.getElementById('toggle-password');
const eyeIcon        = document.getElementById('eye-icon');
const eyeOffIcon     = document.getElementById('eye-off-icon');
const passwordInput  = document.getElementById('password');

if (togglePassword && passwordInput && eyeIcon && eyeOffIcon) {
  eyeOffIcon.classList.add('hidden');
  togglePassword.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    eyeIcon.classList.toggle('hidden', !isPassword);
    eyeOffIcon.classList.toggle('hidden', isPassword);
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email    = loginForm.email.value.trim();
    const password = loginForm.password.value;
    if (!email || !password) { alert('Please fill in both email and password fields.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert('Please enter a valid email address.'); return; }
    try {
      await signInWithEmail(email, password);
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Login Error:', error.message);
      alert('Failed to log in. ' + error.message);
    }
  });
}
