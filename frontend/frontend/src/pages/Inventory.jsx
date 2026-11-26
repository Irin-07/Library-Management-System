
import { useEffect, useState } from "react";
import axios from "axios";
import "./Inventory.css";
const API_URL = import.meta.env.VITE_API_URL;

const API = `${API_URL}/api/inventory`;


function Inventory() {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [message, setMessage] = useState("");

  const fetchHistory = async () => {
    try {
      const response = await axios.get(API);

      setHistory(
        Array.isArray(response.data)
          ? response.data
          : response.data.history || response.data.inventory || []
      );
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Unable to load inventory history"
      );
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = history.filter((item) => {
    const bookName = item.book?.title || "";

    const matchesSearch = bookName
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesType =
      typeFilter === "All" || item.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const totalEntries = history.length;
  const issueCount = history.filter(
    (item) => item.type === "ISSUE"
  ).length;
  const returnCount = history.filter(
    (item) => item.type === "RETURN"
  ).length;
  const addCount = history.filter(
    (item) => item.type === "ADD"
  ).length;

  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <div>
          <h1>Inventory History</h1>
          <p>Track all library stock movements</p>
        </div>

        <button onClick={fetchHistory} className="refresh-button">
          Refresh
        </button>
      </div>

      {message && (
        <div className="inventory-message">
          {message}
          <button onClick={() => setMessage("")}>×</button>
        </div>
      )}

      <div className="inventory-cards">
        <div className="inventory-card">
          <h3>Total Transactions</h3>
          <h2>{totalEntries}</h2>
        </div>

        <div className="inventory-card">
          <h3>Books Added</h3>
          <h2>{addCount}</h2>
        </div>

        <div className="inventory-card">
          <h3>Books Issued</h3>
          <h2>{issueCount}</h2>
        </div>

        <div className="inventory-card">
          <h3>Books Returned</h3>
          <h2>{returnCount}</h2>
        </div>
      </div>

      <div className="inventory-list-card">
        <div className="inventory-filters">
          <h2>Stock Movement Records</h2>

          <input
            type="text"
            placeholder="Search book title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All Transactions</option>
            <option value="ADD">ADD</option>
            <option value="REDUCE">REDUCE</option>
            <option value="ISSUE">ISSUE</option>
            <option value="RETURN">RETURN</option>
          </select>
        </div>

        <div className="inventory-table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Book</th>
                <th>Action</th>
                <th>Quantity</th>
                <th>Previous Stock</th>
                <th>New Stock</th>
                <th>Remarks</th>
                <th>Date & Time</th>
              </tr>
            </thead>

            <tbody>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item) => (
                  <tr key={item._id}>
                    <td>{item.book?.title || "Book unavailable"}</td>
                    <td>
                      <span className={`inventory-type ${item.type.toLowerCase()}`}>
                        {item.type}
                      </span>
                    </td>
                    <td>{item.quantity}</td>
                    <td>{item.previousStock}</td>
                    <td>{item.newStock}</td>
                    <td>{item.remarks || "-"}</td>
                    <td>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="inventory-empty">
                    No inventory records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Inventory;
