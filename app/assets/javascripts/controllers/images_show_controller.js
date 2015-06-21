angular
  .module('ocs')
  .controller('ImagesShowController', ['$scope', '$routeParams', 'Patient', 'EyeImage', function($scope, $routeParams, Patient, EyeImage) {
    $scope.patient  = null;
    $scope.eyeImage = null;

    var patientId = $routeParams.patientId;
    var imageId   = $routeParams.id;

    var query = new Parse.Query(Patient);
    query.get(patientId, {
      success: function(patient) {
        $scope.$apply(function() { $scope.patient = patient; });
      },
      error: function() { alert("ERROR: unable to get patient info"); }
    });

    var query = new Parse.Query(EyeImage);
    query.get(imageId, {
      success: function(eyeImage) {
        $scope.$apply(function() { $scope.eyeImage = eyeImage; });
      },
      error: function() { alert("ERROR: unable to get eye image"); }
    });

    // Get all EyeImage objects associated with Patient
    // var imagesRelation = patient.relation("EyeImages");
    // var query = imagesRelation.query()
    // console.log(JSON.stringify(options.imageId, null, 4));
    // query.equalTo("objectId", options.imageId);
    // query.first({
    //   success: function(eyeImage){
    //     var template = _.template($('#image-template').html(),  
    //     {patient: patient, eyeImage: eyeImage}); 
    //     that.$el.html(template); //inject html into the bound element
    //   }
    // });
  }]);

