angular
  .module('ocs')
  .controller('LogOutController', ['User', '$location', '$scope', function(User, $location, $scope) {
    $scope.user = User;
    User.logOut();
    $location.path('/log-in');
  }]);

