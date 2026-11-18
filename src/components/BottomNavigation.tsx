import { CalendarDays, House, Timer } from 'lucide-react-native';
import { Pressable, Text } from 'react-native';
import { router } from 'expo-router';
import { GlassSurface } from './GlassSurface';
import { colors } from '../theme/colors';
import { styles } from '../styles/navigation.styles';

export type AppTab = 'home' | 'calendar' | 'pomodoro';

export function BottomNavigation({ activeTab }: { activeTab: AppTab }) {
  return (
    <GlassSurface style={styles.container} intensity={55}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: activeTab === 'home' }}
        onPress={() => router.navigate('/')}
        style={({ pressed }) => [
          styles.tab,
          activeTab === 'home' && styles.activeTab,
          pressed && styles.pressed,
        ]}
      >
        <House
          color={activeTab === 'home' ? colors.green : colors.textMuted}
          size={18}
        />
        <Text style={[styles.label, activeTab === 'home' && styles.activeLabel]}>
          Início
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: activeTab === 'calendar' }}
        onPress={() => router.navigate('/calendar')}
        style={({ pressed }) => [
          styles.tab,
          activeTab === 'calendar' && styles.activeTab,
          pressed && styles.pressed,
        ]}
      >
        <CalendarDays
          color={activeTab === 'calendar' ? colors.green : colors.textMuted}
          size={18}
        />
        <Text
          style={[
            styles.label,
            activeTab === 'calendar' && styles.activeLabel,
          ]}
        >
          Calendário
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: activeTab === 'pomodoro' }}
        onPress={() => router.navigate('/pomodoro')}
        style={({ pressed }) => [
          styles.tab,
          activeTab === 'pomodoro' && styles.activeTab,
          pressed && styles.pressed,
        ]}
      >
        <Timer
          color={activeTab === 'pomodoro' ? colors.green : colors.textMuted}
          size={18}
        />
        <Text
          style={[
            styles.label,
            activeTab === 'pomodoro' && styles.activeLabel,
          ]}
        >
          Pomodoro
        </Text>
      </Pressable>
    </GlassSurface>
  );
}
