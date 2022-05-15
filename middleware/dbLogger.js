const LogEntry = require('../models/logEntry')

const dbLogger = (req, res, next) => {
    const ip = req.ip
    const browserInfo = req.headers["user-agent"]
    const token = req.cookies.token

    new LogEntry({
        httpMethode: req.method,
        route: req.url,
        ipAddress: ip,
        browser: browserInfo,
        token: token,
    }).save()

    next()
}

module.exports = dbLogger