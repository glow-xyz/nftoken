/**
 * Transforms the `date` to a string accepted by `<input type="datetime-local" >`.
 */
export function toDateTimeLocal(date: Date) {
  const htmlDate = new Date(date);

  // Adjust the date to incorporate the timezone offset.
  htmlDate.setMinutes(htmlDate.getMinutes() - htmlDate.getTimezoneOffset());

  // We don't care about seconds and milliseconds.
  htmlDate.setSeconds(0);
  htmlDate.setMilliseconds(0);

  // Remove the trailing "Z" from the ISO string.
  return htmlDate.toISOString().replace("Z", "");
}
