
'use server';

import dbConnect from '@/lib/db';
import User from '@/models/User';
import ActivityLog from '@/models/ActivityLog';
import type { User as UserType, ActivityLog as ActivityLogType, Crew as CrewType, UserRole, Channel as ChannelType, Message as MessageType } from '@/lib/types';
import bcrypt from 'bcryptjs';
import { logActivity } from '@/lib/activity-log';
import Crew from '@/models/Crew';
import Channel from '@/models/Channel';
import Message from '@/models/Message';
import mongoose from 'mongoose';
import { cookies } from 'next/headers';

// Helper function to safely serialize data
function safeSerialize<T>(data: T): T {
    return JSON.parse(JSON.stringify(data));
}

export async function getActivityLogs(limit?: number) {
    try {
        await dbConnect();
        const query = ActivityLog.find({}).sort({ fecha: -1 });
        if (limit) {
            query.limit(limit);
        }
        const logs = await query.exec();
        return { success: true, data: safeSerialize(logs) as ActivityLogType[] };
    } catch (error) {
        console.error('Error al obtener los logs de actividad:', error);
        return { success: false, message: 'Error al obtener los logs de actividad.' };
    }
}


export async function getUsers(filter: { role?: UserRole } = {}) {
    try {
        await dbConnect();
        const users = await User.find(filter).sort({ fechaCreacion: -1 }).exec();
        return { success: true, data: safeSerialize(users) as UserType[] };
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        return { success: false, message: 'Error al obtener los usuarios.' };
    }
}


export async function getUserById(userId: string) {
    try {
        await dbConnect();
        const user = await User.findById(userId).exec();
        if (!user) {
            return { success: false, message: 'Usuario no encontrado' };
        }
        return { success: true, data: safeSerialize(user) as UserType };
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
        
        const crewWithUser = await Crew.findOne({
          $or: [{ moderadores: userId }, { obreros: userId }],
        });

        if (crewWithUser) {
          return { success: false, message: 'No se puede eliminar un usuario que pertenece a una cuadrilla. Primero debe desvincularlo.' };
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

        const existingUser = await User.findOne({ $or: [{ username: userData.username }, { email: userData.email }, { cedula: userData.cedula }] });
        if (existingUser) {
            let message = 'Ya existe un usuario con los mismos datos:';
            if (existingUser.username === userData.username) message += ' Nombre de usuario.';
            if (existingUser.email === userData.email) message += ' Email.';
            if (existingUser.cedula === userData.cedula) message += ' Cédula.';
            return { success: false, message };
        }
        
        if (!userData.contrasena) {
            return { success: false, message: 'La contraseña es obligatoria.' };
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.contrasena, salt);

        const newUser = new User({
            ...userData,
            contrasena: hashedPassword,
            creadoPor: 'Admin',
            fechaCreacion: new Date(),
            status: 'active',
        });

        await newUser.save();
        await logActivity(`user-creation:${newUser.username}`, 'Admin');
        return { success: true, data: safeSerialize(newUser), message: 'Usuario creado exitosamente.' };

    } catch (error) {
        console.error('Error al crear usuario:', error);
        return { success: false, message: 'Error al crear el usuario.' };
    }
}

export async function updateUser(userId: string, userData: Partial<Omit<UserType, 'id' | 'contrasena'>> & { contrasena?: string }) {
    try {
        await dbConnect();

        const updateData: any = { ...userData };

        if (userData.contrasena) {
            const salt = await bcrypt.genSalt(10);
            updateData.contrasena = await bcrypt.hash(userData.contrasena, salt);
        } else {
            delete updateData.contrasena;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).exec();
        
        if (!updatedUser) {
            return { success: false, message: 'Usuario no encontrado.' };
        }

        await logActivity(`user-update:${updatedUser.username}`, 'Admin');
        return { success: true, data: safeSerialize(updatedUser), message: 'Usuario actualizado exitosamente.' };
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
        
        // Create session cookie
        const serializedUser = safeSerialize(user);
        cookies().set('session-id', serializedUser.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
        });

        return { success: true, message: 'Inicio de sesión exitoso.', data: serializedUser };

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
        
        // Create session cookie
        const serializedUser = safeSerialize(user);
        cookies().set('session-id', serializedUser.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
        });

        return { success: true, message: 'Inicio de sesión de obrero exitoso.', data: serializedUser };

    } catch (error) {
        console.error('Error al iniciar sesión de obrero:', error);
        return { success: false, message: 'Error al iniciar sesión.' };
    }
}

export async function logout() {
    cookies().delete('session-id');
}


// Acciones de Cuadrillas
export async function getCrews() {
    try {
        await dbConnect();
        const crews = await Crew.find({})
            .populate('moderadores', 'id nombre apellido')
            .populate('obreros', 'id nombre apellido')
            .sort({ fechaCreacion: -1 })
            .exec();
        
        return { success: true, data: safeSerialize(crews) as CrewType[] };
    } catch (error) {
        console.error('Error al obtener cuadrillas:', error);
        return { success: false, message: 'Error al obtener las cuadrillas.' };
    }
}

