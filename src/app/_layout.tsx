import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initializeDatabase } from '../lib/appointments';
import { AppointmentsProvider } from '../providers/AppointmentsProvider';

const backgroundColor = '#080D0A';

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="nexus-agenda.db" onInit={initializeDatabase}>
      <SafeAreaProvider>
        <AppointmentsProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor },
            }}
          />
        </AppointmentsProvider>
      </SafeAreaProvider>
    </SQLiteProvider>
  );
}
