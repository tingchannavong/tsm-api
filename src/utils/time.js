import createError from "http-errors";

export function getDurationMinutes(startTime, endTime) {
    const start = new Date(startTime);
  const end = new Date(endTime);

  return Math.max(
    0,
    Math.round((end - start) / 60000)
  );
}

export function convertDateTimeTo24HrTime(dateTime) {
  const dateObj = new Date(dateTime);

  const options = {
    hour: "numeric",
    minute: "numeric",
    hour12: false
  };

  const formattedTime = dateObj.toLocaleString(undefined, options);

  return formattedTime;
}

export function convertMinToHour(minutes) {
    const hours = minutes / 60;
    return hours.toFixed(2);
}

export function vaildateAndProvideEndTime(sessionsArray, endTime = null) {
  const  finalEnd = endTime ? new Date(endTime) : new Date();
  sessionsArray.forEach(session => {
      if (finalEnd < session.startTime) {
        throw createError(400, "End time cannot be earlier than start time.");
      }
    });
  return finalEnd;
}

export function createDateRangeFilter(dateField, start, end, filtersObject) {
  if (start && end) {
    if (start > end) throw createError(400, "End date cannot be before start date.")
    filtersObject[dateField] = {};
    if (start) {
      filtersObject[dateField].gte = start;
    }

    if (end) {
      end.setUTCHours(23, 59, 59, 999)
      filtersObject[dateField].lte = end;
    }
  }
  return filtersObject;
}