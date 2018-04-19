

function createUser(req, res, next) {
    let username = req.body.username || req.query.username;
    let password = req.body.password || req.query.password;
    let avatar   = req.body.avatar   || req.query.avatar;

	
}

function loginUser(req, res, next) {
    let username = req.body.username || req.query.username;
    let password = req.body.password || req.query.password;

}

function getUser(req, res, next) {
    let id = req.body.id || req.query.id || req.params.id;
    let session = req.body._session || req.query._session;
    let token = req.body._token || req.query._token;


}

function findUser(req, res, next){
    let username = req.body.username   || req.query.username || req.params.username;
    let session  = req.body._session   || req.query._session || req.params._session;
    let token    = req.body._token     || req.query._token || req.params._token;


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


}

// this function is exported so it can be called from app.js
module.exports.register = function (app, root) {
    app.post(root  + 'create',         createUser);
    app.post(root  + ':id/update',     updateUser);
    app.get (root  + 'login',          loginUser);
    app.get (root  + ':id/get',        getUser);
    app.get (root  + 'find/:username', findUser);
}


