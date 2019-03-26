var path = require('path');
var fs = require('fs');
var filePath = path.resolve(path.dirname(__dirname), './data/todos.json')

module.exports = {
  
  getJsonObj: function() {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  },
  updateJsonObj: function(obj) {
    fs.writeFileSync(filePath, JSON.stringify(obj));
  },
  addTodo: function(todo) {
    var jsonObj = this.getJsonObj();
    todo.id = Number(jsonObj.counter) + 1; 
    jsonObj.data.push(todo);
    this.updateJsonObj(jsonObj);
    return todo
  },
  updateTodo: function(todo) {
    var jsonObj = this.getJsonObj();
    jsonObj.data = this.replaceTodo(jsonObj.data, todo);
    this.updateJsonObj(jsonObj);
    return todo
  },
  deleteTodo: function(id) {
    var jsonObj = this.getJsonObj();
    var idx = jsonObj.data.findIndex((item) => {
      return String(item.id) === String(id);
    })
    if (idx === -1) {
      return false;
    } else {
      this.updateJsonObj(jsonObj);
      return true;
    }
  },
  replaceTodo: function(data, todo) {
    return data.map((item) => {
      if (item.id === todo.id) {
        return todo;
      } else {
        return item;
      }
    })    
  },

}


// database
var Pool = require('pg').Pool;
var config = {
  user: 'jorge',
  host: 'localhost',
  database: 'films',
  password: '',
  port: 5432,
}

var pool = new Pool(config);

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

// callback - checkout a client
pool.connect((err, client) => {
  if (err) throw err;
  client.query('SELECT * FROM directors', (err, res) => {
    if (err) {
      console.log(err.stack)
    } else {
      console.log(res.rows)
    }
  })
});