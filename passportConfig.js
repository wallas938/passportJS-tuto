const LocalStrategy = require("passport-local").Strategy
const bcrypt = require("bcrypt");

function initialize(passport, getUserByEmail, getUserById) {

    const authenticateUser = async (email, password, done) => {
        const user = getUserByEmail(email);
        console.log(`l'utilisateur recherché: ${user}}`)
        if (user == null) {
            return done(null, false, { message: "No user can be found with that email "})
        }

        try {
            if(await bcrypt.compare(password, user.hashedPassword)) {
                console.log(` Passwords, Real password still hashed: ${user.hashedPassword} // Entered password: ${password}`)
                return done(null, user)
            } else {
                return done(null, false, { message: "Password incorrect" })
            }
        } catch (error) {
            return done(error)
        }
    }

    passport.use(new LocalStrategy(
        { usernameField: "email", passwordField: "password" }
        , authenticateUser));
    passport.serializeUser((user, done) =>  done(null, user.id))
    passport.deserializeUser((id, done) => done(null, getUserById(id)))
}

module.exports = initialize