const mongoose = require('mongoose');

mongoose.set('strictQuery', true);
mongoose.connect('mongodb+srv://admin:admin@cluster0.d00occ1.mongodb.net/wear365?retryWrites=true&w=majority')
.then(()=>{
    console.log('Congrates, DataBase Connected Successfully')
})
.catch(()=>{
    console.log('Sorry, Unable to Connect with DataBase')
})
