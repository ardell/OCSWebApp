angular
  .module('ocs')
  .controller('PatientsShowController', ['$scope', '$routeParams', 'Patient', function($scope, $routeParams, Patient) {
    $scope.patient = null;

    // Load the patient object from the back-end
    var query   = new Parse.Query(Patient);
    query.get($routeParams.id, {
      success: function(patient) {
        $scope.$apply(function() { $scope.patient = patient; });

        // Get all EyeImage objects associated with Patient
        var imagesRelation = patient.relation("EyeImages");
        var query          = imagesRelation.query();
        query.find({
          success: function(images) {
            // Add a thumbnailUrl method to each eyeImage as a convenience
            // method for the template
            _.each(images, function(eyeImage) {
              eyeImage.thumbnailUrl = function() {
                var thumbnail = eyeImage.get('Thumbnail');
                if (thumbnail) {
                  return thumbnail.url();
                } else {
                  return eyeImage.get('Image').url();
                }
              };
            });

            var filterImages = function(eye, position) {
              return _.filter(images, function(image) {
                return (image.get('Eye') == eye && image.get('Position') == position);
              });
            };

            $scope.$apply(function() {
              $scope.images = {
                OD: {
                  superior: filterImages('OD', 'Superior'),
                  nasal:    filterImages('OD', 'Nasal'),
                  central:  filterImages('OD', 'Central'),
                  temporal: filterImages('OD', 'Temporal'),
                  inferior: filterImages('OD', 'Inferior')
                },
                OS: {
                  superior: filterImages('OS', 'Superior'),
                  nasal:    filterImages('OS', 'Nasal'),
                  central:  filterImages('OS', 'Central'),
                  temporal: filterImages('OS', 'Temporal'),
                  inferior: filterImages('OS', 'Inferior')
                }
              };
              $scope.numImages = images.length;
            });
          }
        });
      },
      error: function(object, error) {
        throw new Error(error.message);
      }
    });
  }]);

