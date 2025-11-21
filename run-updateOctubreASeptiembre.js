import { updateOctubreASeptiembre } from './modules/initialLoad/updateOctubreASeptiembre.js';

console.log("🚀 Iniciando corrección de fechas octubre → septiembre...");

updateOctubreASeptiembre()
  .then(() => {
    console.log("🎉 Corrección completada exitosamente");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Error en la corrección:", error);
    process.exit(1);
  });