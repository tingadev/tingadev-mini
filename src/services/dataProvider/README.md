# REST API Data Provider

A TypeScript-based adapter for communicating with backend REST APIs in Zalo Mini Apps. Provides standardized CRUD operations, flexible configuration, custom header support, and comprehensive error handling.

## Features

- ✅ **CRUD Operations**: getList, getOne, create, update, deleteOne
- ✅ **Custom Requests**: Flexible custom method for non-standard endpoints
- ✅ **Type Safety**: Full TypeScript support with generics
- ✅ **Header Management**: Static and dynamic header configuration
- ✅ **Request/Response Transformation**: Adapt backend formats to frontend needs
- ✅ **Error Handling**: Standardized error formats with custom handlers
- ✅ **Pagination & Filtering**: Built-in support for pagination, sorting, and filtering
- ✅ **Zalo Mini App Compatible**: Uses native fetch API

## Installation

The data provider is already included in your project at `src/services/dataProvider/`.

## Quick Start

### Basic Setup

```typescript
import { createDataProvider } from '@/services/dataProvider';

const dataProvider = createDataProvider({
  apiUrl: 'https://api.example.com',
  headers: {
    'Authorization': 'Bearer your-token',
  },
});
```

### Fetch a List of Resources

```typescript
const users = await dataProvider.getList({
  resource: 'users',
  pagination: { page: 1, pageSize: 10 },
  sort: [{ field: 'name', order: 'asc' }],
  filters: [{ field: 'status', operator: 'eq', value: 'active' }],
});

console.log(users.data); // Array of users
console.log(users.total); // Total count
```

### Fetch a Single Resource

```typescript
const user = await dataProvider.getOne({
  resource: 'users',
  id: 123,
});

console.log(user.data); // User object
```

### Create a Resource

```typescript
const newUser = await dataProvider.create({
  resource: 'users',
  variables: {
    name: 'John Doe',
    email: 'john@example.com',
  },
});

console.log(newUser.data); // Created user with ID
```

### Update a Resource

```typescript
const updatedUser = await dataProvider.update({
  resource: 'users',
  id: 123,
  variables: {
    name: 'Jane Doe',
  },
});

console.log(updatedUser.data); // Updated user
```

### Delete a Resource

```typescript
const result = await dataProvider.deleteOne({
  resource: 'users',
  id: 123,
});

console.log(result.data); // Deletion confirmation
```

### Custom API Calls

```typescript
// Custom GET request
const stats = await dataProvider.custom({
  url: 'analytics/stats',
  method: 'GET',
  query: {
    startDate: '2024-01-01',
    endDate: '2024-12-31',
  },
});

// Custom POST request
const result = await dataProvider.custom({
  url: 'users/bulk-import',
  method: 'POST',
  payload: {
    users: [
      { name: 'User 1', email: 'user1@example.com' },
      { name: 'User 2', email: 'user2@example.com' },
    ],
  },
  headers: {
    'X-Import-Mode': 'async',
  },
});

// External API call
const externalData = await dataProvider.custom({
  url: 'https://external-api.com/data',
  method: 'GET',
});
```

## Advanced Configuration

### Dynamic Headers

```typescript
const dataProvider = createDataProvider({
  apiUrl: 'https://api.example.com',
  headers: () => {
    const token = getAccessToken(); // Your auth logic
    return {
      'Authorization': `Bearer ${token}`,
      'X-App-Version': '1.0.0',
    };
  },
});
```

### Request/Response Transformation

```typescript
const dataProvider = createDataProvider({
  apiUrl: 'https://api.example.com',
  transformRequest: (data) => ({
    ...data,
    timestamp: Date.now(),
  }),
  transformResponse: (data) => {
    // If backend wraps data in { success: true, payload: {...} }
    return data.payload || data.data || data;
  },
});
```

### Custom Error Handling

