const createHttpError = require('http-errors');

const app = require('express').Router();

const bcrypt = require('bcrypt');
const config = require('../../config');
const jwt = require('jsonwebtoken');


//ROUTES//
const Card = require("../model/card")
const User = require("../model/user")
const LeaderBoard = require("../model/leaderboard")
const Auth = require("../model/auth")

//Middleware//
const verifyGoogleToken = require('../middlewares/verifyGoogleToken');
const verifyToken = require('../middlewares/verifyToken');
const printingDebuggingInfo = require("../middlewares/printingRequest");

// Requiring modules
const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

//=====================================
//  Images
//=====================================

//retrieveImagesForUno
app.get('/images/*', printingDebuggingInfo, function (req, res, next) {
    var request = url.parse(req.url, true);
    var action = request.pathname;
    var filePath = path.join(__dirname, action).split("%20").join(" ");
    console.log(action)
    console.log(filePath)

    fs.open(filePath, 'r', (err, fd) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return next(createHttpError(404, `Not found`));
            }
            throw err;
        }

        var ext = path.extname(action);
        var contentType = "text/plain";

        if (ext === ".png") {
            contentType = "image/png";
        }

        res.writeHead(200, {
            "Content-Type": contentType
        });

        fs.readFile(filePath,
            function (err, content) {
                res.end(content);
            });
    });

});

//retrieveImagesForProfile
app.get('/profile_icons/*', printingDebuggingInfo, function (req, res, next) {
    var request = url.parse(req.url, true);
    var action = request.pathname;
    var filePath = path.join(__dirname, action).split("%20").join(" ");
    console.log(action)
    console.log(filePath)

    fs.open(filePath, 'r', (err, fd) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return next(createHttpError(404, `Not found`));
            }
            throw err;
        }

        var ext = path.extname(action);
        var contentType = "text/plain";

        if (ext === ".png") {
            contentType = "image/png";
        }

        res.writeHead(200, {
            "Content-Type": contentType
        });

        fs.readFile(filePath,
            function (err, content) {
                res.end(content);
            });
    });
});

//=====================================
//  Card
//=====================================

//findAll
app.get('/cards', printingDebuggingInfo, function (req, res, next) {

    Card.findAll(function (err, result) {
        if (err) {
            if (err.code === '23505') {
                return next(createHttpError(404, `Not found`));
            }
            else {
                return next(err);
            }
        } else {
            if (result.length == 0) {
                return next(createHttpError(404, `Not found`));
            } else {
                return res.status(200).json({ cards: result });
            }

        }
    });
});

//=====================================
//  Auth
//=====================================

//login
app.post('/login', printingDebuggingInfo, function (req, res, next) {

    let email = req.body.email;
    let password = req.body.password;
    try {
        Auth.login(email, function (error, results) {
            if (error) {
                return res.status(500).json({ message: 'Credentials are not valid.' });

            } else {
                if (results.length == 1) {
                    if ((password == null) || (results[0] == null)) {
                        return res.status(500).json({ message: 'login failed' });
                    }
                    if (bcrypt.compareSync(password, results[0].password) == true) {

                        let data = {
                            user_id: results[0].userid,
                            token: jwt.sign({ id: results[0].userid }, config, {
                                expiresIn: 86400
                            }),
                            username: results[0].username
                        };
                        return res.status(200).json(data);
                    } else {
                        return res.status(500).json({ message: error });
                    }
                }

            }

        })
    } catch (error) {
        return res.status(500).json({ message: error });
    }
});

// OAuth v2.0 Login -- Google
app.post('/login/google', printingDebuggingInfo, verifyGoogleToken, function (req, res, next) {
    // const googleJWTtoken = req.headers.authorization.replace('Bearer ', '');
    // console.log("googleJWTtoken: " + googleJWTtoken);

    const googlePayload = req.googlePayload;
    const googleToken = req.googleToken;

    try {
        Auth.login(googlePayload.email, function (error, results) {
            if (error) {
                const message = {
                    code: 500,
                    message: 'Internal Server Error',
                    error: error
                }

                return res.status(500).json(message);

            } else {
                console.log("thelength:", results);
                // Indicates that the user is registered with our internal system
                if (results.length === 1) {
                    const userid = results.userid;
                    console.log("results: " + results);

                    const data = {
                        name: googlePayload.name,
                        email: googlePayload.email,
                        gid: googlePayload.sub,
                    };

                    Auth.attachGoogleId(data, (error2, results2) => {
                        if (error2) {
                            const message = {
                                code: 500,
                                message: 'Internal Server Error',
                                error: error2
                            }

                            return res.status(500).json(message);

                        } else {
                            const data = {
                                user_id: results[0].userid,
                                token: googleToken,
                                username: results[0].username
                            };

                            return res.status(200).json(data);
                        }
                    });
                }

                else if (results.length <= 0) {
                    const data = {
                        name: googlePayload.name,
                        email: googlePayload.email,
                        gid: googlePayload.sub,
                    };

                    Auth.registerWithGoogle(data, (error2, results2) => {
                        if (error2) {
                            const message = {
                                code: 500,
                                message: 'Internal Server Error',
                                error: error2
                            }

                            return res.status(500).json(message);

                        } else {
                            console.log("done registering!");
                            console.log("results2:", results2);

                            const data = {
                                user_id: results2[0].userid,
                                token: googleToken,
                                username: googlePayload.name
                            };

                            console.log(">>", data);

                            return res.status(200).json(data);
                        }
                    });
                }

                else {
                    console.log("ERROR!!!!, Results:", results);

                    const message = {
                        code: 500,
                        message: 'Internal Server Error Signing up With Google'
                    }

                    return res.status(500).json(message);
                }
            }

        })
    } catch (error) {
        return res.status(500).json({ message: error });
    }
});

