/*global angular */

/**
 * The main controller for the app. The controller:
 * - retrieves and persists the model via the todoStorage service
 * - exposes the model to the template and provides event handlers
 */
angular.module('todomvc')
	.controller('TodoCtrl', function TodoCtrl($scope, $routeParams, $filter, $interval, pouchDbStorage, todos) {
		'use strict';

		$scope.todos = todos;	
		$scope.enableAutoSync = false;	
		$scope.hideSyncButton = false;

		$scope.newTodo = '';
		$scope.editedTodo = null;	

		var autoSyncInterval;	

		$scope.addTodo = function () {
			var newTodo = {
				title: $scope.newTodo.trim(),
				priority: "P1"
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
		};

		$scope.$watch('enableAutoSync', function(newValue, oldValue) {
		  if(newValue == true) {
		  	console.log("Enabling automatic sync");
		  	$scope.hideSyncButton = true;
		  	autoSyncInterval = $interval(function(){
				$scope.sync();
			}, 5000);
		  } else {
		  	console.log("Disabling automatic sync");
		  	$scope.hideSyncButton = false;	
		  	$interval.cancel(autoSyncInterval);
		  }
		});

		$scope.sync = function(){
			pouchDbStorage.sync().then(function() {
				pouchDbStorage.get().then(function(response){
                        $scope.todos =  response;
                });
			});
		};
		
	});
