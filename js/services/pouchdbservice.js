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

			update: function (todo, index) {				
				var deferred = $q.defer();				
				db.put(todo).then(function (response) {
				  console.log('Document updated ='+ JSON.stringify(response));	
				  todo._id=response.id;
				  todo._rev=response.rev;
				  store.todos[index] = todo;
				  deferred.resolve();
				},function(errInsert){
					deferred.reject(errInsert)
					console.log("Document update error = " + errInsert);
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