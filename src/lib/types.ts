/**
 * @file types.ts
 * @description Este archivo centraliza todas las definiciones de tipos e interfaces de TypeScript
 * que se utilizan a lo largo de la aplicación.
 *
 * Definir los tipos en un solo lugar asegura la consistencia de los datos entre el frontend
 * (componentes de React) y el backend (Server Actions, modelos de base de datos),
 * facilitando el mantenimiento y la detección de errores en tiempo de compilación.
 */

/**
 * Define los roles de usuario permitidos en el sistema.
 */
export type UserRole = 'Admin' | 'Moderador' | 'Obrero';

/**
 * Representa la estructura de un documento de Usuario en la base de datos.
 */
export interface User {
  _id: string; // ID de MongoDB
  id: string; // Virtual `id` para conveniencia en el frontend
  nombre: string;
  apellido: string;
  cedula: string;
  email: string;
  telefono: string;
  username: string;
  contrasena?: string; // Es opcional porque no se envía al cliente
  role: UserRole;
  fechaCreacion: string; // Se almacena como Date, se serializa a string
  creadoPor: string;
  status: 'active' | 'inactive';
}

/**
 * Representa la estructura de un documento de Cuadrilla.
 * Los miembros (moderadores y obreros) se definen con un Pick para solo incluir
 * los campos necesarios en la representación básica.
 */
export interface Crew {
    _id: string;
    id: string;
    nombre: string;
    descripcion?: string;
    moderadores: Pick<User, 'id' | 'nombre' | 'apellido'>[];
    obreros: Pick<User, 'id' | 'nombre' | 'apellido'>[];
    fechaCreacion: string;
    creadoPor: string;
}

/**
 * Representa una Cuadrilla con sus miembros completamente populados (objetos `User` completos).
 */
export type PopulatedCrew = Omit<Crew, 'moderadores' | 'obreros'> & {
  moderadores: User[];
  obreros: User[];
}

/**
 * Representa la estructura de un registro en la bitácora de actividad.
 */
export interface ActivityLog {
  id: string;
  action: string; // Acción realizada (ej. 'user-creation')
  realizadoPor: string; // Username de quien realizó la acción
  fecha: string;
  detalles?: string; // Información adicional
}

/**
 * Representa la estructura de un Canal de chat.
 */
export interface Channel {
  id: string;
  nombre: string;
  type: 'GENERAL' | 'CREW' | 'ROLE' | 'DIRECT' | 'GROUP';
  members: string[]; // Array de IDs de usuarios
  crewId?: string; // ID de la cuadrilla asociada (si es de tipo 'CREW')
  isDeletable: boolean; // Indica si el canal puede ser eliminado por un usuario
  fechaCreacion: string;
  lastMessageAt: string; // Timestamp del último mensaje para ordenar la lista de canales
}

/**
 * Información básica del remitente de un mensaje.
 */
export type SenderInfo = Pick<User, 'id' | 'nombre' | 'apellido' | 'username' | 'role'>;

/**
 * Representa la estructura de un documento de Mensaje.
 * `senderId` puede ser un string (ID) o el objeto populado `SenderInfo`.
 */
export interface Message {
  id: string;
  channelId: string;
  senderId: string | SenderInfo;
  content: string;
  fecha: string;
}

/**
 * Representa un Mensaje con la información del remitente (`senderId`) populada.
 */
export interface PopulatedMessage {
    id: string;
    channelId: string;
    senderId: SenderInfo | null; // Puede ser null si el usuario fue eliminado
    content: string;
    fecha: string;
}

/**
 * Representa una entrada de herramienta en un reporte de trabajo.
 */
export interface ToolEntry {
  nombre: string;
  cantidad: number;
}

/**
 * Representa la estructura de un Reporte de Trabajo.
 */
export interface WorkReport {
  _id: string;
  id: string;
  crewId: string; // ID de la cuadrilla
  municipio: string;
  distancia: number;
  comentarios: string;
  herramientasUtilizadas?: ToolEntry[];
  herramientasDanadas?: ToolEntry[];
  herramientasExtraviadas?: ToolEntry[];
  realizadoPor: string; // ID del usuario que creó el reporte
  fecha: string;
}

/**
 * Representa un Reporte de Trabajo con los campos `crewId` y `realizadoPor` populados.
 */
export type PopulatedWorkReport = Omit<WorkReport, 'crewId' | 'realizadoPor'> & {
  crewId: PopulatedCrew | null;
  realizadoPor: Pick<User, 'id' | 'nombre' | 'apellido' | 'role'> | null;
};
