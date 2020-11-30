const restController = require('../controllers/restController')
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController')
const categoryController = require('../controllers/categoryController')
const passport = require('passport')
const multer = require('multer')
const helpers = require('../_helpers')
const upload = multer({ dest: 'uploads/' })

module.exports = (app) => {
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

  app.get('/', authenticator, (req, res) => res.redirect('/restaurants'))
  app.get('/restaurants', authenticator, restController.getRestaurants)

  app.get('/admin', isAuthenticatedAdmin, (req, res) => res.redirect('/admin/restaurants'))
  app.get('/admin/restaurants', isAuthenticatedAdmin, adminController.getRestaurants)
  app.get('/admin/restaurants/create', isAuthenticatedAdmin, adminController.createRestaurantPage)
  app.post('/admin/restaurants', isAuthenticatedAdmin, upload.single('image'), adminController.postRestaurant)
  app.get('/admin/restaurants/:id', isAuthenticatedAdmin, adminController.getRestaurant)
  app.get('/admin/restaurants/:id/edit', isAuthenticatedAdmin, adminController.editRestaurant)
  app.put('/admin/restaurants/:id', isAuthenticatedAdmin, upload.single('image'), adminController.putRestaurant)
  app.delete('/admin/restaurants/:id', isAuthenticatedAdmin, adminController.deleteRestaurant)
  app.get('/admin/users', isAuthenticatedAdmin, adminController.getUsers)
  app.put('/admin/users/:id/toggleAdmin', isAuthenticatedAdmin, adminController.putUsers)
  app.get('/admin/categories', isAuthenticatedAdmin, categoryController.getCategories)
  app.post('/admin/categories', isAuthenticatedAdmin, categoryController.postCategory)

  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp, passport.authenticate('local', {
    failureRedirect: '/signin'
  }), userController.signIn)

  app.get('/signin', userController.signInPage)
  app.post('/signin', passport.authenticate('local', {
    failureRedirect: '/signin',
    failureFlash: true
  }), userController.signIn)
  app.get('/signout', userController.signOut)
}
