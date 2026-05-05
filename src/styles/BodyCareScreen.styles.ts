import { StyleSheet } from 'react-native';
import { spacing } from '../theme/tokens';

export const darkPalette = {
  backgroundTop: '#040712',
  backgroundBottom: '#080d1a',
  primaryGlow: 'rgba(56, 189, 248, 0.25)',
  secondaryGlow: 'rgba(16, 185, 129, 0.18)',
  accentGlow: 'rgba(56, 189, 248, 0.12)',
  surface: 'rgba(18, 25, 41, 0.92)',
  surfaceSoft: 'rgba(255, 255, 255, 0.08)',
  stroke: 'rgba(148, 163, 184, 0.16)',
  strokeAlert: 'rgba(56, 189, 248, 0.4)',
  text: '#ffffff',
  textMuted: '#f1f5f9',
  textSoft: '#94a3b8',
  blue: '#0ea5e9',
  blueSoft: 'rgba(56, 189, 248, 0.16)',
  green: '#10b981',
  greenSoft: 'rgba(16, 185, 129, 0.16)',
  accent: '#38bdf8',
  accentSoft: 'rgba(56, 189, 248, 0.12)',
  shadow: 'rgba(0, 0, 0, 0.5)',
};

export const lightPalette = {
  backgroundTop: '#f0f9ff',
  backgroundBottom: '#ffffff',
  primaryGlow: 'rgba(2, 132, 199, 0.08)',
  secondaryGlow: 'rgba(5, 150, 105, 0.06)',
  accentGlow: 'rgba(2, 132, 199, 0.04)',
  surface: '#ffffff',
  surfaceSoft: '#f1f5f9',
  stroke: 'rgba(0, 0, 0, 0.06)',
  strokeAlert: 'rgba(2, 132, 199, 0.3)',
  text: '#0f172a',
  textMuted: '#334155',
  textSoft: '#64748b',
  blue: '#0369a1',
  blueSoft: 'rgba(14, 165, 233, 0.1)',
  green: '#10b981',
  greenSoft: 'rgba(16, 185, 129, 0.1)',
  accent: '#0ea5e9',
  accentSoft: 'rgba(14, 165, 233, 0.08)',
  shadow: 'rgba(0, 0, 0, 0.05)',
};

export type ScreenPalette = typeof darkPalette;

