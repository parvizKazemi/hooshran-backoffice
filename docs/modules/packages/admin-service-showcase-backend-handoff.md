# مستند اتصال به بک‌اند: مدیریت نمایش و ویترین سرویس‌ها (Service Showcase)

**تاریخ:** ۲۵ اکتبر ۲۰۲۶  
**ماژول:** پکیج‌ها و ویترین سرویس‌ها (`/packages` → تب `showcase` و `/packages/showcase`)  
**وضعیت فرانت‌اند:** آماده، تست‌شده با React Query و دارای Fallback خودکار به `localStorage`

---

## ۱. مقدمه و خلاصه ماژول

ماژول **مدیریت نمایش سرویس‌ها (ویترین کاربری)** جهت پیکربندی اولویت نمایش دسته‌بندی‌ها، مرتب‌سازی سرویس‌ها، پین کردن سرویس‌های پرچمدار، فعال/مخفی‌سازی تکی یا گروهی و تعیین تعداد پیش‌فرض ردیف‌ها قبل از «نمایش بیشتر» در پنل ادمین هوشران پیاده‌سازی شده است.

این ماژول در حال حاضر در فرانت‌اند کاملاً به صورت پویا کار می‌کند؛ در صورتی که اندپوینت بک‌اند هنوز آماده یا در دسترس نباشد، به‌صورت خودکار اطلاعات را در حافظه مرورگر (`localStorage`) نگهداری و بارگذاری می‌کند تا فرآیند کار با پنل مختل نشود.

---

## ۲. ساختار فایل‌های فرانت‌اند در پروژه

تمامی کدهای مربوط به این بخش در مسیرهای زیر متمرکز هستند:

```text
src/features/packages/
├── Packages.tsx                               # کامپوننت اصلی پکیج‌ها به همراه ساب‌منوی تب‌ها
└── showcase/
    ├── types.ts                               # تایپ‌های TypeScript و اسکیماهای Zod
    ├── mock-data.ts                           # مقادیر اولیه و پیش‌فرض ویترین
    ├── api/
    │   └── showcase-api.ts                    # لایه فراخوانی API و مدیریت Fallback لوکال
    ├── hooks/
    │   └── use-service-showcase.ts            # هوک‌های React Query (useQuery و useMutation)
    └── components/
        ├── service-showcase-tab.tsx           # کانتینر اصلی تب ویترین (مدیریت Drag & Drop و وضعیت‌ها)
        ├── showcase-toolbar.tsx               # نوار ابزار (جستجو، فیلتر وضعیت، تنظیم تعداد ردیف)
        ├── showcase-alert-banner.tsx          # بنر راهنما و شمارنده زنده سرویس‌ها/دسته‌ها
        ├── showcase-category-card.tsx         # کارت دسته‌بندی با تاگل گروهی و درگ دسته
        ├── showcase-service-row.tsx           # ردیف سرویس با درگ، پین، بج و تاگل نمایش
        └── showcase-footer.tsx                # نوار ذخیره و انصراف در پایین صفحه
```

---

## ۳. قرارداد API و نیازمندی‌های بک‌اند (API Contract)

### ۳.۱. اندپوینت‌ها

| متد   | مسیر (Endpoint)                    | توضیح                                                        | وضعیت در فرانت        |
| :---- | :--------------------------------- | :----------------------------------------------------------- | :-------------------- |
| `GET` | `/admin/packages/service-showcase` | دریافت آخرین وضعیت چیدمان، دسته‌ها، سرویس‌ها و کانفیگ ویترین | فرانت پیاده‌سازی کرده |
| `PUT` | `/admin/packages/service-showcase` | ذخیره کامل چیدمان، اولویت‌ها، وضعیت‌های فعال/مخفی و پین‌ها   | فرانت پیاده‌سازی کرده |

> **نکته:** در صورت نیاز به استفاده از `POST` یا `PATCH` به جای `PUT`، صرفاً یک کلمه در متد فایل `showcase-api.ts` تغییر خواهد کرد.

---

### ۳.۲. ساختار درخواست و پاسخ (Request & Response Payload)

