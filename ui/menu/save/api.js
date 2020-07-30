/**
 * @fileOverview
 *
 * 导出数据到本地
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
KityMinder.registerUI("menu/save/api", function (minder) {
  var $menu = minder.getUI("menu/menu");
  var $save = minder.getUI("menu/save/save");
  var $eve = minder.getUI("eve");
  var $doc = minder.getUI("doc");
  var ret = $eve.setup({});

  /* 导出面板 */
  var $panel = $($save.createSub("api")).addClass("netdisk-save-panel");

  /* 标题 */
  var $title = $("<h2></h2>")
    .text(minder.getLang("ui.menu.savetoapiheader"))
    .appendTo($panel);

  var $selects = $('<div class="netdisk-save-select"></div>').appendTo($panel);

  //   $("<label>").text(minder.getLang("ui.saveas")).appendTo($selects);

  /* 文件名 */
  //   var $filename = $("<input>")
  //     .addClass("fui-widget fui-selectable")
  //     .attr("type", "text")
  //     .attr("placeholder", minder.getLang("ui.filename"))
  //     .attr("title", minder.getLang("ui.filename"))
  //     .on("keydown", function (e) {
  //       if (e.keyCode == 27) $menu.toggle();
  //       if (e.keyCode == 13) save();
  //     })
  //     .appendTo($selects);

  /* 文件格式 */
  //   var $format = $("<select>")
  //     .attr("title", minder.getLang("ui.fileformat"))
  //     .appendTo($selects);

  //   var supports = [];

  //   minder.getSupportedProtocols().forEach(function (protocol) {
  //     if (protocol.encode) {
  //       supports.push(protocol);
  //     }
  //   });
  //   // 删除不稳定两种格式
  //   delete supports[".mm"];
  //   delete supports[".xmind"];

  //   for (var ext in supports) {
  //     var protocol = supports[ext];
  //     if (!protocol.encode) return;
  //     $("<option>")
  //       .text(protocol.fileDescription + "(" + protocol.fileExtension + ")")
  //       .val(ext)
  //       .appendTo($format);
  //   }

  //   $format.val(".km");

  /* 保存按钮 */
  var $saveBtn = $("<button></button>")
    .addClass("save-button")
    .text(minder.getLang("ui.save"))
    .click(save)
    .appendTo($selects);

  //   $menu.on("show", setFilename);

  ret.quickSave = quickSave;

  var autoSaveDuration = minder.getOptions("autoSave");

  if (autoSaveDuration !== false) {
    autoSaveDuration = isNaN(autoSaveDuration) ? 3000 : autoSaveDuration * 1000;
    autoSave();
  }

  var autoSaveTimer = 0;

  function autoSave() {
    function lazySave(doc) {
      if (doc.saved) return;
      clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(saveCurrent, autoSaveDuration);
    }
    $doc.on("docchange", lazySave);
  }

  //   function setFilename() {
  //     var doc = $doc.current();

  //     $filename.val(doc.title);

  //     $filename[0].select();
  //   }

  function quickSave() {
    var doc = $doc.current();
    if (doc.source != "api" && !$menu.isVisible()) {
      $menu.$tabs.select(2);
      $save.$tabs.select(0);
      return $menu.show();
    } else {
      saveCurrent();
    }
  }

  function saveCurrent() {
    var doc = $doc.current();

    if (doc.source != "api") return Promise.resolve();

    var $title = minder.getUI("topbar/title").$title;
    // $filename.val(doc.title);
    return doSave(doc.path, doc.protocol, doc, $title, "leaveTheMenu");
  }

  function save() {
    doSave("", "json", $doc.current(), $panel);
  }

  var saving = 0;

  function ajax(opt) {
    opt.cache = false;
    return new Promise(function (resolve, reject) {
      $.ajax(opt).done(resolve).fail(reject);
    });
  }

  function doSave(path, protocol, doc, $mask, leaveTheMenu, msg) {
    if (saving) return;

    saving = true;
    $doc.lock();

    if ($mask) $mask.addClass("loading");

    function upload(data) {
      // TODO: 在此处修改上传url及内容
      return ajax({
        type: "POST",
        url: "",
        data: data,
      });
    }

    function finish(file) {
      if (!file.modifyTime) throw new Error("File Save Error");

      if (!leaveTheMenu) {
        $menu.hide();
      }

      doc.path = "";
      //   doc.title = $filename.val();
      doc.source = "api";
      doc.protocol = protocol;

      $doc.save(doc);
      $doc.unlock();

      minder.getUI("menu/open/api").reloadList();
      //notice.info(msg || minder.getLang('ui.save_success', doc.title, file.modifyTime.toLocaleTimeString()));
    }

    function error(e) {
      notice.error("err_save", e);
    }

    return minder
      .exportData(protocol)
      .then(upload)
      .then(finish, error)
      .then(function () {
        if ($mask) $mask.removeClass("loading");
        saving = false;
      });
  }
  return ret;
});
