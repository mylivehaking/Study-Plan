const REGULAR_DAY_PLAN = [
    { "id": 101, "start": "07:00", "end": "12:00", "title": "مدرسه", "type": "school", "done": false },
    { "id": 102, "start": "12:00", "end": "12:30", "title": "مسیر برگشت", "type": "transit", "done": false },
    { "id": 103, "start": "12:30", "end": "13:45", "title": "استراحت و ناهار", "type": "rest", "done": false },
    { "id": 104, "start": "13:45", "end": "15:45", "title": "نوشتن تکالیف", "type": "study", "done": false },
    { "id": 105, "start": "15:45", "end": "16:45", "title": "استراحت", "type": "rest", "done": false },
    { "id": 106, "start": "16:45", "end": "17:45", "title": "مطالعه سبک (روخوانی)", "type": "study", "done": false },
    { "id": 107, "start": "17:45", "end": "19:45", "title": "استراحت / بازی / خواب عصر", "type": "rest", "done": false },
    { "id": 108, "start": "19:45", "end": "20:45", "title": "شام", "type": "rest", "done": false },
    { "id": 109, "start": "21:00", "end": "22:30", "title": "حفظ دروس (طلایی)", "type": "study", "done": false },
    { "id": 110, "start": "22:30", "end": "23:00", "title": "آماده‌سازی خواب", "type": "rest", "done": false }
];

const DEFAULT_DATA = {
    "saturday": JSON.parse(JSON.stringify(REGULAR_DAY_PLAN)),
    "sunday": JSON.parse(JSON.stringify(REGULAR_DAY_PLAN)),
    "monday": JSON.parse(JSON.stringify(REGULAR_DAY_PLAN)),
    "tuesday": JSON.parse(JSON.stringify(REGULAR_DAY_PLAN)),
    "wednesday": JSON.parse(JSON.stringify(REGULAR_DAY_PLAN)),
    "thursday": [
        { "id": 601, "start": "00:00", "end": "10:00", "title": "خواب راحت", "type": "rest", "done": false },
        { "id": 602, "start": "10:00", "end": "11:00", "title": "صبحانه + ریکاوری", "type": "rest", "done": false },
        { "id": 603, "start": "11:00", "end": "12:00", "title": "استراحت کامل", "type": "rest", "done": false },
        { "id": 604, "start": "12:00", "end": "13:30", "title": "ناهار + استراحت", "type": "rest", "done": false },
        { "id": 605, "start": "13:30", "end": "15:00", "title": "مرور خیلی سبک", "type": "study", "done": false },
        { "id": 606, "start": "15:00", "end": "18:00", "title": "پاداش اصلی (تفریح/فیلم)", "type": "reward", "done": false },
        { "id": 607, "start": "18:00", "end": "19:00", "title": "مرور کوتاه ۳۰ دقیقه‌ای", "type": "study", "done": false },
        { "id": 608, "start": "19:00", "end": "23:59", "title": "وقت آزاد", "type": "reward", "done": false }
    ],
    "friday": [
        { "id": 701, "start": "00:00", "end": "12:00", "title": "خواب کامل (شارژ)", "type": "rest", "done": false },
        { "id": 702, "start": "13:00", "end": "14:30", "title": "ناهار + استراحت", "type": "rest", "done": false },
        { "id": 703, "start": "14:30", "end": "15:00", "title": "استراحت سبک", "type": "rest", "done": false },
        { "id": 704, "start": "15:00", "end": "16:30", "title": "مرور مفهومی", "type": "study", "done": false },
        { "id": 705, "start": "16:30", "end": "17:00", "title": "استراحت میان‌درس", "type": "rest", "done": false },
        { "id": 706, "start": "17:00", "end": "18:00", "title": "نمونه سوال / تست سبک", "type": "study", "done": false },
        { "id": 707, "start": "18:00", "end": "19:00", "title": "استراحت / بازی / بیرون", "type": "reward", "done": false },
        { "id": 708, "start": "19:00", "end": "20:00", "title": "شام", "type": "rest", "done": false },
        { "id": 709, "start": "20:00", "end": "22:00", "title": "استراحت کامل", "type": "rest", "done": false },
        { "id": 710, "start": "22:00", "end": "22:30", "title": "نگاه سبک به درس فردا", "type": "study", "done": false },
        { "id": 711, "start": "22:30", "end": "23:00", "title": "آماده‌سازی خواب", "type": "rest", "done": false }
    ]
};

const DAYS_FA = {
    6: "saturday",
    0: "sunday",
    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday",
    5: "friday"
};

const DAYS_NAMES_FA = {
    "saturday": "شنبه",
    "sunday": "یکشنبه",
    "monday": "دوشنبه",
    "tuesday": "سه‌شنبه",
    "wednesday": "چهارشنبه",
    "thursday": "پنجشنبه",
    "friday": "جمعه"
};

class DataManager {
    constructor() {
        this.data = this.loadData();
        // ابتدا دیتا را از سرور می‌ریم و بعد UI را رندر می‌کنیم
        this.syncWithServer().then(() => {
            console.log('Initial sync completed');
        }).catch(() => {
            // در صورت خطا، فقط با دیتای محلی کار می‌کنیم
            this.refreshUI();
        });
    }

