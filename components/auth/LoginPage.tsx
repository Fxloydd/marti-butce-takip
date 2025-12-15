'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { LogIn, Car, Eye, EyeOff, AlertCircle, UserPlus, ArrowLeft } from 'lucide-react';

type Mode = 'login' | 'register';

export function LoginPage() {
    const { login, register } = useAuth();
    const [mode, setMode] = useState<Mode>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    // Load saved credentials on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('marti_saved_user');
        const savedPass = localStorage.getItem('marti_saved_pass');
        if (savedUser && savedPass) {
            setUsername(savedUser);
            setPassword(savedPass);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (mode === 'login') {
            const success = await login(username, password);
            if (!success) {
                setError('Kullanıcı adı veya şifre hatalı');
            } else {
                // Save or clear credentials based on rememberMe
                if (rememberMe) {
                    localStorage.setItem('marti_saved_user', username);
                    localStorage.setItem('marti_saved_pass', password);
                } else {
                    localStorage.removeItem('marti_saved_user');
                    localStorage.removeItem('marti_saved_pass');
                }
            }
        } else {
            if (!displayName.trim()) {
                setError('Görünen isim gerekli');
                setIsLoading(false);
                return;
            }
            const result = await register(username, password, displayName.trim());
            if (!result.success) {
                setError(result.error || 'Kayıt başarısız');
            }
        }

        setIsLoading(false);
    };

    const switchMode = (newMode: Mode) => {
        setMode(newMode);
        setError('');
        if (newMode === 'register') {
            setUsername('');
            setPassword('');
        }
        setDisplayName('');
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
                        <Car className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Martı Takip</h1>
                    <p className="text-zinc-400 text-sm mt-1">
                        {mode === 'login' ? 'Günlük kazanç takip sistemi' : 'Yeni hesap oluştur'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {/* Display Name (Registration only) */}
                    {mode === 'register' && (
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                Görünen İsim
                            </label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Örn: Ali"
                                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required
                            />
                        </div>
                    )}

                    {/* Username */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">
                            Kullanıcı Adı
                        </label>
                        <input
                            type="text"
                            name="marti_user_field"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Kullanıcı adınızı girin"
                            className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">
                            Şifre
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="marti_pass_field"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={mode === 'login' ? '••••' : 'En az 4 karakter'}
                                className="w-full px-4 py-3 pr-12 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required
                                autoComplete="new-password"
                                minLength={4}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Remember Me Checkbox */}
                    {mode === 'login' && (
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-zinc-950"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-zinc-400 select-none cursor-pointer">
                                Beni hatırla
                            </label>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : mode === 'login' ? (
                            <>
                                <LogIn className="w-5 h-5" />
                                Giriş Yap
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-5 h-5" />
                                Kayıt Ol
                            </>
                        )}
                    </button>
                </form>

                {/* Toggle Mode */}
                <div className="mt-6 text-center">
                    {mode === 'login' ? (
                        <button
                            onClick={() => switchMode('register')}
                            className="text-zinc-400 hover:text-white transition-colors text-sm"
                        >
                            Hesabınız yok mu? <span className="text-indigo-400 font-medium">Kayıt Ol</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => switchMode('login')}
                            className="flex items-center justify-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm mx-auto"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Giriş sayfasına dön
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
