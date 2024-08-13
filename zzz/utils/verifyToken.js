const jwt = require("jsonwebtoken");


const verifyToken = (allowedTipoContratos = []) => {
  return async (req, res, next) => {
    const bearerHeader = req.headers["authorization"];
    let token;

    if (typeof bearerHeader !== "undefined") {
      token = bearerHeader.split(" ")[1].trim().toString();
    } else {
      if (!req.headers["referer"] && !req.headers["origin"]) {
        return res.status(204).json({
          message: "xd",
        });
      }
      return res.status(403).json({
        status: false,
        message: "Acceso denegado",
      });
    }

    if (token) {
      try {
        const verify = jwt.verify(token, process.env.SECRET_KEY);
        req.usuario = verify;
        
        if (!allowedTipoContratos.includes(req.usuario.idTipoUsuario) && allowedTipoContratos[0] != 0) {
          return res.status(403).json({
            success: false,
            message: "Acceso denegado: Permiso insuficiente",
          });
        }

        next();

      } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
          return res.status(401).json({
            success: false,
            message: 'Sesión expirada',
            id: 'sesion',
          });
        }
        return res.status(401).json({
          success: false,
          message: 'Sesión inválida',
          id: 'sesion',
        });
      }
    }
  };
};

module.exports = {
    verifyToken
};