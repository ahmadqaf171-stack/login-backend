# Backend API للنظام

## 🚀 التثبيت والتشغيل

### 1. تثبيت Node.js
تأكد من تثبيت Node.js على جهازك من: https://nodejs.org/

### 2. تثبيت المكتبات
```bash
cd backend
npm install
```

### 3. تشغيل السيرفر
```bash
npm start
```

أو للتطوير مع إعادة التشغيل التلقائي:
```bash
npm run dev
```

## 📡 API Endpoints

### Authentication

#### تسجيل الدخول
```
POST /api/auth/login
Body: {
  "username": "admin",
  "password": "admin123"
}
```

#### تسجيل مستخدم جديد
```
POST /api/auth/register
Body: {
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123",
  "role": "مستخدم",
  "avatar": "👤"
}
```

### Users (يتطلب توكن)

#### الحصول على جميع المستخدمين
```
GET /api/users
Headers: {
  "Authorization": "Bearer YOUR_TOKEN"
}
```

#### الحصول على مستخدم محدد
```
GET /api/users/:id
```

#### إضافة مستخدم
```
POST /api/users
Body: {
  "username": "user",
  "email": "user@example.com",
  "password": "123456",
  "role": "مستخدم",
  "avatar": "👤",
  "status": "active"
}
```

#### تحديث مستخدم
```
PUT /api/users/:id
Body: {
  "username": "updated_name",
  "email": "new@example.com"
}
```

#### حذف مستخدم
```
DELETE /api/users/:id
```

### Statistics

#### الحصول على الإحصائيات
```
GET /api/statistics
```

### Settings

#### الحصول على إعدادات المستخدم
```
GET /api/settings/:userId
```

#### تحديث الإعدادات
```
PUT /api/settings/:userId
Body: {
  "settings": {
    "darkMode": true,
    "language": "ar"
  }
}
```

## 🔐 المستخدمون الافتراضيون

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | مدير النظام |
| user | user123 | مستخدم |

## 📁 هيكل المشروع

```
backend/
├── server.js          # السيرفر الرئيسي
├── package.json       # المكتبات المطلوبة
├── database.json      # قاعدة البيانات (JSON)
└── README.md          # التوثيق
```

## 🛠️ التقنيات المستخدمة

- **Express.js** - إطار عمل الويب
- **JWT** - المصادقة والتوكنات
- **bcryptjs** - تشفير كلمات المرور
- **CORS** - السماح بالطلبات من مصادر مختلفة
- **JSON File** - قاعدة بيانات بسيطة

## 📝 ملاحظات

- قاعدة البيانات مخزنة في ملف `database.json`
- التوكن صالح لمدة 24 ساعة
- يجب تغيير `SECRET_KEY` في الإنتاج
- جميع كلمات المرور مشفرة باستخدام bcrypt
