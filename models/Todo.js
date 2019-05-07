const Sequelize = require('sequelize')
const db = require('../config/database')

const Todo = db.define('todo', {
  title: {
    type: Sequelize.STRING
  },
  month: {
    type: Sequelize.STRING
  },
  day: {
    type: Sequelize.STRING
  },
  year: {
    type: Sequelize.STRING
  },
  description:{
    type: Sequelize.TEXT
  },
  completed: {
    type: Sequelize.BOOLEAN
  },
})

module.exports = Todo;