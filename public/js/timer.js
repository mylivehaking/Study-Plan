class Timer {
    constructor(onTick, onEnd) {
        this.onTick = onTick;
        this.onEnd = onEnd;
        this.interval = null;
        this.endTime = null;
    }

    start(seconds) {
        this.stop();
        // محاسبه زمان دقیق پایان بر اساس Timestamp فعلی
        this.endTime = Date.now() + (seconds * 1000);
        
        this.interval = setInterval(() => {
            const remaining = Math.max(0, Math.floor((this.endTime - Date.now()) / 1000));
            this.onTick(this.formatTime(remaining));
            
            if (remaining <= 0) {
                this.stop();
                this.onEnd();
            }
        }, 1000);
    }

    resume(endTimeTimestamp) {
        this.stop();
        this.endTime = endTimeTimestamp;
        
        const initialRemaining = Math.max(0, Math.floor((this.endTime - Date.now()) / 1000));
        this.onTick(this.formatTime(initialRemaining));

        this.interval = setInterval(() => {
            const remaining = Math.max(0, Math.floor((this.endTime - Date.now()) / 1000));
            this.onTick(this.formatTime(remaining));
            
            if (remaining <= 0) {
                this.stop();
                this.onEnd();
            }
        }, 1000);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    formatTime(totalSeconds) {
        if (totalSeconds < 0) return "00:00:00";
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
    }

    static getSecondsBetween(startTimeStr, endTimeStr) {
        const now = new Date();

        const [endH, endM] = endTimeStr.split(':').map(Number);

        const endDate = new Date(now);
        endDate.setHours(endH, endM, 0, 0);

        if (endDate.getTime() <= now.getTime()) {
            endDate.setDate(endDate.getDate() + 1);
        }

        const diff = endDate.getTime() - now.getTime();
        return Math.max(0, Math.floor(diff / 1000));
    }
}
