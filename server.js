const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'nathaneichert-portfolio-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Set view engine
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));

// Middleware to check authentication for /coopers routes
const requireAuth = (req, res, next) => {
  if (req.path.startsWith('/coopers') && !req.session.authenticated) {
    return res.redirect('/coopers/login');
  }
  next();
};

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/coopers/login', (req, res) => {
  if (req.session.authenticated) {
    return res.redirect('/coopers');
  }
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.post('/coopers/login', (req, res) => {
  const { password } = req.body;
  if (password === 'CoopersAI2025') {
    req.session.authenticated = true;
    res.redirect('/coopers');
  } else {
    res.redirect('/coopers/login?error=1');
  }
});

app.use('/coopers', requireAuth);

app.get('/coopers', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'coopers.html'));
});

app.get('/coopers/transcribe', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'transcribe.html'));
});

app.get('/coopers/files', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'files.html'));
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});