const { sql, pool } = require('../db/db');

class HumanResourceRepository {
  constructor() {}

  async getAll() {
    try {
      const p = await pool;
      const result = await p.request().query('SELECT Id, FirstName, LastName, Email, Position, CreatedAt FROM dbo.HumanResources');
      return result.recordset;
    } catch (err) {
      console.error('DB getAll error', err);
      throw err;
    }
  }

  async getById(id) {
    try {
      const p = await pool;
      const result = await p.request().input('id', sql.UniqueIdentifier, id).query('SELECT Id, FirstName, LastName, Email, Position, CreatedAt FROM dbo.HumanResources WHERE Id = @id');
      return result.recordset[0];
    } catch (err) {
      console.error('DB getById error', err);
      throw err;
    }
  }

  async create(h) {
    try {
      const p = await pool;
      const request = p.request();
      request.input('firstName', sql.NVarChar(100), h.firstName);
      request.input('lastName', sql.NVarChar(100), h.lastName);
      request.input('email', sql.NVarChar(255), h.email || null);
      request.input('position', sql.NVarChar(150), h.position || null);
      const insertSql = `INSERT INTO dbo.HumanResources (FirstName, LastName, Email, Position) OUTPUT INSERTED.Id, INSERTED.FirstName, INSERTED.LastName, INSERTED.Email, INSERTED.Position, INSERTED.CreatedAt VALUES (@firstName, @lastName, @email, @position)`;
      const result = await request.query(insertSql);
      return result.recordset[0];
    } catch (err) {
      console.error('DB create error', err);
      throw err;
    }
  }

  async update(id, h) {
    try {
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
    } catch (err) {
      console.error('DB update error', err);
      throw err;
    }
  }

  async delete(id) {
    try {
      const p = await pool;
      const request = p.request();
      request.input('id', sql.UniqueIdentifier, id);
      const result = await request.query('DELETE FROM dbo.HumanResources OUTPUT DELETED.Id WHERE Id = @id');
      return result.recordset[0];
    } catch (err) {
      console.error('DB delete error', err);
      throw err;
    }
  }
}

module.exports = HumanResourceRepository;
