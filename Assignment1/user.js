let users     = {}; // ID TO USER
let usernamesToIDs = {}; // username to ID
let loggedOnUsers = {}; // ID to user
let sessionCurrent = 10;
let tokenCurrent = 0;

function GenerateID() {
  let unique = false;
  let newID = 0;
  do {
        newID = Math.floor(Math.random() * Math.floor(10000));

    }while( newID in users);
    return newID;
}

function GenerateInteger() {
    return Math.floor(Math.random() * Math.floor(10000));
}

function Create(req, res, next) {
    let inUsername = req.body.username || req.query.username;
    let inPassword = req.body.password || req.query.password;
    let inAvatar   = req.body.avatar   || req.query.avatar;
    console.log(users);
    console.log("in: " +inUsername);
    if (inUsername in usernamesToIDs){
        reason = { username : 'Already taken'}
        return process.nextTick(() => res.send(JSON.stringify({ status: 'fail', reason : reason})));

    } else {
        let newID = GenerateID();
        let user = {
            username : inUsername,
            password : inPassword,
            avatar   : inAvatar,
            id       : newID
        };

        users[newID] = user;
        usernamesToIDs[inUsername] = newID;

        let response = {
            id : user.id,
            username : user.username
        };

        return process.nextTick(() => res.send(JSON.stringify({ status: 'success', data : response  })));
    }
}

function Login(req, res, next) {
    let inUsername = req.body.username || req.query.username;
    let inPassword = req.body.password || req.query.password;

    console.log("Attempted login: " + inUsername);
    let userCount = users.length;
    if (inUsername in usernamesToIDs){
        if(users[usernamesToIDs[inUsername]].password == inPassword){

           let newSession = GenerateInteger();
           let newToken   = GenerateInteger();

           let loginInfo = {
                    id : users[usernamesToIDs[inUsername]].id,
                    session : newSession,
                    token : newToken,
                    avatar : users[usernamesToIDs[inUsername]].avatar,
                    username : inUsername
                }; 

            loggedOnUsers[loginInfo.id] = loginInfo;

            let response = {
                id : loginInfo.id,
                session : newSession,
                token : newToken
            };

            return process.nextTick(() => res.send(JSON.stringify({ status: 'success', data : response})));     
        }
    }    
    return process.nextTick(() => res.send(JSON.stringify({ status: 'fail', reason : 'Username/password mismatch' })));
}

function Get(req, res, next) {

    let inId      = req.body.id       || req.query.id || req.params.id;    
    let inSession = req.body._session || req.query._session;
    let inToken   = req.body._token   || req.query._token;

    console.log("USERS:");
    for (var user in users){
        console.log(users[user].id);
    }


    console.log("lOGGEDoN:");
    for (var user in loggedOnUsers){
        console.log(loggedOnUsers[user].id);
    }
    
    console.log("inID : " + inId);

    if (inId in loggedOnUsers && loggedOnUsers[inId].session == inSession && loggedOnUsers[inId].token == inToken){
        let response = {
            id : loggedOnUsers[i].id,
            username : loggedOnUsers[i].username,
            avatar : loggedOnUsers[i].avatar
        };
        return process.nextTick(() => res.send(JSON.stringify({ status: 'success', response  })));   
    }

    let data = {
        id : null,
        username : null,
        avatar : null
    };  
    return process.nextTick(() => res.send(JSON.stringify({ status: 'fail', data : data  })));       
}

function Find(req, res, next){
    let inUsername = req.body.username || req.query.username || req.params.username;    
    let inSession  = req.body._session || req.query._session;
    let inToken    = req.body._token   || req.query._token;
    
    if(inUsername in usernamesToIDs){
        let userID = usernamesToIDs[inUsername];
        if (loggedOnUsers[userID].session == inSession && loggedOnUsers[userID].token == inToken){
            let response = {
                    id : loggedOnUsers[i].id,
                    username : loggedOnUsers[i].username
            };
            return process.nextTick(() => res.send(JSON.stringify({ status: 'success', data : response  })));       
        }
    }

    let data = {
        id : null,
        username : null,
        avatar : null
    }; 
    return process.nextTick(() => res.send(JSON.stringify({ status: 'fail', data : data  })));       
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