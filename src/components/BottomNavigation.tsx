import { CalendarDays, Timer } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../theme/colors';
import { styles } from '../styles/navigation.styles';

export type AppTab = 'calendar' | 'pomodoro';

export function BottomNavigation({ activeTab }: { activeTab: AppTab }) {
  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: activeTab === 'calendar' }}
        onPress={() => router.navigate('/')}
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
    </View>
  );
}
