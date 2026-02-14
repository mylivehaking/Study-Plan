let currentActiveBlock = null;
let appTimer = null;

document.addEventListener('DOMContentLoaded', () => {
    // اعمال تم ذخیره شده به محض لود شدن هر صفحه
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
    }
    
    initApp();
});

function initApp() {
    const path = window.location.pathname;
    
    if (path.includes('index.html') || path === '/') {
        setupTodayPage();
    } else if (path.includes('weekly.html')) {
        renderWeeklyPage();
    } else if (path.includes('settings.html')) {
        setupSettingsPage();
    }
}

function setupTodayPage() {
    const todaySchedule = dataManager.getTodaySchedule();
    renderTodayPage(todaySchedule);
    
    findAndDisplayCurrentBlock(todaySchedule);
    
    // نمایش زمان باقی‌مانده برای بلاک فعلی (اگر وجود داشته باشد)
    if (currentActiveBlock) {
        const remainingSeconds = Timer.getSecondsBetween(currentActiveBlock.start, currentActiveBlock.end);
        updateTimerUI(new Timer(()=>{}, ()=>{}).formatTime(remainingSeconds));
        
        // چک کردن وضعیت تایمر از حافظه
        const isRunning = localStorage.getItem('timer_running') === 'true';
        const savedEndTime = localStorage.getItem('timer_end_time');
        const runningBlockId = localStorage.getItem('running_block_id');
        
        if (isRunning && runningBlockId == currentActiveBlock.id && savedEndTime) {
            const endTime = parseInt(savedEndTime);
            if (endTime > Date.now()) {
                resumeTimerForBlock(currentActiveBlock, endTime);
            } else {
                // زمان در زمانی که اپ بسته بوده تمام شده
                markBlockAsDone(currentActiveBlock.id);
            }
        }
    }

    const startBtn = document.getElementById('start-stop-btn');
    const doneBtn = document.getElementById('mark-done-btn');

    startBtn.addEventListener('click', () => {
        if (!currentActiveBlock) return;
        
        if (appTimer && appTimer.interval) {
            // تایمر در حال اجراست → متوقفش کن
            appTimer.stop();
            appTimer = null;
            updateStartStopButton(false);
            localStorage.setItem('timer_running', 'false');
            localStorage.removeItem('timer_end_time');
        } else {
            // تایمر را شروع کن
            startTimerForBlock(currentActiveBlock);
        }
    });

    doneBtn.addEventListener('click', () => {
        if (currentActiveBlock) {
            markBlockAsDone(currentActiveBlock.id);
        }
    });
}

function findAndDisplayCurrentBlock(schedule) {
    // برای تست: ساعت 13:00
    const currentTime = 13 * 60 + 0; 

    currentActiveBlock = schedule.find(block => {
        const [startH, startM] = block.start.split(':').map(Number);
        const [endH, endM] = block.end.split(':').map(Number);
        const startTime = startH * 60 + startM;
        const endTime = endH * 60 + endM;
        
        return currentTime >= startTime && currentTime < endTime && !block.done;
    });

    updateCurrentBlockUI(currentActiveBlock);
}

function startTimerForBlock(block) {
    const seconds = Timer.getSecondsBetween(block.start, block.end);
    
    appTimer = new Timer(
        (timeStr) => updateTimerUI(timeStr),
        () => {
            markBlockAsDone(block.id);
            sendNotification(`زمان بازه "${block.title}" به پایان رسید!`);
        }
    );
    
    appTimer.start(seconds);
    updateStartStopButton(true);
    localStorage.setItem('timer_running', 'true');
    localStorage.setItem('running_block_id', block.id);
    localStorage.setItem('timer_end_time', appTimer.endTime.toString());
}

function resumeTimerForBlock(block, endTime) {
    appTimer = new Timer(
        (timeStr) => updateTimerUI(timeStr),
        () => {
            markBlockAsDone(block.id);
            sendNotification(`زمان بازه "${block.title}" به پایان رسید!`);
        }
    );
    
    appTimer.resume(endTime);
    updateStartStopButton(true);
}

function markBlockAsDone(blockId) {
    const dayIndex = 0; // حالت تست
    const dayKey = DAYS_FA[dayIndex];
    
    dataManager.markAsDone(dayKey, blockId);
    
    if (appTimer) {
        appTimer.stop();
        appTimer = null;
    }
    localStorage.setItem('timer_running', 'false');
    localStorage.removeItem('running_block_id');
    localStorage.removeItem('timer_end_time');
    
    // Refresh UI
    const todaySchedule = dataManager.getTodaySchedule();
    renderTodayPage(todaySchedule);
    findAndDisplayCurrentBlock(todaySchedule);
    
    // اگر بلاک جدیدی فعال شد، زمان آن را نمایش بده و نوتیفیکیشن بفرست
    if (currentActiveBlock) {
        const remainingSeconds = Timer.getSecondsBetween(currentActiveBlock.start, currentActiveBlock.end);
        updateTimerUI(new Timer(()=>{}, ()=>{}).formatTime(remainingSeconds));
        sendNotification(`بازه بعدی شروع شد: "${currentActiveBlock.title}"`);
    }
    
    updateStartStopButton(false);
}

function sendNotification(message) {
    const enabled = localStorage.getItem('notifications') === 'true';
    if (!enabled) return;

    if (Notification.permission === "granted") {
        new Notification("Today Plan", { body: message, icon: 'assets/icons/icon.png' });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification("Today Plan", { body: message, icon: 'assets/icons/icon.png' });
            }
        });
    }
}

function setupSettingsPage() {
    const notifToggle = document.getElementById('notif-toggle');
    const themeToggle = document.getElementById('theme-toggle');
    const resetBtn = document.getElementById('reset-data');

    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        if (themeToggle) themeToggle.checked = true;
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.body.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
        });
    }

    const savedNotif = localStorage.getItem('notifications') === 'true';
    if (notifToggle) {
        notifToggle.checked = savedNotif;
        notifToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        localStorage.setItem('notifications', 'true');
                    } else {
                        e.target.checked = false;
                        localStorage.setItem('notifications', 'false');
                        alert('برای دریافت اعلان، باید اجازه دسترسی بدهید.');
                    }
                });
            } else {
                localStorage.setItem('notifications', 'false');
            }
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('آیا از پاک کردن تمام داده‌ها اطمینان دارید؟')) {
                dataManager.resetData();
                alert('داده‌ها ریست شدند.');
                window.location.reload();
            }
        });
    }
}