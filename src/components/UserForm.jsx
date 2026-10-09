import React, { useState, useEffect } from 'react';

const emptyForm = { name: '', email: '', role: 'member' };

export default function UserForm({ onSubmit, editingUser, onCancel }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (editingUser) {
      setForm({ name: editingUser.name, email: editingUser.email, role: editingUser.role });
    } else {
      setForm(emptyForm);
    }
  }, [editingUser]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
    setForm(emptyForm);
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <h2>{editingUser ? 'Edit User' : 'Add User'}</h2>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
          style={{ flex: 1, minWidth: 150, padding: 8 }}
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          style={{ flex: 1, minWidth: 150, padding: 8 }}
        />
        <select name="role" value={form.role} onChange={handleChange} style={{ padding: 8 }}>
          <option value="member">Member</option>
          <option value="admin">Admin</option>
          <option value="guest">Guest</option>
        </select>
        <button type="submit" style={{ padding: '8px 16px' }}>
          {editingUser ? 'Update' : 'Add'}
        </button>
        {editingUser && (
          <button type="button" onClick={onCancel} style={{ padding: '8px 16px' }}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
