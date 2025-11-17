const { sql, pool } = require('../db/db');

class HumanResourceRepository {
  constructor() {}

  async getAll() {
    const p = await pool;
    const result = await p.request().query('SELECT Id, FirstName, LastName, Email, Position, CreatedAt FROM dbo.HumanResources');
    return result.recordset;
  }

  async getById(id) {
    const p = await pool;
    const result = await p.request().input('id', sql.UniqueIdentifier, id).query('SELECT Id, FirstName, LastName, Email, Position, CreatedAt FROM dbo.HumanResources WHERE Id = @id');
    return result.recordset[0];
  }

  async create(h) {
    const p = await pool;
    const request = p.request();
    // Allow DB to generate Id via DEFAULT NEWID() if not provided
    request.input('firstName', sql.NVarChar(100), h.firstName);
    request.input('lastName', sql.NVarChar(100), h.lastName);
    request.input('email', sql.NVarChar(255), h.email || null);
    request.input('position', sql.NVarChar(150), h.position || null);
    const insertSql = `INSERT INTO dbo.HumanResources (FirstName, LastName, Email, Position) OUTPUT INSERTED.Id, INSERTED.FirstName, INSERTED.LastName, INSERTED.Email, INSERTED.Position, INSERTED.CreatedAt VALUES (@firstName, @lastName, @email, @position)`;
    const result = await request.query(insertSql);
    return result.recordset[0];
  }

  async update(id, h) {
    const p = await pool;
    const request = p.request();
    request.input('id', sql.UniqueIdentifier, id);
    request.input('firstName', sql.NVarChar(100), h.firstName);
    request.input('lastName', sql.NVarChar(100), h.lastName);
    request.input('email', sql.NVarChar(255), h.email || null);
    request.input('position', sql.NVarChar(150), h.position || null);
    const updateSql = `UPDATE dbo.HumanResources SET FirstName=@firstName, LastName=@lastName, Email=@email, Position=@position OUTPUT INSERTED.Id, INSERTED.FirstName, INSERTED.LastName, INSERTED.Email, INSERTED.Position, INSERTED.CreatedAt WHERE Id=@id`;
    const result = await request.query(updateSql);
    return result.recordset[0];
  }

  async delete(id) {
    const p = await pool;
    const request = p.request();
    request.input('id', sql.UniqueIdentifier, id);
    const result = await request.query('DELETE FROM dbo.HumanResources OUTPUT DELETED.Id WHERE Id = @id');
    return result.recordset[0];
  }
}

module.exports = HumanResourceRepository;
