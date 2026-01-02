const { Pool } = require('pg');

let cfg = require('../config.json')

let pool = new Pool(cfg.database);
// Adapted to match the structure found here: https://node-postgres.com/features/connecting

module.exports = pool;