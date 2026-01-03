# Data Provider Setup Guide

Your REST API Data Provider is now fully configured and ready to use! 🎉

## ✅ What's Been Configured

1. **API URL Configuration** - Added `VITE_API_URL` to `.env`
2. **Authentication** - Integrated Zalo Mini App token management
3. **Three Data Provider Options** - Standard, with transformation, and with error handling
4. **Usage Examples** - Complete examples in `src/examples/UsageExample.tsx`
5. **Type Safety** - Full TypeScript support with no errors
6. **Tests** - All 29 tests passing (17 unit + 12 property-based)

## 🚀 Quick Start

### Step 1: Update Your API URL

Edit `.env` file:

```env
VITE_API_URL=https://your-actual-api-domain.com
```

### Step 2: Import and Use

```typescript
import { dataProvider } from '@/services/api';

// Fetch data
const users = await dataProvider.getList({
  resource: 'users',
  pagination: { page: 1, pageSize: 10 },
});
```

### Step 3: Use in Components

```typescript
import { useEffect, useState } from 'react';
import { dataProvider } from '@/services/api';

function MyComponent() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await dataProvider.getList({
        resource: 'users',
      });
      setData(result.data);
    };
    fetchData();
  }, []);

  return <div>{/* render data */}</div>;
}
```

## 📚 Available Data Providers

### 1. Standard Data Provider (Recommended)

```typescript
import { dataProvider } from '@/services/api';
```

**Features:**
- ✅ Automatic Zalo authentication
- ✅ Bearer token in Authorization header
- ✅ App version and ID headers
- ✅ Standard error handling

### 2. With Request/Response Transformation

```typescript
import { dataProviderWithTransform } from '@/services/api';
```

**Features:**
- ✅ All standard features
- ✅ Adds timestamp to all requests
- ✅ Unwraps response data from `{ payload: {...} }` or `{ data: {...} }`

**Use when:** Your backend has a specific response format

### 3. With Custom Error Handling

```typescript
import { dataProviderWithErrorHandler } from '@/services/api';
```

**Features:**
- ✅ All standard features
- ✅ Logs 401 (Unauthorized) errors
- ✅ Logs 403 (Forbidden) errors
- ✅ Logs 500+ (Server) errors

**Use when:** You need custom error handling logic

## 🔧 Authentication

Authentication is handled automatically:

1. Gets access token from Zalo SDK
2. Adds `Authorization: Bearer <token>` header to all requests
3. Token is refreshed on each request

### Manual Token Refresh

```typescript
import { refreshAuthToken } from '@/services/api';

// Manually refresh token if needed
await refreshAuthToken();
```

## 📖 Complete API Reference

### CRUD Operations

```typescript
// Get list with filters, sorting, pagination
const result = await dataProvider.getList({
  resource: 'users',
  pagination: { page: 1, pageSize: 10 },
  sort: [{ field: 'name', order: 'asc' }],
  filters: [
    { field: 'status', operator: 'eq', value: 'active' },
    { field: 'age', operator: 'gte', value: 18 },
  ],
});

// Get single item
const user = await dataProvider.getOne({
  resource: 'users',
  id: 123,
});

// Create new item
const newUser = await dataProvider.create({
  resource: 'users',
  variables: {
    name: 'John Doe',
    email: 'john@example.com',
  },
});

// Update item
const updated = await dataProvider.update({
  resource: 'users',
  id: 123,
  variables: { name: 'Jane Doe' },
});

// Delete item
await dataProvider.deleteOne({
  resource: 'users',
  id: 123,
});
```

### Custom API Calls

```typescript
// Custom GET
const stats = await dataProvider.custom({
  url: 'analytics/stats',
  method: 'GET',
  query: { startDate: '2024-01-01' },
});

// Custom POST
const result = await dataProvider.custom({
  url: 'users/bulk-import',
  method: 'POST',
  payload: { users: [...] },
  headers: { 'X-Custom': 'value' },
});
```

## 🎯 Filter Operators

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

## 📝 Usage Examples

Complete examples are available in:
- `src/examples/UsageExample.tsx` - 8 different usage patterns
- `src/examples/DataProviderExample.tsx` - Original examples
- `src/services/dataProvider/README.md` - Full documentation

## 🧪 Testing

All tests are passing:

```bash
# Run tests
npm test

# Run with UI
npm run test:ui

# Type check
npx tsc --noEmit
```

**Test Coverage:**
- ✅ 17 unit tests
- ✅ 12 property-based tests
- ✅ URL construction
- ✅ Query parameter serialization
- ✅ Pagination
- ✅ Error handling
- ✅ CRUD operations

## 🔍 Troubleshooting

### Issue: 401 Unauthorized

**Solution:** Token may be expired. Try:
```typescript
import { refreshAuthToken } from '@/services/api';
await refreshAuthToken();
```

### Issue: CORS errors

**Solution:** Ensure your backend has proper CORS headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Issue: Response format doesn't match

**Solution:** Use the transform data provider:
```typescript
import { dataProviderWithTransform } from '@/services/api';
```

Or customize the transformation in `src/services/api.ts`

## 📦 What's Included

```
src/
├── services/
│   ├── api.ts                    # ✅ Configured data providers
│   └── dataProvider/
│       ├── index.ts              # ✅ Main exports
│       ├── types.ts              # ✅ TypeScript types
│       ├── dataProvider.ts       # ✅ Core implementation
│       ├── httpClient.ts         # ✅ HTTP client wrapper
│       ├── errorHandler.ts       # ✅ Error handling
│       ├── utils.ts              # ✅ Helper functions
│       ├── README.md             # ✅ Full documentation
│       └── __tests__/            # ✅ Comprehensive tests
└── examples/
    ├── DataProviderExample.tsx   # ✅ Original examples
    └── UsageExample.tsx          # ✅ 8 usage patterns
```

## 🎓 Next Steps

1. **Update API URL** - Change `VITE_API_URL` in `.env` to your actual API
2. **Test Authentication** - Make a test API call to verify token is working
3. **Start Using** - Import `dataProvider` in your components
4. **Customize** - Modify transformations in `src/services/api.ts` if needed
5. **Add Features** - Extend the data provider as your app grows

## 📚 Additional Resources

- **Full Documentation**: `src/services/dataProvider/README.md`
- **Design Document**: `.kiro/specs/rest-api-data-provider/design.md`
- **Requirements**: `.kiro/specs/rest-api-data-provider/requirements.md`
- **Task List**: `.kiro/specs/rest-api-data-provider/tasks.md`

## ✨ Features Summary

- ✅ **Type-Safe** - Full TypeScript support
- ✅ **Authenticated** - Automatic Zalo token management
- ✅ **Flexible** - Custom requests, transformations, error handling
- ✅ **Tested** - 29 passing tests with property-based testing
- ✅ **Documented** - Comprehensive docs and examples
- ✅ **Production-Ready** - No type errors, all tests passing

---

**You're all set!** Start building your Zalo Mini App with confidence. 🚀
