Head

# Finura – MongoDB Edition

Firebase has been fully replaced with **MongoDB + Express + JWT**. All frontend features remain identical.

---

## Architecture

```
finura_mongodb/
├── backend/
│   ├── server.js       ← Express app + all REST API routes
│   ├── models.js       ← Mongoose schemas (User, Category, Transaction)
│   ├── .env            ← Environment variables (edit before running)
│   └── package.json
│
├── src/
│   └── js/
│       ├── api/
│       │   └── api.js          ← Replaces firebase-config + auth + firestore
│       ├── components/
│       │   ├── MainNavbar.js   ← Updated: uses JWT instead of Firebase auth
│       │   ├── DonutChart.js   ← Unchanged (Chart.js web component)
│       │   └── LineChart.js    ← Updated: uses window.Chart (CDN)
│       ├── pages/
│       │   ├── login.js
│       │   ├── signup.js
│       │   ├── dashboard.js
│       │   ├── add-expense.js
│       │   ├── add-income.js
│       │   ├── add-category.js
│       │   ├── transaction.js
│       │   ├── budget.js
│       │   ├── report.js
│       │   ├── profile-page.js
│       │   └── manage-categories.js
│       └── main.js             ← Route guard using localStorage token
│
├── *.html                      ← All HTML pages (unchanged)
└── src/css/                    ← All CSS (unchanged)
```

---


## Setup & Run

### Prerequisites
- **Node.js** v18+
- **MongoDB** running locally (or use MongoDB Atlas)

### 1. Install backend dependencies
```bash
cd backend
npm install
```

### 2. Configure environment
Edit `backend/.env`:
```env
MONGO_URI=mongodb://localhost:27017/finura   # or your Atlas URI
JWT_SECRET=your_strong_secret_here
PORT=3000
```

### 3. Start the server
```bash
cd backend
npm start
```

The server serves both the **REST API** and the **static frontend** from `http://localhost:3000`.

---

## API Endpoints

### Auth
| Method | Endpoint            | Description          |
|--------|---------------------|----------------------|
| POST   | `/api/auth/signup`  | Register new user    |
| POST   | `/api/auth/login`   | Login, get JWT token |

### User
| Method | Endpoint            | Description          |
|--------|---------------------|----------------------|
| GET    | `/api/user/profile` | Get profile          |
| PATCH  | `/api/user/profile` | Update name          |
| GET    | `/api/user/stats`   | All-time totals      |

### Categories
| Method | Endpoint                   | Query     | Description           |
|--------|----------------------------|-----------|-----------------------|
| GET    | `/api/categories`          | `?type=`  | All categories        |
| GET    | `/api/categories/names`    | `?type=`  | Category names only   |
| POST   | `/api/categories`          | –         | Add category          |
| PATCH  | `/api/categories/:id`      | –         | Update category       |
| DELETE | `/api/categories/:id`      | –         | Delete category       |

### Transactions
| Method | Endpoint                   | Description           |
|--------|----------------------------|-----------------------|
| GET    | `/api/transactions`        | All transactions      |
| POST   | `/api/transactions`        | Add income or expense |
| PATCH  | `/api/transactions/:id`    | Update transaction    |
| DELETE | `/api/transactions/:id`    | Delete transaction    |

### Dashboard
| Method | Endpoint                                   | Description                  |
|--------|--------------------------------------------|------------------------------|
| GET    | `/api/dashboard/summary`                   | Monthly totals               |
| GET    | `/api/dashboard/expenses-by-category`      | This month's expense map     |
| GET    | `/api/dashboard/expenses-trend`            | Last 6 months trend          |
| GET    | `/api/dashboard/recent-transactions`       | Latest 8 transactions        |

### Budget & Reports
| Method | Endpoint                         | Description          |
|--------|----------------------------------|----------------------|
| GET    | `/api/budget/overview`           | Budget status        |
| GET    | `/api/reports?year=&month=`      | Monthly report data  |

---

## Charts
Charts use **Chart.js via CDN** (loaded in HTML). No bundler needed — the project works as plain static files served by the Express backend.

HEAD

# Finura
Finura is a personal finance management web application that helps users track income, expenses, and balance through an interactive dashboard. It uses charts and transaction history for financial analysis and is built using HTML, CSS, JavaScript, Chart.js, and MongoDB for efficient data management.

e3bddbb (Initial commit)
