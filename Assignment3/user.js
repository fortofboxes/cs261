
var app    = require('./app.js');   // express server
var uuid   = require('uuid/v1');
var crypto = require('crypto');

var redisClient = app.GetRedisClient();
var connection = app.GetSQLConnection();

let users     = {}; // ID TO USER
let usernamesToIDs = {}; // username to ID
let loggedOnUsers = {}; // ID to user

function GenerateInteger() {
    return Math.floor(Math.random() * Math.floor(10000));
}

function GetSalt(){
    return Math.round((Date.now() * Math.random())) + ' ';
}

function CreateHash(password, salt){
    return  crypto.createHash('sha512').update(salt + password, 'utf8').digest('hex');
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
        let salt = GetSalt();
        let passHash = CreateHash(inPassword, salt);

         let sql = 'INSERT INTO user (id, username, passwordhash,salt, avatar_url) VALUES ?';
         let values = [[newID, inUsername, passHash, salt, inAvatar]]; 
         connection.query(sql, [values], function (err, result, fields) {
           if (err) console.log("ISSUE ON CREATE " + err);
           console.log("1 record inserted");
         });

        let response = {
            id : newID,
            username : inUsername
        };

        return process.nextTick(() => res.send(JSON.stringify({ status: 'success', data : response  })));
    }
}

function Login(req, res, next) {
    let inUsername = req.body.username || req.query.username;
    let inPassword = req.body.password || req.query.password;

    let sql = 'SELECT * FROM user WHERE username = ?';

    connection.query(sql,[inUsername], function (error, results, fields) {
    // error will be an Error if one occurred during the query
        console.log("error" +  error);
    
        console.log("results" +  results[0]);  
        console.log("fields" + fields);

    
        let newSession = GenerateInteger();
        let newToken   = GenerateInteger();
        redisClient.hmset(newSession, {
            'id'       : results[0].id,
            'username' : inUsername,
            'token'    : newToken,
            'avatar'   : results[0].avatar_url
       });

        redisClient.hgetall(newSession, function(err, object) {
            console.log(object);
        });

        let response = {
            id : results.id,
            session : newSession,
            token : newToken
        };

        return process.nextTick(() => res.send(JSON.stringify({ status: 'success', data : response})));     
        
    });

     
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