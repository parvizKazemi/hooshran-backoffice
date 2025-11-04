# API Client

این ماژول یک API Client استاندارد بر اساس `fetch` برای تمام درخواست‌های API فراهم می‌کند.

## ویژگی‌ها

- ✅ Base URL قابل تنظیم (از طریق environment variable)
- ✅ Headers استاندارد برای تمام درخواست‌ها
- ✅ مدیریت خودکار Authorization token
- ✅ Error handling متمرکز
- ✅ پشتیبانی از تمام HTTP methods (GET, POST, PUT, PATCH, DELETE)

## محل Error Handling

**تمام خطاها در تابع `handleError` در `api.ts` پردازش می‌شوند.**

این تابع:

1. Response را parse می‌کند
2. Error message را استخراج می‌کند (اولویت: `message` > `error` > `statusCode`)
3. یک `ApiError` throw می‌کند

## نحوه استفاده

### Import کردن توابع API

```typescript
import {
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
  ApiError,
} from "@/services/api";
```

### GET Request

```typescript
try {
  const data = await apiGet<User[]>("/users");
  // استفاده از data
} catch (error) {
  if (error instanceof ApiError) {
    toast.error(error.message);
  }
}
```

### POST Request

```typescript
try {
  const result = await apiPost<AuthData>("/auth/register", {
    phone: "09123456789",
    otp: "12345",
  });
} catch (error) {
  if (error instanceof ApiError) {
    toast.error(error.message);
  }
}
```

### PUT/PATCH Request

```typescript
const updated = await apiPut<User>("/users/123", { name: "New Name" });
const patched = await apiPatch<User>("/users/123", { name: "Updated" });
```

### DELETE Request

```typescript
await apiDelete("/users/123");
```

### استفاده از Headers سفارشی

```typescript
await apiPost("/endpoint", data, {
  headers: {
    "Custom-Header": "value",
    accept: "*/*", // override default
  },
});
```

## Configuration

### Base URL

می‌توانید Base URL را از طریق environment variable تنظیم کنید:

```env
VITE_API_BASE_URL=http://localhost:3000
```

اگر تنظیم نشود، به صورت پیش‌فرض `http://localhost:3000` استفاده می‌شود.

### Authorization

Authorization token به صورت خودکار از `localStorage.getItem("authData")` خوانده می‌شود و به عنوان `Bearer` token به header اضافه می‌شود.

## Error Handling

همه خطاها به صورت `ApiError` throw می‌شوند که شامل:

- `message`: پیام خطا
- `statusCode`: کد وضعیت HTTP
- `error`: نوع خطا
- `originalError`: خطای اصلی

```typescript
try {
  await apiGet("/endpoint");
} catch (error) {
  if (error instanceof ApiError) {
    console.log(error.message); // "خطا در ارسال درخواست"
    console.log(error.statusCode); // 400
    console.log(error.error); // "Bad Request"
  }
}
```

## نکات مهم

1. **همیشه از این API client استفاده کنید** - مستقیم از `fetch` استفاده نکنید
2. **Error handling متمرکز است** - همه خطاها در `handleError` پردازش می‌شوند
3. **Type safety** - با TypeScript types برای request/response استفاده کنید
4. **Authorization** - Token به صورت خودکار اضافه می‌شود، نیازی به اضافه کردن دستی نیست
