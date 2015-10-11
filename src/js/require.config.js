// require.js looks for the following global when initializing
var require = {
  baseUrl: '../',
  shim: {
    bootstrap: {
      deps: ['jquery'],
    },
  },
  paths: {
    jquery: 'bower_components/jquery/dist/jquery',
    bootstrap: 'bower_components/bootstrap-sass/assets/javascripts/bootstrap',
    knockout: 'bower_components/knockout/dist/knockout',
    async: 'bower_components/requirejs-plugins/src/async',
    getMap: 'js/getMap',
    geocode: 'js/geocode',
    skycons: 'bower_components/skycons-html5/skycons',
    weather: 'js/weather',
    viewModel: 'js/viewModel',
    lodash: 'bower_components/lodash/lodash',
    wikipedia: 'js/wikipedia',
    foursquare: 'js/foursquare',
    TweenLite: 'bower_components/gsap/src/minified/TweenLite.min',
    Ease: 'bower_components/gsap/src/minified/easing/EasePack.min',
    googlePlaces: 'js/googlePlaces',
    flickr: 'js/flickr',
    packery: 'bower_components/packery/dist/packery.pkgd.min',
    imagesloaded: 'bower_components/imagesloaded/imagesloaded.pkgd.min',
    keys: 'js/keys',
  },
};
