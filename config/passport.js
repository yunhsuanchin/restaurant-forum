const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Restaurant = db.Restaurant

module.exports = app => {
  app.use(passport.initialize())
  app.use(passport.session())

  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  }, async (req, email, password, done) => {
    try {
      const user = await User.findOne({ where: { email } })
      if (!user) {
        return done(null, false, req.flash('error_msg', 'This email has not been registered.'))
      }
      if (!bcrypt.compareSync(password, user.password)) {
        return done(null, false, req.flash('error_msg', 'The password does not match.'))
      }
      return done(null, user)
    } catch (error) {
      console.log(error)
    }
  }))

  passport.serializeUser((user, done) => {
    done(null, user.id)
  })
  passport.deserializeUser(async (id, done) => {
    try {
      let user = await User.findByPk(id, {
        include: [
          { model: Restaurant, as: 'FavoritedRestaurants' },
          { model: Restaurant, as: 'LikedRestaurants' },
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' }
        ]
      })
      user = user.toJSON()
      return done(null, user)
    } catch (error) {
      console.log(error)
    }
  })
}
