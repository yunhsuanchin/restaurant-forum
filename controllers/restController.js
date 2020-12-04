const helpers = require('../_helpers')
const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const limit = 12

const restController = {
  getRestaurants: async (req, res) => {
    try {
      let offset = 0
      const page = Number(req.query.page) || 1
      const categoryId = Number(req.query.categoryId)
      const whereQuery = {}

      if (page) {
        offset = (page - 1) * limit
      }
      if (categoryId) {
        whereQuery.categoryId = categoryId
      }
      const data = await Restaurant.findAndCountAll({
        include: Category,
        raw: true,
        nest: true,
        where: whereQuery,
        offset,
        limit
      })
      const totalPage = Math.ceil(data.count / limit)
      const prev = page - 1 < 1 ? 1 : page - 1
      const next = page + 1 > totalPage ? totalPage : page + 1
      const pages = Array.from(Array(totalPage)).map((item, index) => index + 1)

      const restaurants = data.rows.map((rest) => ({
        ...rest,
        categoryName: rest.Category.name,
        description: rest.description.substring(0, 50),
        isFavorited: helpers.getUser(req).FavoritedRestaurants.map((item) => item.id).includes(rest.id),
        isLiked: helpers.getUser(req).LikedRestaurants.map((item) => item.id).includes(rest.id)
      }))
      const categories = await Category.findAll({ raw: true, nest: true })
      res.render('restaurants', {
        restaurants,
        categories,
        categoryId,
        totalPage,
        pages,
        page,
        prev,
        next
      })
    } catch (error) {
      console.log(error)
    }
  },
  getRestaurant: async (req, res) => {
    try {
      const id = req.params.id
      const restaurant = await Restaurant.findByPk(id, {
        include: [
          Category,
          { model: Comment, include: User },
          { model: User, as: 'FavoritedUsers' },
          { model: User, as: 'LikedUsers' }
        ]
      })
      const isFavorited = restaurant.FavoritedUsers.map((user) => user.id).includes(helpers.getUser(req).id)
      const isLiked = restaurant.LikedUsers.map((item) => item.id).includes(helpers.getUser(req).id)
      await restaurant.increment('viewCounts', { by: 1 })
      res.render('restaurant', { restaurant: restaurant.toJSON(), isFavorited, isLiked })
    } catch (error) {
      console.log(error)
    }
  },
  getFeeds: async (req, res) => {
    try {
      const restaurants = await Restaurant.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']],
        include: Category
      })
      const comments = await Comment.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']],
        include: [Restaurant, User]
      })
      res.render('feeds', { restaurants, comments })
    } catch (error) {
      console.log(error)
    }
  },
  getDashboard: async (req, res) => {
    try {
      const id = req.params.id
      const restaurant = await Restaurant.findByPk(id, {
        include: [Comment, Category]
      })
      res.render('dashboard', { restaurant: restaurant.toJSON() })
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = restController
