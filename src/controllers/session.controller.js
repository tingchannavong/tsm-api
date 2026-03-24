export async function createSessionController(req, res, next) {
    res.send('add session')
}

export async function getAllSessionsController(req, res, next) {
    res.send('get all sessions')
}

export async function getFilteredSessionsController(req, res, next) {
    res.send('get session by filter')
}

export async function getSessionController(req, res, next) {
    res.send('get session by id')
}

export async function updateSessionController(req, res, next) {
    res.send('update session by id')
}

export async function deleteSessionController(req, res, next) {
    res.send('delete session by id')
}

export async function updateGroupSessionController(req, res, next) {
    res.send('update by group')
}