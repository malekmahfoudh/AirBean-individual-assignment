// middleware.js

const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
  
    if (authHeader) {
      const token = authHeader.split(' ')[1];
  
      jwt.verify(token, 'key', (err, decoded) => {
        if (err) {
          res.status(403).json({ error: 'Forbidden' });
        } else {
          req.user = decoded.user; // Hämta användarinformationen från payloaden
          next();
        }
      });
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  };
  

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      // Användaren har rollen "admin", fortsätt till nästa middleware eller hanterare
      next();
    } else {
      // Användaren har inte tillräckliga behörigheter, skicka felmeddelande
      res.status(403).json({ error: 'Forbidden' });
    }
  };

module.exports = { authenticateToken, isAdmin };
