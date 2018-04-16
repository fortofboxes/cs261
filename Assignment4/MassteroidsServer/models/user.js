let uuid = require('uuid/v4');

let _tempUserStorage = [ ];
let _tempUserUsernameIndex = { };
let _tempUserIdIndex = { };

module.exports.create = function(username, password, callback) {
    if (_tempUserUsernameIndex[username] !== undefined)
        return process.nextTick(() => { callback("Already taken"); });

    let result = { username: username, password: password, id: uuid() };
    result.save = (callback) => {
        process.nextTick(() => { callback(null); });
    };

    _tempUserUsernameIndex[result.username] = _tempUserStorage.length;
    _tempUserIdIndex[result.id] = _tempUserStorage.length;
    _tempUserStorage.push(result);

    return process.nextTick(() => { callback(null, result); });
}

module.exports.findUsername = function(username, callback) {
    let index = _tempUserUsernameIndex[username];
    if (index === undefined)
        return process.nextTick(() => { callback(null, null); });
    else
        return process.nextTick(() => { callback(null, _tempUserStorage[index]); });
}

module.exports.findId = function(id, callback) {
    let index = _tempUserIdIndex[id];
    if (index === undefined)
        return process.nextTick(() => { callback(null, null); });
    else
        return process.nextTick(() => { callback(null, _tempUserStorage[index]); });
}
