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
  },
  postCategory: async (req, res) => {
    try {
      const name = req.body.name
      if (!name) {
        req.flash('error_msg', 'Name field can not be empty.')
        return res.redirect('back')
      }
      Category.create({ name })
      res.redirect('/admin/categories')
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = categoryController
