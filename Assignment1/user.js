

function createUser(req, res, next) {
    let username = req.body.username || req.query.username;
    let password = req.body.password || req.query.password;
    let avatar   = req.body.avatar   || req.query.avatar;
console.log("createUser");

    
}

function loginUser(req, res, next) {
    let username = req.body.username || req.query.username;
    let password = req.body.password || req.query.password;
console.log("loginUser");

}

function getUser(req, res, next) {
    let id = req.body.id || req.query.id || req.params.id;
    let session = req.body._session || req.query._session;
    let token = req.body._token || req.query._token;
console.log("getUser");
}

function findUser(req, res, next){
    let username = req.body.username   || req.query.username || req.params.username;
    let session  = req.body._session   || req.query._session || req.params._session;
    let token    = req.body._token     || req.query._token || req.params._token;

console.log("findUser");

}

function updateUser(req, res, next){
    let id = req.body.id || req.query.id || req.params.id;
    let username = req.body.username || req.query.username;
    let password = req.body.password || req.query.password;
    let avatar   = req.body.avatar   || req.query.avatar;
    let oldPassword = req.body.oldPassword || req.query.oldPassword;
    let newPassword = req.body.newPassword || req.query.newPassword;
    let session  = req.body._session   || req.query._session || req.params._session;
    let token    = req.body._token     || req.query._token || req.params._token;

console.log("updateUser");

}

// this function is exported so it can be called from app.js
module.exports.register = function (app, root) {
    app.post(root  + 'create',         createUser);
    app.post(root  + ':id/update',     updateUser);
    app.get (root  + 'login',          loginUser);
    app.get (root  + ':id/get',        getUser);
    app.get (root  + 'find/:username', findUser);
}


