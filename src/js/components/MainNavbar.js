

import { logoutUser, isLoggedIn } from '../api/api.js';

class MainNavbar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                /* --- General Styles --- */
                :host {
                    display: block;
                    width: 100%;
                    background-color: #FFFFFF;
                    border-bottom: 1px solid #E5E7EB;
                    font-family: 'Inter', sans-serif;
                }
                .navbar-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 16px 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

               /* --- Logo --- */
                        .logo-link {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        text-decoration: none;
                        color: #111827;
                        }

                        .logo-icon {
                        background-color: #000000; /* solid black like footer */
                        border-radius: 8px;
                        width: 40px;
                        height: 40px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        }

                        /* SVG color fix */
                        .logo-icon svg {
                        width: 22px;
                        height: 22px;
                        stroke: #ffffff; /* force white icon color */
                        }
                .logo-text {
                    font-size: 24px;
                    font-weight: 600;
                }

                /* --- Navigation Links --- */
                #nav-links {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                }
                .nav-link {
                    text-decoration: none;
                    color: #4B5563;
                    font-weight: 500;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    border-radius: 6px;
                    transition: background-color 0.2s, color 0.2s;
                }
                .nav-link:hover {
                    background-color: #F3F4F6;
                    color: #111827;
                }
                .nav-link.active {
                    background-color: #111827;
                    color: #FFFFFF;
                }
                .nav-link i {
                    font-size: 16px;
                }
                
                /* --- Logout Button --- */
                #logout-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #EF4444; /* Red color for logout */
                }
                 #logout-btn:hover {
                    background-color: #FEE2E2;
                }

                /* --- Mobile Menu Toggle --- */
                #menu-toggle {
                    display: none; /* Hidden on desktop */
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                }

                /* --- Responsive Styles --- */
                @media (max-width: 992px) {
                    #menu-toggle {
                        display: block;
                    }
                    #nav-links {
                        display: none; /* Hide links by default on mobile */
                        position: absolute;
                        top: 73px; /* Height of the navbar */
                        left: 0;
                        right: 0;
                        background-color: #FFFFFF;
                        flex-direction: column;
                        align-items: stretch;
                        padding: 16px;
                        gap: 8px;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        border-top: 1px solid #E5E7EB;
                    }
                    #nav-links.mobile-nav-open {
                        display: flex; /* Show when toggled */
                    }
                    .nav-link {
                        justify-content: center;
                        padding: 12px;
                    }
                }
            </style>

            <div class="navbar-container">
                <a href="/" class="logo-link">
                    <div class="logo-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chart-column w-5 h-5 text-primary-foreground"><path d="M3 3v16a2 2 0 0 0 2 2h16"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg></div>
                    <span class="logo-text">Finura</span>
                </a>
                <nav id="nav-links"></nav>
                <button id="menu-toggle" aria-label="Toggle navigation menu">
                    <i class="fa-solid fa-bars"></i>
                </button>
            </div>
        `;
    }

    setupEventListeners() {
        const navLinksContainer = this.shadowRoot.querySelector('#nav-links');
        const menuToggle = this.shadowRoot.querySelector('#menu-toggle');

        // Mobile menu toggle
        menuToggle.addEventListener('click', () => {
            navLinksContainer.classList.toggle('mobile-nav-open');
        });

        // Check login state via JWT token
        if (isLoggedIn()) {
            this.renderLoggedInLinks(navLinksContainer);
        } else {
            this.renderLoggedOutLinks(navLinksContainer);
        }
    }

    renderLoggedInLinks(container) {
        const currentPage = window.location.pathname;

        container.innerHTML = `
            <a href="/dashboard" class="nav-link ${currentPage.includes('dashboard') ? 'active' : ''}"><i class="fa-solid fa-table-columns"></i> Dashboard</a>
            <a href="/transaction" class="nav-link ${currentPage.includes('transaction') ? 'active' : ''}"><i class="fa-solid fa-exchange-alt"></i> Transactions</a>
            <a href="/budget" class="nav-link ${currentPage.includes('budget') ? 'active' : ''}"><i class="fa-solid fa-coins"></i> Budget</a>
            <a href="/reports" class="nav-link ${currentPage.includes('reports') ? 'active' : ''}"><i class="fa-solid fa-chart-pie"></i> Reports</a>
            <a href="/profile" class="nav-link ${currentPage.includes('profile') ? 'active' : ''}"><i class="fa-solid fa-user"></i> Profile</a>
            <button id="logout-btn" class="nav-link"><i class="fa-solid fa-sign-out-alt"></i> Logout</button>
        `;

        // Attach logout event listener AFTER the button is in the DOM
        this.shadowRoot.querySelector('#logout-btn').addEventListener('click', () => {
            logoutUser();
        });
    }

    renderLoggedOutLinks(container) {
        container.innerHTML = `
            <a href="/login.html" class="nav-link">Log In</a>
            <a href="/signup.html" class="nav-link active">Sign Up</a>
        `;
    }
}

customElements.define('main-navbar', MainNavbar);