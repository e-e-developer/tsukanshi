/**
 * テーブルデータの有無を判定する
 * @param {string} tableName - チェックするテーブル名
 * @return {Promise} - データがあればtrue、データがない場合、テーブル名が不正な場合はfalse。
 */
function checkTableDataExists(tableName) {
  return new Promise((resolve, reject) => {
    // 禁止文字をチェック（空白、特殊文字を含む場合は不正と判断）
    if (/[^\w-]/.test(tableName)) {
      console.error(`不正なテーブル名: ${tableName}`);
      return resolve(false);
    }    
    var db = window.sqlitePlugin.openDatabase({ name: setting.dbName, location: 'default' });    

    db.transaction(function (tx) {
      var query = `SELECT COUNT(*) AS cnt FROM \`${tableName}\``;
      tx.executeSql(query, [], function (tx, res) {
        if (res.rows.length > 0 && res.rows.item(0).cnt > 0) {
          console.log(`テーブル: ${tableName} にデータが存在します`);
          resolve(true);
        } else {
          console.log(`テーブル: ${tableName} にデータが存在しません`);
          resolve(false);
        }
      }, function (tx, error) {
        console.error(`テーブル確認エラー: ${error.message}`);
        resolve(false);
      });
    });
  });
}

/**
 * 取り込み対象(スプレッドシート)のルールについて
 * １．(少なくとも)カンマ(,)、ダブルクオート(")の含まれる文字列はダブルクオート(")で括られている。(ので除去する)
 * ２．行の改行コードは[CRLF]、セルの文字列内は[LF]になっている。 
 */
