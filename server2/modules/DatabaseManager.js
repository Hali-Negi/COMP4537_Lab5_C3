

const mysql = require("mysql2/promise");

class DatabaseManager {
    constructor() {
        const settings = {
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            database: process.env.DB_NAME,
            multipleStatements: false
        };

        this.readerPool = mysql.createPool({
            ...settings,
            user: process.env.DB_READER_USER,
            password: process.env.DB_READER_PASSWORD
        });

        this.writerPool = mysql.createPool({
            ...settings,
            user: process.env.DB_WRITER_USER,
            password: process.env.DB_WRITER_PASSWORD
        });
    }

    async close() {
        await Promise.all([
            this.readerPool.end(),
            this.writerPool.end()
        ]);
    }
}

module.exports = DatabaseManager;