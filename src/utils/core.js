  import { convertDateTimeTo24HrTime } from "../../../tsm-frontend/src/utils/time.js";

  export function createFiltersObject(payload) {
  const { groupId, locationId, status } = payload;

    // query = 
    // {   status: "sth",
    //     updatedById:  1,
    //     createdById: 2
    // }
  
  const filters = {};
  if (groupId) filters.groupId = groupId;
  if (locationId) filters.locationId = locationId;
  if (status) filters.status = status;
  }

  export function cleanSessionsToGroups(data) {
    
  const grouped = Object.values( 
    data.reduce((acc, cur) => {
    if (!acc[cur.groupId]) {
      acc[cur.groupId] = {
        groupId: cur.groupId,
        items: []
      };
    }

    acc[cur.groupId].items.push(cur);
    return acc;
  }, {}));
  return grouped;
}

export function accumulateSameStartTimes(sessions) {
  const sameStartTimes = Object.values( 
  sessions.reduce((acc, cur) => {
    const startTime = convertDateTimeTo24HrTime(cur.startTime)
    if (!acc[startTime]) {
      acc[startTime] = {
          startTime: startTime,
          items: []
      }
    }
    acc[startTime].items.push(cur);
    return acc;
  }, {}));
  return sameStartTimes;
}

// {16:39: {startTime: 16:39, items: [Object, obj]}, }

