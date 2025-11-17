const express = require('express');
const bodyParser = require('body-parser');
const HumanResourceRoutes = require('./routes/humanResourceRoutes');
const swaggerUi = require('swagger-ui-express');
const openapi = require('./openapi.json');

const app = express();
app.use(bodyParser.json());

app.use('/human-resources', HumanResourceRoutes);

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Human-Resource service listening on port ${PORT}`));
