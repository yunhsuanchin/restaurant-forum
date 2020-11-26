const restController = require('../controllers/restController')
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController')
const passport = require('passport')

module.exports = (app) => {
  const authenticator = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next()
    }
    req.flash('warning_msg', 'Please login first.')
    res.redirect('/signin')
  }
  const isAuthenticatedAdmin = (req, res, next) => {
    if (req.isAuthenticated()) {
      if (req.user.isAdmin) {
        return next()
      }
      req.flash('warning_msg', 'This page can only be accessed by administrators.')
      res.redirect('/signin')
    }
    req.flash('warning_msg', 'This page can only be accessed by administrators.')
    res.redirect('/signin')
  }

  app.get('/', authenticator, (req, res) => res.redirect('/restaurants'))
  app.get('/restaurants', authenticator, restController.getRestaurants)

  app.get('/admin', isAuthenticatedAdmin, (req, res) => res.redirect('/admin/restaurants'))
  app.get('/admin/restaurants', isAuthenticatedAdmin, adminController.getRestaurants)
  app.get('/admin/restaurants/create', adminController.createRestaurantPage)
  app.post('/admin/restaurants', adminController.postRestaurant)
  app.get('/admin/restaurants/:id', adminController.getRestaurant)
  app.get('/admin/restaurants/:id/edit', adminController.editRestaurant)

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
