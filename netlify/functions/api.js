const serverless = require('serverless-http');
const { initDB } = require('../../backend/database');
const app = require('../../backend/server');

let handler;

exports.handler = async (event, context) => {
  // Keep connection alive between warm invocations
  context.callbackWaitsForEmptyEventLoop = false;

  if (!handler) {
    await initDB();
    handler = serverless(app);
  }

  return handler(event, context);
};
