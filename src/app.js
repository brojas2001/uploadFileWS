require('dotenv').config();
const express = require('express');
const app = express();
const s3Routes = require('./routes/s3.routes.js');
const cors = require('cors');
const AppDataSource = require('./data-source');
app.use(cors({
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Middleware para parsear JSON
app.use(express.json());

app.use("/s3", s3Routes);

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    console.log('✅ Conectado a la base de datos con TypeORM');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error al conectar:', err);
  });