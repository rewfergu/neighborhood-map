define([
  'jquery',
  'knockout',
  'viewModel',
  'getMap',
  'geocode',
  'weather',
  'wikipedia',
  'foursquare',
  'googlePlaces',
  'flickr',
  'packery',
  'imagesloaded',
  'bootstrap',
], function(
  $,
  ko,
  viewModel,
  getMap,
  geocode,
  weather,
  wikipedia,
  foursquare,
  googlePlaces,
  flickr,
  Packery,
  imagesloaded
) {

  var mapIsGo = false;

  ko.bindingHandlers.searchPlace = {
    init: function(element, valueAccessor) {
      $(element).submit(function() {
        geocode.searchPlace(viewModel.placeName()).then(function() {
          console.log('getting services...');
          getServices(viewModel.position.lat(), viewModel.position.long(), viewModel.placeName());
        });

        $('#placeName').removeClass('search');
        console.log('the form has been submitted');
        return false;
      });
    },
  };

  var getTheMap = getMap.then(function() {
    console.log(viewModel.position.lat() + '/' + viewModel.position.long());

    if (viewModel.position.lat() && viewModel.position.long()) {
      geocode.searchCoords(viewModel.position.lat(), viewModel.position.long()).then(function() {
        console.log('getting services...');
        getServices(viewModel.position.lat(), viewModel.position.long(), viewModel.placeName());
      });
    }
  });

  var getServices = function(lat, long, name) {
    // search weather
    weather.getWeather(lat, long);

    // search wikipedia
    wikipedia.searchNearby(lat, long).then(function() {
      viewModel.wikipediaLoaded(true);
      viewModel.wikipediaActive(true);
      imagesloaded('#wikipedia-container', function() {
        new Packery('#wikipedia-container', {
          // options
          itemSelector: '.grid-item',
          gutter: 10,
        });

        $('#wikipedia-container [data-toggle="tooltip"]').tooltip();
      });
    });

    // search foursquare
    foursquare.search(lat, long).then(function() {
      viewModel.foursquareLoaded(true);
      viewModel.foursquareActive(true);
    });

    // search google places
    // googlePlaces.search(lat, long).then(function() {
    //   viewModel.googleLoaded(true);
    //   viewModel.googlePlacesActive(true);
    // });

    // search flickr
    // flickr.search(lat, long).then(function() {
    //   viewModel.flickrLoaded(true);
    //   viewModel.flickrActive(true);
    //
    //   imagesloaded('#flickr-container', function() {
    //     new Packery('#flickr-container', {
    //       // options
    //       itemSelector: '.grid-item',
    //       gutter: 10,
    //     });
    //
    //     $('#flickr-container [data-toggle="tooltip"]').tooltip();
    //   });
    // });
  }; // end services

  ko.bindingHandlers.markerToggle = {
    init: function(element, valueAccessor) {
      var markerData = valueAccessor();
      $(element).click(function() {
        markerData.toggle(!markerData.toggle());
        var markerLength = window.markerList[markerData.markerList].length;

        if (!markerData.toggle()) {
          for (var i = 0; i < markerLength; i++){
            window.markerList[markerData.markerList][i].setMap(null);
          }
        } else {
          for (var i = 0; i < markerLength; i++){
            window.markerList[markerData.markerList][i].setMap(window.map);
          }
        }

      });
    },
  };

  ko.bindingHandlers.serviceResultsView = {
    init: function(element, valueAccessor) {
      var valueObject = valueAccessor();
      $(element).click(function() {
        if (valueObject.toggle()) {
          if ($('#bs-example-navbar-collapse-1').attr('aria-expanded')) {
            $('.navbar-toggle').click();
          }

          var flip = $(valueObject.target).hasClass('active');
          $('.detailPanel').removeClass('active');
          if (!flip) {
            $(valueObject.target).addClass('active');
          }
        } else {
          return false;
        }
      });
    },
  };

  ko.bindingHandlers.openSearch = {
    init: function(element, valueAccessor) {
      $(element).click(function() {
        $('#placeName').addClass('search');
      });
    },
  };

  ko.bindingHandlers.selectMarker = {
    init: function(element, valueAccessor) {
      var values = valueAccessor();
      $(element).click(function() {
        new google.maps.event.trigger(window.markerList[values.markerList][values.position()], 'click');
        $('.detailPanel').removeClass('active');
      });
    },
  };

  ko.applyBindings(viewModel);
});
