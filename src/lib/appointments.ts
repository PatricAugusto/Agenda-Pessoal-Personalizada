import type { SQLiteDatabase } from 'expo-sqlite';

export interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  endTime: string | null;
  notes: string | null;
  isMeeting: boolean;
  outcomeStatus: AppointmentOutcome | null;
  executedMinutes: number | null;
}

export type AppointmentOutcome = 'completed' | 'partial' | 'undone';

export interface NewAppointment {
  title: string;
  date: string;
  time: string;
  endTime: string;
  notes: string | null;
  isMeeting: boolean;
}

export interface ProductivitySettings {
  maxDailyMinutes: number;
  maxMeetings: number;
}

const databaseVersion = 3;

export function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function parseDateKey(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export async function initializeDatabase(db: SQLiteDatabase) {
  const result = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version',
  );
  let currentVersion = result?.user_version ?? 0;

  if (currentVersion >= databaseVersion) {
    return;
  }

  if (currentVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        end_time TEXT,
        notes TEXT
      );
      CREATE INDEX IF NOT EXISTS appointments_date_time_idx
        ON appointments (date, time);
    `);
    currentVersion = 2;
  }

  if (currentVersion === 1) {
    await db.execAsync(`
      ALTER TABLE appointments ADD COLUMN end_time TEXT;
    `);
    currentVersion = 2;
  }

  if (currentVersion === 2) {
    await db.execAsync(`
      ALTER TABLE appointments ADD COLUMN is_meeting INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE appointments ADD COLUMN outcome_status TEXT
        CHECK (outcome_status IS NULL OR outcome_status IN ('completed', 'partial', 'undone'));
      ALTER TABLE appointments ADD COLUMN executed_minutes INTEGER;

      CREATE TABLE IF NOT EXISTS productivity_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        max_daily_minutes INTEGER NOT NULL,
        max_meetings INTEGER NOT NULL
      );
      INSERT OR IGNORE INTO productivity_settings (id, max_daily_minutes, max_meetings)
        VALUES (1, 360, 3);
    `);
    currentVersion = 3;
  }

  await db.execAsync(`PRAGMA user_version = ${currentVersion}`);
}

interface AppointmentRow extends Omit<Appointment, 'isMeeting'> {
  isMeeting: number;
}

export async function getAppointments(db: SQLiteDatabase) {
  const rows = await db.getAllAsync<AppointmentRow>(
    `SELECT id, title, date, time, end_time AS endTime, notes,
            is_meeting AS isMeeting, outcome_status AS outcomeStatus,
            executed_minutes AS executedMinutes
     FROM appointments ORDER BY date, time`,
  );

  return rows.map((row) => ({ ...row, isMeeting: row.isMeeting === 1 }));
}

export async function insertAppointment(
  db: SQLiteDatabase,
  input: NewAppointment,
) {
  const appointment: Appointment = {
    ...input,
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
    outcomeStatus: null,
    executedMinutes: null,
  };

  await db.runAsync(
    `INSERT INTO appointments
       (id, title, date, time, end_time, notes, is_meeting, outcome_status, executed_minutes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    appointment.id,
    appointment.title,
    appointment.date,
    appointment.time,
    appointment.endTime,
    appointment.notes,
    appointment.isMeeting ? 1 : 0,
    appointment.outcomeStatus,
    appointment.executedMinutes,
  );

  return appointment;
}

export async function updateAppointmentOutcome(
  db: SQLiteDatabase,
  appointmentId: string,
  outcomeStatus: AppointmentOutcome,
  executedMinutes: number,
) {
  if (!Number.isInteger(executedMinutes) || executedMinutes < 0) {
    throw new Error('O tempo executado precisa ser um número inteiro não negativo.');
  }
  if (outcomeStatus === 'undone' && executedMinutes !== 0) {
    throw new Error('Um compromisso desfeito não pode ter tempo executado.');
  }
  if (outcomeStatus !== 'undone' && executedMinutes === 0) {
    throw new Error('Um compromisso executado precisa ter tempo executado.');
  }

  const result = await db.runAsync(
    `UPDATE appointments
     SET outcome_status = ?, executed_minutes = ?
     WHERE id = ?`,
    outcomeStatus,
    executedMinutes,
    appointmentId,
  );
  if (result.changes === 0) {
    throw new Error('O compromisso não foi encontrado.');
  }
}

export async function getProductivitySettings(db: SQLiteDatabase) {
  const settings = await db.getFirstAsync<ProductivitySettings>(
    `SELECT max_daily_minutes AS maxDailyMinutes, max_meetings AS maxMeetings
     FROM productivity_settings
     WHERE id = 1`,
  );
  if (!settings) {
    throw new Error('As configurações de capacidade diária não foram encontradas.');
  }

  return settings;
}

export async function saveProductivitySettings(
  db: SQLiteDatabase,
  settings: ProductivitySettings,
) {
  if (
    !Number.isInteger(settings.maxDailyMinutes) ||
    settings.maxDailyMinutes <= 0 ||
    !Number.isInteger(settings.maxMeetings) ||
    settings.maxMeetings <= 0
  ) {
    throw new Error('Informe limites diários inteiros maiores que zero.');
  }

  const result = await db.runAsync(
    `UPDATE productivity_settings
     SET max_daily_minutes = ?, max_meetings = ?
     WHERE id = 1`,
    settings.maxDailyMinutes,
    settings.maxMeetings,
  );
  if (result.changes === 0) {
    throw new Error('As configurações de capacidade diária não foram encontradas.');
  }
}

export async function deleteAppointment(db: SQLiteDatabase, appointmentId: string) {
  await db.runAsync('DELETE FROM appointments WHERE id = ?', appointmentId);
}
