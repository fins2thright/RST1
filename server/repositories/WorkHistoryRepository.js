const { sql, getPool } = require('../db/db');

class WorkHistoryRepository {
  constructor() {}

  async getWorkHistoryForResource(resourceId) {
    try {
      const p = await getPool();
      const result = await p.request().input('resourceId', sql.UniqueIdentifier, resourceId).query(`
          SELECT wh.Id, wh.ResourceId, wh.CompanyId, c.CompanyName, wh.StartDate, wh.EndDate, wh.IsCurrentAssignment, wh.CreatedAt
          FROM dbo.WorkHistory wh
          INNER JOIN dbo.Companies c ON wh.CompanyId = c.Id
          WHERE wh.ResourceId = @resourceId
          ORDER BY wh.StartDate DESC
        `);
      return result.recordset;
    } catch (err) {
      console.error('DB getWorkHistoryForResource error', err);
      throw err;
    }
  }

  async getById(id) {
    try {
      const p = await getPool();
      const result = await p.request().input('id', sql.UniqueIdentifier, id).query(`
          SELECT wh.Id, wh.ResourceId, wh.CompanyId, c.CompanyName, wh.StartDate, wh.EndDate, wh.IsCurrentAssignment, wh.CreatedAt
          FROM dbo.WorkHistory wh
          INNER JOIN dbo.Companies c ON wh.CompanyId = c.Id
          WHERE wh.Id = @id
        `);
      return result.recordset[0];
    } catch (err) {
      console.error('DB getById error', err);
      throw err;
    }
  }

  async create(workHistory) {
    try {
      const p = await getPool();
      const request = p.request();
      request.input('resourceId', sql.UniqueIdentifier, workHistory.resourceId);
      request.input('companyId', sql.UniqueIdentifier, workHistory.companyId);
      request.input('startDate', sql.Date, workHistory.startDate);
      request.input('endDate', sql.Date, workHistory.endDate || null);
      request.input('isCurrentAssignment', sql.Bit, workHistory.isCurrentAssignment ? 1 : 0);
      const insertSql = `
        INSERT INTO dbo.WorkHistory (ResourceId, CompanyId, StartDate, EndDate, IsCurrentAssignment)
        OUTPUT INSERTED.Id, INSERTED.ResourceId, INSERTED.CompanyId, INSERTED.StartDate, INSERTED.EndDate, INSERTED.IsCurrentAssignment, INSERTED.CreatedAt
        VALUES (@resourceId, @companyId, @startDate, @endDate, @isCurrentAssignment)
      `;
      const result = await request.query(insertSql);
      // Fetch company name for response
      const whResult = result.recordset[0];
      const companyResult = await p
        .request()
        .input('companyId', sql.UniqueIdentifier, workHistory.companyId)
        .query('SELECT CompanyName FROM dbo.Companies WHERE Id = @companyId');
      whResult.CompanyName = companyResult.recordset[0]?.CompanyName || '';
      return whResult;
    } catch (err) {
      console.error('DB create error', err);
      throw err;
    }
  }

  async update(id, workHistory) {
    try {
      const p = await getPool();
      const request = p.request();
      request.input('id', sql.UniqueIdentifier, id);
      request.input('companyId', sql.UniqueIdentifier, workHistory.companyId);
      request.input('startDate', sql.Date, workHistory.startDate);
      request.input('endDate', sql.Date, workHistory.endDate || null);
      request.input('isCurrentAssignment', sql.Bit, workHistory.isCurrentAssignment ? 1 : 0);
      const updateSql = `
        UPDATE dbo.WorkHistory
        SET CompanyId=@companyId, StartDate=@startDate, EndDate=@endDate, IsCurrentAssignment=@isCurrentAssignment
        OUTPUT INSERTED.Id, INSERTED.ResourceId, INSERTED.CompanyId, INSERTED.StartDate, INSERTED.EndDate, INSERTED.IsCurrentAssignment, INSERTED.CreatedAt
        WHERE Id=@id
      `;
      const result = await request.query(updateSql);
      // Fetch company name for response
      const whResult = result.recordset[0];
      if (whResult) {
        const companyResult = await p
          .request()
          .input('companyId', sql.UniqueIdentifier, workHistory.companyId)
          .query('SELECT CompanyName FROM dbo.Companies WHERE Id = @companyId');
        whResult.CompanyName = companyResult.recordset[0]?.CompanyName || '';
      }
      return whResult;
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
        'DELETE FROM dbo.WorkHistory OUTPUT DELETED.Id WHERE Id = @id'
      );
      return result.recordset[0];
    } catch (err) {
      console.error('DB delete error', err);
      throw err;
    }
  }
}

module.exports = WorkHistoryRepository;
