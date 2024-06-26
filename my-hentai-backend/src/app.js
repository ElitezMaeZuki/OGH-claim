const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const config = require('./config/config');
const tokenRoutes = require('./routes/tokenroutes');

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 420000, // limit each IP to 420k requests per windowMs
});

app.use(limiter);

// Routes
app.use('/api', tokenRoutes);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
