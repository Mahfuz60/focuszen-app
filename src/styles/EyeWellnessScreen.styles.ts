import { StyleSheet } from 'react-native';
import { spacing } from '../theme/tokens';
import { ScreenPalette } from '../theme/screenPalettes';

export function createEyeWellnessStyles(palette: ScreenPalette) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: palette.background },
    scroll: { flex: 1 },
    content: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 60 },
    
    // Header
    header: { 
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
      paddingVertical: 12 
    },
    title: { fontSize: 32, fontWeight: '900', color: palette.text },
    subtitle: { fontSize: 16, fontWeight: '600', color: palette.textMuted, marginTop: 4 },
    subtitleAccent: { color: palette.accentGreen },

    // Hero Timer Area
    heroArea: { alignItems: 'center', marginBottom: 16, position: 'relative' },
    timerRing: { width: 280, height: 280, alignItems: 'center', justifyContent: 'center' },
    timerContent: { position: 'absolute', alignItems: 'center', top: 60 },
    timerLabel: { fontSize: 14, fontWeight: '800', color: palette.textMuted, marginBottom: 4 },
    timerValue: { fontSize: 48, fontWeight: '900', color: palette.text },
    timerUnit: { fontSize: 14, fontWeight: '700', color: palette.textDim, marginTop: -4 },
    eyeIconContainer: { marginTop: 20 },
    
    startBtnWrap: { marginTop: -40, alignItems: 'center', zIndex: 10 },
    startBtn: { 
      width: 100, height: 100, borderRadius: 50, backgroundColor: palette.accentGreen,
      alignItems: 'center', justifyContent: 'center',
      shadowColor: palette.accentGreen, shadowOpacity: 0.6, shadowRadius: 20, elevation: 12,
    },
    startBtnText: { fontSize: 14, fontWeight: '900', color: '#000', marginTop: 4 },
    annotationText: { 
      fontSize: 12, color: palette.textDim, fontStyle: 'italic', marginTop: 12,
      textAlign: 'center', opacity: 0.8,
    },

    // Stats Bar
    statsBar: { 
      flexDirection: 'row', backgroundColor: palette.surface, borderRadius: 24,
      padding: 20, justifyContent: 'space-between',
    },
    statItem: { alignItems: 'center', flex: 1 },
    statIcon: { marginBottom: 8 },
    statVal: { fontSize: 20, fontWeight: '900', color: palette.text },
    statLab: { fontSize: 11, fontWeight: '700', color: palette.textDim, marginTop: 2 },

    // Section Headers
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 14 },
    sectionTitle: { fontSize: 20, fontWeight: '900', color: palette.text },
    viewAll: { fontSize: 14, fontWeight: '600', color: palette.textDim },


    // List Items
    listCard: {
      backgroundColor: palette.surface, borderRadius: 24, padding: 4, marginBottom: 30,
    },
    listItem: { 
      flexDirection: 'row', alignItems: 'center', padding: 16,
      borderBottomWidth: 1, borderBottomColor: palette.stroke,
    },
    listItemNoBorder: { borderBottomWidth: 0 },
    listIconWrap: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    listContent: { flex: 1 },
    listTitle: { fontSize: 16, fontWeight: '800', color: palette.text },
    listSub: { fontSize: 12, color: palette.textDim, marginTop: 2 },
    listBadge: { 
      backgroundColor: palette.surfaceLight, paddingHorizontal: 12, paddingVertical: 6,
      borderRadius: 12, marginRight: 12,
    },
    listBadgeText: { fontSize: 12, fontWeight: '800', color: palette.textMuted },

    // Recent Activity
    activityCard: {
       backgroundColor: palette.surface, borderRadius: 24, padding: 4,
    },
    activityItem: {
      flexDirection: 'row', alignItems: 'center', padding: 16,
      borderBottomWidth: 1, borderBottomColor: palette.stroke,
    },
    activityStatus: { marginLeft: 12 },
    
    // Timer Overlay (Modal-like)
    timerOverlay: {
      ...StyleSheet.absoluteFillObject, backgroundColor: palette.background,
      alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    },
    timerBigRing: { width: 300, height: 300, alignItems: 'center', justifyContent: 'center' },
    timerBigVal: { fontSize: 84, fontWeight: '900', color: palette.text },
    timerInstruction: { fontSize: 24, fontWeight: '800', color: palette.text, marginTop: 40, textAlign: 'center' },
    timerDesc: { fontSize: 16, color: palette.textMuted, marginTop: 12, textAlign: 'center', paddingHorizontal: 40 },
    closeBtn: { 
      marginTop: 60, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 20,
      backgroundColor: 'rgba(239, 68, 68, 0.12)', borderWidth: 1.5, borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    closeBtnText: { color: '#ef4444', fontWeight: '800', fontSize: 16, letterSpacing: 0.5 },

    // Modal Styles
    modalOverlay: {
      flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: palette.background,
      borderTopLeftRadius: 32, borderTopRightRadius: 32,
      padding: 24, maxHeight: '85%',
      borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)',
    },
    modalHeader: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: 24,
    },
    modalTitle: { fontSize: 24, fontWeight: '900', color: palette.text },
    closeIconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  });
}
