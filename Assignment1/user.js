let users     = [];
let loggedOnUsers = [];
let idCurrent = 0;
let sessionCurrent = 0;
let tokenCurrent = 0;

function Create(req, res, next) {
    let inUsername = req.body.username || req.query.username;
    let inPassword = req.body.password || req.query.password;
    let inAvatar   = req.body.avatar   || req.query.avatar;
    console.log("createUser");
    
    let userCount = users.length;
    let isDuplicate = false;
    for (let i = 0; i < userCount; i++) {
        if (users[i].username == inUsername){
            isDuplicate = true;
            break;
        }
    }
    if (isDuplicate)    {
        return process.nextTick(() => res.send(JSON.stringify({ status: 'fail', username : 'Already taken' })));
    } else {
        let user = {
            username : inUsername,
            password : inPassword,
            avatar   : inAvatar,
            id       : idCurrent,
        };
        idCurrent++;
        users.push(user);

        let response = {
            id : user.id,
            username : user.username
        };
        return process.nextTick(() => res.send(JSON.stringify({ status: 'success', response : response  })));
    }
    
}

function Login(req, res, next) {
    let inUsername = req.body.username || req.query.username;
    let inPassword = req.body.password || req.query.password;
    console.log("IN: " + inUsername);
    console.log("IN: " + inPassword);
    
    let userCount = users.length;
    for (let i = 0; i < userCount; i++) {
        console.log(i +":" + users[i].username);
        console.log(i +":" + users[i].password);

        if (users[i].username == inUsername){
            if (users[i].password == inPassword){
                
                let loginInfo = {
                    id : users[i].id,
                    session : sessionCurrent,
                    token : tokenCurrent
                }; 
                sessionCurrent++; tokenCurrent++;

                loggedOnUsers.push(loginInfo);

                return process.nextTick(() => res.send(JSON.stringify({ status: 'success', loginInfo : loginInfo  })));       
            } else {
                break;
            }

        }
    }
    return process.nextTick(() => res.send(JSON.stringify({ status: 'fail', reason : 'Username/password mismatch' })));
}

function Get(req, res, next) {
    let id = req.body.id || req.query.id || req.params.id
;    let session = req.body._session || req.query._session;
    let token = req.body._token || req.query._token;
console.log("getUser");
}

function Find(req, res, next){
    let username = req.body.username   || req.query.username || req.params.username;
    let session  = req.body._session   || req.query._session || req.params._session;
    let token    = req.body._token     || req.query._token || req.params._token;

console.log("findUser");

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
   
console.log("updateUser");

}

// this function is exported so it can be called from app.js
module.exports.register = function (app, root) {
    app.post(root  + 'create',         Create);
    app.post(root  + ':id/update',     Update);
    app.get (root  + 'login',          Login);
    app.get (root  + ':id/get',        Get);
    app.get (root  + 'find/:username', Find);
}