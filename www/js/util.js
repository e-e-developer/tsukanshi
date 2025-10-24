var util =
{
    selectTableName: function(categoryCode){
        if (categoryCode == null) {
            console.log('selectTableName:カテゴリコードが指定されていません');
            return null;
        }
        if (!!setting.tuuKanGyouHouCategoryCodes.includes(categoryCode)) {
            return setting.TTuuKanGyouHouQuiz;
        }
        if (!!setting.kaiGyouHouCategoryCodes.includes(categoryCode)) {
            return setting.TKaiGyouHouQuiz;
        }
        if (!!setting.tuuKanJituMuCategoryCodes.includes(categoryCode)) {
            return setting.TTuuKanJituMuQuiz;
        }
        console.log('DBと紐づかないメニューが選択されました');
    },
    convertCodeMapToMap: function(codeMap){
        var map = {};
        for (var i = 0; i < Object.keys(codeMap).length; i++) {
            map[i + 1] = Object.keys(codeMap)[i];
        }
        return map;
    },

    datetime: function(datetime){
        var now = datetime ? new Date(datetime) : new Date();
        var y = now.getFullYear();
        var m = parseInt(now.getMonth())+1;
        var d = now.getDate();

        var h = now.getHours();
        var i = now.getMinutes();
        var s = now.getSeconds();
        return y + "-" + m + "-" + d + " " +  h  +  ":" + i +  ":" + s ;

    }

};

var exdbug = 
{
      /*dbquery確認*/
    q:function ( query_string ){
        console.log(["query:",query_string]);
        return query_string;
    }

}
