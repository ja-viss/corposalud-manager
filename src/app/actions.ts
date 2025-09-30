

'use server';

import dbConnect from '@/lib/db';
import User from '@/models/User';
import ActivityLog from '@/models/ActivityLog';
import type { User as UserType, ActivityLog as ActivityLogType, Crew as CrewType, UserRole, Channel as ChannelType, Message as MessageType, PopulatedMessage, WorkReport as WorkReportType, PopulatedWorkReport, PopulatedCrew } from '@/lib/types';
import bcrypt from 'bcryptjs';
import { logActivity } from '@/lib/activity-log';
import Crew from '@/models/Crew';
import Channel from '@/models/Channel';
import Message from '@/models/Message';
import WorkReport from '@/models/WorkReport';
import mongoose from 'mongoose';
import { cookies } from 'next/headers';

// Helper function to safely serialize data
function safeSerialize<T>(data: T): T {
    return JSON.parse(JSON.stringify(data));
}

// Helper to get current user from session
async function getCurrentUserFromSession(): Promise<UserType | null> {
    const userId = cookies().get('session-id')?.value;
    if (!userId) return null;
    const user = await User.findById(userId).lean().exec();
    return user ? safeSerialize(user) as UserType : null;
}


export async function getActivityLogs(limit?: number) {
    try {
        await dbConnect();
        const currentUser = await getCurrentUserFromSession();
        if (!currentUser) return { success: false, message: "Acceso no autorizado." };

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


export async function getUsers(filter: { role?: UserRole | UserRole[] } = {}) {
    try {
        await dbConnect();
        const currentUser = await getCurrentUserFromSession();

        if (!currentUser) {
            return { success: false, message: "Acceso no autorizado." };
        }
        
        // Start with a filter to exclude the current user
        const queryFilter: any = { _id: { $ne: new mongoose.Types.ObjectId(currentUser.id) } };


        if (filter.role) {
            const roles = Array.isArray(filter.role) ? filter.role : [filter.role];
            queryFilter.role = { $in: roles };
        }

        // If the user is a Moderator, they can ONLY see Obreros, unless they explicitly ask for other roles
        if (currentUser.role === 'Moderador' && !filter.role) {
            queryFilter.role = 'Obrero';
        }

        const users = await User.find(queryFilter).sort({ fechaCreacion: -1 }).exec();

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
        const currentUser = await getCurrentUserFromSession();
        if (!currentUser || (currentUser.role !== 'Admin' && currentUser.role !== 'Moderador')) {
            return { success: false, message: "No tiene permiso para realizar esta acción." };
        }
        
        const userToDelete = await User.findById(userId);
        if (!userToDelete) {
            return { success: false, message: "Usuario no encontrado." };
        }
        
        if (currentUser.role === 'Moderador' && userToDelete.role !== 'Obrero') {
             return { success: false, message: "Los moderadores solo pueden eliminar obreros." };
        }

        const crewWithUser = await Crew.findOne({
          $or: [{ moderadores: userId }, { obreros: userId }],
        });

        if (crewWithUser) {
          return { success: false, message: 'No se puede eliminar un usuario que pertenece a una cuadrilla. Primero debe desvincularlo.' };
        }
        
        await User.findByIdAndDelete(userId);
        await logActivity(`user-deletion:${userToDelete.username}`, currentUser.username);
        return { success: true, message: "Usuario eliminado exitosamente." };

    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        return { success: false, message: "Error al eliminar el usuario." };
    }
}

export async function createUser(userData: Partial<Omit<UserType, 'id' | 'fechaCreacion' | 'creadoPor' | 'status'>>) {
    try {
        await dbConnect();
        const currentUser = await getCurrentUserFromSession();
        if (!currentUser || (currentUser.role !== 'Admin' && currentUser.role !== 'Moderador')) {
            return { success: false, message: "No tiene permiso para realizar esta acción." };
        }
        
        if (currentUser.role === 'Moderador' && userData.role !== 'Obrero') {
            return { success: false, message: "Los moderadores solo pueden crear usuarios con el rol de Obrero." };
        }

        const existingUser = await User.findOne({ $or: [{ email: userData.email }, { cedula: userData.cedula }] });
        if (existingUser) {
            let message = 'Ya existe un usuario con los mismos datos:';
            if (existingUser.email === userData.email) message += ' Email.';
            if (existingUser.cedula === userData.cedula) message += ' Cédula.';
            return { success: false, message };
        }
        
        let finalUsername = userData.username;
        let finalPassword = userData.contrasena;
        let generatedPasswordForResponse: string | undefined = undefined;
        let finalRole = userData.role;

        if (userData.role === 'Obrero') {
            finalUsername = userData.cedula;
            finalPassword = userData.cedula; 
        } else if (userData.role === 'Moderador') {
            finalUsername = userData.cedula;
            const initialName = userData.nombre?.charAt(0).toUpperCase() ?? '';
            const initialLastName = userData.apellido?.charAt(0).toUpperCase() ?? '';
            finalPassword = `${initialName}${initialLastName}${userData.cedula}`;
            generatedPasswordForResponse = finalPassword;
        } else if (userData.role === 'Admin') {
            if (!finalUsername) {
                return { success: false, message: 'El nombre de usuario es obligatorio para el rol de Admin.' };
            }
             const existingByUsername = await User.findOne({ username: finalUsername });
             if(existingByUsername) return { success: false, message: 'Ya existe un usuario con el mismo nombre de usuario.' };

            if (!finalPassword) {
                return { success: false, message: 'La contraseña es obligatoria para el rol de Admin.' };
            }
        } else {
            // Default users without a valid role to 'Moderador'
            finalRole = 'Moderador';
            finalUsername = userData.cedula;
            const initialName = userData.nombre?.charAt(0).toUpperCase() ?? '';
            const initialLastName = userData.apellido?.charAt(0).toUpperCase() ?? '';
            finalPassword = `${initialName}${initialLastName}${userData.cedula}`;
            generatedPasswordForResponse = finalPassword;
        }

        if (!finalUsername || !finalPassword) {
             return { success: false, message: 'Faltan credenciales para crear el usuario.' };
        }


        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(finalPassword, salt);

        const newUser = new User({
            ...userData,
            role: finalRole,
            username: finalUsername,
            contrasena: hashedPassword,
            creadoPor: currentUser.username,
            fechaCreacion: new Date(),
            status: 'active',
        });

        await newUser.save();
        await logActivity(`user-creation:${newUser.username}`, currentUser.username);
        
        const responseData = safeSerialize(newUser) as any;
        if (generatedPasswordForResponse) {
           responseData.generatedPassword = generatedPasswordForResponse;
        }

        return { success: true, data: responseData, message: 'Usuario creado exitosamente.' };

    } catch (error) {
        console.error('Error al crear usuario:', error);
        return { success: false, message: 'Error al crear el usuario.' };
    }
}

export async function updateUser(userId: string, userData: Partial<Omit<UserType, 'id' | 'contrasena'>> & { contrasena?: string }) {
    try {
        await dbConnect();
        const currentUser = await getCurrentUserFromSession();
        if (!currentUser || (currentUser.role !== 'Admin' && currentUser.role !== 'Moderador')) {
            return { success: false, message: "No tiene permiso para realizar esta acción." };
        }

        const userToUpdate = await User.findById(userId);
        if (!userToUpdate) {
            return { success: false, message: 'Usuario no encontrado.' };
        }

        if (currentUser.role === 'Moderador' && (userToUpdate.role !== 'Obrero' || (userData.role && userData.role !== 'Obrero'))) {
            return { success: false, message: "Los moderadores solo pueden modificar usuarios con el rol de Obrero." };
        }


        const updateData: any = { ...userData };

        if (userData.contrasena) {
            const salt = await bcrypt.genSalt(10);
            updateData.contrasena = await bcrypt.hash(userData.contrasena, salt);
        } else {
            delete updateData.contrasena;
        }
        
        // Prevent role escalation by moderators
        if (currentUser.role === 'Moderador') {
            delete updateData.role;
        }


        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).exec();
        
        if (!updatedUser) {
            return { success: false, message: 'Usuario no encontrado.' };
        }

        await logActivity(`user-update:${updatedUser.username}`, currentUser.username);
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


export async function updatePassword(userId: string, currentPassword: string, newPassword: string) {
    try {
        await dbConnect();

        const user = await User.findById(userId);
        if (!user) {
            return { success: false, message: "Usuario no encontrado." };
        }

        const isMatch = await bcrypt.compare(currentPassword, user.contrasena);
        if (!isMatch) {
            return { success: false, message: "La contraseña actual es incorrecta." };
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.contrasena = hashedPassword;
        await user.save();
        
        const currentUser = await getCurrentUserFromSession();
        await logActivity(`user-password-change:${user.username}`, currentUser?.username || 'Sistema');
        return { success: true, message: "Contraseña actualizada exitosamente." };

    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        return { success: false, message: "Error al cambiar la contraseña." };
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
            .exec();
        
        return { success: true, data: safeSerialize(crews) as CrewType[] };
    } catch (error) {
        console.error('Error al obtener cuadrillas:', error);
        return { success: false, message: 'Error al obtener las cuadrillas.' };
    }
}

export async function getUserCrews(userId: string) {
    try {
        await dbConnect();
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const crews = await Crew.find({
            $or: [{ moderadores: userObjectId }, { obreros: userObjectId }]
        }).lean().exec();
        
        return { success: true, data: safeSerialize(crews) as CrewType[] };
    } catch (error) {
        console.error('Error al obtener las cuadrillas del usuario:', error);
        return { success: false, message: 'Error al obtener las cuadrillas del usuario.' };
    }
}

export async function getCrewById(crewId: string) {
    try {
        await dbConnect();
        const crew = await Crew.findById(crewId)
            .populate('moderadores', 'id nombre apellido')
            .populate('obreros', 'id nombre apellido')
            .exec();

        if (!crew) {
            return { success: false, message: 'Cuadrilla no encontrada' };
        }
        return { success: true, data: safeSerialize(crew) as CrewType };
    } catch (error) {
        console.error('Error fetching crew by ID:', error);
        return { success: false, message: 'Error al obtener la cuadrilla' };
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


export async function createCrew(crewData: { descripcion?: string; moderadores: string[]; obreros: string[] }) {
    try {
        await dbConnect();
        const currentUser = await getCurrentUserFromSession();
         if (!currentUser) {
            return { success: false, message: "Acceso no autorizado." };
        }
        
        // --- Validation: Check if any of the selected workers are already in another crew ---
        const conflictingCrews = await Crew.find({ obreros: { $in: crewData.obreros } });
        if (conflictingCrews.length > 0) {
            const assignedObreros = await User.find({ _id: { $in: conflictingCrews.flatMap(c => c.obreros) } }).select('nombre apellido');
            const assignedNames = assignedObreros.map(o => `${o.nombre} ${o.apellido}`).join(', ');
            return { success: false, message: `Los siguientes obreros ya están en otra cuadrilla: ${assignedNames}.` };
        }
        // --- End Validation ---

        const crewNumber = await getNextCrewNumber();
        const crewName = `Cuadrilla - N°${crewNumber}`;

        const newCrew = new Crew({
            ...crewData,
            nombre: crewName,
            creadoPor: currentUser.username, 
        });
        await newCrew.save();
        await logActivity(`crew-creation:${newCrew.nombre}`, currentUser.username);
        return { success: true, message: 'Cuadrilla creada exitosamente.' };
    } catch (error) {
        console.error('Error al crear cuadrilla:', error);
        return { success: false, message: 'Error al crear la cuadrilla.' };
    }
}

export async function updateCrew(crewId: string, crewData: { nombre?: string; descripcion?: string; moderadores: string[]; obreros: string[] }) {
    try {
        await dbConnect();
        const currentUser = await getCurrentUserFromSession();
         if (!currentUser) {
            return { success: false, message: "Acceso no autorizado." };
        }
        
        // --- Validation: Check if any of the selected workers are already in another crew ---
        const crewObjectId = new mongoose.Types.ObjectId(crewId);
        const conflictingCrews = await Crew.find({ 
            _id: { $ne: crewObjectId }, // Exclude the current crew from the check
            obreros: { $in: crewData.obreros } 
        });

        if (conflictingCrews.length > 0) {
            const assignedObreroIds = conflictingCrews.flatMap(c => c.obreros.map(o => o.toString()));
            const selectedObreroIds = crewData.obreros;
            const conflictIds = selectedObreroIds.filter(id => assignedObreroIds.includes(id));
            
            const assignedObreros = await User.find({ _id: { $in: conflictIds } }).select('nombre apellido');
            const assignedNames = assignedObreros.map(o => `${o.nombre} ${o.apellido}`).join(', ');
            return { success: false, message: `Los siguientes obreros ya están en otra cuadrilla: ${assignedNames}.` };
        }
        // --- End Validation ---

        const crew = await Crew.findByIdAndUpdate(crewId, crewData, { new: true });
        if (!crew) {
            return { success: false, message: 'Cuadrilla no encontrada.' };
        }
        await logActivity(`crew-update:${crew.nombre}`, currentUser.username);
        return { success: true, message: 'Cuadrilla actualizada exitosamente.' };
    } catch (error) {
        console.error('Error al actualizar cuadrilla:', error);
        return { success: false, message: 'Error al actualizar la cuadrilla.' };
    }
}

export async function deleteCrew(crewId: string) {
    try {
        await dbConnect();
        const currentUser = await getCurrentUserFromSession();
        if (!currentUser) {
            return { success: false, message: "Acceso no autorizado." };
        }

        const crewObjectId = new mongoose.Types.ObjectId(crewId);

        // Find and delete the associated channel and its messages
        const channelToDelete = await Channel.findOne({ crewId: crewObjectId });
        if (channelToDelete) {
            await Message.deleteMany({ channelId: channelToDelete._id });
            await Channel.findByIdAndDelete(channelToDelete._id);
            await logActivity(`channel-deletion-auto:${channelToDelete.nombre}`, currentUser.username);
        }

        // Delete the crew
        const crew = await Crew.findByIdAndDelete(crewId);
        if (!crew) {
            return { success: false, message: 'Cuadrilla no encontrada.' };
        }
        
        await logActivity(`crew-deletion:${crew.nombre}`, currentUser.username);
        return { success: true, message: 'Cuadrilla y su canal de chat han sido eliminados.' };
    } catch (error) {
        console.error('Error al eliminar cuadrilla:', error);
        return { success: false, message: 'Error al eliminar la cuadrilla.' };
    }
}


// Acciones de Canales
export async function getChannels(userId?: string, userRole?: UserRole) {
    try {
        await dbConnect();

        // Step 1: Ensure base channels exist and sync members
        const baseChannels = [
            { name: "Anuncios Generales", type: 'GENERAL', roles: ['Admin', 'Moderador', 'Obrero'] },
            { name: "Moderadores", type: 'ROLE', roles: ['Admin', 'Moderador'] },
            { name: "Obreros", type: 'ROLE', roles: ['Admin', 'Moderador', 'Obrero'] }
        ];

        for (const ch of baseChannels) {
            const members = await User.find({ role: { $in: ch.roles } }).select('_id');
            const memberIds = members.map(m => m._id);

            await Channel.findOneAndUpdate(
                { nombre: ch.name },
                { 
                    nombre: ch.name,
                    type: ch.type,
                    $addToSet: { members: memberIds }, // Use $addToSet to avoid duplicates
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
        
        // Step 3: Fetch channels where the current user is a member
        if (!userId) {
            return { success: false, message: 'ID de usuario no proporcionado.' };
        }
        
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const channels = await Channel.find({ members: userObjectId }).sort({ lastMessageAt: -1 }).exec();
        
        return { success: true, data: safeSerialize(channels) as ChannelType[] };
    } catch (error) {
        console.error('Error al obtener canales:', error);
        return { success: false, message: 'Error al obtener los canales.' };
    }
}

export async function createDirectChannel(userId1: string, userId2: string) {
    try {
        await dbConnect();
        
        const user1 = await User.findById(userId1);
        const user2 = await User.findById(userId2);
        
        if (!user1 || !user2) {
            return { success: false, message: "Uno de los usuarios no existe." };
        }

        // Check if a direct channel between these two users already exists
        const existingChannel = await Channel.findOne({
            type: 'DIRECT',
            members: { $all: [user1._id, user2._id], $size: 2 }
        });

        if (existingChannel) {
            return { success: true, data: safeSerialize(existingChannel), message: "El canal directo ya existe." };
        }
        
        const channelNameForUser1 = `Conversación con ${user2.nombre} ${user2.apellido}`;
        
        const newChannel = new Channel({
            nombre: channelNameForUser1,
            type: 'DIRECT',
            members: [user1._id, user2._id],
            isDeletable: true,
        });

        await newChannel.save();
        await logActivity(`channel-creation:direct:${user2.username}`, user1.username);
        return { success: true, data: safeSerialize(newChannel), message: 'Canal directo creado exitosamente.' };
    } catch (error) {
        console.error('Error al crear canal directo:', error);
        return { success: false, message: 'Error al crear el canal directo.' };
    }
}

export async function createGroupChannel(name: string, memberIds: string[], createdBy: string) {
    try {
        await dbConnect();
        
        const creator = await User.findById(createdBy);
        if (!creator) {
            return { success: false, message: "Usuario creador no encontrado." };
        }

        const newChannel = new Channel({
            nombre: name,
            type: 'GROUP',
            members: memberIds,
            isDeletable: true,
        });

        await newChannel.save();
        await logActivity(`channel-creation:group:${name}`, creator.username);
        return { success: true, data: safeSerialize(newChannel), message: 'Grupo creado exitosamente.' };
    } catch (error) {
        console.error('Error al crear canal de grupo:', error);
        return { success: false, message: 'Error al crear el grupo.' };
    }
}

export async function addMembersToChannel(channelId: string, memberIds: string[]) {
    try {
        await dbConnect();
        const currentUser = await getCurrentUserFromSession();
        if (!currentUser || currentUser.role !== 'Admin') {
            return { success: false, message: 'No tiene permiso para realizar esta acción.' };
        }

        const channel = await Channel.findById(channelId);
        if (!channel || channel.type !== 'GROUP') {
            return { success: false, message: 'Canal no encontrado o no es un grupo.' };
        }

        await Channel.findByIdAndUpdate(channelId, { $addToSet: { members: { $each: memberIds } } });
        
        await logActivity(`channel-members-add:${channel.nombre}`, currentUser.username);
        return { success: true, message: 'Miembros añadidos exitosamente.' };
    } catch (error) {
        console.error('Error al añadir miembros al canal:', error);
        return { success: false, message: 'Error al añadir miembros al canal.' };
    }
}

export async function removeMembersFromChannel(channelId: string, memberIds: string[]) {
    try {
        await dbConnect();
         const currentUser = await getCurrentUserFromSession();
        if (!currentUser || currentUser.role !== 'Admin') {
            return { success: false, message: 'No tiene permiso para realizar esta acción.' };
        }

        const channel = await Channel.findById(channelId);
        if (!channel || channel.type !== 'GROUP') {
            return { success: false, message: 'Canal no encontrado o no es un grupo.' };
        }
        
        // Ensure the creator/admin is not removed
        const safeMemberIds = memberIds.filter(id => id !== currentUser.id);

        await Channel.findByIdAndUpdate(channelId, { $pullAll: { members: safeMemberIds } });
        
        await logActivity(`channel-members-remove:${channel.nombre}`, currentUser.username);
        return { success: true, message: 'Miembros expulsados exitosamente.' };
    } catch (error) {
        console.error('Error al expulsar miembros del canal:', error);
        return { success: false, message: 'Error al expulsar miembros del canal.' };
    }
}


export async function deleteChannel(channelId: string, userId: string) {
    try {
        await dbConnect();

        const user = await User.findById(userId);
        if (!user) {
            return { success: false, message: "Usuario no autorizado." };
        }

        const channel = await Channel.findById(channelId);
        if (!channel) {
            return { success: false, message: "Canal no encontrado." };
        }

        if (!channel.isDeletable) {
            return { success: false, message: "Este canal no puede ser eliminado." };
        }
        
        // Only admins can delete channels
        if (user.role !== 'Admin') {
            return { success: false, message: "No tienes permiso para eliminar este canal." };
        }
        
        // Delete all messages in the channel
        await Message.deleteMany({ channelId: channel._id });

        // Delete the channel itself
        await Channel.findByIdAndDelete(channelId);

        await logActivity(`channel-deletion:${channel.nombre}`, user.username);
        return { success: true, message: "La conversación ha sido eliminada exitosamente." };

    } catch (error) {
        console.error('Error al eliminar canal:', error);
        return { success: false, message: 'Error al eliminar el canal.' };
    }
}


export async function getMessages(channelId: string) {
    try {
        await dbConnect();
        const messages = await Message.find({ channelId })
            .populate('senderId', 'nombre apellido username role')
            .sort({ fecha: 1 })
            .lean() // Use .lean() for faster, plain JS objects
            .exec();
        
        // Manually serialize and structure the data
        const processedMessages = messages.map(msg => {
            const sender = msg.senderId as any; // Cast sender to any
            return {
                id: msg._id.toString(),
                channelId: msg.channelId.toString(),
                content: msg.content,
                fecha: msg.fecha.toISOString(),
                senderId: sender ? {
                    id: sender._id.toString(),
                    nombre: sender.nombre,
                    apellido: sender.apellido,
                    username: sender.username,
                    role: sender.role,
                } : null
            };
        });
            
        return { success: true, data: processedMessages as PopulatedMessage[] };
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

        // Update the channel's lastMessageAt timestamp
        await Channel.findByIdAndUpdate(channelId, { lastMessageAt: new Date() });
        
        const populatedMessage = await Message.findById(newMessage._id)
            .populate('senderId', 'nombre apellido username role')
            .lean()
            .exec();

        if (!populatedMessage) {
            return { success: false, message: 'Error al recuperar el mensaje enviado.' };
        }

        const sender = populatedMessage.senderId as any;
        const processedMessage: PopulatedMessage = {
             id: populatedMessage._id.toString(),
             channelId: populatedMessage.channelId.toString(),
             content: populatedMessage.content,
             fecha: populatedMessage.fecha.toISOString(),
             senderId: sender ? {
                 id: sender._id.toString(),
                 nombre: sender.nombre,
                 apellido: sender.apellido,
                 username: sender.username,
                 role: sender.role,
             } : null
        };
        
        return { success: true, data: processedMessage, message: "Mensaje enviado." };
    } catch (error) {
        console.error('Error al enviar mensaje:', error);
        return { success: false, message: 'Error al enviar el mensaje.' };
    }
}


export async function deleteMessage(messageId: string) {
    try {
        await dbConnect();
        const deletedMessage = await Message.findByIdAndDelete(messageId);
        if (!deletedMessage) {
            return { success: false, message: 'Mensaje no encontrado.' };
        }
        const currentUser = await getCurrentUserFromSession();
        await logActivity(`message-deletion:${messageId}`, currentUser?.username || 'Sistema');
        return { success: true, message: 'Mensaje eliminado exitosamente.' };
    } catch (error) {
        console.error('Error al eliminar mensaje:', error);
        return { success: false, message: 'Error al eliminar el mensaje.' };
    }
}

// Acciones de Reportes de Trabajo
export async function createWorkReport(data: Omit<WorkReportType, 'id' | 'realizadoPor' | 'fecha'>) {
    try {
        await dbConnect();
        const currentUser = await getCurrentUserFromSession();
        if (!currentUser || (currentUser.role !== 'Admin' && currentUser.role !== 'Moderador')) {
            return { success: false, message: "No tiene permiso para realizar esta acción." };
        }

        const newWorkReport = new WorkReport({
            ...data,
            realizadoPor: new mongoose.Types.ObjectId(currentUser.id),
            fecha: new Date(),
        });

        await newWorkReport.save();
        
        await logActivity(`work-report-creation:${newWorkReport._id}`, currentUser.username);

        // Fetch the newly created report to populate it
        const populatedReport = await getWorkReportById(newWorkReport._id.toString());
        if (!populatedReport.success) {
            return { success: false, message: "Reporte creado, pero no se pudo recuperar para la exportación." };
        }

        return { success: true, data: populatedReport.data, message: "Reporte de trabajo guardado exitosamente." };

    } catch (error: any) {
        if (error instanceof mongoose.Error.ValidationError) {
            // Extrae el primer mensaje de error de validación
            const messages = Object.values(error.errors).map(e => e.message);
            return { success: false, message: `Error de validación: ${messages[0]}` };
        }
        console.error('Error al crear reporte de trabajo:', error);
        return { success: false, message: 'Ocurrió un error inesperado al guardar el reporte.' };
    }
}

export async function updateWorkReport(reportId: string, data: Partial<Omit<WorkReportType, 'id' | 'realizadoPor' | 'fecha'>>) {
    try {
        await dbConnect();
        const currentUser = await getCurrentUserFromSession();
        if (!currentUser || (currentUser.role !== 'Admin' && currentUser.role !== 'Moderador')) {
            return { success: false, message: "No tiene permiso para realizar esta acción." };
        }

        const report = await WorkReport.findByIdAndUpdate(reportId, data, { new: true, runValidators: true });

        if (!report) {
            return { success: false, message: 'Reporte de trabajo no encontrado.' };
        }

        await logActivity(`work-report-update:${report._id}`, currentUser.username);

        return { success: true, data: safeSerialize(report), message: 'Reporte de trabajo actualizado exitosamente.' };

    } catch (error: any) {
        if (error instanceof mongoose.Error.ValidationError) {
            const messages = Object.values(error.errors).map(e => e.message);
            return { success: false, message: `Error de validación: ${messages[0]}` };
        }
        console.error('Error al actualizar reporte de trabajo:', error);
        return { success: false, message: 'Ocurrió un error inesperado al actualizar el reporte.' };
    }
}

export async function getWorkReports() {
    try {
        await dbConnect();
        const reports = await WorkReport.find({})
            .populate({
                path: 'crewId',
                model: 'Crew',
                populate: [
                    { path: 'moderadores', model: 'User', select: 'nombre apellido' },
                    { path: 'obreros', model: 'User', select: 'nombre apellido' }
                ]
            })
            .populate<{ realizadoPor: UserType }>('realizadoPor', 'nombre apellido')
            .sort({ fecha: -1 })
            .lean()
            .exec();
        
        return { success: true, data: safeSerialize(reports) as PopulatedWorkReport[] };
    } catch (error) {
        console.error('Error al obtener reportes de trabajo:', error);
        return { success: false, message: 'Error al obtener los reportes de trabajo.' };
    }
}

export async function getWorkReportById(reportId: string) {
    try {
        await dbConnect();
        const report = await WorkReport.findById(reportId)
            .populate<{ crewId: PopulatedCrew }>({
                path: 'crewId',
                model: 'Crew',
                populate: [
                    { path: 'moderadores', model: 'User', select: 'nombre apellido' },
                    { path: 'obreros', model: 'User', select: 'nombre apellido' }
                ]
            })
            .populate<{ realizadoPor: UserType }>('realizadoPor', 'nombre apellido')
            .lean()
            .exec();
            
        if (!report) {
            return { success: false, message: 'Reporte no encontrado' };
        }
        
        return { success: true, data: safeSerialize(report) as PopulatedWorkReport };
    } catch (error) {
        console.error('Error fetching work report by ID:', error);
        return { success: false, message: 'Error al obtener el reporte de trabajo' };
    }
}


// Dashboard actions
export async function getAdminDashboardStats() {
  await dbConnect();

  const userCountsByRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } },
  ]);

  const roleCounts = {
    Admin: 0,
    Moderador: 0,
    Obrero: 0,
  };

  userCountsByRole.forEach(role => {
    if (role._id in roleCounts) {
      roleCounts[role._id as UserRole] = role.count;
    }
  });

  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ status: 'active' });
  const inactiveUsers = totalUsers - activeUsers;
  const logResult = await getActivityLogs(5);
  
  const activeCrews = await Crew.countDocuments(); 
  const reportsGenerated = 0; // Placeholder

  return {
    totalUsers,
    activeCrews,
    reportsGenerated,
    activeUsers,
    inactiveUsers,
    recentActivity: logResult.success ? logResult.data ?? [] : [],
    roleDistribution: [
      { role: 'Admins', total: roleCounts.Admin },
      { role: 'Moderadores', total: roleCounts.Moderador },
      { role: 'Obreros', total: roleCounts.Obrero },
    ],
  };
}
