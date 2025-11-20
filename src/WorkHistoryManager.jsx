import React, { useState, useEffect } from 'react';
import './WorkHistoryManager.css';

export default function WorkHistoryManager({ preSelectedResourceId }) {
  const [resources, setResources] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedResource, setSelectedResource] = useState(preSelectedResourceId || null);
  const [workHistory, setWorkHistory] = useState([]);
  const [form, setForm] = useState({
    companyId: '',
    startDate: '',
    endDate: '',
    isCurrentAssignment: false,
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResources();
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (preSelectedResourceId) {
      handleSelectResource(preSelectedResourceId);
    }
  }, [preSelectedResourceId]);

  async function fetchResources() {
    try {
      const response = await fetch('http://localhost:4000/human-resources');
      if (!response.ok) throw new Error('Failed to fetch resources');
      const data = await response.json();
      setResources(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function fetchCompanies() {
    try {
      const response = await fetch('http://localhost:4000/companies');
      if (!response.ok) throw new Error('Failed to fetch companies');
      const data = await response.json();
      setCompanies(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSelectResource(resourceId) {
    setSelectedResource(resourceId);
    setEditId(null);
    setForm({ companyId: '', startDate: '', endDate: '', isCurrentAssignment: false });

    try {
      const response = await fetch(`http://localhost:4000/work-history/${resourceId}`);
      if (!response.ok) throw new Error('Failed to fetch work history');
      const data = await response.json();
      setWorkHistory(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Validation checks
    if (!selectedResource || !form.companyId || !form.startDate) {
      setError('Please fill in required fields');
      return;
    }

    // If not current assignment, end date is required
    if (!form.isCurrentAssignment && !form.endDate) {
      setError('End date is required unless this is the current assignment');
      return;
    }

    // If current assignment, check if another assignment is already marked as current
    if (form.isCurrentAssignment) {
      const anotherCurrent = workHistory.find((wh) => wh.IsCurrentAssignment && wh.Id !== editId);
      if (anotherCurrent) {
        setError(
          `Cannot have multiple current assignments. ${anotherCurrent.CompanyName} is already marked as current. Remove that assignment or uncheck current assignment.`
        );
        return;
      }
    }

    try {
      const url = editId
        ? `http://localhost:4000/work-history/${selectedResource}/${editId}`
        : `http://localhost:4000/work-history/${selectedResource}`;
      const method = editId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: form.companyId,
          startDate: form.startDate,
          endDate: form.endDate || null,
          isCurrentAssignment: form.isCurrentAssignment,
        }),
      });

      if (!response.ok) throw new Error('Failed to save');
      setForm({ companyId: '', startDate: '', endDate: '', isCurrentAssignment: false });
      setEditId(null);
      await handleSelectResource(selectedResource);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleEdit(entry) {
    // Convert ISO date strings to YYYY-MM-DD format for date input fields
    const formatDateForInput = (dateString) => {
      if (!dateString) return '';
      return dateString.split('T')[0];
    };

    const formatDateForDisplay = (dateString) => {
      if (!dateString) return '—';
      // Extract just the date part (YYYY-MM-DD) from ISO string
      const dateOnly = dateString.split('T')[0];
      // Parse as local date to avoid timezone issues
      const [year, month, day] = dateOnly.split('-');
      return new Date(year, month - 1, day).toLocaleDateString();
    };

    setForm({
      companyId: entry.CompanyId,
      startDate: formatDateForInput(entry.StartDate),
      endDate: formatDateForInput(entry.EndDate),
      isCurrentAssignment: entry.IsCurrentAssignment,
    });
    setEditId(entry.Id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(id) {
    if (confirm('Are you sure?')) {
      try {
        const response = await fetch(
          `http://localhost:4000/work-history/${selectedResource}/${id}`,
          { method: 'DELETE' }
        );
        if (!response.ok) throw new Error('Failed to delete');
        await handleSelectResource(selectedResource);
      } catch (err) {
        setError(err.message);
      }
    }
  }

  const selectedResourceObj = resources.find((r) => r.Id === selectedResource);

  return (
    <div className="container">
      <h2>Work History</h2>
      {error && <div className="error">{error}</div>}

      <div className="resource-selector">
        <label htmlFor="resource-select">Select Resource:</label>
        <select
          id="resource-select"
          value={selectedResource || ''}
          onChange={(e) => handleSelectResource(e.target.value)}
        >
          <option value="">-- Choose a resource --</option>
          {resources.map((r) => (
            <option key={r.Id} value={r.Id}>
              {r.FirstName} {r.LastName}
            </option>
          ))}
        </select>
      </div>

      {selectedResource && (
        <>
          <div className="resource-info">
            <h3>
              {selectedResourceObj?.FirstName} {selectedResourceObj?.LastName}
            </h3>
            <p>
              <strong>Position:</strong> {selectedResourceObj?.Position}
            </p>
            <p>
              <strong>Email:</strong> {selectedResourceObj?.Email}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="form">
            <h4>{editId ? 'Edit Work History Entry' : 'Add Work History Entry'}</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="company-select">Company:</label>
                <select
                  id="company-select"
                  value={form.companyId}
                  onChange={(e) => setForm({ ...form, companyId: e.target.value })}
                  required
                >
                  <option value="">-- Choose a company --</option>
                  {companies.map((c) => (
                    <option key={c.Id} value={c.Id}>
                      {c.CompanyName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="start-date">Start Date:</label>
                <input
                  id="start-date"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="end-date">End Date:</label>
                <input
                  id="end-date"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  disabled={form.isCurrentAssignment}
                />
              </div>
              <div className="form-group checkbox">
                <label htmlFor="current-assignment">
                  <input
                    id="current-assignment"
                    type="checkbox"
                    checked={form.isCurrentAssignment}
                    onChange={(e) =>
                      setForm({ ...form, isCurrentAssignment: e.target.checked, endDate: '' })
                    }
                  />
                  Current Assignment
                </label>
              </div>
              <button type="submit" className="btn-add">
                {editId ? 'Update' : 'Add'}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditId(null);
                    setForm({
                      companyId: '',
                      startDate: '',
                      endDate: '',
                      isCurrentAssignment: false,
                    });
                  }}
                  className="btn-cancel"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="history-section">
            <h4>Work History</h4>
            {workHistory.length === 0 ? (
              <p className="empty-message">No work history entries yet.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Current</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workHistory.map((wh) => {
                    const formatDateForDisplay = (dateString) => {
                      if (!dateString) return '—';
                      const dateOnly = dateString.split('T')[0];
                      const [year, month, day] = dateOnly.split('-');
                      return new Date(year, month - 1, day).toLocaleDateString();
                    };
                    return (
                      <tr key={wh.Id}>
                        <td>{wh.CompanyName}</td>
                        <td>{formatDateForDisplay(wh.StartDate)}</td>
                        <td>{formatDateForDisplay(wh.EndDate)}</td>
                        <td>{wh.IsCurrentAssignment ? '✓' : '—'}</td>
                        <td>
                          <button onClick={() => handleEdit(wh)} className="btn-edit">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(wh.Id)} className="btn-delete">
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