async function getNextCrewNumber() {
    const lastCrew = await Crew.findOne().sort({ 'nombre': -1 });
    if (!lastCrew || !lastCrew.nombre.includes('N°')) return 1;
    
    try {
        const lastNumber = parseInt(lastCrew.nombre.split(' - N°')[1] || '0', 10);
        return lastNumber + 1;
    } catch {
        return 1; // Fallback if parsing fails
    }
}


export async function createCrew(crewData: { moderadores: string[]; obreros: string[] }) {
    try {
        await dbConnect();

        const crewNumber = await getNextCrewNumber();
        const crewName = `Cuadrilla - N°${crewNumber}`;

        const newCrew = new Crew({
            ...crewData,
            nombre: crewName,
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

export async function updateCrew(crewId: string, crewData: { nombre?: string; moderadores: string[]; obreros: string[] }) {
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


// Acciones de Canales
export async function getChannels() {
    try {
        await dbConnect();

        // Step 1: Ensure base channels exist (General, Moderadores, Obreros)
        const baseChannelNames = ["Anuncios Generales", "Moderadores", "Obreros"];
        for (const name of baseChannelNames) {
            const role = name === 'Anuncios Generales' ? undefined : (name.slice(0, -1) as UserRole);
            const members = await User.find(role ? { role } : {}).select('_id');
            const memberIds = members.map(m => m._id);

            await Channel.findOneAndUpdate(
                { nombre: name },
                { 
                    nombre: name,
                    type: role ? 'ROLE' : 'GENERAL',
                    members: memberIds,
                    isDeletable: false
                },
                { upsert: true, new: true }
            );
        }

        // Step 2: Sync crew channels
        const crews = await Crew.find({}).populate('moderadores obreros');
        for (const crew of crews) {
            const memberIds = [...crew.moderadores.map(m => m._id), ...crew.obreros.map(o => o._id)];
            await Channel.findOneAndUpdate(
                { crewId: crew._id },
                {
                    nombre: crew.nombre,
                    type: 'CREW',
                    members: memberIds,
                    crewId: crew._id,
                    isDeletable: false,
                },
                { upsert: true, new: true }
            );
        }

        // Step 3: Fetch all channels to return
        const channels = await Channel.find({}).sort({ 'type': 1, 'nombre': 1 }).exec();
        
        return { success: true, data: safeSerialize(channels) as ChannelType[] };
    } catch (error) {
        console.error('Error al obtener canales:', error);
        return { success: false, message: 'Error al obtener los canales.' };
    }
}

export async function createDirectChannel(userId1: string, userId2: string) {
    try {
        await dbConnect();
        
        const user2 = await User.findById(userId2);
        if (!user2) {
            return { success: false, message: "El usuario seleccionado no existe." };
        }

        // Check if a direct channel between these two users already exists
        const existingChannel = await Channel.findOne({
            type: 'DIRECT',
            members: { $all: [userId1, userId2], $size: 2 }
        });

        if (existingChannel) {
            return { success: true, data: safeSerialize(existingChannel), message: "El canal directo ya existe." };
        }

        const newChannel = new Channel({
            nombre: `Conversación con ${user2.nombre} ${user2.apellido}`,
            type: 'DIRECT',
            members: [userId1, userId2],
            isDeletable: true,
        });

        await newChannel.save();
        await logActivity(`channel-creation:direct:${user2.username}`, 'Sistema');
        return { success: true, data: safeSerialize(newChannel), message: 'Canal directo creado exitosamente.' };
    } catch (error) {
        console.error('Error al crear canal directo:', error);
        return { success: false, message: 'Error al crear el canal directo.' };
    }
}


export async function getMessages(channelId: string) {
    try {
        await dbConnect();
        const messages = await Message.find({ channelId })
            .populate('senderId', 'nombre apellido username')
            .sort({ fecha: 1 })
            .exec();
        return { success: true, data: safeSerialize(messages) as MessageType[] };
    } catch (error) {
        console.error('Error al obtener mensajes:', error);
        return { success: false, message: 'Error al obtener mensajes del canal.' };
    }
}


export async function sendMessage(channelId: string, senderId: string, content: string) {
    try {
        await dbConnect();
        const newMessage = new Message({
            channelId,
            senderId,
            content
        });
        await newMessage.save();
        
        const populatedMessage = await Message.findById(newMessage._id).populate('senderId', 'nombre apellido username').exec();

        return { success: true, data: safeSerialize(populatedMessage), message: "Mensaje enviado." };
    } catch (error) {
        console.error('Error al enviar mensaje:', error);
        return { success: false, message: 'Error al enviar el mensaje.' };
    }
}


    

    

    