const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campgrounds');

mongoose.connect('mongodb://localhost:27017/YelpCAMP')
    .then(() => {
        console.log("Database Connected")
    })
    .catch((err) => {
        console.log("Oh no.!! error")
        console.log(err)

    })
const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async() => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            // Your UserID
            author: '62ab0f82ad4ca7f6686dd646',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,

            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [{
                    url: 'https://res.cloudinary.com/du7kajpgm/image/upload/v1657106726/YelpCamp/tiabzwxvxepupgl4uvzy.jpg',
                    filename: 'YelpCamp/tiabzwxvxepupgl4uvzy',

                },
                {
                    url: 'https://res.cloudinary.com/du7kajpgm/image/upload/v1657106726/YelpCamp/cqsvnawesisr8dvv2q0f.avif',
                    filename: 'YelpCamp/cqsvnawesisr8dvv2q0f',

                },
                {
                    url: 'https://res.cloudinary.com/du7kajpgm/image/upload/v1657106727/YelpCamp/ptwday69x1wsxkyskho3.jpg',
                    filename: 'YelpCamp/ptwday69x1wsxkyskho3',

                }
            ]
        })
        await camp.save();
    }
}
seedDB().then(() => {
    mongoose.connection.close();
});