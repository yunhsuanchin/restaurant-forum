const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const User = db.User
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminController = {
  getRestaurants: async (req, res) => {
    try {
      const restaurants = await Restaurant.findAll({ raw: true, nest: true, include: Category })
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
      const { file } = req
      const restaurant = Object.assign({}, req.body)
      if (!restaurant.name) {
        req.flash('error_msg', 'Name field is required.')
        return res.redirect('back')
      }

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
      } else {
        restaurant.image = null
      }

      await Restaurant.create(restaurant)
      req.flash('success_msg', 'Successfully create a new restaurant.')
      res.redirect('/admin/restaurants')
    } catch (error) {
      console.log(error)
    }
  },
  getRestaurant: async (req, res) => {
    try {
      const id = req.params.id
      const restaurant = await Restaurant.findByPk(id, { include: Category })
      res.render('admin/restaurant', { restaurant: restaurant.toJSON() })
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
    try {
      const id = req.params.id
      await Restaurant.destroy({
        where: { id }
      })
      req.flash('success_msg', 'The restaurant has been removed.')
      res.redirect('/admin/restaurants')
    } catch (error) {
      console.log(error)
    }
  },
  getUsers: async (req, res) => {
    try {
      const users = await User.findAll({ raw: true })
      res.render('admin/users', { users })
    } catch (error) {
      console.log(error)
    }
  },
  putUsers: async (req, res) => {
    try {
      const id = req.params.id
      const user = await User.findByPk(id)
      console.log('user 1', user)
      user.isAdmin = user.isAdmin === false
      console.log('user 2', user)
      await user.save()
      req.flash('success_msg', `${user.name}'s role has been changed to ${user.isAdmin ? 'admin' : 'user'}.`)
      res.redirect('/admin/users')
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = adminController
