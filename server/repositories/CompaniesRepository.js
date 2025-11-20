const { sql, getPool } = require('../db/db');

class CompaniesRepository {
  constructor() {}

  async getAll() {
    try {
      const p = await getPool();
      const result = await p
        .request()
        .query(
          'SELECT Id, CompanyName, Description, CreatedAt FROM dbo.Companies ORDER BY CompanyName'
        );
      return result.recordset;
    } catch (err) {
      console.error('DB getAll error', err);
      throw err;
    }
  }

  async getById(id) {
    try {
      const p = await getPool();
      const result = await p
        .request()
        .input('id', sql.UniqueIdentifier, id)
        .query('SELECT Id, CompanyName, Description, CreatedAt FROM dbo.Companies WHERE Id = @id');
      return result.recordset[0];
    } catch (err) {
      console.error('DB getById error', err);
      throw err;
    }
  }

  async create(company) {
    try {
      const p = await getPool();
      const request = p.request();
      request.input('companyName', sql.NVarChar(200), company.companyName);
      request.input('description', sql.NVarChar(500), company.description || null);
      const insertSql = `INSERT INTO dbo.Companies (CompanyName, Description) OUTPUT INSERTED.Id, INSERTED.CompanyName, INSERTED.Description, INSERTED.CreatedAt VALUES (@companyName, @description)`;
      const result = await request.query(insertSql);
      return result.recordset[0];
    } catch (err) {
      console.error('DB create error', err);
      throw err;
    }
  }

  async update(id, company) {
    try {
      const p = await getPool();
      const request = p.request();
      request.input('id', sql.UniqueIdentifier, id);
      request.input('companyName', sql.NVarChar(200), company.companyName);
      request.input('description', sql.NVarChar(500), company.description || null);
      const updateSql = `UPDATE dbo.Companies SET CompanyName=@companyName, Description=@description OUTPUT INSERTED.Id, INSERTED.CompanyName, INSERTED.Description, INSERTED.CreatedAt WHERE Id=@id`;
      const result = await request.query(updateSql);
      return result.recordset[0];
    } catch (err) {
      console.error('DB update error', err);
      throw err;
    }
  }

  async delete(id) {
    try {
      const p = await getPool();
      const request = p.request();
      request.input('id', sql.UniqueIdentifier, id);
      const result = await request.query(
        'DELETE FROM dbo.Companies OUTPUT DELETED.Id WHERE Id = @id'
      );
      return result.recordset[0];
    } catch (err) {
      console.error('DB delete error', err);
      throw err;
    }
  }
}

module.exports = CompaniesRepository;
