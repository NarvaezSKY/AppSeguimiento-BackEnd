import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../../../models/adminModel.js";
import { TOKEN_SECRET } from "../../../config/config.js";

/**
 * Registra un administrador.
 * @param {{name:string,email:string,password:string}} data
 * @returns {Promise<object>} admin sin password
 */
const registerAdmin = async (data) => {
    const { name, email, password } = data || {};
    if (!name || !email || !password) throw new Error("Faltan campos obligatorios");
    const exists = await Admin.findOne({ email });
    if (exists) throw new Error("El email ya está registrado");

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const admin = new Admin({ name, email, password: hashed });
    await admin.save();

    const result = admin.toObject();
    delete result.password;
    return result;
};

/**
 * Loguea un administrador y devuelve un token JWT.
 * @param {{email:string,password:string}} creds
 * @returns {Promise<{token:string, admin:object}>}
 */
const loginAdmin = async (creds) => {
    const { email, password } = creds || {};
    if (!email || !password) throw new Error("Faltan credenciales");
    const admin = await Admin.findOne({ email });
    if (!admin) throw new Error("Credenciales inválidas");

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) throw new Error("Credenciales inválidas");

    const payload = { id: admin._id, email: admin.email, name: admin.name };
    const token = jwt.sign(payload, TOKEN_SECRET, { expiresIn: "12h" });

    return {
        token,
        admin: { id: admin._id, name: admin.name, email: admin.email },
    };
};

/**
 * Verifica un token (acepta 'Bearer <token>' o solo el token).
 * @param {string} tokenStr
 * @returns {object} payload decodificado
 */
const verifyToken = (tokenStr) => {
    if (!tokenStr) throw new Error("Token no proporcionado");
    const raw = tokenStr.startsWith("Bearer ") ? tokenStr.slice(7) : tokenStr;
    try {
        const decoded = jwt.verify(raw, TOKEN_SECRET);
        return decoded;
    } catch (err) {
        throw new Error("Token inválido o expirado");
    }
};

export default {
    registerAdmin,
    loginAdmin,
    verifyToken,
}