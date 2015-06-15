angular
  .module('ocs')
  .service('EyeImage', function() {
    return Parse.Object.extend({
      className: 'EyeImage'
    });
  });

