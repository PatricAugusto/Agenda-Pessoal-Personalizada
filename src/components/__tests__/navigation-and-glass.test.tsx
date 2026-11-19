import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { Text } from 'react-native';
import { BottomNavigation } from '../BottomNavigation';
import { GlassCanvas, GlassSurface } from '../GlassSurface';

describe('BottomNavigation', () => {
  it('shows the tabs in the requested order and navigates to the selected route', async () => {
    await render(<BottomNavigation activeTab="home" />);

    const tabs = screen.getAllByRole('button');
    expect(tabs.map((tab) => tab.props.accessibilityLabel)).toEqual([
      'Calendário',
      'Pomodoro',
      'Visão geral',
    ]);
    expect(screen.getByText('Calendário')).toBeTruthy();
    expect(screen.getByText('Pomodoro')).toBeTruthy();
    expect(screen.getByText('Visão geral')).toBeTruthy();
    expect(tabs[0].props.accessibilityState.selected).toBe(false);
    expect(tabs[2].props.accessibilityState.selected).toBe(true);

    await fireEvent.press(screen.getByRole('button', { name: 'Calendário' }));
    expect(router.navigate).toHaveBeenCalledWith('/calendar');
  });
});

describe('Glass components', () => {
  it('renders canvas content and children inside a glass surface', async () => {
    await render(
      <GlassCanvas>
        <GlassSurface intensity={48}>
          <Text>Conteúdo de vidro</Text>
        </GlassSurface>
      </GlassCanvas>,
    );

    expect(screen.getByText('Conteúdo de vidro')).toBeTruthy();
  });
});
