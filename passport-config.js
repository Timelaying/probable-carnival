const LocalStrategy = require('passport-local').Strategy    // to create the local version of passport
const bcrypt = require('bcrypt')     // we require bycrypt here to make sure that the password entered in the login matches with the one registered 

function initialize (passport, getUserByEmail, getUserById){
    const authenticateUser = async (email, password, done/*the done function will be called when we are DONE*/) =>{
        const user = getUserByEmail(email)    // going to return user by email
        if (user == null){
            return done(null, false, {message: 'NO USER WITH THAT EMAIL OR EMAIL IS WRONG.'}) // if there is no user.
        }

        try {
            if (await bcrypt.compare(password, user.password)/*compares/check password*/){
                return done(null, user, {message: 'Hold on, you will be logged in in a minute'})// return user if our password is right.
            }else{
                return done(null, false, {message: 'password is wrong'})// if the password is wrong or did not match

            }
        } catch (e) {
            return done(e)
            //if there are any other error
        }
    }

    // to use local strategy to create passport
     passport.use(new LocalStrategy({usernameField: 'email'}, /*like the name goes what we use as the username field in the login page, in our case, we use the email, the password is default tho we used password so we are fine*/
     authenticateUser)) // to authnticate user before passport can be given,
  
     // to serialize users passport in session
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => {
         return done(null, getUserById(id))
        }) //to deserialize user paasport 
}

module.exports = initialize  // to export module.