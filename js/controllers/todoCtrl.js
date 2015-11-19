/*global angular */

/**
 * The main controller for the app. The controller:
 * - retrieves and persists the model via the todoStorage service
 * - exposes the model to the template and provides event handlers
 */
angular.module('todomvc')
	.controller('TodoCtrl', function TodoCtrl($scope, $routeParams, $filter, pouchDbStorage, todos) {
		'use strict';

		$scope.todos = todos;		

		$scope.newTodo = '';
		$scope.editedTodo = null;		

		$scope.addTodo = function () {
			var newTodo = {
				title: $scope.newTodo.trim()
			};

			if (!newTodo.title) {
				return;
			}

			$scope.saving = true;

			pouchDbStorage.insert(newTodo)
				.then(function success() {
					$scope.newTodo = '';
				})
				.finally(function () {
					$scope.saving = false;
				});
		};

		$scope.removeTodo = function (todo) {			
			pouchDbStorage.delete(todo).then(function(res){
				//console.log(todo);
				//console.log('database cleared');
			},function(err){
				//console.log(err)
			})
		};
		

		$scope.clearDb = function(){
			pouchDbStorage.clearDb().then(function(res){
				$scope.todos = [];
			},function(err){
				//console.log(err)
			})
		}

		$scope.sync = function(){
			pouchDbStorage.sync();
		}
		
	});
