if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}


const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const ejsMate = require('ejs-mate');

const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./Utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const userRoutes = require('./Routes/users')

const campgroundRoutes = require('./Routes/campground');
const reviewRoutes = require('./Routes/reviews');
const MongoStore = require('connect-mongo');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/YelpCAMP';
// 'mongodb://localhost:27017/YelpCAMP'
mongoose.connect(dbUrl)
    .then(() => {
        console.log("Database Connected")
    })
    .catch((err) => {
        console.log("Oh no.!! error")
        console.log(err)

    });
const app = express();
app.engine('ejs', ejsMate); /* using ejs mate package after requiring it */

app.set('view engine', 'ejs')

app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'Public')));
app.use(mongoSanitize({
    replaceWith: '_'
}));
const secret = process.env.SECRET || 'thisshouldbetterbeasecret!';
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});
store.on("error", function(e) {
    console.log('SESSION STORE ERROR', (e))
})
const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() * 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
// app.use(helmet());
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dv5vm4sqh/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dv5vm4sqh/"
];
const connectSrcUrls = [
    "https://*.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://events.mapbox.com",
    "https://res.cloudinary.com/dv5vm4sqh/"
];
const fontSrcUrls = ["https://res.cloudinary.com/dv5vm4sqh/"];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/du7kajpgm/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
            mediaSrc: ["https://res.cloudinary.com/dv5vm4sqh/"],
            childSrc: ["blob:"]
        }
    })
);
app.use(passport.initialize()); /* make sure to use session before passport.session */
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); /* just telling passport how to store data in session */
passport.deserializeUser(User.deserializeUser()); /* how to get user out of that session */
app.use((req, res, next) => {
    console.log(req.query)
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
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server has started on Port ${port}`)
})