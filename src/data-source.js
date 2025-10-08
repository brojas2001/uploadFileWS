require('dotenv').config();
require('reflect-metadata');
const { DataSource } = require('typeorm');
const Files = require('./entity/Files');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: true,
  entities: [Files]
});

module.exports = AppDataSource;
