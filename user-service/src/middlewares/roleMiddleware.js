const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    try {
      const role = req.employee?.role;

      if (!role) {
        return res.status(403).json({
          error: 'Usuario sin rol'
        });
      }

      if (role !== requiredRole) {
        return res.status(403).json({
          error: `Acceso denegado: se requiere ${requiredRole}`
        });
      }

      next();
    } catch (error) {
      console.error("Error middleware:", error);
      return res.status(500).json({
        error: 'Error en validación de roles'
      });
    }
  };
};

module.exports = roleMiddleware;
