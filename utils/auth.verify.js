import adminService from "../modules/users/services/admin.service.js";

const verifyAuth = (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"] || req.headers["Authorization"];
        const token = authHeader || req.headers["x-access-token"] || req.query.token;
        if (!token) return res.status(401).json({ success: false, message: "Token no proporcionado" });

        const payload = adminService.verifyToken(token);
        req.user = payload;
        return next();
    } catch (err) {
        return res.status(401).json({ success: false, message: err.message || "Token inválido" });
    }
};

export default verifyAuth;
