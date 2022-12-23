const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const User = require('../models/user');

router.get('/register',(req,res)=>{
    res.render('users/register')
})

router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', `Welcome ${user.username}`);
            res.redirect('/campgrounds');
        })
    } catch (e) {
        if(e.message==='A user with the given username is already registered')req.flash('error', e.message);
        else req.flash('error','a user exits with this email')
        console.log(e);
        res.redirect('register');
    }
}));

router.get('/login',(req,res)=>{
    res.render('users/login');
})

router.post('/login',passport.authenticate('local',{failureFlash: true,failureRedirect:'/login'}),(req,res)=>{
    req.flash('success',`welcome back, ${req.body.username}`)
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
})

router.get('/logout',(req,res)=>{
    req.logout()
    req.flash('success','Goodbye');
    res.redirect('/campgrounds');
})

module.exports = router;