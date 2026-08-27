/**
 * Converts a 24-hour "HH:MM" time string (the format the backend
 * always sends) into either 24-hour or 12-hour display, based on
 * the user's Settings preference.
 *
 * formatTime("09:00", "24") -> "09:00"
 * formatTime("09:00", "12") -> "9:00 AM"
 * formatTime("18:30", "12") -> "6:30 PM"
 */

export function formatTime(time24, timeFormat) {

  if (timeFormat !== "12") {
    return time24;
  }

  const [hoursStr, minutesStr] = time24.split(":");

  let hours = Number(hoursStr);
  const minutes = minutesStr;

  const period = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;

  if (hours === 0) {
    hours = 12;
  }

  return `${hours}:${minutes} ${period}`;

}