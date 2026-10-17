# COMP4537 Lab 5 – C3

A two-server patient database application.

## Project structure

- `server1/`: Client application — pending.
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
- `ApiServer`: Handles HTTP requests, CORS, and the POST endpoint.
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

The API currently runs locally for testing while connecting
to the remote database.

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

## Remaining work

- Implement the client in `server1`.
- Implement the GET SQL query endpoint using the reader pool.
- Connect the client controls to the API.
- Verify rejected SQL through the GET API and client.
- Verify repeated insertion through the client.
- Test table recreation after the patient table is removed
  in a controlled test.
- Deploy the client and API to different HTTPS origins.
- Test the deployed application end to end.
- Review all code against the instructor's requirements.
- Prepare the required C3Lab5 submission ZIP containing
  server1 and server2.
- Provide the client URL and encoded sample GET query URL
  in the LearningHub submission comments.
- Complete the required AI disclosure and prepare for marking.