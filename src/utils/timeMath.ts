/**
 * Time manipulation and formatting utilities
 */

/**
 * Converts "HH:MM" (24h) to total minutes from midnight (0 to 1439).
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

/**
 * Converts total minutes from midnight back to "HH:MM" 24h string.
 */
export function minutesToTime(totalMinutes: number): string {
  const normalized = Math.max(0, Math.min(1439, Math.floor(totalMinutes)));
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Formats "HH:MM" (or total minutes) into a human-readable 12-hour format e.g. "9:30 AM".
 */
export function formatTime12h(timeOrMinutes: string | number): string {
  const totalMins = typeof timeOrMinutes === 'string' ? timeToMinutes(timeOrMinutes) : timeOrMinutes;
  const normalized = Math.max(0, Math.min(1439, Math.floor(totalMins)));
  const hours24 = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const minsPadded = String(minutes).padStart(2, '0');
  
  return `${hours12}:${minsPadded} ${period}`;
}

/**
 * Formats duration in minutes to human text e.g. "1h 30m" or "45m".
 */
export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '0m';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
}

/**
 * Gets the current system time in "HH:MM" 24h format.
 */
export function getCurrentTimeFormatted(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

/**
 * Calculates current time in minutes from midnight.
 */
export function getCurrentTimeMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * Checks if two time intervals overlap.
 */
export function doIntervalsOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number
): boolean {
  return Math.max(startA, startB) < Math.min(endA, endB);
}
