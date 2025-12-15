'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { LogIn, Car, Eye, EyeOff, AlertCircle, UserPlus, ArrowLeft, Sparkles } from 'lucide-react';

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
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-indigo-950/50 to-zinc-950" />

            {/* Floating Orbs */}
            <div className="absolute top-1/4 -left-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl" />

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

            {/* Content */}
            <div className="relative w-full max-w-md">
                {/* Glass Card */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/50">

                    {/* Logo Section */}
                    <div className="text-center mb-8">
                        <div className="relative inline-block">
                            {/* Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-50 animate-pulse" />
                            {/* Icon */}
                            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
                                <Car className="w-10 h-10 text-white" />
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold text-white mt-6 tracking-tight">
                            Martı Takip
                        </h1>
                        <p className="text-zinc-400 text-sm mt-2 flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-400" />
                            {mode === 'login' ? 'Günlük kazanç takip sistemi' : 'Yeni hesap oluştur'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm">
                                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                    <AlertCircle className="w-4 h-4 text-red-400" />
                                </div>
                                <span className="text-sm text-red-300">{error}</span>
                            </div>
                        )}

                        {/* Display Name (Registration only) */}
                        {mode === 'register' && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-zinc-300">
                                    Görünen İsim
                                </label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Örn: Ali"
                                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                                    required
                                />
                            </div>
                        )}

                        {/* Username */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-zinc-300">
                                Kullanıcı Adı
                            </label>
                            <input
                                type="text"
                                name="marti_user_field"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Kullanıcı adınızı girin"
                                className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                                required
                                autoComplete="new-password"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-zinc-300">
                                Şifre
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="marti_pass_field"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={mode === 'login' ? '••••••••' : 'En az 4 karakter'}
                                    className="w-full px-4 py-3.5 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                                    required
                                    autoComplete="new-password"
                                    minLength={4}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me Checkbox */}
                        {mode === 'login' && (
                            <div className="flex items-center">
                                <div
                                    onClick={() => setRememberMe(!rememberMe)}
                                    className={`w-5 h-5 rounded-md border cursor-pointer transition-all flex items-center justify-center ${rememberMe
                                            ? 'bg-indigo-500 border-indigo-500'
                                            : 'bg-white/5 border-white/20 hover:border-white/40'
                                        }`}
                                >
                                    {rememberMe && (
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <label
                                    onClick={() => setRememberMe(!rememberMe)}
                                    className="ml-3 text-sm text-zinc-400 select-none cursor-pointer hover:text-zinc-300 transition-colors"
                                >
                                    Beni hatırla
                                </label>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="relative w-full py-4 rounded-xl font-semibold text-lg overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {/* Button Gradient Background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_100%] group-hover:animate-shimmer transition-all" />
                            {/* Button Glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-50 blur-xl transition-opacity" />
                            {/* Button Content */}
                            <span className="relative flex items-center justify-center gap-2 text-white">
                                {isLoading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                            </span>
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10" />
                        </div>
                    </div>

                    {/* Toggle Mode */}
                    <div className="text-center">
                        {mode === 'login' ? (
                            <button
                                onClick={() => switchMode('register')}
                                className="text-zinc-400 hover:text-white transition-colors text-sm"
                            >
                                Hesabınız yok mu? <span className="text-indigo-400 font-semibold hover:text-indigo-300">Kayıt Ol</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => switchMode('login')}
                                className="flex items-center justify-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm mx-auto group"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                Giriş sayfasına dön
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-zinc-600 text-xs mt-6">
                    © 2024 Martı Takip • Tüm hakları saklıdır
                </p>
            </div>
        </div>
    );
}
