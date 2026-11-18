import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initializeDatabase } from '../lib/appointments';
import { AppointmentsProvider } from '../providers/AppointmentsProvider';
import { PomodoroProvider } from '../providers/PomodoroProvider';

const backgroundColor = '#080D0A';

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="nexus-agenda.db" onInit={initializeDatabase}>
      <SafeAreaProvider>
        <AppointmentsProvider>
          <PomodoroProvider>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor },
              }}
            />
          </PomodoroProvider>
        </AppointmentsProvider>
      </SafeAreaProvider>
    </SQLiteProvider>
  );
}
