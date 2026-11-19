import * as mockReact from 'react';
import * as mockReactNative from 'react-native';

jest.mock('expo-blur', () => {
  const BlurTargetView = mockReact.forwardRef(
    (
      props: Record<string, unknown>,
      ref: mockReact.Ref<mockReact.ComponentRef<typeof mockReactNative.View>>,
    ) => mockReact.createElement(mockReactNative.View, { ...props, ref }),
  );
  BlurTargetView.displayName = 'BlurTargetView';

  return {
    BlurTargetView,
    BlurView: mockReactNative.View,
  };
});

jest.mock('lucide-react-native', () => {
  const createIcon = () => {
    const Icon = () => null;
    return Icon;
  };

  return new Proxy(
    { __esModule: true },
    {
      get(target, property: string | symbol) {
        if (property in target) {
          return target[property as keyof typeof target];
        }
        return createIcon();
      },
    },
  );
});

jest.mock('expo-router', () => ({
  router: {
    navigate: jest.fn(),
    push: jest.fn(),
  },
}));

jest.mock('../providers/AppointmentsProvider', () => ({
  useAppointments: jest.fn(),
}));

jest.mock('../providers/PomodoroProvider', () => ({
  usePomodoro: jest.fn(),
  breakDurationSeconds: 5 * 60,
  focusDurationSeconds: 25 * 60,
}));

beforeEach(() => {
  jest.clearAllMocks();
});
