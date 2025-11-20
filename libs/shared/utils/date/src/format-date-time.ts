import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { values } from 'lodash';
import { DateTimeFormat } from './enums';

dayjs.extend(isSameOrAfter);

export function formatDateTime(
  rawDateTime: Dayjs | number | string,
  format: 'relative' | 'relative-time' | 'chat-relative-time' | DateTimeFormat,
): string {
  let dateTime: Dayjs;

  if (dayjs.isDayjs(rawDateTime)) {
    dateTime = rawDateTime;
  } else if (typeof rawDateTime === 'number') {
    // If the number is greater than 1e10, then it is milliseconds, otherwise it is seconds
    dateTime = rawDateTime > 1e10 ? dayjs(rawDateTime) : dayjs.unix(rawDateTime);
  } else {
    dateTime = dayjs(rawDateTime);
  }

  if ((values(DateTimeFormat) as Array<string>).includes(format)) {
    return dateTime.format(format);
  } else {
    const now = dayjs();

    switch (format) {
      case 'relative': {
        const startOfToday = now.startOf('day');
        const startOfYesterday = startOfToday.subtract(1, 'day');
        const startOf7DaysAgo = startOfToday.subtract(7, 'day');
        const startOf30DaysAgo = startOfToday.subtract(30, 'day');

        switch (true) {
          case dateTime.isSameOrAfter(startOfToday):
            return i18n.t('SHARED.DATES.TEXT_TODAY');

          case dateTime.isSameOrAfter(startOfYesterday):
            return i18n.t('SHARED.DATES.TEXT_YESTERDAY');

          case dateTime.isSameOrAfter(startOf7DaysAgo):
            return i18n.t('SHARED.DATES.TEXT_LAST_DAYS', { days: 7 });

          case dateTime.isSameOrAfter(startOf30DaysAgo):
            return i18n.t('SHARED.DATES.TEXT_LAST_DAYS', { days: 30 });

          default:
            return dateTime.format('MMMM');
        }
      }

      case 'relative-time': {
        const startOfToday = now.startOf('day');
        const startOfYesterday = startOfToday.subtract(1, 'day');
        const timeString = dateTime.format('h:mm A');

        switch (true) {
          case dateTime.isSameOrAfter(startOfToday):
            return `${i18n.t('SHARED.DATES.TEXT_TODAY_TIME', { time: timeString })}`;

          case dateTime.isSameOrAfter(startOfYesterday):
            return `${i18n.t('SHARED.DATES.TEXT_YESTERDAY_TIME', { time: timeString })}`;

          default:
            return dateTime.format(DateTimeFormat.DATE_RELATIVE);
        }
      }

      case 'chat-relative-time': {
        const startOfToday = now.startOf('day');
        const startOfYesterday = startOfToday.subtract(1, 'day');
        const timeString = dateTime.format('h:mm A');

        switch (true) {
          case dateTime.isSameOrAfter(startOfToday):
            return `${i18n.t('SHARED.DATES.TEXT_TODAY_TIME', { time: timeString })}`;

          case dateTime.isSameOrAfter(startOfYesterday):
            return `${i18n.t('SHARED.DATES.TEXT_YESTERDAY_TIME', { time: timeString })}`;

          default:
            return `${dateTime.format(DateTimeFormat.DATE_SLASH)} ${i18n.t('SHARED.DATES.TEXT_AT_TIME', { time: timeString })}`;
        }
      }
    }
  }

  return dateTime.format(DateTimeFormat.DATE_SLASH);
}