#### پاسخ `GET /admin/packages/service-showcase` و بدنه ارسال `PUT /admin/packages/service-showcase`:

```json
{
  "config": {
    "defaultRowsBeforeExpand": 3
  },
  "categories": [
    {
      "id": "cat-image-edit",
      "name": "ویرایش و بهینه‌سازی تصویر",
      "icon": "wand-2",
      "colorTheme": "emerald",
      "isActive": true,
      "order": 1,
      "services": [
        {
          "id": "srv-bg-remover",
          "title": "حذف پس‌زمینه (Background Remover Pro)",
          "costDescription": "۳ اعتبار / هر تصویر پردازشی",
          "isActive": true,
          "isPinned": false,
          "badge": null,
          "order": 1,
          "categoryId": "cat-image-edit"
        },
        {
          "id": "srv-upscaler-4k",
          "title": "ارتقای کیفیت و وضوح (Upscaler 4K)",
          "costDescription": "۴ اعتبار / پردازش فوق پیشرفته",
          "isActive": false,
          "isPinned": false,
          "badge": "مخفی موقت",
          "order": 2,
          "categoryId": "cat-image-edit"
        }
      ]
    },
    {
      "id": "cat-image-gen",
      "name": "تولید تصویر (Image Generation)",
      "icon": "image",
      "colorTheme": "blue",
      "isActive": true,
      "order": 2,
      "services": [
        {
          "id": "srv-hermuz-2",
          "title": "تصویرساز هرموز ۲ (نسخه پرچمدار)",
          "costDescription": "از ۳ اعتبار / هر عدد (متغیر بر اساس کیفیت)",
          "isActive": true,
          "isPinned": true,
          "badge": null,
          "order": 1,
          "categoryId": "cat-image-gen"
        }
      ]
    }
  ]
}
```

---

### ۳.۳. توضیحات فیلدها و قوانین اعتبارسنجی بک‌اند

1. **`config.defaultRowsBeforeExpand`:** عدد صحیح بین ۱ تا ۱۰ (تعیین‌کننده تعداد ردیف پیش‌فرض قبل از نمایش دکمه «نمایش بیشتر» در ویترین کاربر).
2. **`categories[].id`:** شناسه یکتای دسته (می‌تواند UUID یا Slug یا ID عددی در قالب رشته باشد).
3. **`categories[].order`:** عدد صحیح مثبت نشان‌دهنده اولویت قرارگیری دسته در صفحه ویترین (۱ یعنی بالاترین).
4. **`categories[].isActive`:** وضعیت نمایش کلی دسته در ویترین.
5. **`categories[].icon`:** آیکون مرتبط با دسته (`wand-2`، `image`، `video`، `mic`).
6. **`categories[].colorTheme`:** تم رنگی آیکون (`emerald`، `blue`، `indigo`، `amber`).
7. **`services[].id`:** شناسه یکتای سرویس.
8. **`services[].order`:** اولویت قرارگیری سرویس در لیست دسته مربوطه (سرویس‌های پین‌شده معمولاً در صدر قرار می‌گیرند).
9. **`services[].isActive`:** آیا سرویس در ویترین عمومی نمایش داده شود یا خیر (`true` = فعال، `false` = مخفی).
10. **`services[].isPinned`:** آیا به عنوان پرچمدار پین شده است یا خیر (`true` = هایلایت طلایی + نشان پرچمدار در بالای دسته).
11. **`services[].badge`:** برچسب متنی اختیاری (مثل `"مخفی موقت"` یا `"نسخه قدیمی"` یا `null`).

---

## ۴. نقاط نیازمند تغییر در فرانت‌اند پس از تکمیل بک‌اند

به دلیل معماری ایزوله و Clean، تغییرات مورد نیاز فرانت‌اند به حداقل ممکن کاهش یافته است. بسته به نحوه پیاده‌سازی بک‌اند، تنها نقاط زیر بررسی یا ویرایش خواهند شد:

### نقطه ۱: فایل `src/features/packages/showcase/api/showcase-api.ts`

در این فایل متدهای `fetchShowcaseData` و `saveShowcaseData` قرار دارند:

