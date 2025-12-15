'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { LoginPage } from '@/components/auth/LoginPage';
import { TopBar } from '@/components/dashboard/TopBar';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { GoalCard } from '@/components/dashboard/GoalCard';
import { PeriodCharts } from '@/components/dashboard/Charts/PeriodCharts';
import { UserComparisonChart } from '@/components/dashboard/Charts/UserComparisonChart';
import { PaymentTypeChart } from '@/components/dashboard/Charts/PaymentTypeChart';
import { RecentPassengers } from '@/components/dashboard/RecentPassengers';
import { FloatingActionButton } from '@/components/dashboard/FloatingActionButton';
import { AddPassengerModal } from '@/components/dashboard/AddPassengerModal';
import { EditGoalModal } from '@/components/dashboard/EditGoalModal';
import { ProfileModal } from '@/components/profile/ProfileModal';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { ReportModal } from '@/components/dashboard/ReportModal';
import { LocationMap } from '@/components/dashboard/LocationMap';
import { ThemeToggle } from '@/components/ThemeToggle';
import { InstallButton } from '@/components/InstallButton';
import { CardSkeleton, ChartSkeleton, ListSkeleton } from '@/components/ui/Skeleton';
import { getDashboardData, addPayment, updatePayment, deletePayment, updateDailyGoal, getDailyGoal, ExtendedDashboardData } from '@/lib/supabase-data';
import { notifyPaymentAdded, notifyPaymentDeleted, notifyGoalReached, requestNotificationPermission } from '@/lib/notifications';
import { PaymentType } from '@/types';
import { LogOut, Settings, Shield, FileText, MapPin } from 'lucide-react';

type ViewMode = 'personal' | 'combined';

