'use server';

import dbConnect from '@/lib/db';
import User from '@/models/User';
import ActivityLog from '@/models/ActivityLog';
import type { User as UserType, ActivityLog as ActivityLogType, Crew as CrewType } from '@/lib/types';
import bcrypt from 'bcryptjs';
import { logActivity } from '@/lib/activity-log';
import Crew from '@/models/Crew';
import mongoose from 'mongoose';

export async function getActivityLogs(limit?: number) {
    try {
        await dbConnect();
        const query = ActivityLog.find({}).sort({ fecha: -1 }).lean();
        if (limit) {
            query.limit(limit);
        }
        const logs = await query;
        const plainLogs = logs.map(log => ({
            ...log,
            id: log._id.toString(),
            fecha: log.fecha.toISOString(),
        }));
        return { success: true, data: plainLogs as ActivityLogType[] };
    } catch (error) {
        console.error('Error al obtener los logs de actividad:', error);
        return { success: false, message: 'Error al obtener los logs de actividad.' };
    }
}


export async function getUsers(filter: { role?: 'Moderador' | 'Obrero' } = {}) {
    try {
        await dbConnect();
        const query = User.find(filter).sort({ fechaCreacion: -1 }).lean();
        const users = await query;
        const plainUsers = users.map(user => ({
            ...user,
            id: user._id.toString(),
            fechaCreacion: user.fechaCreacion.toISOString(),
        }));
        return { success: true, data: plainUsers as UserType[] };
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        return { success: false, message: 'Error al obtener los usuarios.' };
    }
}


export async function getUserById(userId: string) {
    try {
        await dbConnect();
        const user = await User.findById(userId).lean();
        if (!user) {
            return { success: false, message: 'Usuario no encontrado' };
        }
        const plainUser = {
            ...user,
            id: user._id.toString(),
            fechaCreacion: user.fechaCreacion.toISOString(),
        };
        return { success: true, data: plainUser as UserType };
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        return { success: false, message: 'Error al obtener el usuario' };
    }
}


export async function deleteUser(userId: string) {
    try {
        await dbConnect();
        
        const user = await User.findById(userId);
        if (!user) {
            return { success: false, message: "Usuario no encontrado." };
        }

        // Check if user is a member of any crew
        const crewWithUser = await Crew.findOne({
          $or: [{ moderadores: userId }, { obreros: userId }],
        });

        if (crewWithUser) {
          return { success: false, message: 'No se puede eliminar un usuario que pertenece a una cuadrilla.' };
        }
        
        await User.findByIdAndDelete(userId);
        await logActivity(`user-deletion:${user.username}`, 'Sistema');
        return { success: true, message: "Usuario eliminado exitosamente." };

    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        return { success: false, message: "Error al eliminar el usuario." };
    }
}

export async function createUser(userData: Omit<UserType, 'id' | 'fechaCreacion' | 'creadoPor' | 'status' | 'contrasena'> & { contrasena?: string }) {
    try {
        await dbConnect();

        const existingUser = await User.findOne({ $or: [{ username: userData.username }, { cedula: userData.cedula }] });
        if (existingUser) {
            return { success: false, message: 'El nombre de usuario o la cédula ya existen.' };
        }
        
        if (!userData.contrasena) {
            return { success: false, message: 'La contraseña es obligatoria.' };
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.contrasena, salt);

        const newUser = new User({
            ...userData,
            contrasena: hashedPassword,
            creadoPor: 'Admin', // Or the user who is creating it
            fechaCreacion: new Date(),
            status: 'active',
        });

        await newUser.save();
        await logActivity(`user-creation:${newUser.username}`, 'Admin');
        return { success: true, data: newUser.toJSON(), message: 'Usuario creado exitosamente.' };

    } catch (error) {
        console.error('Error al crear usuario:', error);
        return { success: false, message: 'Error al crear el usuario.' };
    }
}

