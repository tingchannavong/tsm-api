import { convertDateTimeTo24HrTime } from "../../../tsm-frontend/src/utils/time.js";

export function sanitizeFilters(payload) {
  const filters = Object.entries(payload).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      acc[key] = value;
    }
    return acc;
  }, {});
  return filters;
}

export const sanitizeData = (data, allowedFields) => {
  // .entries make into entries [ [name: Ting] , etc. ]
  const filteredAllowedEntries = Object.entries(data).filter(
    ([key, value]) => allowedFields.includes(key) && value !== undefined,
  );

  // make into object
  const sanitizedDataObject = Object.fromEntries(filteredAllowedEntries);
  return sanitizedDataObject;
};

export function cleanSessionsToGroups(data) {
  const grouped = Object.values(
    data.reduce((acc, cur) => {
      if (!acc[cur.groupId]) {
        acc[cur.groupId] = {
          groupId: cur.groupId,
          items: [],
        };
      }

      acc[cur.groupId].items.push(cur);
      return acc;
    }, {}),
  );
  return grouped;
}

export function accumulateSameStartTimes(sessions) {
  const sameStartTimes = Object.values(
    sessions.reduce((acc, cur) => {
      const startTime = convertDateTimeTo24HrTime(cur.startTime);
      if (!acc[startTime]) {
        acc[startTime] = {
          startTime: startTime,
          items: [],
        };
      }
      acc[startTime].items.push(cur);
      return acc;
    }, {}),
  );
  return sameStartTimes;
}

// {16:39: {startTime: 16:39, items: [Object, obj]}, }