export function createBodyCareStyles(palette: ScreenPalette) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: palette.backgroundTop },
    content: { paddingHorizontal: spacing.md, paddingTop: 8, paddingBottom: 60 },
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    topIconButton: {
      width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
      backgroundColor: palette.surfaceSoft, borderWidth: 1, borderColor: palette.stroke,
    },
    topTitle: { fontSize: 20, fontWeight: '900', color: palette.text },

    header: { paddingVertical: 12 },
    greeting: { fontSize: 15, color: palette.textSoft, fontWeight: '600', marginBottom: 4 },
    mainTitle: { fontSize: 32, fontWeight: '900', color: palette.text, letterSpacing: -0.5 },
    mainTitleAccent: { color: palette.blue },

    // Goal Card
    goalCard: { 
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      padding: 16, borderRadius: 20,
      backgroundColor: palette.surface,
      marginBottom: 12,
    },
    goalInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    goalIcon: {
      width: 40, height: 40, borderRadius: 12,
      backgroundColor: palette.blueSoft,
      alignItems: 'center', justifyContent: 'center',
    },
    goalLabel: { fontSize: 12, fontWeight: '700', color: palette.textSoft },
    goalValue: { fontSize: 18, fontWeight: '900', color: palette.text },
    editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    editBtnText: { fontSize: 13, fontWeight: '800', color: palette.blue },

    // Hero Progress
    heroContainer: { alignItems: 'center', marginTop: 12, marginBottom: 16, position: 'relative' },
    waterCircle: { 
      width: 280, height: 280, borderRadius: 140, 
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(15, 23, 42, 0.62)',
      borderWidth: 2, borderColor: 'rgba(56, 189, 248, 0.18)',
      overflow: 'hidden',
      shadowColor: palette.blue, shadowOpacity: 0.2, shadowRadius: 18, elevation: 8,
    },
    circleContent: { position: 'absolute', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', zIndex: 10 },
    currentIntake: { fontSize: 64, fontWeight: '900', color: palette.text, textAlign: 'center' },
    intakeUnit: { fontSize: 28, fontWeight: '800' },
    goalSuffix: { fontSize: 16, fontWeight: '700', color: palette.textSoft, marginTop: 4 },
    percentText: { fontSize: 14, fontWeight: '800', color: palette.textSoft, marginTop: 16 },
    heroSpacer: { height: 4 },

    addDrinkBtn: {
      backgroundColor: palette.blue,
      paddingHorizontal: 40, paddingVertical: 18,
      borderRadius: 30, flexDirection: 'row', alignItems: 'center', gap: 10,
       zIndex: 20,
      shadowColor: palette.blue, shadowOpacity: 0.6, shadowRadius: 16, elevation: 12,
    },
    addDrinkText: { fontSize: 18, fontWeight: '900', color: '#fff' },

    // Sections
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 8 },
    sectionTitle: { fontSize: 18, fontWeight: '900', color: palette.text },
    viewAll: { fontSize: 14, fontWeight: '700', color: palette.blue },

    // Quick Add
    quickAddGrid: { flexDirection: 'row', gap: 10, marginTop: 14 },
    quickAddPressable: { flex: 1 },
    quickAddBox: {
      flex: 1, aspectRatio: 0.9, backgroundColor: palette.surface,
      borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    },
    quickAddVal: { fontSize: 15, fontWeight: '900', color: palette.text, marginTop: 10 },

    // Drink Types
    horizontalScroll: { marginHorizontal: -spacing.md, paddingHorizontal: spacing.md },
    drinkTypeBox: {
      alignItems: 'center', marginRight: 24,
    },
    drinkIconCircle: {
      width: 58, height: 58, borderRadius: 22,
      alignItems: 'center', justifyContent: 'center',
    },
    drinkImageIcon: { width: 34, height: 34 },
    drinkTypeLabel: { fontSize: 13, fontWeight: '800', color: palette.text, marginTop: 8 },
    drinkTypeEditBtn: {
      position: 'absolute', top: -4, right: -4,
      width: 22, height: 22, borderRadius: 11,
      backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center',
      borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)',
      zIndex: 10,
    },
    drinkTypeBadge: {
      marginTop: 4, paddingHorizontal: 6, paddingVertical: 2,
      borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)',
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    },
    drinkTypeBadgeText: { fontSize: 9, fontWeight: '900', color: palette.textSoft, textTransform: 'uppercase' },

    // Cards Row (Tips)
    cardsRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
    tipCard: {
      flex: 1, backgroundColor: palette.surface, padding: 16, borderRadius: 24,
    },
    tipIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    tipTitle: { fontSize: 12, fontWeight: '800', color: palette.textSoft },
    tipVal: { fontSize: 15, fontWeight: '900', color: palette.text, marginTop: 4 },
    tipSub: { fontSize: 11, fontWeight: '700', color: palette.textSoft, marginTop: 4 },
    tipMascot: { position: 'absolute', bottom: 10, right: 10, opacity: 0.6 },

    // Overview Stats
    overviewGrid: {
      flexDirection: 'row', backgroundColor: palette.surface, borderRadius: 28,
      padding: 20, justifyContent: 'space-between',
    },
    statItem: { alignItems: 'center', flex: 1 },
    statIcon: { marginBottom: 4 },
    statVal: { fontSize: 18, fontWeight: '900', color: palette.text },
    statLab: { fontSize: 10, fontWeight: '700', color: palette.textSoft, marginTop: 4 },

    // Timeline
    timelineCard: {
      backgroundColor: palette.surface, borderRadius: 28, padding: 12,
    },
    timelineItem: { flexDirection: 'row', alignItems: 'center', padding: 12 },
    timelineTime: { width: 70, fontSize: 12, fontWeight: '800', color: palette.textSoft },
    timelineLeft: { alignItems: 'center', width: 40 },
    timelineDot: { width: 36, height: 36, borderRadius: 14, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
    timelineConnector: { position: 'absolute', top: 40, width: 2, bottom: -40, backgroundColor: palette.stroke },
    timelineContent: { flex: 1, marginLeft: 12 },
    timelineTitle: { fontSize: 15, fontWeight: '800', color: palette.text },
    timelineSub: { fontSize: 12, color: palette.textSoft, marginTop: 2 },
    timelineAdd: { width: 32, height: 32, borderRadius: 10, backgroundColor: palette.surfaceSoft, alignItems: 'center', justifyContent: 'center' },
    emptyText: { color: palette.textSoft, fontSize: 13, fontWeight: '700', padding: 16, textAlign: 'center' },

    // Modals
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    goalModal: {
      width: '86%', maxWidth: 360,
      padding: 22, borderRadius: 24,
      alignItems: 'center', alignSelf: 'center',
      backgroundColor: '#111827',
      borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.22)',
      shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 18, elevation: 12,
    },
    modalTitle: { fontSize: 22, fontWeight: '900', marginBottom: 8 },
    modalSub: { fontSize: 13, fontWeight: '600', marginBottom: 20 },
    inputBox: { 
      flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%',
      paddingHorizontal: 18, paddingVertical: 14, borderRadius: 18, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.02)',
      marginBottom: 22,
    },
    inputText: { flex: 1, fontSize: 34, fontWeight: '900', padding: 0, textAlign: 'center' },
    modalBtns: { flexDirection: 'row', gap: 12, width: '100%', alignItems: 'center' },
    modalCancel: { flex: 1, height: 52, alignItems: 'center', justifyContent: 'center' },
    modalCancelText: { fontSize: 15, fontWeight: '800' },
    modalSave: { flex: 1.6, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    modalSaveText: { color: '#fff', fontSize: 16, fontWeight: '900' },
    bottomSpacer: { height: 40 },
  });
}

