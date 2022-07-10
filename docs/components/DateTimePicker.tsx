import { DateTime, Duration } from "luxon";
import React, { useMemo } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getTimezoneIana, TimezoneIana } from "../utils/timezone";

export const DateTimePicker = ({
  date,
  minDate,
  setDate,
  timezone,
}: {
  date: string;
  minDate: string | null;
  setDate: (newDate: string) => void;
  timezone: TimezoneIana | undefined;
}) => {
  const myTimezone = useMemo(() => getTimezoneIana(), []);

  const offsetFromCurrentTz: number = useMemo(() => {
    const offset = DateTime.fromISO(date).setZone(timezone).offset;
    const myOffset = DateTime.fromISO(date).offset;
    return myOffset - offset;
  }, [date, timezone]);

  // We tell the ReactDatePicker that it is a different date than the date we actually have
  // We do this because the ReactDatePicker localizes the date to our current computer. But we don't
  // want that localization if we are looking at a time in another timezone.
  const dateWithOffset: Date = useMemo(() => {
    return DateTime.fromISO(date)
      .minus({ minutes: offsetFromCurrentTz })
      .toJSDate();
  }, [offsetFromCurrentTz, date]);

  return (
    <div className="time-pickers">
      <ReactDatePicker
        disabled={false}
        minDate={minDate ? new Date(minDate) : null}
        selected={dateWithOffset}
        selectsRange={false}
        onChange={(date) => {
          if (date instanceof Date) {
            // We adjust for the localization mentioned above.
            const startDate = DateTime.fromJSDate(date).plus({
              minutes: offsetFromCurrentTz,
            });

            setDate(startDate.toISO());
          }
        }}
        className="luma-input"
        wrapperClassName="date-picker-wrapper mr-2"
        dateFormat="MMMM d, yyyy"
      />
      <ReactDatePicker
        disabled={false}
        selected={dateWithOffset}
        onBlur={(e) => {
          const duration = parseTimeFromString(e.target.value);
          if (duration) {
            setDate(
              DateTime.fromISO(date)
                .startOf("day")
                .plus(duration)
                .plus({ minutes: offsetFromCurrentTz })
                .toISO()
            );
          }
        }}
        onChange={(newDate) => {
          // There is a bug that causes the date to get reset sometimes
          // So we manually preserve the date and just add on the time
          if (newDate && newDate instanceof Date) {
            // The new date we get is in our current timezone so when we get the minute offset,
            // we do it in the current timezone.
            const startAtDt = DateTime.fromJSDate(newDate, {
              zone: myTimezone!,
            }).startOf("day");

            const minutesIntoDay = Math.floor(
              DateTime.fromJSDate(newDate, {
                zone: myTimezone!,
              }).diff(startAtDt, "minutes").minutes
            );

            const currentTimezone = timezone || myTimezone!;
            const currentDt = DateTime.fromISO(date, { zone: currentTimezone });
            const newDt = DateTime.fromObject(
              {
                year: currentDt.year,
                month: currentDt.month,
                day: currentDt.day,
                hour: Math.floor(minutesIntoDay / 60),
                minute: minutesIntoDay % 60,
              },
              { zone: currentTimezone }
            );

            setDate(newDt.toISO());
          }
        }}
        showTimeSelect
        showTimeSelectOnly
        className="luma-input time-input"
        wrapperClassName="time-picker-wrapper"
        dateFormat="h:mm aa"
      />
    </div>
  );
};
/**
 * The user can enter a string for the time of day.
 *
 * Examples:
 * - 10am
 * - 10
 * - 10:30 a
 * - 10 30 pm
 * - 19
 * - 2am
 * - 12am
 * - 12a
 *
 * We return a Duration that corresponds to the time from midnight
 */
export const parseTimeFromString = (userTime: string): Duration | null => {
  try {
    const match = userTime.match(
      /(?<hours>\d+)[:.\- ]?(?<minutes>\d*)\s*(?<meridian>[A-Za-z]+)?/
    );

    if (!match) {
      return null;
    }

    const {
      hours: hoursStr,
      minutes: minutesStr,
      meridian: meridianStr,
    } = match.groups!;

    let numHours = parseInt(hoursStr) || 0;
    const numMinutes = parseInt(minutesStr) || 0;

    if (meridianStr?.toLowerCase().includes("p") && numHours !== 12) {
      numHours = numHours + 12;
    } else if (!meridianStr && numHours < 7) {
      // We assume 6 means 6pm
      numHours += 12;
    } else if (numHours === 12 && meridianStr?.toLowerCase().includes("a")) {
      numHours = 0;
    }

    if (numHours >= 24 || numMinutes >= 60) {
      return null;
    }

    return Duration.fromObject({
      hours: numHours,
      minutes: numMinutes,
    });
  } catch (error) {
    return null;
  }
};

/**
 * Generate an ISO string of the closest future moment in time
 * that has number of minutes equal to a multiple of intervalMin.
 *
 * @param intervalMin Interval to snap minutes to
 * @param startTime Start time
 */
export function roundedTime({
  intervalMin,
  startTime,
  roundMode = "up",
}: {
  intervalMin: number;
  startTime?: DateLike;
  roundMode?: "up" | "down";
}): string {
  const startDt = startTime ? convertToDt(startTime) : DateTime.now();

  let rounded: number;
  if (roundMode === "down") {
    rounded = Math.floor(startDt.minute / intervalMin) * intervalMin;
  } else {
    rounded = Math.ceil(startDt.minute / intervalMin) * intervalMin;
  }

  return startDt
    .set({ minute: rounded, second: 0, millisecond: 0 })
    .toUTC()
    .toISO();
}

export type DateLike = DateTime | string | Date;

/**
 * Converts ISO string, JS Date, or DateTime to a DateTime.
 */
export const convertToDt = (val: DateLike): DateTime => {
  if (typeof val === "string") {
    const dt = DateTime.fromISO(val);
    if (!dt.isValid) {
      throw new Error(`Date "${val}" is not valid`);
    }
    return dt;
  }

  if (val instanceof DateTime) {
    return val;
  }

  const dt = DateTime.fromJSDate(val);
  if (!dt.isValid) {
    throw new Error(`Date "${val}" is not valid`);
  }
  return dt;
};
