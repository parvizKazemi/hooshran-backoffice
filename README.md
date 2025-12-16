## Admin Panel

پنل مدیریت برای مدیریت محتوای وب‌سایت و عملیات کسب‌وکار. این پروژه با React 19، TypeScript، Vite و Tailwind توسعه داده شده است و معماری feature-based دارد. تمرکز اصلی بر روی ماژولار بودن فیچرها، مدیریت وضعیت با React Query، و بین‌المللی‌سازی (i18n) است.

### Requirements

- **Node.js**: 18.x یا 20.x (LTS پیشنهاد می‌شود)
- **Package manager**: pnpm 8+
- **Git**: برای کلون کردن مخزن

### Getting Started

1. کلون کردن مخزن:

```bash
git clone <repo-url>
cd admin-panel
```

2. نصب وابستگی‌ها:

```bash
pnpm install
```

3. پیکربندی متغیرهای محیطی:
   فایل `.env` را در روت پروژه ایجاد کنید و مقدار پایه API را تنظیم کنید.

```bash
echo "VITE_API_BASE_URL=http://localhost:3000" > .env
```

4. اجرای محیط توسعه:

```bash
pnpm dev
```

5. بیلد و پیش‌نمایش:

```bash
pnpm build
pnpm preview
```

### Common Scripts

- **pnpm dev**: اجرا در حالت توسعه روی پورت 5173
- **pnpm build**: بیلد تولید با TypeScript build و Vite
- **pnpm preview**: پیش‌نمایش خروجی بیلد
- **pnpm lint**: اجرای ESLint روی `src`
- **pnpm lint:fix**: اصلاح خودکار خطاهای lint
- **pnpm format**: اجرای Prettier برای فرمت کد
- **pnpm type-check**: بررسی تایپ‌ها بدون خروجی بیلد

### Environment Variables

- `VITE_API_BASE_URL`: آدرس پایه API (پیش‌فرض: `http://localhost:3000`)

### Tech Stack

- **React 19**: فریمورک اصلی رابط کاربری
- **TypeScript**: تایپ‌چکینگ و امنیت نوع
- **Vite 7**: بیلد تول و توسعه سریع
- **Tailwind CSS 4**: استایل‌دهی utility-first
- **React Router 7**: مدیریت مسیریابی و ناوبری
- **TanStack Query**: مدیریت وضعیت سرور، کش و همگام‌سازی داده
- **TanStack Table**: ساخت جداول پیشرفته با قابلیت‌های sort، filter و pagination
- **React Hook Form**: مدیریت فرم‌ها با عملکرد بالا
- **Zod**: اعتبارسنجی schema-based برای فرم‌ها و API
- **i18next**: بین‌المللی‌سازی و پشتیبانی چندزبانه
- **Radix UI**: کامپوننت‌های دسترسی‌پذیر و بدون استایل
- **Sonner**: سیستم نوتیفیکیشن toast
- **Recharts**: کتابخانه نمودار و تجسم داده
- **@dnd-kit**: قابلیت drag and drop برای رابط کاربری

### Project Structure

```
.
├── index.html
├── package.json
├── pnpm-lock.yaml
├── public/
│   ├── favicon.svg
│   ├── fonts/
│   └── images/
├── src/
│   ├── assets/                 # Static assets (icons, images)
│   ├── components/
│   │   ├── common/             # App-wide common components (toggles, etc.)
│   │   ├── layout/             # Layout-level components (sidebar, header)
│   │   └── ui/                 # Reusable UI primitives (buttons, cards, inputs)
│   ├── constants/              # App-wide constants
│   ├── contexts/               # React contexts (auth, notifications)
│   ├── features/               # Feature-based modules (fully isolated)
│   │   ├── auth/               # Authentication pages, forms, hooks
│   │   ├── dashboard/          # Dashboard overview and data
│   │   ├── users/              # Users management
│   │   ├── categories/         # Categories management
│   │   ├── packages/           # Packages management
│   │   ├── payments/           # Payments listing and details
│   │   ├── payment-gateways/   # Payment gateways configuration
│   │   ├── plans/              # Plans management
│   │   ├── media/              # Media manager
│   │   ├── notifications/      # In-app notifications
│   │   ├── transactions/       # Transactions listing
│   │   ├── tickets/            # Support tickets
│   │   ├── user-credits/       # Users' credits management
│   │   ├── referrals/          # Referral program
│   │   ├── utm-analytics/      # UTM analytics
│   │   ├── service-requests/   # Users' service requests
│   │   └── api-services/       # 3rd-party API services
│   ├── hooks/                  # App-level custom hooks
│   ├── i18n/                   # i18next initialization
│   ├── lib/                    # Utilities (non-React specific)
│   ├── locales/                # Translation resources
│   ├── routes/                 # App routing and guards
│   ├── services/               # API client and service wrappers
│   ├── store/                  # State slices (if any)
│   ├── styles/                 # Global styles and theme
│   ├── types/                  # Shared TypeScript types
│   ├── globals.css             # Global CSS entry
│   ├── main.tsx                # App entry point
│   └── vite-env.d.ts           # Vite ambient types
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

### Conventions

- **Feature-first**: هر فیچر در پوشه‌ی خودش شامل `components/`, `hooks/`, `types.ts`, و فایل صفحه است.
- **Reusable UI**: کامپوننت‌های خالص UI در `src/components/ui` نگهداری می‌شوند.
- **API Access**: تمام فراخوانی‌ها از طریق `src/services/api.ts` انجام می‌شود؛ `VITE_API_BASE_URL` نقطه ورود است.
- **i18n**: منابع در `src/locales/*` و کانفیگ در `src/i18n/index.ts` قرار دارد.
