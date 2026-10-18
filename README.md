# COMP4537 Lab 5 – C3

A two-server patient database application.

## Project structure

- `server1/`: OOP client with Insert and SQL query controls.
- `server2/`: Node.js HTTP API and MySQL database access.

## Assignment constraints

- Use an object-oriented structure.
- Do not use Express, routing libraries, or jQuery.
- Use GET requests for SQL queries and POST requests for patient insertion.
- Keep user-facing messages in a separate language file.
- Host the client and API on different origins using HTTPS.
- Use a SELECT-only database account for user-submitted queries.

## Backend implementation completed

- `DatabaseManager`: Creates separate reader and writer connection pools.
- `PatientRepository`: Creates the patient table if missing and inserts four patients.
- `ApiServer`: Handles HTTP requests, CORS, POST insertion, and GET SQL queries.
- `modules/lang/en.js`: Stores server messages.
- `server.js`: Creates the objects and starts the API.
- `checkDatabase.js`: Checks both database account connections.
- `checkPatients.js`: Tests table creation, insertion, and reading.

## Database

Database name: `comp4537_lab5`

Table: `patient`

| Column | Type | Details |
|---|---|---|
| patientid | INT | AUTO_INCREMENT PRIMARY KEY |
| name | VARCHAR(100) | Patient name |
| dateOfBirth | DATETIME | Patient birth date |

The table uses InnoDB.

Each insertion adds these four records:

| Name | Date of birth |
|---|---|
| Sara Brown | 1901-01-01 |
| John Smith | 1941-01-01 |
| Jack Ma | 1961-01-30 |
| Elon Musk | 1999-01-01 |

Before each insertion, the application runs
`CREATE TABLE IF NOT EXISTS patient`.

Repeated insertions add another set of four records.

## Database accounts

| Account | Permissions on comp4537_lab5 |
|---|---|
| lab5_reader | SELECT |
| lab5_writer | CREATE, INSERT |

The application does not use the administrator account.

## Remote database and SSL

The backend has been tested against Aiven MySQL.

Both connection pools use the CA certificate at:

`server2/certs/ca.pem`

Certificate verification is enabled with
`rejectUnauthorized: true`.

Passwords are stored in `server2/.env`, which is ignored by Git.
The CA certificate contains public certificate material.

## Backend setup

### 1. Install dependencies

From the repository root:

```bash
cd server2
npm ci
```

### 2. Configure environment variables

Create `server2/.env` with the following values, replacing the
placeholders with your database connection details:

```env
DB_HOST=YOUR_AIVEN_HOST
DB_PORT=YOUR_AIVEN_PORT
DB_NAME=comp4537_lab5

DB_READER_USER=lab5_reader
DB_READER_PASSWORD="YOUR_READER_PASSWORD"

DB_WRITER_USER=lab5_writer
DB_WRITER_PASSWORD="YOUR_WRITER_PASSWORD"

PORT=3000
```

Use the passwords for the remote Aiven users.
Do not commit `.env`.

### 3. Provide the CA certificate

Ensure the certificate for the Aiven service is saved at:

`server2/certs/ca.pem`

### 4. Check database connections

Run from `server2`:

```bash
node --env-file=.env checkDatabase.js
```

Successful remote connections display:

```text
Reader connected: lab5_reader@%
Writer connected: lab5_writer@%
```

### 5. Test patient insertion directly

```bash
node --env-file=.env checkPatients.js
```

This creates the table if missing, inserts four patients,
and reads the records using the reader account.

Each run inserts another four records.

### 6. Start the API

```bash
node --env-file=.env server.js
```

Expected startup message:

```text
API server listening on port 3000
```

## POST endpoint

```text
POST /lab5/api/v1/patients
```

While the API is running, use a second terminal:

```bash
curl -i -X POST http://localhost:3000/lab5/api/v1/patients
```

Expected status: `201 Created`

Expected response:

```json
{
  "message": "Four patient records were inserted.",
  "insertedRows": 4
}
```

The API supports local testing and is deployed on Render, connecting
to the remote Aiven database using SSL.

## Verification completed

- Local reader and writer database connections succeeded.
- Remote reader and writer connections succeeded using SSL.
- Direct remote insertion added four patients with the correct
  names and birth dates.
- The POST API returned `201 Created` and inserted four additional
  patients into the remote database.
- The remote reader successfully selected all eight records.
- DELETE was denied for the remote reader with Error 1142.
- UPDATE was denied for the remote reader with Error 1142.
- CREATE was denied for the remote reader with Error 1142.
- DROP was denied for the remote reader with Error 1142.
- Confirmed that `server2/.env` is ignored by Git.

## Client and GET verification completed

- GET SQL endpoint executes queries using the reader pool.
- Browser SELECT successfully displayed patient records.
- Each Insert click added four records: totals increased from 12 to 16 to 20.
- DELETE through the GET API and browser was denied by MySQL.
- Empty queries displayed "No SQL query was provided."
- Queries against a missing table displayed the database error.

## Hosted application

- Client: https://comp4537-lab5-c3-client.onrender.com
- API: https://comp4537-lab5-c3-api.onrender.com
- Sample GET: https://comp4537-lab5-c3-api.onrender.com/lab5/api/v1/sql/SELECT%20%2A%20FROM%20patient

Both services are deployed from the main branch on Render.
The client uses the hosted HTTPS API URL.

## GET endpoint

GET /lab5/api/v1/sql/<URL-encoded SQL>

Queries execute through the SELECT-only reader account.
Successful queries return HTTP 200 with a JSON result.
SQL errors, including denied database commands, return HTTP 400.

## Hosted verification completed

- Client successfully queried the API on a different HTTPS origin.
- Insert increased the patient count from 20 to 24.
- MySQL denied DELETE through the hosted client using lab5_reader.
- Table recreation passed: the original patient table was temporarily
  renamed, and Insert recreated patient with the four correct records.
- The original patient table was restored and verified to contain 24 records.
- The four recreation-test records were preserved separately in
  patient_recreation_test.
