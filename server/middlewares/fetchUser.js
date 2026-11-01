const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'imovies_super_secret_jwt_key_2024';

const fetchUser = (req, res, next) => {
  // Support auth-token, Authorization Bearer, or admin-token header
  let token = req.header('auth-token') || req.headers['auth-token'];

  if (!token) {
    const authHeader = req.header('authorization') || req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else if (req.header('admin-token') || req.headers['admin-token']) {
      token = req.header('admin-token') || req.headers['admin-token'];
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Please authenticate using a valid token'
    });
  }

  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user !== undefined ? data.user : (data.admin !== undefined ? data.admin : data);
    if (req.user && !req.user.role && data.role) {
      req.user.role = data.role;
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Please authenticate using a valid token'
    });
  }
};

module.exports = fetchUser;
