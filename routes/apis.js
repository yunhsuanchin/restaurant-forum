const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

const adminController = require('../controllers/api/adminController.js')
const categoryController = require('../controllers/api/categoryController')
const userController = require('../controllers/api/userController')

const isAuthenticatedAdmin = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.isAdmin) { return next() }
    return res.json({ status: 'error', message: 'Permission denied.' })
  } else {
    return res.json({ status: 'error', message: 'Permission denied.' })
  }
}

router.get('/admin/restaurants', isAuthenticatedAdmin, adminController.getRestaurants)
router.get('/admin/restaurants/:id', isAuthenticatedAdmin, adminController.getRestaurant)
router.post('/admin/restaurants', isAuthenticatedAdmin, upload.single('image'), adminController.postRestaurant)
router.delete('/admin/restaurants/:id', isAuthenticatedAdmin, adminController.deleteRestaurant)

router.get('/admin/categories', isAuthenticatedAdmin, categoryController.getCategories)

router.post('/signin', userController.signIn)

module.exports = router
