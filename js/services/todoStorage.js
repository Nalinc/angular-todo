/*global angular */

/**
 * Services that persists and retrieves todos from localStorage or a backend API
 * if available.
 *
 * They both follow the same API, returning promises for all changes to the
 * model.
 */
angular.module('todomvc')
	.factory('todoStorage', function ($http, $injector) {
		'use strict';

		// Detect if an API backend is present. If so, return the API module, else
		// hand off the localStorage adapter
		return $http.get('/api')
			.then(function () {
				return $injector.get('api');
			}, function () {
				return $injector.get('pouchDbStorage');
			});
	})

	.factory('api', function ($resource) {
		'use strict';

		var store = {
			todos: [],

			api: $resource('/api/todos/:id', null,
				{
					update: { method:'PUT' }
				}
			),

			clearCompleted: function () {
				var originalTodos = store.todos.slice(0);

				var incompleteTodos = store.todos.filter(function (todo) {
					return !todo.completed;
				});

				angular.copy(incompleteTodos, store.todos);

				return store.api.delete(function () {
					}, function error() {
						angular.copy(originalTodos, store.todos);
					});
			},

			delete: function (todo) {
				var originalTodos = store.todos.slice(0);

				store.todos.splice(store.todos.indexOf(todo), 1);
				return store.api.delete({ id: todo.id },
					function () {
					}, function error() {
						angular.copy(originalTodos, store.todos);
					});
			},

			get: function () {
				return store.api.query(function (resp) {
					angular.copy(resp, store.todos);
				});
			},

			insert: function (todo) {
				var originalTodos = store.todos.slice(0);

				return store.api.save(todo,
					function success(resp) {
						todo.id = resp.id;
						store.todos.push(todo);
					}, function error() {
						angular.copy(originalTodos, store.todos);
					})
					.$promise;
			},

			put: function (todo) {
				return store.api.update({ id: todo.id }, todo)
					.$promise;
			}
		};

		return store;
	})

	.factory('localStorage', function ($q) {
		'use strict';

		var STORAGE_ID = 'todos-angularjs';

		var store = {
			todos: [],

			_getFromLocalStorage: function () {
				return JSON.parse(localStorage.getItem(STORAGE_ID) || '[]');
			},

			_saveToLocalStorage: function (todos) {
				localStorage.setItem(STORAGE_ID, JSON.stringify(todos));
			},

			clearCompleted: function () {
				var deferred = $q.defer();

				var incompleteTodos = store.todos.filter(function (todo) {
					return !todo.completed;
				});

				angular.copy(incompleteTodos, store.todos);

				store._saveToLocalStorage(store.todos);
				deferred.resolve(store.todos);

				return deferred.promise;
			},

			delete: function (todo) {
				var deferred = $q.defer();

				store.todos.splice(store.todos.indexOf(todo), 1);

				store._saveToLocalStorage(store.todos);
				deferred.resolve(store.todos);

				return deferred.promise;
			},

			get: function () {
				var deferred = $q.defer();

				angular.copy(store._getFromLocalStorage(), store.todos);
				console.log(store.todos);
				deferred.resolve(store.todos);

				return deferred.promise;
			},

			insert: function (todo) {
				var deferred = $q.defer();

				store.todos.push(todo);

				store._saveToLocalStorage(store.todos);
				deferred.resolve(store.todos);

				return deferred.promise;
			},

			put: function (todo, index) {
				var deferred = $q.defer();

				store.todos[index] = todo;

				store._saveToLocalStorage(store.todos);
				deferred.resolve(store.todos);

				return deferred.promise;
			}
		};

		return store;
	})

	.factory('pouchDbStorage', function ($q) {
		'use strict';
		var db = new PouchDB('ToDoDb');

		var store = {
			todos: [],

			clearCompleted: function () {
				var deferred = $q.defer();

				var incompleteTodos = store.todos.filter(function (todo) {
					return !todo.completed;
				});

				angular.copy(incompleteTodos, store.todos);



				return deferred.promise;
			},

			delete: function (todo) {
				var deferred = $q.defer();


				return deferred.promise;
			},

			get: function () {
				var deferred = $q.defer();

				db.allDocs({
					include_docs: true,
  					attachments: true
				}).then(function(response){
					
					for(var i=0;i<response.total_rows;i++){
						store.todos.push(response.rows[i].doc)
					}
					console.log(store.todos);
					deferred.resolve(store.todos);
				},function(errGET){
					deferred.reject(errGET);
				});

				return deferred.promise;
			},

			insert: function (todo) {
				var deferred = $q.defer();
				console.log(todo)
				db.post(todo).then(function (response) {
				  // handle response
				  todo._id=response._id;
				  todo._rev=response._rev;
				  store.todos.push(todo)
				  console.log('task "'+ todo.title +'"" added to pouchdb');
				  deferred.resolve(store.todos);
				},function(errInsert){
					deferred.reject(errInsert)
					console.log(errInsert);
				});				

				return deferred.promise;
			},

			put: function (todo, index) {
				var deferred = $q.defer();

				db.get(store.todos[index]._id).then(function(doc) {
					console.log(doc)
					var newObj = {
								    _id: doc._id.toString(),
								    _rev: doc._rev,
								    title: todo.title,
								    completed: todo.completed
								  }
				  console.log(newObj);
				  return db.put(newObj);
				}).then(function(response) {
				  // handle response
				  console.log(response)
				  deferred.resolve(response)
				}).catch(function (err) {
				  console.log(err);
				  deferred.reject(err)
				});

				return deferred.promise;
			},

			clearDb: function(){
				var deferred = $q.defer;

				db.destroy().then(function(res){
					deferred.resolve(res)
				},function(err){
					deferred.reject(err)
				})
				return deferred.promise;
			}
		};

		return store;
	});