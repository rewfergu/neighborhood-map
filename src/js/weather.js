define(['skycons'], function(skycons) {
  return {
    getWeather: function(lat, long){
      return new Promise(function(resolve, reject){
        $.ajax({
          url: 'https://api.forecast.io/forecast/ba803b0a5bbafde79302fcfadd270997/' + lat + ',' + long,
          // The name of the callback parameter, as specified by the YQL service
          jsonp: "callback",
          // Tell jQuery we're expecting JSONP
         dataType: "jsonp",
        }).error(function(){
          console.log('could not get weather data');
        }).done(function(data){

          // the 'icon' property in the dark sky api doesn't match the skycon method for some reason
          var condition = data.currently.icon;
          condition = condition.toUpperCase();
          condition = condition.replace(/-/g, '_');
          $('#temp span').html(data.currently.temperature.toFixed());

          var skycons = new Skycons({color: 'black'});
          skycons.set('weatherIcon', Skycons[condition]);
          skycons.play();

          resolve();
        }).error(function(data) {
          console.log(data);
          reject();
        });
      }); // promise
    } // getWeather fn
  }; // return object
}); // module definition
