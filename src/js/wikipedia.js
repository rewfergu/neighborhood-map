define(['knockout', 'viewModel', 'TweenLite', 'imagesloaded', 'Ease', 'getMap'], function(ko, viewModel, TweenLite, imagesloaded) {
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

  function createMarker(id, name, point, image) {
    var contentString = '<div>' + name + '</div>';
    var url;

    // check for an image
    if (image) {
      url = image.source;
      contentString += '<div class="infoWindowContent"><img class="infoWindowImage" src="' + url + '" alt="wikipedia image"></div>';
    }

    // these properties go into the knockout observable array
    var entry = {
      id: id,
      title: name,
      position: point,
      url: url,
    };

    // these properties go into the map marker array
    var marker = new google.maps.Marker({
      id: id,
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

    // check for images loading properly
    var imageLoad = imagesloaded('.infoWindowContent');
    imageLoad.on('progress',  function(instance, image) {
      if (!image.isLoaded) {
        console.log(image.img.src + ' failed to load');
        image.img.src = 'img/missing.svg';
        image.img.alt = 'image failed to load';
        image.img.title = 'image failed to load';
        image.img.width = 75;
      }
    });
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
          data.query.pages.forEach(function(index) {
            $('#wikipedia').html('<h1>' + index.title + '</h1>');
            $('#wikipedia').append('<section>' + index.extract + '</section>');
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

          // if there is data in the markers array, then reset it
          if (viewModel.wikipediaMarkers().length > 0) {
            viewModel.wikipediaMarkers([]);
            window.markerList.wikipedia = [];
          }

          data.query.pages.forEach(function(index) {
            if (index.coordinates) {
              var pos = {lat: index.coordinates[0].lat, lng: index.coordinates[0].lon};
              createMarker(data.query.pages.indexOf(index), index.title, pos, index.thumbnail);
            }
          });

          console.log('wikipedia data processed');
          resolve();
        });
      }); // promise
    }, // searchNearby fn
  }; // return object
}); // module definition
