import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import { AppState } from 'react-native';

export const focusDurationSeconds = 25 * 60;
export const breakDurationSeconds = 5 * 60;

export interface FocusTarget {
  id: string;
  title: string;
}

interface PomodoroState {
  phase: 'focus' | 'break';
  remainingSeconds: number;
  isRunning: boolean;
  endAt: number | null;
  completedFocusSessions: number;
  target: FocusTarget | null;
  lastCompletedPhase: 'focus' | 'break' | null;
}

interface PomodoroContextValue extends PomodoroState {
  startFocus: (target: FocusTarget) => void;
  toggleTimer: () => void;
  resetTimer: () => void;
}

const initialState: PomodoroState = {
  phase: 'focus',
  remainingSeconds: focusDurationSeconds,
  isRunning: false,
  endAt: null,
  completedFocusSessions: 0,
  target: null,
  lastCompletedPhase: null,
};

const PomodoroContext = createContext<PomodoroContextValue | null>(null);

export function PomodoroProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState(initialState);

  const reconcileTimer = useCallback(() => {
    setState((current) => {
      if (!current.isRunning || current.endAt === null) {
        return current;
      }

      const remainingSeconds = Math.max(
        0,
        Math.ceil((current.endAt - Date.now()) / 1000),
      );

      if (remainingSeconds > 0) {
        return remainingSeconds === current.remainingSeconds
          ? current
          : { ...current, remainingSeconds };
      }

      if (current.phase === 'focus') {
        return {
          ...current,
          phase: 'break',
          remainingSeconds: breakDurationSeconds,
          isRunning: false,
          endAt: null,
          completedFocusSessions: current.completedFocusSessions + 1,
          lastCompletedPhase: 'focus',
        };
      }

      return {
        ...current,
        phase: 'focus',
        remainingSeconds: focusDurationSeconds,
        isRunning: false,
        endAt: null,
        lastCompletedPhase: 'break',
      };
    });
  }, []);

  useEffect(() => {
    if (!state.isRunning) {
      return;
    }

    const intervalId = setInterval(reconcileTimer, 1000);
    return () => clearInterval(intervalId);
  }, [reconcileTimer, state.isRunning]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        reconcileTimer();
      }
    });

    return () => subscription.remove();
  }, [reconcileTimer]);

  const startFocus = useCallback((target: FocusTarget) => {
    setState((current) => ({
      ...current,
      phase: 'focus',
      remainingSeconds: focusDurationSeconds,
      isRunning: true,
      endAt: Date.now() + focusDurationSeconds * 1000,
      target,
      lastCompletedPhase: null,
    }));
  }, []);

  const toggleTimer = useCallback(() => {
    setState((current) => {
      if (current.isRunning && current.endAt !== null) {
        return {
          ...current,
          remainingSeconds: Math.max(
            0,
            Math.ceil((current.endAt - Date.now()) / 1000),
          ),
          isRunning: false,
          endAt: null,
        };
      }

      return {
        ...current,
        isRunning: true,
        endAt: Date.now() + current.remainingSeconds * 1000,
        lastCompletedPhase: null,
      };
    });
  }, []);

  const resetTimer = useCallback(() => {
    setState((current) => ({
      ...current,
      remainingSeconds:
        current.phase === 'focus' ? focusDurationSeconds : breakDurationSeconds,
      isRunning: false,
      endAt: null,
      lastCompletedPhase: null,
    }));
  }, []);

  return (
    <PomodoroContext.Provider
      value={{
        ...state,
        startFocus,
        toggleTimer,
        resetTimer,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoro() {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error('usePomodoro precisa estar dentro de PomodoroProvider.');
  }

  return context;
}
