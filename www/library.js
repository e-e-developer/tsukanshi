function debug(key, value)
{
    if (isObject(value)) {
        var value = JSON.stringify(value);
    }
    console.log(key + ": -----> ");
    console.log(value);
}

function isObject(obj) {
  return obj instanceof Object && Object.getPrototypeOf(obj) === Object.prototype;
}

// ローカルストレージに値を保存
function saveLocalStorage(key, value)
{
    window.localStorage.setItem(key, JSON.stringify(value));
}

// ローカルストレージからデータを取得
function getLocalStorage(key)
{
    var d = window.localStorage.getItem(key);
    if (!d) {
        return null;
    }
    return results = JSON.parse(d);
}

// ローカルストレージのデータを削除
function removeLocalStorage(key)
{
    window.localStorage.removeItem(key);
}

//広告をタップするとそのままリンク先を開いてしまうことがありますので、その対策を記述します。
$(document).on("click", "a", function() {
    var href = $(this).attr('href');
    if (href == "" || href == null) {
        return;
    }
    if (href.match(/nend\.net\/click.php/) || href.match(/mobile\.co\.jp\//) || $(this).hasClass('banner')) {
        console.log("レクタングル広告がクリックされました。次 の URL に移動します。: " + href);
        window.open = cordova.InAppBrowser.open;
        window.open(href, "_system", 'location=yes');
        return false;
    }
    
    if (href.match(/^http/)) {
        window.open = cordova.InAppBrowser.open;
        window.open(href, "_system", 'location=yes');
        return false;
    }
    
});
