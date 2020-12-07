const express = require('express')
const router = express.Router()
const passport = require('passport')

const restController = require('../controllers/restController')
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController')
const categoryController = require('../controllers/categoryController')
const commentController = require('../controllers/commentController')
const multer = require('multer')
const helpers = require('../_helpers')
const upload = multer({ dest: 'uploads/' })

const authenticator = (req, res, next) => {
  if (helpers.ensureAuthenticated(req)) {
    return next()
  }
  req.flash('warning_msg', 'Please login first.')
  res.redirect('/signin')
}
const isAuthenticatedAdmin = (req, res, next) => {
  if (helpers.ensureAuthenticated(req)) {
    if (helpers.getUser(req).isAdmin) {
      return next()
    }
    req.flash('warning_msg', 'This page can only be accessed by administrators.')
    return res.redirect('/signin')
  }
  req.flash('warning_msg', 'This page can only be accessed by administrators.')
  res.redirect('/signin')
}

router.get('/', authenticator, (req, res) => res.redirect('/restaurants'))
router.get('/restaurants', authenticator, restController.getRestaurants)
router.get('/restaurants/feeds', authenticator, restController.getFeeds)
router.get('/restaurants/top', authenticator, restController.getTopRestaurant)
router.get('/restaurants/:id', authenticator, restController.getRestaurant)
router.get('/restaurants/:id/dashboard', authenticator, restController.getDashboard)

router.post('/comments', authenticator, commentController.postComment)
router.delete('/comments/:id', isAuthenticatedAdmin, commentController.deleteComment)

router.get('/admin', isAuthenticatedAdmin, (req, res) => res.redirect('/admin/restaurants'))
router.get('/admin/restaurants', isAuthenticatedAdmin, adminController.getRestaurants)
router.get('/admin/restaurants/create', isAuthenticatedAdmin, adminController.createRestaurantPage)
router.post('/admin/restaurants', isAuthenticatedAdmin, upload.single('image'), adminController.postRestaurant)
router.get('/admin/restaurants/:id', isAuthenticatedAdmin, adminController.getRestaurant)
router.get('/admin/restaurants/:id/edit', isAuthenticatedAdmin, adminController.editRestaurant)
router.put('/admin/restaurants/:id', isAuthenticatedAdmin, upload.single('image'), adminController.putRestaurant)
router.delete('/admin/restaurants/:id', isAuthenticatedAdmin, adminController.deleteRestaurant)
router.get('/admin/users', isAuthenticatedAdmin, adminController.getUsers)
router.put('/admin/users/:id/toggleAdmin', isAuthenticatedAdmin, adminController.toggleAdmin)
router.get('/admin/categories', isAuthenticatedAdmin, categoryController.getCategories)
router.get('/admin/categories/:id', isAuthenticatedAdmin, categoryController.getCategories)
router.post('/admin/categories', isAuthenticatedAdmin, categoryController.postCategory)
router.put('/admin/categories/:id', isAuthenticatedAdmin, categoryController.putCategory)
router.delete('/admin/categories/:id', isAuthenticatedAdmin, categoryController.deleteCategory)

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp, passport.authenticate('local', {
  failureRedirect: '/signin'
}), userController.signIn)

router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', {
  failureRedirect: '/signin',
  failureFlash: true
}), userController.signIn)
router.get('/signout', userController.signOut)

router.get('/users/top', authenticator, userController.getTopUser)
router.get('/users/:id', authenticator, userController.getUser)
router.get('/users/:id/edit', authenticator, userController.editUser)
router.put('/users/:id', authenticator, upload.single('image'), userController.putUser)

router.post('/favorite/:restaurantId', authenticator, userController.addFavorite)
router.delete('/favorite/:restaurantId', authenticator, userController.removeFavorite)

router.post('/like/:restaurantId', authenticator, userController.likeRestaurant)
router.delete('/like/:restaurantId', authenticator, userController.unlikeRestaurant)

router.post('/following/:userId', authenticator, userController.addFollowing)
router.delete('/following/:userId', authenticator, userController.removeFollowing)

module.exports = router
