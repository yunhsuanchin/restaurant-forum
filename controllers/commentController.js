const db = require('../models')
const Comment = db.Comment
const Restaurant = db.Restaurant

const commentController = {
  postComment: async (req, res) => {
    try {
      const { content, RestaurantId } = req.body
      await Comment.create({
        content,
        RestaurantId,
        UserId: req.user.id
      })
      const restaurant = await Restaurant.findByPk(RestaurantId)
      req.flash('success_msg', `Successfully comment on ${restaurant.name}!`)
      res.redirect(`/restaurants/${RestaurantId}`)
    } catch (error) {
      console.log(error)
    }
  },
  deleteComment: async (req, res) => {
    try {
      const id = req.params.id
      await Comment.destroy({ where: { id } })
      req.flash('success_msg', 'Successfully delete!')
      res.redirect('back')
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = commentController
