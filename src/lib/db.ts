/**
 * @file db.ts
 * @description Gestiona la conexión a la base de datos MongoDB usando Mongoose.
 *
 * Este script implementa un patrón para crear y reutilizar una única conexión a la base de datos
 * a lo largo de la aplicación, especialmente en un entorno serverless como Vercel o Next.js.
 * Utiliza un objeto `global` para cachear la conexión y la promesa de conexión,
 * evitando así la creación de múltiples conexiones en cada recarga en caliente (hot reload)
 * durante el desarrollo.
 *
 * @see https://mongoosejs.com/docs/connections.html
 * @see https://www.mongodb.com/blog/post/serverless-development-with-nodejs-mongodb-and-vercel
 */

import mongoose from 'mongoose';

// Obtener la URI de MongoDB desde las variables de entorno.
const MONGODB_URI = process.env.MONGODB_URI;

// Si la URI no está definida, lanzar un error para detener la aplicación.
if (!MONGODB_URI) {
  throw new Error(
    'Por favor, defina la variable de entorno MONGODB_URI dentro de .env.local'
  );
}

/**
 * Objeto global para cachear la conexión de Mongoose.
 * `cached.conn`: Almacena la conexión activa.
 * `cached.promise`: Almacena la promesa de la conexión en curso para evitar conexiones concurrentes.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

/**
 * Establece una conexión con la base de datos MongoDB.
 * Si ya existe una conexión cacheada, la reutiliza.
 * Si no, crea una nueva conexión y la cachea para futuros usos.
 *
 * @returns {Promise<typeof mongoose>} Una promesa que se resuelve con la instancia de Mongoose conectada.
 */
async function dbConnect() {
  // Si ya hay una conexión, la retornamos inmediatamente.
  if (cached.conn) {
    return cached.conn;
  }

  // Si no hay una promesa de conexión, creamos una.
  if (!cached.promise) {
    const opts = {
      // Evita que Mongoose ponga en cola los comandos si aún no está conectado.
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      // Una vez resuelta la promesa, la conexión está lista.
      return mongoose;
    });
  }

  try {
    // Esperamos a que la promesa de conexión se resuelva.
    cached.conn = await cached.promise;
  } catch (e) {
    // Si la conexión falla, reseteamos la promesa para permitir un nuevo intento.
    cached.promise = null;
    throw e;
  }
  
  // Retornamos la conexión establecida.
  return cached.conn;
}

export default dbConnect;
