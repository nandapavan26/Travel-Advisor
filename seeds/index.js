const cities = require('./cities');
const { places,descriptors } = require('./seedHelper');
const {images} = require('./images');
const mongoose = require('mongoose');
const Campground = require('../models/campground');
const campground = require('../models/campground');
mongoose.connect('mongodb://localhost:27017/yelpcamp',{
    useNewUrlParser:true
});

const db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error'));
db.once('open',()=>{
    console.log('database connected');
})

const sample = (array)=>{
    return array[Math.floor(Math.random()*array.length)];
}

const seedDb = async ()=>{
    await Campground.deleteMany({});
    for(let i=0;i<50;i++){
        const random1000 =Math.floor(Math.random()*1000);
        const random25 =Math.floor(Math.random()*25);
        const random20 =Math.floor(Math.random()*20)+2.50;
        const name = `${sample(descriptors)} ${sample(places)}`;
        const camp = new Campground({
            location:`${cities[random1000].city}, ${cities[random1000].state}`,
            title:name,
            image:`${images[random25]}`,
            description:'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            price: random20,
            geometry:{
                type:"Point",
                coordinates:[-113.1331,47.0202]
            },
            search_title:name.toLowerCase(),
            search_city:cities[random1000].city.toLowerCase(),
            search_location:cities[random1000].state.toLowerCase(),
            author:'63a537b2b3e1b5df612f416f'
        })
        await camp.save();
    }
}

seedDb();