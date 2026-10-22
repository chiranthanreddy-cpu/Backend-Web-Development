require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');

if (!process.env.COOKIE_SECRET) throw new Error('COOKIE_SECRET is required');

const app = express();
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const code = error.code || (status === 500 ? 'INTERNAL_ERROR' : 'BAD_REQUEST');
  const message = status === 500 ? 'Internal server error' : error.message;

  return res.status(status).json({
    error: {
      code,
      message,
    },
  });
});

const port = Number(process.env.PORT || 3000);
if (require.main === module) {
  app.listen(port, () => console.log(`API listening on ${port}`));
}

module.exports = app;