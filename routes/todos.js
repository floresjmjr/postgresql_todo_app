var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var Todos = require(path.resolve(path.dirname(__dirname), './modules/todos.js'))


// database
var Pool = require('pg').Pool;
var config = {
  user: 'jorge',
  host: 'localhost',
  database: 'todos',
  password: '',
  port: 5432,
}
var pool = new Pool(config);

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

// Retrieve all todos
router.get('/api/todos', function(req, res, next) {
  pool.connect((err, client, done) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    client.query('SELECT * FROM todos', (err, data) => {
      done()
      if (err) {
        return console.log('Error executing query', err.stack)
      }
      res.json(data.rows);
    })
  })
})

// Saves a todo
router.post('/api/todos', (req, res, next) => {
  pool.connect((err, client, done) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    const queryString = 'INSERT INTO todos (title, month, day, year, description, completed) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *' 
    const params = [req.body.title, req.body.month, req.body.day, req.body.year, req.body.description, req.body.completed]
      client.query(queryString, params, (err, data) => {
      done()
      if (err) {
        return console.error('Error executing query', err.stack)
      }
      res.json(data.rows[0]);
    })
  })
});

// Update a todo
router.put('/api/todos/:id', (req, res, next) => {
  pool.connect((err, client, done) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    const queryString = 'UPDATE todos SET title=$2, month=$3, day=$4, year=$5, description=$6, completed=$7 WHERE id=$1 RETURNING *' 
    const params = [req.body.id, req.body.title, req.body.month, req.body.day, req.body.year, req.body.description, req.body.completed]
      client.query(queryString, params, (err, data) => {
      done()
      if (err) {
        return console.log('Error executing query', err.stack)
      }
      res.json(data.rows[0]);
    })
  })
});


router.delete('/api/todos/:id', (req, res, next) => {
  pool.connect((err, client, done) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    const queryString = 'DELETE FROM todos WHERE id =$1 RETURNING *' 
    const params = [req.params.id]
      client.query(queryString, params, (err, data) => {
      done()
      if (err) {
        return console.log('Error executing query', err.stack)
      }
      if (String(data.rows[0].id) === req.params.id){
        res.sendStatus(200);
      } else {
        res.sendStatus(500);
      }
    })
  })
})


module.exports = router;



// // Retrieves all todos
// router.get('/api/todos', function(req, res, next) {
//   console.log('get request');
//   res.json(Todos.getJsonObj().data);
//   Todos.getJsonObj();
// });

// // Saves a todo
// router.post('/api/todos', (req, res, next) => {
//   var newTodo = Todos.addTodo(req.body);
//   res.json(newTodo)
// });

// // Update a todo
// router.put('/api/todos/:id', (req, res, next) => {
//   var updatedTodo = Todos.updateTodo(req.body);
//   res.json(updatedTodo);
// });

// // Delete a todo
// router.delete('/api/todos/:id', (req, res, next) => {
//   if (Todos.deleteTodo(req.params.id)) {
//     res.sendStatus(200);
//   } else {
//     res.sendStatus(500);
//   }
// })

// module.exports = router;
