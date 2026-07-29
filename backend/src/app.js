// Express uygulamasının kurulduğu ana dosya
const express = require('express');
const cors = require('cors');
const postRoutes = require('./routes/postRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Futbol Blog API çalışıyor.' });
});

app.use('/api/posts', postRoutes);

module.exports = app;
