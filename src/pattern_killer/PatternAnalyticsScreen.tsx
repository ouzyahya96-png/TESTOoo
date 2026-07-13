/**
 * ALPHA MAN - Pattern Analytics Screen (React Native)
 * Analytical mobile visualization dashboard
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PatternAnalyticsScreen() {
  const [activePeriod, setActivePeriod] = useState<'7D' | '30D' | '90D'>('7D');

  // Static mock stats for displaying premium metrics
  const topTriggers = [
    { name: "Stress du soir", strength: 84, trend: "down", pct: "-12%" },
    { name: "Surcharge Réseaux Sociaux", strength: 68, trend: "down", pct: "-8%" },
    { name: "Weekend isolement", strength: 55, trend: "up", pct: "+4%" }
  ];

  const weekdayRisk = [
    { day: "Lun", risk: 25 },
    { day: "Mar", risk: 30 },
    { day: "Mer", risk: 45 },
    { day: "Jeu", risk: 35 },
    { day: "Ven", risk: 65 },
    { day: "Sam", risk: 85 },
    { day: "Dim", risk: 70 }
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brand}>ALPHA MAN</Text>
        <Text style={styles.title}>PATTERN ANALYTICS</Text>
        <Text style={styles.subtitle}>Évolution et Affaiblissement Neuronal</Text>
      </View>

      {/* Period selector */}
      <View style={styles.tabsContainer}>
        {['7D', '30D', '90D'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activePeriod === tab ? styles.activeTab : null]}
            onPress={() => setActivePeriod(tab as any)}
          >
            <Text style={[styles.tabText, activePeriod === tab ? styles.activeTabText : null]}>
              {tab === '7D' ? '7 JOURS' : tab === '30D' ? '30 JOURS' : '90 JOURS'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Primary weakening stat */}
      <View style={styles.statCard}>
        <Text style={styles.statSub}>INDICE GLOBAL D'AFFAIBLISSEMENT</Text>
        <Text style={styles.statVal}>-34.2%</Text>
        <Text style={styles.statDesc}>Les patterns neuro-comportementaux de relapse se dégradent grâce à votre discipline de fer.</Text>
      </View>

      {/* Trigger List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TOP TRIGGERS DETECTÉS</Text>
        {topTriggers.map((trig, idx) => (
          <View key={idx} style={styles.triggerRow}>
            <View style={styles.triggerHeader}>
              <Text style={styles.triggerName}>{trig.name}</Text>
              <Text style={styles.triggerPct}>{trig.pct}</Text>
            </View>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width: `${trig.strength}%` }]} />
            </View>
          </View>
        ))}
      </View>

      {/* Weekday heatmap visualization mockup */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PRODUIT DE RISQUE JOURNALIER</Text>
        <View style={styles.chartRow}>
          {weekdayRisk.map((item, idx) => (
            <View key={idx} style={styles.chartCol}>
              <View style={styles.colTrack}>
                <View style={[
                  styles.colFill, 
                  { height: `${item.risk}%` },
                  item.risk >= 60 ? { backgroundColor: '#E94560' } : item.risk >= 40 ? { backgroundColor: '#FFD700' } : { backgroundColor: '#00D9A5' }
                ]} />
              </View>
              <Text style={styles.colLabel}>{item.day}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Proactive Prediction Alert */}
      <View style={styles.predictionCard}>
        <Text style={styles.predictionTitle}>🔮 PRÉDICTION INTÉGRÉE POUR DEMAIN</Text>
        <Text style={styles.predictionDesc}>
          Demain (Dimanche) : Risque de relapse estimé à <Text style={styles.boldRed}>72%</Text> en soirée en raison du pattern d'isolement du weekend. Préparez activement votre protocole d'urgence !
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
    marginTop: Platform.OS === 'ios' ? 40 : 10,
  },
  brand: {
    color: '#FFD700',
    fontFamily: 'Montserrat-Bold',
    fontSize: 12,
    letterSpacing: 4,
    fontWeight: 'bold',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 5,
    letterSpacing: 1,
  },
  subtitle: {
    color: '#8E8E93',
    fontSize: 11,
    marginTop: 5,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#16213E',
    padding: 4,
    borderRadius: 12,
    marginBottom: 20,
    borderColor: '#1A1A2E',
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#E94560',
  },
  tabText: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  statCard: {
    backgroundColor: '#16213E',
    borderColor: '#00D9A5',
    borderWidth: 1,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  statSub: {
    color: '#00D9A5',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  statVal: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  statDesc: {
    color: '#8E8E93',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  section: {
    backgroundColor: '#16213E',
    borderColor: '#1A1A2E',
    borderWidth: 1,
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 15,
  },
  triggerRow: {
    marginBottom: 15,
  },
  triggerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  triggerName: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  triggerPct: {
    color: '#E94560',
    fontSize: 11,
    fontWeight: 'bold',
  },
  barBg: {
    backgroundColor: '#0F0F1A',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    backgroundColor: '#E94560',
    height: '100%',
  },
  chartRow: {
    flexDirection: 'row',
    height: 120,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  chartCol: {
    alignItems: 'center',
    flex: 1,
  },
  colTrack: {
    backgroundColor: '#0F0F1A',
    height: 80,
    width: 10,
    borderRadius: 5,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  colFill: {
    width: '100%',
    borderRadius: 5,
  },
  colLabel: {
    color: '#8E8E93',
    fontSize: 10,
    marginTop: 8,
  },
  predictionCard: {
    backgroundColor: '#16213E',
    borderColor: '#FFD700',
    borderWidth: 1,
    padding: 20,
    borderRadius: 20,
    marginBottom: 30,
  },
  predictionTitle: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  predictionDesc: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 18,
  },
  boldRed: {
    color: '#E94560',
    fontWeight: 'bold',
  }
});
