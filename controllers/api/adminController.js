const db = require('../../models')
const Restaurant = db.Restaurant
const Category = db.Category
const adminController = {
  getRestaurants: async (req, res) => {
    try {
      const restaurants = await Restaurant.findAll({
        aw: true,
        nest: true,
        include: Category
      })
      res.json({ restaurants })
    } catch (error) {
      console.log(error)
    }
  }
}
module.exports = adminController
