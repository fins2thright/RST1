import React, { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

export default function App() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', position: '' })
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchList()
  }, [])

  async function fetchList() {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/human-resources`)
      const data = await res.json()
      setItems(data)
    } catch (err) {
      console.error(err)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    try {
      let res
      if (editingId) {
        res = await fetch(`${API_BASE}/human-resources/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        })
      } else {
        res = await fetch(`${API_BASE}/human-resources`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        })
      }
      if (res.ok) {
        setForm({ firstName: '', lastName: '', email: '', position: '' })
        setEditingId(null)
        fetchList()
      } else {
        const err = await res.json()
        alert(JSON.stringify(err))
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this resource?')) return
    try {
      const res = await fetch(`${API_BASE}/human-resources/${id}`, { method: 'DELETE' })
      if (res.ok) fetchList()
      else alert('Failed to delete')
    } catch (err) {
      console.error(err)
    }
  }

  async function handleEdit(id) {
    try {
      const res = await fetch(`${API_BASE}/human-resources/${id}`)
      if (!res.ok) return alert('Failed to fetch resource')
      const data = await res.json()
      setForm({ firstName: data.FirstName || '', lastName: data.LastName || '', email: data.Email || '', position: data.Position || '' })
      setEditingId(id)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error(err)
    }
  }

  function handleCancelEdit() {
    setEditingId(null)
    setForm({ firstName: '', lastName: '', email: '', position: '' })
  }

  return (
    <div style={{ padding: 20, fontFamily: 'Segoe UI, Roboto, sans-serif' }}>
      <h1>Human Resources</h1>
      <section style={{ marginBottom: 20 }}>
        <h2>Create</h2>
        <form onSubmit={handleCreate} style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
          <input placeholder="First name" value={form.firstName} required onChange={e => setForm({ ...form, firstName: e.target.value })} />
          <input placeholder="Last name" value={form.lastName} required onChange={e => setForm({ ...form, lastName: e.target.value })} />
          <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Position" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} />
          <div>
            <button type="submit">{editingId ? 'Update' : 'Create'}</button>
            {editingId && <button type="button" style={{ marginLeft: 8 }} onClick={handleCancelEdit}>Cancel</button>}
          </div>
        </form>
      </section>

      <section>
        <h2>List</h2>
        {loading ? (
          <div>Loading…</div>
        ) : (
          <table border="0" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Id</th>
                <th>Name</th>
                <th>Email</th>
                <th>Position</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map(it => (
                <tr key={it.Id}>
                  <td style={{ maxWidth: 220, wordBreak: 'break-all' }}>{it.Id}</td>
                  <td>{it.FirstName} {it.LastName}</td>
                  <td>{it.Email}</td>
                  <td>{it.Position}</td>
                  <td>
                    <button onClick={() => handleEdit(it.Id)}>Edit</button>
                    <button style={{ marginLeft: 8 }} onClick={() => handleDelete(it.Id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
