const bcrypt = require('bcryptjs')
const db = require('../models')
const imgur = require('imgur-node-api')
const helpers = require('../_helpers')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },
  signUp: async (req, res, next) => {
    try {
      const { name, email, password, passwordCheck } = req.body
      const user = await User.findOne({ where: { email } })
      if (user) {
        return res.render('signup', { name, email, error_msg: 'This email is already exists.' })
      }

      if (password !== passwordCheck) {
        return res.render('signup', { name, email, error_msg: 'The password does not match.' })
      }

      await User.create({
        name,
        email,
        password: bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
      })
      next()
    } catch (error) {
      console.log(error)
    }
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_msg', 'Welcome!')
    res.redirect('/restaurants')
  },
  signOut: (req, res) => {
    req.logout()
    req.flash('success_msg', 'Bye bye, see you next time.')
    res.redirect('/signin')
  },
  getUser: async (req, res) => {
    try {
      const id = req.params.id
      const user = await User.findByPk(id, {
        include: { model: Comment, include: Restaurant }
      })
      res.render('profile', { user: user.toJSON() })
    } catch (error) {
      console.log(error)
    }
  },
  editUser: async (req, res) => {
    try {
      const id = req.params.id
      if (helpers.getUser(req).id.toString() !== id) {
        req.flash('error_msg', 'Access denied.')
        return res.redirect('/restaurants')
      }
      const user = await User.findByPk(id)
      res.render('edit', { user: user.toJSON() })
    } catch (error) {
      console.log(error)
    }
  },
  putUser: async (req, res) => {
    try {
      const id = req.params.id
      if (helpers.getUser(req).id.toString() !== id) {
        req.flash('error_msg', 'Access denied.')
        return res.redirect('/restaurants')
      }

      const { file } = req
      if (!req.body.name) {
        req.flash('error_msg', 'Name field can not be empty.')
        return res.redirect('back')
      }
      const user = await User.findByPk(id)
      user.name = req.body.name

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
        user.image = img.data.link
      }
      await user.save()
      req.flash('success_msg', 'Successfully updated your profile!')
      res.redirect(`/users/${id}`)
    } catch (error) {
      console.log(error)
    }
  },
  addFavorite: async (req, res) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.restaurantId)
      if (!restaurant) {
        req.flash('error_msg', 'This restaurant does not exists.')
        return res.redirect('back')
      }
      await Favorite.create({
        UserId: helpers.getUser(req).id,
        RestaurantId: req.params.restaurantId
      })
      req.flash('success_msg', `Successfully added "${restaurant.name}" to your favorite!`)
      res.redirect('back')
    } catch (error) {
      console.log(error)
    }
  },
  removeFavorite: async (req, res) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.restaurantId)
      if (!restaurant) {
        req.flash('error_msg', 'This restaurant does not exists.')
        return res.redirect('back')
      }
      await Favorite.destroy({ where: { UserId: helpers.getUser(req).id, RestaurantId: req.params.restaurantId } })
      req.flash('success_msg', `Successfully removed "${restaurant.name} from your favorite!"`)
      res.redirect('back')
    } catch (error) {
      console.log(error)
    }
  },
  likeRestaurant: async (req, res) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.restaurantId)
      if (!restaurant) {
        req.flash('error_msg', 'This restaurant does not exists.')
        return res.redirect('back')
      }
      const LikedRestaurants = await Like.findAll({
        raw: true,
        nest: true,
        where: { UserId: helpers.getUser(req).id }
      })
      if (LikedRestaurants.map((item) => item.RestaurantId).includes(req.params.restaurantId)) return

      await Like.create({
        UserId: helpers.getUser(req).id,
        RestaurantId: req.params.restaurantId
      })
      req.flash('success_msg', `You just liked "${restaurant.name}"!`)
      res.redirect('back')
    } catch (error) {
      console.log(error)
    }
  },
  unlikeRestaurant: async (req, res) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.restaurantId)
      if (!restaurant) {
        req.flash('error_msg', 'This restaurant does not exists.')
        return res.redirect('back')
      }
      await Like.destroy({ where: { UserId: helpers.getUser(req).id, RestaurantId: req.params.restaurantId } })
      req.flash('success_msg', `You already unliked "${restaurant.name}."`)
      res.redirect('back')
    } catch (error) {
      console.log(error)
    }
  },
  getTopUser: async (req, res) => {
    try {
      let users = await User.findAll({
        include: [
          { model: User, as: 'Followers' }
        ]
      })
      users = users.map((user) => ({
        ...user.dataValues,
        FollowerCount: user.Followers.length,
        isFollowed: helpers.getUser(req).Followings.map((item) => item.id).includes(user.id)
      }))
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      res.render('topUser', { users })
    } catch (error) {
      console.log(error)
    }
  },
  addFollowing: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.userId)
      if (!user) {
        req.flash('error_msg', 'This user does not exists.')
        return res.redirect('back')
      }
      await Followship.create({
        FollowerId: helpers.getUser(req).id,
        FollowingId: req.params.userId
      })
      req.flash('success_msg', `You have followed ${user.name}!`)
      res.redirect('back')
    } catch (error) {
      console.log(error)
    }
  },
  removeFollowing: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.userId)
      if (!user) {
        req.flash('error_msg', 'This user does not exists.')
        return res.redirect('back')
      }
      await Followship.destroy({
        where: { FollowerId: helpers.getUser(req).id, FollowingId: req.params.userId }
      })
      req.flash('success_msg', `You have unfollowed ${user.name}.`)
      res.redirect('back')
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = userController
