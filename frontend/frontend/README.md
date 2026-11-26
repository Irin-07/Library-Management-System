# Library Management System

## Project Overview
The Library Management System is a web application developed to manage books, members, book issuing, returning, and inventory history.

## Technologies Used

### Frontend
- React.js
- JavaScript
- HTML
- CSS
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

## Features

- Dashboard with library statistics
- Add, view, edit, delete, and search books
- Register and manage members
- Issue and return books
- 14-day borrowing period
- Maximum 3 active books per member
- Inventory stock management
- Inventory transaction history
- Unique ISBN validation
- Stock availability validation

## Project Structure

```text
LibraryManagement/
├── backend/
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── .env
│   └── server.js
│
├── frontend/
│   └── frontend/
│       ├── src/
│       ├── public/
│       └── package.json
│
└── README.md
```

## Installation and Setup

### 1. Clone the project

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/LibraryDB
```

Start the backend:

```bash
npm run dev
```

<<<<<<< HEAD
Backend URL: `http://localhost:5000`
=======
Backend URL: `http://https://library-management-system-32cb.onrender.com`
>>>>>>> 2f3d365 (Initial commit - Library Management System)

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend/frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

## Database

MongoDB is used to store books, members, issue records, and inventory history.

## Developer

Candidate Name: Irin Amal Felshiya A