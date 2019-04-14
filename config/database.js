const Sequelize = require('sequelize')

module.exports = new Sequelize('todos', null, null, {
  host: 'localhost',
  dialect: 'postgres',

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },

  define: {
    timestamps: false,
  },

})