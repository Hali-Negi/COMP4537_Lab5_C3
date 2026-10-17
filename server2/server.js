const DatabaseManager = require("./modules/DatabaseManager");
const PatientRepository = require("./modules/PatientRepository");
const ApiServer = require("./modules/ApiServer");

const port = Number(process.env.PORT || 3000);

const database = new DatabaseManager();
const repository = new PatientRepository(database);
const api = new ApiServer(repository, port);

api.start();