angular
  .module('ocs')
  .controller('PatientsIndexController', function($scope, Patient) {
    window.s = $scope;

    var PAGE_SIZE        = 100000;
    $scope.filterByStudy = 'Any study';
    $scope.search        = '';
    $scope.sortColumn    = 'examDate';
    $scope.sortAscending = false;
    $scope.patients      = [];
    $scope.studies       = [];
    $scope.loading       = false;

    var fetchPatients = function() {
      var direction = 'descending';
      if ($scope.sortAscending) direction = 'ascending';

      var query = new Parse.Query(Patient);
      query.limit(PAGE_SIZE);
      query[direction]($scope.sortColumn);
      if ($scope.filterByStudy != 'Any study') {
        query.equalTo("study", $scope.filterByStudy);
      }
      $scope.loading = true;
      query.find({
        success: function(arr) {
          $scope.$apply(function() {
            $scope.patients = _.map(arr, function(obj) {
              var attrs = obj.attributes;
              delete attrs.EyeImages;
              attrs.fullName = [attrs.lastName, attrs.firstName].join(', ');

              if (attrs.examDate) {
                attrs.formattedExamDate = [
                  attrs.examDate.toLocaleDateString(),
                  attrs.examDate.toLocaleTimeString()
                ].join(' ');
              } else {
                attrs.formattedExamDate = null;
              }

              return attrs;
            });
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

    // Handle requests to change sort order
    $scope.sort = function(column) {
      if ($scope.sortColumn == column) {
        // If we're already sorted by that column, toggle the order
        $scope.sortAscending = !$scope.sortAscending;
      } else {
        // Otherwise, sort by the column and reset direction
        $scope.sortColumn = column;
        $scope.sortAscending = ($scope.sortColumn != 'examDate');
      }
    };
  });

