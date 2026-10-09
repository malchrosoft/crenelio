import React from 'react';

export default function UserList({ users, onEdit, onDelete }) {
  if (!users.length) {
    return <p style={{ color: '#888' }}>No users yet. Add one above.</p>;
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
          <th style={{ padding: 8 }}>ID</th>
          <th style={{ padding: 8 }}>Name</th>
          <th style={{ padding: 8 }}>Email</th>
          <th style={{ padding: 8 }}>Role</th>
          <th style={{ padding: 8 }}>Created</th>
          <th style={{ padding: 8 }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: 8 }}>{user.id}</td>
            <td style={{ padding: 8 }}>{user.name}</td>
            <td style={{ padding: 8 }}>{user.email}</td>
            <td style={{ padding: 8 }}>{user.role}</td>
            <td style={{ padding: 8 }}>{user.created_at}</td>
            <td style={{ padding: 8 }}>
              <button onClick={() => onEdit(user)} style={{ marginRight: 8, padding: '4px 8px' }}>
                Edit
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete ${user.name}?`)) onDelete(user.id);
                }}
                style={{ padding: '4px 8px', color: '#c00' }}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
