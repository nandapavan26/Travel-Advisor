if(process.env.NODE_ENV!=="production"){
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const campgroundRoutes= require('./routes/campgrounds');
const reviewRoutes= require('./routes/review');
const usersRoutes = require('./routes/users');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const { join } = require('path');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const db_url= process.env.DB_URL
// 'mongodb://localhost:27017/yelpcamp'
mongoose.connect(db_url,{
    useNewUrlParser:true,
});

const db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error'));
db.once('open',()=>{
    console.log('database connected');
})
mongoose.set('strictQuery',true);
app.engine('ejs',ejsMate);
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.set('views',path.join(__dirname+'/views'));
app.set('view engine','ejs');
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'/public')));

const sessionConfig = {
    secret:'good secret',
    resave:'false',
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires: Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}
app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/',(req,res)=>{
    res.render('home');
})

app.use('/',usersRoutes);
app.use('/campgrounds',campgroundRoutes);
app.use('/campgrounds/:id/reviews',reviewRoutes);



app.all('*',(req,res,next)=>{
    next(new ExpressError('Page Not Found',404));
})

app.use((err,req,res,next)=>{
    const { statusCode = 500, } = err;
    if(!err.message)err.message = 'Oh No,Something Went Wrong!'
    res.status(statusCode).render('error',{ err });
})


app.listen(3000,()=>{
    console.log('server running on poet 3000');
})