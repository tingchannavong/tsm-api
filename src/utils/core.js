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

