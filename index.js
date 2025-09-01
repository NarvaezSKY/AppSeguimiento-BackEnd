import app from "./app.js";
import { PORT } from "./config/config.js";
import { connectDB } from "./database/database.js";
// import "./models/index.js";

async function main() {
  try {
    await connectDB();

    app.listen(PORT);
    console.log(`Server on port ${PORT}`);
  } catch (error) {
    console.log(error);
  }
}

main();
