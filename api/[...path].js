const path = require('path');

// Tell Node.js to also look for packages inside the 'api' folder
// This fixes the Vercel 500 error when backend/server.js tries to load express
module.paths.push(path.join(__dirname, 'node_modules'));

const app = require('../backend/server.js');
module.exports = app;
