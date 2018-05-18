var App = (function () {
  var self = {};

  self.htmlEncode = function (str) {
    return str.replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  };

  self.generateTableRow = function (setting) {
    var name = setting.name || setting.raw_name;
    var cells = `
      <td><a href="#${name}" title="Permalink">🔗</a></td>
      <td><a title="See the code" target="_blank" href="https://github.com/elastic/elasticsearch/blob/v6.2.4/${setting.code_file}#L${setting.code_line}"><img style="height:24px;" src="/images/github-icon.png" alt="GitHub icon" /></a></td>
      <td><a title="See the documentation" target="_blank" href="https://www.elastic.co/search?q=${name}&section=Learn%2FDocs%2FElasticsearch%2FReference%2F6.2&tags=Elasticsearch"><img style="height:24px" src="/images/elasticsearch-icon.png" alt="Elasticsearch icon" /></a></td>
      <td class="setting-name">${name}</td>
      <td>${(setting.properties || []).join(", ")}</td>
      <td>${setting.java_type}</td>
      <td>${setting.default_arg}</td>`;

    var row = document.createElement("tr");
    row.id = name;
    row.innerHTML = cells;
    return row;
  };

  self.init = function () {
    var container = document.getElementById("settings-table-body");
    ES_SETTINGS.sort(function (a, b) {
      return (a.name || a.raw_name).localeCompare((b.name || b.raw_name));
    })
    .map(function (setting) {
      var details = self.generateTableRow(setting);
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
