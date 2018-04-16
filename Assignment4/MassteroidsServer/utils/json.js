module.exports.responseMiddleware = function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    return next();
}

module.exports.requestMiddleware = function(req, res, next) {
    if (!req.body)
        return res.statusCode(400).send("Bad request");
    else
        return next();
}