//register
app.post('/register', printingDebuggingInfo, function (req, res, next) {
    console.log('processRegister running.');
    let userName = req.body.userName;
    let email = req.body.email;
    let password = req.body.password;


    bcrypt.hash(password, 10, async (err, hash) => {
        if (err) {
            console.log('Error on hashing password');

            return res.status(500).json({ statusMessage: 'Unable to complete registration with error!' });
        } else {
            results = Auth.register(userName, email, hash, function (error, results) {
                console.log("RESULTS: " + results)
                if (results != null) {
                    LeaderBoard.insertNewScore(results[0].userid, 0, function (err, result) {
                        console.log(results)
                        console.log(results[0].userid)
                        if (err) {
                            if (err.code === '23505') {
                                return next(createHttpError(404, `Not found`));
                            }
                            else {
                                return next(err);
                            }
                        } else {
                            return res.status(201).json({ statusMessage: 'Completed registration.' });
                        }
                    });


                }
                console.log("IM HEREEEEEEEEEEEEEEEE and the error here is " + error)
                if (error) {
                    console.log("ERROR CODE:---------------------------- " + error)

                    return res.status(500).json({ statusMessage: 'Unable to complete registration due to duplicate field(s)' });
                }
            });
        }
    });

});

//=====================================
//  User
//=====================================
//getUserStatistics
app.get('/user/stat', printingDebuggingInfo, verifyToken, verifyGoogleToken, function (req, res, next) {
    const uid = req.decodedToken.id;
    console.log(">>>>", uid);
    User.getUserStat(uid, function (err, result) {
        if (err) {
            if (err.code === '23505') {
                return next(createHttpError(404, `Not found`));
            }
            else {
                return next(err);
            }
        } else {
            return res.status(200).send({ score: result });
        }
    });
});

//getUserOverallStatistics
app.get('/user/stat/overall', printingDebuggingInfo, verifyToken, verifyGoogleToken, function (req, res, next) {
    const uid = req.decodedToken.id;
    console.log(">>>>", uid);

    User.getUserOverallStat(uid, function (err, result) {
        if (err) {
            if (err.code === '23505') {
                return next(createHttpError(404, `Not found`));
            }
            else {
                return next(err);
            }
        } else {
            return res.status(200).send({ score: result });
        }
    });
});

//findByUserId
app.get('/user/:id', printingDebuggingInfo, verifyToken, verifyGoogleToken, function (req, res, next) {
    const id = req.params.id;

    User.findByUserID(id, function (err, result) {
        if (err) {
            if (err === "404") {
                console.log("result: 404");
                return next(createHttpError(404, `Not found`));
            }
            else {
                console.log("result: thank you next");
                return next(err);
            }
        } else {
            if (result.length === 0) {
                console.log("result:", "no result");
                return next(createHttpError(404, `Not found`));
            } else {
                console.log("result:", result);

                const message = {
                    user: result
                };

                console.log("returning!");
                return res.status(200).json(message);
            }
        }
    });
});

//updateUserIcon
app.put('/user/icon/:id', printingDebuggingInfo, verifyToken, verifyGoogleToken, function (req, res, next) {
    const id = req.params.id;
    const icon = req.body.icon;

    User.updateUserIcon(id, icon, function (err, result) {
        if (err) {
            if (err === "404") {
                return next(createHttpError(404, `Not found`));
            }
            else {
                return next(err);
            }
        } else {
            return res.status(204).json({ statusMessage: 'Completed update.' });
        }
    });

});

