import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft,
  FileText,
  Download,
  AlertCircle,
  RotateCcw,
  Check,
  Award,
  Filter,
  Code,
  Copy,
  Settings,
  X,
  Sparkles,
  ChevronDown,
  Info
} from 'lucide-react';
import { AlphaButton } from '../../components/AlphaButton';

interface BillingHistoryScreenProps {
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  onBack?: () => void;
}

export const BillingHistoryScreen: React.FC<BillingHistoryScreenProps> = ({ addToast, onBack }) => {
  const isMounted = useRef<boolean>(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Simulator states
  const [showNativeCode, setShowNativeCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Stats
  const totalSpent = 1770;
  const invoiceCount = 12;
  const averageMonthly = 147.50;
  const lastPaymentDate = '15/07/2026';
  const loyaltyMonths = 12;

  // Invoices list database
  const [invoicesList, setInvoicesList] = useState<any[]>([
    {
      id: 'FAC-2026-0715',
      number: "FAC-2026-0715",
      planName: "PREMIUM",
      planTier: "Mensuel",
      amount: 59,
      date: "15 juillet 2026",
      group: "JUILLET 2026",
      status: 'paid',
      paymentMethod: "Carte ****4242",
      downloadUrl: "#",
      details: {
        period: "15/07/2026 - 14/08/2026",
        amountHT: 49.17,
        vat: 9.83,
        totalTTC: 59.00,
        paymentDate: "15/07/2026",
        paymentTime: "14:32"
      }
    },
    {
      id: 'REM-2026-0710',
      number: "REM-2026-0710",
      planName: "Remboursement — Upgrade ELITE",
      planTier: "Différence tarifaire",
      amount: 40,
      date: "10 juillet 2026",
      group: "JUILLET 2026",
      status: 'refunded',
      paymentMethod: "Crédit CMI",
      downloadUrl: "#",
      details: {
        period: "Compensation temporaire",
        amountHT: 33.33,
        vat: 6.67,
        totalTTC: 40.00,
        paymentDate: "10/07/2026",
        paymentTime: "09:15"
      }
    },
    {
      id: 'FAC-2026-0615',
      number: "FAC-2026-0615",
      planName: "PREMIUM",
      planTier: "Mensuel",
      amount: 59,
      date: "15 juin 2026",
      group: "JUIN 2026",
      status: 'paid',
      paymentMethod: "Carte ****4242",
      downloadUrl: "#",
      details: {
        period: "15/06/2026 - 14/07/2026",
        amountHT: 49.17,
        vat: 9.83,
        totalTTC: 59.00,
        paymentDate: "15/06/2026",
        paymentTime: "11:24"
      }
    },
    {
      id: 'FAC-2026-0615-E',
      number: "FAC-2026-0615-E",
      planName: "PREMIUM",
      planTier: "Mensuel",
      amount: 59,
      date: "15 juin 2026",
      group: "JUIN 2026",
      status: 'failed',
      errorMessage: "Carte refusée",
      paymentMethod: "Carte ****4242",
      downloadUrl: "#",
      details: {
        period: "Échec de prélèvement",
        amountHT: 49.17,
        vat: 9.83,
        totalTTC: 59.00,
        paymentDate: "15/06/2026",
        paymentTime: "08:00"
      }
    },
    {
      id: 'FAC-2026-0515',
      number: "FAC-2026-0515",
      planName: "PREMIUM",
      planTier: "Mensuel",
      amount: 59,
      date: "15 mai 2026",
      group: "MAI 2026",
      status: 'paid',
      paymentMethod: "Carte ****4242",
      downloadUrl: "#",
      details: {
        period: "15/05/2026 - 14/06/2026",
        amountHT: 49.17,
        vat: 9.83,
        totalTTC: 59.00,
        paymentDate: "15/05/2026",
        paymentTime: "10:11"
      }
    }
  ]);

  // Handle individual invoice download
  const downloadInvoice = (number: string) => {
    addToast('success', `Facture ${number} téléchargée avec succès (PDF crypté CMI). 📄`);
  };

  // Handle download all invoices
  const downloadAllInvoices = () => {
    addToast('info', "Génération d'une archive ZIP contenant l'intégralité de vos justificatifs d'acier... 📦");
    setTimeout(() => {
      if (isMounted.current) {
        addToast('success', "Archive des factures téléchargée avec succès !");
      }
    }, 1500);
  };

  // Retry a failed payment simulation
  const retryPayment = (id: string) => {
    addToast('info', `Tentative de prélèvement de secours via CMI pour la facture ${id}...`);
    setTimeout(() => {
      if (isMounted.current) {
        setInvoicesList(prev => prev.map(inv => {
          if (inv.id === id) {
            return { ...inv, status: 'paid', errorMessage: undefined };
          }
          return inv;
        }));
        addToast('success', "Régularisation effectuée ! Le paiement a été validé par la banque marocaine. 🟢");
      }
    }, 1500);
  };

  // Load more simulation
  const handleLoadMore = () => {
    if (page >= 2) {
      setHasMore(false);
      addToast('warning', "Toutes les factures ont été chargées.");
      return;
    }
    setPage(prev => prev + 1);

    const oldInvoices = [
      {
        id: 'FAC-2026-0415',
        number: "FAC-2026-0415",
        planName: "BASIC",
        planTier: "Mensuel",
        amount: 29,
        date: "15 avril 2026",
        group: "AVRIL 2026",
        status: 'paid',
        paymentMethod: "Carte ****4242",
        downloadUrl: "#",
        details: {
          period: "15/04/2026 - 14/05/2026",
          amountHT: 24.17,
          vat: 4.83,
          totalTTC: 29.00,
          paymentDate: "15/04/2026",
          paymentTime: "10:00"
        }
      },
      {
        id: 'FAC-2026-0315',
        number: "FAC-2026-0315",
        planName: "BASIC",
        planTier: "Mensuel",
        amount: 29,
        date: "15 mars 2026",
        group: "MARS 2026",
        status: 'paid',
        paymentMethod: "Carte ****4242",
        downloadUrl: "#",
        details: {
          period: "15/03/2026 - 14/04/2026",
          amountHT: 24.17,
          vat: 4.83,
          totalTTC: 29.00,
          paymentDate: "15/03/2026",
          paymentTime: "09:30"
        }
      }
    ];

    setInvoicesList(prev => [...prev, ...oldInvoices]);
    addToast('success', "Factures antérieures récupérées avec succès.");
  };

  // Filter invoices logic
  const filteredInvoices = invoicesList.filter(inv => {
    if (activeFilter === 'all') return true;
    return inv.status === activeFilter;
  });

  // Group invoices by month
  const groupedInvoices: { [key: string]: any[] } = {};
  filteredInvoices.forEach(inv => {
    if (!groupedInvoices[inv.group]) {
      groupedInvoices[inv.group] = [];
    }
    groupedInvoices[inv.group].push(inv);
  });

  const expoNativeCode = `import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Modal 
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';

export default function BillingHistoryScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.touchTarget} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FACTURES</Text>
        <TouchableOpacity style={styles.touchTarget}>
          <Feather name="download" size={22} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* FINANCIAL SUMMARY */}
        <View style={styles.summaryCard}>
          <Text style={styles.spentLabel}>TOTAL DÉPENSÉ</Text>
          <Text style={styles.spentAmount}>1,770</Text>
          <Text style={styles.spentCurrency}>DIRHAMS</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  header: { height: 80, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  headerTitle: { fontSize: 24, fontFamily: 'Montserrat-Bold', color: '#FFD700', fontWeight: 'bold' },
  touchTarget: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: 40 },
  summaryCard: { backgroundColor: '#16213E', padding: 32, borderRadius: 24, margin: 16, borderColor: '#FFD700', borderWidth: 2 }
});`;

  const copyExpoCode = () => {
    navigator.clipboard.writeText(expoNativeCode);
    setCopied(true);
    addToast('success', "Code source du journal de facturation copié ! 🧬");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full text-white relative">
      
      {/* SIMULATOR CONTROLS HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111124] border border-[#1C1C3A] rounded-2xl p-4 gap-4 shadow-xl text-left">
        <div>
          <span className="text-[10px] font-mono text-[#FFD700] uppercase tracking-widest bg-[#FFD700]/10 border border-[#FFD700]/20 px-2 rounded-md">
            Historique Fiscal (7.3)
          </span>
          <h2 className="text-md font-headline font-black text-white mt-1">
            Transparence Financière & Justificatifs — BillingHistoryScreen
          </h2>
          <p className="text-xs text-gray-400">
            Visionnez l'ensemble des débits passés, régularisez les impayés et visualisez le coût total engagé.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {onBack && (
            <AlphaButton variant="ghost" size="sm" onClick={onBack}>
              Retour
            </AlphaButton>
          )}

          <AlphaButton 
            variant={showNativeCode ? "gold" : "primary"}
            size="sm"
            onClick={() => setShowNativeCode(!showNativeCode)}
            className="flex items-center gap-2"
          >
            <Code className="w-4 h-4" />
            {showNativeCode ? "Masquer le Code" : "Inspecter Code Expo"}
          </AlphaButton>
        </div>
      </div>

      {/* REACT NATIVE CODE INSPECTOR */}
      {showNativeCode && (
        <div className="bg-[#111124] border border-[#1C1C3A] rounded-3xl p-6 flex flex-col gap-4 animate-[fade-in_0.3s_ease-out] text-left">
          <div className="flex justify-between items-center border-b border-[#1C1C35] pb-3">
            <div>
              <h4 className="text-xs font-headline font-black text-white">BillingHistoryScreen.tsx (TypeScript Native)</h4>
              <p className="text-[10px] text-gray-500">
                Gère les filtres dynamiques, le groupement chronologique mensuel et l'animation de compteur montant.
              </p>
            </div>
            <AlphaButton 
              variant="secondary" 
              size="sm" 
              onClick={copyExpoCode}
              className="flex items-center gap-2 text-[10px] font-headline"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copié !' : 'Copier le Code Natif'}
            </AlphaButton>
          </div>
          <pre className="p-4 bg-[#0A0A14] rounded-2xl border border-[#1A1A2E] overflow-x-auto text-[10px] md:text-xs font-mono text-gray-300 leading-relaxed max-h-[350px] custom-scrollbar">
            {expoNativeCode}
          </pre>
        </div>
      )}

      {/* TWO PANEL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT PANEL: ADMIN SIMULATOR CONTROLS */}
        <div className="lg:col-span-4 bg-[#111124] border border-[#1C1C3A] rounded-[24px] p-5 space-y-5 text-left shadow-lg">
          <div className="border-b border-gray-800 pb-3">
            <h3 className="text-sm font-headline font-black text-[#FFD700] uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Console de Facturation
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">
              Simulez de nouvelles factures ou résolvez les échecs de paiement CMI en temps réel.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* Quick action injection */}
            <div className="space-y-2">
              <span className="text-[10px] font-headline text-gray-500 uppercase tracking-wider block">
                Actions de Simulation
              </span>
              <button 
                onClick={() => {
                  const newInv = {
                    id: `FAC-${Date.now()}`,
                    number: `FAC-2026-0815`,
                    planName: "ELITE",
                    planTier: "Coaching",
                    amount: 99,
                    date: "15 août 2026",
                    group: "AOÛT 2026",
                    status: 'pending',
                    paymentMethod: "Carte ****4242",
                    downloadUrl: "#",
                    details: {
                      period: "15/08/2026 - 14/09/2026",
                      amountHT: 82.50,
                      vat: 16.50,
                      totalTTC: 99.00,
                      paymentDate: "En attente",
                      paymentTime: "12:00"
                    }
                  };
                  setInvoicesList(prev => [newInv, ...prev]);
                  addToast('success', "Nouvelle facture en attente de 99 DH injectée pour août 2026 ! 🧾");
                }}
                className="w-full py-2 bg-[#FFD700]/10 border border-[#FFD700]/20 hover:bg-[#FFD700]/20 text-[#FFD700] text-xs font-bold rounded-xl transition-all"
              >
                Injecter Facture "En Attente" (99 DH)
              </button>
            </div>

            <div className="bg-[#16213E] p-3.5 rounded-2xl border border-white/5 text-[11px] text-gray-400 leading-normal font-headline">
              💡 <strong>Déductibilité :</strong> Au Maroc, les factures de formation d'acier ou de sport peuvent parfois être intégrées dans les frais généraux de l'entreprise s'il y a un lien de discipline fort !
            </div>

          </div>
        </div>

        {/* RIGHT PANEL: PHONE PREVIEW SIMULATOR */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div className="w-full max-w-[430px] bg-black rounded-[48px] p-3.5 pt-5 pb-5 border-[7px] border-[#222232] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] relative overflow-hidden">
            
            {/* Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-5 bg-black rounded-b-2xl z-50 flex items-center justify-center gap-1.5">
              <div className="w-12 h-0.5 bg-[#222232] rounded-full" />
              <div className="w-2.5 h-2.5 bg-[#101020] rounded-full" />
            </div>

            {/* SCREEN */}
            <div className="bg-[#0F0F1A] rounded-[36px] overflow-hidden flex flex-col relative min-h-[820px] text-left select-none">
              
              {/* Status Bar */}
              <div className="h-10 px-6 pt-3 flex justify-between items-center text-[10px] font-mono font-bold text-gray-500 z-20">
                <span>14:03</span>
                <div className="flex items-center gap-1.5">
                  <span>5G</span>
                  <div className="w-4 h-2 border border-gray-600 rounded-2xs p-[1px] flex items-center">
                    <div className="h-full w-3 bg-[#FFD700] rounded-3xs" />
                  </div>
                </div>
              </div>

              {/* HEADER */}
              <div className="h-14 px-4 flex items-center justify-between border-b border-gray-950 bg-[#0F0F1A] z-10">
                <button 
                  onClick={onBack}
                  className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-white/5 active:bg-white/10 transition-colors text-white cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <h1 className="text-xs font-headline font-black tracking-widest text-[#FFD700] uppercase">
                  Historique Fiscal
                </h1>
                <button 
                  onClick={downloadAllInvoices}
                  className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-white/5 text-gray-400 cursor-pointer"
                  title="Télécharger toutes les factures"
                >
                  <Download className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* STREAM AREA */}
              <div className="flex-1 overflow-y-auto max-h-[620px] p-4 space-y-6 custom-scrollbar">
                
                {/* SECTION 1: RÉSUMÉ FINANCIER (CARD PRINCIPALE) */}
                <div className="bg-[#16213E] rounded-[24px] p-6 border-2 border-[#FFD700] shadow-2xl text-center space-y-4">
                  
                  <span className="text-[10px] font-headline font-black text-gray-400 tracking-widest block uppercase">
                    TOTAL INVESTI DANS TOI-MÊME
                  </span>

                  <div className="relative inline-block mx-auto">
                    <span className="text-5xl font-mono font-black text-[#FFD700] block tracking-tight">
                      {totalSpent.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-headline font-black text-[#FFD700] tracking-widest block mt-1 uppercase">
                      DIRHAMS MAROCAINS
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-400 font-headline leading-tight">
                    Investissements cumulés de discipline depuis juillet 2025
                  </p>

                  {/* Quick mini-grid info stats */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5 text-left">
                    <div>
                      <span className="text-[9px] text-gray-500 font-headline uppercase block">Factures</span>
                      <span className="text-xs font-mono font-bold text-white">{invoiceCount}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-500 font-headline uppercase block">Moyenne</span>
                      <span className="text-xs font-mono font-bold text-white">{averageMonthly} DH</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-500 font-headline uppercase block">Dernier</span>
                      <span className="text-xs font-mono font-bold text-[#00D9A5]">{lastPaymentDate}</span>
                    </div>
                  </div>

                  {/* Loyalty Badge */}
                  <div className="bg-[#00D9A5]/10 border border-[#00D9A5]/25 rounded-xl py-2 px-3 flex items-center justify-center gap-2 text-[#00D9A5] text-[11px] font-headline font-bold">
                    <Award className="w-4 h-4" />
                    <span>Fidélité de discipline : {loyaltyMonths} mois actifs</span>
                  </div>

                </div>

                {/* SECTION 2: FILTRES (TABS) */}
                <div className="flex gap-2 overflow-x-auto pb-1.5 custom-scrollbar text-left">
                  {[
                    { id: 'all', label: "Tout" },
                    { id: 'paid', label: "Payées" },
                    { id: 'pending', label: "En attente" },
                    { id: 'failed', label: "Échouées" },
                    { id: 'refunded', label: "Remboursé" }
                  ].map((tab) => (
                    <button 
                      key={tab.id}
                      onClick={() => {
                        setActiveFilter(tab.id);
                        addToast('info', `Filtre "${tab.label}" appliqué.`);
                      }}
                      className={`py-2 px-4 rounded-full text-[10px] font-headline font-black uppercase tracking-wider border transition-all cursor-pointer flex-shrink-0
                        ${activeFilter === tab.id 
                          ? 'bg-[#FFD700] text-[#0F0F1A] border-[#FFD700]' 
                          : 'border-white/10 text-gray-400 hover:border-gray-700'
                        }
                      `}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* SECTION 3: LISTE DES FACTURES */}
                <div className="space-y-4">
                  
                  {Object.keys(groupedInvoices).length === 0 ? (
                    <div className="py-8 text-center text-gray-600 font-headline text-xs">
                      Aucun enregistrement ne correspond à ce filtre de facturation.
                    </div>
                  ) : (
                    Object.keys(groupedInvoices).map((groupName) => (
                      <div key={groupName} className="space-y-2">
                        {/* Month group header */}
                        <h4 className="text-[10px] font-headline font-black text-gray-500 tracking-widest uppercase text-left pt-2">
                          {groupName}
                        </h4>

                        <div className="space-y-2">
                          {groupedInvoices[groupName].map((inv) => (
                            <div 
                              key={inv.id}
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setShowDetailModal(true);
                                addToast('info', `Détails de la facture ${inv.number} affichés.`);
                              }}
                              className={`rounded-2xl p-4 flex items-center justify-between transition-all cursor-pointer border text-left
                                ${inv.status === 'failed' 
                                  ? 'bg-[#FF2D55]/5 border-[#FF2D55]/20' 
                                  : 'bg-[#16213E] border-white/5 hover:border-gray-800'
                                }
                              `}
                            >
                              
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                                  ${inv.status === 'paid' ? 'bg-[#00D9A5]/10 text-[#00D9A5]' : ''}
                                  ${inv.status === 'pending' ? 'bg-[#FF9500]/10 text-[#FF9500]' : ''}
                                  ${inv.status === 'failed' ? 'bg-[#FF2D55]/10 text-[#FF2D55]' : ''}
                                  ${inv.status === 'refunded' ? 'bg-purple-500/10 text-purple-400' : ''}
                                `}>
                                  {inv.status === 'refunded' ? (
                                    <RotateCcw className="w-5 h-5" />
                                  ) : inv.status === 'failed' ? (
                                    <AlertCircle className="w-5 h-5" />
                                  ) : (
                                    <FileText className="w-5 h-5" />
                                  )}
                                </div>

                                <div className="space-y-0.5">
                                  <span className="text-xs font-headline font-black text-white block">
                                    {inv.planName} — {inv.planTier}
                                  </span>
                                  <span className="text-[10px] text-gray-400 font-headline block">
                                    {inv.date} • {inv.paymentMethod}
                                  </span>
                                  <span className="text-[9px] font-mono text-gray-500 block">
                                    {inv.number}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right flex flex-col items-end gap-1.5 flex-shrink-0">
                                <div>
                                  <span className={`text-xs font-mono font-black block
                                    ${inv.status === 'refunded' ? 'text-purple-400' : 'text-white'}
                                  `}>
                                    {inv.status === 'refunded' ? '+' : ''}{inv.amount},00 DH
                                  </span>
                                  
                                  <span className={`text-[8px] font-headline font-black uppercase tracking-wider block
                                    ${inv.status === 'paid' ? 'text-[#00D9A5]' : ''}
                                    ${inv.status === 'pending' ? 'text-[#FF9500]' : ''}
                                    ${inv.status === 'failed' ? 'text-[#FF2D55]' : ''}
                                    ${inv.status === 'refunded' ? 'text-purple-400' : ''}
                                  `}>
                                    {inv.status === 'paid' && "Payée"}
                                    {inv.status === 'pending' && "En attente"}
                                    {inv.status === 'failed' && "Échoué"}
                                    {inv.status === 'refunded' && "Remboursé"}
                                  </span>
                                </div>

                                {/* Download or Action CTA */}
                                {inv.status === 'failed' ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      retryPayment(inv.id);
                                    }}
                                    className="px-2 py-0.5 bg-[#FF2D55] text-white rounded text-[8px] font-headline font-black uppercase tracking-wider cursor-pointer"
                                  >
                                    Réessayer
                                  </button>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      downloadInvoice(inv.number);
                                    }}
                                    className="w-7 h-7 rounded bg-black/40 hover:bg-black flex items-center justify-center text-gray-400 hover:text-white cursor-pointer"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                )}

                              </div>

                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}

                  {hasMore && (
                    <button 
                      onClick={handleLoadMore}
                      className="w-full h-11 bg-transparent hover:bg-white/5 border border-gray-800 text-gray-400 rounded-xl text-xs font-headline font-black uppercase tracking-wider transition-all mt-4 cursor-pointer text-center"
                    >
                      CHARGER PLUS
                    </button>
                  )}

                </div>

                {/* SECTION 5: CONSEIL FACTURATION */}
                <div className="bg-[#1A1A2E] border-l-3 border-[#FFD700] rounded-r-xl p-4 space-y-2 text-left">
                  <div className="flex gap-3 items-start">
                    <FileText className="w-5 h-5 text-[#FFD700] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-white leading-relaxed font-headline">
                        💡 Conserve tes factures pour tes déclarations fiscales. Chaque investissement dans ta santé est déductible selon la législation marocaine.
                      </p>
                      <p className="text-[10px] text-gray-500 font-headline italic mt-1.5">
                        Consulte ton comptable d'acier
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-10" />

              </div>

            </div>
          </div>
        </div>

      </div>

      {/* DETAIL FACTURE MODAL PANEL */}
      {showDetailModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-[fade-in_0.25s_ease-out]">
          <div className="bg-[#111124] border border-[#1C1C3A] rounded-[32px] max-w-sm w-full p-6 text-left space-y-5 relative shadow-2xl">
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#00D9A5]/10 flex items-center justify-center mx-auto text-[#00D9A5]">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-md font-mono font-black text-white leading-none">
                {selectedInvoice.number}
              </h3>
              <p className="text-[10px] text-gray-400 font-headline uppercase tracking-wider leading-none">
                DÉTAILS DES PRESTATIONS ALPHA MAN
              </p>
            </div>

            <div className="w-full h-px bg-gray-800" />

            {/* Structured rows */}
            <div className="space-y-3.5 text-xs font-headline">
              
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Formule d'acier</span>
                <span className="text-white font-bold">{selectedInvoice.planName} ({selectedInvoice.planTier})</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500">Période d'activité</span>
                <span className="text-white font-mono">{selectedInvoice.details.period}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500">Moyen de débit CMI</span>
                <span className="text-white font-bold">{selectedInvoice.paymentMethod}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500">Date et heure</span>
                <span className="text-white font-mono">{selectedInvoice.details.paymentDate} à {selectedInvoice.details.paymentTime}</span>
              </div>

              <div className="w-full h-px bg-gray-900 border-dashed border-b border-gray-800" />

              <div className="flex justify-between items-center">
                <span className="text-gray-500">Montant net (HT)</span>
                <span className="text-white font-mono">{selectedInvoice.details.amountHT.toFixed(2)} DH</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500">TVA (20%)</span>
                <span className="text-white font-mono">{selectedInvoice.details.vat.toFixed(2)} DH</span>
              </div>

              <div className="flex justify-between items-center bg-[#16213E] p-3 rounded-xl border border-white/5">
                <span className="text-[#FFD700] font-black uppercase">TOTAL TTC</span>
                <span className="text-[#FFD700] font-mono font-black text-base">
                  {selectedInvoice.details.totalTTC.toFixed(2)} DH
                </span>
              </div>

            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => downloadInvoice(selectedInvoice.number)}
                className="flex-1 h-11 bg-[#00D9A5] text-[#0F0F1A] rounded-xl text-xs font-headline font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                TÉLÉCHARGER PDF
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 h-11 bg-transparent border border-gray-800 text-gray-400 rounded-xl text-xs font-headline font-bold uppercase cursor-pointer"
              >
                FERMER
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
