var express = require("express");
var url = require("url");
var cookies = require("cookie-parser");         //middleware (according to lecturer order is important)
var sessions = require("express-session");      //middleware (sessions after cookies)
var credentials = require("../credentials");     //signature seed
var router = express.Router();

//sessions config
router.use(cookies(credentials.cookieSecret));

sessionConfiguration = {
    // Code is slightly adjusted to avoid deprecation warnings when running the code.
    secret: credentials.cookieSecret,
    resave: false,
    saveUninitialized: true,
};
router.use(sessions(sessionConfiguration));

//Login page GET handler
router.get("/login*", function (req, res, next) {
    if (!req.session.attempts) { /*If it doesnt exist, create it*/
        req.session.attempts = 1;
    }
    var query = url.parse(req.url, true).query;
    if (query["user"] != undefined) { // User and password sent via url paramaters...
        //Demo of log in based on url paramaters (not secure at all)
        //as a matter of fact it does not logs you in, it only checks if params are ok
        var user = query["user"] != undefined ? query["user"] : ""
        var password = query["password"] != undefined ? query["password"] : "";
    }

    if (req.session.user_auth) { // the session (cookie) exists!
        var auth = req.session.user_auth //we double check that the session has not been tampered
        var parts = auth.split(' ');
        var buf = new Buffer.from(parts[1], 'base64');
        var login = buf.toString().split(':');
        var user = login[0];
        var password = login[1];
    } else if (auth) {          // Basic Auth Header sent!
        var auth = req.headers.authorization;
        var parts = auth.split(' ');
        var buf = new Buffer.from(parts[1], 'base64');
        var login = buf.toString().split(':');
        var user = login[0];
        var password = login[1];
    }

    //hardcoded for demonstration purposes
    if (user === "admin" && password === "1234") {
        req.session.user_auth = auth; //save the successful submitted authentication during the session, so login is skiped
        console.log("%s\t%s\t%s\t", new Date(), req.ip.substr(7), "OKAUTH", user, req.session.attempts);
        req.session.attempts = 1; //reset attempt counter
        res.cookie("user_firstname", user, { signed: true, });
        next();
    } else {
        console.log("%s\t%s\t%s\t", new Date(), req.ip.substr(7), "NOAUTH", auth);
        res.sendFile("login.html", { root: "./public" });
    }
});

router.get("/login", function (req, res) {
    res.redirect("/"); //redirect to homepage but only after being authenticated before (order of middleware matters)
});

//login for POST log in (POST webform with auth headers)
router.post('/login', function (req, res) {
    if (!req.session.attempts) { /*If it doesnt exist, create it*/
        req.session.attempts = 1;
    }
    var auth = req.headers.authorization;
    var parts = auth.split(' ');
    var buf = new Buffer.from(parts[1], 'base64');
    var login = buf.toString().split(':');
    var user = login[0];
    var password = login[1];

    //hardcoded for demonstration purposes
    if (user === "admin" && password === "1234") {
        req.session.user_auth = auth; //save the successful submitted authentication during the session, so login is skiped
        console.log("%s\t%s\t%s\t", new Date(), req.ip.substr(7), "LOGIN", user, req.session.attempts);
        req.session.attempts = 1; //reset attempt counter
        //this is actually a client side cookie. It will never be sent back to the server. Should not be used to verify accounts
        //This is used to keep a local copy of the user firstname to greet him every time he goes to the home page.
        res.cookie("user_firstname", user, { signed: true, });
        var text = '<script>window.location.replace("./");</script>';
        res.send(text);
    } else {
        console.log("%s\t%s\t%s\t", new Date(), req.ip.substr(7), "WRNGPW", auth, req.session.attempts);
        res.send("Wrong loging attempts " + req.session.attempts++);;
    }
});

router.get('/logout', function (req, res) {
    res.clearCookie('user_firstname'); //might not access client cookies
                                        //but might delete them
    req.session.destroy();
    res.redirect("/");
})


//pure server-client cookies
router.get("/sendMeCookies", function (req, res) {
    res.cookie("path_cookie", "cookie_roads", { path: "/listAllCookies" }); //default path is the current one
    res.cookie("expiring_cookie", "bye_in_1_min", { expires: new Date(Date.now() + 60000) }); //deafult expire is this session
    res.cookie("signed_cookie", "You_can_see_me.But_with_encrypted_signature", { signed: true, }); //default signed is false
    res.send("Cookies sent to client"); //end the request
});
/*
Cookies the client sends back to the server appear in the HTTP request object and can be accessed through req.cookies.
Here, a distinction is made between signed and unsigned cookies:
you can only be sure that the signed cookies have not been tampered with.
*/
router.get("/listAllCookies", function (req, res) {
    console.log("++ unsigned ++");
    console.log(req.cookies); //access a specific cookie
    console.log("++ signed ++");
    console.log(req.signedCookies); //lists all cookies
    res.send();
});
//

module.exports = router;