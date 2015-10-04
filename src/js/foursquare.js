define(['knockout', 'viewModel', 'lodash', 'TweenLite', 'keys', 'Ease', 'getMap'], function(ko, viewModel, _, TweenLite, keys) {
  //var ll = 'll=' + viewModel.position.lat() + ',' + viewModel.position.long();
  var clientId = 'client_id=' + keys.foursquareId;
  var clientSecret = '&client_secret=' + keys.foursquareSecret;
  var v = '&v=20150701';
  var m = '&m=foursquare';
  var url = 'https://api.foursquare.com/v2/venues/search?' + clientId + clientSecret + m + v;

  window.markerList.foursquare = [];

  // var infowindow = new google.maps.InfoWindow({
  //   content: 'temp',
  // });

  // Sets the map on all markers in the array.
  function setMapOnAll(map) {
    for (var i = 0; i < viewModel.foursquareMarkers().length; i++) {
      viewModel.foursquareMarkers[i].setMap(map);
    }
  }

  // Removes the markers from the map, but keeps them in the array.
  function clearMarkers() {
    setMapOnAll(null);
  }

  // Shows any markers currently in the array.
  function showMarkers() {
    setMapOnAll(map);
  }

  var resetMarkers = function() {
    window.markerList.foursquare.forEach(function(index) {
      index.setIcon(markerImage);
    });
  };

  // custom svg symbol definition
  var icon = {
    path: 'M18.5,6.2c0,7.3-9.2,16.8-9.2,16.8S0,13.9,0,6.2C0,1.2,4.2-3,9.2-3S18.5,1.2,18.5,6.2z',
    fillColor: 'yellow',
    fillOpacity: 0.3,
    scale: 1,
    strokeColor: 'gold',
    strokeWeight: 4,
  };

  // svg file symbol definition
  var FoursquareMarker = function() {
    return {
      url: 'foursquare.png',
      currentSize: 25,
      anchorx: 0,
      anchory: 25,
      size: new google.maps.Size(25, 25),
      scaledSize: new google.maps.Size(25, 25),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(0, 25),
    };
  };

  var markerImage = new FoursquareMarker();

  var animateMarker = {
    currentSize: 0,
  };

  function createMarker(venue, point, category, checkins) {
    //var infoWindowHtml = generateInfoWindowHtml(biz)
    //console.log(infoWindowHtml);
    //var marker = new google.maps.marker(point, icon);

    var entry = {
      title: venue,
      category: category,
      checkins: checkins,
      //position: point,
    };

    var properties = {
      position: point,
      map: map,
      title: venue,
      animation: google.maps.Animation.DROP,
      icon: markerImage,
      category: category,
      checkins: checkins,
      draggable: false,
    };

    var marker = new google.maps.Marker(properties);

    //marker.openInfoWindowHtml(infoWindowHtml, {maxWidth:400});
    //console.log('marker clicked');

    marker.addListener('click', function() {
      window.infowindow.close();
      resetMarkers();
      var _this = this;
      var contentString = '<div>' + _this.title + '</div>';
      contentString += '<div>Category: ' + _this.category + '</div>';
      contentString += '<div><i class="fa fa-cutlery"></i>  ' + _this.checkins + '</div>';
      window.infowindow.setContent(contentString);

      // markerImage.url = 'foodMarkerActive.svg';
      // _this.setIcon(markerImage);

      var tween = TweenLite.to(markerImage, 0.75, {
        currentSize: 35,
        anchorx: 0,
        anchory: 35,
        onUpdate:updateMarker,
        onUpdateParams: [_this],
        onComplete:completeMarker,
        onCompleteParams: [_this],
        ease: Bounce.easeOut,
      });

    });

    //viewModel.foursquareMarkers.push(entry);
    viewModel.beepboop.push(entry);
    window.markerList.foursquare.push(marker);
  }

  //each time the tween updates this function will be called.
  function updateMarker(marker) {
    markerImage.size = new google.maps.Size(markerImage.currentSize, markerImage.currentSize);
    markerImage.scaledSize = new google.maps.Size(markerImage.currentSize, markerImage.currentSize);
    markerImage.anchor = new google.maps.Point(markerImage.anchorx, markerImage.anchory);
    //marker.setIcon(markerImage);
  }

  function completeMarker(marker) {
    window.infowindow.open(map, marker);
    markerImage = new FoursquareMarker();
  }

  return {
    search: function(lat, long) {
      return new Promise(function(resolve, reject) {
        $.ajax({
          url: url + '&ll=' + lat + ',' + long + '&categoryId=4d4b7105d754a06374d81259&radius=3000',
          jsonp: 'callback',
          dataType: 'jsonp',
        }).error(function() {
          console.log('could not get foursquare data');

          reject();
        }).done(function(data) {
          console.log('foursquare data received');
          if (viewModel.foursquareMarkers()) {
            viewModel.foursquareMarkers = ko.observableArray();
          }

          data.response.venues.forEach(function(index) {
            //console.dir(index);
            var pos = {lat: index.location.lat, lng: index.location.lng};
            createMarker(index.name, pos, index.categories[0].name, index.stats.checkinsCount);
          });
          console.log('foursquare data processed');
          resolve();
        });
      }); // promise
    }, // search fn
  }; // return obj
}); // module definition
