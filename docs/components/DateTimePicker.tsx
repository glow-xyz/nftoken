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

      <style jsx global>{`
        .time-pickers {
          display: flex;
          align-items: center;
          max-width: 320px;
        }

        .date-picker-wrapper {
          min-width: 120px;
          max-width: 280px;
          flex: 1;
        }

        .time-picker-wrapper {
          flex: 1;
          text-align: center;
          min-width: 90px;
          max-width: 105px;
        }

        .react-datepicker-popper {
          z-index: 3;
          *:focus {
            outline: none;
          }

          .react-datepicker {
            color: var(--primary-color);
            border: 1px solid var(--divider-color);
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-sm);
            font-family: var(--font);
            background-color: var(--primary-bg-color);
          }

          .react-datepicker__current-month,
          .react-datepicker-time__header,
          .react-datepicker-year-header {
            color: var(--primary-color);
          }

          .react-datepicker__day--disabled,
          .react-datepicker__month-text--disabled,
          .react-datepicker__quarter-text--disabled {
            color: var(--tertiary-color);
          }

          .react-datepicker__navigation-icon {
            width: 0;
          }

          .react-datepicker__navigation-icon:before {
            border-color: var(--tertiary-color);
            margin-top: 4px;
            transition: var(--transition);
          }

          .react-datepicker__navigation:hover
            .react-datepicker__navigation-icon:before {
            border-color: var(--secondary-color);
          }

          .react-datepicker__navigation--previous {
            border-right-color: var(--tertiary-color);
          }

          .react-datepicker__current-month {
            transform: translateY(-3px);
          }

          .react-datepicker__day-name {
            color: var(--tertiary-color);
          }

          .react-datepicker__time {
            background-color: transparent;
          }

          .react-datepicker__day:hover,
          .react-datepicker__month-text:hover,
          .react-datepicker__quarter-text:hover,
          .react-datepicker__time-container
            .react-datepicker__time
            .react-datepicker__time-box
            ul.react-datepicker__time-list
            li.react-datepicker__time-list-item:hover {
            background-color: var(--pale-gray);
          }

          .react-datepicker__time-container
            .react-datepicker__time
            .react-datepicker__time-box
            ul.react-datepicker__time-list
            li.react-datepicker__time-list-item:hover {
            color: var(--primary-color);
          }

          .react-datepicker__time-container
            .react-datepicker__time
            .react-datepicker__time-box
            ul.react-datepicker__time-list
            li.react-datepicker__time-list-item--selected {
            &,
            &:hover {
              color: white;
              background-color: var(--brand-color);
            }
          }

          .react-datepicker__day--keyboard-selected,
          .react-datepicker__month-text--keyboard-selected,
          .react-datepicker__quarter-text--keyboard-selected,
          .react-datepicker__year-text--keyboard-selected {
            background-color: var(--brand-pale-bg-color);
          }

          &[data-placement^="top"] .react-datepicker__triangle::before,
          &[data-placement^="bottom"] .react-datepicker__triangle::before {
            border-top-color: var(--primary-bg-color);
            border-bottom-color: var(--primary-bg-color);
          }

          &[data-placement^="top"] .react-datepicker__triangle,
          &[data-placement^="top"] .react-datepicker__triangle::after {
            border-top-color: var(--primary-bg-color);
          }

          &[data-placement^="bottom"] .react-datepicker__triangle,
          &[data-placement^="bottom"] .react-datepicker__triangle:after {
            border-bottom-color: var(--secondary-bg-color);
          }

          .react-datepicker__header {
            background-color: var(--secondary-bg-color);
            border-bottom: 1px solid var(--divider-color);
          }

          .react-datepicker__day {
            color: var(--primary-color);
          }

          .react-datepicker__day--disabled {
            color: var(--tertiary-color);
          }

          .react-datepicker__day--selected,
          .react-datepicker__day--selected:hover {
            background-color: var(--brand-color);
            color: white;
          }
        }
      `}</style>
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
