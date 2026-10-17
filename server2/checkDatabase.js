

const DatabaseManager = require("./modules/DatabaseManager");

const MESSAGES = {
    reader: "Reader connected:",
    writer: "Writer connected:",
    error: "Database connection failed:"
};

class DatabaseConnectionCheck {
    async run() {
        const database = new DatabaseManager();

        try {
            const [readerRows] = await database.readerPool.query(
                "SELECT CURRENT_USER() AS account"
            );

            const [writerRows] = await database.writerPool.query(
                "SELECT CURRENT_USER() AS account"
            );

            console.log(MESSAGES.reader, readerRows[0].account);
            console.log(MESSAGES.writer, writerRows[0].account);
        } finally {
            await database.close();
        }
    }
}

const check = new DatabaseConnectionCheck();

check.run().catch((error) => {
    console.error(MESSAGES.error, error.message);
    process.exitCode = 1;
});