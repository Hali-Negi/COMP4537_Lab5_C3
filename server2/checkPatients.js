const DatabaseManager = require("./modules/DatabaseManager");
const PatientRepository = require("./modules/PatientRepository");

const MESSAGES = {
    inserted: "Rows inserted:",
    patients: "Patient records:",
    error: "Patient check failed:"
};

class PatientCheck {
    async run() {
        const database = new DatabaseManager();
        const repository = new PatientRepository(database);

        try {
            const inserted = await repository.insertPatients();
            console.log(MESSAGES.inserted, inserted);

            const [rows] = await database.readerPool.query(
                "SELECT * FROM patient ORDER BY patientid"
            );

            console.log(MESSAGES.patients);
            console.table(rows);
        } finally {
            await database.close();
        }
    }
}

const check = new PatientCheck();

check.run().catch((error) => {
    console.error(MESSAGES.error, error.message);
    process.exitCode = 1;
});