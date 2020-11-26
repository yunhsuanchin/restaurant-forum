const db = require('../models')
const Restaurant = db.Restaurant

const adminController = {
  getRestaurants: async (req, res) => {
    const restaurants = await Restaurant.findAll({ raw: true })
    res.render('admin/restaurants', { restaurants })
  },
  createRestaurantPage (req, res) {
    res.render('admin/create')
  },
  postRestaurant: async (req, res) => {
    try {
      const newRestaurant = Object.assign({}, req.body)
      if (!newRestaurant.name) {
        req.flash('error_msg', 'Name field is required.')
        return res.redirect('back')
      }
      await Restaurant.create(newRestaurant)
      req.flash('success_msg', 'Successfully create a new restaurant.')
      res.redirect('/admin/restaurants')
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = adminController
