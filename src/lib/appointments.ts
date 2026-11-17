import type { SQLiteDatabase } from 'expo-sqlite';

export interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  notes: string | null;
}

export interface NewAppointment {
  title: string;
  date: string;
  time: string;
  notes: string | null;
}

const databaseVersion = 1;

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
        notes TEXT
      );
      CREATE INDEX IF NOT EXISTS appointments_date_time_idx
        ON appointments (date, time);
    `);
    currentVersion = 1;
  }

  await db.execAsync(`PRAGMA user_version = ${currentVersion}`);
}

export async function getAppointments(db: SQLiteDatabase) {
  return db.getAllAsync<Appointment>(
    'SELECT id, title, date, time, notes FROM appointments ORDER BY date, time',
  );
}

export async function insertAppointment(
  db: SQLiteDatabase,
  input: NewAppointment,
) {
  const appointment: Appointment = {
    ...input,
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
  };

  await db.runAsync(
    `INSERT INTO appointments (id, title, date, time, notes)
     VALUES (?, ?, ?, ?, ?)`,
    appointment.id,
    appointment.title,
    appointment.date,
    appointment.time,
    appointment.notes,
  );

  return appointment;
}
