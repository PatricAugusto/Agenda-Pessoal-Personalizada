import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    marginHorizontal: 14,
    marginBottom: 3,
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
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: 'rgba(114, 241, 162, 0.1)',
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
