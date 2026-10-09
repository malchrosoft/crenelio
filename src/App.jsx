import React, { useState, useEffect } from 'react';
import UserForm from './components/UserForm.jsx';
import UserList from './components/UserList.jsx';
import { api } from './api.js';

export default function App() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function handleSubmit(payload) {
    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, payload);
      } else {
        await api.createUser(payload);
      }
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteUser(id);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleEdit(user) {
    setEditingUser(user);
  }

  function handleCancel() {
    setEditingUser(null);
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Users CRUD</h1>
      {error && (
        <div style={{ background: '#fee', color: '#c00', padding: 12, borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}
      <UserForm onSubmit={handleSubmit} editingUser={editingUser} onCancel={handleCancel} />
      {loading ? (
        <p>Loading...</p>
      ) : (
        <UserList users={users} onEdit={handleEdit} onDelete={handleDelete} />
      )}
    </div>
  );
}
