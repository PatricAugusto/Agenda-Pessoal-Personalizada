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
  deleteAppointment,
  getAppointments,
  getProductivitySettings,
  insertAppointment,
  saveProductivitySettings,
  updateAppointmentOutcome as persistAppointmentOutcome,
  type Appointment,
  type AppointmentOutcome,
  type NewAppointment,
  type ProductivitySettings,
} from '../lib/appointments';

interface AppointmentsContextValue {
  appointments: Appointment[];
  isLoading: boolean;
  loadError: string | null;
  addAppointment: (input: NewAppointment) => Promise<void>;
  deleteAppointment: (appointmentId: string) => Promise<void>;
  updateAppointmentOutcome: (
    appointmentId: string,
    status: AppointmentOutcome,
    executedMinutes: number,
  ) => Promise<void>;
  productivitySettings: ProductivitySettings | null;
  updateProductivitySettings: (settings: ProductivitySettings) => Promise<void>;
  reloadAppointments: () => void;
}

const AppointmentsContext = createContext<AppointmentsContextValue | null>(null);

export function AppointmentsProvider({ children }: PropsWithChildren) {
  const db = useSQLiteContext();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [productivitySettings, setProductivitySettings] =
    useState<ProductivitySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    Promise.all([getAppointments(db), getProductivitySettings(db)])
      .then(([items, settings]) => {
        if (isActive) {
          setAppointments(items);
          setProductivitySettings(settings);
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

  const removeAppointment = useCallback(
    async (appointmentId: string) => {
      await deleteAppointment(db, appointmentId);
      setAppointments((current) =>
        current.filter((appointment) => appointment.id !== appointmentId),
      );
    },
    [db],
  );

  const saveAppointmentOutcome = useCallback(
    async (
      appointmentId: string,
      status: AppointmentOutcome,
      executedMinutes: number,
    ) => {
      await persistAppointmentOutcome(db, appointmentId, status, executedMinutes);
      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, outcomeStatus: status, executedMinutes }
            : appointment,
        ),
      );
    },
    [db],
  );

  const updateSettings = useCallback(
    async (settings: ProductivitySettings) => {
      await saveProductivitySettings(db, settings);
      setProductivitySettings(settings);
    },
    [db],
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
        deleteAppointment: removeAppointment,
        updateAppointmentOutcome: saveAppointmentOutcome,
        productivitySettings,
        updateProductivitySettings: updateSettings,
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
