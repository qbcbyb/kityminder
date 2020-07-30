/**
 * @fileOverview
 *
 * 支持从百度网盘打开文件
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI("menu/open/api", function (minder) {
  var $menu = minder.getUI("menu/menu");
  var $open = minder.getUI("menu/open/open");
  var $eve = minder.getUI("eve");
  var $doc = minder.getUI("doc");
  var ret = $eve.setup({});
  var notice = minder.getUI("widget/notice");

  /* 文件列表面板 */
  var $panel = $($open.createSub("api")).addClass("draft-panel");

  /* 标题 */
  var $title = $("<h2></h2>")
    .text(minder.getLang("ui.menu.openfromapiheader"))
    .appendTo($panel);

  /* extension => protocol */
  var supports = {};

  minder.getSupportedProtocols().forEach(function (protocol) {
    if (protocol.decode) {
      supports[protocol.fileExtension] = protocol;
    }
  });

  /* 服务端文件列表容器 */
  var $ul = $("<ul></ul>").addClass("draft-list").appendTo($panel);

  var current = null,
    lastDoc = null,
    fileList = [];

  $ul.delegate(".draft-list-item", "click", function (e) {
    if (!$doc.checkSaved()) return;

    var item = $(e.target).closest(".draft-list-item").data("item");

    var index = fileList.findIndex(function (finding) {
      return finding == item;
    });

    if (index > -1) {
      current = item;

    //   draftList.remove(index);
    //   draftList.unshift(current);

      lastDoc = {
        title: current.data.text,
        protocol: "json",
        content: JSON.stringify(current),
        path: "",
        source: "api",
        saved: true,
      };

      $doc.load(lastDoc);
    }
    $menu.hide();
  });

  $menu.on("show", loadData);

  function loadData() {
    $ul.empty();
    $(minder.getRenderTarget()).addClass("loading");

    function loadFromServer() {
      // TODO:从服务端加载数据列表
      return Promise.resolve([
        {
          data: { text: "中心主题1", expandState: "expand" },
          children: [
            { data: { text: "分支主题" } },
            { data: { text: "分支主题" } },
          ],
          template: "default",
          theme: "fresh-blue",
          version: "1.3.5",
        },
        {
          data: { text: "中心主题2", expandState: "expand" },
          children: [
            { data: { text: "分支主题" } },
            { data: { text: "分支主题" } },
          ],
          template: "default",
          theme: "fresh-blue",
          version: "1.3.5",
        },
        {
          data: { text: "中心主题3", expandState: "expand" },
          children: [
            { data: { text: "分支主题" } },
            { data: { text: "分支主题" } },
          ],
          template: "default",
          theme: "fresh-blue",
          version: "1.3.5",
        },
        {
          data: { text: "中心主题4", expandState: "expand" },
          children: [
            { data: { text: "分支主题" } },
            { data: { text: "分支主题" } },
          ],
          template: "default",
          theme: "fresh-blue",
          version: "1.3.5",
        },
      ]);
    }

    function addListToUi(results) {
      fileList = results;
      fileList.forEach(function (item) {
        var $li = $("<li></li>")
          .addClass("draft-list-item")
          .data("item", item)
          .appendTo($ul);

        $("<h4></h4>")
          .addClass("draft-title")
          .text(item.data.text)
          .appendTo($li);

        // $("<span></span>")
        //   .addClass("file-time")
        //   .displayFriendlyTime(item.time)
        //   .appendTo($li);
      });
    }
    function error(e) {
      return notice.error("err_load", e);
    }
    return loadFromServer()
      .then(addListToUi)
      ["catch"](error)
      .then(function () {
        $(minder.getRenderTarget()).removeClass("loading");
      });
  }

  ret.reloadList=loadData;

  return ret;
});
