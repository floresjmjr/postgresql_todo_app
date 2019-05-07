
$(function() {
  //With Object.create
  const Display = {

    hsCompile: function(script, data) {
      var compileFunc = Handlebars.compile($(script).html());
      return compileFunc({todos: data})
    },

    count: function() {
      console.log('displayCount all', LStodoApp.allTodos().length );
      console.log('displayCount completed', LStodoApp.filterCompletedTodos().length );
      console.log('displayCount completed span', $('#nav_header_completed_groups span').text());
      $('#nav_header_all_groups span').text(LStodoApp.allTodos().length);
      $('#nav_header_completed_groups span').text(LStodoApp.filterCompletedTodos().length);
    },

    main: function() {
      console.log('main', LStodoApp.selected())
      var scriptId = '#todo_item_template';
      var list = [];
      if(LStodoApp.selected().view === 'group'){
          //Obtains the group given the specifics, but then to access the todos, use the collection property
          list = LStodoApp.findGroupByDate(LStodoApp.selected().date, LStodoApp.selected().type).collection                  
      } else if(LStodoApp.selected().type === 'Completed') {
        list = LStodoApp.filterCompletedTodos();
      } else {
        list = LStodoApp.separate(LStodoApp.allTodos());
      }
      $('#main_todos').html(this.hsCompile(scriptId, list));
      this.count();
    },

    nav: function() {
      var scriptId = '#nav_group_template';
      $('#nav_list_all_groups').html(this.hsCompile(scriptId, LStodoApp.todoGroups()));
      $('#nav_list_completed_groups').html(this.hsCompile(scriptId, LStodoApp.completedGroups()));
      console.log('display navTodoGroups', LStodoApp.completedGroups(), LStodoApp.todoGroups())
    },    

    highlight: function(element) {
      console.log('highlight', element)
      $('nav').find('.highlight').removeClass('highlight');
      $(element).addClass('highlight');
    },

  }


  const Drive = {

    //Deployment URL
    rootUrl: 'https://multiview-todo-app.herokuapp.com',

    // Localhost URL
    // rootUrl: 'https://localhost:3000',

    retrieveAllTodos: function() {
      var method = 'GET';
      var url = this.rootUrl + '/api/todos';
      console.log('url', url)
      this.makeRequest(method, url).then((response) => {
        console.log('requestAllTodos response');
        LStodoApp.loadPage(JSON.parse(response));
      }, (error) => {
        console.error('Could NOT retrieve All', error);
      })
    },

    editTodo: function() {
      var method = 'PUT';
      var url = this.rootUrl + `/api/todos/${LStodoApp.todoP().id}`;
      var data = LStodoApp.todoP()
      this.makeRequest(method, url, data).then((response) => {
        console.log('request Edit response')
        LStodoApp.processEdit();  
      }, (error) => {
        console.error(`Did NOT update`, error)
      })
    },

    addTodo: function() {
      var method = 'POST';
      var url = this.rootUrl + '/api/todos'
      var data = LStodoApp.todoP()
      this.makeRequest(method, url, data).then((response) => {
        LStodoApp.processAdd(JSON.parse(response));        
      }, (error) => {
        console.error("Was NOT added", error);
      })
    },

    deleteTodo: function() {
      var method = 'DELETE';
      var url = this.rootUrl + `/api/todos/${LStodoApp.todoP().id}`;
      this.makeRequest(method, url).then((response) => {
        console.log('todo was removed', LStodoApp.todoP().id);
        LStodoApp.processRemove();
      }, (error) => {
        console.log('todo was NOT removed', LStodoApp.todoP().id);
      })
    },

    makeRequest: function(method, url, data='') {
        const request = new XMLHttpRequest();
        request.open(method, url)
        if(data) {
          request.setRequestHeader('Content-type', 'application/json');
          const jsonTodo = JSON.stringify(data);
          request.send(jsonTodo)
        } else {
          request.send();
        }
        return new Promise((resolve, reject) => {
          request.addEventListener('load', () => {
          if(request.status === 200) {
            resolve(request.response);
          } else {
            reject(request.statusText);
          }
        })        
      })
    },

  }


  const TodoApp = (() => {

    let counter = 0;
    let todoP = {};
    let todoGroups = [];
    let allTodos = [];
    let selected = '';
    let completedGroups = [];

    return {

      //Properties

      todoP: function() {
        return todoP;
      },

      todoGroups: function() {
        return todoGroups;
      },

      allTodos: function() {
        return allTodos;
      },

      selected: function() {
        return selected;
      },
      

      //modal functions

      displayModalValues: function() {
        $('#modal input').val(todoP.title)
        $('#modal select[name=month]').val(todoP.month);
        $('#modal select[name=day]').val(todoP.day);
        $('#modal select[name=year]').val(todoP.year);
        $('#modal textarea').val(todoP.description);
        //console.log('displayedInputs', todoP)
      },

      resetModal: function() {
        const $month = $('#modal select[name=month]');
        const $day = $('#modal select[name=day]');
        const $year = $('#modal select[name=year]');
        $month.val($month.find('option').eq(0).text());
        $day.val($day.find('option').eq(0).text());
        $year.val($year.find('option').eq(0).text());
      },

      obtainInputs: function() {

        todoP['title'] = $('#modal input').val()
        const month = $('#modal select[name=month]').val()
        const day = $('#modal select[name=day]').val();
        const year = $('#modal select[name=year]').val();

        if (Number(month)){
          todoP['month'] = month;
        } else {
          todoP['month'] = '00'
        }
        if (Number(day)){
          todoP['day'] = day;
        } else {
          todoP['day'] = '00'        
        }
        if (Number(year)){
          todoP['year'] = year;
        } else {
          todoP['year'] = '0000'
        }
        
        todoP['description'] = $('#modal textarea').val();
          if(todoP.id){
          } else {
            todoP['completed'] = false;
          }
        console.log('obtainInputs', todoP);
      },

      createModal: function() {
        $('#modal').fadeIn();
      },

      removeModal: function() {
        $('#modal').on('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('stopPropagation')
        })
        $(document).on('click', (e) => {
          if($('#modal').css('display') === 'block'){
            e.preventDefault();
            $('#modal').hide();
            console.log('hide Modal');
          }
        })
      },

      //Todo Group Methods

      loadHeaderTodoGroups: function() {
        $('nav').on('click', 'header', (e) => {
          console.log('loadHeaderTodoGroups', e.currentTarget.tagName)
          var count = $(e.currentTarget).find('span').text()
          var title = $(e.currentTarget).find('h2').text();
          $('main header span').text(count)
          $('header h1').text(title);
          Display.highlight(e.currentTarget);
          var groupType = $(e.currentTarget).find('h2').text();
          selected = {type: groupType}
          Display.main();
        });
      },

      loadGroups: function() {
        $('nav').on('click', 'li', (e)=> {
          console.log('loadGroups', e.currentTarget.tagName)
          var count = $(e.currentTarget).find('span').text()
          var title = $(e.currentTarget).find('p').text();
          $('main header span').text(count)
          $('header h1').text(title);
          Display.highlight(e.currentTarget);
          const groupType = $(e.currentTarget).closest('ul').attr('id')
          selected = {view: 'group', date: title, type: groupType}
          Display.main('group');
        })
      },

      isNotUnique: function(arr, t) {
        return arr.some((todoG) => {
          return todoG.date === t.date
        })
      },

      hasTodoGroup: function(groupArr, t) {
        console.log('hasTodoGroup')
        return this.isNotUnique(groupArr, t);
      },

      createOrSortGroups: function(variation){
        if(variation === 'Completed') {
          completedGroups = [];
          var groupArr = completedGroups;
          var todos = this.filterCompletedTodos();
        } else {
          todoGroups = [];
          var groupArr = todoGroups
          var todos = allTodos;
        }
        todos.forEach((todoObj) => {
          this.determineTodoAction(groupArr, todoObj);
        })
        console.log('createOrSortGroups', groupArr)
      },

      determineTodoAction: function(groupArr, todoObj){
        if(this.hasTodoGroup(groupArr, todoObj)){
          this.addTodoToGroup(groupArr, todoObj);
        } else {
          this.createTodoGroup(groupArr, todoObj);
        }
      },

      createTodoGroup: function(groupArr, t) {
        console.log('createTodoGroup', t);
        var group = {id: counter +=1, date: t.date, count: 1, collection: [t]}
        groupArr.push(group);
        console.log(groupArr);
      }, 

      addTodoToGroup: function(groupArr, t) {
        groupArr.forEach(todoGroup => {
          if (todoGroup.date === t.date) {
            todoGroup.collection.push(t);
            todoGroup.count += 1;
          }
        })
      },

      findGroupByDate(date, type){
        console.log('findGroupById', date, type);
        if(type === 'nav_list_all_groups'){
          var arr = todoGroups;
        } else {
          var arr = completedGroups;
          console.log('else', completedGroups);
        }
        var group = [];
        arr.forEach((todoGroup) => {
          if(String(todoGroup.date) === String(date)) {
            group = todoGroup;
            console.log('match', group);
          }
        })
        return group;
      },

      completedGroups: function(){
        this.createOrSortGroups('Completed')
        console.log('completedGroups', completedGroups);
        return completedGroups;
      },

      removeTodoGroup: function() {
        var groupId;
        var todoIdx;
        var groupIdx;
        todoGroups.forEach((tg, tgIdx)=>{
          tg.collection.forEach((t, tIdx)=>{
            if (t.id === todoP.id){
              groupId = tg.id;
              todoIdx = tIdx;
              groupIdx = tgIdx;
            }
          })
        })
        var group = this.findTodoGroupById(groupId)
        group.collection.splice(todoIdx, 1)
        if(group.collection.length === 0) {
          todoGroups.splice(groupIdx, 1);
        }
      },

      replaceTodoGroup: function() {
        this.removeTodoGroup();
        this.addTodoGroup();
      },

      findTodoGroupById: function(groupId) {
        return todoGroups.filter((tg)=>{
          return tg.id === groupId
        })[0]
      },

      addTodoGroup: function() {
        this.determineTodoAction(todoGroups, this.addFormatedDate(todoP))
      },



      //Functions

      toggleCompleted: function() {
        console.log('beforeToggle', todoP.completed);
        todoP.completed = !(todoP.completed);
        console.log('toggleCompleted', todoP.completed);
        Drive.editTodo()
      },

      obtainID: function(element) {
        const id = $(element).closest('div').attr('data');
        return id
      },

      findTodoById: function(id) {
        //console.log('findTodoById', id);
        allTodos.forEach((todoObj) => {
          if (String(todoObj.id) === id) {
            todoP = todoObj;
            console.log('match', todoP);
          }
        })
      },

      filterCompletedTodos: function(){
        return allTodos.filter((todo)=>{
          return todo.completed
        })
      },

      separate: function() {
        console.log('separate');
        return allTodos.sort((todo1, todo2)=>{
          if(!todo1.completed){
            return -1;
          }
          if(todo2.completed){
            return 1;
          }
          return 0;
        })
      },

      //buttons

      btnSaveTodo: function() {
        $('button[name=save_todo]').on('click', (e) => {
          e.preventDefault();
          this.obtainInputs();
          if (todoP.title.length < 3) {
            alert('You must enter a title at lease 3 characters long.');
          } else {
            if (todoP.id) {
              console.log('save has id', todoP)
              Drive.editTodo();
              $('#modal').fadeOut();
            } else {
              console.log('save does not have id', todoP);
              Drive.addTodo();
              $('#modal').fadeOut();
            }
          }
        })
      },

      btnEditTodo: function() {
        $('dl').on('click', 'p', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const id = this.obtainID($(e.target));
          this.findTodoById(id);
          console.log('before create modal', todoP);
          this.createModal();
          console.log('after create modal', todoP);
          this.displayModalValues();
        })
      },

      btnCheckbox: function() {
        $('dl').on('click', 'dt', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const id = this.obtainID($(e.target));
          console.log('checkbox', id)
          this.findTodoById(id);
          this.toggleCompleted();
        })
      },

      btnDelete: function() {
        $('dl').on('click', 'dd', (e) => {
          e.preventDefault();
          const id = this.obtainID($(e.target));
          this.findTodoById(id); 
          Drive.deleteTodo();
        })
      },

      btnCreateTodo: function() {
        $('button[name=addTodo]').on('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          todoP = {};
          console.log('btnCreateTodo', todoP)
          this.displayModalValues();
          this.resetModal();
          this.createModal();
        })
      },

      btnMarkComplete: function() {
        $('button[name=mark_complete]').on('click', (e) => {
          e.preventDefault();
          this.obtainInputs();
          todoP['completed'] = true;
          if (todoP.id) {
            Drive.editTodo();
            $('#modal').hide();
          } else {
            alert('Cannot mark as complete as item has not been created yet!');
          }
        })    
      },


      //Local Drive 

      loadPage: function(data) {
        allTodos = data;
        this.formatTodos(allTodos);
        console.log('loadpage', allTodos);
        this.createOrSortGroups();
        this.createOrSortGroups('Completed');
        console.log('loadpage todoGroups', todoGroups);
        Display.main();
        Display.nav();
        $('main header span').text(allTodos.length);
        selected = {type: 'All Todos'}
      },

      processAdd: function(response) {
        todoP.id = response.id;
        console.log('processAdd', todoP);
        this.addTodo()
        this.addTodoGroup();
        //Reseting the selected
        selected = 'All Todos';
        Display.main();
        Display.nav();
        Display.highlight();
      },

      processEdit: function() {
        console.log('processEdit');
        this.replaceTodo();
        this.replaceTodoGroup();
        Display.nav();
        Display.main();
        // $('nav').trigger('click');
      },

      processRemove: function(){
        console.log('processRemove');
        this.removeTodo();
        this.removeTodoGroup();
        Display.nav();
        Display.main();
      },


      // Local functions

      formatTodos: function() {
        allTodos.forEach((todo)=>{
          this.addFormatedDate(todo)
        })
      },

      addTodo: function() {
        allTodos.push(this.addFormatedDate(todoP))
      },

      removeTodo: function() {
        allTodos.splice(this.findIndex(), 1);
      },

      replaceTodo: function() {
        allTodos.splice(this.findIndex(), 1, todoP);
      },

      findIndex: function() {
        let index;
        allTodos.forEach((todo, idx) => {
          if(todo.id === todoP.id){
            index = idx
          }
        })
        return index
      },

      addFormatedDate: function(todoObj) {
        if(todoObj.month === '00' || todoObj.year === '0000') {
          todoObj.date = 'No Due Date';
        } else {
          todoObj.date = `${todoObj.month}/${todoObj.year.substring(2)}`;
        }
        return todoObj; 
      },

      init: function() {
        console.log('init');
        Drive.retrieveAllTodos();
        this.btnCreateTodo();
        this.btnEditTodo();
        this.btnSaveTodo();
        this.btnMarkComplete();
        this.btnCheckbox();
        this.btnDelete();
        this.loadHeaderTodoGroups();
        this.loadGroups();
        this.removeModal();
      },
    }
  })();

  //OLOO Design Pattern
  const LStodoApp = Object.create(TodoApp);
  LStodoApp.init();
  // console.dir(LStodoApp);
  // console.log(TodoApp.isPrototypeOf(LStodoApp));
})
