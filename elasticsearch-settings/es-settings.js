var App = (function () {
  var self = {};

  self.generateDetails = function (setting) {

    var name = setting["Name"] || setting["RawName"];

    var root = document.createElement("details");
    var summaryElem = document.createElement("summary");
    summaryElem.id = name;

    var nameLink = document.createElement("a");
    nameLink.href = `#${name}`;
    nameLink.textContent = "🔗";
    summaryElem.appendChild(nameLink);
    summaryElem.appendChild(document.createTextNode(name));

    var details = document.createElement("p");
    var infoList = document.createElement("ul");

    var typeElem = document.createElement("li");
    typeElem.textContent = `Java type: ${setting["JavaType"]}`;

    var defaultElem = document.createElement("li");
    defaultElem.textContent = `Default value: ${setting["DefaultArg"]}`;

    var propertiesElem = document.createElement("li");
    propertiesElem.textContent = `Properties: ${(setting["Properties"] || []).join(", ")}`

    var githubLink = document.createElement("a");
    githubLink.href = `https://github.com/elastic/elasticsearch/blob/master/${setting["CodeFile"]}#L${setting["CodeLine"]}`;
    githubLink.text = `Look at source for ${name}`;
    var githubLinkElem = document.createElement("li");
    githubLinkElem.appendChild(githubLink);

    var docsLink = document.createElement("a");
    docsLink.href = `https://www.elastic.co/search?q=${name}&section=Learn%2FDocs%2FElasticsearch%2FReference%2F6.2&tags=Elasticsearch`;
    docsLink.text = `Search docs for ${name}`;
    var docsLinkElem = document.createElement("li");
    docsLinkElem.appendChild(docsLink);

    infoList.appendChild(typeElem);
    infoList.appendChild(defaultElem);
    infoList.appendChild(propertiesElem);
    infoList.appendChild(githubLinkElem);
    infoList.appendChild(docsLinkElem);

    details.appendChild(infoList);

    root.appendChild(summaryElem);
    root.appendChild(details);

    return root;
  };

  self.init = function () {
    var container = document.getElementById("settings-list");
    ES_SETTINGS.sort(function (a, b) {
      return (a["Name"] || a["RawName"]).localeCompare((b["Name"] || b["RawName"]));
    })
    .map(function (setting) {
      var details = self.generateDetails(setting);
      if (details) {
        container.appendChild(details);
      }
    });
  };

  return self;
})();

(function () {
  App.init();
})();
