const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key-change-in-production';

// Middleware
app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json());

// In-memory database (بدلاً من ملف JSON)
let database = {
    users: [
        {
            id: 1,
            username: 'admin',
            email: 'admin@example.com',
            password: bcrypt.hashSync('admin123', 10),
            role: 'مدير النظام',
            avatar: '👨‍💼',
            status: 'active',
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            username: 'user',
            email: 'user@example.com',
            password: bcrypt.hashSync('user123', 10),
            role: 'مستخدم',
            avatar: '👨‍💻',
            status: 'active',
            createdAt: new Date().toISOString()
        }
    ],
    tasks: [],
    statistics: {
        totalUsers: 0,
        activeUsers: 0,
        completedTasks: 0,
        pendingTasks: 0
    }
};

// Helper functions
const readDB = () => database;
const writeDB = (data) => { database = data; };

// Middleware للتحقق من التوكن
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'غير مصرح' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'توكن غير صالح' });
        }
        req.user = user;
        next();
    });
};

// Root endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'Backend API is running!',
        endpoints: [
            'POST /api/auth/login',
            'POST /api/auth/register',
            'GET /api/users',
            'POST /api/users',
            'GET /api/statistics'
        ]
    });
});

// ==================== Authentication Routes ====================

// تسجيل الدخول
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'يرجى إدخال اسم المستخدم وكلمة المرور' });
    }

    const db = readDB();
    const user = db.users.find(u => u.username === username);

    if (!user) {
        return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
        return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }

    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        SECRET_KEY,
        { expiresIn: '24h' }
    );

    res.json({
        message: 'تم تسجيل الدخول بنجاح',
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            status: user.status
        }
    });
});

// تسجيل مستخدم جديد
app.post('/api/auth/register', (req, res) => {
    const { username, email, password, role, avatar } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
    }

    const db = readDB();
    
    if (db.users.find(u => u.username === username)) {
        return res.status(400).json({ message: 'اسم المستخدم موجود بالفعل' });
    }

    if (db.users.find(u => u.email === email)) {
        return res.status(400).json({ message: 'البريد الإلكتروني موجود بالفعل' });
    }

    const newUser = {
        id: db.users.length + 1,
        username,
        email,
        password: bcrypt.hashSync(password, 10),
        role: role || 'مستخدم',
        avatar: avatar || '👤',
        status: 'active',
        createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    writeDB(db);

    res.status(201).json({
        message: 'تم إنشاء الحساب بنجاح',
        user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
            avatar: newUser.avatar
        }
    });
});

// ==================== Users Routes ====================

// الحصول على جميع المستخدمين
app.get('/api/users', authenticateToken, (req, res) => {
    const db = readDB();
    const users = db.users.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        avatar: u.avatar,
        status: u.status,
        createdAt: u.createdAt
    }));
    res.json(users);
});

// إضافة مستخدم جديد
app.post('/api/users', authenticateToken, (req, res) => {
    const { username, email, password, role, avatar, status } = req.body;

    if (!username || !email) {
        return res.status(400).json({ message: 'الاسم والبريد مطلوبان' });
    }

    const db = readDB();

    const newUser = {
        id: db.users.length + 1,
        username,
        email,
        password: password ? bcrypt.hashSync(password, 10) : bcrypt.hashSync('123456', 10),
        role: role || 'مستخدم',
        avatar: avatar || '👤',
        status: status || 'active',
        createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    writeDB(db);

    res.status(201).json({
        message: 'تم إضافة المستخدم بنجاح',
        user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
            avatar: newUser.avatar,
            status: newUser.status
        }
    });
});

// حذف مستخدم
app.delete('/api/users/:id', authenticateToken, (req, res) => {
    const db = readDB();
    const userIndex = db.users.findIndex(u => u.id === parseInt(req.params.id));

    if (userIndex === -1) {
        return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    db.users.splice(userIndex, 1);
    writeDB(db);

    res.json({ message: 'تم حذف المستخدم بنجاح' });
});

// ==================== Statistics Routes ====================

// الحصول على الإحصائيات
app.get('/api/statistics', authenticateToken, (req, res) => {
    const db = readDB();
    
    const stats = {
        totalUsers: db.users.length,
        activeUsers: db.users.filter(u => u.status === 'active').length,
        completedTasks: Math.floor(Math.random() * 5000) + 3000,
        pendingTasks: Math.floor(Math.random() * 500) + 100,
        usersByRole: {
            'مدير النظام': db.users.filter(u => u.role === 'مدير النظام').length,
            'مشرف': db.users.filter(u => u.role === 'مشرف').length,
            'مستخدم': db.users.filter(u => u.role === 'مستخدم').length
        },
        activityData: Array.from({length: 7}, () => Math.floor(Math.random() * 100) + 120)
    };

    res.json(stats);
});

// ==================== Server ====================

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
