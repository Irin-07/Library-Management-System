
import { useEffect, useState } from "react";
import axios from "axios";
import "./IssueReturn.css";

const BOOK_API = "http://localhost:5000/api/books";
const MEMBER_API = "http://localhost:5000/api/members";
const ISSUE_API = "http://localhost:5000/api/issues";

function IssueReturn() {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [issues, setIssues] = useState([]);

  const [bookId, setBookId] = useState("");
  const [memberId, setMemberId] = useState("");
  const [message, setMessage] = useState("");

  const loadData = async () => {
    try {
      const [bookRes, memberRes, issueRes] = await Promise.all([
        axios.get(BOOK_API),
        axios.get(MEMBER_API),
        axios.get(ISSUE_API)
      ]);

      setBooks(Array.isArray(bookRes.data) ? bookRes.data : bookRes.data.books || []);
      setMembers(Array.isArray(memberRes.data) ? memberRes.data : memberRes.data.members || []);
      setIssues(issueRes.data.issues || []);
    } catch (error) {
      setMessage("Unable to load data. Check backend connection.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleIssue = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(ISSUE_API, {
        bookId,
        memberId
      });

      setMessage(response.data.message);
      setBookId("");
      setMemberId("");
      loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Book issue failed");
    }
  };

  const handleReturn = async (id) => {
    try {
      const response = await axios.put(`${ISSUE_API}/return/${id}`);

      setMessage(response.data.message);
      loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Book return failed");
    }
  };

  return (
    <div className="issue-page">
      <h1>Issue / Return Management</h1>
      <p>Issue books to members and manage returns.</p>

      {message && (
        <div className="issue-message">
          {message}
          <button onClick={() => setMessage("")}>×</button>
        </div>
      )}

      <div className="issue-form-card">
        <h2>Issue New Book</h2>

        <form onSubmit={handleIssue}>
          <label>Select Book</label>
          <select
            value={bookId}
            onChange={(e) => setBookId(e.target.value)}
            required
          >
            <option value="">Choose a book</option>
            {books.map((book) => (
              <option
                key={book._id}
                value={book._id}
                disabled={book.availableStock <= 0}
              >
                {book.title} - Available: {book.availableStock}
              </option>
            ))}
          </select>

          <label>Select Member</label>
          <select
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            required
          >
            <option value="">Choose a member</option>
            {members
              .filter((member) => member.status === "Active")
              .map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name} - {member.email}
                </option>
              ))}
          </select>

          <button type="submit" className="issue-submit">
            Issue Book
          </button>
        </form>
      </div>

      <div className="issue-list-card">
        <h2>Issue Records</h2>

        <div className="issue-table-wrapper">
          <table className="issue-table">
            <thead>
              <tr>
                <th>Book</th>
                <th>Member</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {issues.length > 0 ? (
                issues.map((issue) => (
                  <tr key={issue._id}>
                    <td>{issue.book?.title || "Book unavailable"}</td>
                    <td>{issue.member?.name || "Member unavailable"}</td>
                    <td>
                      {issue.issueDate
                        ? new Date(issue.issueDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>
                      {issue.dueDate
                        ? new Date(issue.dueDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>{issue.status}</td>
                    <td>
                      {issue.status === "Issued" ? (
                        <button
                          className="return-button"
                          onClick={() => handleReturn(issue._id)}
                        >
                          Return
                        </button>
                      ) : (
                        "Completed"
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="issue-empty">
                    No issue records found
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

export default IssueReturn;
