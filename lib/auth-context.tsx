'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabase';

interface User {
    id: string;
    username: string;
    displayName: string;
}

interface UpdateProfileData {
    displayName: string;
    username: string;
    currentPassword?: string;
    newPassword?: string;
}

interface AuthContextType {
    user: User | null;
    users: string[];
    allUsers: { username: string; displayName: string }[];
    isLoading: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    register: (username: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
    updateProfile: (data: UpdateProfileData) => Promise<{ success: boolean; error?: string }>;
    deleteAccount: (password: string) => Promise<{ success: boolean; error?: string }>;
    deleteUserAsAdmin: (username: string, adminPassword: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [usersDb, setUsersDb] = useState<{ id: string; username: string; displayName: string; passwordHash: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch users from Supabase
    const fetchUsers = async () => {
        const { data, error } = await supabase
            .from('users')
            .select('id, username, display_name, password_hash');

        if (error) {
            console.error('Error fetching users:', error);
            return [];
        }

        return data.map(u => ({
            id: u.id,
            username: u.username,
            displayName: u.display_name,
            passwordHash: u.password_hash,
        }));
    };

    const refreshUsers = async () => {
        const users = await fetchUsers();
        setUsersDb(users);
    };

    // Initialize
    useEffect(() => {
        const init = async () => {
            // Load users from Supabase
            const users = await fetchUsers();
            setUsersDb(users);

            // Check for saved session in localStorage
            const savedUser = localStorage.getItem('marti_user');
            if (savedUser) {
                try {
                    const parsedUser = JSON.parse(savedUser);
                    // Verify user still exists in database
                    if (users.some(u => u.username === parsedUser.username)) {
                        setUser(parsedUser);
                    } else {
                        localStorage.removeItem('marti_user');
                    }
                } catch {
                    localStorage.removeItem('marti_user');
                }
            }
            setIsLoading(false);
        };

        init();
    }, []);

    const login = async (username: string, password: string): Promise<boolean> => {
        // Simple hash for comparison (in production, use proper bcrypt)
        const passwordHash = btoa(password);

        const foundUser = usersDb.find(
            u => u.username.toLowerCase() === username.toLowerCase() && u.passwordHash === passwordHash
        );

        if (foundUser) {
            const loggedInUser: User = {
                id: foundUser.id,
                username: foundUser.username,
                displayName: foundUser.displayName,
            };
            setUser(loggedInUser);
            localStorage.setItem('marti_user', JSON.stringify(loggedInUser));
            return true;
        }

        return false;
    };

    const register = async (
        username: string,
        password: string,
        displayName: string
    ): Promise<{ success: boolean; error?: string }> => {
        // Check if username exists
        if (usersDb.some(u => u.username.toLowerCase() === username.toLowerCase())) {
            return { success: false, error: 'Bu kullanıcı adı zaten kullanılıyor' };
        }

        if (password.length < 4) {
            return { success: false, error: 'Şifre en az 4 karakter olmalı' };
        }

        // Simple hash (in production, use proper bcrypt)
        const passwordHash = btoa(password);

        const { data, error } = await supabase
            .from('users')
            .insert({
                username: username.toLowerCase(),
                display_name: displayName,
                password_hash: passwordHash,
            })
            .select()
            .single();

        if (error) {
            console.error('Registration error:', error);
            return { success: false, error: 'Kayıt sırasında bir hata oluştu' };
        }

        const newUser: User = {
            id: data.id,
            username: data.username,
            displayName: data.display_name,
        };

        // Refresh users list
        await refreshUsers();

        // Auto login
        setUser(newUser);
        localStorage.setItem('marti_user', JSON.stringify(newUser));

        return { success: true };
    };

    const updateProfile = async (data: UpdateProfileData): Promise<{ success: boolean; error?: string }> => {
        if (!user) {
            return { success: false, error: 'Kullanıcı bulunamadı' };
        }

        const currentUser = usersDb.find(u => u.username === user.username);
        if (!currentUser) {
            return { success: false, error: 'Kullanıcı bulunamadı' };
        }

        // Check if username is being changed to one that already exists
        if (data.username !== user.username) {
            if (usersDb.some(u => u.username.toLowerCase() === data.username.toLowerCase())) {
                return { success: false, error: 'Bu kullanıcı adı zaten kullanılıyor' };
            }
        }

        // If changing password, verify current password
        let newPasswordHash = currentUser.passwordHash;
        if (data.newPassword) {
            if (!data.currentPassword) {
                return { success: false, error: 'Mevcut şifrenizi girin' };
            }
            if (btoa(data.currentPassword) !== currentUser.passwordHash) {
                return { success: false, error: 'Mevcut şifre yanlış' };
            }
            if (data.newPassword.length < 4) {
                return { success: false, error: 'Yeni şifre en az 4 karakter olmalı' };
            }
            newPasswordHash = btoa(data.newPassword);
        }

        // Update in Supabase
        const { error } = await supabase
            .from('users')
            .update({
                username: data.username,
                display_name: data.displayName,
                password_hash: newPasswordHash,
            })
            .eq('id', currentUser.id);

        if (error) {
            console.error('Update error:', error);
            return { success: false, error: 'Güncelleme sırasında bir hata oluştu' };
        }

        // Update payments if display name changed
        if (data.displayName !== user.displayName) {
            await supabase
                .from('payments')
                .update({ user_display_name: data.displayName })
                .eq('user_display_name', user.displayName);
        }

        // Refresh users list
        await refreshUsers();

        // Update current user state
        const updatedUser: User = {
            id: currentUser.id,
            username: data.username,
            displayName: data.displayName,
        };
        setUser(updatedUser);
        localStorage.setItem('marti_user', JSON.stringify(updatedUser));

        return { success: true };
    };

    const deleteAccount = async (password: string): Promise<{ success: boolean; error?: string }> => {
        if (!user) {
            return { success: false, error: 'Kullanıcı bulunamadı' };
        }

        const currentUser = usersDb.find(u => u.username === user.username);
        if (!currentUser) {
            return { success: false, error: 'Kullanıcı bulunamadı' };
        }

        // Verify password
        if (btoa(password) !== currentUser.passwordHash) {
            return { success: false, error: 'Şifre yanlış' };
        }

        // Delete user's payments
        await supabase
            .from('payments')
            .delete()
            .eq('user_display_name', user.displayName);

        // Delete user
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', currentUser.id);

        if (error) {
            console.error('Delete error:', error);
            return { success: false, error: 'Silme sırasında bir hata oluştu' };
        }

        // Logout
        setUser(null);
        localStorage.removeItem('marti_user');
        await refreshUsers();

        return { success: true };
    };

    const deleteUserAsAdmin = async (username: string, adminPassword: string): Promise<{ success: boolean; error?: string }> => {
        if (!user) {
            return { success: false, error: 'Giriş yapmalısınız' };
        }

        // Verify admin password
        const adminUser = usersDb.find(u => u.username === user.username);
        if (!adminUser || btoa(adminPassword) !== adminUser.passwordHash) {
            return { success: false, error: 'Şifre yanlış' };
        }

        // Find target user
        const targetUser = usersDb.find(u => u.username === username);
        if (!targetUser) {
            return { success: false, error: 'Kullanıcı bulunamadı' };
        }

        // Delete user's payments
        await supabase
            .from('payments')
            .delete()
            .eq('user_display_name', targetUser.displayName);

        // Delete user
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', targetUser.id);

        if (error) {
            console.error('Delete error:', error);
            return { success: false, error: 'Silme sırasında bir hata oluştu' };
        }

        // If deleting self, logout
        if (username === user.username) {
            setUser(null);
            localStorage.removeItem('marti_user');
        }

        await refreshUsers();
        return { success: true };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('marti_user');
    };

    const users = usersDb.map(u => u.displayName);
    const allUsers = usersDb.map(u => ({ username: u.username, displayName: u.displayName }));

    return (
        <AuthContext.Provider value={{
            user,
            users,
            allUsers,
            isLoading,
            login,
            register,
            updateProfile,
            deleteAccount,
            deleteUserAsAdmin,
            logout,
            refreshUsers
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
