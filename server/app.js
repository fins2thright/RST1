const express = require('express');
const bodyParser = require('body-parser');
const HumanResourceRoutes = require('./routes/humanResourceRoutes');
const SkillsRoutes = require('./routes/skillsRoutes');
const ResourceSkillsRoutes = require('./routes/resourceSkillsRoutes');
const CompaniesRoutes = require('./routes/companiesRoutes');
const WorkHistoryRoutes = require('./routes/workHistoryRoutes');
const ProductAgentRoutes = require('./routes/productAgentRoutes');

function createApp(
  repository,
  skillsRepository,
  resourceSkillsRepository,
  companiesRepository,
  workHistoryRepository,
  productAgentRepository
) {
  const app = express();

  // Enable CORS for client communication
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
  let hrRepo = repository;
  if (!hrRepo) {
    // require repository lazily so tests that mock the repo don't trigger DB connection on require
    const HumanResourceRepository = require('./repositories/HumanResourceRepository');
    hrRepo = new HumanResourceRepository();
  }

  let skillsRepo = skillsRepository;
  if (!skillsRepo) {
    const SkillsRepository = require('./repositories/SkillsRepository');
    skillsRepo = new SkillsRepository();
  }

  let resourceSkillsRepo = resourceSkillsRepository;
  if (!resourceSkillsRepo) {
    const ResourceSkillsRepository = require('./repositories/ResourceSkillsRepository');
    resourceSkillsRepo = new ResourceSkillsRepository();
  }

  let companiesRepo = companiesRepository;
  if (!companiesRepo) {
    const CompaniesRepository = require('./repositories/CompaniesRepository');
    companiesRepo = new CompaniesRepository();
  }

  let workHistoryRepo = workHistoryRepository;
  if (!workHistoryRepo) {
    const WorkHistoryRepository = require('./repositories/WorkHistoryRepository');
    workHistoryRepo = new WorkHistoryRepository();
  }

  let productAgentRepo = productAgentRepository;
  if (!productAgentRepo) {
    const ProductAgentRepository = require('./repositories/ProductAgentRepository');
    productAgentRepo = new ProductAgentRepository();
  }

  app.use('/human-resources', HumanResourceRoutes(hrRepo));
  app.use('/skills', SkillsRoutes(skillsRepo));
  app.use('/resource-skills', ResourceSkillsRoutes(resourceSkillsRepo));
  app.use('/companies', CompaniesRoutes(companiesRepo));
  app.use('/work-history', WorkHistoryRoutes(workHistoryRepo));
  app.use('/product-agent', ProductAgentRoutes(productAgentRepo));

  // Swagger UI (optional)
  try {
    const swaggerUi = require('swagger-ui-express');
    const openapi = require('./openapi.json');
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));
  } catch (e) {
    // swagger not installed - ignore
  }

  return app;
}

module.exports = { createApp };
