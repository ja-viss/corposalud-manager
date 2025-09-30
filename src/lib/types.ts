

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
    descripcion?: string;
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
  type: 'GENERAL' | 'CREW' | 'ROLE' | 'DIRECT' | 'GROUP';
  members: string[];
  crewId?: string;
  isDeletable: boolean;
  fechaCreacion: string;
  lastMessageAt: string;
}

export type SenderInfo = Pick<User, 'id' | 'nombre' | 'apellido' | 'username' | 'role'>;

export interface Message {
  id: string;
  channelId: string;
  senderId: string | SenderInfo;
  content: string;
  fecha: string;
}

export interface PopulatedMessage {
    id: string;
    channelId: string;
    senderId: SenderInfo | null;
    content: string;
    fecha: string;
}

export interface ToolEntry {
  nombre: string;
  cantidad: number;
}

export interface WorkReport {
  id: string;
  crewId: string;
  municipio: string;
  distancia: number;
  comentarios: string;
  herramientasUtilizadas?: ToolEntry[];
  herramientasDanadas?: ToolEntry[];
  herramientasExtraviadas?: ToolEntry[];
  realizadoPor: string;
  fecha: string;
}

export type PopulatedWorkReport = Omit<WorkReport, 'crewId' | 'realizadoPor'> & {
  crewId: Pick<Crew, 'id' | 'nombre'> | null;
  realizadoPor: Pick<User, 'id' | 'nombre' | 'apellido'>;
};
    

    

