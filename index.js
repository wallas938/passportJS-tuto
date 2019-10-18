if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}

const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const bcrypt = require("bcrypt");
const uuidV1 = require("uuid/v1");
const users = [{
    id: 'b694a1e0-f0e2-11e9-a190-f1a7382e6d1f',
    name: 'Storm93',
    email: 'sandstorm8493@gmail.com',
    hashedPassword: '$2b$10$BJ/RtPIG6NR/7qUvgOMV5.cxUBmTvZutqCgzm62Jz7k2BmPrgVj8q'
}];
const passport = require("passport");
const initializePassport = require("./passportConfig.js");
const falsh = require("express-flash")
const session = require("express-session")
const methodOverride = require("method-override");

app.use(falsh());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));
app.use(express.urlencoded({
    extended: false
}))
app.use(["/login", "/register"], checkNotAuthenticated);

app.set('view-engine', 'ejs');

initializePassport(passport, getUserByEmail, getUserById);

app.delete('/logout', (req, res, next) => {
    req.logOut();
    res.redirect('/login');
})

app.get('/login', (req, res, next) => {
    res.render("login.ejs")
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
}));

app.get('/register', (req, res, next) => {
    res.render("register.ejs")
});

app.post('/register', async (req, res, next) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        users.push({
            id: uuidV1(),
            name: req.body.name,
            email: req.body.email,
            hashedPassword
        })
        res.redirect('/login');
    } catch {
        res.redirect('/register');
    }
});

app.get('/profile', checkAuthenticated, (req, res, next) => {
    res.render("profile.ejs", {
        name: req.user.name
    })
});

app.get('*', (req, res, next) => {
    res.redirect("/login")
});

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect("/login")
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect("/profile");
        return false;
    }
    
        return next();
}

//function 

function getUserByEmail(email) {
    return users.find(user => email === user.email)
}

function getUserById(id) {
    return users.find(user => id === user.id)
}

app.listen(PORT, () => console.log("Server is running on: " + PORT));