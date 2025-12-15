'use client';

import { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallButton() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [showIOSModal, setShowIOSModal] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if already installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        // @ts-ignore - iOS specific
        const isIOSStandalone = window.navigator.standalone === true;

        if (isStandalone || isIOSStandalone) {
            setIsInstalled(true);
            return;
        }

        // Check if iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIOSDevice);

        if (isIOSDevice) {
            // Show button for iOS
            setIsVisible(true);
        }

        // Listen for install prompt (Android/Chrome)
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Check if installed after prompt
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setIsVisible(false);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (isIOS) {
            setShowIOSModal(true);
            return;
        }

        if (!deferredPrompt) return;

        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                setIsInstalled(true);
                setIsVisible(false);
            }
            setDeferredPrompt(null);
        } catch (error) {
            console.error('Install prompt error:', error);
        }
    };

    if (isInstalled || !isVisible) return null;

    return (
        <>
            {/* Install Button */}
            <button
                onClick={handleInstallClick}
                className="fixed bottom-24 left-4 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-lg shadow-green-500/30 hover:shadow-green-500/50 active:scale-95 transition-all"
            >
                <Download className="w-5 h-5" />
                <span className="text-sm">Uygulamayı Yükle</span>
            </button>

            {/* iOS Instructions Modal */}
            {showIOSModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-sm bg-zinc-900 rounded-3xl p-6 shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Uygulamayı Yükle</h2>
                            <button
                                onClick={() => setShowIOSModal(false)}
                                className="p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Instructions */}
                        <div className="space-y-4">
                            <p className="text-zinc-400 text-sm">
                                Martı Takip'i ana ekranınıza eklemek için:
                            </p>

                            <div className="space-y-3">
                                {/* Step 1 */}
                                <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-800/50">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                                        1
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">Paylaş butonuna tıklayın</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Share className="w-5 h-5 text-blue-400" />
                                            <span className="text-zinc-500 text-sm">Safari alt menüsünde</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Step 2 */}
                                <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-800/50">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                                        2
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">"Ana Ekrana Ekle" seçin</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <PlusSquare className="w-5 h-5 text-zinc-400" />
                                            <span className="text-zinc-500 text-sm">Listeden bulun</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Step 3 */}
                                <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-800/50">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                                        3
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">"Ekle" butonuna tıklayın</p>
                                        <span className="text-zinc-500 text-sm">Uygulama ana ekranınızda!</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={() => setShowIOSModal(false)}
                            className="w-full mt-6 py-3 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition-colors"
                        >
                            Anladım
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
