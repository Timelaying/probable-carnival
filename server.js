if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}// loading our environment variable

const express = require('express') // for express our application server
const app = express()  // app variale from express
const bcrypt = require('bcrypt') // for password hashing
const passport = require('passport') // for passport
const flash = require('express-flash') // to display error messages
const session = require('express-session') // to persist our user after loging in to presist in every page.
const methodOverride = require('method-override') // to use method-override

// importing passport-config
const initializePassport = require('./passport-config') // require the passport-config file; giving it initializePassport name
initializePassport(passport,             //user is an instance of users
    email => users.find(user => user.email === email), // this is where we check for the email inputed in the login page if it is in the database, we did the password check in passport-config
    id => users.find(user => user.id === id)
)

const users = [] // local variable database to store data gotten from the POST forms since we dont have a databse

app.set('view-engine', 'ejs') // to use views in ejs
app.use(express.urlencoded({extended: false})) // to access information from the forms
app.use(flash()) // to use flash
app.use(session({ 
    secret: process.env.SESSION_SECRET, // to keep our session secret with a key, we used SESSION_SECRET as our key ... we write the rest in the (.env)
    resave: false, //if nothing has changed, we dont want to save anything
    saveUninitialized: false // if there is nothing saved, then this dosent save anything. i.e if it is empty
})) // to use session
app.use(passport.initialize()) // to use passport
app.use(passport.session()) // to use passport and session
app.use(methodOverride('_method')) //_method is what we want our override to be in index.ejs form action.


app.get('/', checkAuthenticated,(req, res) => { // checkAunthenticated is a function below to check if it is authenticated
    res.render('index.ejs', {name: req.user.name})  //{name: req.user.name} is to display name...
})  //'/' is the first.default page..

app.get('/login', alreadyAuthenticated, (req, res) => {    // alreadyAuthenticated redirect to the index page if we are alredy logged in
    res.render('login.ejs')
}) // route to login view  i.e localhost:5000/login

app.post('/login', alreadyAuthenticated, passport.authenticate('local', {  //passport authentication middle-ware... lets us use the passport
    successRedirect: '/',   //if login and passsport is successful, go to the '/' page, which is the home page
    failureRedirect: '/login', // send them back to the login
    failureFlash: true // the error messages we used in passport-config
}))

app.get('/register', alreadyAuthenticated, (req, res) => {
    res.render('register.ejs')
}) // route to register view, i.e localhost:5000/register

app.post('/register', alreadyAuthenticated, async (req, res) => {     // we use async for asynchronous fuctions like await bcrypt
    // we want to create a hashed password, the process is asychronuous
    // since it is asynchronous, we use a try & catch block. and we use await
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10) //create a variable hashed password, the (10) is how secured we want it to be
        users.push({
            id: Date.now().toString(), // to generate an id, if we had a database this would not be needed
            name: req.body.name, // to get the name
            email: req.body.email,
            password: hashedPassword // the password are stored in hashed password
        }) // push a new user, after saving its details
        res.redirect('/login') // redirect to the login page if the registration was successful. 

    } catch{
        // if there is a faliure we want them to be redirected to the register page
        res.redirect('/register')
    }
 })

// to log out... we create delete request and use method-overide in index.ejs form
app.delete('/logout', (req, res) => {
    req.logOut()    // log out function is set automatically
    res.redirect('/login')
})


// to protect session when we are not logged in, this is done with this middleware function
function checkAuthenticated(req, res, next) {
     if (req.isAuthenticated()){
         return next() // if the users is authenticated, move to the next thing.
     }else{
         res.redirect('/login') //else redirect them to the login page
     }
 }
// to persist the session of the user so they dont go back to the login page after authentication.
function alreadyAuthenticated(req, res, next) {
    if (req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}


app.listen(5000)    // now our local host listen to this port

// anytime whe save the app the the users array becomes reset to empty because we have no database