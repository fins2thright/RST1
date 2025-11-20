const { sql, getPool } = require('../db/db');

class ResourceSkillsRepository {
  constructor() {}

  async getSkillsForResource(resourceId) {
    try {
      const p = await getPool();
      const result = await p.request().input('resourceId', sql.UniqueIdentifier, resourceId).query(`
          SELECT rs.Id, rs.ResourceId, rs.SkillId, s.SkillName, s.Description, rs.ProficiencyLevel, rs.CreatedAt
          FROM dbo.ResourceSkills rs
          INNER JOIN dbo.Skills s ON rs.SkillId = s.Id
          WHERE rs.ResourceId = @resourceId
          ORDER BY s.SkillName
        `);
      return result.recordset;
    } catch (err) {
      console.error('DB getSkillsForResource error', err);
      throw err;
    }
  }

  async addSkillToResource(resourceId, skillId, proficiencyLevel = 'Intermediate') {
    try {
      const p = await getPool();

      // Verify resource exists
      let resourceCheck = await p
        .request()
        .input('resourceId', sql.UniqueIdentifier, resourceId)
        .query('SELECT Id FROM dbo.HumanResources WHERE Id = @resourceId');
      if (!resourceCheck.recordset[0]) {
        throw new Error('Resource not found');
      }

      // Verify skill exists - create new request to clear previous inputs
      let skillCheck = await p
        .request()
        .input('skillId', sql.UniqueIdentifier, skillId)
        .query('SELECT Id FROM dbo.Skills WHERE Id = @skillId');
      if (!skillCheck.recordset[0]) {
        throw new Error('Skill not found');
      }

      // Check if skill already assigned - create new request
      let duplicateCheck = await p
        .request()
        .input('resourceId', sql.UniqueIdentifier, resourceId)
        .input('skillId', sql.UniqueIdentifier, skillId)
        .query(
          'SELECT Id FROM dbo.ResourceSkills WHERE ResourceId = @resourceId AND SkillId = @skillId'
        );
      if (duplicateCheck.recordset[0]) {
        throw new Error('This skill is already assigned to this resource');
      }

      // Create new request for insert - fresh inputs
      const request = p.request();
      request.input('resourceId', sql.UniqueIdentifier, resourceId);
      request.input('skillId', sql.UniqueIdentifier, skillId);
      request.input('proficiencyLevel', sql.NVarChar(50), proficiencyLevel);
      const insertSql = `
        INSERT INTO dbo.ResourceSkills (ResourceId, SkillId, ProficiencyLevel)
        OUTPUT INSERTED.Id, INSERTED.ResourceId, INSERTED.SkillId, INSERTED.ProficiencyLevel, INSERTED.CreatedAt
        VALUES (@resourceId, @skillId, @proficiencyLevel)
      `;
      const result = await request.query(insertSql);
      return result.recordset[0];
    } catch (err) {
      console.error('DB addSkillToResource error', err);
      throw err;
    }
  }

  async removeSkillFromResource(resourceId, skillId) {
    try {
      const p = await getPool();
      const request = p.request();
      request.input('resourceId', sql.UniqueIdentifier, resourceId);
      request.input('skillId', sql.UniqueIdentifier, skillId);
      const deleteSql = `
        DELETE FROM dbo.ResourceSkills
        OUTPUT DELETED.Id
        WHERE ResourceId = @resourceId AND SkillId = @skillId
      `;
      const result = await request.query(deleteSql);
      return result.recordset[0];
    } catch (err) {
      console.error('DB removeSkillFromResource error', err);
      throw err;
    }
  }

  async updateProficiencyLevel(resourceId, skillId, proficiencyLevel) {
    try {
      const p = await getPool();
      const request = p.request();
      request.input('resourceId', sql.UniqueIdentifier, resourceId);
      request.input('skillId', sql.UniqueIdentifier, skillId);
      request.input('proficiencyLevel', sql.NVarChar(50), proficiencyLevel);
      const updateSql = `
        UPDATE dbo.ResourceSkills
        SET ProficiencyLevel = @proficiencyLevel
        OUTPUT INSERTED.Id, INSERTED.ResourceId, INSERTED.SkillId, INSERTED.ProficiencyLevel, INSERTED.CreatedAt
        WHERE ResourceId = @resourceId AND SkillId = @skillId
      `;
      const result = await request.query(updateSql);
      return result.recordset[0];
    } catch (err) {
      console.error('DB updateProficiencyLevel error', err);
      throw err;
    }
  }
}

module.exports = ResourceSkillsRepository;
