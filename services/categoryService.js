const db = require('../models')
const Category = db.Category

const categoryService = {
  getCategories: async (req, res, callback) => {
    try {
      const id = req.params.id
      const categories = await Category.findAll({ raw: true, nest: true })
      const category = await Category.findByPk(id)
      callback({ categories, category })
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = categoryService
