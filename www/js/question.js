var questionObj =
{
    categoriCounts:{},// カテゴリーごとのカウント数
    findAndLoadPage: function(_quizObj){
        db.transaction(function (tx) {
            tx.executeSql(questionObj._getFindAndLoadPageQuery(_quizObj), [], function (tx, results) {
                if (results.rows.length > 0) {
                    _quizObj.questionRows = questionObj._sqlRowsToArray(results.rows);
                    questionObj._setQuestion(1, _quizObj);
                } else {
                    console.log('エラー:DB読込に失敗しました');
                }
            },
            function(err){
                console.log('エラー:DB読込に失敗しました');
            });
        });
    },
    load: function(nodeBaseId, currentPage, option){
        if (quizObj.questionRows) {
            questionObj._setQuestion(nodeBaseId, quizObj, option);
        } else {
            db.transaction(function (tx) {
                //
                tx.executeSql(questionObj._createLoadQuestionSQL(quizObj, option), [], function (tx, results) {
                    var exitflg = false;
                    if (results.rows.length > 0) {
                        var qRows = questionObj._sqlRowsToArray(results.rows);
                           //正解のみの絞り込みはSQLでなくJS上で行う
                        if (option.mistakeQuizOnlyFlag) {
                            quizObj.questionRows = qRows.filter(function(obj) {
                                return (obj.stampCorrectAnswer == null || obj.stampCorrectAnswer == 0)
                            })
                            if( quizObj.questionRows.length > 0){
                                exitflg = false
                            }
                            quizObj.mistakeCount= quizObj.questionRows.length;
                            quizObj.questionAllRows= qRows;
                        }else{
                            quizObj.questionRows = qRows
                            exitflg = false
                        }
                    }
                    if(exitflg == false){  
                        quizObj.option = option;  
                        if (option.randamFlag) {
                            quizObj.questionRows.sort(function(a, b){
                                return Math.random() - 0.5;
                            });
                            quizObj.questionRows = quizObj.questionRows.slice(0,option.questionCount)
                        }
                        questionObj._setQuestion(nodeBaseId, quizObj, option);
                    } else {
                        console.log(quizObj.tableName + 'からデータが見つかりませんでした。'
                            + '第' + quizObj.examTimes + '回,'
                            +  'カテゴリコード:' + quizObj.categoryCode + ',SEQ:' + quizObj.currentPage);
                        { // 試験回を減算してリトライ
                            quizObj.examTimes = quizObj.examTimes - 1;
                            if (quizObj.examTimes >= setting.minExamTimes) {
                                console.log('試験回を変更してリトライします。');
                                questionObj.load(nodeBaseId, currentPage, option);
                            } else {
                                // メニュー設定が正しければ通らない
                                ons.notification.alert('エラー:問題が存在しません。');
                            }
                        }
                    }
                },
                 function(err){
                    console.log('エラー:DB読込に失敗しました');
                });
            });
        }
    },
    countQuestionByCategory: function(func)
    {
        db.transaction(function (tx) {
            tx.executeSql(questionObj._createCountQuestionSQL(), [], function (tx, results) {
                var rows = questionObj._sqlRowsToArray(results.rows)
                //var datacount = rows[0]["count"];
                var returndata = {};
                returndata.total = 0;
                var count = rows[0]['count(*)'];
                if(rows.length > 0){
                    for (var i = 0; i < rows.length ; i++) {
                        returndata.total += rows[i]['count(*)'];
                        if( typeof (  returndata[rows[i]['examTimes']] ) == "undefined" ){
                            returndata[rows[i]['examTimes']] = 0;
                        }
                        returndata[rows[i]['examTimes']] += rows[i]['count(*)'];
                    }
                }
                console.log(["returndata",returndata]);
                // if(useSqlite){
                //     if(results.rows.length > 0){
                //         for (var i = 0; i < results.rows.length ; i++) {
                //             returndata.total += results.rows.item(i)['count(*)'];
                //             if( typeof (  returndata[results.rows.item(i)['examTimes']] ) == "undefined" ){
                //                 returndata[results.rows.item(i)['examTimes']] = 0;
                //             }
                //             returndata[results.rows.item(i)['examTimes']] += results.rows.item(i)['count(*)'];
                //         }
                //     }
                //     //var count = results.rows.item(0)['count(*)'];
                // }else{
                //     var count = results.rows[0]['count(*)'];
                //     if(results.rows.length > 0){
                //         for (var i = 0; i < results.rows.length ; i++) {
                //             returndata.total += results.rows[i]['count(*)'];
                //             if( typeof (  returndata[results.rows[i]['examTimes']] ) == "undefined" ){
                //                 returndata[results.rows[i]['examTimes']] = 0;
                //             }
                //             returndata[results.rows[i]['examTimes']] += results.rows[i]['count(*)'];
                //         }
                //     }
                // }
                func(returndata);
            });
        });
    },
    backPage: function(){
        if (!!quizObj.fromErrataTalbe) {
            myNavigator.popPage();
        } else {
            removeLocalStorage(setting.storedQuizObjKey);
            myNavigator.popPage();
            
        }
    },
     /**
     * 正答かどうかを更新
     * @param {*} resultString 正解か不正解か(文字列)
     * @param {*} questionRow 問題データ
     */
    updateCorrectAnswer: function(resultString, questionRow){
        db.transaction(function (tx) {
            tx.executeSql(questionObj._getUpdateCorrectAnswerQuery(resultString, questionRow), [], function (tx, results) {
            });
        });
    },
    _sqlRowsToArray: function(rows){
        var rowToArray = [];
        if(useSqlite){
            for (var i = 0; i < rows.length; i++) {
                rowToArray.push(rows.item(i));
            }
        }else{
            for (var i = 0; i < rows.length; i++) {
                rowToArray.push(rows[i]);
            }
        }  
        return rowToArray;
    },
    _setQuestion: function(nodeBaseId, quizObj)
    {
        var row = quizObj.questionRows[0];
        if (!row) {
            console.log('error: invalid loadQuestion param');
        }
        questionObj._setQuestionToHTML(row, nodeBaseId, quizObj);
    },
    _createLoadQuestionSQL: function(quizObj, option)
    {

        var whereCategoryCodeQuery = '';
        var limitQuestionCountSql = 'limit ' + (option.questionStartPos - 1) + ',' + option.questionCount;
        if (option.randamFlag) {
            var limitQuestionCountSql = '';
        }
        var examTimesOnlySql = '';
        if( option.questionExamTimes ){
            examTimesOnlySql += ' and examTimes=' + option.questionExamTimes + ' ';
        }

        var mistakeOnlySql = '';
        if (!Array.isArray(quizObj.categoryCode)) {
            whereCategoryCodeQuery = 'where categoryCode = ' + quizObj.categoryCode;
        } else{
            whereCategoryCodeQuery = 'where categoryCode IN (' + quizObj.categoryCode.join(",") + ')';
        }
        //正解のみの絞り込みはSQLでなくJS上で行うのでコメント
       // if (option.mistakeQuizOnlyFlag) {
       //     mistakeOnlySql += whereCategoryCodeQuery != '' ? 'and ' : 'where ';
       //     mistakeOnlySql += 'stampCorrectAnswer is not null and stampCorrectAnswer = 0'
       // }
        var orderbySql ='order by examTimes DESC ,categoryCode, categoryQuizSeq';
        if (option.randamFlag) {
            orderbySql ='';
        }

        var sql = 'select * from ' + quizObj.tableName
          + ' ' + whereCategoryCodeQuery
          + ' ' + examTimesOnlySql
          + ' ' + mistakeOnlySql
          + ' ' + orderbySql
          + ' ' + limitQuestionCountSql
          ;
          console.log(sql);
        return sql;
    },
    _setQuestionToHTML: function(row, nodeBaseId, quizObj)
    {
        console.log(quizObj.Rows);
        quizObj.categoryQuizSeq = row['categoryQuizSeq'];

        $('#question-quizSeq_'+ nodeBaseId).html(quizObj.currentPage);
        $('#question-titleCategory_'+ nodeBaseId).html(row['categoryName'] + (row['subCategoryName'] || ''));
        $('#question-categoryName_'+ nodeBaseId).html(row['categoryName']);
        $('#question-examTimes_'+ nodeBaseId).html(row['examTimes']);
        $('#question-mainQuestionSeq_'+ nodeBaseId).html(row['mainQuestionSeq']);
        $('#question-subQuestionSeq_'+ nodeBaseId).html(row['subQuestionSeq']);
        console.log(quizObj);
        if( quizObj.option  ){
            if(typeof quizObj.mistakeCount != "undefined"){
                $('#question-progress_'+ nodeBaseId).html( quizObj.currentPage + "/" + quizObj.mistakeCount + "");
            } else{
                $('#question-progress_'+ nodeBaseId).html( quizObj.currentPage + "/" + quizObj.option.questionCount + "");
            }

        }

        var questonStr = row['question'].split('\n');
        for (var i = 0; i < questonStr.length; i++) {
            $('#question-question_'+ nodeBaseId).append('<div>' + questonStr[i] + '</div>');
        }

        $('#question-question_'+ nodeBaseId).append('<div>&nbsp;</div>');
        if(row['stampTwoSelections']){
            var onsRow = $("<ons-row></ons-row>", {id:"question-onsRow_" + nodeBaseId});
            if (row['answerKey'] == setting.twoSelectionMaru) {
                onsRow.append(
                    '<ons-col><ons-button modifier="large" onclick="quizObj.rightAnswer()"><ons-icon icon="circle-o" size="40px" style="padding-top:13px"></ons-icon></ons-button></ons-col>');
                onsRow.append(
                    '<ons-col><ons-button modifier="large--cta" onclick="quizObj.wrongAnswer()"><ons-icon icon="times" size="40px" style="padding-top:13px"></ons-icon></ons-button></ons-col>');
            } else {
                onsRow.append(
                    '<ons-col><ons-button modifier="large" onclick="quizObj.wrongAnswer()"><ons-icon icon="circle-o" size="40px" style="padding-top:13px"></ons-icon></ons-button></ons-col>');
                onsRow.append(
                    '<ons-col><ons-button modifier="large--cta" onclick="quizObj.rightAnswer()"><ons-icon icon="times" size="40px" style="padding-top:13px"></ons-icon></ons-button></ons-col>');
            }
            $('#question-selectionButtons_'+ nodeBaseId).append(onsRow);
        } else {
            var selectionStr = row['selection'].split('\n').filter(obj => obj.length>0);
            for (var i = 0; i < selectionStr.length; i++) {
                $('#question-selection_'+ nodeBaseId).append('<div>' + selectionStr[i] + '</div>');
                $('#question-selection_'+ nodeBaseId).append('<div>&nbsp;</div>');
                var selectionNum = i + 1;
                $('#question-selectionButtons_'+ nodeBaseId).append(parseInt(row['answerKey']) == selectionNum
                    ? '<button><div onclick="quizObj.rightAnswer()">' + selectionNum + '</div></button>'
                    : '<button><div onclick="quizObj.wrongAnswer()">' + selectionNum + '</div></button>');
            }
        }
        $('#end_message_'+ nodeBaseId).val(row['answerKey']);
        $('#question-answerKey_'+ nodeBaseId).append(row['answerKey']);
        var explanationStr = row['explanation'].split('\n');
        for (var i = 0; i < explanationStr.length; i++) {
            $('#question-explanation_'+ nodeBaseId).append('<div>' + explanationStr[i] + '</div>');
        }
        var buttonStr = !!quizObj.fromErrataTalbe ? "戻る" : '次へ';
        $('#question-afterAnswerButton_'+ nodeBaseId).html(buttonStr);


        //bookmark
        bookmarkrow = row;
        bookmarkrow.nodeBaseId = nodeBaseId;
        $('#question-bookmark_'+ nodeBaseId).attr("data-quizdata",JSON.stringify(row));
        if(bookmarkObj.is_bookmark(row)){
            console.log("登録済");
            $('#question-bookmark_'+ nodeBaseId+" .star").addClass("bookmarked");    
        } else {
            console.log("未登録");
            $('#question-bookmark_'+ nodeBaseId+" .star").removeClass("bookmarked");    
        }
        


        if (!quizObj.fromErrataTalbe) {
            quizObj.mainQuestionSeq = row['mainQuestionSeq'];
            quizObj.subQuestionSeq = row['subQuestionSeq'];
            saveLocalStorage(setting.storedQuizObjKey, quizObj);
        }
    },
    _createCountQuestionSQL: function()
    {
        var whereCategoryCodeQuery = '';
        if (!Array.isArray(quizObj.categoryCode)) {
            whereCategoryCodeQuery = 'where categoryCode = ' + quizObj.categoryCode;
        }

        var sql = 'select count(*),examTimes from ' + quizObj.tableName
         +  ' ' + whereCategoryCodeQuery + ' group by examTimes'
         ;
        return sql;
    },
    _getUpdateCorrectAnswerQuery: function(resultString, questionRow)
    {
        var isCorrectAnswer = resultString == '正解' ? 1 : 0;
        var sql = 'update ' + quizObj.tableName
         +  ' ' + 'set stampCorrectAnswer ='
         +  ' ' + isCorrectAnswer
         +  ' ' + 'where'
         +  ' ' + 'examTimes = ' + questionRow.examTimes
         +  ' ' + 'and mainQuestionSeq = ' + questionRow.mainQuestionSeq
         +  ' ' + 'and subQuestionSeq = ' + questionRow.subQuestionSeq
         ;

        return sql;
    },
    _getFindAndLoadPageQuery: function(quizObj){
        var sql = 'select * from ' + quizObj.tableName
            +  ' ' + 'where'
            +  ' ' + 'categoryCode = ' + quizObj.categoryCode
            +  ' ' + 'and examTimes = ' + quizObj.examTimes
            +  ' ' + 'and mainQuestionSeq = ' + quizObj.mainQuestionSeq
            +  ' ' + 'and subQuestionSeq = ' + quizObj.subQuestionSeq
            ;
        return sql;
    },
    updateCorrectAnswer: function() {
        return new Promise(function(resolve, reject) {
            db.transaction(function (tx) {
                var answeredMapKeys = Object.keys(quizObj.answeredMap);
                for (var i = 0; i < answeredMapKeys.length; i++) {
                    var mapKey = answeredMapKeys[i];
                    var value = quizObj.answeredMap[mapKey];
                    var primaryKeys = mapKey.split(',');
                    if (primaryKeys.length != setting.answerHistryPrimaryKeyCount) {
                        console.log('エラー:回答後処理のテーブル更新に失敗しました');
                    }
                    var query = 'update ' + quizObj.tableName + ' set'
                        +  ' ' + 'stampCorrectAnswer = ?'
                        +  ' ' + 'where'
                        +  ' ' + 'categoryCode = ?'
                        +  ' ' + 'and examTimes = ?'
                        +  ' ' + 'and mainQuestionSeq = ?'
                        +  ' ' + 'and subQuestionSeq = ?'
                        ;
                    tx.executeSql(query, [value, primaryKeys[0], primaryKeys[1], primaryKeys[2], primaryKeys[3]],
                        function (tx, results) {});
                }
            }, function(error) {
                console.log(["error",error.message])
                return reject(error.message);
            }, function() {
                return resolve();
            });
        });
    },
    updateAnswerHistry: function() {
        console.log("updateAnswerHistry");
        return new Promise(function(resolve, reject) {
            db.transaction(function (tx) 
            {
                var answeredMapKeys = Object.keys(quizObj.answeredMap);
                for (var i = 0; i < answeredMapKeys.length; i++) {
                    var mapKey = answeredMapKeys[i];
                    var value = quizObj.answeredMap[mapKey] ? quizObj.answeredMap[mapKey] : 0;
                    var primaryKeys = mapKey.split(',');
                    if (primaryKeys.length != setting.answerHistryPrimaryKeyCount) {
                        console.log('エラー:回答後処理の履歴テーブル更新に失敗しました');
                    }

                        var categorycnt = questionObj.categoriCounts[primaryKeys[0]] ;
                        if(categorycnt){
                        var answercol =   'answer_' + ((categorycnt - 1) % 5 + 1); 
                        var tmpdate = util.datetime();
                        var datatype = Array.isArray(quizObj.categoryCode) ? "subtotal":"quiz";
                        var query = `update ${setting.TAnswerHistry}  set
                        ${answercol} = ?, answer_count = ?,${answercol}_date = ?
                        where
                        ${setting.TAnswerHistry}.categoryCode = ?
                        and ${setting.TAnswerHistry}.datatype = ?
                        and ${setting.TAnswerHistry}.examTimes = ?
                        and ${setting.TAnswerHistry}.mainQuestionSeq = ?
                        and ${setting.TAnswerHistry}.subQuestionSeq = ?
                        `;
                        tx.executeSql(query, [value, categorycnt, tmpdate, primaryKeys[0], datatype, primaryKeys[1], primaryKeys[2], primaryKeys[3]],
                            function (tx, results) {});
                    }

                }
            }, function(error) {
                console.log(["error",error.message]);
                return reject(error.message);
            }, function() {
                return resolve();
            });
        });
    },
    updateSkipAnswerHistry: function() {
        return new Promise(function(resolve, reject) {
            db.transaction(function (tx) {
                for (const question of quizObj.questionAllRows) {
                    if(question.stampCorrectAnswer == 1){
                        //var mapKey = answeredMapKeys[i];
                        //var value = quizObj.answeredMap[mapKey];
                        //var primaryKeys = mapKey.split(',');
                        //if (primaryKeys.length != setting.answerHistryPrimaryKeyCount) {
                        //    console.log('エラー:回答後処理の履歴テーブル更新に失敗しました');
                        //}
                        var categorycnt = questionObj.categoriCounts[question.categoryCode]
                        var answercol =   'answer_' + ((categorycnt - 1) % 5 + 1); 
                        var datatype = Array.isArray(quizObj.categoryCode) ? "subtotal":"quiz";
                        var query = `update ${setting.TAnswerHistry}  set
                        ${answercol} = ?, answer_count = ? 
                        where
                        ${setting.TAnswerHistry}.categoryCode = ?
                        and ${setting.TAnswerHistry}.dataType = ?
                        and ${setting.TAnswerHistry}.examTimes = ?
                        and ${setting.TAnswerHistry}.mainQuestionSeq = ?
                        and ${setting.TAnswerHistry}.subQuestionSeq = ?
                        `;
                        tx.executeSql(query, [null, categorycnt ,question.categoryCode, datatype , question.examTimes, question.mainQuestionSeq, question.subQuestionSeq ],
                            function (tx, results) {});
                    }
                }
            }, function(error) {
                console.log(["error",error.message]);
                return reject(error.message);
            }, function() {
                return resolve();
            }); 
          });
    },      
    insertAnswerHistry: function() {
        console.log("insertAnswerHistry");
        return new Promise(function(resolve, reject) {
            db.transaction(function (tx) {
                var answeredMapKeys = Object.keys(quizObj.answeredMap);
                for (var i = 0; i < answeredMapKeys.length; i++) {
                    var mapKey = answeredMapKeys[i];
                    var primaryKeys = mapKey.split(',');
                    if (primaryKeys.length != setting.answerHistryPrimaryKeyCount) {
                        console.log('エラー:回答後処理の履歴テーブル新規登録に失敗しました');
                    }
                    var datatype = Array.isArray(quizObj.categoryCode) ? "subtotal":"quiz";
                    var query = 'insert or ignore into ' + setting.TAnswerHistry
                        + ' ' + 'values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                    tx.executeSql(query,
                        [primaryKeys[0], datatype,primaryKeys[1], primaryKeys[2], primaryKeys[3], null, null, null, null, null, null, null, null, null, null, null],
                        function (tx, results) {

                        });
                }
            }, function(error) {
                console.log(["error",error.message])
                return reject(error.message);
            }, function() {
                return resolve();
            });
        });
    },
    insertAnswerCountHistry: function() {
        return new Promise(function(resolve, reject) {
            db.transaction(function (tx) {
                var query = 'insert or ignore into ' + setting.TAnswerCountHistry
                    + ' ' + 'values (?, ?, ?)'
                    ;
                    var datatype = quizObj.categoryCode.length > 1 ? "subtotal": "quiz";
                if (!!Array.isArray(quizObj.categoryCode)) {
                    
                    for (var i = 0; i < quizObj.categoryCode.length; i++) {
                        
                        tx.executeSql(query, [quizObj.categoryCode[i],datatype, 1], function (tx, results) {});
                    }
                } else {
                    tx.executeSql(query, [quizObj.categoryCode, datatype, 1], function (tx, results) {});
                }
            }, function(error) {
                console.log(["error",error.message]);
                return reject(error.message);
            }, function() {
                return resolve();
            });
        });
    },/*88*/
    updateAnswerCountHistry: function() {
        return new Promise(function(resolve, reject) {
            db.transaction(function (tx) {


                var datatype = quizObj.categoryCode.length > 1 ? "subtotal" : "quiz";
                var query = 'update ' + setting.TAnswerCountHistry + ' set'
                    + ' ' + 'answerCount = answerCount + 1'
                    + ' ' + 'where'
                    + ' ' + 'dataType = ? and '
                    + ' ' + 'categoryCode = ?'
                    ;
                    quizObj.categoryCode;
                if (!!Array.isArray(quizObj.categoryCode)) {
                    for (var i = 0; i < quizObj.categoryCode.length; i++) {
                        tx.executeSql(query, [datatype,quizObj.categoryCode[i]], function (tx, results) {});
                    }
                } else {
                    tx.executeSql(query, [datatype,quizObj.categoryCode], function (tx, results) {});
                }
            }, function(error) {
                console.log(["error",error.message]);
                return reject(error.message);
            }, function() {
                return resolve();
            });
        });
    },
    saveAnswerCountHistry: function() {
            console.log("saveAnswerCountHistry",quizObj);
            db.transaction(function (tx) {
                let promiseArray = [];
                var datatype = Array.isArray(quizObj.categoryCode) ? "subtotal" : "quiz";
                var query = 'select answerCount from ' + setting.TAnswerCountHistry 

                + ' ' + 'where'
                + ' ' + 'dataType = ? and '
                + ' ' + 'categoryCode = ?'
                ;
                console.log(query);
            if (!!Array.isArray(quizObj.categoryCode)) {
                for (var i = 0; i < quizObj.categoryCode.length; i++) {
                    promiseArray.push(new Promise((resolve, reject) =>
                    {
                        tx.executeSql(query, [datatype,quizObj.categoryCode[i]], (function(category){ 
                            return function (tx, resp) {
                                if (resp.rows.length > 0) {
                                    var rows = questionObj._sqlRowsToArray(resp.rows)
                                    //console.log("categorycount="+category+","+rows[0].answerCount)
                                    questionObj.categoriCounts[category] = rows[0].answerCount
                                    resolve(rows);
                                } else {
                                    resolve();
                                }
                            }
                        })(quizObj.categoryCode[i]));
                    }));
                }
            } else {
                promiseArray.push(new Promise((resolve, reject) => {
                tx.executeSql(query, [datatype,quizObj.categoryCode], (function(category){ 
                    return function (tx, resp) {
                    var rows = questionObj._sqlRowsToArray(resp.rows)
                    //console.log("categorycount="+category+","+rows[0].answerCount)
                    questionObj.categoriCounts[category] = rows[0].answerCount
                    resolve(rows);
                    }
                })(quizObj.categoryCode));
                }))
            }
                return Promise.all(promiseArray)
                
            }, function(error) {
                console.log(["errateru",error.message])
                return reject(error.message);
            }, function() {
                //return resolve();
            });
    
    },
    insertAllAnswerCountHistry: function() {
        return new Promise(function(resolve, reject) {
            db.transaction(function (tx) {
                var tmpdate = util.datetime();
                var marucount  = parseInt(Object.values(quizObj.answeredMap).filter(function(x){return x===1}).length);
                var batsucount = parseInt(Object.values(quizObj.answeredMap).filter(function(x){return x===0}).length);
                var totalcount = marucount + batsucount;
                var datatype   = Array.isArray(quizObj.categoryCode) ? "subtotal" : "quiz";

                var query = 'insert or ignore into ' + setting.TAllAnswerCountHistry
                    + ' ' + 'values (?, ?, ?, ?, ?, ?)'
                    ;
                console.log(["insert",query]);
                if (!!Array.isArray(quizObj.categoryCode)) {
                    
                    //カテゴリ複数で問題数が一致すれば保存。
                    for (var i = 0; i < quizObj.categoryCode.length; i++) {
                        var countquery = 'select count(categoryCode) as count from ' + quizObj.tableName + ''
                        + ' ' + 'where'
                        + ' ' + 'categoryCode IN('+quizObj.categoryCode[i]+')'
                        ;
                        var categoryCode = quizObj.categoryCode[i];
                        tx.executeSql(countquery, [], function (tx, results) {
                            var rows = questionObj._sqlRowsToArray(results.rows)
                            var datacount = rows[0]["count"];
                            // if(useSqlite){
                            //     datacount = parseInt(results.rows.item(0)["count"]);
                            // }else{
                            //     datacount = parseInt(results.rows[0]["count"]);
                            // }
                            if(totalcount == datacount)
                            {
                                console.log([query,categoryCode,datatype,quizObj]);
                                tx.executeSql(query, [quizObj.categoryCode[i], datatype,totalcount,marucount,batsucount,tmpdate], function (tx, results2) {});
                            }
                        });
                    }

                    // for (var i = 0; i < quizObj.categoryCode.length; i++) {
                        
                    //     tx.executeSql(query, [quizObj.categoryCode[i], datatype,totalcount,marucount,batsucount,tmpdate], function (tx, results) {});
                    // }
                } else {
                    tx.executeSql(query, [quizObj.categoryCode,  datatype,totalcount,marucount,batsucount,tmpdate], function (tx, results) {});
                }
            }, function(error) {
                console.log(["error",error.message]);
                return reject(error.message);
            }, function() {
                return resolve();
            });
        });
    },
    updateAllAnswerCountHistry: function() {
        return new Promise(function(resolve, reject) {
            db.transaction(function (tx) {

                var marucount  = parseInt(Object.values(quizObj.answeredMap).filter(function(x){return x===1}).length);
                var batsucount = parseInt(Object.values(quizObj.answeredMap).filter(function(x){return x===0}).length);
                var totalcount = marucount + batsucount;
                var datatype   = Array.isArray(quizObj.categoryCode) ? "subtotal" : "quiz";
                var query = 'update ' + setting.TAllAnswerCountHistry + ' set'
                    + ' ' + 'answerTotal ='+totalcount+','
                    + ' ' + 'answerTrue = '+marucount+','
                    + ' ' + 'answerFalse = '+batsucount+''
                    + ' ' + 'where'
                    + ' ' + 'categoryCode = ? and '
                    + ' ' + 'dataType = ?'
                    ;

                //カテゴリ複数で問題数が一致すれば保存。
                if (!!Array.isArray(quizObj.categoryCode)) {


                    for (var i = 0; i < quizObj.categoryCode.length; i++) {
                        var countquery = 'select count(categoryCode) as count from ' + quizObj.tableName + ''
                        + ' ' + 'where'
                        + ' ' + 'categoryCode IN('+quizObj.categoryCode[i]+')'
                        ;
                        var categoryCode = quizObj.categoryCode[i];
                        tx.executeSql(countquery, [], function (tx, results) {
                            var rows = questionObj._sqlRowsToArray(results.rows)
                            var datacount = parseInt(rows[0]["count"]);
                            // if(useSqlite){
                            //     datacount = parseInt(results.rows.item(0)["count"]);
                            // }else{
                            //     datacount = parseInt(results.rows[0]["count"]);
                            // }
                            if(totalcount == datacount)
                            {
                                console.log([query,categoryCode,datatype,quizObj]);
                                tx.executeSql(query, [categoryCode,datatype], function (tx, results2) {});
                            }
                        });
                    }
                }else{
                    var countquery = 'select count(categoryCode) as count from ' + quizObj.tableName + ''
                    + ' ' + 'where'
                    + ' ' + 'categoryCode IN('+quizObj.categoryCode+')'
                    ;
                    var categoryCode = quizObj.categoryCode;
                    tx.executeSql(countquery, [], function (tx, results) {
                        var rows = questionObj._sqlRowsToArray(results.rows)
                        var datacount = parseInt(rows[0]["count"]);
                        // if(useSqlite){
                        //     datacount = parseInt(results.rows.item(0)["count"]);
                        // }else{
                        //     datacount = parseInt(results.rows[0]["count"]);
                        // }
                        // console.log(["count_check",totalcount,datacount,categoryCode]);
                        // console.log(countquery);
                        // if(totalcount == datacount)
                        // {
                        //     console.log([query,categoryCode,datatype]);
                            tx.executeSql(query, [categoryCode,datatype], function (tx, results2) {
                            });
                        //}
                    });
                }

            }, function(error) {
                console.log(["error",error.message]);
                return reject(error.message);
            }, function() {
                return resolve();
            });
        });
    },

}
var getCategoryCount = {
    get: function (tablename = null, categoryCode, func) {
        try {
            db.transaction(function (tx) {
                var query = getCategoryCount._getCategoryCountQuery(tablename, categoryCode);
                tx.executeSql(query, [], function (tx, results) {
                    var rows = questionObj._sqlRowsToArray(results.rows);
                    var returndata = { total: 0 };
                    if (rows.length > 0) {
                        for (var i = 0; i < rows.length; i++) {
                            returndata.total += rows[i]['count(*)'];
                            if (typeof (returndata[rows[i]['examTimes']]) === "undefined") {
                                returndata[rows[i]['examTimes']] = 0;
                            }
                            returndata[rows[i]['examTimes']] += rows[i]['count(*)'];
                        }
                    }
                    func(tablename, categoryCode, returndata);
                }, function (tx, error) {
                    console.error('tx.executeSql エラー:', error.message);
                    func(tablename, categoryCode, { total: 0 });
                });
            }, function (error) {
                console.error('db.transaction エラー:', error.message);
                func(tablename, categoryCode, { total: 0 });
            }, function () {
                console.log('db.transaction 成功');
            });
        } catch (e) {
            console.error('トランザクション開始失敗:', e.message);
            func(tablename, categoryCode, { total: 0 });
        }
    },
    _getCategoryCountQuery : function ( tablename=null, categoryCode ){
        
        var whereCategoryCodeQuery = '';
 
        if (tablename){
           if (!Array.isArray(categoryCode)) {
                whereCategoryCodeQuery = 'where categoryCode = ' + categoryCode + ' group by categoryCode,examTimes ';
            } else {
                whereCategoryCodeQuery = 'where categoryCode IN (' + categoryCode.join(',') + ')' + ' group by categoryCode,examTimes ';
            }
            var sql = 'select count(*),examTimes from ' + tablename
             +  ' ' + whereCategoryCodeQuery
             ;
        } else {
           if (Array.isArray(categoryCode)) {
                whereCategoryCodeQuery = 'where categoryCode IN (' + categoryCode.join(',') + ')' + ' group by categoryCode,examTimes ';
            }
            var sql = '';
            sql += 'select count(*),examTimes from TTuuKanGyouHouQuiz  '
            +  ' ' + whereCategoryCodeQuery
            ;
            sql += ' UNION ALL '
            sql += 'select count(*),examTimes from TKaiGyouHouQuiz  '
            +  ' ' + whereCategoryCodeQuery
            ;
            sql += ' UNION ALL '
            sql += 'select count(*),examTimes from TTuuKanJituMuQuiz  '
            +  ' ' + whereCategoryCodeQuery
            ;

        }
        return sql;
    }
}

