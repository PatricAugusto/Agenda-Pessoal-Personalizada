import { CalendarDays, Clock3, Terminal } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const colors = {
  background: '#080D0A',
  surface: '#101812',
  surfaceRaised: '#142019',
  border: '#24352A',
  green: '#72F1A2',
  greenMuted: '#9BB9A4',
  text: '#F0F6F1',
  textMuted: '#829187',
};

const today = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
}).format(new Date());

export default function HomeScreen() {
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <View style={styles.brandIcon}>
              <Terminal color={colors.green} size={19} strokeWidth={2} />
            </View>
            <View>
              <Text style={styles.brandName}>NEXUS</Text>
              <Text style={styles.brandCaption}>PERSONAL OS</Text>
            </View>
          </View>
          <View style={styles.status}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>LOCAL</Text>
          </View>
        </View>

        <View style={styles.intro}>
          <Text style={styles.date}>{today.toUpperCase()}</Text>
          <Text style={styles.title}>
            Seu tempo,{'\n'}
            <Text style={styles.titleAccent}>sob seu controle.</Text>
          </Text>
          <Text style={styles.subtitle}>
            Um espaço pessoal para organizar o que importa.
          </Text>
        </View>

        <View style={styles.setupCard}>
          <View style={styles.cardTopline}>
            <Text style={styles.cardEyebrow}>SISTEMA INICIALIZADO</Text>
            <View style={styles.readyBadge}>
              <Text style={styles.readyText}>READY</Text>
            </View>
          </View>
          <Text style={styles.cardTitle}>Sua rotina começa aqui.</Text>
          <Text style={styles.cardDescription}>
            Agenda, hábitos e metas — do seu jeito, em um só lugar.
          </Text>
          <View style={styles.cardDivider} />
          <View style={styles.cardFooter}>
            <Text style={styles.cardFooterText}>AGENDA · HÁBITOS · METAS</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>SEU DIA</Text>
            <Text style={styles.sectionTitle}>Agenda</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>00</Text>
          </View>
        </View>

        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <CalendarDays color={colors.greenMuted} size={21} strokeWidth={1.7} />
          </View>
          <Text style={styles.emptyTitle}>Tudo tranquilo por enquanto</Text>
          <Text style={styles.emptyDescription}>
            Seus compromissos vão aparecer aqui.
          </Text>
        </View>

        <View style={styles.footer}>
          <Clock3 color={colors.textMuted} size={14} />
          <Text style={styles.footerText}>UM DIA DE CADA VEZ</Text>
          <View style={styles.footerLine} />
          <Text style={styles.footerVersion}>v0.1.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIcon: {
    width: 38,
    height: 38,
    marginRight: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  brandName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
  },
  brandCaption: {
    marginTop: 3,
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.4,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  statusDot: {
    width: 6,
    height: 6,
    marginRight: 7,
    borderRadius: 3,
    backgroundColor: colors.green,
  },
  statusText: {
    color: colors.greenMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  intro: {
    marginTop: 46,
    marginBottom: 28,
  },
  date: {
    marginBottom: 14,
    color: colors.green,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 41,
    letterSpacing: -1,
  },
  titleAccent: {
    color: colors.green,
  },
  subtitle: {
    marginTop: 12,
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  setupCard: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardTopline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardEyebrow: {
    color: colors.greenMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.3,
  },
  readyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#1C3324',
  },
  readyText: {
    color: colors.green,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  cardTitle: {
    marginTop: 19,
    color: colors.text,
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  cardDescription: {
    marginTop: 7,
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  cardDivider: {
    height: 1,
    marginTop: 18,
    marginBottom: 13,
    backgroundColor: colors.border,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardFooterText: {
    color: colors.green,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 34,
    marginBottom: 14,
  },
  sectionEyebrow: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  sectionTitle: {
    marginTop: 5,
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  countBadge: {
    minWidth: 34,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.surfaceRaised,
  },
  countText: {
    color: colors.greenMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  emptyCard: {
    minHeight: 146,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  emptyIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: colors.surfaceRaised,
  },
  emptyTitle: {
    marginTop: 12,
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyDescription: {
    marginTop: 5,
    color: colors.textMuted,
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
  },
  footerText: {
    marginLeft: 7,
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.9,
  },
  footerLine: {
    flex: 1,
    height: 1,
    marginHorizontal: 10,
    backgroundColor: colors.border,
  },
  footerVersion: {
    color: colors.textMuted,
    fontSize: 9,
  },
});
