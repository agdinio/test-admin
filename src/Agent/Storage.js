
export function getEventBySportType(sportType) {

  return new Promise((resolve, reject) => {

    let result = []

    Object.keys(localStorage).forEach(key => {
      const stored = localStorage[key]
      if (stored) {
        let item = JSON.parse(stored)
        if (!sportType) {
          if (item && item.keySportType) {
            result.push(item);
          }
        } else {
          if (item && item.keySportType) {
            if (item.keySportType.toLowerCase() === sportType.toLowerCase()) {
              result.push(item);
            }
          }
        }
      }
    })

    resolve(result)
  })
}

export function getSingleItem() {
  return new Promise(resolve => {
    const key = 'ncaa-basketball'
    const item = localStorage[key]
    if (item) {
      const sel = JSON.parse(item).events.filter(o => o.stage.match(new RegExp('live', 'gi')))[0]
      if (sel) {
        resolve(sel)
      }
    }

  })
}

export function saveEvent(req) {
  return new Promise((resolve, reject) => {
    const copy = {...req}
    const key = `${copy.eventType}-${copy.sportType.name}`;
    let item = localStorage.getItem(key);
    if (item) {
      item = JSON.parse(item)
      if (item.events) {
        item.events.push(copy)
      } else {
        item.events = []
        item.events.push(copy)
      }
      localStorage.setItem(key, JSON.stringify(item))
      resolve(copy)
    } else {
      let newItem = { keyEventType: copy.eventType, keySportType: copy.sportType.name, events: [] }
      newItem.events.push(copy)
      localStorage.setItem(key, JSON.stringify(newItem))
      resolve(copy)
    }
  })
}

export function updateEvent(req) {
  return new Promise(resolve => {
    const copy = JSON.parse(JSON.stringify(req))
    const key = `${copy.eventType}-${copy.sportType.name}`;
    let item = localStorage.getItem(key);
    if (item) {
      item = JSON.parse(item)
      if (item.events) {
        let idxEvent = item.events.findIndex(o => o.eventId === req.eventId)
        if (idxEvent > -1) {
          item.events[idxEvent] = copy
          localStorage.setItem(key, JSON.stringify(item))
          resolve(copy)
        }
      }
    }
  })
}

export function getEventByGameId(key, gameId) {

}
