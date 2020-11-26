const db = require('../models')
const Restaurant = db.Restaurant

const adminController = {
  getRestaurants: async (req, res) => {
    try {
      const restaurants = await Restaurant.findAll({ raw: true })
      res.render('admin/restaurants', { restaurants })
    } catch (error) {
      console.log(error)
    }
  },
  createRestaurantPage: (req, res) => {
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
  },
  getRestaurant: async (req, res) => {
    try {
      const id = req.params.id
      const restaurant = await Restaurant.findByPk(id, { raw: true })
      res.render('admin/restaurant', { restaurant })
    } catch (error) {
      console.log(error)
    }
  },
  editRestaurant: async (req, res) => {
    try {
      const id = req.params.id
      const restaurant = await Restaurant.findByPk(id, { raw: true })
      res.render('admin/create', { restaurant })
    } catch (error) {
      console.log(error)
    }
  },
  putRestaurant: async (req, res) => {
    try {
      const id = req.params.id
      if (!req.body.name) {
        req.flash('error_msg', 'Name field is required.')
        return res.redirect('back')
      }
      let restaurant = await Restaurant.findByPk(id)
      restaurant = Object.assign(restaurant, req.body)
      await restaurant.save()
      res.redirect('/admin/restaurants')
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = adminController
