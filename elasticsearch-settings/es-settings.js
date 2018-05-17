var App = (function () {
  var self = {};

  self.generateDetails = function (setting) {

    if (setting["Name"] == "") {
      console.warn(setting);
      return;
    }

    var root = document.createElement("details");
    var name = document.createElement("summary");
    name.appendChild(document.createTextNode(setting["Name"]));

    var details = document.createElement("p");

    var infoList = document.createElement("ul");

    var typeElem = document.createElement("li");
    typeElem.textContent = `Java type: ${setting["JavaType"]}`;

    var defaultElem = document.createElement("li");
    defaultElem.textContent = `Default value: ${setting["DefaultArg"]}`;

    var propertiesElem = document.createElement("li");
    propertiesElem.textContent = `Properties: ${setting["Properties"].join(", ")}`

    var githubLink = document.createElement("a");
    githubLink.href = `https://github.com/elastic/elasticsearch/blob/master/${setting["CodeFile"]}#L${setting["CodeLine"]}`;
    githubLink.text = `Look at source for ${setting["Name"]}`;

    var docsLink = document.createElement("a");
    docsLink.href = `https://www.elastic.co/search?q=${setting["Name"]}&section=Learn%2FDocs%2FElasticsearch%2FReference%2F6.2&tags=Elasticsearch`;
    docsLink.text = `Search docs for ${setting["Name"]}`;

    infoList.appendChild(typeElem);
    infoList.appendChild(defaultElem);
    infoList.appendChild(propertiesElem);
    infoList.appendChild(document.createElement("li").appendChild(githubLink));
    infoList.appendChild(document.createElement("li").appendChild(docsLink));

    details.appendChild(infoList);

    root.appendChild(name);
    root.appendChild(details);

    return root;
  };

  self.init = function () {
    var container = document.getElementById("settings-list");
    ES_SETTINGS.sort(function (a, b) {
      return a["Name"].localeCompare(b["Name"]);
    })
    .map(function (setting) {
      container.appendChild(self.generateDetails(setting));
    });
  };

  return self;
})();

(function () {
  App.init();
})();
