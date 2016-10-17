var App = (function () {
  var self = {};

  self.pushQueryToHash = function (evt) {
    evt.stopPropagation();
    var term = document.getElementById('search-input').value;
    window.location.hash = "#" + encodeURIComponent(term);
    return false;
  };

  self.searchTowns = function () {
    self.points && self.points.clearLayers();

    var term = decodeURIComponent(window.location.hash.substring(1));

    if (term === "") {
      return;
    }

    var regex = new RegExp(term, 'i');

    var towns = PLACES.filter(function (p) {
      return p.name.match(regex);
    }).map(function (p) {
      var m = L.marker([p.lat, p.lon]);
      m.bindPopup(p.name + ", " + p.state_long).openPopup();
      return m;
    });

    self.points = L.layerGroup(towns);

    self.points.addTo(self.map);
  };

  self.init = function () {
    self.map = L.map('map').setView([39.8333333,-98.585522], 5);
    L.tileLayer('https://api.mapbox.com/styles/v1/mapboxnickcanzonericom/ciucxk7ry00462ipi7w8cg9tu/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94bmlja2NhbnpvbmVyaWNvbSIsImEiOiJjaXVjeDd0ZmUwMDg1Mm9sN2R3aTh4ZjdiIn0.HzylfVu0I-8Wbq_YV8absA', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18
    }).addTo(self.map);

    var SearchControl = L.Control.extend({
      options: {
        position: 'topright'
      },

      onAdd: function (map) {
        var container = L.DomUtil.create('div', 'search');

        var form = L.DomUtil.create('form', 'search-form', container);

        var input = L.DomUtil.create('input', 'search-input', form);
        input.id = 'search-input';
        input.type = 'text';
        input.placeholder = 'Search...';

        form.onsubmit = self.pushQueryToHash;

        return container;
      }
    });

    self.map.addControl(new SearchControl());

    window.onhashchange = self.searchTowns;

    if (window.location.hash !== "") {
      self.searchTowns();
      document.getElementById('search-input').value = decodeURIComponent(window.location.hash.substring(1));
    }
  };

  return self;
})();

(function () {
  App.init();
})();
