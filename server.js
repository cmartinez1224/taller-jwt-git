const express = require("express");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
const PUERTO = 3000;
const CLAVE_SECRETA = "clave_secreta_del_taller_2026";

app.use(express.json());
app.use(express.static(__dirname));

// Usuario de prueba (en un proyecto real, esto vendría de una base de datos)
const USUARIO_VALIDO = { usuario: "admin", clave: "1234" };

// Ruta de login: valida credenciales y genera el token
app.post("/login", (req, res) => {
  const { usuario, clave } = req.body;

  if (usuario === USUARIO_VALIDO.usuario && clave === USUARIO_VALIDO.clave) {
    const token = jwt.sign(
      { usuario: usuario, rol: "admin" },
      CLAVE_SECRETA,
      { expiresIn: "1h" }
    );
    return res.json({ mensaje: "Autenticación exitosa", token });
  }

  res.status(401).json({ mensaje: "Usuario o contraseña incorrectos" });
});

// Middleware que verifica el token JWT
function verificarToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ mensaje: "Token no proporcionado" });
  }

  jwt.verify(token, CLAVE_SECRETA, (err, datos) => {
    if (err) {
      return res.status(403).json({ mensaje: "Token inválido o expirado" });
    }
    req.usuario = datos;
    next();
  });
}

// Ruta protegida: solo accesible con un token válido
app.get("/perfil", verificarToken, (req, res) => {
  res.json({
    mensaje: "Acceso autorizado a ruta protegida",
    usuario: req.usuario
  });
});

app.listen(PUERTO, () => {
  console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});