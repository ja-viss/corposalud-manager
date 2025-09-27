
export type UserRole = 'Admin' | 'Moderador' | 'Obrero';

export interface User {
  id: string;
  nombre: string;
  apellido: string;
  cedula: string;
  email: string;
  telefono: string;
  username: string;
  contrasena?: string; // Optional on client-side
  role: UserRole;
  fechaCreacion: string;
  creadoPor: string;
  status: 'active' | 'inactive';
}

export interface Crew {
    id: string;
    nombre: string;
    moderadores: Pick<User, 'id' | 'nombre' | 'apellido'>[];
    obreros: Pick<User, 'id' | 'nombre' | 'apellido'>[];
    fechaCreacion: string;
    creadoPor: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  realizadoPor: string;
  fecha: string;
  detalles?: string;
}

export interface Channel {
  id: string;
  nombre: string;
  type: 'GENERAL' | 'CREW' | 'ROLE' | 'DIRECT';
  members: string[];
  crewId?: string;
  isDeletable: boolean;
  fechaCreacion: string;
}

export interface Message {
  id: string;
  channelId: string;
  senderId: Pick<User, 'id' | 'nombre' | 'apellido' | 'username'>;
  content: string;
  fecha: string;
}
