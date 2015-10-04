define(['knockout'], function(ko) {
  return {
    placeName: ko.observable(),
    position: {
      lat: ko.observable(),
      long: ko.observable(),
    },
    temperature: ko.observable(''),

    foursquareMarkers: ko.observableArray(),
    beepboop: ko.observableArray(),
    flickrMarkers: ko.observableArray(),
    googleMarkers: ko.observableArray(),
    wikipediaMarkers: ko.observableArray(),

    wikipediaActive: ko.observable(false),
    foursquareActive: ko.observable(false),
    googlePlacesActive: ko.observable(false),
    flickrActive: ko.observable(false),

    wikipediaLoaded: ko.observable(false),
    foursquareLoaded: ko.observable(false),
    googleLoaded: ko.observable(false),
    flickrLoaded: ko.observable(false),
  };
});
