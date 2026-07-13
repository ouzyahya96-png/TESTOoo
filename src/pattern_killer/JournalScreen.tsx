/**
 * ALPHA MAN - Journaling & Tracking Mental Screen (React Native Mobile Screen Blueprint)
 * Clean, production-ready React Native screen displaying the mental journal,
 * quick logger modal, analytics widgets, deep journaling, and future letters.
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  SafeAreaView,
  Alert,
  Modal
} from 'react-native';

import { 
  journalService, 
  JournalEntry, 
  DeepJournalEntry, 
  FutureLetter, 
  PREDEFINED_TAGS, 
  DEEP_JOURNAL_PROMPTS 
} from './journalService';

const { width, height } = Dimensions.get('window');

interface JournalScreenProps {
  onPointsAwarded?: (points: number) => void;
}

export default function JournalScreen({ onPointsAwarded }: JournalScreenProps) {
  // Service State
  const [journalState, setJournalState] = useState(() => journalService.getState());
  const [correlations, setCorrelations] = useState(() => journalService.calculateCorrelations());
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'DEEP_JOURNAL' | 'LETTERS'>('ANALYTICS');

  // Modals visibility
  const [isQuickJournalVisible, setIsQuickJournalVisible] = useState(false);
  const [isDeepJournalVisible, setIsDeepJournalVisible] = useState(false);
  const [isFutureLetterVisible, setIsFutureLetterVisible] = useState(false);

  // Quick Journal Form Fields
  const [formMood, setFormMood] = useState<number>(7);
  const [formEnergy, setFormEnergy] = useState<number>(7);
  const [formUrge, setFormUrge] = useState<number>(2);
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formNote, setFormNote] = useState<string>('');
  const [formGratitudes, setFormGratitudes] = useState<string[]>(['', '', '']);

  // Deep Journal Form Fields
  const [selectedPrompt, setSelectedPrompt] = useState(DEEP_JOURNAL_PROMPTS[0]);
  const [deepResponse, setDeepResponse] = useState('');

  // Future Letter Form Fields
  const [letterTitle, setLetterTitle] = useState('');
  const [letterContent, setLetterContent] = useState('');
  const [letterDays, setLetterDays] = useState<number>(30);

  // Sync state initially and on custom window updates if in hybrid environment
  useEffect(() => {
    const handleUpdate = () => {
      setJournalState(journalService.getState());
      setCorrelations(journalService.calculateCorrelations());
    };
    window.addEventListener('alphaman_journal_updated', handleUpdate);
    return () => window.removeEventListener('alphaman_journal_updated', handleUpdate);
  }, []);

  const handleTagToggle = (tag: string) => {
    if (formTags.includes(tag)) {
      setFormTags(prev => prev.filter(t => t !== tag));
    } else {
      if (tag === "Rien n'a aidé") {
        setFormTags(["Rien n'a aidé"]);
      } else {
        setFormTags(prev => [...prev.filter(t => t !== "Rien n'a aidé"), tag]);
      }
    }
  };

  const submitQuickJournal = () => {
    const activeGratitudes = formGratitudes.filter(g => g.trim() !== "");
    
    const entry = journalService.addQuickEntry(
      formMood,
      formEnergy,
      formUrge,
      formTags,
      formNote,
      activeGratitudes
    );

    if (onPointsAwarded) {
      onPointsAwarded(15); // +15 Points for daily entry
    }

    Alert.alert(
      "Journal Enregistré", 
      "Félicitations ! +15 Points ALPHA crédités pour ta rigueur quotidienne."
    );

    // Reset Form
    setFormMood(7);
    setFormEnergy(7);
    setFormUrge(2);
    setFormTags([]);
    setFormNote('');
    setFormGratitudes(['', '', '']);
    setIsQuickJournalVisible(false);
    
    // Refresh local lists
    setJournalState(journalService.getState());
    setCorrelations(journalService.calculateCorrelations());
  };

  const submitDeepJournal = () => {
    if (deepResponse.trim().length < 20) {
      Alert.alert("Écrit un peu plus", "Essaye de creuser plus profondément pour stimuler ta plasticité synaptique (min 20 caractères).");
      return;
    }

    journalService.addDeepEntry(selectedPrompt.id, selectedPrompt.text, deepResponse);
    
    if (onPointsAwarded) {
      onPointsAwarded(30); // +30 Points for Deep Self Reflection
    }

    Alert.alert(
      "Introspection Validée",
      "Écriture profonde terminée ! +30 Points de discipline cognitive accordés."
    );

    setDeepResponse('');
    setIsDeepJournalVisible(false);
    
    setJournalState(journalService.getState());
  };

  const submitFutureLetter = () => {
    if (letterContent.trim().length < 50) {
      Alert.alert("Lettre trop courte", "Écris un message plus consistant pour inspirer ton futur moi.");
      return;
    }

    journalService.createLetter(letterTitle, letterContent, letterDays);
    
    Alert.alert(
      "Lettre Scellée 🔒",
      `Ton message a été crypté et scellé. Il te sera livré dans exactement ${letterDays} jours !`
    );

    setLetterTitle('');
    setLetterContent('');
    setLetterDays(30);
    setIsFutureLetterVisible(false);

    setJournalState(journalService.getState());
  };

  const handleExportJournal = () => {
    const exportResult = journalService.exportJournalToTXT();
    Alert.alert(
      "Export Prêt",
      `Ton journal Alpha entier (Format TXT structuré) est prêt pour l'archivage ou l'impression.`
    );
  };

  // Quick stats calculations
  const totalEntries = journalState.entries.length;
  const avgMood = totalEntries > 0 
    ? (journalState.entries.reduce((s, e) => s + e.mood, 0) / totalEntries).toFixed(1) 
    : "0.0";
  const avgUrges = totalEntries > 0 
    ? (journalState.entries.reduce((s, e) => s + e.urge, 0) / totalEntries).toFixed(1) 
    : "0.0";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* HEADER BRANDING */}
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>MIND — PHASE 1.4</Text>
          <Text style={styles.headerTitle}>JOURNALING & PATTERNS</Text>
          <Text style={styles.headerDescription}>
            Le journal est le miroir de l'âme souveraine. Analyse tes déclencheurs et détruis tes automatismes.
          </Text>
        </View>

        {/* HERO QUICK JOURNAL TRIGGER BUTTON */}
        <TouchableOpacity 
          style={styles.heroLogButton}
          onPress={() => setIsQuickJournalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.heroLogButtonSub}>ENREGISTREMENT RAPIDE (2 MIN)</Text>
          <Text style={styles.heroLogButtonTitle}>📝 Remplir mon journal du jour</Text>
          <Text style={styles.heroLogButtonDesc}>Humeur, énergie, urges, gratitude et note synthétique</Text>
        </TouchableOpacity>

        {/* QUICK STATS METRICS ROW */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>JOURS COMPLÉTÉS</Text>
            <Text style={styles.statVal}>{totalEntries} Jours</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>MOY. HUMEUR</Text>
            <Text style={[styles.statVal, { color: '#00E676' }]}>{avgMood}/10</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>MOY. URGES</Text>
            <Text style={[styles.statVal, { color: '#E94560' }]}>{avgUrges}/10</Text>
          </View>
        </View>

        {/* EXPORT DATA & GRATITUDES HIGHLIGHT */}
        <View style={styles.gratitudeHighlight}>
          <Text style={styles.gratitudeTitle}>Mindset Positif : Gratitude Log</Text>
          <Text style={styles.gratitudeDesc}>
            Tu as consigné <Text style={styles.gratitudeCountText}>{journalState.totalGratitudesCount} affirmations</Text> de gratitude. Ton cerveau se re-câble activement vers l'abondance.
          </Text>
          <TouchableOpacity style={styles.exportLink} onPress={handleExportJournal}>
            <Text style={styles.exportLinkText}>📥 Exporter mon journal complet (PDF/TXT) ›</Text>
          </TouchableOpacity>
        </View>

        {/* SECTION SELECTOR TABS */}
        <View style={styles.tabsWrapper}>
          <View style={styles.tabsContainer}>
            {(['ANALYTICS', 'DEEP_JOURNAL', 'LETTERS'] as const).map((tab) => {
              const isSelected = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[styles.tabButton, isSelected && styles.tabButtonActive]}
                >
                  <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
                    {tab === 'ANALYTICS' ? 'Analytics & Patterns' : tab === 'DEEP_JOURNAL' ? 'Introspection' : 'Lettres futures'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ==================== TAB CONTENT: ANALYTICS & PATTERNS ==================== */}
        {activeTab === 'ANALYTICS' && (
          <View style={styles.tabContentContainer}>
            
            {/* IN-APP TREND ALERTS */}
            {correlations.has3RedDays && (
              <View style={[styles.alertBanner, styles.alertRed]}>
                <Text style={styles.alertTitle}>⚠️ ALERTE : 3 JOURS ROUGES CONSÉCUTIFS</Text>
                <Text style={styles.alertDesc}>
                  Ton humeur ou tes urges sont dans une zone critique depuis 72 heures. Appelle ton buddy ou active l'exercice de Respiration Tactique immédiatement !
                </Text>
              </View>
            )}

            {correlations.moodTrend === "rising" && (
              <View style={[styles.alertBanner, styles.alertGreen]}>
                <Text style={styles.alertTitle}>🔥 TENDANCE POSITIVE CONSTATÉE</Text>
                <Text style={styles.alertDesc}>
                  Exceptionnel ! Ton humeur et ton calme intérieur augmentent de manière stable depuis 14 jours. Ton cerveau rétablit ses récepteurs de dopamine.
                </Text>
              </View>
            )}

            {/* AUTOMATED PATTERNS PANEL */}
            <Text style={styles.sectionHeading}>DÉTECTION AUTOMATIQUE DE PATTERNS</Text>
            
            {correlations.ready ? (
              <View style={styles.correlationsList}>
                {correlations.correlations.map((corr, idx) => {
                  const isWarning = corr.type === "warning";
                  return (
                    <View key={idx} style={[styles.corrCard, isWarning ? styles.corrCardWarning : styles.corrCardPositive]}>
                      <View style={styles.corrHeaderRow}>
                        <Text style={[styles.corrTitle, { color: isWarning ? '#FF9800' : '#00E676' }]}>
                          {corr.title}
                        </Text>
                        <Text style={styles.corrBadge}>
                          {isWarning ? `+${corr.percentage}% Urge` : `-${corr.percentage}% Urge`}
                        </Text>
                      </View>
                      <Text style={styles.corrDesc}>{corr.description}</Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  Calcule de corrélation en attente. Plus de données quotidiennes nécessaires...
                </Text>
              </View>
            )}

            {/* HEATMAP / CALENDAR SIMULATION METRIC */}
            <Text style={styles.sectionHeading}>HEATMAP COGNITIF (Derniers 14 jours)</Text>
            <View style={styles.heatmapCard}>
              <View style={styles.gridColors}>
                {journalState.entries.slice(-14).map((entry, idx) => {
                  const isUrgeHigh = entry.urge >= 6;
                  const isMoodGood = entry.mood >= 7;
                  let color = '#2C2C3E'; // neutral
                  if (isUrgeHigh) color = '#E94560'; // danger
                  else if (isMoodGood) color = '#00E676'; // green
                  
                  return (
                    <View key={idx} style={[styles.gridDot, { backgroundColor: color }]}>
                      <Text style={styles.gridDotText}>{entry.date.split('-')[2]}</Text>
                    </View>
                  );
                })}
              </View>
              <View style={styles.heatmapLegend}>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#00E676' }]} /><Text style={styles.legendText}>Souverain (Bon)</Text></View>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#E94560' }]} /><Text style={styles.legendText}>Urge Élevé (Tendu)</Text></View>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#2C2C3E' }]} /><Text style={styles.legendText}>Stable</Text></View>
              </View>
            </View>

            {/* RECENT ENTRIES HISTORY */}
            <Text style={styles.sectionHeading}>FLUX DES ENTRÉES RÉCENTES</Text>
            {journalState.entries.slice(-5).reverse().map((entry) => (
              <View key={entry.id} style={styles.historyCard}>
                <View style={styles.historyTop}>
                  <Text style={styles.historyDate}>{entry.date} - {entry.dayOfWeek}</Text>
                  <Text style={styles.historyMood}>Humeur: {entry.mood}/10 | Urge: {entry.urge}/10</Text>
                </View>
                {entry.note ? <Text style={styles.historyNote}>"{entry.note}"</Text> : null}
                <View style={styles.historyTags}>
                  {entry.tags.map((t, i) => (
                    <View key={i} style={styles.historyTagItem}>
                      <Text style={styles.historyTagText}>{t}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}

          </View>
        )}

        {/* ==================== TAB CONTENT: DEEP JOURNAL ==================== */}
        {activeTab === 'DEEP_JOURNAL' && (
          <View style={styles.tabContentContainer}>
            
            <View style={styles.deepPromoCard}>
              <Text style={styles.deepPromoTitle}>Mode Introspection Guidée</Text>
              <Text style={styles.deepPromoDesc}>
                L'écriture profonde désengage l'automatisme mental en déplaçant l'activité neuronale vers le cortex préfrontal logique. Écris tes motivations réelles.
              </Text>
              <TouchableOpacity 
                style={styles.deepWriteBtn}
                onPress={() => setIsDeepJournalVisible(true)}
              >
                <Text style={styles.deepWriteBtnText}>✍️ Choisir un prompt & Écrire</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionHeading}>MES RÉFLEXIONS SAUVEGARDÉES ({journalState.deepEntries.length})</Text>
            {journalState.deepEntries.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Aucune introspection consignée. Libère ton esprit pour commencer.</Text>
              </View>
            ) : (
              journalState.deepEntries.map((de) => (
                <View key={de.id} style={styles.deepEntryCard}>
                  <Text style={styles.deepEntryPrompt}>{de.promptText}</Text>
                  <Text style={styles.deepEntryDate}>Rédigé le {de.date}</Text>
                  <Text style={styles.deepEntryResponse}>{de.response}</Text>
                </View>
              ))
            )}

          </View>
        )}

        {/* ==================== TAB CONTENT: LETTERS FUTURES ==================== */}
        {activeTab === 'LETTERS' && (
          <View style={styles.tabContentContainer}>
            
            <View style={styles.deepPromoCard}>
              <Text style={styles.deepPromoTitle}>Lettre à mon futur moi 🔒</Text>
              <Text style={styles.deepPromoDesc}>
                Fais une promesse formelle, ou envoie un avertissement à celui que tu seras dans 30, 60 ou 90 jours. Scelle ta lettre pour bloquer sa lecture jusqu'à la date d'échéance.
              </Text>
              <TouchableOpacity 
                style={[styles.deepWriteBtn, { backgroundColor: '#9C27B0' }]}
                onPress={() => setIsFutureLetterVisible(true)}
              >
                <Text style={styles.deepWriteBtnText}>🔒 Rédiger et Verrouiller une Lettre</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionHeading}>MES LETTRES SCELLÉES & LIVRÉES</Text>
            {journalState.letters.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Aucune lettre scellée pour le moment.</Text>
              </View>
            ) : (
              journalState.letters.map((letter) => {
                const today = new Date().toISOString().split('T')[0];
                const isDelivered = letter.deliverDate <= today;
                
                return (
                  <View key={letter.id} style={styles.letterCard}>
                    <View style={styles.letterHeader}>
                      <Text style={styles.letterTitleText}>{letter.title}</Text>
                      <Text style={[styles.letterStatusBadge, { color: isDelivered ? '#00E676' : '#FF9800' }]}>
                        {isDelivered ? "✓ PRÊT À LIRE" : "🔒 SCELLÉ"}
                      </Text>
                    </View>
                    <Text style={styles.letterDates}>Rédigé le {letter.dateCreated} • Livraison le {letter.deliverDate}</Text>
                    
                    {isDelivered ? (
                      letter.isOpened ? (
                        <Text style={styles.letterContentOpen}>{letter.content}</Text>
                      ) : (
                        <TouchableOpacity 
                          style={styles.openLetterBtn}
                          onPress={() => {
                            journalService.openLetter(letter.id);
                            setJournalState(journalService.getState());
                          }}
                        >
                          <Text style={styles.openLetterBtnText}>📬 Ouvrir et Lire la Lettre</Text>
                        </TouchableOpacity>
                      )
                    ) : (
                      <View style={styles.lockedLetterCard}>
                        <Text style={styles.lockedLetterText}>
                          Cette lettre est protégée par un protocole temporel. Repasse le {letter.deliverDate} pour déchiffrer son contenu. Conserve ton cap pour lire ton message !
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })
            )}

          </View>
        )}

      </ScrollView>

      {/* ==================== MODAL: QUICK JOURNAL ENTRY FORM ==================== */}
      <Modal visible={isQuickJournalVisible} animationType="slide" transparent>
        <SafeAreaView style={styles.modalBg}>
          <View style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>JOURNAL DES SOUVERAINS</Text>
              <TouchableOpacity onPress={() => setIsQuickJournalVisible(false)}>
                <Text style={styles.modalClose}>Fermer ✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              
              {/* MOOD SLIDER */}
              <View style={styles.fieldBlock}>
                <View style={styles.fieldLabelRow}>
                  <Text style={styles.fieldLabel}>Comment te sens-tu ? (Mental)</Text>
                  <Text style={styles.fieldVal}>{formMood}/10 {formMood >= 8 ? "🔥" : formMood >= 6 ? "🙂" : formMood >= 4 ? "😐" : "🚨"}</Text>
                </View>
                {/* Simulated slider controls */}
                <View style={styles.sliderSimulation}>
                  {[1,2,3,4,5,6,7,8,9,10].map((num) => (
                    <TouchableOpacity
                      key={num}
                      onPress={() => setFormMood(num)}
                      style={[styles.numDot, formMood === num && styles.numDotSelected]}
                    >
                      <Text style={styles.numDotText}>{num}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* ENERGY SLIDER */}
              <View style={styles.fieldBlock}>
                <View style={styles.fieldLabelRow}>
                  <Text style={styles.fieldLabel}>Ton niveau d'énergie physique ?</Text>
                  <Text style={styles.fieldVal}>{formEnergy}/10 ⚡</Text>
                </View>
                <View style={styles.sliderSimulation}>
                  {[1,2,3,4,5,6,7,8,9,10].map((num) => (
                    <TouchableOpacity
                      key={num}
                      onPress={() => setFormEnergy(num)}
                      style={[styles.numDot, { borderColor: '#2196F3' }, formEnergy === num && { backgroundColor: '#2196F3' }]}
                    >
                      <Text style={styles.numDotText}>{num}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* URGE SLIDER */}
              <View style={styles.fieldBlock}>
                <View style={styles.fieldLabelRow}>
                  <Text style={styles.fieldLabel}>Intensité des urges/envies ? (0 = rien)</Text>
                  <Text style={[styles.fieldVal, { color: '#E94560' }]}>{formUrge}/10 🎯</Text>
                </View>
                <View style={styles.sliderSimulation}>
                  {[0,1,2,3,4,5,6,7,8,9,10].map((num) => (
                    <TouchableOpacity
                      key={num}
                      onPress={() => setFormUrge(num)}
                      style={[styles.numDot, { borderColor: '#E94560' }, formUrge === num && { backgroundColor: '#E94560' }]}
                    >
                      <Text style={styles.numDotText}>{num}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* TAGS SELECTOR */}
              <Text style={styles.fieldLabel}>Qu'est-ce qui t'a aidé aujourd'hui ?</Text>
              <View style={styles.tagSelectorGrid}>
                {PREDEFINED_TAGS.map((tag) => {
                  const isSelected = formTags.includes(tag);
                  return (
                    <TouchableOpacity
                      key={tag}
                      onPress={() => handleTagToggle(tag)}
                      style={[styles.tagChip, isSelected && styles.tagChipSelected]}
                    >
                      <Text style={[styles.tagChipText, isSelected && styles.tagChipTextActive]}>
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* 3 THINGS OF GRATITUDE */}
              <Text style={styles.fieldLabel}>Log de Gratitude (3 choses rapides)</Text>
              {formGratitudes.map((grat, i) => (
                <TextInput
                  key={i}
                  value={grat}
                  onChangeText={(text) => {
                    const next = [...formGratitudes];
                    next[i] = text;
                    setFormGratitudes(next);
                  }}
                  placeholder={`Gratitude #${i+1} : Tap ton texte...`}
                  placeholderTextColor="#444"
                  style={styles.modalInput}
                />
              ))}

              {/* BRIEF NOTE */}
              <Text style={styles.fieldLabel}>Note rapide (max 280 caractères, optionnel)</Text>
              <TextInput
                value={formNote}
                onChangeText={(text) => setFormNote(text.slice(0, 280))}
                placeholder="Ressentis, victoires, micro-trigger constaté..."
                placeholderTextColor="#444"
                multiline
                numberOfLines={3}
                style={[styles.modalInput, { height: 70, textAlignVertical: 'top' }]}
              />

              {/* SUBMIT BUTTON */}
              <TouchableOpacity 
                style={styles.submitBtn}
                onPress={submitQuickJournal}
              >
                <Text style={styles.submitBtnText}>✓ SAUVEGARDER L'ÉTAT SYNAPTIQUE</Text>
              </TouchableOpacity>

            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ==================== MODAL: DEEP JOURNAL GUIDED ENTRY ==================== */}
      <Modal visible={isDeepJournalVisible} animationType="fade" transparent>
        <SafeAreaView style={styles.modalBg}>
          <View style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>INTROSPECTION GUIDÉE</Text>
              <TouchableOpacity onPress={() => setIsDeepJournalVisible(false)}>
                <Text style={styles.modalClose}>Fermer ✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              
              <Text style={styles.fieldLabel}>Choisis ton prompt cognitif :</Text>
              <View style={styles.promptListContainer}>
                {DEEP_JOURNAL_PROMPTS.slice(0, 5).map((prompt) => (
                  <TouchableOpacity
                    key={prompt.id}
                    onPress={() => setSelectedPrompt(prompt)}
                    style={[styles.promptSelectorItem, selectedPrompt.id === prompt.id && styles.promptSelectorItemActive]}
                  >
                    <Text style={[styles.promptSelectorText, selectedPrompt.id === prompt.id && styles.promptSelectorTextActive]}>
                      {prompt.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.selectedPromptText}>"{selectedPrompt.text}"</Text>

              <TextInput
                value={deepResponse}
                onChangeText={setDeepResponse}
                placeholder="Rédige ici tes pensées les plus honnêtes... C'est ici que tu reprends le contrôle de ton esprit. Creuse en profondeur pour re-câbler ton cortex."
                placeholderTextColor="#444"
                multiline
                numberOfLines={8}
                style={[styles.modalInput, { height: 160, textAlignVertical: 'top', fontSize: 13 }]}
              />

              <TouchableOpacity 
                style={[styles.submitBtn, { backgroundColor: '#E94560' }]}
                onPress={submitDeepJournal}
              >
                <Text style={styles.submitBtnText}>💾 ENREGISTRER MA RÉFLEXION (+30 PTS)</Text>
              </TouchableOpacity>

            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ==================== MODAL: FUTURE LETTER SCELLED ==================== */}
      <Modal visible={isFutureLetterVisible} animationType="fade" transparent>
        <SafeAreaView style={styles.modalBg}>
          <View style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>SCELLER UNE LETTRE</Text>
              <TouchableOpacity onPress={() => setIsFutureLetterVisible(false)}>
                <Text style={styles.modalClose}>Fermer ✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              
              <Text style={styles.fieldLabel}>Titre de la lettre</Text>
              <TextInput
                value={letterTitle}
                onChangeText={setLetterTitle}
                placeholder="Ex: Lettre pour mon futur moi à 90 jours"
                placeholderTextColor="#444"
                style={styles.modalInput}
              />

              <Text style={styles.fieldLabel}>Délai de scellement (jours)</Text>
              <View style={styles.sliderSimulation}>
                {[15, 30, 60, 90].map((days) => (
                  <TouchableOpacity
                    key={days}
                    onPress={() => setLetterDays(days)}
                    style={[styles.numDot, { width: 50 }, letterDays === days && { backgroundColor: '#9C27B0', borderColor: '#9C27B0' }]}
                  >
                    <Text style={styles.numDotText}>{days}j</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Contenu de la lettre (promesses, objectifs, conseils)</Text>
              <TextInput
                value={letterContent}
                onChangeText={letterContent => setLetterContent(letterContent)}
                placeholder="Rédige un message constructif, fort et inspirant. Qu'as-tu besoin d'entendre à cette échéance ?"
                placeholderTextColor="#444"
                multiline
                numberOfLines={10}
                style={[styles.modalInput, { height: 200, textAlignVertical: 'top', fontSize: 13 }]}
              />

              <TouchableOpacity 
                style={[styles.submitBtn, { backgroundColor: '#9C27B0' }]}
                onPress={submitFutureLetter}
              >
                <Text style={styles.submitBtnText}>🔒 SCELLER ET ENCRYPTER LA LETTRE</Text>
              </TouchableOpacity>

            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A12',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    marginTop: 10,
  },
  headerSubtitle: {
    color: '#E94560',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  headerDescription: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '300',
    marginTop: 6,
    lineHeight: 18,
  },
  heroLogButton: {
    backgroundColor: '#E9456015',
    borderColor: '#E94560',
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#E94560',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  heroLogButtonSub: {
    color: '#E94560',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  heroLogButtonTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  heroLogButtonDesc: {
    color: '#8E8E93',
    fontSize: 11,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#111122',
    borderColor: '#1C1C3A',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    color: '#8E8E93',
    fontSize: 8,
    fontWeight: 'bold',
  },
  statVal: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 4,
  },
  gratitudeHighlight: {
    backgroundColor: '#0F0F1A',
    borderColor: '#1C1C3A',
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  gratitudeTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  gratitudeDesc: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  gratitudeCountText: {
    color: '#00E676',
    fontWeight: 'bold',
  },
  exportLink: {
    marginTop: 10,
  },
  exportLinkText: {
    color: '#E94560',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabsWrapper: {
    marginBottom: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#111122',
    borderColor: '#1C1C3A',
    borderWidth: 1,
    borderRadius: 12,
    padding: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 9,
  },
  tabButtonActive: {
    backgroundColor: '#E94560',
  },
  tabText: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabContentContainer: {
    gap: 20,
  },
  alertBanner: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  alertRed: {
    backgroundColor: '#E9456015',
    borderColor: '#E9456030',
  },
  alertGreen: {
    backgroundColor: '#00E67615',
    borderColor: '#00E67630',
  },
  alertTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  alertDesc: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 4,
    lineHeight: 15,
  },
  sectionHeading: {
    color: '#E94560',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginTop: 10,
    marginBottom: -5,
  },
  correlationsList: {
    gap: 12,
  },
  corrCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  corrCardPositive: {
    backgroundColor: '#00E67605',
    borderColor: '#00E67620',
  },
  corrCardWarning: {
    backgroundColor: '#FF980005',
    borderColor: '#FF980020',
  },
  corrHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  corrTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  corrBadge: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    backgroundColor: '#00000030',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  corrDesc: {
    color: '#8E8E93',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 15,
  },
  heatmapCard: {
    backgroundColor: '#111122',
    borderColor: '#1C1C3A',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  gridColors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginVertical: 10,
  },
  gridDot: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridDotText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  heatmapLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1C1C3A',
    paddingTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: '#8E8E93',
    fontSize: 9,
  },
  emptyCard: {
    backgroundColor: '#111122',
    borderColor: '#1C1C3A',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  historyCard: {
    backgroundColor: '#111122',
    borderColor: '#1C1C3A',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  historyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyDate: {
    color: '#E94560',
    fontSize: 10,
    fontWeight: 'bold',
  },
  historyMood: {
    color: '#8E8E93',
    fontSize: 10,
  },
  historyNote: {
    color: '#FFFFFF',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 6,
  },
  historyTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  historyTagItem: {
    backgroundColor: '#1C1C3A',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  historyTagText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  deepPromoCard: {
    backgroundColor: '#111122',
    borderColor: '#1C1C3A',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  deepPromoTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  deepPromoDesc: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  deepWriteBtn: {
    backgroundColor: '#E94560',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  deepWriteBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deepEntryCard: {
    backgroundColor: '#111122',
    borderColor: '#1C1C3A',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  deepEntryPrompt: {
    color: '#E94560',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deepEntryDate: {
    color: '#8E8E93',
    fontSize: 9,
    marginTop: 2,
  },
  deepEntryResponse: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 8,
  },
  letterCard: {
    backgroundColor: '#111122',
    borderColor: '#1C1C3A',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  letterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  letterTitleText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  letterStatusBadge: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  letterDates: {
    color: '#8E8E93',
    fontSize: 9,
    marginTop: 2,
  },
  lockedLetterCard: {
    backgroundColor: '#00000020',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
  },
  lockedLetterText: {
    color: '#8E8E93',
    fontSize: 10,
    lineHeight: 14,
    fontStyle: 'italic',
  },
  letterContentOpen: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 10,
    backgroundColor: '#00000030',
    padding: 10,
    borderRadius: 8,
  },
  openLetterBtn: {
    backgroundColor: '#1C1C3A',
    borderColor: '#9C27B0',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  openLetterBtnText: {
    color: '#9C27B0',
    fontSize: 11,
    fontWeight: 'bold',
  },
  modalBg: {
    flex: 1,
    backgroundColor: '#000000D0',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0C0C16',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderColor: '#1C1C3A',
    borderTopWidth: 1.5,
    height: height * 0.85,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C3A',
    paddingBottom: 12,
    marginBottom: 12,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  modalClose: {
    color: '#E94560',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalScroll: {
    paddingBottom: 40,
    gap: 14,
  },
  fieldBlock: {
    gap: 6,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  fieldVal: {
    color: '#00E676',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sliderSimulation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#111122',
    borderRadius: 10,
    padding: 6,
  },
  numDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderColor: '#00E676',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numDotSelected: {
    backgroundColor: '#00E676',
  },
  numDotText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  tagSelectorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagChip: {
    backgroundColor: '#111122',
    borderColor: '#1C1C3A',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagChipSelected: {
    backgroundColor: '#E94560',
    borderColor: 'transparent',
  },
  tagChipText: {
    color: '#8E8E93',
    fontSize: 10,
  },
  tagChipTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalInput: {
    backgroundColor: '#111122',
    borderColor: '#1C1C3A',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    color: '#FFFFFF',
    fontSize: 11,
  },
  submitBtn: {
    backgroundColor: '#00E676',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: 'bold',
  },
  promptListContainer: {
    gap: 8,
    maxHeight: 150,
  },
  promptSelectorItem: {
    backgroundColor: '#111122',
    borderColor: '#1C1C3A',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  promptSelectorItemActive: {
    borderColor: '#E94560',
    backgroundColor: '#E9456010',
  },
  promptSelectorText: {
    color: '#8E8E93',
    fontSize: 11,
  },
  promptSelectorTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  selectedPromptText: {
    color: '#E94560',
    fontSize: 13,
    fontWeight: 'bold',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
  }
});