export function createHydrationAddModalStyles(palette: ScreenPalette, width: number, height: number) {
  return StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(2, 6, 23, 0.9)', justifyContent: 'center', padding: 12 },
    sheet: {
      borderRadius: 32,
      backgroundColor: '#0f172a',
      borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.12)',
      paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,
      width: '100%', maxWidth: 420, alignSelf: 'center',
      shadowColor: '#000', shadowOpacity: 0.6, shadowRadius: 30, elevation: 20,
    },
    handle: { display: 'none' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    title: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
    closeBtn: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: 'rgba(255,255,255,0.06)',
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    },
    typeScroll: { marginBottom: 14 },
    typeScrollContent: { paddingRight: 12, alignItems: 'center' },
    typeItem: {
      alignItems: 'center', marginRight: 10, width: 62,
    },
    typeIconShell: {
      width: 46, height: 46, borderRadius: 16,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 1.5, backgroundColor: 'rgba(255,255,255,0.03)',
    },
    typeIconShellActive: { 
      borderWidth: 2,
      backgroundColor: 'rgba(255,255,255,0.08)',
    },
    typeImageIcon: { width: 28, height: 28 },
    typeLabel: { fontSize: 10, fontWeight: '800', marginTop: 6 },
    
    visualContainer: { marginBottom: 12 },
    amountCard: {
      borderRadius: 24, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)',
      backgroundColor: 'rgba(255,255,255,0.02)',
      paddingTop: 16, paddingBottom: 10,
      overflow: 'hidden',
    },
    amountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 },
    glassFrame: { alignItems: 'center', justifyContent: 'center' },
    volumeBadge: { alignItems: 'center', minWidth: 90 },
    volumeVal: { fontSize: 40, fontWeight: '900', color: '#fff', letterSpacing: -1 },
    volumeUnit: { fontSize: 15, fontWeight: '800', color: palette.blue, marginTop: -6 },
    drinkName: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.35)', marginTop: 8, textTransform: 'uppercase' },
    
    rulerContainer: { height: 80, marginTop: 12, position: 'relative', overflow: 'hidden' },
    rulerContent: { paddingHorizontal: 200 }, // Fixed large padding for centering
    indicator: {
      position: 'absolute', left: '50%', marginLeft: -2, top: 0, width: 4, height: 42,
      zIndex: 10, borderRadius: 2,
      shadowOpacity: 0.8, shadowRadius: 10,
    },
    markingWrapper: { width: 10, alignItems: 'center' },
    mark: { width: 1.5, borderRadius: 1 },
    markText: { fontSize: 10, fontWeight: '900', marginTop: 38, position: 'absolute', width: 40, textAlign: 'center' },
    
    addBtn: {
      height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
      shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
    },
    addBtnText: { color: '#fff', fontSize: 17, fontWeight: '900', letterSpacing: 0.4 },
  });
}
