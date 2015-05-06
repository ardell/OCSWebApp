$(function() {

    Parse.$ = jQuery;

    Parse.initialize("kj1p0NcAg3KwmTebw5N4MtbZCkx2WASRWSxTWuto", 
                     "Lte1YsyrZ0LvG72Zjd4DZ6hTsyvI257MG07lCK61");
    
    //Model
    var Patient = Parse.Object.extend({
      className: "Patient",
    });
    var PatientList = Parse.Collection.extend({
      model: Patient
    //When you make a new patientList, you should be able to filter it!
    });
   
    var HeaderView = Parse.View.extend({
      events: {
        "click .log-out": "logOut"
      },

      el: ".header",

      initialize: function() {
        _.bindAll(this, "logOut");
        this.render();
      },

      logOut: function(e) {
        console.log("attempting to log out");
        Parse.User.logOut();
        this.undelegateEvents();
        router.navigate("login",{trigger: true});
        delete headerView;
        delete this;
      },
      render: function(){
        var template = _.template($('#header-template').html(),  
          {}); 
        this.$el.html(template); //inject html into the bound element
      }
    });

    var LogInView = Parse.View.extend({
      events: {
        "submit form.login-form": "logIn",
      },

      el: ".page",
    
      initialize: function() {
        _.bindAll(this, "logIn");
        this.render();
      },

      logIn: function(e) {
        var self = this;
        var username = this.$("#login-username").val();
        var password = this.$("#login-password").val();
            
        Parse.User.logIn(username, password, {
          success: function(user) {
            console.log("LOGGED IN " + username + " with " + password);
            console.log(router);
            router.navigate("home",{trigger: true});
            self.undelegateEvents();
            delete self;
          },

          error: function(user, error) {
            self.$(".login-form .error").html("Invalid username or password. Please try again.").show();
            self.$(".login-form button").removeAttr("disabled");
          }
        });

        this.$(".login-form button").attr("disabled", "disabled");

        return false;
      },

      render: function() {
        console.log("rendering LIV");
        this.$el.html(_.template($("#login-template").html()));
        this.delegateEvents();
      }
    });

    var PatientListView = Parse.View.extend({
      el: '.page',
      pageNumber: 0,
      events: {
        "click #next": "next",
        "change #studySelect": "selectStudy"
      },

      render: function() {
        console.log("Rendering PLV...");
        var that = this;

        patients.fetch({  
          success: function(patients)
          {           
            this.studies = _.uniq(patients.pluck("study"));

            var template = _.template($('#patient-list-template').html(),  
              {patients: patients.models.reverse(), studies: this.studies, selected:"None"}); // patients.models
            that.$el.html(template); //inject html into the bound element
          },
          error: function(collection, error)
          {
            alert("ERROR fetching patients!");
          }
        });
      },

      selectStudy: function(){
        var studyName = $( "#studySelect option:selected" ).text();
        var url = "filter/" + studyName + "/" + this.pageNumber;
        if(studyName == "All")
        {
          router.navigate("home",{trigger: true});
        }
        else
        {
          router.navigate(url,{trigger: true});
        }
      },

      next: function(){
        var studyName = $( "#studySelect option:selected" ).text();
        var url = "filter/" + studyName + "/" + this.pageNumber;
        
        this.pageNumber++;
        if(studyName == "All")
        {
          router.navigate("home",{trigger: true});
        }
        else
        {
          router.navigate(url,{trigger: true});
        }
      },

      filter: function(options){
        //THE OTHER OPTION IS TO SHOW THE PATIENTS.MODELS
        console.log("Sorting Patient List view...");
        var that = this;
        this.pageNumber = options.pageNumber;
        console.log(JSON.stringify(options, null, 4));
        var q = new Parse.Query(Patient);
        q.equalTo("study", options.studyName);
        q.limit(100);
        q.skip(100*options.pageNumber);
        q.descending("examDate");
        q.find({
          success: function(patients)
          {
            var template = _.template($('#patient-list-template').html(),  
              {patients: patients, studies: this.studies, selected:options.studyName}); // patients.models
            that.$el.html(template); //inject html into the bound element 
          },
          error: function(collection, error)
          {
            alert("ERROR fetching patients!");
          }
        });
      }
    });

    var PatientDetailView = Parse.View.extend({
      "el": ".page",

      events: {
        "click #downloadAll": "downloadAll"
      },

     downloadAll: function(e) {
        console.log("LETS DOWNLOAD");
        alert("Zip File is being generated! This may take awhile...")
        var str = Parse.history.fragment;
        var fragments = str.split("/");
        var objectId = fragments[fragments.length-1];
        $.post("https://cellscope4-8080.terminal.com/zip",{"objectId":objectId},
          function(data){
            alert("Finished Generating Zip File! Zip File containing all images is now being downloaded");
            document.getElementById('my_iframe').src = data.zipName;
          }
        );

      },

      "render": function(id){

        var that = this;
        var q = new Parse.Query(Patient);

        function download_all(event){
          alert(event.data.objectId);
        }

        q.get(id,{
          "success": function(patient){

            //get all EyeImage objects associated with Patient
            var imagesRelation = patient.relation("EyeImages");
            var query = imagesRelation.query();
            
            query.find({
              success: function(images){
                console.log(JSON.stringify(patient, null, 4));

                var ODS = _.filter(images, function(image){
                  if(image.get("Eye") == "OD" && image.get("Position") == "Superior")
                    return true;
                });
                var ODN = _.filter(images, function(image){
                  if(image.get("Eye") == "OD" && image.get("Position") == "Nasal")
                    return true;
                });
                var ODC = _.filter(images, function(image){
                  if(image.get("Eye") == "OD" && image.get("Position") == "Central")
                    return true;
                });
                var ODT = _.filter(images, function(image){
                  if(image.get("Eye") == "OD" && image.get("Position") == "Temporal")
                    return true;
                });
                var ODI = _.filter(images, function(image){
                  if(image.get("Eye") == "OD" && image.get("Position") == "Inferior")
                    return true;
                });

                var OSS = _.filter(images, function(image){
                  if(image.get("Eye") == "OS" && image.get("Position") == "Superior")
                    return true;
                });
                var OSN = _.filter(images, function(image){
                  if(image.get("Eye") == "OS" && image.get("Position") == "Nasal")
                    return true;
                });
                var OSC = _.filter(images, function(image){
                  if(image.get("Eye") == "OS" && image.get("Position") == "Central")
                    return true;
                });
                var OST = _.filter(images, function(image){
                  if(image.get("Eye") == "OS" && image.get("Position") == "Temporal")
                    return true;
                });
                var OSI = _.filter(images, function(image){
                  if(image.get("Eye") == "OS" && image.get("Position") == "Inferior")
                    return true;
                });

                var sortedImages = 
                {
                  OD:
                  {
                    Superior: ODS,                    
                    Nasal: ODN,
                    Central: ODC,
                    Temporal: ODT,
                    Inferior: ODI

                  },
                  OS:
                  {
                    Superior: OSS,                    
                    Nasal: OSN,
                    Central: OSC,
                    Temporal: OST,
                    Inferior: OSI
                  }
                };

                var template = _.template($('#exam-template').html(),  
                {patient: patient, images: sortedImages}); // images
                that.$el.html(template); //inject html into the bound element
              }
            });
          },
          "error": function(object, error){
            throw new Error(error.message);
          }
        })
      }
    });

    var ImageDetailView = Parse.View.extend({
      "el": ".page",
      "render": function(options){
        console.log(JSON.stringify(options, null, 4));
        var that = this;
        var q = new Parse.Query(Patient);
        q.get(options.patientId,{
          "success": function(patient){
            //get all EyeImage objects associated with Patient
            var imagesRelation = patient.relation("EyeImages");
            var query = imagesRelation.query()
            console.log(JSON.stringify(options.imageId, null, 4));
            query.equalTo("objectId", options.imageId);
            query.first({
              success: function(eyeImage){
                var template = _.template($('#image-template').html(),  
                {patient: patient, eyeImage: eyeImage}); 
                that.$el.html(template); //inject html into the bound element
              }
            });
          },
          
        })
      }
    });


    var patientListView = new PatientListView(); 
    var patientDetailView = new PatientDetailView();
    var imageDetailView = new ImageDetailView();

    var patients = new PatientList();
      
    var Router = Parse.Router.extend({
      routes: {
        "": "home",
        "home": "home",
        "login": "login",
        "patient/:id" : "patient",
        "patient/:id/download" : "download",
        "patient/:patientId/image/:imageId" : "image",
        "filter/:studyName/:pageNumber": "filter"
      }
    });
    var router = new Router;
    router.on('route:home', function() {
      if (Parse.User.current()) {
        console.log("confirmation that the user is logged in");
        new HeaderView();
        patientListView.render();
      } 
      else {
        new LogInView();
      }
    })
    router.on('route:login', function() {
      new LogInView();
      console.log("in the login view router");
    })
    router.on('route:patient', function(id){
      patientDetailView.render(id);
    })
    router.on('route:download', function(id){
      console.log("BOOYAH LET'S DOWNLOAD");
    })
    router.on('route:image', function(patientId, imageId){
      imageDetailView.render({patientId: patientId, imageId: imageId});
    })
    router.on('route:filter', function(studyName, pageNumber){
      patientListView.filter({studyName: studyName, pageNumber: pageNumber});
    })

    Parse.history.start();
});