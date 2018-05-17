var App = (function () {
  var self = {};

  self.generateDetails = function (setting) {
    var root = document.createElement("details");
    var name = document.createElement("summary");
    name.appendChild(document.createTextNode(setting["Name"]));

    var details = document.createElement("p");
    details.appendChild(document.createTextNode("more info here"));

    root.appendChild(name);
    root.appendChild(details);

    return root;
  };

  self.init = function () {
    var container = document.getElementById("settings-list");
    ES_SETTINGS.map(function (setting) {
      container.appendChild(self.generateDetails(setting));
    })
  };

  return self;
})();

(function () {
  App.init();
})();
