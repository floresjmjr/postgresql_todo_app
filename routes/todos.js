var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var Todos = require(path.resolve(path.dirname(__dirname), './modules/todos.js'))

// Retrieves all todos
router.get('/api/todos', function(req, res, next) {
  console.log('get request');
  res.json(Todos.getJsonObj().data);
});

// Saves a todo
router.post('/api/todos', (req, res, next) => {
  var newTodo = Todos.addTodo(req.body);
  res.json(newTodo)
});

// Update a todo
router.put('/api/todos/:id', (req, res, next) => {
  var updatedTodo = Todos.updateTodo(req.body);
  res.json(updatedTodo);
});

// Delete a todo
router.delete('/api/todos/:id', (req, res, next) => {
  if (Todos.deleteTodo(req.params.id)) {
    res.sendStatus(200);
  } else {
    res.sendStatus(500);
  }
})

module.exports = router;
