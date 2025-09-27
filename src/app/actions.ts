'use server';

import dbConnect from '@/lib/db';
import User from '@/models/User';
import ActivityLog from '@/models/ActivityLog';
import type { User as UserType, ActivityLog as ActivityLogType } from '@/lib/types';
import bcrypt from 'bcryptjs';
import { logActivity } from '@/lib/activity-log';
import Crew from '@/models/Crew';

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


export async function getUsers() {
    try {
        await dbConnect();
        const users = await User.find({}).sort({ fechaCreacion: -1 }).lean();
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

export async function createUser(userData: Omit<UserType, 'id' | 'fechaCreacion' | 'creadoPor' | 'status'> & { username: string, contrasena: string }) {
    try {
        await dbConnect();

        const existingUser = await User.findOne({ $or: [{ username: userData.username }, { cedula: userData.cedula }] });
        if (existingUser) {
            return { success: false, message: 'El nombre de usuario o la cédula ya existen.' };
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
        return { success: true, message: 'Usuario creado exitosamente.' };

    } catch (error) {
        console.error('Error al crear usuario:', error);
        return { success: false, message: 'Error al crear el usuario.' };
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