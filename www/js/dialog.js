var dialogObj = {
    initQuizCount : 0,
    init: function(quizCount) {
        {
            $("#preDialog-title").html(quizObj.title);
            

            $("#preDialog-questionExamTimesSelect option").attr("selected", false);
            if( !(quizObj.title == "通関業法" || quizObj.title == "関税法等"  || quizObj.title == "通関実務")  )
            {
                $("#preDialog-questionExamTimesSelect").parent("div").parent("div").css("display","none");
            }else{
                $("#preDialog-questionExamTimesSelect").parent("div").parent("div").css("display","flex");
            }
            var questionRowsCount = quizCount.total ;

            $('#preDialog-questionCountInput').val(questionRowsCount);
            $('#preDialog-questionCountInput').attr('placeholder', '最大問題数:' + questionRowsCount);
            $('#preDialog-questionCountInput').attr('max', questionRowsCount);
            $('#preDialog-questionCountInput').change(function(e){
                var value = parseInt(e.target.value);
                if (value) {
                    $('#preDialog-startPosInput').attr('max', value);
                }
            });
            $('#preDialog-startPosInput').attr('value', 1);
            $('#preDialog-startPosInput').attr('max', questionRowsCount);


            //出題年度selectbox
            $('#preDialog-questionExamTimesSelect').html("");
            var tmpExamTimes = Object.keys(quizCount);
            tmpExamTimes.sort().reverse();
            $('#preDialog-questionExamTimesSelect').append("<option value='' data-count='"+quizCount.total+"'>未選択</option>");
            for( tmp in tmpExamTimes ){
                if(tmpExamTimes[tmp] != "total"){
                    $('#preDialog-questionExamTimesSelect').append("<option value='"+tmpExamTimes[tmp]+"' data-count='"+quizCount[tmpExamTimes[tmp]]+"'>"+tmpExamTimes[tmp]+"回目</option>");
                }
            }
            // $('#preDialog-questionExamTimesSelect').change(function(e){
            //     $('#preDialog-questionExamTimesSelect option:selected').val();
            //     var tmpcount = $('#preDialog-questionExamTimesSelect option:selected').attr("data-count");
            //     $('#preDialog-questionCountInput').val(tmpcount);
            //     $('#preDialog-questionCountInput').attr('max', tmpcount);
            //     $('#preDialog-startPosInput').attr('max', tmpcount);
            // });
            
        }
        initQuizCount = quizCount;
        dialogObj.resize();
    },
    show: function(quizCount) {
        var dialog = document.getElementById('preDialog');
        if (dialog) {
            dialogObj.init(quizCount);
            dialog.show();
        } else {
          ons.createElement('preDialog.html', { append: true }).then(function(dialog) {
            dialogObj.init(quizCount);
            dialog.show();
          });
        }
    },
    quizStart: function() {
        var questionCount = parseInt($('#preDialog-questionCountInput').val());
        var questionStartPos = parseInt($('#preDialog-startPosInput').val());
        if (!dialogObj.isValidQuizStart(questionCount, questionStartPos)) {
            return;
        }

        var option = {
            // 未入力の場合は最大出題数にする
            questionCount: questionCount ? questionCount : initQuizCount,
            //questionCount:  initQuizCount,
            // 未入力の場合は1にする
            questionStartPos: questionStartPos ? questionStartPos : 1,
            mistakeQuizOnlyFlag: $('#preDialog-mistakeQuizOnlySwitch input')[0].checked,
            randamFlag: $('#preDialog-randamSwitch input')[0].checked,
            displayExplanationByCorrect: $('#preDialog-displayExplanationByCorrect input')[0].checked,
            questionExamTimes:$("#preDialog-questionExamTimesSelect option:selected").val()
        };
        quizObj.option = option;
        myNavigator.pushPage('quiz.html');
        setTimeout(function(){
            questionObj.load(1, null, option);
        }, 0.8);
        dialogObj.hide('preDialog');
    },
    isValidQuizStart: function(questionCount, questionStartPos){
        // 問題数の範囲チェック
        if (!dialogObj.validateMinMaxRange('#preDialog-questionCountInput', questionCount)){
            return false;
        };
        // 問題位置の範囲チェック
        if (!dialogObj.validateMinMaxRange('#preDialog-startPosInput', questionStartPos)){
            return false;
        };
        return true;
    },
    validateMinMaxRange: function(nodeId, value) {
        if (!!nodeId.includes('questionCountInput') && !value) {
            return true; // 全問出題
        }
        var min = parseInt($(nodeId).attr('min'));
        var max = parseInt($(nodeId).attr('max'));
        if (min > value || max < value) {
            return false;
        }
        return true;
    },
    hide: function(id) {
        document.getElementById(id).hide();
    },
    resize : function() {
        var wsize = $(window).width() - 40;
        var hsize = $(window).height() - 90;
        $(".preDialogContent").css("width", wsize + "px");
        $(".preDialogContent").css("height", hsize + "px");
    },
    showLoadStoredDataDialog: function() {
        var dialog = document.getElementById('confirm-dialog');
        var message = '前回中断した問題を再開しますか？<br />(再開しない場合、中断データは削除されます)';
        if (dialog) {
            $('#confirmMessage-dialog').html(message);
            dialog.show();
        } else {
          ons.createElement('confirmDialog.html', { append: true }).then(function(dialog) {
                $('#confirmMessage-dialog').html(message);
                dialog.show();
            });
        }
    },
    _showLoadStoredDataDialog: function() {
        var storedQuizObj = getLocalStorage(setting.storedQuizObjKey);
        {
            // quizObj生成
            var categoryMap = util.convertCodeMapToMap(setting.categoryCodeMap);
            initQuiz(storedQuizObj.categoryCode, storedQuizObj.examTimes, storedQuizObj.quiz_number,
                categoryMap[storedQuizObj.categoryCode], storedQuizObj.tableName);
            quizObj.mainQuestionSeq = storedQuizObj.mainQuestionSeq;
            quizObj.subQuestionSeq = storedQuizObj.subQuestionSeq;
            quizObj.questionRows = storedQuizObj.questionRows;
            quizObj.option = storedQuizObj.option;
            quizObj.quizCount = storedQuizObj.quizCount;
            quizObj.rightCount = storedQuizObj.rightCount;
            //debugger;
            quizObj.answeredMap = storedQuizObj.answeredMap;
            quizObj.currentPage = storedQuizObj.currentPage;
        }
        
        myNavigator.pushPage('quiz.html');
        setTimeout(function(){
            questionObj._setQuestion(1, quizObj, quizObj.option);
        }, 0.8);
        quizObj.resetQuizPage(1, quizObj.currentPage);
       
        document.getElementById('confirm-dialog').hide();
    },
    hideLoadStoredDataDialog: function() {
        removeLocalStorage(setting.storedQuizObjKey);
        document.getElementById('confirm-dialog').hide();
    }
};