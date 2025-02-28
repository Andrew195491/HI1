import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  writeResponseToNodeResponse
} from '@angular/ssr/node';
import express, { Request, Response, NextFunction } from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(cors()); // Habilitar CORS para permitir peticiones desde el frontend

// 🔹 Configurar rutas y variables globales
const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const angularApp = new AngularNodeAppEngine();

// 📂 Definir rutas de archivos
const CSV_DIR = resolve(serverDistFolder, 'CSV');
const CSV_FILE = resolve(CSV_DIR, 'scenes.csv');
const SUM_DIR = resolve(serverDistFolder, 'SUMM');
const SUM_FILE = resolve(SUM_DIR, 'summary.txt');

// 🌐 Configuración de Express
app.use(express.json());
app.use(cors());

// 📌 Verificar que las carpetas y archivos existen
function ensureFileExists(path: string) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
}

ensureFileExists(CSV_DIR);
ensureFileExists(SUM_DIR);

if (!fs.existsSync(CSV_FILE)) {
  fs.writeFileSync(CSV_FILE, 'scene1\n', 'utf8');
}
if (!fs.existsSync(SUM_FILE)) {
  fs.writeFileSync(SUM_FILE, '', 'utf8');
}

// 📌 **Guardar texto en summary.txt**
app.post('/save-summary', (req: Request, res: Response) => {
  const { text } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'No se proporcionó texto para guardar' });
  }

  fs.appendFile(SUM_FILE, `${text}\n\n`, (err) => {
    if (err) {
      console.error("❌ Error al escribir en summary.txt:", err);
      return res.status(500).json({ error: 'Error al guardar el resumen' });
    }
    console.log("✅ Texto guardado en summary.txt");
    return res.json({ message: 'Texto guardado correctamente' });
  });
  return;
});

// 📌 **Guardar escena en CSV**
app.post('/save-scene', (req: Request, res: Response) => {
  const { scene } = req.body;
  
  if (!scene || scene.trim() === '') {
    return res.status(400).json({ error: 'Falta el nombre de la escena' });
  }

  const fileContent = fs.readFileSync(CSV_FILE, 'utf8');
  const lines = fileContent.split('\n').filter(line => line.trim() !== '');
  const lastScene = lines.length > 0 ? lines[lines.length - 1] : '';

  if (lastScene === scene) {
    return res.json({ message: 'La escena ya estaba guardada' });
  }

  fs.appendFileSync(CSV_FILE, `${scene}\n`, 'utf8');
  return res.json({ message: 'Escena guardada correctamente' });
});

// 📌 **Obtener última escena**
app.get('/last-scene', (req: Request, res: Response) => {
  const lines = fs.readFileSync(CSV_FILE, 'utf8').split('\n').filter(line => line.trim() !== '');
  const lastScene = lines.length > 0 ? lines[lines.length - 1] : 'scene1';
  res.json({ scene: lastScene });
});

// 📌 **Configurar Angular SSR**
app.use(express.static(browserDistFolder, { maxAge: '1y', index: false, redirect: false }));

app.use('/**', (req: Request, res: Response, next: NextFunction) => {
  angularApp
    .handle(req)
    .then(response => response ? writeResponseToNodeResponse(response, res) : next())
    .catch(next);
});

// 🚀 **Iniciar el servidor**
const PORT = process.env['PORT'] || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

// Exportar el manejador de peticiones para Angular CLI
export const reqHandler = createNodeRequestHandler(app);
