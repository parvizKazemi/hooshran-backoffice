# ماژول مدیریت ویترین سرویس‌ها (Service Showcase)

این ماژول ساب‌منوی ویترین و اولویت‌بندی سرویس‌ها را در صفحه پکیج‌ها مدیریت می‌کند.

## مستندات بک‌اند و قرارداد اتصال (Backend Handoff)

مستند کامل نیازمندی‌های بک‌اند، اندپوینت‌ها، مدل داده، و نقاط تغییر فرانت‌اند در فایل زیر نگهداری می‌شود:

👉 **[docs/modules/packages/admin-service-showcase-backend-handoff.md](../../../../docs/modules/packages/admin-service-showcase-backend-handoff.md)**

## اندپوینت‌های پیش‌فرض

- `GET /admin/packages/service-showcase`
- `PUT /admin/packages/service-showcase`

## نحوه کار لایه داده (showcase-api.ts)

در حال حاضر لایه API مجهز به Fallback هوشمند به `localStorage` است تا در صورت آماده نبودن اندپوینت‌های بک‌اند، توسعه و استفاده در ادمین متوقف نشود.
پس از توسعه بک‌اند، در صورت مطابقت مسیرها، هیچ تغییری در کدهای UI نیاز نخواهد بود.
