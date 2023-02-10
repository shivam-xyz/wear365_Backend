require('../db/connections')
const mongoose = require('mongoose');
const { userSchema, restaurantSchema, menuSchema, orderSchema } = require('../schemas/schemas');


const User = new mongoose.model('User', userSchema);
const Restaurant = new mongoose.model('Restaurant', restaurantSchema)
const Menu = new mongoose.model('Menu', menuSchema)
const Order = new mongoose.model('Order', orderSchema)

module.exports = { User, Restaurant, Menu, Order }