const moment = require('moment')

module.exports = {
  indexCount (value, options) {
    return parseInt(value) + 1
  },
  isAdmin (value, option) {
    return value ? 'admin' : 'user'
  },
  adminToggle (value, option) {
    return value ? 'user' : 'admin'
  },
  ifEqual (oldValue, newValue, options) {
    if (oldValue === newValue) {
      return options.fn(this)
    } else {
      return options.inverse(this)
    }
  },
  moment (value) {
    return moment(value).fromNow()
  }
}
