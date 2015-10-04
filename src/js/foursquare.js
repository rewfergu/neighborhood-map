define(['knockout', 'viewModel', 'TweenLite', 'keys', 'Ease', 'getMap'], function(ko, viewModel, TweenLite, keys) {
  //var ll = 'll=' + viewModel.position.lat() + ',' + viewModel.position.long();
  var clientId = 'client_id=' + keys.foursquareId;
  var clientSecret = '&client_secret=' + keys.foursquareSecret;
  var v = '&v=20150701';
  var m = '&m=foursquare';
  var url = 'https://api.foursquare.com/v2/venues/search?' + clientId + clientSecret + m + v;

  window.markerList.foursquare = [];

  // marker image properties
  // since I'm animating the marker properties, this makes it easier to reset
  var FoursquareMarker = function() {
    return {
      url: 'img/foursquare.png',
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

  function createMarker(venue, point, category, checkins) {
    // these properties go into the knockout observable array
    var entry = {
      title: venue,
      category: category,
      checkins: checkins,
      position: point,
    };

    // these properties go into the marker array
    // when I added the markers into a knockout array, everything went crazy
    var marker = new google.maps.Marker({
      position: point,
      map: map,
      title: venue,
      animation: google.maps.Animation.DROP,
      icon: markerImage,
      category: category,
      checkins: checkins,
      draggable: false,
    });

    marker.addListener('click', function() {
      window.infowindow.close();
      resetMarkers();
      var _this = this;
      var contentString = '<div>' + _this.title + '</div>';
      contentString += '<div>Category: ' + _this.category + '</div>';
      contentString += '<div><i class="fa fa-cutlery"></i>  ' + _this.checkins + '</div>';
      window.infowindow.setContent(contentString);

      // greensock tweenLite properties
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

    viewModel.foursquareMarkers.push(entry);
    window.markerList.foursquare.push(marker);
  }

  // each time the tween updates this function will be called.
  function updateMarker(marker) {
    markerImage.size = new google.maps.Size(markerImage.currentSize, markerImage.currentSize);
    markerImage.scaledSize = new google.maps.Size(markerImage.currentSize, markerImage.currentSize);
    markerImage.anchor = new google.maps.Point(markerImage.anchorx, markerImage.anchory);
    marker.setIcon(markerImage);
  }

  // when the tween animation finishes this will happen
  function completeMarker(marker) {
    window.infowindow.open(map, marker);
    markerImage = new FoursquareMarker();
  }

  // reset markers to original size
  function resetMarkers() {
    window.markerList.foursquare.forEach(function(index) {
      index.setIcon(markerImage);
    });
  };

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

          // if there is data in the markers array, then reset it
          if (viewModel.foursquareMarkers().length > 0) {
            viewModel.foursquareMarkers([]);
            window.markerList.foursquare = [];
          }

          data.response.venues.forEach(function(index) {
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
