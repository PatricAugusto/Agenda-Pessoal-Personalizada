import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    flex: 1,
  },
  eyebrow: {
    marginBottom: 4,
    color: colors.green,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  screenTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  formCard: {
    padding: 18,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  fieldGroup: {
    flex: 1,
  },
  fieldLabel: {
    marginBottom: 9,
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  textInput: {
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    color: colors.text,
    fontSize: 13,
  },
  fieldDivider: {
    height: 1,
    marginVertical: 17,
    backgroundColor: colors.border,
  },
  fieldRow: {
    flexDirection: 'row',
  },
  halfField: {
    flex: 1,
    minWidth: 0,
  },
  pickerField: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  pickerFieldText: {
    flex: 1,
    marginLeft: 8,
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  notesInput: {
    minHeight: 96,
  },
  iosPickerCard: {
    marginTop: 16,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pickerDoneButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 9,
    backgroundColor: colors.surfaceRaised,
  },
  pickerDoneText: {
    color: colors.green,
    fontSize: 12,
    fontWeight: '700',
  },
  formError: {
    marginTop: 14,
    color: colors.error,
    fontSize: 12,
    lineHeight: 18,
  },
  saveButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    borderRadius: 12,
    backgroundColor: colors.green,
  },
  disabledButton: {
    opacity: 0.55,
  },
  saveButtonText: {
    marginLeft: 9,
    color: colors.background,
    fontSize: 13,
    fontWeight: '800',
  },
  localNote: {
    marginTop: 12,
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.76,
  },
});
