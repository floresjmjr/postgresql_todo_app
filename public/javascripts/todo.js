
$(function() {
  //With Object.create
  const Display = {

    count: function(mainCount) {
      $('header span').text(mainCount);
      $('#nav_header_all_todos span').text(LStodoApp.localAllTodos().length);
      $('#nav_header_completed_todos span').text(LStodoApp.getCompletedCount());
      console.log('displayCount', LStodoApp.getCompletedCount());
    },

    main: function() {
      console.log('inCompletedTodoGroup', LStodoApp.inCompletedTodoGroup());
      console.log('headerCompleted', LStodoApp.headerCompleted());
      $('#main_all_todos').show();
      this.registerPartial();
      if(LStodoApp.inCompletedTodoGroup()) {
        $('#main_all_todos').hide()
        LStodoApp.filterCompletedTodos();
        if (LStodoApp.headerCompleted()) {
          this.count(LStodoApp.getCompletedCount())
          console.log('headerCompleted', LStodoApp.getCompletedCount());
        } else {
          this.count(LStodoApp.mainCompletedTodos().length)        
        }
        this.mainCompletedTodos();
      }
      else {
        this.mainTodos()
        this.hideMainCompletedTodos();
        LStodoApp.filterCompletedTodos();
        this.mainCompletedTodos();
        this.count(LStodoApp.mainTodos().length);
       }
    },

    nav: function() {
      this.registerNavPartial();
      LStodoApp.createAllTodoGroups();
      this.navTodoGroups();
      LStodoApp.filterCompletedTodoGroups();
      this.navCompletedTodoGroups();
    },    

    mainTodos: function() {
      const todoPartialFunc = Handlebars.compile($('#todo_item_iterator').html());
      $('#main_all_todos').html(todoPartialFunc({todos: LStodoApp.mainTodos()}));
      console.log('displayMainTodos mainTodos', LStodoApp.mainTodos());
    },

    hideMainCompletedTodos: function() {
      LStodoApp.mainTodos().forEach((todoObj) => {
        if(todoObj.completed){
          $(`#main_all_todos li[data='${todoObj.id}']`).hide();
        }
      })
    },

    mainCompletedTodos: function() {
      const todoPartialFunc = Handlebars.compile($('#todo_item_iterator').html());
      $('#main_all_completed_todos').html(todoPartialFunc({todos: LStodoApp.mainCompletedTodos()}));
      console.log('displayMainCompletedTodos mainCompletedTodos', LStodoApp.mainCompletedTodos());      
    },

    navTodoGroups: function() {
      console.log('navTodo count', LStodoApp.navAllTodoGroups().length)
      const navPartialFunc = Handlebars.compile($('#nav_todo_iterator').html());
      $('#nav_todo_list').html(navPartialFunc({todos: LStodoApp.navAllTodoGroups()}));
    },

    navCompletedTodoGroups: function() {
      console.log('nav C todo count', LStodoApp.navCompletedTodoGroups().length);
      const navPartialFunc = Handlebars.compile($('#nav_todo_iterator').html());
      $('#nav_completed_todo_list').html(navPartialFunc({todos: LStodoApp.navCompletedTodoGroups()}));
    },

    registerPartial: function() {
      Handlebars.registerPartial('applyTemplate', $('#todo_item_template').html())
    },

    registerNavPartial: function() {
      Handlebars.registerPartial('applyTemplate', $('#nav_todo_template').html());
    },

    title: function(title) {
      $('header h1').text(title);
    },
  }


  const Drive = {

    retrieveAllTodos: function() {
      this.promiseAll().then((response) => {
        console.log('requestAllTodos response', response);
        LStodoApp.loadPage(response);
      }, (error) => {
        console.error('Failed', error);
      })
    },
    
    promiseAll: function() {
      return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('GET', 'http://localhost:3000/api/todos');
        request.responseType = 'json';
        request.send();
        request.addEventListener('load', () => {
          if (request.status === 200) {
            resolve(request.response);
          } else {
            reject(request.statusText);
          }
        })
      })
    },

    editTodo: function() {
      this.promiseEdit().then((response) => {
        console.log('request Edit response', response)
        LStodoApp.processEdit();  
      }, (error) => {
        console.error(`didn't update`, error)
      })
    },

    promiseEdit: function() {
      return new Promise((resolve, reject) =>{
        const request = new XMLHttpRequest();
        request.open('PUT', `http://localhost:3000/api/todos/${LStodoApp.todoP().id}`)
        request.setRequestHeader('Content-type', 'application/json');
        const jsonTodo = JSON.stringify(LStodoApp.todoP());
        request.send(jsonTodo)
        console.log('promiseEdit json', jsonTodo);
        request.addEventListener('load', () => {
          if(request.status === 200) {
            resolve(request.response);
          } else {
            reject(request.statusText);
          }
        })
      })
    },

    addTodo: function() {
      this.promiseAdd().then((response) => {
        console.log('Drive addTodo id', response.id);
        LStodoApp.processAdd(response.id);        
      }, (error) => {
        console.error("wasn't added", error);
      })
    },

    promiseAdd: function() {
      return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('POST', 'http://localhost:3000/api/todos')
        const jsonTodo = JSON.stringify(LStodoApp.todoP());
        request.setRequestHeader('Content-type', 'application/json');
        request.responseType = 'json';
        request.send(jsonTodo)
        console.log('promiseAdd', jsonTodo);

        request.addEventListener('load', () => {
          if(request.status === 200) {
            resolve(request.response);
          } else {
            reject(request.statusText);
          }
        })        
      })
    },

    deleteTodo: function() {
      this.promiseDelete().then((response) => {
        console.log('todo was removed', LStodoApp.todoP().id);
        LStodoApp.processRemove();
      }, (error) => {
        console.log('todo was NOT removed', LStodoApp.todoP().id);
      })
    },

    promiseDelete: function() {
      return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('DELETE', `http://localhost:3000/api/todos/${LStodoApp.todoP().id}`)
        request.send();
        request.addEventListener('load', () => {
          if (request.status === 200) {
            resolve(request.response);
          } else {
            reject(request.statusText);
          }
        });
      })
    },

  }


  const TodoApp = (() => {

    let localAllTodos = [];
    let tGroupIdCounter = -1;
    let cTGroupIdCounter = -1;
    let todoP = {};
    let navAllTodoGroups = [];
    let navCompletedTodoGroups = [];
    let mainTodos = [];
    let mainCompletedTodos = [];
    let inCompletedTodoGroup = false;
    let headerCompleted = false;

    return {

      //Properties

      localAllTodos: function() {
        return localAllTodos;
      },

      todoP: function() {
        return todoP;
      },

      navAllTodoGroups: function() {
        return navAllTodoGroups;
      },

      navCompletedTodoGroups: function() {
        return navCompletedTodoGroups;
      },

      mainTodos: function() {
        console.log('TodoManager mainTodos', mainTodos);
        return mainTodos;
      },

      mainCompletedTodos: function() {
        return mainCompletedTodos;
      },

      inCompletedTodoGroup: function() {
        return inCompletedTodoGroup;
      },

      headerCompleted: function() {
        return headerCompleted;
      },
      
      //Todo Group Methods

      filterCompletedTodoGroups: function() {
        navCompletedTodoGroups = [];
        navAllTodoGroups.forEach((todoGroup) => {
          todoGroup.collection.forEach((todo) => {
            if(todo.completed) {
              if(this.isOnTodoGroups(todo, navCompletedTodoGroups)){
                this.addTodoGroupCollection(todo, navCompletedTodoGroups)
              } else {
                this.createCompletedTodoGroup(todo);
              }
            }
          })
        })
        console.log('filterCompletedTodoGroups', navCompletedTodoGroups)
      },

      isOnTodoGroups: function(t, groupArr) {
        //console.log('t', t);
        //console.log('isOnTodoGroups', groupArr);
        return groupArr.some((todoGroup) => {
          return todoGroup.date === t.date
        })
      },

      createAllTodoGroups: function() {
        navAllTodoGroups = [];
        localAllTodos.forEach((todoObj) => {
          if(this.isOnTodoGroups(todoObj, navAllTodoGroups)){
            this.addTodoGroupCollection(todoObj, navAllTodoGroups);
          } else {
            this.createTodoGroup(todoObj);
          }
        })
        console.log('createAllTodoGroups', navAllTodoGroups);
      },

      createTodoGroup: function(t) {
        navAllTodoGroups.push({'id': tGroupIdCounter += 1, 'date': t.date, 'count': 1, 'collection': [t]});
        //console.log('createTodoGroup', navAllTodoGroups);
      }, 

      createCompletedTodoGroup: function(t) {
        navCompletedTodoGroups.push({'id': cTGroupIdCounter +=1, 'date': t.date, 'count': 1, 'collection': [t]});
      },

      addTodoGroupCollection: function(t, groupArr) {
        groupArr.forEach(todoGroup => {
          if (todoGroup.date === t.date) {
            todoGroup.collection.push(t);
            todoGroup.count += 1;
            //console.log('addTodoGroupCollection', todoGroup.collection);
          }
        })
      },

      findTodoFromTodoGroup: function(groupArr) {
        let collectionIdx;
        let groupIdx;
        console.log('findTodoFromTodoGroup', todoP);
        groupArr.forEach((todoGroup, tGroupIdx) => {
          console.log('tg date', todoGroup.date);
          if(todoGroup.date === todoP.date) {
            groupIdx = tGroupIdx;
            todoGroup.collection.forEach((todoObj, todoIdx) => {
              console.log(todoObj)
              if(todoObj === todoP) {
                collectionIdx = todoIdx;
              }
            })
          }
        })
        //console.log('collectionIdx', collectionIdx);
        //console.log('todoGroupIdx', groupIdx);
        return {'groupIdx': groupIdx, 'collectionIdx': collectionIdx}
      },

      loadHeaderTodoGroups: function() {
        $('nav').on('click', 'h2', (e) => {
          e.preventDefault();
          this.highlight(e.target);
          if($(e.target).attr('id') === 'nav_header_all_todos'){
            Display.title('All Todos');
            console.log('nav_header_all_todos');
            mainTodos = localAllTodos;
            inCompletedTodoGroup = false;
            Display.main();
          } else {
            Display.title('Completed');
            mainTodos = localAllTodos
            this.filterCompletedTodos();
            console.log('mainCompletedTodos', mainCompletedTodos);
            mainTodos = mainCompletedTodos;
            inCompletedTodoGroup = true;
            headerCompleted = true;
            Display.main();
            $('#main_all_todos').hide();
          }
        });
      },

      loadGroups: function() {
        $('nav').on('click', 'li', e => {
          e.preventDefault();
          this.highlight(e.target);
          const todoGroupId = $(e.target).attr('data');
          const group = $(e.target).closest('ul').attr('id');
          //find collection
          if (group === 'nav_todo_list') {
            const index = this.findTodoGroupsIndex(navAllTodoGroups, todoGroupId);
            mainTodos = navAllTodoGroups[index].collection
            inCompletedTodoGroup = false;
            Display.main();
          } else {
            const index = this.findTodoGroupsIndex(navCompletedTodoGroups, todoGroupId);
            mainTodos = navCompletedTodoGroups[index].collection;
            inCompletedTodoGroup = true;
            headerCompleted = false;
            Display.main();
          }
          const title = document.querySelector(`li[data='${todoGroupId}']`).childNodes[0].textContent;
          Display.title(title);
        })
      },

      findTodoGroupsIndex(todoGroupsCollection, id){
        let index;
        todoGroupsCollection.forEach((todoGroup, idx) => {
          if(String(todoGroup.id) === id) {
            index = idx;
          }
        })
        return index;
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
          e.preventDefault();
          $('#modal').hide();
          console.log('hide Modal');
        })
      },

      

      //Functions

      highlight: function(element) {
        $('nav').find('.highlight').removeClass('highlight');
        $(element).addClass('highlight')     
      },

      getCompletedCount: function() {
        let count = 0;
        localAllTodos.filter((obj) => {
          if(obj.completed){
            count += 1;
          }
        })
        return count
      },

      filterCompletedTodos: function() {
        mainCompletedTodos = mainTodos.filter((todoObj) => {
          return todoObj.completed;
        })
        console.log('filterCompletedTodos', mainCompletedTodos) 
      },

      toggleComplete: function() {
        console.log('toggleComplete', todoP.completed);
        todoP.completed = !(todoP.completed);
        Drive.editTodo()
      },


      formatTodos: function() {
        // console.log('formatTodos');
        localAllTodos.forEach((todoObj) => {
          this.addFormatedDate(todoObj);
        })
      },

      obtainID: function(element) {
        const id = $(element).closest('li').attr('data');
        return id
      },

      searchAllTodos: function(id) {
        //console.log('searchAllTodos', id);
        localAllTodos.forEach((todoObj) => {
          if (String(todoObj.id) === id) {
            todoP = todoObj;
            console.log('match', todoP);
          }
        })
      },

      addFormatedDate: function(todoObj) {
        if(todoObj.month === '00' || todoObj.year === '0000') {
          todoObj.date = 'No Due Date';
        } else {
          todoObj.date = `${todoObj.month}/${todoObj.year.substring(2)}`;
        }
        return todoObj; 
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
        $('article').on('click', 'p', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const id = this.obtainID($(e.target));
          this.searchAllTodos(id);
          console.log('before create modal', todoP);
          this.createModal();
          console.log('after create modal', todoP);
          this.displayModalValues();
        })
      },

      btnCheckbox: function() {
        $('article').on('click', 'dt', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const id = this.obtainID($(e.target));
          console.log('checkbox', id)
          this.searchAllTodos(id);
          this.toggleComplete();
        })
      },

      btnDelete: function() {
        $('article').on('click', 'dd', (e) => {
          e.preventDefault();
          const id = this.obtainID($(e.target));
          this.searchAllTodos(id); 
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
        localAllTodos = data;
        mainTodos = data;
        console.log('mainTodos', mainTodos);
        this.formatTodos();
        this.createAllTodoGroups();
        Display.main();
        Display.nav();
      },

      processAdd: function(responseId) {
        todoP.id = responseId
        console.log('processAdd', todoP);
        localAllTodos.push(this.addFormatedDate(todoP));
        mainTodos = localAllTodos;
        this.highlight(document.getElementById('nav_header_all_todos'));
        inCompletedTodoGroup = false;
        Display.nav();
        Display.main();
        Display.title('All Todos');
      },

      processEdit: function() {
        todoP = this.addFormatedDate(todoP);
        console.log('editMainLocalTodo', todoP);
        this.replaceTodo();
        this.replaceMainTodo();
        Display.nav();
        Display.main();
        console.log('editNavLocalTodo', todoP);
      },

      processRemove: function(){
        this.removeTodo();
        if(mainTodos === localAllTodos){
        } else {
          this.removeMainTodo();
        } 
        Display.nav();
        Display.main();
      },

      // Local functions

      removeTodo: function() {
        let index;
        console.log('remove todo', todoP.id)
        localAllTodos.forEach((el, idx) => {
          if (el.id === todoP.id){
            index = idx;
          }
        })
        localAllTodos.splice(index, 1);
      },

      removeMainTodo: function() {
        let index;
        console.log('remove Main todo', todoP.id)
        mainTodos.forEach((el, idx) => {
          if (el.id === todoP.id){
            index = idx;
          }
        })
        mainTodos.splice(index, 1);
      },

      replaceTodo: function() {
        console.log('replaceTodo', todoP);
        let index;
        localAllTodos.forEach((todo, idx) => {
          if(todo.id === todoP.id){
            index = idx
          }
        })
        localAllTodos.splice(index, 1, todoP);      
      },

      replaceMainTodo: function() {
        console.log('replaceMainTod', todoP);
        let index;
        mainTodos.forEach((todo, idx) => {
          if(todo.id === todoP.id){
            index = idx
          }
        })
        mainTodos.splice(index, 1, todoP);
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
  console.dir(LStodoApp);
  console.log(TodoApp.isPrototypeOf(LStodoApp));
})





// //With Constructor (new operator)  

// $(function() {
//   const Display = {

//     count: function(mainCount) {
//       $('header span').text(mainCount);
//       $('#nav_header_all_todos span').text(LStodoApp.localAllTodos.length);
//       $('#nav_header_completed_todos span').text(LStodoApp.getCompletedCount());
//       console.log('displayCount', LStodoApp.getCompletedCount());
//     },

//     main: function() {
//       console.log('inCompletedTodoGroup', LStodoApp.inCompletedTodoGroup);
//       console.log('headerCompleted', LStodoApp.headerCompleted);
//       $('#main_all_todos').show();
//       this.registerPartial();
//       if(LStodoApp.inCompletedTodoGroup) {
//         $('#main_all_todos').hide()
//         LStodoApp.filterCompletedTodos();
//         if (LStodoApp.headerCompleted) {
//           this.count(LStodoApp.getCompletedCount())
//           console.log('headerCompleted', LStodoApp.getCompletedCount());
//         } else {
//           this.count(LStodoApp.mainCompletedTodos.length)        
//         }
//         this.mainCompletedTodos();
//       }
//       else {
//         this.mainTodos()
//         this.hideMainCompletedTodos();
//         LStodoApp.filterCompletedTodos();
//         this.mainCompletedTodos();
//         this.count(LStodoApp.mainTodos.length);
//        }
//     },

//     nav: function() {
//       this.registerNavPartial();
//       LStodoApp.createAllTodoGroups();
//       this.navTodoGroups();
//       LStodoApp.filterCompletedTodoGroups();
//       this.navCompletedTodoGroups();
//     },    

//     mainTodos: function() {
//       const todoPartialFunc = Handlebars.compile($('#todo_item_iterator').html());
//       $('#main_all_todos').html(todoPartialFunc({todos: LStodoApp.mainTodos}));
//       console.log('displayMainTodos mainTodos', LStodoApp.mainTodos);
//     },

//     hideMainCompletedTodos: function() {
//       LStodoApp.mainTodos.forEach((todoObj) => {
//         if(todoObj.completed){
//           $(`#main_all_todos li[data='${todoObj.id}']`).hide();
//         }
//       })
//     },

//     mainCompletedTodos: function() {
//       const todoPartialFunc = Handlebars.compile($('#todo_item_iterator').html());
//       $('#main_all_completed_todos').html(todoPartialFunc({todos: LStodoApp.mainCompletedTodos}));
//       console.log('displayMainCompletedTodos mainCompletedTodos', LStodoApp.mainCompletedTodos);      
//     },

//     navTodoGroups: function() {
//       console.log('navTodo count', LStodoApp.navAllTodoGroups.length)
//       const navPartialFunc = Handlebars.compile($('#nav_todo_iterator').html());
//       $('#nav_todo_list').html(navPartialFunc({todos: LStodoApp.navAllTodoGroups}));
//     },

//     navCompletedTodoGroups: function() {
//       console.log('nav C todo count', LStodoApp.navCompletedTodoGroups.length);
//       const navPartialFunc = Handlebars.compile($('#nav_todo_iterator').html());
//       $('#nav_completed_todo_list').html(navPartialFunc({todos: LStodoApp.navCompletedTodoGroups}));
//     },

//     registerPartial: function() {
//       Handlebars.registerPartial('applyTemplate', $('#todo_item_template').html())
//     },

//     registerNavPartial: function() {
//       Handlebars.registerPartial('applyTemplate', $('#nav_todo_template').html());
//     },

//     title: function(title) {
//       $('header h1').text(title);
//     },
//   }

//   const Drive = {

//     retrieveAllTodos: function() {
//       this.promiseAll().then((response) => {
//         console.log('requestAllTodos response', response);
//         LStodoApp.loadPage(response);
//       }, (error) => {
//         console.error('Failed', error);
//       })
//     },
    
//     promiseAll: function() {
//       return new Promise((resolve, reject) => {
//         const request = new XMLHttpRequest();
//         request.open('GET', 'http://localhost:3000/api/todos');
//         request.responseType = 'json';
//         request.send();
//         request.addEventListener('load', () => {
//           if (request.status === 200) {
//             resolve(request.response);
//           } else {
//             reject(request.statusText);
//           }
//         })
//       })
//     },

//     editTodo: function() {
//       this.promiseEdit().then((response) => {
//         console.log('request Edit response', response)
//         LStodoApp.processEdit();  
//       }, (error) => {
//         console.error(`didn't update`, error)
//       })
//     },

//     promiseEdit: function() {
//       return new Promise((resolve, reject) =>{
//         const request = new XMLHttpRequest();
//         request.open('PUT', `http://localhost:3000/api/todos/${LStodoApp.todoP.id}`)
//         request.setRequestHeader('Content-type', 'application/json');
//         const jsonTodo = JSON.stringify(LStodoApp.todoP);
//         request.send(jsonTodo)
//         console.log('promiseEdit json', jsonTodo);
//         request.addEventListener('load', () => {
//           if(request.status === 201) {
//             resolve(request.response);
//           } else {
//             reject(request.statusText);
//           }
//         })
//       })
//     },

//     addTodo: function() {
//       this.promiseAdd().then((response) => {
//         console.log('Drive addTodo id', response.id);
//         LStodoApp.processAdd(response.id);        
//       }, (error) => {
//         console.error("wasn't added", error);
//       })
//     },

//     promiseAdd: function() {
//       return new Promise((resolve, reject) => {
//         const request = new XMLHttpRequest();
//         request.open('POST', 'http://localhost:3000/api/todos')
//         const jsonTodo = JSON.stringify(LStodoApp.todoP);
//         request.setRequestHeader('Content-type', 'application/json');
//         request.responseType = 'json';
//         request.send(jsonTodo)
//         console.log('promiseAdd', jsonTodo);

//         request.addEventListener('load', () => {
//           if(request.status === 201) {
//             resolve(request.response);
//           } else {
//             reject(request.statusText);
//           }
//         })        
//       })
//     },

//     deleteTodo: function() {
//       this.promiseDelete().then((response) => {
//         console.log('todo was removed', LStodoApp.todoP.id);
//         LStodoApp.processRemove();
//       }, (error) => {
//         console.log('todo was NOT removed', LStodoApp.todoP.id);
//       })
//     },

//     promiseDelete: function() {
//       return new Promise((resolve, reject) => {
//         const request = new XMLHttpRequest();
//         request.open('DELETE', `http://localhost:3000/api/todos/${LStodoApp.todoP.id}`)
//         request.send();
//         request.addEventListener('load', () => {
//           if (request.status === 204) {
//             resolve(request.response);
//           } else {
//             reject(request.statusText);
//           }
//         });
//       })
//     },

//   }

//   const CreateTodoApp = function() {

//     //Properties
//     this.localAllTodos = [];
//     this.tGroupIdCounter = -1;
//     this.cTGroupIdCounter = -1;
//     this.todoP = {};
//     this.navAllTodoGroups = [];
//     this.navCompletedTodoGroups = [];
//     this.mainTodos = [];
//     this.mainCompletedTodos = [];
//     this.inCompletedTodoGroup = false;
//     this.headerCompleted = false;
//   }

//   CreateTodoApp.prototype = {

//     constructor: CreateTodoApp,
    
//     //Todo Group Methods

//     filterCompletedTodoGroups: function() {
//       this.navCompletedTodoGroups = [];
//       this.navAllTodoGroups.forEach((todoGroup) => {
//         todoGroup.collection.forEach((todo) => {
//           if(todo.completed) {
//             if(this.isOnTodoGroups(todo, this.navCompletedTodoGroups)){
//               this.addTodoGroupCollection(todo, this.navCompletedTodoGroups)
//             } else {
//               this.createCompletedTodoGroup(todo);
//             }
//           }
//         })
//       })
//       console.log('filterCompletedTodoGroups', this.navCompletedTodoGroups)
//     },

//     isOnTodoGroups: function(t, groupArr) {
//       //console.log('t', t);
//       //console.log('isOnTodoGroups', groupArr);
//       return groupArr.some((todoGroup) => {
//         return todoGroup.date === t.date
//       })
//     },

//     createAllTodoGroups: function() {
//       this.navAllTodoGroups = [];
//       this.localAllTodos.forEach((todoObj) => {
//         if(this.isOnTodoGroups(todoObj, this.navAllTodoGroups)){
//           this.addTodoGroupCollection(todoObj, this.navAllTodoGroups);
//         } else {
//           this.createTodoGroup(todoObj);
//         }
//       })
//       console.log('createAllTodoGroups', this.navAllTodoGroups);
//     },

//     createTodoGroup: function(t) {
//       this.navAllTodoGroups.push({'id': this.tGroupIdCounter += 1, 'date': t.date, 'count': 1, 'collection': [t]});
//       //console.log('createTodoGroup', navAllTodoGroups);
//     }, 

//     createCompletedTodoGroup: function(t) {
//       this.navCompletedTodoGroups.push({'id': this.cTGroupIdCounter +=1, 'date': t.date, 'count': 1, 'collection': [t]});
//     },

//     addTodoGroupCollection: function(t, groupArr) {
//       groupArr.forEach(todoGroup => {
//         if (todoGroup.date === t.date) {
//           todoGroup.collection.push(t);
//           todoGroup.count += 1;
//           //console.log('addTodoGroupCollection', todoGroup.collection);
//         }
//       })
//     },

//     findTodoFromTodoGroup: function(groupArr) {
//       let collectionIdx;
//       let groupIdx;
//       console.log('findTodoFromTodoGroup', todoP);
//       groupArr.forEach((todoGroup, tGroupIdx) => {
//         console.log('tg date', todoGroup.date);
//         if(todoGroup.date === todoP.date) {
//           groupIdx = tGroupIdx;
//           todoGroup.collection.forEach((todoObj, todoIdx) => {
//             console.log(todoObj)
//             if(todoObj === todoP) {
//               collectionIdx = todoIdx;
//             }
//           })
//         }
//       })
//       return {'groupIdx': groupIdx, 'collectionIdx': collectionIdx}
//     },

//     loadHeaderTodoGroups: function() {
//       $('nav').on('click', 'h2', (e) => {
//         e.preventDefault();
//         this.highlight(e.target);
//         if($(e.target).attr('id') === 'nav_header_all_todos'){
//           Display.title('All Todos');
//           console.log('nav_header_all_todos');
//           this.mainTodos = this.localAllTodos;
//           this.inCompletedTodoGroup = false;
//           Display.main();
//         } else {
//           Display.title('Completed');
//           this.mainTodos = this.localAllTodos
//           this.filterCompletedTodos();
//           console.log('mainCompletedTodos', this.mainCompletedTodos);
//           this.mainTodos = this.mainCompletedTodos;
//           this.inCompletedTodoGroup = true;
//           this.headerCompleted = true;
//           Display.main();
//           $('#main_all_todos').hide();
//         }
//       });
//     },

//     loadGroups: function() {
//       $('nav').on('click', 'li', e => {
//         e.preventDefault();
//         this.highlight(e.target);
//         const todoGroupId = $(e.target).attr('data');
//         const group = $(e.target).closest('ul').attr('id');
//         //find collection
//         if (group === 'nav_todo_list') {
//           const index = this.findTodoGroupsIndex(this.navAllTodoGroups, todoGroupId);
//           this.mainTodos = this.navAllTodoGroups[index].collection
//           this.inCompletedTodoGroup = false;
//           Display.main();
//         } else {
//           const index = this.findTodoGroupsIndex(this.navCompletedTodoGroups, todoGroupId);
//           this.mainTodos = this.navCompletedTodoGroups[index].collection;
//           this.inCompletedTodoGroup = true;
//           this.headerCompleted = false;
//           Display.main();
//         }
//         const title = document.querySelector(`li[data='${todoGroupId}']`).childNodes[0].textContent;
//         Display.title(title);
//       })
//     },

//     findTodoGroupsIndex(todoGroupsCollection, id){
//       let index;
//       todoGroupsCollection.forEach((todoGroup, idx) => {
//         if(String(todoGroup.id) === id) {
//           index = idx;
//         }
//       })
//       return index;
//     },

//     //modal functions

//     displayModalValues: function() {
//       $('#modal input').val(this.todoP.title)
//       $('#modal select[name=month]').val(this.todoP.month);
//       $('#modal select[name=day]').val(this.todoP.day);
//       $('#modal select[name=year]').val(this.todoP.year);
//       $('#modal textarea').val(this.todoP.description);
//       //console.log('displayedInputs', todoP)
//     },

//     resetModal: function() {
//       const $month = $('#modal select[name=month]');
//       const $day = $('#modal select[name=day]');
//       const $year = $('#modal select[name=year]');
//       $month.val($month.find('option').eq(0).text());
//       $day.val($day.find('option').eq(0).text());
//       $year.val($year.find('option').eq(0).text());
//     },

//     obtainInputs: function() {

//       this.todoP['title'] = $('#modal input').val()
//       const month = $('#modal select[name=month]').val()
//       const day = $('#modal select[name=day]').val();
//       const year = $('#modal select[name=year]').val();

//       if (Number(month)){
//         this.todoP['month'] = month;
//       } else {
//         this.todoP['month'] = '00'
//       }
//       if (Number(day)){
//         this.todoP['day'] = day;
//       } else {
//         this.todoP['day'] = '00'        
//       }
//       if (Number(year)){
//         this.todoP['year'] = year;
//       } else {
//         this.todoP['year'] = '0000'
//       }
      
//       this.todoP['description'] = $('#modal textarea').val();
//         if(this.todoP.id){
//         } else {
//           this.todoP['completed'] = false;
//         }
//       console.log('obtainInputs', this.todoP);
//     },

//     createModal: function() {
//       $('#modal').fadeIn();
//     },

//     removeModal: function() {
//       $('#modal').on('click', (e) => {
//         e.preventDefault();
//         e.stopPropagation();
//         console.log('stopPropagation')
//       })
//       $(document).on('click', (e) => {
//         e.preventDefault();
//         $('#modal').hide();
//         console.log('hide Modal');
//       })
//     },

//     //Functions

//     highlight: function(element) {
//       $('nav').find('.highlight').removeClass('highlight');
//       $(element).addClass('highlight')     
//     },

//     getCompletedCount: function() {
//       let count = 0;
//       this.localAllTodos.filter((obj) => {
//         if(obj.completed){
//           count += 1;
//         }
//       })
//       return count
//     },

//     filterCompletedTodos: function() {
//       this.mainCompletedTodos = this.mainTodos.filter((todoObj) => {
//         return todoObj.completed;
//       })
//       console.log('filterCompletedTodos', this.mainCompletedTodos) 
//     },

//     toggleComplete: function() {
//       console.log('toggleComplete', this.todoP.completed);
//       this.todoP.completed = !(this.todoP.completed);
//       Drive.editTodo()
//     },


//     formatTodos: function() {
//       //console.log('formatTodos');
//       this.localAllTodos.forEach((todoObj) => {
//         this.addFormatedDate(todoObj);
//       })
//     },

//     obtainID: function(element) {
//       const id = $(element).closest('li').attr('data');
//       return id
//     },

//     searchAllTodos: function(id) {
//       //console.log('searchAllTodos', id);
//       this.localAllTodos.forEach((todoObj) => {
//         if (String(todoObj.id) === id) {
//           this.todoP = todoObj;
//           console.log('match', this.todoP);
//         }
//       })
//     },

//     addFormatedDate: function(todoObj) {
//       if(todoObj.month === '00' || todoObj.year === '0000') {
//         todoObj.date = 'No Due Date';
//       } else {
//         todoObj.date = `${todoObj.month}/${todoObj.year.substring(2)}`;
//       }
//       return todoObj; 
//     },


//     //buttons

//     btnSaveTodo: function() {
//       $('button[name=save_todo]').on('click', (e) => {
//         e.preventDefault();
//         this.obtainInputs();
//         if (this.todoP.title.length < 3) {
//           alert('You must enter a title at lease 3 characters long.');
//         } else {
//           if (this.todoP.id) {
//             console.log('save has id', this.todoP)
//             Drive.editTodo();
//             $('#modal').fadeOut();
//           } else {
//             console.log('save does not have id', this.todoP);
//             Drive.addTodo();
//             $('#modal').fadeOut();
//           }
//         }
//       })
//     },

//     btnEditTodo: function() {
//       $('article').on('click', 'p', (e) => {
//         e.preventDefault();
//         e.stopPropagation();
//         const id = this.obtainID($(e.target));
//         this.searchAllTodos(id);
//         console.log('before create modal', this.todoP);
//         this.createModal();
//         console.log('after create modal', this.todoP);
//         this.displayModalValues();
//       })
//     },

//     btnCheckbox: function() {
//       $('article').on('click', 'dt', (e) => {
//         e.preventDefault();
//         e.stopPropagation();
//         const id = this.obtainID($(e.target));
//         console.log('checkbox', id)
//         this.searchAllTodos(id);
//         this.toggleComplete();
//       })
//     },

//     btnDelete: function() {
//       $('article').on('click', 'dd', (e) => {
//         e.preventDefault();
//         const id = this.obtainID($(e.target));
//         this.searchAllTodos(id); 
//         Drive.deleteTodo();
//       })
//     },


//     btnCreateTodo: function() {
//       $('button[name=addTodo]').on('click', (e) => {
//         e.preventDefault();
//         e.stopPropagation();
//         this.todoP = {};
//         console.log('btnCreateTodo', this.todoP)
//         this.displayModalValues();
//         this.resetModal();
//         this.createModal();
//       })
//     },

//     btnMarkComplete: function() {
//       $('button[name=mark_complete]').on('click', (e) => {
//         e.preventDefault();
//         this.obtainInputs();
//         this.todoP['completed'] = true;
//         if (this.todoP.id) {
//           Drive.editTodo();
//           $('#modal').hide();
//         } else {
//           alert('Cannot mark as complete as item has not been created yet!');
//         }
//       })    
//     },

//     //Local Drive 

//     loadPage: function(data) {
//       this.localAllTodos = data;
//       this.mainTodos = data;
//       console.log('mainTodos', this.mainTodos);
//       this.formatTodos();
//       this.createAllTodoGroups();
//       Display.main();
//       Display.nav();
//     },

//     processAdd: function(responseId) {
//       this.todoP.id = responseId;
//       console.log('processAdd', this.todoP);
//       this.localAllTodos.push(this.addFormatedDate(this.todoP));
//       this.mainTodos = this.localAllTodos;
//       this.highlight(document.getElementById('nav_header_all_todos'));
//       this.inCompletedTodoGroup = false;
//       Display.nav();
//       Display.main();
//       Display.title('All Todos');
//     },

//     processEdit: function() {
//       this.todoP = this.addFormatedDate(this.todoP);
//       console.log('editMainLocalTodo', this.todoP);
//       this.replaceTodo();
//       this.replaceMainTodo();
//       Display.nav();
//       Display.main();
//       console.log('editNavLocalTodo', this.todoP);
//     },

//     processRemove: function(){
//       this.removeTodo();
//       if(this.mainTodos === this.localAllTodos){
//       } else {
//         this.removeMainTodo();
//       } 
//       Display.nav();
//       Display.main();
//     },

//     // Local functions

//     removeTodo: function() {
//       let index;
//       console.log('remove todo', this.todoP.id)
//       this.localAllTodos.forEach((el, idx) => {
//         if (el.id === this.todoP.id){
//           index = idx;
//         }
//       })
//       this.localAllTodos.splice(index, 1);
//     },

//     removeMainTodo: function() {
//       let index;
//       console.log('remove Main todo', this.todoP.id)
//       this.mainTodos.forEach((el, idx) => {
//         if (el.id === this.todoP.id){
//           index = idx;
//         }
//       })
//       this.mainTodos.splice(index, 1);
//     },

//     replaceTodo: function() {
//       console.log('replaceTodo', this.todoP);
//       console.log(this.localAllTodos);
//       let index;
//       this.localAllTodos.forEach((todo, idx) => {
//         console.log(todo.id);
//         if(todo.id === this.todoP.id){
//           index = idx
//         }
//       })
//       this.localAllTodos.splice(index, 1, this.todoP);      
//     },

//     replaceMainTodo: function() {
//       console.log('replaceMainTod', this.todoP);
//       console.log(this.mainTodos);
//       let index;
//       this.mainTodos.forEach((todo, idx) => {
//         console.log(todo.id);
//         if(todo.id === this.todoP.id){
//           index = idx
//         }
//       })
//       this.mainTodos.splice(index, 1, this.todoP);
//     },

//     init: function() {
//       console.log('init');
//       Drive.retrieveAllTodos();
//       this.btnCreateTodo();
//       this.btnEditTodo();
//       this.btnSaveTodo();
//       this.btnMarkComplete();
//       this.btnCheckbox();
//       this.btnDelete();
//       this.loadHeaderTodoGroups();
//       this.loadGroups();
//       this.removeModal();
//     },
//   }

//   //Constructor/Prototype Pattern
//   const LStodoApp = new CreateTodoApp();

//   LStodoApp.init();
//   console.dir(LStodoApp);
//   console.log(LStodoApp.constructor === CreateTodoApp)    //Since I replaced the entire prototype I added constructor property?
//   console.log(Object.getPrototypeOf(LStodoApp) === CreateTodoApp.prototype);
// })


//With the Class keyword

