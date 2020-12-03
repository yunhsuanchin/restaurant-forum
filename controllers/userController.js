const bcrypt = require('bcryptjs')
const db = require('../models')
const imgur = require('imgur-node-api')
const helpers = require('../_helpers')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const User = db.User

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
      const user = await User.findByPk(id)
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
  }
}

module.exports = userController