var getAnswerCount = {
    _getAnswerCountQuery : function ( tablename=null, categoryCode, examTimes , mainQuestionSeq,subQuestionSeq ){

        var whereCategoryCodeQuery = '';
        if (!Array.isArray(categoryCode)) {
            whereCategoryCodeQuery = 'where categoryCode = ' + categoryCode;
        } else {
            whereCategoryCodeQuery = 'where categoryCode IN (' + categoryCode.join(',') + ')';
        }

        var whereQuery = '';
        whereQuery += ' ' + 'and examTimes = ' + examTimes ;
        whereQuery += ' ' + 'and mainQuestionSeq = ' + mainQuestionSeq ;
        whereQuery += ' ' + 'and subQuestionSeq = '  + subQuestionSeq  ;
        var sql = 'select answer_count from ' + tablename
         +  ' ' + whereCategoryCodeQuery + whereQuery;
         ;
         return sql;

    }
}

var getAnswerRank = {
    get : function ( tablename=null, categoryCode, func){
        db.transaction(function (tx) {
            tx.executeSql(getAnswerRank._getAnswerRankQuery( tablename, categoryCode, func), [], function (tx, results) {
                var rows = questionObj._sqlRowsToArray(results.rows)
                var retundata = {};
                    if(rows.length > 0)
                    {
                        
                        for (var i = 0 ; i < rows.length ; i++) {
                            var tmprow = rows[i];

                            var rat = tmprow.answerTrue / (tmprow.answerTotal) * 100;
                            var tmprat = (Math.round(rat * 100) / 100) ;


                            if(typeof retundata[tmprow['dataType']] == "undefined"){
                                retundata[tmprow['dataType']] ={};    
                            }
                            retundata[tmprow['dataType']][tmprow['categoryCode']] = quizClass_getrank(tmprat);    
                        }
                    }
                /*
                if(useSqlite){
                    if(results.rows.length > 0)
                    {
                        
                        for (var i = 0 ; i < results.rows.length ; i++) {
                            var tmprow = results.rows.item(i);
                            var rat = tmprow.answerTrue / (tmprow.answerTotal) * 100;
                            var tmprat = (Math.round(rat * 100) / 100) ;
                            if(typeof retundata[tmprow['dataType']] == "undefined"){
                                retundata[tmprow['dataType']] ={};    
                            }
                            retundata[tmprow['dataType']][tmprow['categoryCode']] = quizClass_getrank(tmprat);    
                        }
                    }
                } else {
                    if(results.rows.length > 0)
                    {
                        
                        for (var i = 0 ; i < results.rows.length ; i++) {
                            var tmprow = results.rows[i];

                            var rat = tmprow.answerTrue / (tmprow.answerTotal) * 100;
                            var tmprat = (Math.round(rat * 100) / 100) ;


                            if(typeof retundata[tmprow['dataType']] == "undefined"){
                                retundata[tmprow['dataType']] ={};    
                            }
                            retundata[tmprow['dataType']][tmprow['categoryCode']] = quizClass_getrank(tmprat);    
                        }
                    }
                }
                */
                func( tablename, categoryCode, retundata);
            });
        });
    },
    _getAnswerRankQuery : function ( tablename=null, categoryCode, examTimes , mainQuestionSeq,subQuestionSeq ){
        var sql = 'select * from ' + setting.TAllAnswerCountHistry + ' where answerTotal > 0 and ';
        sql += 'categoryCode in ('+categoryCode.join(',')+')'
        return sql;
    }
}
