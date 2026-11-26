
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Books.css";

const API_URL = "http://localhost:5000/api/books";

const emptyForm = {
  title: "",
  author: "",
  isbn: "",
  category: "",
  totalStock: "",
  availableStock: "",
};

function Books() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setBooks(
        Array.isArray(response.data)
          ? response.data
          : response.data.books || []
      );
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Unable to load books. Check backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const categories = [
    "All",
    ...new Set(books.map((book) => book.category).filter(Boolean)),
  ];

  const filteredBooks = useMemo(() => {
    let result = books.filter((book) => {
      const text = `${book.title} ${book.author} ${book.isbn}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesCategory =
        category === "All" || book.category === category;

      return matchesSearch && matchesCategory;
    });

    if (sort === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "stock") {
      result.sort((a, b) => a.availableStock - b.availableStock);
    } else if (sort === "newest") {
      result.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
    }

    return result;
  }, [books, search, category, sort]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "totalStock" && !editingId
        ? { availableStock: value }
        : {}),
    }));
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setMessage("");
  };

  const openEditForm = (book) => {
    setEditingId(book._id);
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      totalStock: book.totalStock,
      availableStock: book.availableStock,
    });
    setShowForm(true);
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const payload = {
      ...form,
      totalStock: Number(form.totalStock),
      availableStock: Number(form.availableStock),
    };

    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, payload);
        setMessage("Book updated successfully!");
      } else {
        await axios.post(API_URL, payload);
        setMessage("Book added successfully!");
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      await fetchBooks();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Unable to save book. Please check."
      );
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this book?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      setMessage("Book deleted successfully!");
      await fetchBooks();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Unable to delete this book."
      );
    }
  };

  return (
    <div className="books-page">
      <div className="books-heading">
        <div>
          <h1>Books Management</h1>
          <p>Add, edit, search and manage library books.</p>
        </div>

        <button className="add-book-btn" onClick={openAddForm}>
          + Add New Book
        </button>
      </div>

      {message && <div className="books-message">{message}</div>}

      {showForm && (
        <div className="book-form-card">
          <h2>{editingId ? "Edit Book" : "Add New Book"}</h2>

          <form onSubmit={handleSubmit}>
            <div className="book-form-grid">
              <input
                name="title"
                placeholder="Book Title"
                value={form.title}
                onChange={handleChange}
                required
              />

              <input
                name="author"
                placeholder="Author"
                value={form.author}
                onChange={handleChange}
                required
              />

              <input
                name="isbn"
                placeholder="ISBN"
                value={form.isbn}
                onChange={handleChange}
                required
                disabled={Boolean(editingId)}
              />

              <input
                name="category"
                placeholder="Category"
                value={form.category}
                onChange={handleChange}
                required
              />

              <input
                name="totalStock"
                type="number"
                min="0"
                placeholder="Total Stock"
                value={form.totalStock}
                onChange={handleChange}
                required
                disabled={Boolean(editingId)}
              />

              <input
                name="availableStock"
                type="number"
                min="0"
                max={form.totalStock || undefined}
                placeholder="Available Stock"
                value={form.availableStock}
                onChange={handleChange}
                required
                disabled={Boolean(editingId)}
              />
            </div>

            <div className="book-form-actions">
              <button type="submit" className="save-book-btn">
                {editingId ? "Update Book" : "Save Book"}
              </button>

              <button
                type="button"
                className="cancel-book-btn"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="books-toolbar">
        <input
          type="text"
          placeholder="Search title, author or ISBN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item === "All" ? "All Categories" : item}
            </option>
          ))}
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="title">Title A-Z</option>
          <option value="stock">Lowest Stock</option>
        </select>
      </div>

      <div className="books-table-card">
        <div className="books-table-heading">
          <h2>All Books</h2>
          <span>{filteredBooks.length} books</span>
        </div>

        {loading ? (
          <p className="books-empty">Loading books...</p>
        ) : filteredBooks.length === 0 ? (
          <p className="books-empty">No books found. Add your first book.</p>
        ) : (
          <div className="table-scroll">
            <table className="books-table">
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Author</th>
                  <th>ISBN</th>
                  <th>Category</th>
                  <th>Total</th>
                  <th>Available</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredBooks.map((book) => (
                  <tr key={book._id}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.isbn}</td>
                    <td>{book.category}</td>
                    <td>{book.totalStock}</td>
                    <td>
                      <span
                        className={
                          book.availableStock > 0
                            ? "stock-available"
                            : "stock-empty"
                        }
                      >
                        {book.availableStock}
                      </span>
                    </td>
                    <td>
                      <div className="book-action-buttons">
                        <button
                          className="edit-book-btn"
                          onClick={() => openEditForm(book)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-book-btn"
                          onClick={() => handleDelete(book._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Books;
