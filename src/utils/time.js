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

export function vaildateAndProvideEndTime(sessionsArray, endTime) {
  sessionsArray.forEach(session => {
   if (endTime) {
      const finalEnd = new Date(endTime);
  
      if (finalEnd < session.startTime) {
        throw createError(400, "End time cannot be earlier than start time");
      }
      return finalEnd;
    } else {
      const finalEndTime = new Date();
      return finalEndTime;
    }
  });
}