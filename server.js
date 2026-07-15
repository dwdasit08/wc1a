// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://www.youtube.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https://wcia.tv", "https://via.placeholder.com"],
      frameSrc: ["'self'", "https://www.youtube.com"],
    },
  },
}));

// Enable CORS (for API)
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://wcia.tv' : '*',
  optionsSuccessStatus: 200,
}));

// Compression
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files with caching
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
  etag: true,
  lastModified: true,
}));

// API routes
app.use('/api', apiRoutes);

// Catch-all for SPA (but we have multiple HTML pages, so we serve them directly)
// However, we need to handle direct routes like /about -> about.html
// We'll use a custom middleware to map routes to HTML files
app.get(['/about', '/gallery', '/photo-gallery', '/video-gallery', '/blog', '/sewa-niketan', '/get-involved', '/registration', '/pay-online', '/registration-details', '/membership-renewal', '/campaigns', '/drive-with-ability', '/ladakh-expedition', '/notice-karo-india', '/donate', '/contact'], (req, res) => {
  const page = req.path === '/' ? 'index' : req.path.slice(1);
  const filePath = path.join(__dirname, 'public', `${page}.html`);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 WCIA website running on http://localhost:${PORT}`);
  console.log(`📁 Serving static files from ${path.join(__dirname, 'public')}`);
});