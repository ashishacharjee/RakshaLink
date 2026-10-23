const { createApp } = require('../server/index');
const { app, start } = createApp();
start();
module.exports = app;
