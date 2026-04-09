require('dotenv').config();
const express = require('express');
const cors = require('cors');
const appRoutes = require('./routes/routes');
const errorHandler = require('./middleware/errorHandler');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.use('/api', appRoutes);

app.use(errorHandler);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Unable to connect to database:', err.message);
    process.exit(1);
  }
};

startServer();
