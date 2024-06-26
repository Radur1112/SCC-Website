const jwt = require("jsonwebtoken");


const verifyToken = async (req, res, next) => {
  const bearerHeader = req.headers["authorization"];
  let token;
  if (typeof bearerHeader !== "undefined") {
    token = bearerHeader.split(" ")[1].trim().toString();
  } else {
    res.status(403).json({
      status: false,
      message: "Acceso denegado",
    });
  }
  if (token) {
    try {
        const verify = jwt.verify(token, process.env.SECRET_KEY);
        req.usuario = verify;
        next();
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ 
                success: false,
                message: 'Sesión expirada',
                id: 'sesion'
            });
        }
        return res.status(401).json({
            success: false,
            message: 'Sesión inválida',
            id: 'sesion'
        });
    }
  }
};

const verifyUsuario = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.usuario.id == req.params.id || req.usuario.idTipoUsuario == 1) {
            next();
        } else {
            return res.status(403).json({
                success: false,
                message: "Usuario no autorizado",
            });
        }
    });
}

const verifyAdministrador = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.usuario.idTipoUsuario == 1) {
            next();
        } else {
            return res.status(403).json({
                success: false,
                message: "Usuario no autorizado",
            });
        }
    });
}

module.exports = {
    verifyToken,
    verifyUsuario,
    verifyAdministrador
};