const {Sequelize} = require('sequelize')

module.exports = new Sequelize(
  'tgbot_bd',
  'root',
  'root',
  {
    host: '5.188.128.61',
    port: '6432',
    dialect: 'postgres'
  }
)