// index.js: CLI entry that starts the app; keep implementation in app.js
const { createApp } = require('./app');

if (require.main === module) {
  const app = createApp();
  const PORT = process.env.PORT || 4000;
  const server = app.listen(PORT, '0.0.0.0', () =>
    console.log(`Human-Resource service listening on port ${PORT}`)
  );

  server.on('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
  });

  process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err.stack || err);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
    process.exit(1);
  });
}

module.exports = { createApp };

module.exports = { createApp };
