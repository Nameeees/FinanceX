

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomNav } from './components/BottomNav';
import { CalendarView } from './components/CalendarView';
import { DebtView } from './components/DebtView';
import { ProfileView } from './components/ProfileView';
import { HomeView } from './components/views/HomeView';
import { HistoryView } from './components/views/HistoryView';

// UI Components
import { AddTransactionModal } from './components/ui/AddTransactionModal';
import { TransactionDetailsModal } from './components/ui/TransactionDetailsModal';
import { AddDebtModal } from './components/ui/AddDebtModal';
import { DebtDetailsModal } from './components/ui/DebtDetailsModal';
import { PayDebtModal } from './components/ui/PayDebtModal';
import { OnboardingModal } from './components/ui/OnboardingModal';
import { CurrencyConverterModal } from './components/ui/CurrencyConverterModal';
import { AddQuickActionModal } from './components/ui/AddQuickActionModal';
import { AppLockOverlay } from './components/ui/AppLockOverlay'; 
import { SpreadsheetModal } from './components/ui/SpreadsheetModal';
import { SideDrawer } from './components/ui/SideDrawer';
import { MonthlySummaryModal } from './components/ui/MonthlySummaryModal';

// Types & Utils
import { Transaction, Debt, QuickAction, TransactionType, DebtType, Sheet } from './types';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

// Custom Hooks
import { useProfile } from './hooks/useProfile';
import { useTransactions } from './hooks/useTransactions';
import { useDebts } from './hooks/useDebts';
import { useCloudIntegration } from './hooks/useCloudIntegration';

// Service imports
import { findExistingBackup, restoreDataFromCloud, sanitizeKey, verifyApiKey } from './services/cloudService';
import { MOCK_USER } from './constants';

