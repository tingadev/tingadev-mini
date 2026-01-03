/**
 * Example components demonstrating Data Provider usage
 */

import { useEffect, useState } from 'react';
import { atom, useAtom } from 'jotai';
import { dataProvider } from '@/services/api';

// Example 1: Basic getList usage
interface User {
  id: number;
  name: string;
  email: string;
}

export function UsersListExample() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const result = await dataProvider.getList<User>({
          resource: 'users',
          pagination: { page: 1, pageSize: 10 },
          sort: [{ field: 'name', order: 'asc' }],
        });
        setUsers(result.data);
      } catch (err: any) {
        setError(err.message);
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
      <h2>Users</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Example 2: Create, Update, Delete operations
export function UserFormExample() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const handleCreate = async () => {
    try {
      const result = await dataProvider.create<User>({
        resource: 'users',
        variables: { name, email },
      });
      setUserId(result.data.id);
      setMessage(`User created with ID: ${result.data.id}`);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleUpdate = async () => {
    if (!userId) return;
    
    try {
      await dataProvider.update<User>({
        resource: 'users',
        id: userId,
        variables: { name, email },
      });
      setMessage('User updated successfully');
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!userId) return;
    
    try {
      await dataProvider.deleteOne({
        resource: 'users',
        id: userId,
      });
      setMessage('User deleted successfully');
      setUserId(null);
      setName('');
      setEmail('');
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div>
      <h2>User Form</h2>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleCreate}>Create User</button>
      {userId && (
        <>
          <button onClick={handleUpdate}>Update User</button>
          <button onClick={handleDelete}>Delete User</button>
        </>
      )}
      {message && <p>{message}</p>}
    </div>
  );
}

// Example 3: Custom method usage
export function AnalyticsExample() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const result = await dataProvider.custom({
        url: 'analytics/stats',
        method: 'GET',
        query: {
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
      });
      setStats(result.data);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const bulkImport = async () => {
    try {
      const result = await dataProvider.custom({
        url: 'users/bulk-import',
        method: 'POST',
        payload: {
          users: [
            { name: 'John Doe', email: 'john@example.com' },
            { name: 'Jane Smith', email: 'jane@example.com' },
          ],
        },
        headers: {
          'X-Import-Mode': 'async',
        },
      });
      console.log('Import result:', result.data);
    } catch (err: any) {
      console.error('Import failed:', err);
    }
  };

  return (
    <div>
      <h2>Analytics & Custom Operations</h2>
      <button onClick={fetchStats}>Fetch Stats</button>
      <button onClick={bulkImport}>Bulk Import Users</button>
      {loading && <p>Loading...</p>}
      {stats && <pre>{JSON.stringify(stats, null, 2)}</pre>}
    </div>
  );
}

// Example 4: Using with Jotai atoms
const usersAtom = atom(async () => {
  const result = await dataProvider.getList<User>({
    resource: 'users',
    pagination: { page: 1, pageSize: 20 },
  });
  return result.data;
});

export function JotaiExample() {
  const [users] = useAtom(usersAtom);

  return (
    <div>
      <h2>Users (Jotai)</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

// Example 5: Filtering and sorting
export function FilteredUsersExample() {
  const [users, setUsers] = useState<User[]>([]);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  useEffect(() => {
    const fetchUsers = async () => {
      const result = await dataProvider.getList<User>({
        resource: 'users',
        pagination: { page: 1, pageSize: 10 },
        sort: [{ field: 'name', order: 'asc' }],
        filters: [
          { field: 'status', operator: 'eq', value: status },
          { field: 'age', operator: 'gte', value: 18 },
        ],
      });
      setUsers(result.data);
    };

    fetchUsers();
  }, [status]);

  return (
    <div>
      <h2>Filtered Users</h2>
      <select value={status} onChange={(e) => setStatus(e.target.value as any)}>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
