if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
console.log(process.env.SECRET)
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const userRoutes = require('./routes/users')

const campgroundRoutes = require('./Routes/campground');
const reviewRoutes = require('./Routes/reviews');


mongoose.connect('mongodb://localhost:27017/YelpCAMP')
    .then(() => {
        console.log("Database Connected")
    })
    .catch((err) => {
        console.log("Oh no.!! error")
        console.log(err)

    })
const app = express();
app.engine('ejs', ejsMate); /* using ejs mate package after requiring it */

app.set('view engine', 'ejs')

app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'Public')))
const sessionConfig = {
    secret: 'thisshouldbetterbeasecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() * 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash())
app.use(passport.initialize()); /* make sure to use session before passport.session */
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); /* just telling passport how to store data in session */
passport.deserializeUser(User.deserializeUser()); /* how to get user out of that session */
app.use((req, res, next) => {
    console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next();
})

//Routes
app.get('/', (req, res) => {
    res.render('home')
})
app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found!!', 404))
})
app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something Went Wrong!!' } = err; /* Default value of status cpde is 500 and message is something went wrong! */
    if (!err.message) err.message = 'Oh no, something went wrong!!'
    res.status(statusCode).render("error", { err })


})

app.listen(3000, () => {
    console.log('Server has started on Port 3000')
})