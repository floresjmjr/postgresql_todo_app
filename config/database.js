const Sequelize = require('sequelize')

if (process.env.DATABASE_URL) {
  module.exports = new Sequelize(process.env.DATABASE_URL, {
    
    define: {
      timestamps: false,
    },

  });
} else {
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
}

