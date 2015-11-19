/*global angular */

/**
 * Services that persists and retrieves todos from localStorage or a backend API
 * if available.
 *
 * They both follow the same API, returning promises for all changes to the
 * model.
 */
angular.module('todomvc')
	.factory('pouchDbStorage', function ($q) {
		'use strict';
		var db = new PouchDB('testdb');

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
				db.remove(todo).then(function (response) {
				  console.log('Document deleted ='+ JSON.stringify(response));	
				  store.todos.splice(store.todos.indexOf(todo), 1);
				  deferred.resolve(store.todos);
				},function(errInsert){
					deferred.reject(errInsert)
					console.log("Document insert error = " + errInsert);
				});
				return deferred.promise;
			},

			get: function () {
				store.todos = [];	
				var deferred = $q.defer();

				db.allDocs({
					include_docs: true,
  					attachments: true
				}).then(function(response){
					
					for(var i=0;i<response.total_rows;i++){
						store.todos.push(response.rows[i].doc)
					}
					deferred.resolve(store.todos);
				},function(errGET){
					deferred.reject(errGET);
				});

				return deferred.promise;
			},

			insert: function (todo) {
				var deferred = $q.defer();				
				db.post(todo).then(function (response) {
				  // handle response				 
				  todo._id=response.id;
				  todo._rev=response.rev;
				  store.todos.push(todo);
				  console.log('Document inserted ='+ JSON.stringify(response));				   
				  deferred.resolve(store.todos);
				},function(errInsert){
					deferred.reject(errInsert)
					console.log("Document insert error = " + errInsert);
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
				var deferred = $q.defer();

				db.destroy().then(function(res){
					store.todos = [];
					deferred.resolve(store.todos);
				},function(err){
					deferred.reject(err)
				})
				return deferred.promise;
			},

			sync: function(){
				console.log("Syncing");
				var deferred = $q.defer();
				var sync = PouchDB.sync('testdb', 'http://manav:5984/couchdb/testdb', {				 
				}).on('complete', function (info) {
				  console.log("Sync Complete");
				  deferred.resolve(info);
				}).on('error', function (err) {
				  console.log("Sync error");
				  deferred.reject(err);
				});
				return deferred.promise;
			}
		};

		return store;
	});