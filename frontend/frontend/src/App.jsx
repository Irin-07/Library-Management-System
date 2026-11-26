
import { useState, useEffect } from "react";
import axios from "axios";

import Books from "./pages/Books";
import Members from "./pages/Members";
import IssueReturn from "./pages/IssueReturn";
import Inventory from "./pages/Inventory";
import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  const [dashboard, setDashboard] = useState({
    totalBooks: 0,
    totalMembers: 0,
    booksIssued: 0,
    availableBooks: 0,
  });

  const menuItems = [
    "Dashboard",
    "Books",
    "Members",
    "Issue / Return",
    "Inventory History",
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [bookRes, memberRes, issueRes] = await Promise.all([

          axios.get("http://localhost:5000/api/books"),
          axios.get("http://localhost:5000/api/members"),
          axios.get("http://localhost:5000/api/issues"),
          axios.get("https://library-management-system-32cb.onrender.com/api/books"),
          axios.get("https://library-management-system-32cb.onrender.com/api/members"),
          axios.get("https://library-management-system-32cb.onrender.com/api/issues"),

        ]);

        const books = Array.isArray(bookRes.data)
          ? bookRes.data
          : bookRes.data.books || [];

        const members = Array.isArray(memberRes.data)
          ? memberRes.data
          : memberRes.data.members || [];

        const issues = issueRes.data.issues || [];

        const totalBooks = books.reduce(
          (total, book) => total + Number(book.totalStock || 0),
          0
        );

        const availableBooks = books.reduce(
          (total, book) => total + Number(book.availableStock || 0),
          0
        );

        const booksIssued = issues.filter(
          (issue) => issue.status === "Issued"
        ).length;

        setDashboard({
          totalBooks,
          totalMembers: members.length,
          booksIssued,
          availableBooks,
        });
      } catch (error) {
        console.error("Dashboard Error:", error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>Library Management</h2>

        <nav>
          {menuItems.map((item) => (
            <p
              key={item}
              className={activePage === item ? "active" : ""}
              onClick={() => setActivePage(item)}
            >
              {item}
            </p>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <header className="header">
          <h2>{activePage}</h2>
          <span>Admin</span>
        </header>

        {activePage === "Dashboard" && (
          <>
            <h1>Welcome to Library Management System</h1>
            <p>Manage books, members and library inventory.</p>

            <div className="dashboard-cards">
              <div className="card">
                <h3>Total Books</h3>
                <h2>{dashboard.totalBooks}</h2>
              </div>

              <div className="card">
                <h3>Total Members</h3>
                <h2>{dashboard.totalMembers}</h2>
              </div>

              <div className="card">
                <h3>Books Issued</h3>
                <h2>{dashboard.booksIssued}</h2>
              </div>

              <div className="card">
                <h3>Available Books</h3>
                <h2>{dashboard.availableBooks}</h2>
              </div>
            </div>
          </>
        )}

        {activePage === "Books" && <Books />}
        {activePage === "Members" && <Members />}
        {activePage === "Issue / Return" && <IssueReturn />}
        {activePage === "Inventory History" && <Inventory />}
      </main>
    </div>
  );
}

export default App;