    loadData() {
        const saved = localStorage.getItem('today_plan_data');
        return saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(DEFAULT_DATA));
    }

    async saveData() {
        console.log('Attempting to save data to server...');
        this.data.updated_at = Date.now();
        localStorage.setItem('today_plan_data', JSON.stringify(this.data));

        this.updateSyncStatus('syncing');

        // Debouncing logic
        if (this.syncTimeout) clearTimeout(this.syncTimeout);
        
        this.syncTimeout = setTimeout(async () => {
            try {
                const response = await fetch('/api/data-sync', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'x-api-key': 'today-plan-secret-key' 
                    },
                    body: JSON.stringify(this.data)
                });
                if (!response.ok) throw new Error('Server error');
                console.log('Data synced to Neon DB');
                this.updateSyncStatus('synced');
            } catch (e) {
                console.error('Failed to sync with server:', e);
                this.updateSyncStatus('offline');
            }
        }, 1000);
    }

    updateSyncStatus(status) {
        const statusEl = document.getElementById('sync-status');
        if (!statusEl) return;

        const icons = {
            'syncing': '🔄',
            'synced': '☁️',
            'offline': '⚠️'
        };
        const titles = {
            'syncing': 'در حال ذخیره‌سازی...',
            'synced': 'ذخیره شده در ابر',
            'offline': 'آفلاین (ذخیره محلی)'
        };

        statusEl.textContent = icons[status] || '';
        statusEl.title = titles[status] || '';
        statusEl.className = `sync-status ${status}`;
    }

    async syncWithServer() {
        console.log('=== Starting server sync ===');
        this.updateSyncStatus('syncing');
        try {
            const response = await fetch(`/api/data-sync?t=${Date.now()}`, {
                headers: { 'x-api-key': 'today-plan-secret-key' }
            });
            
            if (!response.ok) throw new Error('Sync failed');

            const serverData = await response.json();
            
            if (serverData && serverData.updated_at) {
                const localUpdatedAt = this.data.updated_at || 0;
                if (serverData.updated_at > localUpdatedAt) {
                    console.log('Server data is newer, updating local...');
                    this.data = serverData;
                    localStorage.setItem('today_plan_data', JSON.stringify(this.data));
                } else if (localUpdatedAt > serverData.updated_at) {
                    console.log('Local data is newer, uploading...');
                    await this.saveData();
                }
            }
            this.updateSyncStatus('synced');
            this.refreshUI();
        } catch (e) {
            console.error('Sync failed:', e);
            this.updateSyncStatus('offline');
            this.refreshUI();
        }
    }

    refreshUI() {
        // این تابع باید توسط app.js یا ui.js بعد از لود کامل صدا زده شود
        // یا مستقیم اینجا رندر را انجام دهد
        if (typeof renderTodayPage === 'function') {
            const todaySchedule = this.getTodaySchedule();
            renderTodayPage(todaySchedule);
        }
        if (typeof renderWeeklyPage === 'function') {
            renderWeeklyPage();
        }
        // اگر در صفحه ایندکس هستیم (وجود بلاک فعلی)، بلاک جاری را هم پیدا کن
        const hasCurrentBlockEl = document.getElementById('current-block') || document.getElementById('block-title');
        if (hasCurrentBlockEl && typeof findAndDisplayCurrentBlock === 'function') {
            const todaySchedule = this.getTodaySchedule();
            findAndDisplayCurrentBlock(todaySchedule);
        }
    }

    getTodaySchedule() {
        const dayIndex = new Date().getDay();
        const dayKey = DAYS_FA[dayIndex];
        return this.data[dayKey] || [];
    }

    async markAsDone(dayKey, blockId) {
        const block = this.data[dayKey].find(b => b.id === blockId);
        if (block) {
            block.done = true;
            await this.saveData(); // صبر برای اطمینant از ارسال به سرور
        }
    }

    async resetData() {
        const freshData = JSON.parse(JSON.stringify(DEFAULT_DATA));

        try {
            console.log('Reset: sending default data to server...');
            freshData.updated_at = Date.now();
            const response = await fetch('/api/data-sync', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-api-key': 'today-plan-secret-key'
                },
                body: JSON.stringify(freshData)
            });

            console.log('Reset server response status:', response.status);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Reset server error: ${errorText}`);
            }
            console.log('Reset data synced to Neon DB');
        } catch (e) {
            console.error('Reset: failed to sync with server, continuing with local reset only:', e);
        }

        // بعد از تلاش برای آپدیت سرور، حتماً لوکال را هم ریست کن
        this.data = freshData;
        localStorage.setItem('today_plan_data', JSON.stringify(this.data));

        // فقط اگر در صفحه امروز (index) هستیم، UI را رفرش کن
        const hasCurrentBlockEl = document.getElementById('current-block') || document.getElementById('block-title');
        if (hasCurrentBlockEl) {
            this.refreshUI();
        }
    }
}

const dataManager = new DataManager();