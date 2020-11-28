const restController = require('../controllers/restController')
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController')
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
  app.post('/admin/restaurants', upload.single('image'), adminController.postRestaurant)
  app.get('/admin/restaurants/:id', adminController.getRestaurant)
  app.get('/admin/restaurants/:id/edit', adminController.editRestaurant)
  app.put('/admin/restaurants/:id', upload.single('image'), adminController.putRestaurant)
  app.delete('/admin/restaurants/:id', adminController.deleteRestaurant)

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
