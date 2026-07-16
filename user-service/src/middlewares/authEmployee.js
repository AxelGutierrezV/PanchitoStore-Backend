const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const authEmployee = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Token requerido'
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded.userId) {
      return res.status(403).json({
        error: 'Token inválido'
      });
    }

    // ✅ ESTÁNDAR
    req.employee = decoded;

    next();

  } catch (error) {
    return res.status(401).json({
      error: 'Token inválido'
    });
  }
};

module.exports = authEmployee;