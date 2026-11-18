import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.background,
  },
  glow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.greenGlow,
  },
  topGlow: {
    top: -150,
    right: -120,
  },
  bottomGlow: {
    bottom: 100,
    left: -190,
    opacity: 0.65,
  },
  surface: {
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 18,
    backgroundColor: colors.surface,
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 18,
    right: 18,
    height: 1,
    backgroundColor: colors.glassHighlight,
  },
});
