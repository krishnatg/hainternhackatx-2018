angular.module('demo', [])
.controller('Hello', function($scope, $http) {
   console.log('yo');
   $http.get('http://10.81.17.163:2000/api/flights').
       then(function(response) {
           console.log('yes');
           $scope.greeting = response.data;
           console.log(response.data);
       }, function(error) {
           console.log('what');
           $scope.greeting = 'sure';
       });
});