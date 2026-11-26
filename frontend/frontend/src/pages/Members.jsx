
import { useEffect, useState } from "react";
import axios from "axios";
import "./Members.css";


const API = "http://localhost:5000/api/members";

function Members() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    status: "Active"
  });

  const fetchMembers = async () => {
    try {
      const response = await axios.get(API);
      setMembers(
        Array.isArray(response.data)
          ? response.data
          : response.data.members || []
      );
    } catch (error) {
      setMessage("Unable to load members");
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await axios.put(`${API}/${editingId}`, form);
        setMessage("Member updated successfully");
      } else {
        await axios.post(API, form);
        setMessage("Member added successfully");
      }

      setForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        status: "Active"
      });

      setEditingId(null);
      fetchMembers();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Something went wrong"
      );
    }
  };

  const handleEdit = (member) => {
    setEditingId(member._id);

    setForm({
      name: member.name,
      email: member.email,
      phone: member.phone,
      address: member.address,
      status: member.status
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this member?")) {
      return;
    }

    try {
      await axios.delete(`${API}/${id}`);
      setMessage("Member deleted successfully");
      fetchMembers();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Unable to delete member"
      );
    }
  };

  const filteredMembers = members.filter((member) =>
    `${member.name} ${member.email} ${member.phone}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="members-page">
      <div className="members-header">
        <div>
          <h1>Members Management</h1>
          <p>Manage your library members</p>
        </div>

        <div className="member-count">
          Total Members: {members.length}
        </div>
      </div>

      {message && (
        <div className="member-message">
          {message}
          <button onClick={() => setMessage("")}>×</button>
        </div>
      )}

      <div className="member-form-card">
        <h2>{editingId ? "Edit Member" : "Add New Member"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="member-form-grid">
            <input
              name="name"
              placeholder="Member Name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <input
              name="email"
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
            />

            <input
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              required
            />

            <input
              name="address"
              placeholder="Address"
              value={form.address}
              onChange={handleChange}
              required
            />

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="member-form-actions">
            <button type="submit" className="member-submit">
              {editingId ? "Update Member" : "Add Member"}
            </button>

            {editingId && (
              <button
                type="button"
                className="member-cancel"
                onClick={() => {
                  setEditingId(null);
                  setForm({
                    name: "",
                    email: "",
                    phone: "",
                    address: "",
                    status: "Active"
                  });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="member-list-card">
        <div className="member-list-header">
          <h2>All Members</h2>

          <input
            className="member-search"
            placeholder="Search name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="member-table-wrapper">
          <table className="member-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <tr key={member._id}>
                    <td>{member.name}</td>
                    <td>{member.email}</td>
                    <td>{member.phone}</td>
                    <td>{member.address}</td>
                    <td>
                      <span
                        className={`member-status ${
                          member.status === "Active"
                            ? "active"
                            : "inactive"
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td>
                      <div className="member-actions">
                        <button
                          className="member-edit"
                          onClick={() => handleEdit(member)}
                        >
                          Edit
                        </button>

                        <button
                          className="member-delete"
                          onClick={() => handleDelete(member._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="member-empty">
                    No members found
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

export default Members;