```typescript
const dataProvider = createDataProvider({
  apiUrl: 'https://api.example.com',
  errorHandler: (error) => {
    if (error.statusCode === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    if (error.statusCode === 403) {
      // Show permission error
      showNotification('You do not have permission');
    }
    return error;
  },
});
```

### Custom HTTP Client

```typescript
import { createHttpClient } from '@/services/dataProvider';

const customClient = createHttpClient({
  // Add default configuration
  credentials: 'include',
});

const dataProvider = createDataProvider({
  apiUrl: 'https://api.example.com',
  httpClient: customClient,
});
```

## Using with React

### Basic Component

```typescript
import { useEffect, useState } from 'react';
import { dataProvider } from '@/services/api';

interface User {
  id: number;
  name: string;
  email: string;
}

function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const result = await dataProvider.getList<User>({
          resource: 'users',
          pagination: { page: 1, pageSize: 10 },
        });
        setUsers(result.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      {loading ? <p>Loading...</p> : (
        <ul>
          {users.map(user => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Using with Jotai

```typescript
// atoms/users.ts
import { atom } from 'jotai';
import { dataProvider } from '@/services/api';

export const usersAtom = atom(async () => {
  const result = await dataProvider.getList({
    resource: 'users',
    pagination: { page: 1, pageSize: 20 },
  });
  return result.data;
});

// Component
import { useAtom } from 'jotai';
import { usersAtom } from '@/atoms/users';

function UsersList() {
  const [users] = useAtom(usersAtom);
  
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

## Filter Operators

The data provider supports the following filter operators:

- `eq` - Equal to
- `ne` - Not equal to
- `lt` - Less than
- `lte` - Less than or equal to
- `gt` - Greater than
- `gte` - Greater than or equal to
- `in` - In array
- `nin` - Not in array
- `contains` - Contains substring
- `ncontains` - Does not contain substring

Example:

```typescript
const activeUsers = await dataProvider.getList({
  resource: 'users',
  filters: [
    { field: 'status', operator: 'eq', value: 'active' },
    { field: 'age', operator: 'gte', value: 18 },
    { field: 'role', operator: 'in', value: ['admin', 'moderator'] },
  ],
});
```

## TypeScript Support

The data provider is fully typed with TypeScript generics:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

// Type-safe responses
const users = await dataProvider.getList<User>({
  resource: 'users',
});
// users.data is User[]

const user = await dataProvider.getOne<User>({
  resource: 'users',
  id: 1,
});
// user.data is User
```

## Error Handling

All errors are transformed into `ApiError` objects:

```typescript
interface ApiError extends Error {
  statusCode?: number;
  errors?: Record<string, string[]>;
}

try {
  await dataProvider.getOne({ resource: 'users', id: 999 });
} catch (error) {
  if (error.statusCode === 404) {
    console.log('User not found');
  }
  if (error.errors) {
    console.log('Validation errors:', error.errors);
  }
}
```

## Testing

The data provider includes comprehensive tests:

```bash
# Run all tests
npm test

# Run specific test file
npm test -- dataProvider.test.ts

# Run with UI
npm run test:ui
```

## API Reference

### createDataProvider(config)

Creates a new data provider instance.

**Parameters:**
- `config.apiUrl` (string, required): Base URL for the API
- `config.headers` (HeadersInit | () => HeadersInit, optional): Static or dynamic headers
- `config.httpClient` (HttpClient, optional): Custom HTTP client
- `config.transformRequest` ((data: any) => any, optional): Transform outgoing data
- `config.transformResponse` ((data: any) => any, optional): Transform incoming data
- `config.errorHandler` ((error: any) => Error, optional): Custom error handler

**Returns:** DataProvider instance

### DataProvider Methods

#### getList<T>(params)
Fetches a list of resources with pagination, sorting, and filtering.

#### getOne<T>(params)
Fetches a single resource by ID.

#### create<T>(params)
Creates a new resource.

#### update<T>(params)
Updates an existing resource.

#### deleteOne(params)
Deletes a resource.

#### custom<T>(params)
Makes a custom API request.

## License

UNLICENSED
