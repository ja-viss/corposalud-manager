'use server';

import dbConnect from '@/lib/db';

export async function verifyDbConnection() {
  try {
    await dbConnect();
    return { success: true, message: 'Conexión a la base de datos exitosa.' };
  } catch (error) {
    console.error('Error de conexión a la base de datos:', error);
    // Asegúrate de no filtrar información sensible en el mensaje de error al cliente.
    return { success: false, message: 'Error al conectar con la base de datos.' };
  }
}