const readAllCsv = function (isRead) {
  // CSVタイトル項目数
  const CSV_TITLE_COLUMN_NUM = 6;
  // CSVカラム順(問題番号)
  const CSV_QUESTION_NUMBER_COLUMN_INDEX = 1;
  // CSVの行開始番号
  const BEGIN_CSV_ROW = 1;

  // テーブルカラム数
  const TABEL_COLUMN_COUNT = Object.keys(setting.TQuizCreateQuery).length - (setting.TQuizCreateQuery['primaryKeys'] ? 1 : 0);
  // 編集前のテーブルカラム数
  const UNMODIFIED_TABEL_COLUMN_COUNT = TABEL_COLUMN_COUNT - 3;
  // テーブルカラム順(カテゴリ名)
  const TABLE_CATEGORY_NAME_COLUMN_INDEX = 2;
  // テーブルカラム順(問題)
  const TABLE_QUESTION_COLUMN_INDEX = 7;
  // テーブルカラム順(選択肢)
  const TABLE_SELECTION_COLUMN_INDEX = 9;
  // サブカテゴリ開始時の文字
  const SUB_CATEGORY_START_WORD = '（';

  var importCount = 0;
  /**
   * DB作成
   */
  function openDb() {
    // データベース名、バージョン、表示名、サイズ
    //if(window.sqlitePlugin){
    if (db && db.isOpen) {
      console.log("データベースはすでに開かれています。");
      return db;
    }
    if (useSqlite) {
      db = window.sqlitePlugin.openDatabase({ name: setting.dbName, location: 'default' });
    } else {
      db = openDatabase(setting.dbName, '', setting.dbName, setting.dbSize);
    }
    db.isOpen = true;
    return db;
  }


  var wsUtil = (function (dbfactory) {
    // DB作成
    db = dbfactory();
    // パブリックな関数を定義
    return {
      /**
       * テーブル作成
       * @return {Promise}
       */
      init: function() {
          
        var queryStr = '';
        var primaryKeyStr = '';
        var keys = Object.keys(setting.TQuizCreateQuery);
        for (var i = 0; i < keys.length; i++)
        {
            
          var value = setting.TQuizCreateQuery[keys[i]];
          if(keys[i] != "primaryKeys"){
            queryStr = queryStr + ' ' + value + ',';
          } else {
            for (var ii = 0; ii < value.length; ii++)
            {
              if(primaryKeyStr == ''){
                primaryKeyStr = ' PRIMARY KEY(';
              }
              var separate2 = ii == value.length - 1 ? '' : ',';
              primaryKeyStr = primaryKeyStr + ' ' + value[ii] + separate2;
            }
            primaryKeyStr += ')';
          }
        }
        return new Promise(function (resolve, reject) {
          db.transaction(function (tx) {
            //TODO:動作確認のためDropしている
            if (!isRead) {
              tx.executeSql('DROP TABLE IF EXISTS ' + setting.TAnswerHistry);
              tx.executeSql('CREATE TABLE IF NOT EXISTS ' + setting.TAnswerHistry + '(' + setting.TAnswerHistryCreateQuery + ')');
              tx.executeSql('DROP TABLE IF EXISTS ' + setting.TAnswerCountHistry);
              tx.executeSql('CREATE TABLE IF NOT EXISTS ' + setting.TAnswerCountHistry + '(' + setting.TAnswerCountHistryInsertQuery + ')');
            // }
            
            tx.executeSql('DROP TABLE IF EXISTS ' + setting.TTuuKanGyouHouQuiz);
            tx.executeSql('DROP TABLE IF EXISTS ' + setting.TTuuKanJituMuQuiz);
            tx.executeSql('DROP TABLE IF EXISTS ' + setting.TKaiGyouHouQuiz);
            tx.executeSql('CREATE TABLE IF NOT EXISTS ' + setting.TTuuKanGyouHouQuiz + '(' + queryStr + primaryKeyStr + ')');
            tx.executeSql('CREATE TABLE IF NOT EXISTS ' + setting.TTuuKanJituMuQuiz + '(' + queryStr + primaryKeyStr + ')');
            tx.executeSql('CREATE TABLE IF NOT EXISTS ' + setting.TKaiGyouHouQuiz + '(' + queryStr + primaryKeyStr + ')');

            tx.executeSql('DROP TABLE IF EXISTS ' + setting.TAllAnswerCountHistry);
            tx.executeSql('CREATE TABLE IF NOT EXISTS ' + setting.TAllAnswerCountHistry + '(' + setting.TAllAnswerHistryCreateQuery + ')');
            }

            tx.executeSql('CREATE TABLE IF NOT EXISTS ' + setting.TAllAnswerCountHistry + '(' + setting.TAllAnswerHistryCreateQuery + ')');


            //TAnswerHistryへのカラム追加 
            tx.executeSql('SELECT sql  FROM sqlite_master where tbl_name="' + setting.TAnswerHistry + '"  AND type = "table" ', [], function (tx, results) {
              if (useSqlite) {
                var resultRow = results.rows.item(0).sql;
              } else {
                var resultRow = results.rows[0].sql;          
              }
              if( resultRow.match(/answer_1_date/) === null ){
                for (var i = 0; i < setting.AddTAnswerHistryCreateQuery.length ; i++) {
                  tx.executeSql('ALTER TABLE '+ setting.TAnswerHistry +' ADD  ' +  setting.AddTAnswerHistryCreateQuery[i] + ' ');
                }              
              }
            });
            console.log('--------------db----------------');

            //TBookMarkの追加
            tx.executeSql('CREATE TABLE IF NOT EXISTS ' +  setting.TBookMark + '(' + setting.TBookMarkCreateQuery + ')');// add 2023-01-31 ex
            
            //TAnswerHistryのtable作り直し           
            tx.executeSql('SELECT sql  FROM sqlite_master where tbl_name="' +  setting.TAnswerHistry + '"  AND type = "table" ',[],function (tx, results) {
                console.log(["results",results]);
                if (useSqlite) {
                    var resultRow = results.rows.item(0).sql ;
                }else{
                    var resultRow = results.rows[0].sql;
                }
              if( resultRow.match(/dataType/) === null ){
                console.log("hurui");
                TAnswerHistryDBRemake.dbremake = true;
                TAnswerHistryDBRemake.getalldata(tx);
                //TAnswerHistryDBRemake.droptable(tx);  
                TAnswerHistryDBRemake.createtable(tx);  

                setTimeout(function(){
                  db.transaction( function(tx2) {                 
                  TAnswerHistryDBRemake.setdata(tx2);       
                  });
                },500);
              }
            });
            
            //TAnswerCountHistryのtable作り直し           
            
            tx.executeSql('SELECT sql  FROM sqlite_master where tbl_name="' +  setting.TAnswerCountHistry + '"  AND type = "table" ',[],function (tx, results) {

            if (useSqlite) {
                var resultRow = results.rows.item(0).sql ;
            }else{
                var resultRow = results.rows[0].sql;
            }
              if( resultRow.match(/dataType/) === null ){
                TAnswerCountHistryDBRemake.dbremake = true;
                TAnswerCountHistryDBRemake.getalldata(tx);
                //TAnswerCountHistryDBRemake.droptable(tx);  
                TAnswerCountHistryDBRemake.createtable(tx);  

                setTimeout(function(){
                  db.transaction( function(tx2) {                 
                  TAnswerCountHistryDBRemake.setdata(tx2);       
                  });
                },500);
              }
            });

          }, function(error) {
              console.log(["eratta",error.message])
            reject(error.message);
          }, function() {
            console.log('init success');
            resolve();
          });
        });
      },

      import: function(questionCSVNames, quizCSVFilePaths, categoryQuizSeqMap) {
        return new Promise(function(resolve, reject) {
          // ファイル読み込み
          var quizCSVFilePath = quizCSVFilePaths[0];
          var questionCSVName = questionCSVNames[0];
          var filePath = quizCSVFilePath + questionCSVName + '.csv';
//          var req = _getFile(filePath);

//          req.onload = function() {
          if (useSqlite) {
            var _getFileFunc  = _getFilePromise
          }else{
            var _getFileFunc  = _getFile;//_getfetchFilePromise
          }
           _getFileFunc(filePath).then((csvdata)=>{
            var csv = _convertToArray(csvdata, categoryQuizSeqMap);
            db.transaction(function(tx) {
              for (var rowI = 0; rowI < csv.length; rowI++) {
                var str = csv[rowI][0];
                if (str !=='') {
                  var valuesStr = '';
                  for (var i = 0; i < TABEL_COLUMN_COUNT; i++){
                    valuesStr = i != TABEL_COLUMN_COUNT - 1
                      ? valuesStr + '?,'
                      : valuesStr + '?';
                  }
                  var getImportTableName = function(quizCSVFilePath){
                      if (!!quizCSVFilePath.includes('tuuKanJituMu')){
                        return setting.TTuuKanJituMuQuiz;
                      }
                      if (!!quizCSVFilePath.includes('tuuKanGyouHou')){
                        return setting.TTuuKanGyouHouQuiz;
                      }
                      if (!!quizCSVFilePath.includes('kaiGyouHou')){
                        return setting.TKaiGyouHouQuiz;
                      }
                  };
                  if(isRead){
                  //tx.executeSql('REPLACE INTO ' + getImportTableName(quizCSVFilePath) + ' VALUES (' + valuesStr + ')', csv[rowI]);
                  //tx.executeSql('insert or ignore into ' + getImportTableName(quizCSVFilePath) + ' VALUES (' + valuesStr + ')', csv[rowI]);
                   //tx.executeSql(_createUpdateQuestionQuery(true,getImportTableName(quizCSVFilePath) ,csv[rowI]));
                   var queryStr;
                   if(queryStr = _createUpdateQuestionQuery(getImportTableName(quizCSVFilePath) ,csv[rowI])){
                   tx.executeSql(queryStr, [], function (tx, results) {
              
                    //if(results.rows.length!=1){
                    //  console.log("l=")
                    //}
                   
                  });
                  }
                  }else{
                    tx.executeSql('REPLACE INTO ' + getImportTableName(quizCSVFilePath) + ' VALUES (' + valuesStr + ')', csv[rowI]);
                  }
                }
              }
            }, function(error) {
              reject(error.message);
            }, function() {
              {
                importCount++;
                console.log('import success: ' + importCount + ' / ' + setting.quizCSVFilePaths.length * setting.questionCSVNames.length);
              }
              {
                questionCSVNames.shift();
                if (questionCSVNames.length > 0) {
                  // 取込ファイル名を変更してCSV再取込
                  wsUtil.import(questionCSVNames, quizCSVFilePaths, categoryQuizSeqMap);
                } else {
                  quizCSVFilePaths.shift();
                  if (quizCSVFilePaths.length > 0) {
                    // 取込ディレクトリを変更してCSV再取込
                    categoryQuizSeqMap = createCategoryQuizSeqMap();
                    questionCSVNames = Object.create(setting.questionCSVNames);
                    wsUtil.import(questionCSVNames, quizCSVFilePaths, categoryQuizSeqMap);
                  } else {
                    // 取込終了
                    console.log('取込終了');
                    saveLocalStorage(setting.CSVImportedKey, true);
                    document.querySelector('ons-modal').hide();
                    if (getLocalStorage(setting.storedQuizObjKey)) {
                      dialogObj.showLoadStoredDataDialog();
                    }
                    resolve();
                  }
                }
              }
            });
          });
        });
      },
    }

    // プライべートな関数を定義
/*
    UPSERT用のSQL 作成
*/
    function _createUpdateQuestionQuery(table,row){
      var queryStr="";
    
        queryStr = 'UPDATE '+ table ;//name = "細田", age = 30 WHERE id = 5';
        //queryStr = 'SELECT * from ' + table;
        updateStr =' SET ';
        whereStr = ' WHERE ';
        var keys = Object.keys(setting.TQuizCreateQuery);
        for (var i = 0; i < keys.length; i++) {
          //var value = setting.TQuizCreateQuery[keys[i]];
          
            if(keys[i] == "question" ||
            keys[i] == "stampTwoSelections" ||
            keys[i] == "selection" ||
            keys[i] == "answerKey" ||
            keys[i] == "explanation" 
            ){
            updateStr = updateStr + keys[i] + '=' + "'" + row[i] + "',";
            }else if(keys[i] == "categoryQuizSeq" ||
            keys[i] == "categoryCode" ||
            keys[i] == "categoryName" ||
            keys[i] == "examTimes"
            //keys[i] == "mainQuestionSeq" ||
            //keys[i] == "subQuestionSeq" 
            ){
              
              whereStr = whereStr + keys[i] + '=' + (keys[i] == "categoryName" ? "'"+row[i]+"'" : row[i])+ ' AND ';
            }
          
        }
        //最後の余分な, AND 削除
        updateStr = updateStr.substring(0, updateStr.length - 1);
        whereStr = whereStr.substring(0, whereStr.length - 5);
        if(whereStr.indexOf("NaN")!=-1){
          return null;
        }
       queryStr = queryStr + updateStr + whereStr;  
       //queryStr = queryStr + whereStr; 

      
      return queryStr;
    }
    /**
     * 文字列の 'null' を null に変換
     * @param {string} field
     * @retuen {(null|string)}
     */
    function _convertToNull(field) {
      if (undefined === field || (field !== undefined && field.toLowerCase() === 'null')) {
        return null;
      }

      return field;
    }

     /**
      * ファイルを読み込む
      * @param {string} fileName ファイルパス
      * @return {XMLHttpRequest} req.onload = function(){} で読み込み完了を判別する
      */
    function _getFile(fileName) {
      return new Promise(function(resolve, reject) {
      var req = new XMLHttpRequest();
      req.open('get', fileName, true);
      req.send(null);
      req.onload = function ()
      { 
       
              resolve(req.responseText);
                
      }
     
      })
    }
    function _getfetchFilePromise(fileName) {
      return fetch(fileName) // (1) リクエスト送信
      .then(response => response.text()) // (2) レスポンスデータを取得
      .then(data => { // (3)レスポンスデータを処理
      return data;
      });   
   }
    // function _getFilePromise(settingsFileName) {
    //   return new Promise(function(resolve, reject) {
    //   // 設定ファイルへのパス（URL）
    //   var urlToFile = cordova.file.applicationDirectory +'/www/' + settingsFileName;

    //   // 設定ファイルのFileEntryオブジェクトを取得
    //   window.resolveLocalFileSystemURL(urlToFile,
    //     // （第2引数）成功したら呼び出される関数
    //     function success1(fileEntry) {

    //       fileEntry.file(
    //         // （fileメソッドの第1引数）成功したら呼び出される関数
    //         function success2 (file) {
    //           // FileReaderオブジェクトを作成
    //           var reader = new FileReader();

    //           // ファイル読み込み後の処理をセット
    //           reader.onloadend = function (e) {
    //             console.log("read success: " + e.target.result);

    //             // ここにファイルの内容（＝e.target.result）を使うコードを書いていく
    //             resolve(e.target.result);
    //           };
    //           // ファイル読み込みを実行
    //           reader.readAsText(file);
    //         },
    //         // （第2引数）失敗したら呼び出される関数
    //         function fail (error) {
    //           console.log("loadSettings():fileEntry.file Error: " + error.code);
    //           reject(error.code);
    //         });
    //     },
    //     // （第3引数）失敗したら呼び出される関数
    //     function fail(error) {
    //       console.log("loadSettings():resolveLocalFileSystemURL Error: "
    //         + error.code);
    //         reject(error.code);
    //     }

    //   );
    //   })
    // }

    function _getFilePromise(settingsFileName) {
      return new Promise(function (resolve, reject) {
        var urlToFile = settingsFileName; // 'www/' は不要。WebViewからは相対パスで読める。
        console.log("Trying to fetch file from:", urlToFile);

        fetch(urlToFile)
          .then(response => {
            if (!response.ok) {
              throw new Error("HTTP error! status: " + response.status);
            }
            return response.text();
          })
          .then(text => {
            // console.log("Read success:", text);
            console.log("Read success:");
            resolve(text);
          })
          .catch(error => {
            console.error("Fetch error:", error);
            reject(error);
          });
      });
    }
    // function _convertToArray(val) {
    //   var result = [];
    //   // 改行コード区切りで各行の配列を生成
    //   var tmp = val.split('\n');
    //   // 各行の配列からカンマ区切りで配列を生成
    //   for (var i = 0; i < tmp.length; ++i) {
    //     result[i] = tmp[i].split(',');
    //     for (var j = 0; j < result[i].length; ++j) {
    //       result[i][j] = _convertToNull(result[i][j]);
    //     }
    //   }
    //   return result;
    // }

    function _addSubCategoryColumn(columns){
      var category = columns[TABLE_CATEGORY_NAME_COLUMN_INDEX];
      var subCategoryStart = category.indexOf(SUB_CATEGORY_START_WORD);
      if(category.indexOf(SUB_CATEGORY_START_WORD) != -1){
        columns[TABLE_CATEGORY_NAME_COLUMN_INDEX] = category.substr(0, subCategoryStart);
        columns.splice(TABLE_CATEGORY_NAME_COLUMN_INDEX + 1, 0, category.substr(subCategoryStart));
      } else {
        columns.splice(TABLE_CATEGORY_NAME_COLUMN_INDEX + 1, 0, null);
      }
    }

    function _addStampTwoSelectionsColumn(columns){
      var selection = columns[TABLE_SELECTION_COLUMN_INDEX - 1];
      columns.splice(TABLE_QUESTION_COLUMN_INDEX + 1, 0, selection == setting.twoSelectionStr ? 1 : 0);
    }

    function _convertToArray(val, categoryQuizSeqMap) {
      var rows = val.split('\r');
      var result = [];
      var columns = [];
      for (var rowI = BEGIN_CSV_ROW; rowI < rows.length; rowI++)
      {
        var row = rows[rowI];
        var columnStr = row.split(',');
        if (columnStr.length != CSV_TITLE_COLUMN_NUM) // 文字列としてカンマが扱われている場合
        {
          var strIncludedCammma = [];
          while(row.indexOf('"') != -1){
            {
              var startAt = row.indexOf('"');
              row = row.replace(row.substr(startAt, 1), '');
            }
            {
              var endAt = row.indexOf('"');
              row = row.replace(row.substr(endAt, 1), '');
            }
            {
              var target = row.substr(startAt, endAt - startAt);
              strIncludedCammma.push(target);
              row = row.replace(target, 'null');
            }
          }
          columnStr = row.split(',');
          for (var i = 0; i < columnStr.length; i++) {
            if (columnStr[i] == 'null' && strIncludedCammma.length > 0){
              columnStr[i] = strIncludedCammma[0];
              strIncludedCammma.shift();
            }
          }
        }
        for(var columnI = 0; columnI < columnStr.length; columnI++) // レコードを作成
        {
          var column = columnStr[columnI];
          if(columnI == 0){
            var categoryName = column.replace(/\n/g,'');//replaceAll('\n', '');
            {
              var categoryQuizSeq = categoryQuizSeqMap[categoryName] + 1;
              if (!categoryQuizSeq) {
                console.log(categoryName + 'でcategoryQuizSeqMapを参照しましたが見つかりませんでした');
              }
              columns.push(categoryQuizSeq); // categoryQuizOrder
              categoryQuizSeqMap[categoryName] = categoryQuizSeq;
            }
            column = categoryName;
            columns.push(setting.categoryCodeMap[column]); // categoryCode
            columns.push(column); // categoryName
          } else if(columnI == CSV_QUESTION_NUMBER_COLUMN_INDEX){
            var questionValues = column.split('-');
            columns.push(questionValues[0]); // examTimes
            columns.push(questionValues[1]); // categoryCode
            columns.push(questionValues[2]); // categorySeq
          } else if(column[0] == '"'){
            if(column[column.length - 1] != '"'){
              console.log('エラー:文章中のダブルクオートの位置が不正です');
            }
            column = column.substr(1, column.length - 2);
            columns.push(column);
          } else if (column == setting.twoSelectionMaru || column == setting.twoSelectionBatsu) {
            if (setting.twoSelectionMaru == '') {
              console.log('答案が入力されていないCSVレコードがあります');
            }
            columns.push(column == setting.twoSelectionMaru ? setting.twoSelectionMaru : setting.twoSelectionBatsu);
          } else {
            columns.push(column);
          }
          if(columns.length == UNMODIFIED_TABEL_COLUMN_COUNT) {
            _addSubCategoryColumn(columns);
            _addStampTwoSelectionsColumn(columns);
            columns.push(null); // 正解フラグを初期化
            result.push(columns);
            columns = [];
          }
        }
      }
      if (columns.length != 0) {
        console.log('エラー:CSVファイルの項目数が不正です');
      }
      return result;
    }

  })(function() {
    // dbfactory
    return openDb();
  });

  function createCategoryQuizSeqMap() {
    var categoryQuizSeqMap = {};
    for (var i = 0; i < Object.keys(setting.categoryCodeMap).length; i++) {
      categoryQuizSeqMap[Object.keys(setting.categoryCodeMap)[i]] = 0;
    }
    return categoryQuizSeqMap;
  }
 
    // SQLite Database の初期化と CSVファイルの取り込み
    wsUtil.init().then(function () {
      var questionCSVNames = Object.create(setting.questionCSVNames);
      var quizCSVFilePaths = Object.create(setting.quizCSVFilePaths);
      wsUtil.import(questionCSVNames, quizCSVFilePaths, createCategoryQuizSeqMap());
    });
 
};