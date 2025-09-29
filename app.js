import express from "express";
import cors from "cors";
import morgan from "morgan";

import adminRouter from "./modules/users/routes/admin.routes.js";
import userRouter from "./modules/users/routes/user.routes.js";
import evidenciaRouter from "./modules/evidences/routes/evidencia.routes.js";
import componentRouter from "./modules/evidences/routes/componente.routes.js";
import actividadRouter from "./modules/evidences/routes/actividad.routes.js";

const app = express();

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://seguimiento-cmr.vercel.app"
  ],
  optionsSuccessStatus: 200,
  credentials: true,
};
app.use(cors(corsOptions));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));


app.use("/api/auth", adminRouter);
app.use("/api/users", userRouter);

app.use("/api/evidencias", evidenciaRouter);
app.use("/api/actividades", actividadRouter);
app.use("/api/componentes", componentRouter);


export default app;