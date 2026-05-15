import { isLoggedIn } from './api/api.js';
import './components/MainFooter.js';

document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname;
  const publicPages = ['/', '/index', '/login', '/signup'];
  const privatePages = ['/dashboard', '/transaction', '/income', '/expense', '/budget', '/reports', '/profile', '/category', '/managecategory'];

  if (isLoggedIn() && publicPages.includes(currentPage)) {
    window.location.replace('/dashboard');
  } else if (!isLoggedIn() && privatePages.includes(currentPage)) {
    window.location.replace('/login');
  }
});