//updateUserInfo
app.put('/user/updateinfo/:id', printingDebuggingInfo, verifyToken, verifyGoogleToken, function (req, res, next) {
    const id = req.params.id;
    const newusername = req.body.username;
    const newemail = req.body.email;

    User.updateUserInfo(id, newusername, newemail, function (err, result) {
        if (err) {
            if (err === "404") {
                return next(createHttpError(404, `Not found`));
            }
            else {
                return next(err);
            }
        } else {
            return res.status(204).json({ statusMessage: 'Completed update.' });
        }
    });

});

//updateUserPassword
app.put('/user/update/:id', printingDebuggingInfo, verifyToken, verifyGoogleToken, function (req, res, next) {
    const id = req.params.id;
    const old_password = req.body.old_password;
    const new_password = req.body.new_password;

    try {
        User.checkPassword(id, function (error, results) {
            if (error) {
                return res.status(404).json({ message: 'User does not exist' });
            } else {
                console.log(results)
                if (results.length == 1) {
                    if ((old_password == null) || (results[0] == null)) {
                        return res.status(500).json({ message: 'No password placed' });
                    }
                    if (bcrypt.compareSync(old_password, results[0].password) == true) {
                        bcrypt.hash(new_password, 10, async (err, hash) => {
                            if (err) {
                                return res.status(500).json({ statusMessage: 'Unable to complete update' });
                            } else {
                                results = User.updateUserPassword(id, hash, function (error, results) {
                                    console.log(results)
                                    if (results != null) {
                                        return res.status(204).json({ statusMessage: 'Completed update.' });
                                    }
                                    if (error) {
                                        return res.status(500).json({ statusMessage: 'Unable to complete update' });
                                    }
                                });
                            }
                        });
                    } else {
                        return res.status(500).json({ message: "Wrong password" });
                    }
                }

            }

        })
    } catch (error) {
        return next(err);
    }

});

//deleteUser
app.delete('/user/delete/:id', printingDebuggingInfo, verifyToken, verifyGoogleToken, function (req, res, next) {
    const id = req.params.id;

    User.deleteUser(id, function (err, result) {
        if (err) {
            if (err.code === '23505') {
                return next(createHttpError(404, `Not found`));
            }
            else {
                return next(err);
            }
        } else {
            return res.status(204).json({ message: "deleted" });
        }
    });
});


//=====================================
//  LeaderBoard
//=====================================

//findByUserId
app.get('/leaderboard/user/:id', printingDebuggingInfo, function (req, res, next) {
    const id = req.params.id;

    LeaderBoard.findByUserId(id, function (err, result) {
        if (err) {
            if (err.code === '23505') {
                return next(createHttpError(404, `Not found`));
            }
            else {
                return next(err);
            }
        } else {
            return res.status(200).send({ score: result });
        }
    });
});

//getNumOfScores
app.get('/leaderboard/:num', printingDebuggingInfo, function (req, res, next) {
    const num = req.params.num;

    LeaderBoard.getNumOfScores(num, function (err, result) {
        if (err) {
            if (err.code === '23505') {
                return next(createHttpError(404, `Not found`));
            }
            else {
                return next(err);
            }
        } else {
            return res.status(200).send({ scores: result });
        }
    });
});

//updateHighestScore
app.put('/leaderboard/update/:id', printingDebuggingInfo, verifyToken, verifyGoogleToken, function (req, res, next) {
    const id = req.params.id;
    const score = req.body.score;

    LeaderBoard.updateHighestScore(score, id, function (err, result) {
        if (err) {
            if (err.code === '23505') {
                return next(createHttpError(404, `Not found`));
            }
            else {
                return next(err);
            }
        } else {
            return res.status(201).send({ result: "Created" });
        }
    });
});

// Resetting password when forget
app.put('/user/reset', printingDebuggingInfo, function (req, res, next) {
    const email = req.body.email;
    const new_password = req.body.password;

    try {
        // console.log("-----------------------------------------------------------------")
        // console.log(results)
        // console.log("-----------------------------------------------------------------")
        console.log(email)

        bcrypt.hash(new_password, 10, async (err, hash) => {

            results = User.resetUserPasswordGmail(email, hash, function (error, results) {
                console.log(results)
                if (results === 0) {
                    console.log("There is no such user in the database! Ensure that you have registered with us!")
                    return res.status(404).json({ statusMessage: 'No user found' })
                }
                if (results != null) {
                    return res.status(204).json({ statusMessage: 'Completed reset.' });
                }
                if (error) {
                    return res.status(500).json({ statusMessage: 'Unable to complete reset' });
                }
            });

        });
    } catch (error) {
        return next(err);
    }

});


module.exports = app;