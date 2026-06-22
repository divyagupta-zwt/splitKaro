require('dotenv').config();
module.exports= {
  development: {
    "username": process.env.DB_USER,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "dialect": "mysql",
    "port": process.env.DB_PORT
  },
  production: {
    "username": process.env.PROD_DB_USER,
    "password": process.env.PROD_DB_PASSWORD,
    "database": process.env.PROD_DB_NAME,
    "host": process.env.PROD_DB_HOST,
    "dialect": "mysql",
    "port": process.env.PROD_DB_PORT
  },
  test: {
    "username": process.env.TEST_DB_USER || 'CI-db-user',
    "password": process.env.TEST_DB_PASSWORD || 'CI-db-password',
    "database": process.env.TEST_DB_NAME || 'CI-db-name',
    "host": process.env.TEST_DB_HOST || 'CI-db-host',
    "dialect": "mysql",
    "port": process.env.TEST_DB_PORT || 'CI-db-port'
  }
}