export default function Dashboard() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const [data, setData] = useState<ExtendedDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('personal');
  const [currentGoal, setCurrentGoal] = useState(3000);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const filterUser = viewMode === 'personal' ? user.displayName : null;
      const dashboardData = await getDashboardData(filterUser);
      setData(dashboardData);
      const goal = await getDailyGoal();
      setCurrentGoal(goal);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setIsLoading(false);
  }, [viewMode, user]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [loadData, user]);

  const handleRefresh = () => {
    loadData();
  };

  const handleViewChange = (newView: ViewMode) => {
    setViewMode(newView);
  };

  const handleAddPassenger = async (payment: {
    amount: number;
    paymentType: PaymentType;
    user: string;
    location: string;
  }) => {
    // Optimistic update - add to UI immediately
    if (data) {
      const optimisticPayment = {
        id: `temp-${Date.now()}`,
        amount: payment.amount,
        paymentType: payment.paymentType,
        user: payment.user,
        location: payment.location,
        hour: new Date().getHours(),
        createdAt: new Date(),
      };

      setData({
        ...data,
        payments: [optimisticPayment, ...data.payments],
        totalEarnings: data.totalEarnings + payment.amount,
        cashTotal: payment.paymentType === 'cash' ? data.cashTotal + payment.amount : data.cashTotal,
        ibanTotal: payment.paymentType === 'iban' ? data.ibanTotal + payment.amount : data.ibanTotal,
        dailyGoal: {
          ...data.dailyGoal,
          current: data.dailyGoal.current + payment.amount,
        },
      });
    }

    // Sync with database in background
    await addPayment({ ...payment, userId: user?.id });
    // Show notification
    notifyPaymentAdded(payment.amount, payment.user);
    // Check if goal reached
    if (data && data.dailyGoal.current + payment.amount >= data.dailyGoal.target) {
      notifyGoalReached('daily');
    }
    // Refresh to get accurate data
    loadData();
  };

  const handleUpdateGoal = async (newGoal: number) => {
    // Optimistic update
    setCurrentGoal(newGoal);
    if (data) {
      setData({
        ...data,
        dailyGoal: { ...data.dailyGoal, target: newGoal },
      });
    }

    await updateDailyGoal(newGoal);
  };

  // Auth loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <LoginPage />;
  }

  const isPersonalView = viewMode === 'personal';



  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-24">
      {/* Top Bar */}
      <TopBar
        currentView={viewMode}
        currentUserName={user.displayName}
        onViewChange={handleViewChange}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

      {/* View Title & Dynamic Action Menu */}
      <div className="px-4 pt-4 z-40">
        <div className={`inline-flex items-center gap-1 rounded-full transition-all duration-300 ${isMenuOpen
          ? 'bg-zinc-800 dark:bg-zinc-800 p-1'
          : 'bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1.5'
          }`}>
          {/* Toggle Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`inline-flex items-center gap-2 rounded-full transition-all duration-200 ${isMenuOpen
              ? 'px-3 py-1.5 bg-zinc-700 text-white'
              : ''
              }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${isMenuOpen
              ? 'bg-red-500 text-white'
              : 'bg-indigo-500 text-white'
              }`}>
              {isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
              )}
            </div>
            <span className={`text-sm font-medium transition-colors ${isMenuOpen
              ? 'text-white'
              : 'text-indigo-700 dark:text-indigo-400'
              }`}>
              {isMenuOpen ? 'Kapat' : 'Menü'}
            </span>
          </button>

          {/* Action Buttons (visible when menu is open) */}
          {isMenuOpen && (
            <div className="flex items-center gap-1 ml-1">
              {/* Report */}
              <button
                onClick={() => { setIsReportModalOpen(true); setIsMenuOpen(false); }}
                className="p-2 rounded-full text-zinc-400 hover:bg-green-500/20 hover:text-green-400 transition-colors"
                title="Rapor Al"
              >
                <FileText className="w-4 h-4" />
              </button>

              {/* Map */}
              <button
                onClick={() => { setIsMapOpen(true); setIsMenuOpen(false); }}
                className="p-2 rounded-full text-zinc-400 hover:bg-blue-500/20 hover:text-blue-400 transition-colors"
                title="Harita"
              >
                <MapPin className="w-4 h-4" />
              </button>

              {/* Admin */}
              <button
                onClick={() => { setIsAdminPanelOpen(true); setIsMenuOpen(false); }}
                className="p-2 rounded-full text-zinc-400 hover:bg-purple-500/20 hover:text-purple-400 transition-colors"
                title="Yönetici Paneli"
              >
                <Shield className="w-4 h-4" />
              </button>

              {/* Profile */}
              <button
                onClick={() => { setIsProfileModalOpen(true); setIsMenuOpen(false); }}
                className="p-2 rounded-full text-zinc-400 hover:bg-indigo-500/20 hover:text-indigo-400 transition-colors"
                title="Profil Ayarları"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Logout */}
              <button
                onClick={logout}
                className="p-2 rounded-full text-zinc-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                title="Çıkış Yap"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6 py-4">
        {/* Summary Cards */}
        <section>
          {isLoading ? (
            <div className="flex gap-3 px-4 overflow-hidden">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : (
            data && (
              <SummaryCards
                totalEarnings={data.totalEarnings}
                cashTotal={data.cashTotal}
                ibanTotal={data.ibanTotal}
                userEarnings={data.userEarnings}
                isPersonalView={isPersonalView}
              />
            )
          )}
        </section>

        {/* Goal Cards */}
        <section>
          {isLoading ? (
            <div className="px-4 space-y-4">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
          ) : (
            data && (
              <GoalCard
                dailyGoal={data.dailyGoal}
                weeklyGoal={data.weeklyGoal}
                onEditClick={!isPersonalView ? () => setIsGoalModalOpen(true) : undefined}
                isPersonalView={isPersonalView}
              />
            )
          )}
        </section>

        {/* Period Charts (Daily/Weekly/Monthly with swipe) */}
        <section>
          {isLoading ? (
            <div className="px-4">
              <ChartSkeleton />
            </div>
          ) : (
            data && (
              <PeriodCharts
                dailyData={data.periodData.daily}
                weeklyData={data.periodData.weekly}
                monthlyData={data.periodData.monthly}
              />
            )
          )}
        </section>

        {/* Charts Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            <>
              {!isPersonalView && (
                <div className="px-4 md:pl-4 md:pr-0">
                  <ChartSkeleton />
                </div>
              )}
              <div className={`px-4 ${!isPersonalView ? 'md:pr-4 md:pl-0' : ''}`}>
                <ChartSkeleton />
              </div>
            </>
          ) : (
            data && (
              <>
                {!isPersonalView && (
                  <UserComparisonChart data={data.userEarnings} />
                )}
                <PaymentTypeChart data={data.paymentTypeData} />
              </>
            )
          )}
        </section>

        {/* Recent Passengers */}
        <section>
          {isLoading ? (
            <div className="px-4">
              <ListSkeleton />
            </div>
          ) : (
            data && (
              <RecentPassengers
                payments={data.payments}
                onEdit={async (id, editData) => {
                  // Optimistic update
                  if (data) {
                    const oldPayment = data.payments.find(p => p.id === id);
                    const amountDiff = editData.amount - (oldPayment?.amount || 0);

                    setData({
                      ...data,
                      payments: data.payments.map(p =>
                        p.id === id
                          ? { ...p, amount: editData.amount, paymentType: editData.paymentType, location: editData.location }
                          : p
                      ),
                      totalEarnings: data.totalEarnings + amountDiff,
                    });
                  }
                  await updatePayment(id, editData);
                }}
                onDelete={async (id) => {
                  // Optimistic update
                  if (data) {
                    const deletedPayment = data.payments.find(p => p.id === id);
                    setData({
                      ...data,
                      payments: data.payments.filter(p => p.id !== id),
                      totalEarnings: data.totalEarnings - (deletedPayment?.amount || 0),
                      cashTotal: deletedPayment?.paymentType === 'cash'
                        ? data.cashTotal - (deletedPayment?.amount || 0)
                        : data.cashTotal,
                      ibanTotal: deletedPayment?.paymentType === 'iban'
                        ? data.ibanTotal - (deletedPayment?.amount || 0)
                        : data.ibanTotal,
                    });
                  }
                  await deletePayment(id);
                }}
              />
            )
          )}
        </section>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={() => setIsAddModalOpen(true)} />

      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Install App Button */}
      <InstallButton />

      {/* Modals */}
      <AddPassengerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddPassenger}
        currentUser={user.displayName}
      />

      <EditGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        currentGoal={currentGoal}
        onSave={handleUpdateGoal}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          loadData();
        }}
      />

      <AdminPanel
        isOpen={isAdminPanelOpen}
        onClose={() => {
          setIsAdminPanelOpen(false);
          loadData();
        }}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        payments={data?.payments || []}
      />

      <LocationMap
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        payments={data?.payments || []}
      />
    </div>
  );
}
