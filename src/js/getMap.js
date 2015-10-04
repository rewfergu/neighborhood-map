define(['viewModel', 'async!https://maps.googleapis.com/maps/api/js?libraries=places'], function(viewModel) {
  var lat;
  var long;
  var pos;

  //&key=AIzaSyA7AzAUzaTkpYC4HGJdbJQ37ClRELV1M_w

  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 38.9199895, lng: -99.0434879},
    zoom: 14,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    panControl: false,
    mapTypeControl: false,
  });

  window.map = map;
  window.markerList = [];
  window.infowindow = new google.maps.InfoWindow({map: window.map});
  window.infowindow.close();

  // function success(position) {
  //   pos = {
  //     lat: position.coords.latitude,
  //     lng: position.coords.longitude,
  //   };
  //
  //   viewModel.position.lat(position.coords.latitude);
  //   viewModel.position.long(position.coords.longitude);
  //   map.setCenter(pos);
  //
  //   console.log('we should be processing now');
  //
  //   //searchCoords(position.coords.latitude, position.coords.longitude);
  //   //geocode.searchCoords(position.coords.latitude, position.coords.longitude);
  // }

  function error(err) {
    console.log('browser does support geolocation, but there was some error getting the coords');
    handleLocationError(true, map.getCenter());
  }

  function handleLocationError(browserHasGeolocation, pos) {
    window.infowindow.setPosition(pos);
    window.infowindow.setContent(browserHasGeolocation ? 'Error: The Geolocation service failed.' : 'Error: Your browser doesn\'t support geolocation.');
    map.setZoom(5);
    window.infowindow.open();
  }

  return new Promise(function(resolve, reject) {
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        viewModel.position.lat(position.coords.latitude);
        viewModel.position.long(position.coords.longitude);
        map.setCenter(pos);

        resolve();

      }, error, {timeout: 3000});
    } else {
      // Browser doesn't support Geolocation
      console.log('browser does not support geolocation');
      handleLocationError(false, map.getCenter());
    }
  });
});
