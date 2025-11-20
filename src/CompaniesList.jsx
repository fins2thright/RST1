import React, { useState, useEffect } from 'react';
import './CompaniesList.css';

export default function CompaniesList() {
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState({ companyName: '', description: '' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  async function fetchCompanies() {
    try {
      const response = await fetch('http://localhost:4000/companies');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setCompanies(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const url = editId
        ? `http://localhost:4000/companies/${editId}`
        : 'http://localhost:4000/companies';
      const method = editId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error('Failed to save');
      setForm({ companyName: '', description: '' });
      setEditId(null);
      await fetchCompanies();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleEdit(company) {
    setForm({
      companyName: company.CompanyName,
      description: company.Description || '',
    });
    setEditId(company.Id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(id) {
    if (confirm('Are you sure?')) {
      try {
        const response = await fetch(`http://localhost:4000/companies/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete');
        await fetchCompanies();
      } catch (err) {
        setError(err.message);
      }
    }
  }

  return (
    <div className="container">
      <h2>Companies</h2>
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="form">
        <h3>{editId ? 'Edit Company' : 'Add New Company'}</h3>
        <input
          type="text"
          placeholder="Company Name"
          value={form.companyName}
          onChange={(e) => setForm({ ...form, companyName: e.target.value })}
          required
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows="3"
        />
        <button type="submit">{editId ? 'Update' : 'Create'}</button>
        {editId && (
          <button
            type="button"
            onClick={() => {
              setEditId(null);
              setForm({ companyName: '', description: '' });
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <table className="table">
        <thead>
          <tr>
            <th>Company Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((c) => (
            <tr key={c.Id}>
              <td>{c.CompanyName}</td>
              <td>{c.Description}</td>
              <td>
                <button onClick={() => handleEdit(c)} className="btn-edit">
                  Edit
                </button>
                <button onClick={() => handleDelete(c.Id)} className="btn-delete">
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
