module.exports.sendJSON = function(res, response) {
    return res.send(JSON.stringify(response));
}

module.exports.sendResponse = function(res, err, payload) {
    if (err)
        return res.send(JSON.stringify({ status: "fail", reason: err }));
    else
        return res.send(JSON.stringify({ status: "success", data: payload }));
}

module.exports.sendStatusCode = function(res, code = 500, text = "Internal server error") {
    return res.status(code).send(text);
}

module.exports.verifyArguments = function(req, valid, optional) {
    let errors = { };
    let fields = { };
    let success = true;

    if (valid)
    {
        for (let i = 0; i < valid.length; i++)
        {
            let key = valid[i];
            if (req.body[key] !== undefined)
                fields[key] = req.body[key];
            else if (req.query[key] !== undefined)
                fields[key] = req.query[key];
            else
            {
                errors[key] = "Required";
                success = false;
            }
        }
    }

    if (optional)
    {
        for (let i = 0; i < optional.length; i++)
        {
            let key = optional[i];
            if (req.body[key] !== undefined)
                fields[key] = req.body[key];
            else if (req.query[key] !== undefined)
                fields[key] = req.query[key];
        }
    }

    if (success)
        return { status: "success", data: fields };
    else
        return { status: "fail", reason: errors };
}
