import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  tab: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: colors.surface,
  },
  label: {
    marginLeft: 8,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  activeLabel: {
    color: colors.green,
  },
  pressed: {
    opacity: 0.76,
  },
});
