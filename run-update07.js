import { updateAgostoEvidencias } from './modules/initialLoad/update07.js';

console.log("🚀 Iniciando actualización de evidencias agosto → octubre...");

updateAgostoEvidencias()
  .then(() => {
    console.log("🎉 Actualización completada exitosamente");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Error en la actualización:", error);
    process.exit(1);
  });