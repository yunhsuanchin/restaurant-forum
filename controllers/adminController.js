const db = require('../models')
const Restaurant = db.Restaurant

const adminController = {
  getRestaurants: async (req, res) => {
    const restaurants = await Restaurant.findAll({ raw: true })
    res.render('admin/restaurants', { restaurants })
  }
}

module.exports = adminController
