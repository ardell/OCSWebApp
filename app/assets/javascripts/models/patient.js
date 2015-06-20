angular
  .module('ocs')
  .service('Patient', function() {
    return Parse.Object.extend({
      className: 'Patient'
    });
  });

