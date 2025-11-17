# Human-Resource microservice

Simple Express microservice exposing CRUD for Human-Resource entities.

Prerequisites
- Node.js (16+)
- Access to SQL Server LocalDB with database `RSTdb1` (created in project `db` folder)

Install and run

```powershell
cd server
npm install
# start in dev mode (requires nodemon)
npm run dev
```

Configuration
- The service reads the database connection from environment variable `DB_CONNECTION`.
- If not provided, it falls back to `Server=(localdb)\\MSSQLLocalDB;Database=RSTdb1;Trusted_Connection=True;`.

Endpoints
- `GET /human-resources` - list all
- `GET /human-resources/:id` - get single resource
- `POST /human-resources` - create (body: `firstName`, `lastName`, `email`, `position`)
- `PUT /human-resources/:id` - update
- `DELETE /human-resources/:id` - delete

Notes about SQL Server connectivity
- On Windows, to use integrated auth with `mssql`, you may need to install the `msnodesqlv8` driver and adjust the connection. If you get auth errors, install `msnodesqlv8` or provide a SQL authenticated user.
