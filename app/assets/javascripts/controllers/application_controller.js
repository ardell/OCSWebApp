angular
  .module('ocs')
  .controller('ApplicationController', ['User', '$scope', function(User, $scope) {
    $scope.user = User;
  }]);

