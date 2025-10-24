var errataTableObj = {
  init: function () {
    errataTableObj._createCategorySelect();
    errataTableObj._changeCategorySelect(
      null,
      setting.errataTableInitDispayCategoryCode
    );
  },
  _createCategorySelect: function () {
    var categoryMap = util.convertCodeMapToMap(setting.categoryCodeMap);

    var largecategoryCount = 0;

    for (var code = 1; code < Object.keys(categoryMap).length + 1; code++) {
      var largeCategory = setting.largeCategories[largecategoryCount];
      var dbTableName = setting.largeCategoryTableMap[largeCategory];
      var largeCategoryOption = "";
      var largeCategoryCodes = [];
      if (
        code == setting.tuuKanGyouHouCategoryCodes[0] ||
        code == setting.kaiGyouHouCategoryCodes[0]
        /*|| code == setting.tuuKanJituMuCategoryCodes[0]*/
      ) {
        if (code == setting.tuuKanGyouHouCategoryCodes[0]) {
          largeCategoryCodes = setting.tuuKanGyouHouCategoryCodes;
        } else if (code == setting.kaiGyouHouCategoryCodes[0]) {
          largeCategoryCodes = setting.kaiGyouHouCategoryCodes;
        }
        var largeCategoryOption = $("<option></option>", {
          id: "errataTable-option" + "_" + largeCategory,
          text: largeCategory + "（全範囲）",
          value: largeCategoryCodes,
        });
        largecategoryCount++;
      }
      if (largeCategoryOption) {
        if ($("#errataTable-select .select-input").length > 0) {
          // 正誤表遷移ボタンを続けてタップした場合
          $("#errataTable-select .select-input").append(largeCategoryOption);
        } else {
          $("#errataTable-select").append(largeCategoryOption);
        }
      }

      var caregory = categoryMap[code];

      //通関実務のみ子カテが無いので処理を分岐
      if (code == setting.tuuKanJituMuCategoryCodes[0]) {
        caregory = caregory + "（全範囲）";
      }
      var option = $("<option></option>", {
        id: "errataTable-option" + "_" + code,
        text: caregory,
        value: code,
      });
      if ($("#errataTable-select .select-input").length > 0) {
        // 正誤表遷移ボタンを続けてタップした場合
        $("#errataTable-select .select-input").append(option);
      } else {
        $("#errataTable-select").append(option);
      }
    }
  },
  _changeCategorySelect: function (event, targetCategoryCode) {
    $("#errataTable-items").empty();

    var categoryCode = event
      ? event.target.value.split(/,/g)
      : targetCategoryCode.toString().split(/,/g);
    categoryCode = categoryCode.map(function (a) {
      return parseInt(a);
    });
    errataTableObj
      ._listByCategoryCode(categoryCode)
      .then(function (resultRows) {
        if (resultRows.list.length == 0) {
          console.log("errataTableObj.changeSelect: DBデータが存在しません");
          return;
        }
        errataTableObj._createErrataTable(
          resultRows,
          categoryCode,
          resultRows.list
        );
        //errataTableObj._createCategorySelect(); // 正誤表遷移ボタンを続けてタップした場合initで対応できないので
      });
  },
  _createErrataTable: function (resultRows, categoryCode, list) {
    var acount = 1;
    if (useSqlite) {
      var topRow = resultRows.list.item(0);
      var dateRow = resultRows.date.item(0);
    } else {
      var topRow = resultRows["list"][0];
      var dateRow = resultRows["date"][0];
    }
    if (dateRow.answer_count) {
      acount = dateRow.answer_count;
      if (acount > 5) {
        acount = acount - 5 + 1;
      } else {
        acount = 1;
      }
    }

    $("#errataTable-itemContainer .errataCol").each((index, node) => {
      node.innerText = acount + index + "回目";
    });

    //最上部に実施日表示
    var onsListRow2 = $("<ons-row></ons-row>", {
      id: "errataTable-onsRow" + "_" + "date",
      class: "errataTableRow",
    });
    var answerRatioCol = $("<ons-col></ons-col>", {
      html: "実施日",
      class: "errataTableCol",
    });
    onsListRow2.append(answerRatioCol);
    acount -= 2;
    for (var jj = 1; jj < 6; jj++) {
      //var html = answer_ratio[jj].ratio == 0 ? "&nbsp;" : answer_ratio[jj].ratio ;
      var topRowdate = dateRow["answer_" + (((acount + jj) % 5) + 1) + "_date"];

      if (topRowdate) {
        topRowdate = topRowdate.replace(
          /^([0-9]+)-([0-9]+)-([0-9]+) ([0-9]+):([0-9]+):([0-9]+)/gu,
          "$2月$3日"
        );
      } else {
        topRowdate = "-";
      }

      var answerRatioCol = $("<ons-col></ons-col>", {
        id: "errataTable-answerCol" + "_" + jj + "_" + categoryCode,
        html: topRowdate,
        title: dateRow["answer_" + (((acount + jj) % 5) + 1) + "_date"],
        class: "errataTableCol",
      });
      onsListRow2.append(answerRatioCol);
    }
    $("#errataTable-items").append(onsListRow2);

    //正解率計算
    var answer_ratio = [];
    for (var ii = 0; ii < resultRows.list.length; ii++) {
      if (useSqlite) {
        var resultRow = resultRows.list.item(ii);
      } else {
        var resultRow = resultRows["list"][ii];
      }
      for (var jj = 1; jj < 6; jj++) {
        var html = "&nbsp;";
        var raw_acount = acount;
        var raw_sabun = dateRow.answer_count - resultRow["answer_count"];
        //console.log("answer_" +((acount + jj  ) % 5 + 1) );
        if (resultRow["answer_count"]) {
          //maxから5以上低いデータは飛ばす。
          if (raw_sabun >= 5) {
            continue;
          }

          raw_acount = acount + raw_sabun;
        }
        var answer = resultRow["answer_" + (((raw_acount + jj) % 5) + 1)];
        var answer_date =
          resultRow["answer_" + (((raw_acount + jj) % 5) + 1) + "_date"];
        var dateRow_date =
          dateRow["answer_" + (((raw_acount + jj) % 5) + 1) + "_date"];
        if (dateRow_date != answer_date) {
          continue;
        }

        answer_ratio[jj] = !answer_ratio[jj]
          ? { total: 0, true: 0, false: 0, ratio: "0" }
          : answer_ratio[jj];
        if (answer != null) answer_ratio[jj].total++;
        if (answer != null) {
          if (answer == 1) {
            answer_ratio[jj].true++;
          } else {
            answer_ratio[jj].false++;
          }
          var rat = (answer_ratio[jj].true / answer_ratio[jj].total) * 100;
          answer_ratio[jj].ratio = Math.round(rat * 100) / 100;
        }
      }

      //break;
    }

    //最下部に成功率表示
    var onsListRow2 = $("<ons-row></ons-row>", {
      id: "errataTable-onsRow" + "_" + ii,
      class: "errataTableRow",
    });
    var answerRatioCol = $("<ons-col></ons-col>", {
      html: "ランク",
      class: "errataTableCol errataTableColRank",
    });
    onsListRow2.append(answerRatioCol);

    for (var jj = 1; jj < 6; jj++) {
      var html =
        answer_ratio[jj].ratio == 0
          ? "-"
          : quizClass_getrank(parseInt(answer_ratio[jj].ratio));
      if (html == "-" && answer_ratio[jj].total > 0) {
        html = { title: "Eランク" };
      }
      if (html != "-") {
        html = html.title
          .replace("ランク", "")
          .replace(/[A-Za-z0-9]/g, function (s) {
            return String.fromCharCode(s.charCodeAt(0) + 0xfee0);
          });
      }

      var answerRatioCol = $("<ons-col></ons-col>", {
        id: "errataTable-answerCol" + "_" + jj + "_" + categoryCode,
        html: html,
        class: "errataTableCol",
      });
      onsListRow2.append(answerRatioCol);
    }
    $("#errataTable-items").append(onsListRow2);

    //acount -= 2;

    for (var ii = 0; ii < resultRows.list.length; ii++) {
      if (useSqlite) {
        var resultRow = resultRows.list.item(ii);
        var eachCategoryCode = resultRows.list.item(ii).categoryCode;
      } else {
        var resultRow = resultRows["list"][ii];
        var eachCategoryCode = resultRows.list[ii].categoryCode;
      }
      var onsListRow = $("<ons-row></ons-row>", {
        id: "errataTable-onsRow" + "_" + ii,
        class: "errataTableRow",
      });
      //TODO:pending
      //var title = '第' + resultRow.examTimes + '回' + '第' + resultRow.mainQuestionSeq + '問-' + resultRow.subQuestionSeq;
      var examTimes = resultRow.examTimes;
      var mainQuestionSeq = resultRow.mainQuestionSeq;
      var subQuestionSeq = resultRow.subQuestionSeq;
      var title = examTimes + "-" + mainQuestionSeq + "-" + subQuestionSeq;

      var tmpquizeobj = {};

      tmpquizeobj.categoryCode = parseInt(eachCategoryCode);
      tmpquizeobj.examTimes = parseInt(examTimes);
      tmpquizeobj.mainQuestionSeq = parseInt(mainQuestionSeq);
      tmpquizeobj.subQuestionSeq = parseInt(subQuestionSeq);

      if (bookmarkObj.is_bookmark(tmpquizeobj)) {
        title = "<span class='star'>⭐</span>" + title;
      } else {
        title = "<span class='star_dummy'>⭐</span>" + title;
      }

      var titleCol = $("<ons-col></ons-col>", {
        id:
          "errataTable-titleCol" +
          "_" +
          tmpquizeobj.categoryCode +
          "_" +
          examTimes +
          "_" +
          mainQuestionSeq +
          "_" +
          subQuestionSeq,
        html: "<span class='errataTableColTitle'>" + title + "</span>",
        class: "errataTableCol",
        on: {
          click: function (event) {
            var categoryCode = parseInt(event.currentTarget.id.split("_")[1]);
            var examTimes = parseInt(event.currentTarget.id.split("_")[2]);
            var mainQuestionSeq = parseInt(
              event.currentTarget.id.split("_")[3]
            );
            var subQuestionSeq = parseInt(event.currentTarget.id.split("_")[4]);
            var tableName = util.selectTableName(categoryCode);
            // quizObj生成
            var categoryMap = util.convertCodeMapToMap(setting.categoryCodeMap);
            initQuiz(
              categoryCode,
              examTimes,
              1,
              categoryMap[categoryCode],
              tableName
            );
            quizObj.mainQuestionSeq = mainQuestionSeq;
            quizObj.subQuestionSeq = subQuestionSeq;
            quizObj.fromErrataTalbe = true;
            questionObj.findAndLoadPage(quizObj);
            myNavigator.pushPage("quiz.html");
          },
        },
      });
      onsListRow.append(titleCol);

      var tmp_answer_count = 0;
      if (resultRow.answer_count) {
        tmp_answer_count = resultRow.answer_count;
        if (tmp_answer_count > 5) {
          tmp_answer_count = tmp_answer_count - 5 + 1;
        } else {
          tmp_answer_count = 1;
        }
        tmp_answer_count -= 2;
      }

      var account_min = dateRow.answer_count > 5 ? dateRow.answer_count - 5 : 0;
      var row_min = resultRow.answer_count > 5 ? resultRow.answer_count - 5 : 0;
      var sabun = account_min - row_min;

      for (var jj = 1; jj < 6; jj++) {
        var datakey = account_min + jj; //何回目
        var tmpdatakey = tmp_answer_count + jj; //何回目 1

        var raw_acount = acount;
        var raw_sabun = dateRow.answer_count - resultRow["answer_count"];
        var dateRow_date =
          dateRow["answer_" + (((raw_acount + jj) % 5) + 1) + "_date"];
        //console.log("answer_" +((acount + jj  ) % 5 + 1) );
        if (resultRow["answer_count"]) {
          // //maxから5以上低いデータは飛ばす。
          // if( raw_sabun >= 5 )
          // {
          //     console.log(["skip",resultRow["answer_count"]]);
          //     continue;
          // }
          raw_acount = acount + raw_sabun;
        }
        var html = "&nbsp;";
        var answer = resultRow["answer_" + (((raw_acount + jj) % 5) + 1)];
        var answer_date =
          resultRow["answer_" + (((raw_acount + jj) % 5) + 1) + "_date"];

        html =
          answer != null
            ? answer == 1
              ? "<span class='errataTable-answerValue-maru'>" +
                setting.twoSelectionMaru +
                "</span>"
              : "<span class='errataTable-answerValue-batu'>" +
                setting.twoSelectionBatsu +
                "</span>"
            : "&nbsp;";
        if (account_min > tmp_answer_count + (((raw_acount + jj) % 5) + 1)) {
          html = "&nbsp;";
        }
        if (raw_sabun > 5) {
          html = "&nbsp;";
        }
        if (answer_date !== dateRow_date) {
          html = "&nbsp;";
        }

        //html = resultRow["answer_count"];

        var answerCol = $("<ons-col></ons-col>", {
          id: "errataTable-answerCol" + "_" + jj + "_" + categoryCode,
          html: html,
          class: "errataTableCol",
        });
        onsListRow.append(answerCol);
      }
      $("#errataTable-items").append(onsListRow);
    }

    //最下部に成功率表示
    var onsListRow2 = $("<ons-row></ons-row>", {
      id: "errataTable-onsRow" + "_" + ii,
      class: "errataTableRow",
    });
    var answerRatioCol = $("<ons-col></ons-col>", {
      html: "正解率",
      class: "errataTableCol",
    });
    onsListRow2.append(answerRatioCol);

    for (var jj = 1; jj < 6; jj++) {
      var html =
        answer_ratio[jj].ratio == 0 ? "-" : answer_ratio[jj].ratio + "%";

      var answerRatioCol = $("<ons-col></ons-col>", {
        id: "errataTable-answerCol" + "_" + jj + "_" + categoryCode,
        html: html,
        class: "errataTableCol",
      });
      onsListRow2.append(answerRatioCol);
    }
    $("#errataTable-items").append(onsListRow2);
  },
  _listByCategoryCode: function (categoryCode) {
    categoryCode = Array.isArray(categoryCode) ? categoryCode : [categoryCode];
    var resultRows = {};
    return new Promise(function (resolve, reject) {
      db.transaction(
        function (tx) {
          //通関実務のみ、１カテゴリのみなのでindexOfでチェックして処理を分けている
          var dataType =
            categoryCode.length > 1 || categoryCode.indexOf(31) !== -1
              ? "subtotal"
              : "quiz";
          var query =
            "select" +
            " " +
            "   mainTable.categoryCode, mainTable.examTimes, mainTable.mainQuestionSeq, mainTable.subQuestionSeq" +
            "," +
            "   answerHistry.answer_1, answerHistry.answer_2, answerHistry.answer_3, answerHistry.answer_4, answerHistry.answer_5" +
            "," +
            "   answerHistry.answer_count" +
            "," +
            "   answerHistry.answer_1_date, answerHistry.answer_2_date, answerHistry.answer_3_date, answerHistry.answer_4_date, answerHistry.answer_5_date" +
            " " +
            "from " +
            util.selectTableName(categoryCode[0]) +
            " mainTable" +
            " " +
            "left join " +
            setting.TAnswerHistry +
            " answerHistry" +
            " " +
            "   on mainTable.categoryCode = answerHistry.categoryCode" +
            " " +
            "   and mainTable.examTimes = answerHistry.examTimes" +
            " " +
            "   and mainTable.mainQuestionSeq = answerHistry.mainQuestionSeq" +
            " " +
            "   and mainTable.subQuestionSeq = answerHistry.subQuestionSeq" +
            " " +
            '   and answerHistry.dataType = "' +
            dataType +
            '"';

          query +=
            " " +
            "where mainTable.categoryCode IN (" +
            categoryCode.join(",") +
            ")";
          //query +=  ' ' +  '   and answerHistry.dataType = "' + dataType + '"';
          //query +=  ' ' + 'order by mainTable.categoryQuizSeq';
          query +=
            " " +
            "order by mainTable.examTimes DESC, mainTable.mainQuestionSeq ASC,mainTable.subQuestionSeq ASC ";
          tx.executeSql(query, [], function (tx, result) {
            // console.log({ result });

            var dataType =
              categoryCode.length > 1 || categoryCode.indexOf(31) !== -1
                ? "subtotal"
                : "quiz";
            resultRows.list = result.rows;
            var lastdatequery =
              "select" +
              " " +
              "   max(answerHistry.answer_1_date) as answer_1_date, max(answerHistry.answer_2_date) as answer_2_date, max(answerHistry.answer_3_date) as answer_3_date, max(answerHistry.answer_4_date) as answer_4_date, max(answerHistry.answer_5_date) as answer_5_date, max(answerHistry.answer_count) as answer_count" +
              " " +
              "from " +
              util.selectTableName(categoryCode[0]) +
              " mainTable" +
              " " +
              "left join " +
              setting.TAnswerHistry +
              " answerHistry" +
              " " +
              "   on mainTable.categoryCode = answerHistry.categoryCode" +
              " " +
              "   and mainTable.examTimes = answerHistry.examTimes" +
              " " +
              "   and mainTable.mainQuestionSeq = answerHistry.mainQuestionSeq" +
              " " +
              "   and mainTable.subQuestionSeq = answerHistry.subQuestionSeq" +
              " " +
              '   and answerHistry.dataType = "' +
              dataType +
              '"';
            lastdatequery +=
              " " +
              "where mainTable.categoryCode IN (" +
              categoryCode.join(",") +
              ")";

            //lastdatequery += ' ' + 'order by mainTable.categoryQuizSeq';
            lastdatequery +=
              "order by mainTable.examTimes DESC, mainTable.mainQuestionSeq ASC,mainTable.subQuestionSeq ASC ";
            //console.log(categoryCode,lastdatequery);
            tx.executeSql(lastdatequery, [], function (tx, result) {
              resultRows.date = result.rows;
            });
          });
        },
        function (error) {
          return reject(error.message);
        },
        function () {
          return resolve(resultRows);
        }
      );
    });
  },
};
