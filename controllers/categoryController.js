const db = require('../models')
const Category = db.Category

const categoryController = {
  getCategories: async (req, res) => {
    try {
      const categories = await Category.findAll({ raw: true, nest: true })
      res.render('admin/categories', { categories })
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = categoryController
