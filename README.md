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
