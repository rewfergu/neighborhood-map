define(['knockout', 'viewModel', 'TweenLite', 'Ease', 'getMap'], function(ko, viewModel, TweenLite) {
  window.markerList.googlePlaces = [];

  // marker image properties
  var GoogleMarker = function() {
    return {
      url: 'img/google.png',
      currentSize: 25,
      anchorx: 0,
      anchory: 25,
      size: new google.maps.Size(25, 25),
      scaledSize: new google.maps.Size(25, 25),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(0, 25),
    };
  };

  var markerImage = new GoogleMarker();

  function createMarker(id, place) {
    var photo;

    if (place.photos) {
      photo = place.photos[0].getUrl({maxWidth: 250, maxHeight: 250});

      // these properties go into the knockout observable array
      var entry = {
        id: id,
        title: place.name,
        placeIcon: place.icon,
        type: place.types[0],
        photo: photo,
      };

      // these properties go into the map marker array
      var marker = new google.maps.Marker({
        id: id,
        map: map,
        position: place.geometry.location,
        animation: google.maps.Animation.DROP,
        icon: markerImage,
        title: place.name,
        placeIcon: place.icon,
        type: place.types[0],
        photo: photo,
      });

      marker.addListener('click', function() {
        window.infowindow.close();
        resetMarkers();
        var _this = this;
        var contentString = '<div><img src="' + _this.placeIcon +  '" width="20"><p>' + _this.title + '</p>';
        contentString += '<p><img src="' + _this.photo + '"></p>';
        window.map.panTo(_this.position);
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

      viewModel.googleMarkers.push(entry);
      window.markerList.googlePlaces.push(marker);
    }
  }

  //each time the tween updates this function will be called.
  function updateMarker(marker) {
    markerImage.size = new google.maps.Size(markerImage.currentSize, markerImage.currentSize);
    markerImage.scaledSize = new google.maps.Size(markerImage.currentSize, markerImage.currentSize);
    markerImage.anchor = new google.maps.Point(markerImage.anchorx, markerImage.anchory);
    marker.setIcon(markerImage);
  }

  // when the tween animation finishes this will happen
  function completeMarker(marker) {
    window.infowindow.open(map, marker);
    markerImage = new GoogleMarker();
  }

  // reset markers to original size
  function resetMarkers() {
    window.markerList.googlePlaces.forEach(function(index) {
      index.setIcon(markerImage);
    });
  }

  return {
    search: function(lat, long) {
      return new Promise(function(resolve, reject) {
        var service = new google.maps.places.PlacesService(map);

        service.nearbySearch({
          location: new google.maps.LatLng(lat, long),
          radius: 3000,
          types: ['park', 'library', 'museum', 'art gallery'],
        }, callback);

        function callback(results, status) {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            console.log('google places data received');

            // if there is data in the markers array, then reset it
            if (viewModel.googleMarkers().length > 0) {
              viewModel.googleMarkers([]);
              window.markerList.googlePlaces = [];
            }

            // loop through results and process
            for (var i = 0; i < results.length; i++) {
              createMarker(i, results[i]);
            }

            console.log('google data processed');
            resolve();
          } else {
            reject();
          }
        }
      }); // promise
    }, // search fn
  }; // return obj
}); // module definition
