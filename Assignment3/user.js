
var app    = require('./app.js');   // express server
var uuid   = require('uuid/v1');
var crypto = require('crypto');

var redisClient = app.GetRedisClient();
var connection = app.GetSQLConnection();
function GenerateInteger() {
    return Math.floor(Math.random() * Math.floor(10000));
}

function GetSalt(){
    return Math.round((Date.now() * Math.random())) + ' ';
}

function CreateHash(password, salt){ // This wasnt creating a consistent hash..
    return password + '2'; //crypto.createHash('sha512').update(salt + password, 'utf8').digest('hex');
}

function Create(req, res, next) {
    let inUsername = req.body.username || req.query.username;
    let inPassword = req.body.password || req.query.password;
    let inAvatar   = req.body.avatar   || req.query.avatar;
    let newID = uuid(); 
    let salt = GetSalt();
    let passHash = CreateHash(inPassword, salt);
    let passHash2 = CreateHash(inPassword, salt);
    let sql = 'SELECT * FROM user WHERE username = ?';
    connection.query(sql,[inUsername], function (error, results, fields) {
        if (results.length > 0){
           reason = { username : 'Already taken'}
           return process.nextTick(() => res.send(JSON.stringify({ status: 'fail', reason : reason})));
        }else{
            sql = 'INSERT INTO user (id, username, passwordhash, salt, avatar_url) VALUES ?';
            let values = [[newID, inUsername, passHash, salt, inAvatar]]; 

            connection.query(sql, [values], function (err, result, fields) {
                console.log("");
        });
        let response = {
            id : newID,
             username : inUsername
        };
        return process.nextTick(() => res.send(JSON.stringify({ status: 'success', data : response  })));
        }
    });
}

function Login(req, res, next) {
    let inUsername = req.body.username || req.query.username;
    let inPassword = req.body.password || req.query.password;

    let sql = 'SELECT * FROM user WHERE username = ?';

    connection.query(sql,[inUsername], function (error, results, fields) {
    // error will be an Error if one occurred during the query
        if (error) console.log(error);
        if (results.length > 0){
            let pass =  CreateHash(inPassword, results[0].salt);

            if(results[0].passwordhash == pass) {
                let newSession = uuid();
                let newToken   = uuid();
                redisClient.hmset(newSession, {
                    'id'       : results[0].id,
                    'username' : inUsername,
                    'token'    : newToken,
                    'avatar'   : results[0].avatar_url
                });

                redisClient.hgetall(newSession, function(err, object) {
                });

                let response = {
                    id : results[0].id,
                    session : newSession,
                    token : newToken
                };

                return process.nextTick(() => res.send(JSON.stringify({ status: 'success', data : response})));
            }
            else{
             return process.nextTick(() => res.send(JSON.stringify({ status: 'fail', reason : 'Username/password mismatch' })));

            }
                
        }
        else
        {
             return process.nextTick(() => res.send(JSON.stringify({ status: 'fail', reason : 'Username/password mismatch' })));

        }
    });
}

function Get(req, res, next){
    let inId      = req.body.id       || req.query.id || req.params.id;    
    let inSession = req.body._session || req.query._session;
    let inToken   = req.body._token   || req.query._token;
    let data =     {
        id : null,
        username : null,
        avatar : null
    };  
    connection.query('SELECT * FROM user WHERE id = ?', [inId], (err, object) => 
    {
        if(object.length > 0)
        {
            redisClient.hgetall(inSession, function(err, redisObject) { // doing instead of exists
                if (!err) {
                    if (inToken == redisObject.token){
                        let data = {
                            id       : object[0].id,
                            username : object[0].username,
                            avatar   : object[0].avatar_url
                        };
                        return process.nextTick(() => res.send(JSON.stringify({ status: 'success', data : data  }))); 
                    }else {
                          return process.nextTick(() => res.send(JSON.stringify({ status: 'fail', data : data  })));   
                    }

                } else {
                    return process.nextTick(() => res.send(JSON.stringify({ status: 'fail', data : data  })));   
                }
            });
        } else {
            return process.nextTick(() => res.send(JSON.stringify({ status: 'fail', data : data  })));   
        }
    }); 
}

