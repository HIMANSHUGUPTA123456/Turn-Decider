require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const authRoutes = require('./src/routes/auth');
const pairRoutes = require('./src/routes/pair');
const consentRoutes = require('./src/routes/consent');
const historyRoutes = require('./src/routes/history');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/', (_, res) => res.send('Turn-Decider API running'));

app.use('/api/auth', authRoutes);
app.use('/api/pair', pairRoutes);
app.use('/api/consent', consentRoutes);
app.use('/api/history', historyRoutes);

const PORT = process.env.PORT || 4000;
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => console.log("API listening on port", PORT));
  })
  .catch((err) => {
    console.error('Mongo connection error', err);
    process.exit(1);
  });
