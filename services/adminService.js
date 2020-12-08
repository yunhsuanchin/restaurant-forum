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
  getRestaurants: async (req, res, cbFunc) => {
    try {
      const restaurants = await Restaurant.findAll({ raw: true, nest: true, include: Category })
      cbFunc({ restaurants })
    } catch (error) {
      console.log(error)
    }
  },
  getRestaurant: async (req, res, cbFunc) => {
    try {
      const id = req.params.id
      const restaurant = await Restaurant.findByPk(id, { include: Category })
      cbFunc({ restaurant: restaurant.toJSON() })
    } catch (error) {
      console.log(error)
    }
  },
  deleteRestaurant: async (req, res, cbFunc) => {
    try {
      const id = req.params.id
      await Restaurant.destroy({
        where: { id }
      })
      cbFunc({ status: 'success', message: '' })
    } catch (error) {
      console.log(error)
    }
  },
  postRestaurant: async (req, res, cbFunc) => {
    try {
      const { file } = req
      const restaurant = Object.assign({}, req.body)
      if (!restaurant.name) {
        return cbFunc({
          status: 'error', message: 'name does not exist. '
        })
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
      cbFunc({ status: 'success', message: 'Successfully create a new restaurant.' })
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = adminService
