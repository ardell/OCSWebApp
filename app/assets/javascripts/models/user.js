angular
  .module('ocs')
  .service('User', function() {
    Parse.initialize(
      'kj1p0NcAg3KwmTebw5N4MtbZCkx2WASRWSxTWuto', 
      'Lte1YsyrZ0LvG72Zjd4DZ6hTsyvI257MG07lCK61'
    );
    Parse.serverURL = "https://ocular-cellscope-server.herokuapp.com/parse"

    return {
      isLoggedIn: !!Parse.User.current(),
      logIn: function(username, password, options) {
        Parse.User.logIn(username, password, options);
        this.isLoggedIn = true;
      },
      logOut: function() {
        Parse.User.logOut();
        this.isLoggedIn = false;
      },
      current: Parse.User.current
    };
  });

