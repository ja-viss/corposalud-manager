export type UserRole = 'Admin' | 'Moderador' | 'Obrero';

export interface User {
  id: string;
  nombre: string;
  apellido: string;
  cedula: string;
  email: string;
  telefono: string;
  role: UserRole;
  fechaCreacion: string;
  creadoPor: string;
  status: 'active' | 'inactive';
}

export interface Crew {
    id: string;
    nombre: string;
    moderadores: User[];
    obreros: User[];
    fechaCreacion: string;
    creadoPor: string;
}
