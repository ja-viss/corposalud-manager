'use server';

import dbConnect from '@/lib/db';
import User from '@/models/User';
import type { User as UserType } from '@/lib/types';
import bcrypt from 'bcryptjs';

export async function getUsers() {
    try {
        await dbConnect();
        const users = await User.find({}).sort({ fechaCreacion: -1 });
        const plainUsers = users.map(user => {
            const userObject = user.toObject({ getters: true });
            userObject.id = userObject._id.toString();
            delete userObject._id;
            delete userObject.__v;
            return userObject;
        })
        return { success: true, data: plainUsers as UserType[] };
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        return { success: false, message: 'Error al obtener los usuarios.' };
    }
}

export async function deleteUser(userId: string) {
    try {
        await dbConnect();
        
        // Find user first to check dependencies, e.g. if they are in a crew
        const user = await User.findById(userId);
        if (!user) {
            return { success: false, message: "Usuario no encontrado." };
        }

        // Add logic here to check if user is in a crew before deleting
        
        await User.findByIdAndDelete(userId);
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
            creadoPor: 'Admin', // O el usuario que lo está creando
            fechaCreacion: new Date(),
            status: 'active',
        });

        await newUser.save();
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

        return { success: true, message: 'Inicio de sesión de obrero exitoso.' };

    } catch (error) {
        console.error('Error al iniciar sesión de obrero:', error);
        return { success: false, message: 'Error al iniciar sesión.' };
    }
}
