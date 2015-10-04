define(['knockout', 'viewModel', 'lodash', 'TweenLite', 'Ease', 'getMap'], function(ko, viewModel, _, TweenLite) {
  window.markerList.wikipedia = [];

  // marker image properties
  var WikipediaMarker = function() {
    return {
      url: 'img/wikipedia.png',
      currentSize: 25,
      anchorx: 0,
      anchory: 25,
      size: new google.maps.Size(25, 25),
      scaledSize: new google.maps.Size(25, 25),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(0, 25),
    };
  };

  var markerImage = new WikipediaMarker();

  function createMarker(name, point, image) {
    var contentString = '<div>' + name + '</div>';
    var url;

    // check for an image
    if (image) {
      url = image.source;
      contentString += '<img src="' + url + '" alt="wikipedia image">';
    }

    // these properties go into the knockout observable array
    var entry = {
      title: name,
      position: point,
      url: url,
    };

    // these properties go into the map marker array
    var marker = new google.maps.Marker({
      position: point,
      map: map,
      title: name,
      animation: google.maps.Animation.DROP,
      icon: markerImage,
      draggable: false,
      info: contentString,
      url: url,
    });

    marker.addListener('click', function() {
      window.infowindow.close();
      resetMarkers();
      var _this = this;
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

    viewModel.wikipediaMarkers.push(entry);
    window.markerList.wikipedia.push(marker);
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
    markerImage = new WikipediaMarker();
  }

  // reset markers to original size
  function resetMarkers() {
    window.markerList.wikipedia.forEach(function(index) {
      index.setIcon(markerImage);
    });
  }

  return {
    search: function(place) {
      var url = 'https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=&titles=' + place;

      return new Promise(function(resolve, reject) {
        $.ajax({
          url: url,
          jsonp: 'callback',
          dataType: 'jsonp',
        }).error(function() {
          console.log('could not get wikipedia data');
          reject();
        }).done(function(data) {
          //console.log(data);
          _.forEach(data.query.pages, function(n, key) {
            $('#wikipedia').html('<h1>' + n.title + '</h1>');
            $('#wikipedia').append('<section>' + n.extract + '</section>');
          });

          resolve();
        });
      }); // promise
    }, // search fn

    searchNearby: function(lat, long) {
      var url = 'https://en.wikipedia.org/w/api.php?action=query&format=json&colimit=max&prop=pageimages%7Ccoordinates&pithumbsize=350&pilimit=50&generator=geosearch&ggsradius=10000&ggsnamespace=0&ggslimit=50&formatversion=2&ggscoord=' + lat + '|' + long;

      return new Promise(function(resolve, reject) {
        $.ajax({
          url: url,
          jsonp: 'callback',
          dataType: 'jsonp',
        }).error(function() {
          console.log('could not get wikipedia data');
          reject();
        }).done(function(data) {
          console.log('wikipedia data received');

          console.log(data);

          // if there is data in the markers array, then reset it
          if (viewModel.wikipediaMarkers().length > 0) {
            viewModel.wikipediaMarkers([]);
            window.markerList.wikipedia = [];
          }

          _.forEach(data.query.pages, function(n, key) {
            if (n.coordinates) {
              var pos = {lat: n.coordinates[0].lat, lng: n.coordinates[0].lon};
              createMarker(n.title, pos, n.thumbnail);
            }
          });
          console.log('wikipedia data processed');
          resolve();
        });
      }); // promise
    }, // searchNearby fn
  }; // return object
}); // module definition
