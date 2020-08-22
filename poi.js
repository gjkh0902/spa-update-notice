const UpdatePopup = require('.')

const NAME = 'spa-update-notice'

exports.name = NAME

exports.apply = (api, opts = {}) => {
  api.hook('createWebpackChain', config => {
    config.plugin(NAME).use(UpdatePopup, [opts])
  })
}
