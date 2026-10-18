const http = require("node:http");
const MESSAGES = require("./lang/en");

const INSERT_PATH = "/lab5/api/v1/patients";
const QUERY_PATH = "/lab5/api/v1/sql";

class ApiServer {
    constructor(repository, port) {
        this.repository = repository;
        this.port = port;

        this.server = http.createServer((request, response) => {
            this.handleRequest(request, response).catch((error) => {
                console.error(MESSAGES.serverError, error.code);

                this.sendJson(response, 500, {
                    message: MESSAGES.serverError
                });
            });
        });
    }

    sendJson(response, statusCode, data) {
        response.writeHead(statusCode, {
            "Content-Type": "application/json; charset=utf-8"
        });

        response.end(JSON.stringify(data));
    }

    async handleRequest(request, response) {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader(
            "Access-Control-Allow-Methods",
            "GET, POST, OPTIONS"
        );
        response.setHeader(
            "Access-Control-Allow-Headers",
            "Content-Type"
        );

        const url = new URL(request.url, "http://localhost");

        if (
            url.pathname === QUERY_PATH ||
            url.pathname.startsWith(`${QUERY_PATH}/`)
        ) {
            await this.handleQuery(request, response, url);
            return;
        }

        if (url.pathname !== INSERT_PATH) {
            this.sendJson(response, 404, {
                message: MESSAGES.notFound
            });
            return;
        }

        if (request.method === "OPTIONS") {
            response.writeHead(204);
            response.end();
            return;
        }

        if (request.method !== "POST") {
            response.setHeader("Allow", "POST, OPTIONS");

            this.sendJson(response, 405, {
                message: MESSAGES.methodNotAllowed
            });
            return;
        }

        try {
            const insertedRows = await this.repository.insertPatients();

            this.sendJson(response, 201, {
                message: MESSAGES.insertSuccess,
                insertedRows: insertedRows
            });
        } catch (error) {
            console.error(MESSAGES.insertFailed, error.code);

            this.sendJson(response, 500, {
                message: MESSAGES.insertFailed
            });
        }
    }

    getSql(url) {
        let sql = decodeURIComponent(
            url.pathname.slice(QUERY_PATH.length + 1)
        );

        if (sql.length > 1 && sql.startsWith("\"") && sql.endsWith("\"")) {
            sql = sql.slice(1, -1);
        }

        return sql;
    }

    async handleQuery(request, response, url) {
        if (request.method === "OPTIONS") {
            response.writeHead(204);
            response.end();
            return;
        }

        if (request.method !== "GET") {
            response.setHeader("Allow", "GET, OPTIONS");

            this.sendJson(response, 405, {
                message: MESSAGES.methodNotAllowed
            });
            return;
        }

        let sql;

        try {
            sql = this.getSql(url);
        } catch (error) {
            this.sendJson(response, 400, {
                message: MESSAGES.badQueryEncoding
            });
            return;
        }

        if (sql.trim() === "") {
            this.sendJson(response, 400, {
                message: MESSAGES.missingQuery
            });
            return;
        }

        try {
            const rows = await this.repository.selectRows(sql);

            this.sendJson(response, 200, rows);
        } catch (error) {
            console.error(MESSAGES.queryFailed, error.code);

            if (error.sqlMessage) {
                this.sendJson(response, 400, {
                    message: MESSAGES.queryFailed,
                    error: error.sqlMessage
                });
                return;
            }

            this.sendJson(response, 500, {
                message: MESSAGES.serverError
            });
        }
    }

    start() {
        this.server.listen(this.port, () => {
            console.log(MESSAGES.serverStarted, this.port);
        });
    }
}

module.exports = ApiServer;