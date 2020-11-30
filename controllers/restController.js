const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category

const restController = {
  getRestaurants: async (req, res) => {
    try {
      const data = await Restaurant.findAll({ include: Category, raw: true, nest: true })
      const restaurants = data.map((item) => ({
        ...item,
        categoryName: item.Category.name,
        description: item.description.substring(0, 50)
      }))
      res.render('restaurants', { restaurants })
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = restController