function App() {
  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [isConverterOpen, setIsConverterOpen] = useState(false);
  const [isQuickActionModalOpen, setIsQuickActionModalOpen] = useState(false);
  const [isPayDebtModalOpen, setIsPayDebtModalOpen] = useState(false);
  const [isSpreadsheetOpen, setIsSpreadsheetOpen] = useState(false);
  const [isMonthlySummaryOpen, setIsMonthlySummaryOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error', visible: boolean} | null>(null);

  // --- SELECTION STATE ---
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingQuickAction, setEditingQuickAction] = useState<QuickAction | null>(null);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  
  // --- SHEETS STATE (Lifted for Cloud Sync) ---
  const [sheets, setSheets] = useState<Sheet[]>([]);

  // --- DOMAIN HOOKS ---
  const profile = useProfile();
  const trans = useTransactions();
  const debts = useDebts();
  
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
     setToast({ message, type, visible: true });
     setTimeout(() => setToast(prev => prev ? { ...prev, visible: false } : null), 3000);
  };

  // Initialize Sheets
  useEffect(() => {
    const savedSheets = localStorage.getItem('nexo_sheets');
    const legacySheet = localStorage.getItem('nexo_sheet_sparse');

    if (savedSheets) {
        try { setSheets(JSON.parse(savedSheets)); } catch (e) {}
    } else if (legacySheet) {
        try {
            const data = JSON.parse(legacySheet);
            const newSheet: Sheet = {
                id: 'legacy-migrated',
                name: 'General',
                data,
                lastModified: new Date().toISOString(),
                color: 'from-blue-500 to-cyan-500'
            };
            setSheets([newSheet]);
            localStorage.setItem('nexo_sheets', JSON.stringify([newSheet]));
        } catch (e) {}
    }
  }, []);

  const handleUpdateSheets = (newSheets: Sheet[]) => {
      setSheets(newSheets);
      localStorage.setItem('nexo_sheets', JSON.stringify(newSheets));
  };

  // --- GLOBAL DATA HANDLER ---
  const handleImportData = (data: any) => {
    try {
      if (data.transactions) trans.setTransactions(data.transactions);
      if (data.debts) debts.setDebts(data.debts);
      if (data.customCategories) trans.setCustomCategories(data.customCategories);
      if (data.quickActions) { 
          trans.setQuickActions(data.quickActions); 
          localStorage.setItem('nexo_quick_actions', JSON.stringify(data.quickActions)); 
      }
      if (data.userProfile) profile.handleUpdateProfile(data.userProfile);
      if (data.userCurrency) { 
          localStorage.setItem('nexo_currency', data.userCurrency); 
          profile.setUserCurrency(data.userCurrency); 
          profile.setDisplayCurrency(data.userCurrency); 
      }
      if (data.sheets) {
          setSheets(data.sheets);
          localStorage.setItem('nexo_sheets', JSON.stringify(data.sheets));
      }
    } catch (e) {
      console.error("Import failed", e);
      showToast("Error al importar el archivo", 'error');
    }
  };

  // --- LOGIN LOGIC (Safe) ---
  const handleLoginWithTokenSafe = async (token: string): Promise<boolean> => {
      const sanitizedKey = sanitizeKey(token);
      if (!sanitizedKey) return false;
      if (!navigator.onLine) { showToast('Sin conexión a internet', 'error'); return false; }

      const verify = await verifyApiKey(sanitizedKey, 'GITHUB');
      if (!verify.success) {
          showToast(verify.message || 'Token inválido', 'error');
          return false;
      }

      showToast('Buscando copia de seguridad...', 'success');

      let foundGistId = null;
      try {
          foundGistId = await findExistingBackup(sanitizedKey, 'GITHUB');
      } catch (e: any) {
          console.error("Error during backup search", e);
          const msg = e.name === 'TypeError' || e.message === 'Failed to fetch' ? 'No se pudo conectar a GitHub' : e.message;
          showToast(`Error: ${msg}`, 'error');
          return false;
      }

      if (foundGistId) {
          const restoreResult = await restoreDataFromCloud(sanitizedKey, foundGistId, 'GITHUB');
          if (restoreResult.success && restoreResult.data) {
              handleImportData(restoreResult.data);
              
              const restoredProfile = restoreResult.data.userProfile || MOCK_USER;
              const updatedProfile = {
                  ...restoredProfile,
                  cloudConfig: {
                      enabled: true,
                      provider: 'GITHUB',
                      apiKey: sanitizedKey,
                      binId: foundGistId,
                      lastSync: new Date().toISOString()
                  }
              };
              profile.handleUpdateProfile(updatedProfile);
              showToast('Datos restaurados exitosamente.', 'success');
              profile.setHasOnboarded(true);
              return true;
          } else {
              showToast(restoreResult.message || 'Error al leer respaldo.', 'error');
              return false;
          }
      } else {
          const updatedProfile = {
              ...profile.userProfile,
              cloudConfig: {
                  enabled: true,
                  provider: 'GITHUB',
                  apiKey: sanitizedKey,
                  binId: ''
              }
          };
          profile.handleUpdateProfile(updatedProfile);
          profile.setHasOnboarded(true);
          showToast('Sesión iniciada. Creando respaldo nuevo.');
          return true;
      }
  };

  // --- CLOUD HOOK ---
  const cloud = useCloudIntegration({
      userProfile: profile.userProfile,
      transactions: trans.transactions,
      debts: debts.debts,
      customCategories: trans.customCategories,
      quickActions: trans.quickActions,
      sheets: sheets,
      userCurrency: profile.userCurrency,
      onUpdateProfile: profile.handleUpdateProfile,
      onImportData: handleImportData,
      showToast,
      setHasOnboarded: profile.setHasOnboarded
  });

  // --- DERIVED CALCULATIONS ---
  const transactionIncome = trans.transactions.filter(t => t.type === TransactionType.INCOME).reduce((a, c) => a + c.amount, 0);
  const transactionExpense = trans.transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((a, c) => a + c.amount, 0);

  const totalIncome = transactionIncome;
  const totalExpense = transactionExpense;
  const balance = totalIncome - totalExpense;

  const handleExecuteQuickAction = (action: QuickAction) => {
    trans.handleSaveTransaction(action.amount, action.type, action.category, action.title, 'Acceso Rápido');
    showToast(`$${action.amount} agregado a ${action.title}`);
  };

  const handleLogoutWrapper = () => {
      profile.handleLogout();
      setActiveTab('home');
      cloud.setCloudStatus('disconnected');
  };

  const handleManualRestoreWrapper = async () => {
      if (!navigator.onLine) { showToast('No tienes conexión a internet', 'error'); return; }
      const apiKey = sanitizeKey(profile.userProfile.cloudConfig?.apiKey || '');
      let binId = sanitizeKey(profile.userProfile.cloudConfig?.binId || '');
      const provider = profile.userProfile.cloudConfig?.provider || 'GITHUB';

      if (apiKey && !binId && provider === 'GITHUB') {
          showToast('Buscando ID de respaldo...');
          try {
             const found = await findExistingBackup(apiKey, 'GITHUB');
             if (found) {
                 binId = found;
             } else {
                 showToast('No se encontró ningún respaldo en GitHub.', 'error');
                 return;
             }
          } catch(e: any) {
             showToast(`Error de red: ${e.message}`, 'error');
             return;
          }
      }
      
      if (provider === 'JSONBIN' && !binId) {
          showToast('Falta el Bin ID para restaurar desde JSONBin', 'error');
          return;
      }
      
      showToast('Restaurando...');
      const result = await restoreDataFromCloud(apiKey, binId, provider);
      if (result.success && result.data) {
          handleImportData(result.data);
          showToast('Datos restaurados.', 'success');
      } else {
          showToast(result.message || 'Error al restaurar', 'error');
      }
  };

  // --- DEBT HANDLERS ---
  const handleFullDeleteDebt = (debtId: string) => {
      const debtToDelete = debts.debts.find(d => d.id === debtId);
      if (!debtToDelete) return;

      // 1. Delete initial transaction
      if (debtToDelete.initialTransactionId) {
          trans.handleDeleteTransaction(debtToDelete.initialTransactionId);
      }

      // 2. Delete all payment transactions
      if (debtToDelete.payments) {
          debtToDelete.payments.forEach(p => {
              if (p.transactionId) {
                  trans.handleDeleteTransaction(p.transactionId);
              }
          });
      }

      // 3. Delete the debt itself
      debts.handleDeleteDebt(debtId);
      showToast('Deuda y movimientos eliminados');
  };

  const handleRemovePayment = (debtId: string, paymentId: string) => {
      const debt = debts.debts.find(d => d.id === debtId);
      const payment = debt?.payments.find(p => p.id === paymentId);
      
      if (payment && payment.transactionId) {
          trans.handleDeleteTransaction(payment.transactionId);
      }
      
      debts.handleDeletePayment(debtId, paymentId);
      showToast('Abono eliminado y saldo ajustado');
      
      // Update selected debt view if open
      if (selectedDebt && selectedDebt.id === debtId) {
         const updatedDebt = debts.debts.find(d => d.id === debtId);
         if (updatedDebt) setSelectedDebt(updatedDebt);
      }
  };

  return (
    <div className="min-h-screen bg-background text-neutral-200 font-sans selection:bg-primary/30">
      <AppLockOverlay isOpen={profile.isAppLocked} mode="unlock" method={profile.userProfile.security?.method} savedValue={profile.userProfile.security?.value} onSuccess={() => profile.setIsAppLocked(false)} />
      
      {!profile.isAppLocked && (
          <OnboardingModal 
            isOpen={!profile.hasOnboarded} 
            onComplete={profile.handleOnboardingComplete} 
            onLoginWithToken={handleLoginWithTokenSafe} 
            currencies={profile.currencyList} 
          />
      )}

      <div className="h-2 w-full" />
      <main className="max-w-md mx-auto min-h-screen relative flex flex-col no-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <div className="flex-1 flex flex-col">
                <HomeView 
                balance={balance} income={totalIncome} expense={totalExpense}
                userCurrency={profile.userCurrency} displayCurrency={profile.displayCurrency} currencies={profile.currencyList}
                quickActions={trans.quickActions} transactions={trans.transactions}
                onOpenConverter={() => setIsConverterOpen(true)}
                onExecuteQuickAction={handleExecuteQuickAction}
                onAddQuickAction={() => { setEditingQuickAction(null); setIsQuickActionModalOpen(true); }}
                onEditQuickAction={(a) => { setEditingQuickAction(a); setIsQuickActionModalOpen(true); }}
                onViewHistory={() => setActiveTab('history')}
                onTransactionClick={setSelectedTransaction}
                cloudStatus={cloud.cloudStatus}
                userName={profile.userProfile.name}
                onOpenMenu={() => setIsDrawerOpen(true)}
                />
            </div>
          )}
          {activeTab === 'history' && (
             <HistoryView 
                transactions={trans.transactions} 
                onBack={() => setActiveTab('home')} 
                onTransactionClick={setSelectedTransaction} 
             />
          )}
          {activeTab === 'calendar' && (
             <motion.div key="calendar" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="flex-1 flex flex-col h-full">
                <CalendarView transactions={trans.transactions} onTransactionClick={setSelectedTransaction} onBack={() => setActiveTab('home')} />
             </motion.div>
          )}
          {activeTab === 'debts' && (
             <motion.div key="debts" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="flex-1 flex flex-col h-full">
                <DebtView debts={debts.debts} onBack={() => setActiveTab('home')} onAddDebt={() => setIsDebtModalOpen(true)} onDebtClick={setSelectedDebt} />
             </motion.div>
          )}
          {activeTab === 'profile' && (
             <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 flex flex-col h-full">
               <ProfileView 
                  user={profile.userProfile} transactions={trans.transactions} debts={debts.debts} customCategories={trans.customCategories}
                  onUpdateProfile={profile.handleUpdateProfile} onImportData={handleImportData} onLogout={handleLogoutWrapper}
                  onCloudSync={cloud.handleManualSync} 
                  onCloudRestore={handleManualRestoreWrapper} 
                  onCloudConnect={cloud.handleCloudSetup} isSyncing={cloud.isSyncing}
                  onOpenSpreadsheet={() => setIsSpreadsheetOpen(true)}
               />
             </motion.div>
           )}
        </AnimatePresence>
      </main>
      
      <div className="max-w-md mx-auto relative"><BottomNav activeTab={activeTab} setActiveTab={setActiveTab} onFabClick={() => { setEditingTransaction(null); setIsModalOpen(true); }} /></div>
      
      <AnimatePresence>
        {toast && toast.visible && (
            <motion.div 
                initial={{ opacity: 0, y: 50, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 20, x: '-50%' }} 
                className={`fixed bottom-28 left-1/2 z-[100] px-4 py-2 rounded-full flex items-center gap-2 border shadow-xl ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-200' : 'bg-surfaceHighlight border-emerald-500/30 text-white'}`}
            >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>{toast.type === 'error' ? <AlertTriangle size={12} className="text-white" /> : <CheckCircle2 size={12} className="text-black" />}</div>
                <span className="text-sm font-bold">{toast.message}</span>
            </motion.div>
        )}
      </AnimatePresence>

      <SideDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onOpenSpreadsheet={() => setIsSpreadsheetOpen(true)} 
        onOpenMonthlySummary={() => setIsMonthlySummaryOpen(true)}
        user={profile.userProfile} 
      />
      
      <CurrencyConverterModal isOpen={isConverterOpen} onClose={() => setIsConverterOpen(false)} selectedCurrency={profile.displayCurrency} onSelect={profile.setDisplayCurrency} currencies={profile.currencyList} />
      <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={trans.handleSaveTransaction} initialData={editingTransaction} customCategories={trans.customCategories} onCreateCategory={trans.handleCreateCategory} />
      <TransactionDetailsModal transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} onEdit={(t) => { setEditingTransaction(t); setIsModalOpen(true); setSelectedTransaction(null); }} onDelete={trans.handleDeleteTransaction} />
      
      <AddDebtModal 
        isOpen={isDebtModalOpen} 
        onClose={() => setIsDebtModalOpen(false)} 
        onSave={(amount, type, person, dueDate, description) => {
             // Generate a Transaction ID first
             const transactionId = Math.random().toString(36).substr(2, 9);
             
             // Logic: 
             // If I LEND money (Me deben), I lose money now -> EXPENSE
             // If I BORROW money (Debo), I gain money now -> INCOME
             const transType = type === DebtType.LENT ? TransactionType.EXPENSE : TransactionType.INCOME;
             
             // Create Debt with link to Transaction
             debts.handleSaveDebt(amount, type, person, dueDate, description, transactionId);
             
             // Create Transaction with explicit ID
             trans.handleSaveTransaction(
               amount,
               transType,
               'deudas',
               'Deudas',
               `Registro inicial: ${person} (${description || 'Sin nota'})`,
               transactionId // Pass the same ID
             );
             showToast('Deuda creada y registrada en historial');
        }} 
      />

      <AddQuickActionModal isOpen={isQuickActionModalOpen} onClose={() => setIsQuickActionModalOpen(false)} onSave={trans.handleSaveQuickAction} onDelete={trans.handleDeleteQuickAction} initialData={editingQuickAction} />
      
      <DebtDetailsModal 
        debt={selectedDebt} 
        onClose={() => setSelectedDebt(null)} 
        onDelete={handleFullDeleteDebt} 
        onPay={() => setIsPayDebtModalOpen(true)} 
        onDeletePayment={handleRemovePayment}
      />
      
      <PayDebtModal 
        isOpen={isPayDebtModalOpen} 
        debt={selectedDebt} 
        onClose={() => setIsPayDebtModalOpen(false)} 
        onSave={(amount) => { 
            if(selectedDebt) { 
                const transactionId = Math.random().toString(36).substr(2, 9);
                
                // Logic:
                // If I lend money (Me deben), getting paid back is INCOME.
                // If I borrowed money (Debo), paying it back is EXPENSE.
                const isLent = selectedDebt.type === DebtType.LENT;
                const transType = isLent ? TransactionType.INCOME : TransactionType.EXPENSE;
                
                debts.handlePayDebt(amount, selectedDebt.id, transactionId); 
                
                trans.handleSaveTransaction(
                   amount,
                   transType,
                   'deudas',
                   'Deudas',
                   `Abono: ${selectedDebt.person}`,
                   transactionId
                );
                
                setIsPayDebtModalOpen(false); 
                // Update the selected debt in modal to show new progress immediately
                const updatedDebt = debts.debts.find(d => d.id === selectedDebt.id);
                // We construct the "next" state manually for immediate UI feedback because updatedDebt from hook might lag one cycle
                if (updatedDebt) {
                    setSelectedDebt({ 
                        ...updatedDebt, 
                        paidAmount: updatedDebt.paidAmount + amount,
                        payments: [...updatedDebt.payments, { id: 'temp', amount, date: new Date().toISOString(), transactionId }]
                    });
                }
                
                showToast('Abono registrado en historial');
            }
        }} 
      />
      
      <SpreadsheetModal isOpen={isSpreadsheetOpen} onClose={() => setIsSpreadsheetOpen(false)} sheets={sheets} onUpdateSheets={handleUpdateSheets} />
      <MonthlySummaryModal isOpen={isMonthlySummaryOpen} onClose={() => setIsMonthlySummaryOpen(false)} transactions={trans.transactions} displayCurrency={profile.displayCurrency} userCurrency={profile.userCurrency} currencies={profile.currencyList} />
      
    </div>
  );
}

export default App;