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
          window.infowindow.close();
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

      var wikiImgLoad = imagesloaded('#wikipedia-container');

      wikiImgLoad.on('progress', function(instance, image) {
        if (!image.isLoaded) {
          console.log(image.img.src + ' failed to load');
          image.img.src = 'img/missing.svg';
          image.img.alt = 'image failed to load';
          image.img.title = 'image failed to load';
        }
      });

      wikiImgLoad.on('always', function() {
        new Packery('#wikipedia-container', {
          // options
          itemSelector: '.grid-item',
          gutter: 10,
        });

        $('#wikipedia-container [data-toggle="tooltip"]').tooltip();
        console.log('wikipedia images loaded');
      });
    });

    // search foursquare
    foursquare.search(lat, long).then(function() {
      viewModel.foursquareLoaded(true);
      viewModel.foursquareActive(true);
    });

    // search google places
    googlePlaces.search(lat, long).then(function() {
      viewModel.googleLoaded(true);
      viewModel.googlePlacesActive(true);

      var googleImgLoad = imagesloaded('#google-container');

      googleImgLoad.on('progress', function(instance, image) {
        if (!image.isLoaded) {
          console.log(image.img.src + ' failed to load');
          image.img.src = 'img/missing.svg';
          image.img.alt = 'image failed to load';
          image.img.title = 'image failed to load';
        }
      });

      googleImgLoad.on('always', function() {
        new Packery('#google-container', {
          // options
          itemSelector: '.grid-item',
          gutter: 10,
        });
        $('#google-container [data-toggle="tooltip"]').tooltip();
        console.log('google images loaded');
      });
    });

    // search flickr
    flickr.search(lat, long).then(function() {
      viewModel.flickrLoaded(true);
      viewModel.flickrActive(true);

      var flickrImgLoad = imagesloaded('#flickr-container');

      flickrImgLoad.on('progress', function(instance, image) {
        if (!image.isLoaded) {
          console.log(image.img.src + ' failed to load');
          image.img.src = 'img/missing.svg';
          image.img.alt = 'image failed to load';
          image.img.title = 'image failed to load';
        }
      });

      flickrImgLoad.on('always', function() {
        new Packery('#flickr-container', {
          // options
          itemSelector: '.grid-item',
          gutter: 10,
        });

        $('#flickr-container [data-toggle="tooltip"]').tooltip();
        console.log('flickr images loaded');
      });
    });
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

  ko.bindingHandlers.closeSearch = {
    init: function(element, valueAccessor) {
      $(element).click(function() {
        $('#placeName').removeClass('search');
        return false;
      });
    },
  };

  ko.bindingHandlers.openFilter = {
    init: function(element, valueAccessor) {
      $(element).click(function() {
        $('#placeName').addClass('filter');
      });
    },
  };

  ko.bindingHandlers.closeFilter = {
    init: function(element, valueAccessor) {
      $(element).click(function() {
        $('#placeName').removeClass('filter');
        return false;
      });
    },
  };

  var filterPlaces = function(value) {
    // filter wikipedia results
    viewModel.wikipediaMarkers.removeAll();
    for (var i in window.markerList.wikipedia) {
      if (window.markerList.wikipedia[i].title.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
        viewModel.wikipediaMarkers.push({
          id: window.markerList.wikipedia[i].id,
          title: window.markerList.wikipedia[i].title,
          position: window.markerList.wikipedia[i].position,
          url: window.markerList.wikipedia[i].url,
        });
        window.markerList.wikipedia[i].setMap(window.map);
      } else {
        window.markerList.wikipedia[i].setMap(null);
      }
    }

    imagesloaded('#wikipedia-container', function() {
      new Packery('#wikipedia-container', {
        // options
        itemSelector: '.grid-item',
        gutter: 10,
      });
      $('#wikipedia-container [data-toggle="tooltip"]').tooltip();
    });

    // filter foursquare results
    viewModel.foursquareMarkers.removeAll();
    for (var j in window.markerList.foursquare) {
      if (window.markerList.foursquare[j].title.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
        viewModel.foursquareMarkers.push({
          id: window.markerList.foursquare[j].id,
          title: window.markerList.foursquare[j].title,
          category: window.markerList.foursquare[j].category,
          checkins: window.markerList.foursquare[j].checkins,
          position: window.markerList.foursquare[j].point,
        });
        window.markerList.foursquare[j].setMap(window.map);
      } else {
        window.markerList.foursquare[j].setMap(null);
      }
    }

    // filter google results
    viewModel.googleMarkers.removeAll();
    for (var k in window.markerList.googlePlaces) {
      if (window.markerList.googlePlaces[k].title.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
        viewModel.googleMarkers.push({
          id: window.markerList.googlePlaces[k].id,
          title: window.markerList.googlePlaces[k].title,
          placeIcon: window.markerList.googlePlaces[k].placeIcon,
          type: window.markerList.googlePlaces[k].type,
          photo: window.markerList.googlePlaces[k].photo,
        });
        window.markerList.googlePlaces[k].setMap(window.map);
      } else {
        window.markerList.googlePlaces[k].setMap(null);
      }
    }

    imagesloaded('#google-container', function() {
      new Packery('#google-container', {
        // options
        itemSelector: '.grid-item',
        gutter: 10,
      });
      $('#google-container [data-toggle="tooltip"]').tooltip();
    });

    // filter flickr results
    viewModel.flickrMarkers.removeAll();
    for (var l in window.markerList.flickr) {
      if (window.markerList.flickr[l].title.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
        viewModel.flickrMarkers.push({
          id: window.markerList.flickr[l].id,
          title: window.markerList.flickr[l].name,
          position: window.markerList.flickr[l].place,
          url: window.markerList.flickr[l].url,
          info: window.markerList.flickr[l].contentString,
        });
        window.markerList.flickr[l].setMap(window.map);
      } else {
        window.markerList.flickr[l].setMap(null);
      }
    }

    imagesloaded('#flickr-container', function() {
      new Packery('#flickr-container', {
        // options
        itemSelector: '.grid-item',
        gutter: 10,
      });

      $('#flickr-container [data-toggle="tooltip"]').tooltip();
    });

  };

  // when the filter value changes, then run the filterPlaces funtion
  viewModel.filter.subscribe(filterPlaces);

  ko.bindingHandlers.selectMarker = {
    init: function(element, valueAccessor) {
      var values = valueAccessor();
      $(element).click(function() {
        new google.maps.event.trigger(window.markerList[values.markerList][values.position], 'click');
        $('.detailPanel').removeClass('active');
      });
    },
  };

  ko.applyBindings(viewModel);
});
