let users     = [];
let loggedOnUsers = [];
let idCurrent = 0;
let sessionCurrent = 10;
let tokenCurrent = 0;

function Create(req, res, next) {
    let inUsername = req.body.username || req.query.username;
    let inPassword = req.body.password || req.query.password;
    let inAvatar   = req.body.avatar   || req.query.avatar;
    
    let userCount = users.length;
    let isDuplicate = false;
    for (let i = 0; i < userCount; i++) {
        if (users[i].username == inUsername){
            isDuplicate = true;
            break;
        }
    }
    if (isDuplicate)    {
        reason = { username : 'Already taken'}

        return process.nextTick(() => res.send(JSON.stringify({ status: 'fail', reason : reason})));
    } else {
        var user = {
            username : inUsername,
            password : inPassword,
            avatar   : inAvatar,
            id       : idCurrent
        };
        idCurrent++;

        let response = {
            id : user.id,
            username : user.username
        };
        users.push(user);

        return process.nextTick(() => res.send(JSON.stringify({ status: 'success', data : response  })));
    }
    
}

function Login(req, res, next) {
    let inUsername = req.body.username || req.query.username;
    let inPassword = req.body.password || req.query.password;

    let userCount = users.length;
    for (let i = 0; i < userCount; i++) {

        if (users[i].username == inUsername){
            if (users[i].password == inPassword){
                
                let loginInfo = {
                    id : users[i].id,
                    session : sessionCurrent,
                    token : tokenCurrent,
                    avatar : users[i].avatar,
                    username : users[i].username
                }; 
                sessionCurrent++; tokenCurrent++;

                loggedOnUsers.push(loginInfo);

                let response = {
                    id : users[i].id,
                    session : sessionCurrent,
                    token : tokenCurrent
                };

                return process.nextTick(() => res.send(JSON.stringify({ status: 'success', data : response})));       
            } else {
                break;
            }

        }
    }
    return process.nextTick(() => res.send(JSON.stringify({ status: 'fail', reason : 'Username/password mismatch' })));
}

function Get(req, res, next) {
    let inId      = req.body.id       || req.query.id || req.params.id;    
    let inSession = req.body._session || req.query._session;
    let inToken   = req.body._token   || req.query._token;
    
    let loggedOnCount = loggedOnUsers.length;
    for (let i = 0; i < loggedOnCount; i++) {
        if (inId == loggedOnUsers[i].id){
            if(inSession == loggedOnUsers[i].session &&
               inToken   == loggedOnUsers[i].token){
                
                let response = {
                    id : loggedOnUsers[i].id,
                    username : loggedOnUsers[i].username,
                    avatar : loggedOnUsers[i].avatar
                };
                return process.nextTick(() => res.send(JSON.stringify({ status: 'success', data : response  })));       
            } else {
                break;
            }
        }
    }
    return process.nextTick(() => res.send(JSON.stringify({ status: 'fail', data : 'Invalid Information'  })));       
}

function Find(req, res, next){
    let inUsername = req.body.username || req.query.username || req.params.username;    
    let inSession  = req.body._session || req.query._session;
    let inToken    = req.body._token   || req.query._token;
    
    let loggedOnCount = loggedOnUsers.length;
    for (let i = 0; i < loggedOnCount; i++) {
        if (inUsername == loggedOnUsers[i].username){
            if(inSession == loggedOnUsers[i].session &&
               inToken   == loggedOnUsers[i].token){
                
                let response = {
                    id : loggedOnUsers[i].id,
                    username : loggedOnUsers[i].username
                };
                return process.nextTick(() => res.send(JSON.stringify({ status: 'success', data : response  })));       
            } else {
                break;
            }
        }
    }
    return process.nextTick(() => res.send(JSON.stringify({ status: 'fail', data : 'Invalid Information'  })));       
}

function Update(req, res, next){
    let id          = req.body.id          || req.query.id || req.params.id;
    let username    = req.body.username    || req.query.username;
    let password    = req.body.password    || req.query.password;
    let avatar      = req.body.avatar      || req.query.avatar;
    let oldPassword = req.body.oldPassword || req.query.oldPassword;
    let newPassword = req.body.newPassword || req.query.newPassword;
    let session     = req.body._session    || req.query._session || req.params._session;
    let token       = req.body._token      || req.query._token || req.params._token;
}

// this function is exported so it can be called from app.js
module.exports.register = function (app, root) {
    app.post(root  + 'create',         Create);
    app.post(root  + ':id/update',     Update);
    app.get (root  + 'login',          Login);
    app.get (root  + ':id/get',        Get);
    app.get (root  + 'find/:username', Find);
}