function renderTodayPage(todaySchedule) {
    const blocksList = document.getElementById('blocks-list');
    const dayNameEl = document.getElementById('current-day-name');
    const dateEl = document.getElementById('current-date');
    
    if (!blocksList) return;

    // برای تست: یکشنبه (روز 0)
    const dayIndex = 0;
    const dayKey = DAYS_FA[dayIndex];
    dayNameEl.textContent = DAYS_NAMES_FA[dayKey];
    
    // تاریخ تست
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + (0 - testDate.getDay())); // تنظیم به نزدیک‌ترین یکشنبه
    
    dateEl.textContent = new Intl.DateTimeFormat('fa-IR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    }).format(testDate);

    blocksList.innerHTML = '';
    let doneCount = 0;

    todaySchedule.forEach(block => {
        if (block.done) doneCount++;
        
        const card = document.createElement('div');
        card.className = `small-card ${block.type || ''} ${block.done ? 'done' : ''}`;
        card.style.cursor = 'pointer'; // نشان دادن قابلیت کلیک
        card.innerHTML = `
            <div class="block-info">
                <div class="title">${block.title}</div>
                <div class="time">${block.start} - ${block.end}</div>
            </div>
            <div class="status">
                ${block.done ? '<span>✅</span>' : '<span>⏳</span>'}
            </div>
        `;
        
        // افزودن قابلیت کلیک برای تایید دستی (فقط برای بازه‌های گذشته و حال)
        card.addEventListener('click', () => {
            if (!block.done) {
                // محاسبه زمان شروع بلاک به دقیقه
                const [startH, startM] = block.start.split(':').map(Number);
                const startTime = startH * 60 + startM;
                
                // زمان فعلی برای تست (ساعت 13:00)
                const currentTime = 13 * 60 + 0; 

                if (currentTime >= startTime) {
                    if (confirm(`آیا بازه "${block.title}" انجام شده است؟`)) {
                        markBlockAsDone(block.id);
                    }
                } else {
                    alert('هنوز زمان این بازه نرسیده است.');
                }
            }
        });

        blocksList.appendChild(card);
    });

    // Update progress
    const progressFill = document.getElementById('daily-progress-fill');
    const progressText = document.getElementById('progress-text');
    const percent = todaySchedule.length ? (doneCount / todaySchedule.length) * 100 : 0;
    
    if (progressFill) progressFill.style.width = `${percent}%`;
    if (progressText) progressText.textContent = `${doneCount} از ${todaySchedule.length} مورد تمام شده`;
}

function renderWeeklyPage() {
    const grid = document.getElementById('weekly-grid');
    if (!grid) return;

    grid.innerHTML = '';
    
    // ترتیب روزها از شنبه تا جمعه
    const weekOrder = ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"];
    
    weekOrder.forEach(dayKey => {
        const dayBlocks = dataManager.data[dayKey] || [];
        const dayCard = document.createElement('div');
        dayCard.className = `day-column ${dayKey}`;
        
        let blocksHtml = dayBlocks.map(b => `
            <div class="small-card ${b.type || ''}" style="margin-top: 8px; padding: 10px; box-shadow: none; border-width: 2px;">
                <div style="font-weight: bold; font-size: 0.9rem;">${b.title}</div>
                <div style="font-size: 0.75rem; color: var(--secondary-color);">${b.start} تا ${b.end}</div>
            </div>
        `).join('');

        dayCard.innerHTML = `
            <div class="day-header">
                <strong>${DAYS_NAMES_FA[dayKey]}</strong>
                <span style="font-size: 0.8rem; color: var(--secondary-color);">${dayBlocks.length} بازه</span>
            </div>
            <div class="day-blocks">${blocksHtml || '<div style="color: var(--secondary-color); font-size: 0.8rem; padding: 10px;">برنامه‌ای ثبت نشده</div>'}</div>
        `;
        grid.appendChild(dayCard);
    });
}

function updateTimerUI(timeStr) {
    const timerEl = document.getElementById('timer');
    if (timerEl) timerEl.textContent = timeStr;
}

function updateCurrentBlockUI(block) {
    const titleEl = document.getElementById('block-title');
    const timeEl = document.getElementById('block-time');
    const startStopBtn = document.getElementById('start-stop-btn');
    const markDoneBtn = document.getElementById('mark-done-btn');
    
    if (block) {
        titleEl.textContent = block.title;
        timeEl.textContent = `${block.start} تا ${block.end}`;
        // فعال کردن دکمه‌ها
        if (startStopBtn) startStopBtn.disabled = false;
        if (markDoneBtn) markDoneBtn.disabled = false;
    } else {
        titleEl.textContent = "بازه‌ای در این ساعت ندارید";
        timeEl.textContent = "--:-- تا --:--";
        updateTimerUI("00:00:00");
        // غیرفعال کردن دکمه‌ها
        if (startStopBtn) {
            startStopBtn.disabled = true;
            startStopBtn.textContent = 'شروع';
        }
        if (markDoneBtn) markDoneBtn.disabled = true;
    }
}

// تابع جدید برای به‌روزرسانی متن دکمه شروع/توقف
function updateStartStopButton(isRunning) {
    const btn = document.getElementById('start-stop-btn');
    if (btn) {
        btn.textContent = isRunning ? 'توقف' : 'شروع';
    }
}