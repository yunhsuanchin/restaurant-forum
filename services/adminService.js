const db = require('../models')
const imgur = require('imgur-node-api')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const Restaurant = db.Restaurant
const Category = db.Category
const User = db.User
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminService = {
  getRestaurants: async (req, res, callback) => {
    try {
      const restaurants = await Restaurant.findAll({ raw: true, nest: true, include: Category })
      callback({ restaurants })
    } catch (error) {
      console.log(error)
    }
  },
  getRestaurant: async (req, res, callback) => {
    try {
      const id = req.params.id
      const restaurant = await Restaurant.findByPk(id, { include: Category })
      callback({ restaurant: restaurant.toJSON() })
    } catch (error) {
      console.log(error)
    }
  },
}

module.exports = adminService
