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