function Find(req, res, next){
    let inUsername = req.body.username || req.query.username || req.params.username;    
    let inSession  = req.body._session || req.query._session;
    let inToken    = req.body._token   || req.query._token;
    let data =     {
        id : null,
        username : null,
        avatar : null
    };  
    connection.query('SELECT * FROM user WHERE username = ?', [inUsername], (err, object) => 
    {
        if(object.length > 0)
        {
            redisClient.hgetall(inSession, function(err, redisObject) { // doing instead of exists
                if (!err) {
                    if (inToken == redisObject.token){
                        let data = {
                            id       : object[0].id,
                            username : object[0].username,
                            avatar   : object[0].avatar_url
                        };
                        return process.nextTick(() => res.send(JSON.stringify({ status: 'success', data : data  }))); 
                    }else {
                          return process.nextTick(() => res.send(JSON.stringify({ status: 'fail', data : data  })));   
                    }

                } else {
                    return process.nextTick(() => res.send(JSON.stringify({ status: 'fail', data : data  })));   
                }
            });
        } else {
            return process.nextTick(() => res.send(JSON.stringify({ status: 'fail', data : data  })));   
        }
    }); 
}

function Update(req, res, next){
    let inId          = req.body.id          || req.query.id || req.params.id;
    let inUsername  = req.body.username    || req.query.username;
    let password    = req.body.password    || req.query.password;
    let avatar      = req.body.avatar      || req.query.avatar;
    let oldPassword = req.body.oldPassword || req.query.oldPassword;
    let newPassword = req.body.newPassword || req.query.newPassword;
    let inSession   = req.body._session    || req.query._session || req.params._session;
    let inToken       = req.body._token      || req.query._token   || req.params._token;

    let data = {
        passwordChanged : null,
        avatar : null
    };  

    connection.query('SELECT * FROM user WHERE id = ?', [inId], (err, object) => 
    {
        if(object.length > 0)
        {
            redisClient.hgetall(inSession, function(err, redisObject) { // this validates the session
                if (!err) {
                    if (inToken == redisObject.token){ // validate token

                        if (avatar){
                            let sql = 'UPDATE user SET avatar_url = ? WHERE id = ?';
                            connection.query(sql, [avatar, inId], function(error,result){});
                            data.avatar = avatar;
                            //Update redis
                        }
                        if (oldPassword && newPassword){
                            if (CreateHash(oldPassword, object[0].salt) == object[0].passwordhash){
                                let newPassHash = CreateHash(newPassword,object[0].salt);
                                let sql = 'UPDATE user SET passwordhash = ? WHERE id = ?';
                                connection.query(sql, [newPassHash, inId], function(error,result){});
                                data.passwordChanged = true;
                            }else{
                                 return process.nextTick(() => res.send(JSON.stringify({ status: 'fail', data : data  })));   
                            }
                        }
                        if ((oldPassword && newPassword) || avatar){
                          return process.nextTick(() => res.send(JSON.stringify({ status: 'success', data : data  })));   
                        }
                    
                    }else {
                          return process.nextTick(() => res.send(JSON.stringify({ status: 'fail', data : data  })));   
                    }

                } else {
                    return process.nextTick(() => res.send(JSON.stringify({ status: 'fail', data : data  })));   
                }
            });
        } else {
            return process.nextTick(() => res.send(JSON.stringify({ status: 'fail', data : data  })));   
        }
    }); 
}

module.exports.register = function (app, root) {
    app.post(root  + 'create',         Create);
    app.post(root  + ':id/update',     Update);
    app.get (root  + 'login',          Login);
    app.get (root  + ':id/get',        Get);
    app.get (root  + 'find/:username', Find);
}