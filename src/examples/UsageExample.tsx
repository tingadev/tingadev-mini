/**
 * Data Provider Usage Examples
 * 
 * This file demonstrates various ways to use the data provider in your components
 */

import React, { useEffect, useState } from 'react';
import { dataProvider } from '../services/api';

// Example 1: Basic List Fetching
export function UsersList() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const result = await dataProvider.getList({
          resource: 'users',
          pagination: { page: 1, pageSize: 10 },
          sort: [{ field: 'name', order: 'asc' }],
        });
        setUsers(result.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Users List</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

// Example 2: Fetching Single Item
export function UserDetail({ userId }: { userId: string }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await dataProvider.getOne({
          resource: 'users',
          id: userId,
        });
        setUser(result.data);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>Email: {user.email}</p>
    </div>
  );
}

// Example 3: Creating New Item
export function CreateUserForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      const result = await dataProvider.create({
        resource: 'users',
        variables: {
          name,
          email,
        },
      });
      
      console.log('User created:', result.data);
      alert('User created successfully!');
      
      // Reset form
      setName('');
      setEmail('');
    } catch (err: any) {
      alert(`Failed to create user: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create New User</h2>
      <div>
        <label>
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
      </div>
      <button type="submit" disabled={submitting}>
        {submitting ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
}

// Example 4: Updating Item
export function UpdateUser({ userId }: { userId: string }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Fetch current user data
    const fetchUser = async () => {
      try {
        const result = await dataProvider.getOne({
          resource: 'users',
          id: userId,
        });
        setName(result.data.name);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      await dataProvider.update({
        resource: 'users',
        id: userId,
        variables: { name },
      });
      
      alert('User updated successfully!');
    } catch (err: any) {
      alert(`Failed to update user: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleUpdate}>
      <h2>Update User</h2>
      <div>
        <label>
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
      </div>
      <button type="submit" disabled={submitting}>
        {submitting ? 'Updating...' : 'Update User'}
      </button>
    </form>
  );
}

// Example 5: Deleting Item
export function DeleteUserButton({ userId }: { userId: string }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      setDeleting(true);
      await dataProvider.deleteOne({
        resource: 'users',
        id: userId,
      });
      
      alert('User deleted successfully!');
    } catch (err: any) {
      alert(`Failed to delete user: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <button onClick={handleDelete} disabled={deleting}>
      {deleting ? 'Deleting...' : 'Delete User'}
    </button>
  );
}

// Example 6: List with Filters and Pagination
export function FilteredUsersList() {
  const [users, setUsers] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('active');
  const pageSize = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const result = await dataProvider.getList({
          resource: 'users',
          pagination: { page, pageSize },
          sort: [{ field: 'createdAt', order: 'desc' }],
          filters: [
            { field: 'status', operator: 'eq', value: status },
          ],
        });
        
        setUsers(result.data);
        setTotal(result.total);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };

    fetchUsers();
  }, [page, status]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <h2>Filtered Users</h2>
      
      {/* Filter */}
      <div>
        <label>
          Status:
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </label>
      </div>

      {/* List */}
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} - {user.status}
          </li>
        ))}
      </ul>

      {/* Pagination */}
      <div>
        <button 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span> Page {page} of {totalPages} </span>
        <button 
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

// Example 7: Custom API Call
export function CustomAPIExample() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Custom GET request
        const result = await dataProvider.custom({
          url: 'analytics/stats',
          method: 'GET',
          query: {
            startDate: '2024-01-01',
            endDate: '2024-12-31',
          },
        });
        
        setStats(result.data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };

    fetchStats();
  }, []);

  const handleBulkImport = async () => {
    try {
      // Custom POST request
      const result = await dataProvider.custom({
        url: 'users/bulk-import',
        method: 'POST',
        payload: {
          users: [
            { name: 'John', email: 'john@example.com' },
            { name: 'Jane', email: 'jane@example.com' },
          ],
        },
        headers: {
          'X-Import-Mode': 'async',
        },
      });
      
      console.log('Import result:', result.data);
      alert('Bulk import started!');
    } catch (err: any) {
      alert(`Import failed: ${err.message}`);
    }
  };

  return (
    <div>
      <h2>Custom API Calls</h2>
      {stats && (
        <div>
          <h3>Statistics</h3>
          <pre>{JSON.stringify(stats, null, 2)}</pre>
        </div>
      )}
      <button onClick={handleBulkImport}>
        Start Bulk Import
      </button>
    </div>
  );
}

// Example 8: Using with Jotai (State Management)
import { atom, useAtom } from 'jotai';

// Define atoms
const usersAtom = atom<any[]>([]);
const loadingAtom = atom(false);

export function UsersWithJotai() {
  const [users, setUsers] = useAtom(usersAtom);
  const [loading, setLoading] = useAtom(loadingAtom);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const result = await dataProvider.getList({
        resource: 'users',
        pagination: { page: 1, pageSize: 20 },
      });
      setUsers(result.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Users (with Jotai)</h2>
      <button onClick={fetchUsers}>Refresh</button>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
