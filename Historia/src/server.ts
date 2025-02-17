import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express, { Request, Response, NextFunction } from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs';
import cors from 'cors';

// Directorios de distribución
const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// Configurar middleware para JSON y CORS
app.use(express.json());
app.use(cors());

// 📁 Configuración del manejo del CSV
const FILE_DIR = resolve(serverDistFolder, 'CSV');
const FILE_PATH = resolve(FILE_DIR, 'scenes.csv');

// Función para verificar y crear el CSV
function checkAndCreateCSV(): void {
  try {
    if (!fs.existsSync(FILE_DIR)) {
      fs.mkdirSync(FILE_DIR, { recursive: true });
      console.log('📁 Carpeta CSV creada.');
    }
    if (!fs.existsSync(FILE_PATH)) {
      // Si deseas agregar una cabecera, descomenta la siguiente línea:
      fs.writeFileSync(FILE_PATH, 'scene1\n', 'utf8');
      console.log('✅ Archivo scenes.csv creado con la cabecera.');
    } else {
      console.log('⚠️ El archivo scenes.csv ya existe.');
    }
  } catch (error) {
    console.error('❌ Error al crear el archivo CSV:', error);
  }
}

// Ejecutar la verificación al iniciar el servidor
checkAndCreateCSV();

// 🌐 Endpoint para verificar manualmente el CSV
app.get('/check-csv', (req: Request, res: Response) => {
  checkAndCreateCSV();
  res.json({ message: 'Archivo CSV verificado' });
});

// ✏ Endpoint para guardar la escena en el CSV (se recomienda usar POST)
app.post('/save-scene', (req: Request, res: Response): Response | void => {
  const { scene } = req.body;
  
  // Validar que se reciba un valor no vacío
  if (!scene || scene.trim() === '') {
    return res.status(400).json({ error: 'Falta el nombre de la escena' });
  }
  
  // Opcional: Evitar escribir duplicados si es el mismo valor que la última línea
  const fileContent = fs.existsSync(FILE_PATH) ? fs.readFileSync(FILE_PATH, 'utf8') : '';
  const lines = fileContent.split('\n').filter(line => line.trim() !== '');
  const lastScene = lines.length > 0 ? lines[lines.length - 1] : null;
  
  if (lastScene === scene) {
    // Si la escena es la misma que la última guardada, no se vuelve a guardar
    return res.json({ message: 'La escena ya estaba guardada' });
  }
  
  fs.appendFileSync(FILE_PATH, `${scene}\n`, 'utf8');
  return res.json({ message: 'Escena guardada correctamente' });
});


// 🔄 Endpoint para obtener la última escena
app.get('/last-scene', (req: Request, res: Response): Response | void => {
  try {
    const lines = fs
      .readFileSync(FILE_PATH, 'utf8')
      .split('\n')
      .filter((line) => line.trim() !== '');
    const lastScene = lines.length > 0 ? lines[lines.length - 1] : 'scene1';
    console.log(`🔄 Última escena recuperada: ${lastScene}`);
    return res.json({ scene: lastScene });
  } catch (error) {
    console.error('❌ Error al leer el archivo CSV:', error);
    return res.status(500).json({ error: 'No se pudo leer la última escena' });
  }
});


/**
 * Rutas de la aplicación Angular y archivos estáticos.
 */

// Servir archivos estáticos del directorio /browser
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

// Manejar todas las demás peticiones renderizando la aplicación Angular
app.use('/**', (req: Request, res: Response, next: NextFunction) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

// 🚀 Iniciar el servidor si este módulo es el principal
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4200;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// Exportar el manejador de peticiones para Angular CLI
export const reqHandler = createNodeRequestHandler(app);
