import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import ideaRoutes from './routes/ideaRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Endpoints de la API
app.use('/api/auth', authRoutes);
app.use('/api/ideas', ideaRoutes);

app.get('/', (req, res) => {
  res.send(' API de NovaCreativa con PostgreSQL y Prisma lista');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Servidor corriendo en http://localhost:${PORT}`);
});