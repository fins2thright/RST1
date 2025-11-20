import React, { useState, useEffect } from 'react';
import './HumanResourcesList.css';

export default function HumanResourcesList({ onViewSkills, onViewWorkHistory }) {
  const [resources, setResources] = useState([]);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', position: '' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('FirstName');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    fetchResources();
  }, []);

  async function fetchResources() {
    try {
      const response = await fetch('http://localhost:4000/human-resources');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setResources(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const url = editId
        ? `http://localhost:4000/human-resources/${editId}`
        : 'http://localhost:4000/human-resources';
      const method = editId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error('Failed to save');
      setForm({ firstName: '', lastName: '', email: '', position: '' });
      setEditId(null);
      await fetchResources();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleEdit(resource) {
    setForm({
      firstName: resource.FirstName,
      lastName: resource.LastName,
      email: resource.Email || '',
      position: resource.Position || '',
    });
    setEditId(resource.Id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(id) {
    if (confirm('Are you sure?')) {
      try {
        const response = await fetch(`http://localhost:4000/human-resources/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete');
        await fetchResources();
      } catch (err) {
        setError(err.message);
      }
    }
  }

  function handleSort(field) {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  }

  function getSortedResources() {
    const sorted = [...resources].sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';

      // Case-insensitive string comparison
      aVal = String(aVal).toLowerCase();
      bVal = String(bVal).toLowerCase();

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }

  function getSortIndicator(field) {
    if (sortField !== field) return ' ⇅';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  }

  return (
    <div className="container">
      <h2>Human Resources</h2>
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="form">
        <h3>{editId ? 'Edit Resource' : 'Add New Resource'}</h3>
        <input
          type="text"
          placeholder="First Name"
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Last Name"
          value={form.lastName}
          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="text"
          placeholder="Position"
          value={form.position}
          onChange={(e) => setForm({ ...form, position: e.target.value })}
        />
        <button type="submit">{editId ? 'Update' : 'Create'}</button>
        {editId && (
          <button
            type="button"
            onClick={() => {
              setEditId(null);
              setForm({ firstName: '', lastName: '', email: '', position: '' });
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <table className="table">
        <thead>
          <tr>
            <th onClick={() => handleSort('FirstName')} style={{ cursor: 'pointer' }}>
              First Name{getSortIndicator('FirstName')}
            </th>
            <th onClick={() => handleSort('LastName')} style={{ cursor: 'pointer' }}>
              Last Name{getSortIndicator('LastName')}
            </th>
            <th>Email</th>
            <th>Position</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {getSortedResources().map((r) => (
            <tr key={r.Id}>
              <td>{r.FirstName}</td>
              <td>{r.LastName}</td>
              <td>{r.Email}</td>
              <td>{r.Position}</td>
              <td>
                <button onClick={() => handleEdit(r)} className="btn-edit">
                  Edit
                </button>
                <button onClick={() => onViewSkills && onViewSkills(r.Id)} className="btn-skills">
                  Skills
                </button>
                <button
                  onClick={() => onViewWorkHistory && onViewWorkHistory(r.Id)}
                  className="btn-history"
                >
                  Work History
                </button>
                <button onClick={() => handleDelete(r.Id)} className="btn-delete">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