export async function updateUser(userId: string, userData: Partial<Omit<UserType, 'id' | 'contrasena'>> & { contrasena?: string }) {
    try {
        await dbConnect();

        const userToUpdate = await User.findById(userId);
        if (!userToUpdate) {
            return { success: false, message: 'Usuario no encontrado.' };
        }

        const updateData: any = { ...userData };

        if (userData.contrasena) {
            const salt = await bcrypt.genSalt(10);
            updateData.contrasena = await bcrypt.hash(userData.contrasena, salt);
        } else {
            delete updateData.contrasena;
        }

        Object.assign(userToUpdate, updateData);
        await userToUpdate.save();
        
        await logActivity(`user-update:${userToUpdate.username}`, 'Admin');
        return { success: true, data: userToUpdate.toJSON(), message: 'Usuario actualizado exitosamente.' };
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        return { success: false, message: 'Error al actualizar el usuario.' };
    }
}


export async function loginUser(credentials: {username: string, password: string}) {
    try {
        await dbConnect();
        const user = await User.findOne({ username: credentials.username });

        if (!user) {
            return { success: false, message: 'Usuario no encontrado.' };
        }

        const isMatch = await bcrypt.compare(credentials.password, user.contrasena);

        if (!isMatch) {
            return { success: false, message: 'Contraseña incorrecta.' };
        }
        
        await logActivity(`user-login:${user.username}`, user.username);
        return { success: true, message: 'Inicio de sesión exitoso.' };

    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        return { success: false, message: 'Error al iniciar sesión.' };
    }
}


export async function loginObrero(cedula: string) {
    try {
        await dbConnect();
        const user = await User.findOne({ cedula: cedula, role: 'Obrero' });

        if (!user) {
            return { success: false, message: 'Obrero no encontrado con esa cédula.' };
        }

        await logActivity(`worker-login:${cedula}`, 'Sistema');
        return { success: true, message: 'Inicio de sesión de obrero exitoso.' };

    } catch (error) {
        console.error('Error al iniciar sesión de obrero:', error);
        return { success: false, message: 'Error al iniciar sesión.' };
    }
}


// Acciones de Cuadrillas
export async function getCrews() {
    try {
        await dbConnect();
        const crews = await Crew.find({})
            .populate('moderadores', 'id nombre apellido')
            .populate('obreros', 'id nombre apellido')
            .sort({ fechaCreacion: -1 })
            .lean({ virtuals: true });

        const plainCrews = crews.map(crew => {
            const plainCrew = JSON.parse(JSON.stringify(crew));
            return {
                ...plainCrew,
                id: plainCrew._id.toString(),
                fechaCreacion: new Date(plainCrew.fechaCreacion).toISOString(),
            };
        });
        
        return { success: true, data: plainCrews as CrewType[] };
    } catch (error) {
        console.error('Error al obtener cuadrillas:', error);
        return { success: false, message: 'Error al obtener las cuadrillas.' };
    }
}

export async function createCrew(crewData: { nombre: string; moderadores: string[]; obreros: string[] }) {
    try {
        await dbConnect();
        const newCrew = new Crew({
            ...crewData,
            creadoPor: 'Admin', // Asumir que el admin lo crea
        });
        await newCrew.save();
        await logActivity(`crew-creation:${newCrew.nombre}`, 'Admin');
        return { success: true, message: 'Cuadrilla creada exitosamente.' };
    } catch (error) {
        console.error('Error al crear cuadrilla:', error);
        return { success: false, message: 'Error al crear la cuadrilla.' };
    }
}

export async function updateCrew(crewId: string, crewData: { nombre: string; moderadores: string[]; obreros: string[] }) {
    try {
        await dbConnect();
        const crew = await Crew.findByIdAndUpdate(crewId, crewData, { new: true });
        if (!crew) {
            return { success: false, message: 'Cuadrilla no encontrada.' };
        }
        await logActivity(`crew-update:${crew.nombre}`, 'Admin');
        return { success: true, message: 'Cuadrilla actualizada exitosamente.' };
    } catch (error) {
        console.error('Error al actualizar cuadrilla:', error);
        return { success: false, message: 'Error al actualizar la cuadrilla.' };
    }
}

export async function deleteCrew(crewId: string) {
    try {
        await dbConnect();
        const crew = await Crew.findByIdAndDelete(crewId);
        if (!crew) {
            return { success: false, message: 'Cuadrilla no encontrada.' };
        }
        await logActivity(`crew-deletion:${crew.nombre}`, 'Admin');
        return { success: true, message: 'Cuadrilla eliminada exitosamente.' };
    } catch (error) {
        console.error('Error al eliminar cuadrilla:', error);
        return { success: false, message: 'Error al eliminar la cuadrilla.' };
    }
}
