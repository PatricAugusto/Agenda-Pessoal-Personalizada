import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ProductivityInsights } from '../../../lib/productivityMetrics';
import {
  AppointmentReviewList,
} from '../AppointmentReviewList';
import { AppointmentOutcomeModal } from '../AppointmentOutcomeModal';
import { CapacitySettingsCard } from '../CapacitySettingsCard';
import { DailyCapacityCard } from '../DailyCapacityCard';
import { DailyEfficiencyCard } from '../DailyEfficiencyCard';
import { WeeklyLoadCard } from '../WeeklyLoadCard';
import { makeAppointment } from '../../../test/fixtures';

const dailyMetrics = {
  plannedMinutes: 180,
  meetings: 2,
  executedMinutes: 90,
  deviationMinutes: -90,
  pendingReviewCount: 1,
  efficiencyPercent: 50,
};

describe('DailyEfficiencyCard', () => {
  it('shows the efficiency, executed time, and pending review count', async () => {
    await render(<DailyEfficiencyCard metrics={dailyMetrics} />);

    expect(screen.getByText('50%')).toBeTruthy();
    expect(screen.getByText(/1 h 30 min.*executados de.*3 h.*planejados/)).toBeTruthy();
    expect(screen.getByText(/1 compromisso aguarda fechamento/)).toBeTruthy();
  });
});

describe('DailyCapacityCard', () => {
  it('explains overload and recommends concrete reductions', async () => {
    await render(
      <DailyCapacityCard
        dailyMetrics={{ ...dailyMetrics, plannedMinutes: 420, meetings: 4 }}
        capacityMetrics={{
          capacityPercent: 140,
          excessMinutes: 60,
          excessMeetings: 1,
        }}
        productivitySettings={{ maxDailyMinutes: 360, maxMeetings: 3 }}
        isLoading={false}
      />,
    );

    expect(screen.getByText('140%')).toBeTruthy();
    expect(screen.getByText(/Sua capacidade está em 140%/)).toBeTruthy();
    expect(
      screen.getByText('Recomendação: reduzir 1 h da agenda e cortar 1 reunião.'),
    ).toBeTruthy();
  });

  it('distinguishes loading from missing limits', async () => {
    const { rerender } = await render(
      <DailyCapacityCard
        dailyMetrics={dailyMetrics}
        capacityMetrics={null}
        productivitySettings={null}
        isLoading
      />,
    );
    expect(screen.getByText('Carregando limites...')).toBeTruthy();

    await rerender(
      <DailyCapacityCard
        dailyMetrics={dailyMetrics}
        capacityMetrics={null}
        productivitySettings={null}
        isLoading={false}
      />,
    );
    expect(screen.getByText('Defina seus limites abaixo.')).toBeTruthy();
  });
});

describe('CapacitySettingsCard', () => {
  it('forwards field changes and save action', async () => {
    const onHoursChange = jest.fn();
    const onMeetingsChange = jest.fn();
    const onSave = jest.fn();
    await render(
      <CapacitySettingsCard
        hoursValue="6"
        meetingsValue="3"
        settingsError={null}
        settingsMessage={null}
        isLoading={false}
        isSaving={false}
        onHoursChange={onHoursChange}
        onMeetingsChange={onMeetingsChange}
        onSave={onSave}
      />,
    );

    await fireEvent.changeText(screen.getByLabelText('Limite de horas diárias'), '7');
    await fireEvent.changeText(
      screen.getByLabelText('Limite de reuniões diárias'),
      '4',
    );
    await fireEvent.press(screen.getByText('Salvar limites'));

    expect(onHoursChange).toHaveBeenCalledWith('7');
    expect(onMeetingsChange).toHaveBeenCalledWith('4');
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});

describe('WeeklyLoadCard', () => {
  it('shows the weekly load and productivity insights', async () => {
    const insights: ProductivityInsights = {
      averageEfficiencyPercent: 70,
      reviewedDays: 3,
      daysNearCapacity: 2,
    };
    await render(
      <WeeklyLoadCard
        plannedMinutes={600}
        capacityMinutes={2520}
        insights={insights}
      />,
    );

    expect(screen.getByText('10 h')).toBeTruthy();
    expect(screen.getByText(/Média executada em 3 dias revisados: 70%/)).toBeTruthy();
    expect(screen.getByText(/2 dias estiveram/)).toBeTruthy();
  });
});

describe('AppointmentReviewList', () => {
  it('renders an appointment and passes it to the review callback', async () => {
    const appointment = makeAppointment({ isMeeting: true });
    const onReview = jest.fn();
    await render(
      <AppointmentReviewList
        appointments={[appointment]}
        onReview={onReview}
      />,
    );

    expect(screen.getByText('Revisão de planejamento')).toBeTruthy();
    expect(screen.getByText('REUNIÃO')).toBeTruthy();
    await fireEvent.press(
      screen.getByRole('button', {
        name: 'Registrar execução de Revisão de planejamento',
      }),
    );
    expect(onReview).toHaveBeenCalledWith(appointment);
  });

  it('shows an empty state when there is nothing to review', async () => {
    await render(<AppointmentReviewList appointments={[]} onReview={jest.fn()} />);
    expect(screen.getByText('Tudo em dia')).toBeTruthy();
  });
});

describe('AppointmentOutcomeModal', () => {
  it('offers partial execution input and returns the selected outcome', async () => {
    const appointment = makeAppointment();
    const onSave = jest.fn();
    const onPartialMinutesChange = jest.fn();
    await render(
      <AppointmentOutcomeModal
        appointment={appointment}
        selectedOutcome="partial"
        partialMinutesInput="25"
        error={null}
        isSaving={false}
        onClose={jest.fn()}
        onSelectPartial={jest.fn()}
        onPartialMinutesChange={onPartialMinutesChange}
        onSave={onSave}
      />,
    );

    await fireEvent.changeText(
      screen.getByLabelText('Minutos executados'),
      '30',
    );
    await fireEvent.press(screen.getByText('Salvar execução parcial'));

    expect(screen.getByText('Como foi?')).toBeTruthy();
    expect(onPartialMinutesChange).toHaveBeenCalledWith('30');
    expect(onSave).toHaveBeenCalledWith('partial');
  });
});
