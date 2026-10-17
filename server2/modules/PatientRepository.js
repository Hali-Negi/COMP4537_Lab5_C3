// ChatGPT was used to assist with this code.
// https://chatgpt.com/

class PatientRepository {
    constructor(database) {
        this.database = database;
    }

    async ensureTableExists() {
        const sql = `
            CREATE TABLE IF NOT EXISTS patient (
                patientid INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100),
                dateOfBirth DATETIME
            ) ENGINE=InnoDB
        `;

        await this.database.writerPool.query(sql);
    }

    async insertPatients() {
        await this.ensureTableExists();

        const sql = `
            INSERT INTO patient (name, dateOfBirth)
            VALUES (?, ?), (?, ?), (?, ?), (?, ?)
        `;

        const values = [
            "Sara Brown", "1901-01-01",
            "John Smith", "1941-01-01",
            "Jack Ma", "1961-01-30",
            "Elon Musk", "1999-01-01"
        ];

        const [result] = await this.database.writerPool.execute(
            sql,
            values
        );

        return result.affectedRows;
    }

    // Uses the reader pool only, so the database itself
    // rejects anything that is not a SELECT.
    async selectRows(sql) {
        const [rows] = await this.database.readerPool.query(sql);

        return rows;
    }
}

module.exports = PatientRepository;