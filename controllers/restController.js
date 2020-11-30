const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category

const restController = {
  getRestaurants: async (req, res) => {
    try {
      const whereQuery = {}
      const categoryId = Number(req.query.categoryId)
      console.log('categoryId', categoryId)
      if (categoryId) {
        console.log('categoryId', categoryId)
        whereQuery.categoryId = categoryId
      }
      const data = await Restaurant.findAll({ include: Category, raw: true, nest: true, where: whereQuery })
      const restaurants = data.map((item) => ({
        ...item,
        categoryName: item.Category.name,
        description: item.description.substring(0, 50)
      }))
      const categories = await Category.findAll({ raw: true, nest: true })
      res.render('restaurants', { restaurants, categories, categoryId })
    } catch (error) {
      console.log(error)
    }
  },
  getRestaurant: async (req, res) => {
    try {
      const id = req.params.id
      const restaurant = await Restaurant.findByPk(id, { include: Category })
      res.render('restaurant', { restaurant: restaurant.toJSON() })
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = restController
