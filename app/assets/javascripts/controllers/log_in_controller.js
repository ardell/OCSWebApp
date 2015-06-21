angular
  .module('ocs')
  .controller('LogInController', ['User', '$location', '$scope', function(User, $location, $scope) {
    $scope.username   = null;
    $scope.password   = null;
    $scope.inProgress = false;

    $scope.user  = User;
    $scope.logIn = function() {
      $scope.error      = null;
      $scope.inProgress = true;

      // Attempt to log in with the provided credentials
      User.logIn($scope.username, $scope.password, {
        success: function(user) {
          $scope.$apply(function() {
            $location.path('/patients');
            $scope.inProgress = false;
          });
        },
        error: function(user, error) {
          $scope.$apply(function() {
            $scope.error      = "Invalid username or password. Please try again.";
            $scope.inProgress = false;
          });
        }
      });
    };
  }]);