```ts
// مسیر پیش‌فرض اندپوینت:
const SHOWCASE_ENDPOINT = "/admin/packages/service-showcase";
```

- **اگر مسیر اندپوینت در بک‌اند تغییر کرد:** تنها کافی است متغیر رشته‌ای مسیر اندپوینت در این فایل تغییر کند.
- **اگر متد ذخیره‌سازی به جای `PUT` از `POST` استفاده کند:**
  ```ts
  // تغییر apiPut به apiPost در تابع saveShowcaseData:
  const response = await apiPost<ShowcaseData>(SHOWCASE_ENDPOINT, data);
  ```
- **حذف fallback به localStorage (اختیاری):**
  در حال حاضر اگر بک‌اند خطای ۴۰۴ دهد، برنامه کرش نکرده و از داده ذخیره‌شده در `localStorage` استفاده می‌کند. پس از آماده شدن بک‌اند، در صورت تمایل به نمایش مستقیم خطای سرور می‌توانید بلوک `catch` را به صورت استاندارد برای پرتاب خطا تنظیم کنید.

---

### نقطه ۲: ساختار Wrapper پاسخ سرور (در صورت وجود Envelope)

اگر بک‌اند پاسخ را درون فیلدی مانند `{ data: ShowcaseData }` یا `{ result: ShowcaseData }` بازگرداند:
در تابع `fetchShowcaseData`:

```ts
// اگر پاسخ بک‌اند { data: ... } باشد:
const response = await apiGet<{ data: ShowcaseData } | ShowcaseData>(
  SHOWCASE_ENDPOINT
);
const showcaseData =
  "data" in response && response.data ? response.data : response;
return showcaseData;
```

---

### نقطه ۳: تطبیق شناسه‌ها (IDs) در صورت اتصال به جدول واقعی سرویس‌ها (`src/features/packages/showcase/types.ts`)

اگر بک‌اند ترجیح دهد به جای شناسه‌های متنی موقت (مانند `srv-bg-remover`) از UUIDهای واقعی سرویس‌های کاتالوگ موجود در جدول سرویس‌ها استفاده کند:

- فیلد `id` در تایپ `ShowcaseService` به همان شکل `string` است و UUID سرویس‌های کاتالوگ به راحتی پشتیبانی می‌شود.
- در صورت نیاز به فیلدهای اضافی مثل `serviceUuid` یا `categoryUuid`، صرفاً فیلدهای اختیاری به `ShowcaseServiceSchema` و `ShowcaseCategorySchema` در فایل `types.ts` اضافه می‌شوند.

---

## ۵. چک‌لیست تست و تحویل نهایی (Handoff Checklist)

پس از آماده شدن بک‌اند، مراحل زیر برای تست صحت کارکرد انجام می‌شود:

- [ ] **بررسی GET:** اجرای درخواست `GET /admin/packages/service-showcase` و مشاهده بارگذاری موفق داده‌ها در تب ویترین.
- [ ] **تست درگ و دراپ دسته‌ها:** جابجایی دسته‌بندی‌ها و کلیک روی دکمه «ذخیره چیدمان و تنظیمات»؛ بررسی ذخیره اولویت `categories[].order` در بک‌اند.
- [ ] **تست درگ و دراپ سرویس‌ها:** جابجایی سرویس‌های داخل یک دسته و بررسی فیلد `services[].order`.
- [ ] **تست پین کردن:** پین کردن یک سرویس، انتقال آن به بالای لیست و بررسی فیلد `isPinned: true`.
- [ ] **تست تاگل گروهی دسته:** غیرفعال کردن کل دسته با سوئیچ هدر دسته و بررسی ذخیره `isActive: false` برای سرویس‌ها یا دسته.
- [ ] **تست تنظیم تعداد ردیف‌ها:** تغییر فیلد ردیف پیش‌فرض قبل از نمایش بیشتر (مثلاً به ۵) و بررسی فیلد `config.defaultRowsBeforeExpand`.
- [ ] **تست رفرش صفحه:** رفرش کردن تب و اطمینان از خوانده شدن اطلاعات ذخیره‌شده بدون اتکا به مقادیر اولیه ماک.
