define(['knockout', 'viewModel', 'geocode'], function(ko, viewModel, glibglob) {
  var biz;

  // Construct the URL to call for the API request
  function constructYelpURL() {
    var mapBounds = map.getBounds();
    var southWest =  mapBounds.getSouthWest();
    var northEast = mapBounds.getNorthEast();
    var URL = "http://api.yelp.com/" +
        "business_review_search?"+
        "&term=restaurants" +
        "&num_biz_requested=10" +
        "&tl_lat=" + southWest.G +
        "&tl_long=" + southWest.K +
        "&br_lat=" + northEast.G +
        "&br_long=" + northEast.K  +
        "&ywsid=" + viewModel.YWSID;
    return encodeURI(URL);
  }

  function createMarker(biz, point, markerNum) {
    var infoWindowHtml = generateInfoWindowHtml(biz)
    //console.log(infoWindowHtml);
    //var marker = new google.maps.marker(point, icon);

    var properties = {
      position: point,
      map: map,
      title: biz.name,
      animation: google.maps.Animation.DROP,
      icon:'marker.svg'
    };

    var marker = new google.maps.Marker(properties);
    viewModel.yelpMarkers.push(marker);
    //map.addOverlay(marker);
    // marker.setMap(map);
    google.maps.event.addDomListener(marker, 'click', function() {
      //marker.openInfoWindowHtml(infoWindowHtml, {maxWidth:400});
      console.log('marker clicked');
    });
  }

  var resetMarkers = function() {
    markerList.forEach(function(index){
      index.setMap(null);
    });
    viewModel.yelpMarkers = [];
  }

 /*
  * Formats and returns the Info Window HTML
  * (displayed in a balloon when a marker is clicked)
  */
  function generateInfoWindowHtml(biz) {
    var text = '<div class="marker">';

    // image and rating
   text += '<img class="businessimage" src="' + biz.photo_url + '"/>';

    // div start
    text += '<div class="businessinfo">';

    // name/url
    text += '<a href="' + biz.url + '" target="_blank">' + biz.name + '</a><br/>';

    // stars
    text += '<img class="ratingsimage" src="' + biz.rating_img_url_small + '"/>&nbsp;based&nbsp;on&nbsp;';

    // reviews
    text += biz.review_count + '&nbsp;reviews<br/><br />';

    // categories
    text += formatCategories(biz.categories);

    // neighborhoods
    if (biz.neighborhoods.length) {
      text += formatNeighborhoods(biz.neighborhoods);
    }

    // address
    text += biz.address1 + '<br/>';

    // address2
    if (biz.address2.length) {
      text += biz.address2+ '<br/>';
    }

    // city, state and zip
    text += biz.city + ',&nbsp;' + biz.state + '&nbsp;' + biz.zip + '<br/>';

    // phone number
    if (biz.phone.length) {
      text += formatPhoneNumber(biz.phone);
    }

    // Read the reviews
    text += '<br/><a href="' + biz.url + '" target="_blank">Read the reviews »</a><br/>';

    // div end
    text += '</div></div>'
    return text;
  }

  /*
  * Formats the categories HTML
  */
  function formatCategories(cats) {
    var s = 'Categories: ';
    for(var i=0; i<cats.length; i++) {
      s+= cats[i].name;
      if(i != cats.length-1) {
        s += ', ';
      }
    }
    s += '<br/>';
    return s;
  }

  /*
  * Formats the neighborhoods HTML
  */
  function formatNeighborhoods(neighborhoods) {
    s = 'Neighborhoods: ';
    for (var i = 0; i < neighborhoods.length; i++) {
      s += '<a href="' + neighborhoods[i].url + '" target="_blank">' + neighborhoods[i].name + '</a>';
      if (i != neighborhoods.length-1) {
        s += ', ';
      }
    }
    s += '<br/>';
    return s;
  }

  /*
  * Formats the phone number HTML
  */
  function formatPhoneNumber(num) {
    if(num.length != 10) return '';
    return '(' + num.slice(0,3) + ') ' + num.slice(3,6) + '-' + num.slice(6,10) + '<br/>';
  }

  return {
    search: function() {
      return new Promise(function(resolve, reject){
        $.ajax({
          url: constructYelpURL(),
          jsonp: 'callback',
          dataType: 'jsonp'
        }).error(function(){
          console.log('could not get yelp data');

          reject();
        }).done(function(data){
          //console.log(data);
          if(data.message.text == "OK") {
            if (data.businesses.length == 0) {
              alert("Error: No businesses were found near that location");
              return;
            }
            for (var i=0; i<data.businesses.length; i++) {
              biz = data.businesses[i];
              console.log(biz);
              var street = biz.address1;
              var city = biz.city;
              var state = biz.state;
              var addr = street + ',' + city + ',' + state;
              var mapPoint = this.searchAddress();
              createMarker(biz, mapPoint, i);
            }
          }
          else {
            alert("Error: " + data.message.text);
          }

          resolve();
        });
      }); // promise
    } // search fn
  }; // return obj
}); // module definition
