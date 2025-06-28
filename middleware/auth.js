const jwt = require('jsonwebtoken');

const cors = require('cors');
app.use(cors({
    origin: 'https://skswap.netlify.app/',  // ✅ Your actual frontend URL
    credentials: true
}));

function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
}

module.exports = authenticate;
