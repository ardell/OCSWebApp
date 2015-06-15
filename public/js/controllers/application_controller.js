angular
  .module('ocs')
  .controller('ApplicationController', function(User, $scope) {
    $scope.user = User;
  });

