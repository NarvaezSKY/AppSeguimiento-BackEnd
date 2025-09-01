import userService from "../services/admin.service.js";

/**
 * POST /register
 */
const register = async (req, res) => {
  try {
    const admin = await userService.registerAdmin(req.body);
    return res.status(201).json({ success: true, data: admin });
  } catch (err) {
    let status = 500;
    if (err.message.includes("Faltan")) status = 400;
    if (err.message.includes("ya está registrado")) status = 409;
    return res.status(status).json({ success: false, message: err.message });
  }
};

/**
 * POST /login
 */
const login = async (req, res) => {
  try {
    const result = await userService.loginAdmin(req.body);
    return res.json({ success: true, data: result });
  } catch (err) {
    const status = err.message.includes("Credenciales inválidas") ? 401 : 400;
    return res.status(status).json({ success: false, message: err.message });
  }
};

/**
 * GET /verify    (devuelve payload del token)
 */
const verify = (req, res) => {
  try {
    const token = req.headers.authorization || req.body.token;
    const payload = userService.verifyToken(token);
    return res.json({ success: true, data: payload });
  } catch (err) {
    return res.status(401).json({ success: false, message: err.message });
  }
};

export default {
  register,
  login,
  verify
};
