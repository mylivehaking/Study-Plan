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
    }

    loadData() {
        const saved = localStorage.getItem('today_plan_data');
        return saved ? JSON.parse(saved) : DEFAULT_DATA;
    }

    saveData() {
        localStorage.setItem('today_plan_data', JSON.stringify(this.data));
    }

    getTodaySchedule() {
        // برای تست: یکشنبه (روز 0)
        const dayIndex = 0; 
        const dayKey = DAYS_FA[dayIndex];
        return this.data[dayKey] || [];
    }

    markAsDone(dayKey, blockId) {
        const block = this.data[dayKey].find(b => b.id === blockId);
        if (block) {
            block.done = true;
            this.saveData();
        }
    }

    resetData() {
        this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
        this.saveData();
    }
}

const dataManager = new DataManager();