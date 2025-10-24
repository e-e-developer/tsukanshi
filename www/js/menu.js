/*
add loadCategoryCount 2023-01-06  menu一覧にカテゴリ内の出題数を追加する処理
*/

var menuObj =
{
    loadMenu: function (){
        var largeCategoryMap = {};
        var categoryMap = {};
        var initExamTimes = 58;
        var initQuizSeq = 1;

        var btnTableFnc = function (id_) {
            return $("<table></table>", {
                id:"home-btnTable" + "_" + id_,
                css: {width: "100%", height:"auto", border: "none"}
            });
        };
        var btnTdFnc = function (id_) {
            return $("<td></td>", {
                id:"home-btnTd" + "_" + id_,
                "class": "main_btn test3_2"
            });
        };
        var addNodeFnc = function(btnTable, btnTd, btnDiv) {
            btnTd.append(btnDiv);
            btnTable.append(btnTd);
            $('#home-btnDisplay').append(btnTable);
        };
        for (var i = 0; i < setting.largeCategories.length; i++) {
            var largeCategory = setting.largeCategories[i];
            var dbTableName = setting.largeCategoryTableMap[largeCategory];
            var btnTable = btnTableFnc(dbTableName);
            var btnTd = btnTdFnc(dbTableName);

            var btnDiv = $("<div></div>", {
                id:"home-btnDiv" + "_" + dbTableName,
                text: largeCategory,
                align: "center",
                "class": "main_btn",
                on: {
                    click: function(event){

                        let tableName = event.currentTarget.id.split('_')[1];
                        // quizObj生成
                        let codes = null;
                        //debugger;
                        if (tableName == 'TTuuKanGyouHouQuiz') {
                            codes = setting.tuuKanGyouHouCategoryCodes;
                        } else if (tableName == 'TKaiGyouHouQuiz') {
                            codes = setting.kaiGyouHouCategoryCodes;
                        } else if (tableName == 'TTuuKanJituMuQuiz') {
                            codes = setting.tuuKanJituMuCategoryCodes;
                        }
                        // initQuiz(codes, initExamTimes, initQuizSeq, largeCategoryMap[tableName], tableName);
                        // questionObj.countQuestionByCategory(dialogObj.show);
         
                        // pagenavi.pushPage('category.html', "slide" , function(){menuObj.loadSubMenu(tableName,codes)} );
                        pagenavi.pushPage('category.html', "slide", function() {
                            setTimeout(function() {
                                menuObj.loadSubMenu(tableName, codes);
                            }, 100);
                        });
                    }
                }
            });
            largeCategoryMap[dbTableName] = largeCategory;
            addNodeFnc(btnTable, btnTd, btnDiv);
        }
    },
    loadSubMenu: function ( categorytable,categorycodes ){
        categorytable = (categorytable) ? categorytable : quizObj.tableName;
        if(!categorycodes)
        {
            if (categorytable == 'TTuuKanGyouHouQuiz') {
                categorycodes = setting.tuuKanGyouHouCategoryCodes;
            } else if (categorytable == 'TKaiGyouHouQuiz') {
                categorycodes = setting.kaiGyouHouCategoryCodes;
            } else if (categorytable == 'TTuuKanJituMuQuiz') {
                categorycodes = setting.tuuKanJituMuCategoryCodes;
            }           
        }

        var largeCategoryMap = {};
        var categoryMap = {};
        var initExamTimes = 58;
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
                "class": "main_btn test3_1"
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
            
            if(categorytable != dbTableName) continue;
            console.log([categorytable , dbTableName]);
            var btnTable = btnTableFnc(dbTableName);
            var btnTd = btnTdFnc(dbTableName);

            var btnDiv = $("<div></div>", {
                id:"category-btnDiv" + "_" + dbTableName,
                text: largeCategory + "（全範囲）",
                align: "center",
                "class": "main_btn",
                on: {
                    click: function(event){
                        var tableName = event.currentTarget.id.split('_')[1];
                        // quizObj生成
                        var codes = null;
                        //debugger;
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
        if(categorytable !== "TTuuKanJituMuQuiz")
        {
            categoryMap = util.convertCodeMapToMap(setting.categoryCodeMap);
            for (var code = 1; code < Object.keys(categoryMap).length + 1; code++) {
                var btnTable = btnTableFnc(code);
                var btnTd = btnTdFnc(code);
                
                if( categorycodes.indexOf(code) == -1 ) continue;
                var btnDiv = $("<div></div>", {
                    id:"category-btnDiv" + "_" + code,
                    text: categoryMap[code],
                    align: "center",
                    "class": "main_btn test5",
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

        //title 変更
        var nodeBaseId　= 1;
        for( ii in setting.largeCategoryTableMap   ){
            if(  categorytable ==  setting.largeCategoryTableMap[ii] )
            {
                $('#question-titleCategory_'+ nodeBaseId).html(ii);
            }
        }
        menuObj.loadCategoryCount();
        menuObj.loadAnswerRank();
    },
    loadCategoryCount: function (){
        console.log("loadCategoryCount");
        //debugger;
        for (var i = 0; i < setting.largeCategories.length; i++) {
            var largeCategory = setting.largeCategories[i];
            var dbTableName = setting.largeCategoryTableMap[largeCategory];
            var codes = null;
            if (dbTableName == 'TTuuKanGyouHouQuiz') {
                codes = setting.tuuKanGyouHouCategoryCodes;
            } else if (dbTableName == 'TKaiGyouHouQuiz') {
                codes = setting.kaiGyouHouCategoryCodes;
            } else if (dbTableName == 'TTuuKanJituMuQuiz') {
                codes = setting.tuuKanJituMuCategoryCodes;
            }
            getCategoryCount.get(dbTableName,codes,function(dbTableName,codes,categoryCount){
                $("#category-child-btnDiv_"+dbTableName).parents("td").append("<span class='notification count'>"+categoryCount.total+"</span>");
                $("#category-btnDiv_"+dbTableName).parents("td").append("<span class='notification count'>"+categoryCount.total+"</span>");
             });

            //debugger;
        }

        categoryMap = util.convertCodeMapToMap(setting.categoryCodeMap);
        for (var code = 1; code < Object.keys(categoryMap).length + 1; code++) {
            var codes = [code];
            getCategoryCount.get(null,codes,function(dbTableName,codes,categoryCount){
                $("#category-btnDiv_"+codes[0]).parents("td").append("<span class='notification count'>"+categoryCount.total+"</span>");

            });
        }
    },
    loadAnswerRank: function (){
        console.log("loadAnswerRank");
        //debugger;
        for (var i = 0; i < setting.largeCategories.length; i++) {
            var largeCategory = setting.largeCategories[i];
            var dbTableName = setting.largeCategoryTableMap[largeCategory];
            var codes = null;
            if (dbTableName == 'TTuuKanGyouHouQuiz') {
                codes = setting.tuuKanGyouHouCategoryCodes;
            } else if (dbTableName == 'TKaiGyouHouQuiz') {
                codes = setting.kaiGyouHouCategoryCodes;
            } else if (dbTableName == 'TTuuKanJituMuQuiz') {
                codes = setting.tuuKanJituMuCategoryCodes;
            }
            //console.log(["dbTableName",dbTableName,codes]);
             getAnswerRank.get(dbTableName,codes,function(dbTableName,codes,categoryCount){
                if( dbTableName == "TTuuKanJituMuQuiz" )console.log([dbTableName,codes,categoryCount]);
                if(categoryCount["subtotal"])
                {
                    for( i in categoryCount["subtotal"] )
                    {
                       if( !$("#category-child-btnDiv_"+dbTableName).parents("td").find(".notification.rank").length ){
                           $("#category-child-btnDiv_"+dbTableName).parents("td").append("<span class='notification rank'>"+categoryCount["subtotal"][i]["title"].replace(/ランク/,"")+"</span>");                         
                       }
                       
                       if( !$("#category-btnDiv_"+dbTableName).parents("td").find(".notification.rank").length ){
                            $("#category-btnDiv_"+dbTableName).parents("td").append("<span class='notification rank'>"+categoryCount["subtotal"][i]["title"].replace(/ランク/,"")+"</span>");
                       }
                    }
                }  
             });

            //debugger;
        }

        categoryMap = util.convertCodeMapToMap(setting.categoryCodeMap);
        for (var code = 1; code < Object.keys(categoryMap).length + 1; code++) {
            var codes = [code];

            getAnswerRank.get(null,codes,function(dbTableName, codes ,categoryCount){
                if(categoryCount["quiz"])
                {
                    for( i in categoryCount["quiz"] )
                    {
                       if( !$("#category-btnDiv_"+i).parents("td").find(".notification.rank").length ){
                        $("#category-btnDiv_"+i).parents("td").append("<span class='notification rank'>"+categoryCount["quiz"][i]["title"].replace(/ランク/,"")+"</span>");  
                       }
                       
                    }
                }             
            });
        }
    }
};

