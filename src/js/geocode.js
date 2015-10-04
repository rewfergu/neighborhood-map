define(['knockout', 'viewModel', 'getMap', 'weather', 'wikipedia', 'keys'], function(ko, viewModel, getMap, weather, wikipedia, keys) {
  //var url = 'https://maps.googleapis.com/maps/api/geocode/json?key=' + viewModel.key;

  return {
    // takes a lat / long pair and returns a location string for searching Wikipedia
    searchCoords: function(lat, long) {
      //var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + lat + ',' + long + '&result_type=street_address&key=AIzaSyA7AzAUzaTkpYC4HGJdbJQ37ClRELV1M_w';
      var url = 'https://maps.googleapis.com/maps/api/geocode/json?key=' + keys.google;
      var city;
      var state;

      return new Promise(function(resolve, reject) {
        $.ajax({
          url: url + '&address=' + lat + ',' + long + '&result_type=street_address',
        }).done(function(data) {
          data.results[0].address_components.forEach(function(index) {
            if (index.types[0] == 'locality') {
              city =  index.long_name;
            } else if (index.types[0] == 'administrative_area_level_1') {
              state = index.long_name;
            }
            if (city && state) {
              viewModel.placeName(city + ', ' + state);
              //console.log('place found');
              //console.log(city + ', ' + state);
            }
          });

          resolve();
        }).error(function(data) {
          console.log('Im having trouble finding your location');
          reject();
        });
      });
    },

    // using the search field
    // needs a value passed to it
    searchPlace: function() {
      var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + placeField.value + '&sensor=false&key=' + keys.google;

      return new Promise(function(resolve, reject) {
        // set the map and get coordinates
        $.ajax({
          url: url,
        }).done(function(data) {
          //console.log(data);
          if (data.results.length == 1) {
            viewModel.position.lat(data.results[0].geometry.location.lat);
            viewModel.position.long(data.results[0].geometry.location.lng);
            window.map.setCenter(data.results[0].geometry.location);
            window.map.setZoom(14);
          } else {
            alert('be more specific');
          }
          resolve();
        }).error(function(data) {
          console.log('There was an error processing your request.');
          reject();
        });
      });
    },

    searchAddress: function(addr) {
      $.ajax({
        url: '&address=' + addr,
      }).done(function(data) {
        var lat = data.results[0].geometry.location.lat;
        var long = data.results[0].geometry.location.lng;
        var mapPoint = new google.maps.LatLng(lat, long);
        return mapPoint;
      });
    }
  };
});
