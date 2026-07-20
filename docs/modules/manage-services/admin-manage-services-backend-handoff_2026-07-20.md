# مدیریت سرویس‌های کاتالوگ — درخواست پیاده‌سازی بک‌اند

**تاریخ:** 2026-07-20  
**پروژه:** hooshran-admin → `/services/manage`  
**وضعیت فرانت:** UI آماده است، فعلاً روی mock (`USE_MOCK_MANAGE_SERVICES = true`)

---

## خلاصه

مثل ماژول دسته‌بندی‌ها (`/admin/categories`)، ادمین همه تغییرات را لوکال نگه می‌دارد و با یک دکمه «ثبت تغییرات نهایی» کل لیست را یکجا ذخیره می‌کند.

نیاز به ۳ اندپوینت batch داریم. بقیه چیزها از APIهای موجود استفاده می‌شود.

---

## چه چیزی از قبل کار می‌کند (نیازی به تغییر نیست)

| مورد                                  | منبع                                                                             |
| ------------------------------------- | -------------------------------------------------------------------------------- |
| لیست دسته‌بندی‌ها برای فیلتر/فرم      | `GET /admin/categories`                                                          |
| انتخاب والد چندمدله (`ParentService`) | `GET /api-service?limit=300&type=all` + فیلتر `templateName === "ParentService"` |
| انتخاب زیرمدل‌ها از لیست سرویس‌ها     | همان `GET /api-service` (غیر ParentService)                                      |
| آپلود رسانه شاخص                      | `POST /upload`                                                                   |

`templateName` در پاسخ `/api-service` الان هست و کافی است — تغییر لازم نیست.

---

## آنچه باید پیاده‌سازی شود

### اندپوینت‌ها

| Method  | Path              | توضیح                                           |
| ------- | ----------------- | ----------------------------------------------- |
| `GET`   | `/admin/services` | لیست کامل سرویس‌های کاتالوگ                     |
| `POST`  | `/admin/services` | ایجاد اولیه (وقتی لیست خالی بوده) — body: آرایه |
| `PATCH` | `/admin/services` | همگام‌سازی کامل لیست — body: آرایه              |

پاسخ: `ManageService[]` یا `{ data: ManageService[] }`

### قرارداد ذخیره (مثل categories)

- بدنه همیشه **آرایه کامل** است
- آیتم بدون `uuid` = **ایجاد**
- `uuid` موجود = **ویرایش**
- `uuid`هایی که در GET قبلی بودند ولی در PATCH نیستند = **حذف**
- `order` = اولویت نمایش

### شکل هر آیتم (GET و POST/PATCH)

```ts
{
  uuid?: string;                 // فقط برای آیتم‌های موجود
  name: string;
  description: string;
  slug: string;                  // اگر multi → باید با "models-" شروع شود
  modelType: "single" | "multi"; // multi ≡ templateName = "ParentService"
  badge: "popular" | "most_used" | "newest" | null;
  imageUrl: string;              // URL تصویر یا ویدیو شاخص
  order: number;
  isActive: boolean;
  inactiveReason: string;        // اگر isActive=false
  categoryUuids: string[];       // عضویت در چند دسته
  parentUuid: string | null;     // اگر تک‌مدل و زیرمجموعه یک ParentService باشد
  isAutoCredit: boolean;
  creditHint: string;            // متن نمایش اعتبار (وقتی auto نیست)
  submodels: Array<{             // فقط برای modelType=multi — uuid سرویس‌های انتخاب‌شده
    uuid?: string;
    name: string;
    description: string;
    slug: string;
    imageUrl: string;
    creditHint: string;
    badge: "popular" | "most_used" | "newest" | null;
    isActive: boolean;
    inactiveReason: string;
  }>;
}
```

---

## قواعد دامنه که بک‌اند باید enforce کند

1. **`modelType: "multi"`** → `templateName = "ParentService"` و `slug` با `models-` شروع شود
2. **`parentUuid`** → فقط برای `single`؛ اشاره به یک سرویس ParentService معتبر
3. **`submodels`** → لیست فرزندان ParentService (ترجیحاً همان رابطه فعلی / `accept_hint`)
4. **`categoryUuids`** → پشتیبانی از چند دسته برای یک سرویس
5. حذف از یک دسته ≠ حذف کامل سرویس (فقط آن uuid از `categoryUuids` حذف می‌شود)

---

## پیشنهاد نگاشت به مدل فعلی (اختیاری)

| فیلد ادمین                 | پیشنهاد ذخیره                              |
| -------------------------- | ------------------------------------------ |
| `order`                    | `metadata.ui.service_order`                |
| `description`              | `metadata.ui.description` / `introduction` |
| `imageUrl`                 | `metadata.ui.image`                        |
| `badge`                    | `metadata.ui.badge`                        |
| `isActive`                 | `isActive` + `metadata.ui.active`          |
| `inactiveReason`           | `metadata.ui.inactiveReason`               |
| `creditHint`               | `metadata.ui.cost_hint`                    |
| `categoryUuids`            | relation / join (الان عمدتاً تک‌دسته است)  |
| `parentUuid` / `submodels` | رابطه ParentService + فرزندان              |

---

## چک‌لیست تحویل

- [ ] `GET /admin/services`
- [ ] `POST /admin/services` (آرایه)
- [ ] `PATCH /admin/services` (آرایه کامل = create/update/delete/reorder)
- [ ] اعتبارسنجی slug چندمدله (`models-`)
- [ ] پشتیبانی `categoryUuids[]`
- [ ] نگاشت `parentUuid` و `submodels`
- [ ] فیلدهای `badge`، `inactiveReason`، `creditHint`، `imageUrl`

بعد از آماده شدن، فرانت فقط این فلگ را عوض می‌کند:

```ts
// features/manage-services/constants.ts
USE_MOCK_MANAGE_SERVICES = false;
```
