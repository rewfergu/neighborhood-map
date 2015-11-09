define(['knockout', 'viewModel', 'jquery', 'TweenLite', 'keys', 'imagesloaded', 'Ease', 'getMap'], function(ko, viewModel, $, TweenLite, keys, imagesloaded) {
  var url  = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=' + keys.flickrKey + '&has_geo=1&radius=2&radius_units=mi&extras=geo%2Curl_t%2C+url_s&format=json&nojsoncallback=1&per_page=100';

  // formats we aren't using at the moment
  //%2C+url_sq%2C+url_q%2C+url_m%2C+url_n%2C+url_z

  window.markerList.flickr = [];

  // marker image properties
  var FlickrMarker = function() {
    return {
      url: 'img/flickr.png',
      currentSize: 25,
      anchorx: 0,
      anchory: 25,
      size: new google.maps.Size(25, 25),
      scaledSize: new google.maps.Size(25, 25),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(0, 25),
    };
  };

  var markerImage = new FlickrMarker();

  function createMarker(id, name, place, url) {
    var contentString = '<div class="infoWindowContent"><div>' + name + '</div>';
    contentString += '<img class="infoWindowImage" src="' + url.thumb + '" alt="flickr image"></div>';

    // these properties go into the knockout observable array
    var entry = {
      id: id,
      title: name,
      position: place,
      url: url.small,
      info: contentString,
    };

    // these properties go into the map marker array
    var marker = new google.maps.Marker({
      id: id,
      map: map,
      title: name,
      position: place,
      animation: google.maps.Animation.DROP,
      icon: markerImage,
      url: url.thumb,
      info: contentString,
    });

    marker.addListener('click', function() {
      window.infowindow.close();
      resetMarkers();
      _this = this;
      window.map.panTo(_this.position);
      window.infowindow.setContent(_this.info);

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

    viewModel.flickrMarkers.push(entry);
    window.markerList.flickr.push(marker);
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
    markerImage = new FlickrMarker();

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
    window.markerList.flickr.forEach(function(index) {
      index.setIcon(markerImage);
    });
  }

  return {
    search: function(lat, long) {
      return new Promise(function(resolve, reject) {
        $.ajax({
          url: url + '&lat=' + lat + '&lon=' + long,
        }).error(function() {
          console.log('could not get flickr data');

          reject();
        }).done(function(data) {
          console.log('flickr data received');

          // if there is data in the markers array, then reset it
          if (viewModel.flickrMarkers().length > 0) {
            viewModel.flickrMarkers([]);
            window.markerList.flickr = [];
          }

          //for (var i = 0; i < data.photos.photo.length; i++) {
          data.photos.photo.forEach(function(index){
            var photo = index;
            var pos = new google.maps.LatLng(photo.latitude, photo.longitude);
            var name = photo.title;
            var url = {small: photo.url_s, thumb: photo.url_t};
            var id = data.photos.photo.indexOf(index);
            createMarker(id, name, pos, url);
          });
          console.log('flickr data processed');
          resolve();
        });
      }); // promise
    } // search fn
  }; // return obj
}); // module definition
