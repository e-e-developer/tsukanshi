var menuObj =
{
    loadMenu: function (){
        var largeCategoryMap = {};
        var categoryMap = {};
        var initExamTimes = 55;
        var initQuizSeq = 1;

        var btnTableFnc = function (id_) {
            return $("<table></table>", {
                id:"category-btnTable" + "_" + id_,
                css: {width: "100%", height:"auto", border: "none"}
            });
        };
        var btnTdFnc = function (id_) {
            return $("<td></td>", {
                id:"category-btnTd" + "_" + id_,
                "class": "main_btn"
            });
        };
        var addNodeFnc = function(btnTable, btnTd, btnDiv) {
            btnTd.append(btnDiv);
            btnTable.append(btnTd);
            $('#category-btnDisplay').append(btnTable);
        };
        for (var i = 0; i < setting.largeCategories.length; i++) {
            var largeCategory = setting.largeCategories[i];
            var dbTableName = setting.largeCategoryTableMap[largeCategory];
            var btnTable = btnTableFnc(dbTableName);
            var btnTd = btnTdFnc(dbTableName);
            var btnDiv = $("<div></div>", {
                id:"category-btnDiv" + "_" + dbTableName,
                text: largeCategory,
                align: "center",
                "class": "main_btn",
                on: {
                    click: function(event){
                        var tableName = event.currentTarget.id.split('_')[1];
                        // quizObj生成
                        var codes = null;
                        debugger;
                        if (tableName == 'TTuuKanGyouHouQuiz') {
                            codes = setting.tuuKanGyouHouCategoryCodes;
                        } else if (tableName == 'TKaiGyouHouQuiz') {
                            codes = setting.kaiGyouHouCategoryCodes;
                        } else if (tableName == 'TTuuKanJituMuQuiz') {
                            codes = setting.tuuKanJituMuCategoryCodes;
                        }
                        initQuiz(codes, initExamTimes, initQuizSeq, largeCategoryMap[tableName], tableName);
                        questionObj.countQuestionByCategory(dialogObj.show);
                    }
                }
            });
            largeCategoryMap[dbTableName] = largeCategory;
            addNodeFnc(btnTable, btnTd, btnDiv);
        }
        
        categoryMap = util.convertCodeMapToMap(setting.categoryCodeMap);
        for (var code = 1; code < Object.keys(categoryMap).length + 1; code++) {
            var btnTable = btnTableFnc(code);
            var btnTd = btnTdFnc(code);

            var btnDiv = $("<div></div>", {
                id:"category-btnDiv" + "_" + code,
                text: categoryMap[code],
                align: "center",
                "class": "main_btn",
                on: {
                    click: function(event){
                        var categoryCode = parseInt(event.currentTarget.id.split('_')[1]);
                        var tableName = util.selectTableName(categoryCode);
                        // quizObj生成
                        initQuiz(categoryCode, initExamTimes, initQuizSeq, categoryMap[categoryCode], tableName);
                        questionObj.countQuestionByCategory(dialogObj.show);
                    }
                }
            });
            addNodeFnc(btnTable, btnTd, btnDiv);
        }
    }
};