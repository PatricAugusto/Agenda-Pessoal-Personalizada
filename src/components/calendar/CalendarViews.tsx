import { Pressable, Text, View } from 'react-native';
import { styles } from '../../styles/calendar.styles';
import { GlassSurface } from '../GlassSurface';
import {
  addDays,
  calendarDateKey,
  capitalize,
  monthDates,
  startOfWeek,
  weekdayLabel,
  weekdayLabels,
} from './calendarUtils';

interface CalendarGridProps {
  selectedDate: Date;
  todayKey: string;
  appointmentsByDate: ReadonlyMap<string, number>;
  onSelectDate: (date: Date) => void;
}

export function MonthCalendar({
  selectedDate,
  todayKey,
  appointmentsByDate,
  onSelectDate,
}: CalendarGridProps) {
  const dates = monthDates(selectedDate);
  const weeks = Array.from({ length: 6 }, (_, index) =>
    dates.slice(index * 7, index * 7 + 7),
  );

  return (
    <GlassSurface style={styles.calendarCard}>
      <View style={styles.weekdayRow}>
        {weekdayLabels.map((label) => (
          <View key={label} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{label}</Text>
          </View>
        ))}
      </View>
      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.dateRow}>
          {week.map((date) => {
            const dateKey = calendarDateKey(date);
            const isSelected = dateKey === calendarDateKey(selectedDate);
            const isToday = dateKey === todayKey;
            const appointmentCount = appointmentsByDate.get(dateKey) ?? 0;
            const isCurrentMonth = date.getMonth() === selectedDate.getMonth();

            return (
              <Pressable
                key={dateKey}
                accessibilityRole="button"
                accessibilityLabel={new Intl.DateTimeFormat('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                }).format(date)}
                accessibilityState={{ selected: isSelected }}
                onPress={() => onSelectDate(date)}
                style={({ pressed }) => [
                  styles.monthDateCell,
                  isSelected && styles.selectedDateCell,
                  isToday && !isSelected && styles.todayDateCell,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.monthDateText,
                    !isCurrentMonth && styles.outsideMonthText,
                    isToday && !isSelected && styles.todayDateText,
                    isSelected && styles.selectedDateText,
                  ]}
                >
                  {date.getDate()}
                </Text>
                <View style={styles.indicatorRow}>
                  {appointmentCount > 0
                    ? Array.from(
                        { length: Math.min(appointmentCount, 3) },
                        (_, index) => (
                          <View
                            key={index}
                            style={[
                              styles.dateIndicator,
                              styles.appointmentIndicator,
                              isSelected && styles.selectedIndicator,
                            ]}
                          />
                        ),
                      )
                    : (
                        <View
                          style={[
                            styles.dateIndicator,
                            isToday && !isSelected && styles.todayIndicator,
                            isSelected && styles.selectedIndicator,
                          ]}
                        />
                      )}
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </GlassSurface>
  );
}

export function WeekCalendar({
  selectedDate,
  todayKey,
  appointmentsByDate,
  onSelectDate,
}: CalendarGridProps) {
  const firstDay = startOfWeek(selectedDate);
  const dates = Array.from({ length: 7 }, (_, index) => addDays(firstDay, index));

  return (
    <GlassSurface style={styles.weekCard}>
      {dates.map((date) => {
        const dateKey = calendarDateKey(date);
        const isSelected = dateKey === calendarDateKey(selectedDate);
        const isToday = dateKey === todayKey;
        const appointmentCount = appointmentsByDate.get(dateKey) ?? 0;

        return (
          <Pressable
            key={dateKey}
            accessibilityRole="button"
            accessibilityLabel={new Intl.DateTimeFormat('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            }).format(date)}
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelectDate(date)}
            style={({ pressed }) => [
              styles.weekDateCell,
              isSelected && styles.selectedWeekDateCell,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.weekdayText,
                styles.weekDateLabel,
                isSelected && styles.selectedWeekDateLabel,
              ]}
            >
              {weekdayLabel(date)}
            </Text>
            <Text
              style={[
                styles.weekDateNumber,
                isToday && !isSelected && styles.todayDateText,
                isSelected && styles.selectedDateText,
              ]}
            >
              {date.getDate()}
            </Text>
            <View style={styles.weekIndicatorRow}>
              {appointmentCount > 0
                ? Array.from(
                    { length: Math.min(appointmentCount, 3) },
                    (_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.weekIndicator,
                          styles.appointmentIndicator,
                          isSelected && styles.selectedIndicator,
                        ]}
                      />
                    ),
                  )
                : (
                    <View
                      style={[
                        styles.weekIndicator,
                        isToday && !isSelected && styles.todayIndicator,
                        isSelected && styles.selectedIndicator,
                      ]}
                    />
                  )}
            </View>
          </Pressable>
        );
      })}
    </GlassSurface>
  );
}

export function SelectedDateCard({ date, todayKey }: { date: Date; todayKey: string }) {
  return (
    <GlassSurface style={styles.dayFocusCard}>
      <View style={styles.dayNumberCard}>
        <Text style={styles.dayNumber}>
          {new Intl.DateTimeFormat('pt-BR', { day: '2-digit' }).format(date)}
        </Text>
      </View>
      <View style={styles.dayFocusText}>
        <Text style={styles.dayWeekday}>{weekdayLabel(date)}</Text>
        <Text style={styles.dayMonth}>
          {capitalize(
            new Intl.DateTimeFormat('pt-BR', {
              month: 'long',
              year: 'numeric',
            }).format(date),
          )}
        </Text>
      </View>
      {calendarDateKey(date) === todayKey ? (
        <View style={styles.todayTag}>
          <Text style={styles.todayTagText}>HOJE</Text>
        </View>
      ) : null}
    </GlassSurface>
  );
}
