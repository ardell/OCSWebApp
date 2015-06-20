angular
  .module('ocs')
  .controller('PatientsIndexController', function($scope, Patient) {
    $scope.filterByStudy = '';
    $scope.search        = '';
    $scope.sortColumn    = 'examDate';
    $scope.sortAscending = false;
    $scope.patients      = [];
    $scope.studies       = [];
    $scope.loading       = false;

    var fetchPatients = function() {
      var query = new Parse.Query(Patient);
      query.limit(100000); // If we don't specify a limit, parse only gives us 100 records
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

