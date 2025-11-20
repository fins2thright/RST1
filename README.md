# RST1 (Vite + React)

This project is a minimal Vite + React scaffold.

Local SQL Server LocalDB
- Database name: `RSTdb1`
- Database files: `db\RSTdb1.mdf` and `db\RSTdb1_log.ldf`

Connection string (Windows, integrated auth):

`Server=(localdb)\\MSSQLLocalDB; Database=RSTdb1; Trusted_Connection=True;`

Verify the database using `sqlcmd`:

```powershell
sqlcmd -S "(localdb)\\MSSQLLocalDB" -Q "SELECT name,database_id FROM sys.databases WHERE name='RSTdb1'"
```

If you don't have LocalDB or `sqlcmd` installed, install SQL Server Express LocalDB and the SQL Server command-line utilities. Alternatively, open Visual Studio's "SQL Server Object Explorer" and connect to `(localdb)\\MSSQLLocalDB`.

Client and Server
- Client (Vite + React): run from project root

```powershell
npm install
npm run dev
```

- Server (Human-Resource microservice):

```powershell
cd server
npm install
npm run dev
```

By default the client expects the API at `http://localhost:4000`. You can change `VITE_API_BASE` in an `.env` file at project root.
