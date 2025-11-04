```
src/                          # پوشه اصلی منبع کد
├── assets/                   # تصاویر، فونت‌ها، آیکون‌ها (فایل‌های استاتیک)
│   ├── images/               # تصاویر پروژه
│   └── icons/                # آیکون‌ها (SVG یا PNG)
├── components/               # کامپوننت‌های reusable (اتم‌ها/مولکول‌ها)
│   ├── common/               # کامپوننت‌های عمومی مثل Button, Input, Modal
│   ├── layout/               # کامپوننت‌های مثل Header, Footer, Sidebar
│   └── ui/                   # wrapper برای لایبرری‌های سوم (مثل react-select)
├── features/                 # فیچرها یا صفحات (هر فیچر کاملاً جدا)
│   ├── auth/                 # مثال: فیچر احراز هویت
│   │   ├── Login.tsx         # صفحه لاگین
│   │   ├── Register.tsx      # صفحه ثبت‌نام
│   │   └── authSlice.ts      # اسلایس Redux (اگر استفاده می‌کنید)
│   ├── dashboard/            # مثال: داشبورد
│   │   ├── Dashboard.tsx     # صفحه اصلی داشبورد
│   │   └── components/       # کامپوننت‌های اختصاصی داشبورد
│   └── user/                 # مثال: مدیریت کاربر
├── hooks/                    # هوک‌های سفارشی
│   ├── useAuth.ts            # هوک احراز هویت
│   └── useFetch.ts           # هوک fetch داده
├── services/                 # فراخوانی API (wrapper برای axios/fetch)
│   ├── api.ts                # تنظیمات پایه API
│   └── authService.ts        # سرویس‌های مرتبط با auth
├── store/                    # مدیریت حالت (Redux/Zustand/Recoil)
│   ├── slices/               # اسلایس‌های جداگانه
│   └── index.ts              # store اصلی
├── utils/                    # توابع کمکی (format، validator و غیره)
│   └── helpers.ts            # توابع عمومی
├── styles/                   # استایل‌های گلوبال و Tailwind
│   ├── globals.css           # CSS گلوبال
│   └── tailwind.config.js    # (معمولاً خارج src در Vite – اما گاهی داخل)
├── routes/                   # روتینگ (یا AppRouter.tsx)
│   └── PrivateRoute.tsx      # روت‌های محافظت‌شده
├── types/                    # اینترفیس‌های TypeScript
│   └── index.ts              # export همه تایپ‌ها
├── constants/                # ثابت‌ها (API_URL، enumها)
├── contexts/                 # Contextهای React
│   └── ThemeContext.tsx      # مثال: تم اپ
├── App.tsx                   # کامپوننت روت اصلی اپ
├── main.tsx                  # نقطه ورود (ReactDOM.render)
└── index.html                # (معمولاً خارج src در Vite/CRA)
```
