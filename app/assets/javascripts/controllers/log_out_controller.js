angular
  .module('ocs')
  .controller('LogOutController', function(User, $location, $scope) {
    $scope.user = User;
    User.logOut();
    $location.path('/log-in');
  });

