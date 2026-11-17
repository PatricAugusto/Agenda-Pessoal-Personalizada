import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import {
  getAppointments,
  insertAppointment,
  type Appointment,
  type NewAppointment,
} from '../lib/appointments';

interface AppointmentsContextValue {
  appointments: Appointment[];
  isLoading: boolean;
  loadError: string | null;
  addAppointment: (input: NewAppointment) => Promise<void>;
  reloadAppointments: () => void;
}

const AppointmentsContext = createContext<AppointmentsContextValue | null>(null);

export function AppointmentsProvider({ children }: PropsWithChildren) {
  const db = useSQLiteContext();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    getAppointments(db)
      .then((items) => {
        if (isActive) {
          setAppointments(items);
          setLoadError(null);
        }
      })
      .catch((error: unknown) => {
        console.error('Não foi possível carregar os compromissos.', error);
        if (isActive) {
          setLoadError('Não foi possível carregar os compromissos salvos.');
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [db, reloadKey]);

  const addAppointment = useCallback(
    async (input: NewAppointment) => {
      if (isLoading) {
        throw new Error('A agenda ainda está carregando.');
      }

      const appointment = await insertAppointment(db, input);
      setAppointments((current) =>
        [...current, appointment].sort(
          (first, second) =>
            first.date.localeCompare(second.date) ||
            first.time.localeCompare(second.time),
        ),
      );
    },
    [db, isLoading],
  );

  const reloadAppointments = useCallback(() => {
    setIsLoading(true);
    setLoadError(null);
    setReloadKey((current) => current + 1);
  }, []);

  return (
    <AppointmentsContext.Provider
      value={{
        appointments,
        isLoading,
        loadError,
        addAppointment,
        reloadAppointments,
      }}
    >
      {children}
    </AppointmentsContext.Provider>
  );
}

export function useAppointments() {
  const context = useContext(AppointmentsContext);
  if (!context) {
    throw new Error('useAppointments precisa estar dentro de AppointmentsProvider.');
  }

  return context;
}
