var express = require("express");
var url = require("url");
var cookies = require("cookie-parser");         //middleware (according to lecturer order is important)
var sessions = require("express-session");      //middleware (sessions after cookies)
var credentials = require("../credentials");     //signature seed
var validator = require('validator');
var SqlString = require('sqlstring');

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

var isBruteForce = function(req){
    if (!req.session.attempts){
        req.session.attempts = 1;
    }
const maxAttempts = 5;
return (req.session.attempts>maxAttempts);
}

//GET handler for pages that require authentication (does not create a new session)
router.get("/auth*", function (req, res, next) {

    if (isBruteForce(req)){
        //return so the function stops here (because even though we close the send-request cycle, javascript will continue to execute the rest of the code, sending to responses will give a header error)
        return res.send("Too many wrong logging attempts. Account blocked (till the end of the session). To do: update a database field instead and not rely on session data (can be changed by user)");
    }

    // the session (cookie) exists!
    if (req.session.user_auth) {
        var auth = req.session.user_auth
        var parts = auth.split(' ');
        var buf = new Buffer.from(parts[1], 'base64');
        var login = buf.toString().split(':'); 
        var user = login[0];
        var password = login[1];
    }

    //Auth based on url paramaters (overwrite session, that's the intention after all). Does not log you in, only would confirm if credentials match
    var query = url.parse(req.url, true).query;
    if (query["user"] != undefined) {
        var user = query["user"] != undefined ? query["user"] : ""
        var password = query["password"] != undefined ? query["password"] : "";
    }

    //GET credential validation
    if (!user){
        res.sendFile("login.html", { root: "./public" });
    } else if (!validator.isEmail(user)){
        res.send("<script>window.location.replace('?message=Invalid email');</script>"); //to do: replace with dom
    } else if (SqlString.escape(user) === "'admin@lu2.com'" && SqlString.escape(password) === "'1234'") { //hardcoded for demonstration purposes
        //no sessions are created with GET requests
        console.log("%s\t%s\t%s\t%s\t", new Date(), req.ip.substr(7), "OKAUTH", user);
        next();
    } else { //wrong (or expried) credentials, therefore delete the session
        req.session.destroy();
        console.log("%s\t%s\t%s\t%s\t", new Date(), req.ip.substr(7), "NOAUTH", auth);
        res.sendFile("login.html", { root: "./public" });
    }
});

router.get("/login", function (req, res) {
    if (!req.session.user_auth){
        res.sendFile("login.html", { root: "./public" });
    } else {
        res.redirect('/');
    }
});

//login for POST log in (POST webform with auth headers)
router.post('/login', function (req, res, next) {

    if (isBruteForce(req)){
        return res.send("Too many wrong logging attempts."); //returning ensures taht the rest of the code is not executed
    }

    var auth = req.headers.authorization;
    var parts = auth.split(' ');
    var buf = new Buffer.from(parts[1], 'base64');
    var login = buf.toString().split(':');
    var user = login[0];
    var password = login[1];

    //POST credential validation    
    if (!validator.isEmail(""+user)){ //input validation
        res.send("<script>window.location.replace('?message=Invalid email');</script>"); //this is actually bad practice, a malicious user couuld change the content of the message and try to deceive a victim by looking as if the original website produced the modified message (i.e. the malicious user could have as message 'There is a problem with your account, go to "malicious website" to try to login again'. A better practice would just to append the message via DOM features)
    } else if (SqlString.escape(user) === "'admin@lu2.com'" && SqlString.escape(password) === "'1234'") {
        req.session.user_auth = auth; //update session cokie with basic auth headers
        console.log("%s\t%s\t%s\t%s\t", new Date(), req.ip.substr(7), "LOGIN", user, req.session.attempts);
        req.session.attempts = 0; //reset attempt counter
        res.cookie("user_nickname", user, { signed: true,  secure: false}); //trivial cookie... signed to check origniality, if secure is true then it will only be sent via https
        next();
    } else {
        console.log("%s\t%s\t%s\t%s\t", new Date(), req.ip.substr(7), "WRNGPW", auth, req.session.attempts);
        res.send("<script>window.location.replace('?message=" + "Wrong loging attempts: " + req.session.attempts++ + "');</script>");
    }
});

//after the login has been successful, redirect to the page for which auth was required (or home page)
router.post('/login', function (req, res) {
    var query = url.parse(req.url, true).query;
    if (!query["redirect"].includes('/login') && query["redirect"] != undefined){
        res.send("<script>window.location.replace('"+query["redirect"]+"');</script>");
    } else {
        res.send("<script>window.location.replace('/');</script>");
    }
});

router.get('/logout', function (req, res) {
    res.clearCookie('user_nickname'); //we only delete this greeting cookie, but we might keep others such as "dark mode ON" preference even after logging out
    req.session.destroy();
    res.send("<script>localStorage.removeItem('visited');window.location.replace('/');</script>");
});

/*
Cookies the client sends back to the server appear in the HTTP request object and can be accessed through req.cookies.
Here, a distinction is made between signed and unsigned cookies:
you can only be sure that the signed cookies have not been tampered with.
*/
router.get("/cookies", function (req, res) {
    res.cookie("path_cookie", "cookie_roads", {domain: 'localhost', path: '/take_me_home'}); //default path is the current one
    res.cookie("expiring_cookie", "bye_in_1_min", { expires: new Date(Date.now() + 60000) }); //deafult expire is this session
    res.cookie("signed_cookie", "You_can_see_me.But_with_encrypted_signature", { signed: true }); //default signed is false
    res.send("<script>alert('Cookies sent');</script>"); //end the request
    //we can run more code after res.send (as long as we do not send more responses to the client)
    console.log("++ unsigned ++");
    console.log(req.cookies); //access a specific cookie
    console.log("++ signed ++");
    console.log(req.signedCookies); //lists all cookies
});

router.get("/fresh", function (req, res) {
    //delete session (stuff, but not the id itself)
    req.session.destroy();
    res.clearCookie('connect.sid');
    //delete cookies
    res.clearCookie('user_nickname');
    res.clearCookie('path_cookie', {domain: 'localhost', path: '/take_me_home'});
    res.clearCookie('expiring_cookie');
    res.clearCookie('signed_cookie');
    res.send("<script>alert('Cookies deleted');</script>"); //end the request
});

module.exports = router;