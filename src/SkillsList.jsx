import React, { useState, useEffect } from 'react';
import './SkillsList.css';

export default function SkillsList() {
  const [skills, setSkills] = useState([]);
  const [form, setForm] = useState({ skillName: '', description: '' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  async function fetchSkills() {
    try {
      const response = await fetch('http://localhost:4000/skills');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setSkills(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const url = editId
        ? `http://localhost:4000/skills/${editId}`
        : 'http://localhost:4000/skills';
      const method = editId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error('Failed to save');
      setForm({ skillName: '', description: '' });
      setEditId(null);
      await fetchSkills();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleEdit(skill) {
    setForm({
      skillName: skill.SkillName,
      description: skill.Description || '',
    });
    setEditId(skill.Id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(id) {
    if (confirm('Are you sure?')) {
      try {
        const response = await fetch(`http://localhost:4000/skills/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete');
        await fetchSkills();
      } catch (err) {
        setError(err.message);
      }
    }
  }

  return (
    <div className="container">
      <h2>Skills</h2>
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="form">
        <h3>{editId ? 'Edit Skill' : 'Add New Skill'}</h3>
        <input
          type="text"
          placeholder="Skill Name"
          value={form.skillName}
          onChange={(e) => setForm({ ...form, skillName: e.target.value })}
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
              setForm({ skillName: '', description: '' });
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <table className="table">
        <thead>
          <tr>
            <th>Skill Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {skills.map((s) => (
            <tr key={s.Id}>
              <td>{s.SkillName}</td>
              <td>{s.Description}</td>
              <td>
                <button onClick={() => handleEdit(s)} className="btn-edit">
                  Edit
                </button>
                <button onClick={() => handleDelete(s.Id)} className="btn-delete">
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
