# Sistema de Seguimiento CMR - Backend

## 📋 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Manual de Usuario](#-manual-de-usuario)
- [Documentación Técnica](#-documentación-técnica)
- [Instalación y Ejecución](#-instalación-y-ejecución)
- [Scripts Disponibles](#-scripts-disponibles)

---

## 🎯 Descripción General

### ¿Qué es la aplicación?

El **Sistema de Seguimiento CMR** es una aplicación web diseñada para gestionar y dar seguimiento a evidencias de actividades organizadas por componentes, trimestres y responsables. Permite llevar un control detallado del estado de entrega de evidencias, facilitando la planificación, seguimiento y cumplimiento de metas anuales.

### ¿Para qué sirve?

- **Gestión de Evidencias**: Registro y seguimiento de evidencias vinculadas a actividades específicas
- **Control de Estados**: Monitoreo del estado de cada evidencia (Entregada, Por entregar, Entrega Extemporánea, No logro)
- **Organización por Componentes**: Estructura jerárquica de componentes y actividades
- **Seguimiento Temporal**: Organización por trimestres, meses y años
- **Gestión de Responsables**: Asignación y seguimiento de usuarios responsables por evidencia
- **Integración con Google Sheets**: Sincronización automática de datos con hojas de cálculo
- **Reportes y Métricas**: Visualización agrupada de tareas y actividades

### Público Objetivo

#### Administradores
- Gestión completa del sistema
- Registro de nuevos usuarios
- Creación y actualización de evidencias
- Administración de componentes y actividades
- Acceso a todos los endpoints protegidos

#### Usuarios Finales
- Visualización de evidencias asignadas
- Consulta de información de actividades y componentes
- Seguimiento del estado de sus entregas

---

## 👤 Manual de Usuario

### Flujo General de Uso

1. **Autenticación**: El administrador inicia sesión en el sistema
2. **Gestión de Estructura**: Se definen componentes y actividades con sus metas anuales
3. **Registro de Evidencias**: Se crean evidencias asociadas a actividades específicas
4. **Asignación de Responsables**: Se asignan usuarios responsables a cada evidencia
5. **Seguimiento**: Se monitorea el estado de las evidencias según fechas de entrega
6. **Actualización de Estados**: Se actualizan los estados conforme se entregan las evidencias
7. **Sincronización**: Los datos se sincronizan con Google Sheets para reportes

### Pantallas Principales

#### 1. Autenticación (Login)
- Ingreso de credenciales (email y password)
- Obtención de token JWT para acceso a funcionalidades protegidas
- Verificación de sesión activa

#### 2. Panel de Evidencias
- Listado de evidencias con filtros múltiples
- Visualización por componente, actividad, trimestre, mes, año, estado, responsable
- Paginación de resultados
- Información detallada de cada evidencia

#### 3. Gestión de Componentes
- Listado de todos los componentes del sistema
- Creación de nuevos componentes
- Visualización de componentes con sus actividades asociadas

#### 4. Gestión de Actividades
- Listado de actividades agrupadas por componente
- Creación de nuevas actividades con meta anual
- Asociación de actividades a componentes

#### 5. Panel de Tareas Agrupadas
- Visualización de evidencias agrupadas por componente
- Resumen del estado de evidencias por actividad
- Vista consolidada para mejor seguimiento

### Funcionalidades por Tipo de Usuario

#### Administrador
- ✅ Crear, editar y eliminar componentes
- ✅ Crear, editar y eliminar actividades
- ✅ Crear, editar y eliminar evidencias
- ✅ Asignar y desasignar responsables
- ✅ Actualizar estados de evidencias
- ✅ Ejecutar sincronizaciones con Google Sheets
- ✅ Acceso a todos los reportes y métricas
- ✅ Registrar nuevos administradores

#### Usuario Estándar
- 👁️ Visualizar evidencias públicas
- 👁️ Consultar componentes y actividades
- 👁️ Ver información general del sistema

### Ejemplos de Uso Paso a Paso

#### Ejemplo 1: Crear una Nueva Evidencia

1. El administrador inicia sesión en el sistema
2. Navega al módulo de evidencias
3. Selecciona el componente y la actividad correspondiente
4. Define el tipo de evidencia (reporte, documento, etc.)
5. Establece el trimestre, mes y año
6. Asigna la fecha de entrega
7. Selecciona a los responsables
8. Guarda la evidencia con estado inicial "Por entregar"

#### Ejemplo 2: Actualizar el Estado de una Evidencia

1. El administrador accede al detalle de una evidencia específica
2. Revisa la información de la entrega
3. Actualiza el estado a "Entregada" indicando la fecha real de entrega
4. Opcionalmente agrega una justificación si hubo retraso
5. El sistema automáticamente evalúa si fue extemporánea comparando fechas

#### Ejemplo 3: Consultar Evidencias Filtradas

1. El usuario accede al listado de evidencias
2. Aplica filtros según necesidad:
   - Por componente específico
   - Por trimestre (1, 2, 3 o 4)
   - Por mes y año
   - Por responsable
   - Por estado
3. Visualiza los resultados paginados
4. Accede al detalle de cualquier evidencia para más información

#### Ejemplo 4: Sincronizar con Google Sheets

1. El administrador ejecuta el script de actualización
2. El sistema lee las evidencias actuales de la base de datos
3. Formatea los datos según el esquema del Sheet
4. Actualiza las fechas y estados según reglas predefinidas
5. Sube los cambios a Google Sheets
6. Confirma la sincronización exitosa

---

## 🛠️ Documentación Técnica

### Arquitectura General

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│    Frontend     │ ◄─────► │   Backend API   │ ◄─────► │   MongoDB       │
│   (React/Vue)   │  HTTP   │   (Express.js)  │  Driver │   Database      │
│                 │         │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
                                     │
                                     │
                                     ▼
                            ┌─────────────────┐
                            │                 │
                            │  Google Sheets  │
                            │      API        │
                            │                 │
                            └─────────────────┘
```

**Flujo de datos:**
1. El frontend realiza peticiones HTTP a los endpoints del backend
2. El backend procesa las peticiones, valida autenticación y ejecuta lógica de negocio
3. Los datos se persisten en MongoDB Atlas
4. Periódicamente se sincronizan con Google Sheets para reportes externos
5. Las respuestas JSON se devuelven al frontend para visualización

### Tecnologías Usadas

#### Backend (Node.js)

**Framework y Librerías Principales:**
- **Express.js** (v4.18.2): Framework web para crear el servidor y APIs REST
- **Mongoose** (v7.3.4): ODM para MongoDB, manejo de esquemas y validaciones
- **JWT** (jsonwebtoken v9.0.0): Autenticación basada en tokens
- **bcryptjs** (v2.4.3): Encriptación de contraseñas
- **CORS** (v2.8.5): Configuración de políticas de origen cruzado
- **Morgan** (v1.10.1): Logger de peticiones HTTP
- **googleapis** (v121.0.0): Integración con Google Sheets API
- **dotenv** (v16.0.3): Gestión de variables de entorno

**Herramientas de Desarrollo:**
- **Nodemon** (v2.0.22): Recarga automática del servidor en desarrollo

**Patrones de Arquitectura:**
- **MVC (Modelo-Vista-Controlador)**: Separación de responsabilidades
- **Arquitectura en Capas**: Controllers → Services → Models
- **Repository Pattern**: Abstracción de acceso a datos
- **Middleware Pattern**: Autenticación y validación centralizadas

#### Base de Datos

**MongoDB Atlas (Cloud)**
- **Versión**: Compatible con Mongoose 7.x
- **Tipo**: Base de datos NoSQL orientada a documentos
- **Conexión**: URI remota configurada por variable de entorno

**Colecciones Principales:**

1. **admins**: Usuarios administradores del sistema
   - Campos: name, email, password (encriptada), createdAt

2. **users**: Usuarios estándar (responsables)
   - Campos: nombre, email, vinculacion, createdAt

3. **componentes**: Componentes del sistema
   - Campos: nombreComponente

4. **actividads**: Actividades asociadas a componentes
   - Campos: actividad, metaAnual, componente (ref)

5. **evidencias**: Evidencias de cumplimiento de actividades
   - Campos: actividad (ref), tipoEvidencia, trimestre, mes, anio, responsables (refs), estado, fechaEntrega, creadoEn, entregadoEn, justificacion

**Relaciones:**
- Componente (1) → (N) Actividades
- Actividad (1) → (N) Evidencias
- User (N) ← (M) → Evidencias (M) [many-to-many]

#### Infraestructura

**Hosting:**
- **Vercel**: Plataforma de despliegue para el backend
- **Node.js Runtime**: Ambiente de ejecución
- **Serverless Functions**: Arquitectura sin servidor

**Servicios Externos:**
- **Google Cloud Platform**: API de Google Sheets para sincronización
- **MongoDB Atlas**: Base de datos en la nube
- **GitHub**: Control de versiones y CI/CD

### Variables de Entorno

El sistema requiere las siguientes variables de entorno configuradas en un archivo `.env`:

```env
# Puerto del servidor (desarrollo)
PORT=4000

# URI de conexión a MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Secret para firma de tokens JWT
TOKEN_SECRET=your-secret-key-here

# Credenciales de Google Service Account (JSON stringificado)
GOOGLE_CREDENTIALS='{"type":"service_account","project_id":"...","private_key":"...",...}'
```

**Notas de Seguridad:**
- ⚠️ Nunca commitear el archivo `.env` al repositorio
- ⚠️ Usar secrets manager en producción (Vercel Environment Variables)
- ⚠️ Rotar las credenciales periódicamente
- ⚠️ `TOKEN_SECRET` debe ser una cadena aleatoria larga (mínimo 32 caracteres)

### Autenticación y Autorización

**Tipo de Autenticación:** JWT (JSON Web Tokens)

**Flujo de Autenticación:**

1. **Registro** (`POST /api/auth/register`):
   ```javascript
   Request: { name, email, password }
   → Password hasheada con bcrypt
   → Admin creado en BD
   Response: { success, message, data: { id, name, email } }
   ```

2. **Login** (`POST /api/auth/login`):
   ```javascript
   Request: { email, password }
   → Validación de credenciales
   → Generación de token JWT con payload: { id, email, name }
   → Token firmado con TOKEN_SECRET, expiración 24h
   Response: { success, token, data: { id, name, email } }
   ```

3. **Verificación** (`GET /api/auth/verify`):
   ```javascript
   Request: Header "Authorization: Bearer <token>"
   → Validación y decodificación del token
   Response: { success, data: { id, name, email } }
   ```

**Middleware de Autenticación:**

El archivo `utils/auth.verify.js` implementa el middleware `verifyAuth`:
- Extrae el token del header `Authorization`, `x-access-token` o query param `token`
- Valida el token usando `adminService.verifyToken()`
- Decodifica el payload y lo adjunta a `req.user`
- Si es inválido/expirado, retorna 401 Unauthorized

**Rutas Protegidas:**
- Todas las rutas de creación, actualización y eliminación requieren token válido
- Las rutas de consulta pública no requieren autenticación

### Estructura de Carpetas

```
back/
│
├── app.js                          # Configuración de Express, middlewares y rutas
├── index.js                        # Punto de entrada, inicialización del servidor
├── package.json                    # Dependencias y scripts npm
├── vercel.json                     # Configuración de despliegue en Vercel
│
├── config/
│   ├── config.js                   # Variables de entorno centralizadas
│   └── google-credentials.json     # Credenciales de Google Service Account (no en repo)
│
├── database/
│   └── database.js                 # Conexión a MongoDB Atlas
│
├── models/                         # Esquemas de Mongoose
│   ├── adminModel.js               # Modelo de administradores
│   ├── userModel.js                # Modelo de usuarios
│   └── evidence/
│       ├── actividadModel.js       # Modelo de actividades
│       ├── componenteModel.js      # Modelo de componentes
│       └── evidenciaModel.js       # Modelo de evidencias
│
├── modules/                        # Módulos funcionales (capas MVC)
│   ├── evidences/
│   │   ├── controllers/            # Controladores HTTP (reciben req/res)
│   │   │   ├── actividad.controller.js
│   │   │   ├── componente.controller.js
│   │   │   └── evidencia.controller.js
│   │   ├── routes/                 # Definición de rutas y endpoints
│   │   │   ├── actividad.routes.js
│   │   │   ├── componente.routes.js
│   │   │   └── evidencia.routes.js
│   │   └── services/               # Lógica de negocio (hablan con BD)
│   │       ├── actividad.service.js
│   │       ├── componente.service.js
│   │       ├── evidencia.service.js
│   │       └── sheets.service.js
│   │
│   ├── initialLoad/                # Scripts de sincronización y actualizaciones
│   │   ├── initialLoad.js          # Carga inicial de datos desde Google Sheets
│   │   ├── update07.js             # Script de actualización específica (agosto → septiembre)
│   │   ├── updateOctubreASeptiembre.js  # Corrección de fechas (octubre → septiembre)
│   │   └── updateSheets.js         # Actualización periódica del Sheet (día 5 → 15)
│   │
│   └── users/
│       ├── controllers/            # Controladores de usuarios y autenticación
│       │   ├── admin.controller.js
│       │   └── user.controller.js
│       ├── routes/                 # Rutas de autenticación y gestión de usuarios
│       │   ├── admin.routes.js
│       │   └── user.routes.js
│       └── services/               # Servicios de autenticación y gestión de usuarios
│           ├── admin.service.js
│           └── user.service.js
│
├── utils/
│   └── auth.verify.js              # Middleware de verificación de JWT
│
└── scripts/                        # Scripts ejecutables (runners)
   ├── run-initial-load.js
   ├── run-update07.js
   ├── run-updateOctubreASeptiembre.js
   └── run-updateSheet.js
```

**Convenciones:**
- **Controllers**: Manejan requests HTTP, validaciones iniciales, y respuestas
- **Services**: Contienen la lógica de negocio y operaciones de BD
- **Routes**: Definen endpoints, métodos HTTP y middlewares
- **Models**: Definen esquemas de datos y validaciones de Mongoose

### Principales Endpoints

#### Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Auth | Body/Params |
|--------|----------|-------------|------|-------------|
| POST | `/register` | Registrar nuevo administrador | No | `{ name, email, password }` |
| POST | `/login` | Iniciar sesión | No | `{ email, password }` |
| GET | `/verify` | Verificar token válido | Sí | Header: `Authorization: <token>` |

#### Usuarios (`/api/users`)

| Método | Endpoint | Descripción | Auth | Body/Params |
|--------|----------|-------------|------|-------------|
| GET | `/` | Listar todos los usuarios | No | - |
| POST | `/` | Crear nuevo usuario | Sí | `{ nombre, email, vinculacion }` |
| GET | `/:id` | Obtener usuario por ID | Sí | Param: `id` |

#### Componentes (`/api/componentes`)

| Método | Endpoint | Descripción | Auth | Body/Params |
|--------|----------|-------------|------|-------------|
| GET | `/` | Listar todos los componentes | No | - |
| POST | `/` | Crear nuevo componente | Sí | `{ nombreComponente }` |
| GET | `/:id` | Obtener componente por ID | Sí | Param: `id` |

#### Actividades (`/api/actividades`)

| Método | Endpoint | Descripción | Auth | Body/Params |
|--------|----------|-------------|------|-------------|
| GET | `/` | Listar actividades (agrupadas por componente) | No | - |
| POST | `/` | Crear nueva actividad | Sí | `{ actividad, metaAnual, componente }` |
| GET | `/:id` | Obtener actividad por ID | Sí | Param: `id` |

#### Evidencias (`/api/evidencias`)

| Método | Endpoint | Descripción | Auth | Body/Params |
|--------|----------|-------------|------|-------------|
| GET | `/` | Listar evidencias con filtros y paginación | No | Query: `componente`, `actividad`, `mes`, `trimestre`, `anio`, `estado`, `responsable`, `responsables`, `page`, `limit` |
| POST | `/` | Crear nueva evidencia | Sí | `{ actividad, tipoEvidencia, trimestre, mes, anio, responsables[], fechaEntrega }` |
| GET | `/:id` | Obtener evidencia por ID | Sí | Param: `id` |
| PATCH | `/:id/estado` | Actualizar estado de evidencia | Sí | `{ estado, entregadoEn?, justificacion? }` |
| GET | `/tasks` | Obtener tareas agrupadas por componente | Sí | Query: `trimestre?`, `mes?`, `anio?` |
| GET | `/actividades/trimestre` | Obtener actividades de un trimestre | Sí | Query: `trimestre`, `anio?` |

**Detalles de Filtrado de Evidencias:**

Query params soportados en `GET /api/evidencias`:
- `componente`: ID del componente (filtra actividades del componente)
- `actividad`: ID de la actividad
- `mes`: Número del mes (1-12)
- `trimestre`: Número del trimestre (1-4)
- `anio`: Año (ej: 2025)
- `estado`: Uno de ["Entregada", "Por entregar", "Entrega Extemporanea", "No logro"]
- `responsable`: ID de un responsable
- `responsables`: CSV de IDs de responsables (ej: "id1,id2,id3")
- `page`: Número de página para paginación (>=1)
- `limit` o `perPage`: Cantidad de items por página

**Respuesta paginada:**
```json
{
  "items": [ /* array de evidencias */ ],
  "total": 100,
  "page": 1,
  "totalPages": 10,
  "perPage": 10
}
```

**Ordenación:**
- Prioridad 1: `trimestre` (1 → 4)
- Prioridad 2: Número inicial del nombre de la actividad (si existe)
- Prioridad 3: `_id` (desempate estable)

---

## 🚀 Instalación y Ejecución

### Requisitos Previos

- **Node.js**: v16 o superior
- **npm** o **yarn**: Gestor de paquetes
- **MongoDB Atlas**: Cuenta y cluster configurado
- **Google Cloud Platform**: Service Account con acceso a Google Sheets API (opcional, solo para sincronización)
- **Git**: Para clonar el repositorio

### Pasos para Ejecutar en Local

#### 1. Clonar el Repositorio

```bash
git clone https://github.com/NarvaezSKY/AppSeguimiento-BackEnd.git
cd AppSeguimiento-BackEnd
```

#### 2. Instalar Dependencias

```bash
npm install
# o
yarn install
```

#### 3. Configurar Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
PORT=4000
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/seguimientocmr?retryWrites=true&w=majority
TOKEN_SECRET=tu-secret-super-secreto-y-largo-aqui-min-32-chars
GOOGLE_CREDENTIALS='{"type":"service_account","project_id":"tu-proyecto",...}'
```

**Cómo obtener las credenciales:**

**MongoDB URI:**
1. Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crear un cluster gratuito
3. En "Database Access", crear un usuario con contraseña
4. En "Network Access", agregar tu IP o `0.0.0.0/0` (desarrollo)
5. Clic en "Connect" → "Connect your application" → Copiar URI

**TOKEN_SECRET:**
```bash
# Generar un secret aleatorio
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**GOOGLE_CREDENTIALS (opcional):**
1. Crear proyecto en [Google Cloud Console](https://console.cloud.google.com/)
2. Habilitar "Google Sheets API"
3. Crear Service Account en "Credentials"
4. Descargar JSON de credenciales
5. Convertir a string y guardar en `.env` (todo en una línea, escapando comillas)

#### 4. Iniciar el Servidor

**Modo Desarrollo (con auto-reload):**
```bash
npm run dev
# o
yarn dev
```

**Modo Producción:**
```bash
npm start
# o
yarn start
```

El servidor estará disponible en `http://localhost:4000`

#### 5. Verificar la Conexión

Hacer una petición de prueba:
```bash
curl http://localhost:4000/api/componentes
```

Debería retornar un array JSON (vacío o con datos).

### Scripts Adicionales

#### Carga Inicial de Datos

Si tienes un Google Sheet con datos iniciales:

```bash
npm run initial-load
# o
yarn initial-load
```

Este script lee datos de Google Sheets y los carga en MongoDB.

#### Actualizar Sheet con Datos de BD

Para sincronizar cambios de MongoDB hacia Google Sheets:

```bash
npm run update
# o
yarn update
```

Actualiza fechas de entrega y recalcula estados en el Sheet.

### Despliegue en Vercel (Producción)

#### 1. Instalar Vercel CLI

```bash
npm install -g vercel
```

#### 2. Login en Vercel

```bash
vercel login
```

#### 3. Configurar Variables de Entorno en Vercel

En el dashboard de Vercel:
- Settings → Environment Variables
- Agregar: `MONGODB_URI`, `TOKEN_SECRET`, `GOOGLE_CREDENTIALS`

#### 4. Desplegar

```bash
vercel --prod
```

El proyecto quedará desplegado en una URL tipo `https://appseguimiento-backend.vercel.app`

### Testing de Endpoints

**Usar Postman, Insomnia o curl:**

**Ejemplo: Registro de Admin**
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"123456"}'
```

**Ejemplo: Login**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"123456"}'
```

**Ejemplo: Crear Evidencia (requiere token)**
```bash
curl -X POST http://localhost:4000/api/evidencias \
  -H "Content-Type: application/json" \
  -H "Authorization: <tu-token-jwt>" \
  -d '{
    "actividad":"64abc123...",
    "tipoEvidencia":"reporte",
    "trimestre":1,
    "mes":3,
    "anio":2025,
    "responsables":["64xyz789..."],
    "fechaEntrega":"2025-03-15"
  }'
```

---

## 📜 Scripts Disponibles

### Producción
- `npm start`: Inicia el servidor en modo producción
- `npm run update`: Ejecuta actualización de Google Sheets

### Desarrollo
- `npm run dev`: Inicia el servidor con nodemon (auto-reload)
- `npm run initial-load`: Carga inicial de datos desde Google Sheets

### Mantenimiento
- Scripts personalizados en `run-*.js` para actualizaciones específicas de datos

---

## 📚 Recursos Adicionales

- **Repositorio**: [GitHub - AppSeguimiento Backend](https://github.com/NarvaezSKY/AppSeguimiento-BackEnd.git)
- **Frontend**: https://seguimiento-cmr.vercel.app
- **Documentación de MongoDB**: https://www.mongodb.com/docs/
- **Documentación de Express**: https://expressjs.com/
- **Google Sheets API**: https://developers.google.com/sheets/api

---

## 👨‍💻 Autor

**Cristian Narvaez**
- Email: crissnar12xd@gmail.com
- GitHub: [@NarvaezSKY](https://github.com/NarvaezSKY)

---

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📞 Soporte

Para soporte técnico o consultas, contactar al equipo de desarrollo.
seguimientoidiregionalcauca@gmail.com