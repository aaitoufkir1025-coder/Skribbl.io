class TaskScheduler {
    constructor(maxWorkers = 4) {
        this.queue = [];
        this.workers = [];
        this.maxWorkers = maxWorkers;
        this.running = false;
    }

    addTask(task, priority = 0) {
        this.queue.push({ task, priority, id: Math.random() });
        this.queue.sort((a, b) => b.priority - a.priority);
        if (!this.running) this.process();
    }

    async process() {
        this.running = true;
        while (this.queue.length > 0 || this.workers.length > 0) {
            while (this.workers.length < this.maxWorkers && this.queue.length > 0) {
                const { task, id } = this.queue.shift();
                const worker = this.executeTask(task, id);
                this.workers.push(worker);
            }
            if (this.workers.length > 0) {
                await Promise.race(this.workers);
                this.workers = this.workers.filter(w => !w.done);
            }
        }
        this.running = false;
    }

    async executeTask(task, id) {
        try {
            await task();
        } catch (err) {
            console.error(`Task ${id} failed:`, err);
        }
        return { done: true };
    }

    getQueueSize() {
        return this.queue.length;
    }

    getActiveWorkers() {
        return this.workers.length;
    }

    clearQueue() {
        this.queue = [];
    }

    pause() {
        this.running = false;
    }

    getStatus() {
        return {
            queued: this.queue.length,
            active: this.workers.length,
            isRunning: this.running,
            maxWorkers: this.maxWorkers
        };
    }
}

// TaskMonitor class for tracking task execution
class TaskMonitor {
    constructor() {
        this.executedTasks = [];
        this.failedTasks = [];
        this.totalExecutionTime = 0;
    }

    recordExecution(taskId, duration, success = true) {
        const record = {
            id: taskId,
            timestamp: new Date(),
            duration,
            success
        };
        if (success) {
            this.executedTasks.push(record);
        } else {
            this.failedTasks.push(record);
        }
        this.totalExecutionTime += duration;
    }

    getAverageExecutionTime() {
        if (this.executedTasks.length === 0) return 0;
        return this.totalExecutionTime / this.executedTasks.length;
    }

    getSuccessRate() {
        const total = this.executedTasks.length + this.failedTasks.length;
        if (total === 0) return 0;
        return (this.executedTasks.length / total) * 100;
    }

    printReport() {
        console.log('=== Task Execution Report ===');
        console.log(`Total Executed: ${this.executedTasks.length}`);
        console.log(`Total Failed: ${this.failedTasks.length}`);
        console.log(`Success Rate: ${this.getSuccessRate().toFixed(2)}%`);
        console.log(`Avg Execution Time: ${this.getAverageExecutionTime().toFixed(2)}ms`);
    }
}

// Advanced scheduler with monitoring
class AdvancedScheduler extends TaskScheduler {
    constructor(maxWorkers = 4) {
        super(maxWorkers);
        this.monitor = new TaskMonitor();
        this.retryPolicy = { maxRetries: 3, backoffMultiplier: 2 };
    }

    setRetryPolicy(maxRetries, backoffMultiplier) {
        this.retryPolicy = { maxRetries, backoffMultiplier };
    }

    async executeTaskWithRetry(task, id, attempt = 1) {
        const startTime = Date.now();
        try {
            await task();
            const duration = Date.now() - startTime;
            this.monitor.recordExecution(id, duration, true);
        } catch (err) {
            const duration = Date.now() - startTime;
            if (attempt <= this.retryPolicy.maxRetries) {
                const delay = Math.pow(this.retryPolicy.backoffMultiplier, attempt) * 1000;
                console.log(`Task ${id} failed, retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.executeTaskWithRetry(task, id, attempt + 1);
            } else {
                console.error(`Task ${id} failed after ${attempt - 1} retries:`, err);
                this.monitor.recordExecution(id, duration, false);
            }
        }
        return { done: true };
    }

    getSchedulerReport() {
        return {
            status: this.getStatus(),
            performance: {
                avgTime: this.monitor.getAverageExecutionTime(),
                successRate: this.monitor.getSuccessRate(),
                totalExecuted: this.monitor.executedTasks.length,
                totalFailed: this.monitor.failedTasks.length
            }
        };
    }
}

// Usage example
const scheduler = new AdvancedScheduler(2);
scheduler.addTask(() => console.log('High priority'), 10);
scheduler.addTask(() => console.log('Low priority'), 1);
scheduler.setRetryPolicy(2, 1.5);

// Example with async tasks
scheduler.addTask(async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('Task completed');
}, 5);