angular
  .module('ocs')
  .config(function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/index.html',
        controller:  'IndexController'
      })
      .when('/log-in', {
        templateUrl: 'views/log_in.html',
        controller:  'LogInController'
      })
      .when('/log-out', {
        templateUrl: 'views/log_out.html',
        controller:  'LogOutController'
      })
      .when('/patients', {
        templateUrl: 'views/patients/index.html',
        controller:  'PatientsIndexController'
      })
      .when('/patients/:id', {
        templateUrl: 'views/patients/show.html',
        controller:  'PatientsShowController'
      })
      .when('/patients/:patientId/images/:id', {
        templateUrl: 'views/images/show.html',
        controller:  'ImagesShowController'
      })
      ;
  })
  .run(function($rootScope, $location) {
    // Redirect unauthenticated users to the login page
    $rootScope.$on("$routeChangeStart", function(event, next, current) {
      // Initialize Parse (seems to be idempotent) before we check login state
      Parse.initialize(
        'kj1p0NcAg3KwmTebw5N4MtbZCkx2WASRWSxTWuto', 
        'Lte1YsyrZ0LvG72Zjd4DZ6hTsyvI257MG07lCK61'
      );

      if (!Parse.User.current() && next.templateUrl != 'views/log_in.html') {
        // The user is NOT logged in; redirect to login page
        $location.path("/log-in");
      }

      if (Parse.User.current() && next.templateUrl == 'views/log_in.html') {
        // The user IS logged in; redirect to /patients
        $location.path("/patients");
      }

      if (next.templateUrl == 'views/index.html') {
        $location.path("/patients");
      }
    });
  })
  ;

