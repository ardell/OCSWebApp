angular
  .module('ocs')
  .controller('PatientsIndexController', function($scope, Patient) {
    var PAGE_SIZE        = 100000;
    $scope.filterByStudy = 'All';
    $scope.sortBy        = 'examDate';
    $scope.sortDirection = 'descending';
    $scope.patients      = [];
    $scope.studies       = [];
    $scope.loading       = false;

    var fetchPatients = function() {
      var query = new Parse.Query(Patient);
      query.limit(PAGE_SIZE);
      query[$scope.sortDirection]($scope.sortBy);
      if ($scope.filterByStudy != 'All') {
        query.equalTo("study", $scope.filterByStudy);
      }
      $scope.loading = true;
      query.find({
        success: function(arr) {
          $scope.$apply(function() {
            $scope.patients = arr;
            $scope.loading  = false;

            // Only set up the list of studies the first time (while the list
            // is un-filtered)
            if ($scope.studies.length < 1) {
              $scope.studies  = _.uniq(
                _.pluck(
                  _.pluck(arr, 'attributes'),
                  'study'
                )
              );
            }
          });
        },
        error: function(collection, error) {
          $scope.loading = false;
          alert("ERROR fetching patients!");
        }
      });
    };

    // Fetch patients
    fetchPatients($scope.filterByStudy, $scope.sort);
    $scope.$watch('filterByStudy', fetchPatients);

    // Coordinate changes from sortBy to sortDirection
    $scope.$watch('sortBy', function() {
      if (!$scope.sortBy) return;
      if ($scope.sortBy == 'examDate') {
        $scope.sortDirection = 'descending';
      } else {
        $scope.sortDirection = 'ascending';
      }

      fetchPatients();
    });
  });

