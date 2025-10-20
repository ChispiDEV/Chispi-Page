import fs from 'fs-extra';
import path from 'path';

export class Logger {
    constructor(logName = 'build') {
        this.logDir = path.join(process.cwd(), 'logs');
        this.logFile = path.join(this.logDir, `${logName}-${Date.now()}.log`);
        this.ensureLogDir();
    }

    ensureLogDir() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    log(message, type = 'INFO') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${message}`;

        console.log(logEntry);
        fs.appendFileSync(this.logFile, logEntry + '\n');

        return logEntry;
    }

    info(message) {
        return this.log(`ℹ️  ${message}`);
    }

    success(message) {
        return this.log(`✅ ${message}`);
    }

    error(message) {
        return this.log(`❌ ${message}`);
    }

    warning(message) {
        return this.log(`⚠️  ${message}`);
    }

    debug(message) {
        if (process.env.DEBUG) {
            return this.log(`🐛 ${message}`);
        }
    }
}