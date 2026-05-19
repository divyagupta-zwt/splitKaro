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
    "username": 'production-db-user',
    "password": 'production-db-password',
    "database": 'production-db-name',
    "host": 'production-db-host',
    "dialect": "mysql",
    "port": 'production-db-port'
  },
  test: {
    "username": 'CI-db-user',
    "password": 'CI-db-password',
    "database": 'CI-db-name',
    "host": 'CI-db-host',
    "dialect": "mysql",
    "port": 'CI-db-port'
  }
}
