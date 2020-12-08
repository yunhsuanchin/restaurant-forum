const db = require('../models')
const imgur = require('imgur-node-api')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const Restaurant = db.Restaurant
const Category = db.Category
const User = db.User
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const adminService = require('../services/adminService')

const adminController = {
  getRestaurants: (req, res) => {
    adminService.getRestaurants(req, res, (data) => {
      return res.render('admin/restaurants', data)
    })
  },
  createRestaurantPage: async (req, res) => {
    try {
      const categories = await Category.findAll({ raw: true, nest: true })
      res.render('admin/create', { categories })
    } catch (error) {
      console.log(error)
    }
  },
  postRestaurant: (req, res) => {
    adminService.postRestaurant(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      }
      req.flash('success_messages', data['message'])
      res.redirect('/admin/restaurants')
    })
  },
  getRestaurant: async (req, res) => {
    adminService.getRestaurant(req, res, (data) => {
      return res.render('admin/restaurant', data)
    })
  },
  editRestaurant: async (req, res) => {
    try {
      const id = req.params.id
      const restaurant = await Restaurant.findByPk(id)
      const categories = await Category.findAll({ raw: true, nest: true })
      res.render('admin/create', { restaurant: restaurant.toJSON(), categories })
    } catch (error) {
      console.log(error)
    }
  },
  putRestaurant: async (req, res) => {
    try {
      const { file } = req
      const id = req.params.id
      if (!req.body.name) {
        req.flash('error_msg', 'Name field is required.')
        return res.redirect('back')
      }
      let restaurant = await Restaurant.findByPk(id)
      restaurant = Object.assign(restaurant, req.body)

      if (file) {
        imgur.setClientID(IMGUR_CLIENT_ID)
        const imgurUpload = new Promise((resolve, reject) => {
          imgur.upload(file.path, (err, img) => {
            if (err) {
              return reject(err)
            }
            return resolve(img)
          })
        })
        const img = await imgurUpload
        restaurant.image = img.data.link
        // const data = fs.readFileSync(file.path)
        // fs.writeFileSync(`upload/${file.originalname}`, data)
        // restaurant.image = `/upload/${file.originalname}`
      }
      await restaurant.save()
      req.flash('success_msg', 'The restaurant has been updated.')
      res.redirect('/admin/restaurants')
    } catch (error) {
      console.log(error)
    }
  },
  deleteRestaurant: async (req, res) => {
    adminService.deleteRestaurant(req, res, (data) => {
      if (data['status'] === 'success') {
        return res.redirect('/admin/restaurants')
      }
    })
  },
  getUsers: async (req, res) => {
    try {
      const users = await User.findAll({ raw: true, nest: true })
      res.render('admin/users', { users })
    } catch (error) {
      console.log(error)
    }
  },
  toggleAdmin: async (req, res) => {
    try {
      const id = req.params.id
      const user = await User.findByPk(id)
      if (!user) {
        req.flash('error_msg', 'This user has not been registered.')
        return res.redirect('/admin/users')
      }
      user.isAdmin = user.isAdmin === false
      await user.save()
      req.flash('success_msg', `${user.name}'s role has been changed to ${user.isAdmin ? 'admin' : 'user'}.`)
      res.redirect('/admin/users')
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = adminController
