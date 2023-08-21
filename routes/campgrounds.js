const express= require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const { campgroundSchema  } = require('../schemas');
const { isLoggedIn,isAuthor,validateCampground } = require('../middleware');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = 'pk.eyJ1IjoibmFuZGFwYXZhbjI2IiwiYSI6ImNsYmhpa3UxZDAwenczdnA4Y2cwNzRub2sifQ.Tt7Kx97YOZhdcYIQ_R1Dpg';
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

router.get('/',catchAsync(async (req,res)=>{
    let campgrounds=[];
    let used=false,result=true;
    let name=req.query.search;
    if(req.query.search){
        used=true;
        const campground1=await Campground.find({search_title:name.toLowerCase()});
        const campground2 = await Campground.find({location:name});
        campgrounds=campgrounds.concat(campground1).concat(campground2);
    }
    if(campgrounds.length==0){campgrounds = await Campground.find({});result=false;}
    res.render('campgrounds/index',{campgrounds,used,result,name});
}))

router.get('/new',isLoggedIn,(req,res)=>{
    res.render('campgrounds/new');
})

router.post('/',isLoggedIn,validateCampground,catchAsync(async (req,res)=>{
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    console.log(geoData.body.features[0].geometry);
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.search_title=req.body.campground.title.toLowerCase();
    const {location }=req.body.campground;
    campground.author = req.user._id;
    await campground.save();

    req.flash('success','Sucessfully made a new campground!')
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.get('/:id', isLoggedIn,catchAsync(async(req,res) => {
    var Id_error = 0
    var campground
 
    try{
        campground = await Campground.findById(req.params.id).populate({
            path: 'author',
            strictPopulate: false
        }).populate({path: 'reviews', populate: 'author'})
        console.log(campground);
    }
    catch(err){
        if (err.kind === 'ObjectId') Id_error = 1
    }
    
    if (!campground || Id_error == 1){
        req.flash('error','Cannot find  that campground!')
        return res.redirect('/campgrounds') 
    }
    res.render('campgrounds/show', {campground})
}))



router.get('/:id/edit',isLoggedIn,isAuthor,catchAsync(async (req,res)=>{  
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground)
    {
        req.flash('error','Cannot find that campground');
        return res.redirect(`/campgrounds`);
    }
    res.render('campgrounds/edit',{ campground });
}))

router.put('/:id',isLoggedIn,isAuthor,validateCampground,catchAsync(async (req,res)=>{
    const { id } = req.params;
    const campground  = await Campground.findByIdAndUpdate(id,req.body.campground);
    req.flash('success','successfully updated camground!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:id',isLoggedIn,isAuthor,catchAsync(async (req,res)=>{
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    req.flash('success','Sucessfully deleted campground');
    res.redirect('/campgrounds');
}))

module.exports = router;