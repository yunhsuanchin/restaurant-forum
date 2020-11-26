const bcrypt = require('bcryptjs')
const db = require('../models')
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
  }
}

module.exports = userController
