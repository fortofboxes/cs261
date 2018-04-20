
var app = require('./app.js');   // express server
var uuid = require('uuid/v1');

var redisClient = app.GetRedisClient();
var connection = app.GetSQLConnection();

let users     = {}; // ID TO USER
let usernamesToIDs = {}; // username to ID
let loggedOnUsers = {}; // ID to user

function GenerateInteger() {
    return Math.floor(Math.random() * Math.floor(10000));
}

function Create(req, res, next) {
    let inUsername = req.body.username || req.query.username;
    let inPassword = req.body.password || req.query.password;
    let inAvatar   = req.body.avatar   || req.query.avatar;
    if (inUsername in usernamesToIDs){
        reason = { username : 'Already taken'}
        return process.nextTick(() => res.send(JSON.stringify({ status: 'fail', reason : reason})));

    } else {
        let newID = uuid();
        //let user = {
        //    id       : newID,
        //    username : inUsername,
        //    password : inPassword,
        //    avatar   : inAvatar,
        //};

        //what is salt?
        var sql = "INSERT INTO user (id, username, password, avatar) VALUES (newID, inUsername, inPassword, inAvatar)"; // Does password hash need to happen?? w
         connection.query(sql, function (err, result) {
           if (err) throw err;
           console.log("1 record inserted");
         });

         // No longer have usernames to IDs

        //users[newID] = user;
        //usernamesToIDs[inUsername] = newID;

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
        

    connection.query('SELECT * FROM `user` WHERE `id` = usernamesToIDs[inUsername]', function (error, results, fields) {
    // error will be an Error if one occurred during the query
    console.log("error" +  errors);
    
    console.log("results" +  results);  
    console.log("fields" + fields);

    // results will contain the results of the query
    // fields will contain information about the returned results fields (if any)
    });

    if (inUsername in usernamesToIDs){
        if(users[usernamesToIDs[inUsername]].password == inPassword){

           let newSession = GenerateInteger();
           let newToken   = GenerateInteger();
           redisClient.hmset(newSession, {
            'id'       : users[usernamesToIDs[inUsername]].id,
            'username' : inUsername,
            'token'    : newToken,
            'avatar'   : users[usernamesToIDs[inUsername]].avatar
           });

            redisClient.hgetall(newSession, function(err, object) {
                console.log(object);
            });

            let response = {
                id : users[usernamesToIDs[inUsername]].id,
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

    redisClient.hgetall(inSession, function(err, reply) { // doing instead of exists
        if (!err) {
            if (inToken ==  redisClient.hget(inSession, 'token')){
                let data = {
                    id       : redisClient.hget(inSession, 'id'),
                    username : redisClient.hget(inSession, 'username'),
                    avatar   : redisClient.hget(inSession, 'avatar')
                };
                return process.nextTick(() => res.send(JSON.stringify({ status: 'success', data : data  }))); 
            }
        }
    });
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
    
    redisClient.hgetall(inSession, function(err, reply) {
        if (!err === 1) {
            if (inToken ==  redisClient.hget(inSession, 'token')){
                let data = {
                    id       : redisClient.hget(inSession, 'id'),
                    username : redisClient.hget(inSession, 'username'),
                    avatar   : redisClient.hget(inSession, 'avatar')
                };
                return process.nextTick(() => res.send(JSON.stringify({ status: 'success', data : data  }))); 
            }
        }
    });
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
    let token       = req.body._token      || req.query._token   || req.params._token;

    let data = {
        passwordChanged : null,
        avatar : null
    };  

     redisClient.hgetall(inSession, function(err, reply) {
        if (!err) {
            if (id in users){
                if (oldPassword && newPassword){
                    if (oldPassword == users[id].password){
                        users[id].password = newPassword;
                        data.passwordChanged = true;
                    }else{
                        let reason  = {
                            oldPassword : "Forbidden"
                        };
                        return process.nextTick(() => res.send(JSON.stringify({ status: 'fail', reason :reason }))); 
                    }
                }    
            
                if (avatar){
                    users[id].avatar = avatar; 
                    data.avatar = avatar;   
                    redisClient.hmset(inSession, { // Using hmset cause not sure of syntax for hset
                        'avatar' : avatar
                    });
                }
        
                return process.nextTick(() => res.send(JSON.stringify({ status: 'success', data : data  })));       
            }   
        }
    });
    return process.nextTick(() => res.send(JSON.stringify({ status: 'fail', data : data  })));   
}

// this function is exported so it can be called from app.js
module.exports.register = function (app, root) {
    app.post(root  + 'create',         Create);
    app.post(root  + ':id/update',     Update);
    app.get (root  + 'login',          Login);
    app.get (root  + ':id/get',        Get);
    app.get (root  + 'find/:username', Find);
}