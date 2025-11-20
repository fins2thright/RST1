const { sql, getPool } = require('../db/db');

class SkillsRepository {
  constructor() {}

  async getAll() {
    try {
      const p = await getPool();
      const result = await p
        .request()
        .query('SELECT Id, SkillName, Description, CreatedAt FROM dbo.Skills ORDER BY SkillName');
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
        .query('SELECT Id, SkillName, Description, CreatedAt FROM dbo.Skills WHERE Id = @id');
      return result.recordset[0];
    } catch (err) {
      console.error('DB getById error', err);
      throw err;
    }
  }

  async create(skill) {
    try {
      const p = await getPool();
      const request = p.request();
      request.input('skillName', sql.NVarChar(150), skill.skillName);
      request.input('description', sql.NVarChar(500), skill.description || null);
      const insertSql = `INSERT INTO dbo.Skills (SkillName, Description) OUTPUT INSERTED.Id, INSERTED.SkillName, INSERTED.Description, INSERTED.CreatedAt VALUES (@skillName, @description)`;
      const result = await request.query(insertSql);
      return result.recordset[0];
    } catch (err) {
      console.error('DB create error', err);
      throw err;
    }
  }

  async update(id, skill) {
    try {
      const p = await getPool();
      const request = p.request();
      request.input('id', sql.UniqueIdentifier, id);
      request.input('skillName', sql.NVarChar(150), skill.skillName);
      request.input('description', sql.NVarChar(500), skill.description || null);
      const updateSql = `UPDATE dbo.Skills SET SkillName=@skillName, Description=@description OUTPUT INSERTED.Id, INSERTED.SkillName, INSERTED.Description, INSERTED.CreatedAt WHERE Id=@id`;
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
      const result = await request.query('DELETE FROM dbo.Skills OUTPUT DELETED.Id WHERE Id = @id');
      return result.recordset[0];
    } catch (err) {
      console.error('DB delete error', err);
      throw err;
    }
  }
}

module.exports = SkillsRepository;
