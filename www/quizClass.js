// This is a JavaScript file
function quizClass(categoryCode, exam_Times, quiz_number, quiz_title, tableName, ra, time) {
    this.categoryCode = categoryCode;
    this.examTimes = exam_Times;
    this.quiz_number = quiz_number;
    this.title = quiz_title;
    this.tableName = tableName;
    this.rankArray = ra;
    this.time_limit = time;

    this.currentPage = 1;
    this.categoryQuizSeq = 1;
    // GLOBALのcurrent_page_numberも1にしておく
    // current_page_number = 1;

    this.quizCount = 0;
    this.rightCount = 0;
    this.wrongCount = 0;

    this.questionRows = null;
    this.option = null;
    this.answeredMap = {};
    this.fromErrataTalbe = false;
    // 正解時の処理
    this.rightAnswer = function () {
        this.rightCount++;
        this.quizCount++;
        // タイマーを止める
        stopTimer();
        playAudio(sound_right_answer);

        // コメントがあれば表示
        if (this.existsEndMessage()) {
            this.showAnswerResult("正解");
            if (!this.option || !!this.option.displayExplanationByCorrect) {
                $('#question-explanation_1').show();
            } else {
                $('#question-explanation_1').hide();
            }
        } else {
            this.afterAnswer();
        }
    }

    // 不正解時の処理
    this.wrongAnswer = function () {
        this.wrongCount++;
        this.quizCount++;
        stopTimer();
        playAudio(sound_wrong_answer);
        if (this.existsEndMessage()) {
            this.showAnswerResult("不正解");

        } else {
            this.afterAnswer();
        }
    }

    // 回答結果の表示
    this.showAnswerResult = function (resultString)
    {
        var answer_resultId = "#answer_result_1";
        document.querySelector(answer_resultId).innerHTML = resultString;

        $("div.end_message").show();
        $("div.answer_panel").hide();

        // 回答履歴更新
        var questionRow = this.questionRows[0];
        this.answeredMap[questionRow.categoryCode
            + ',' + questionRow.examTimes
            + ',' + questionRow.mainQuestionSeq
            + ',' + questionRow.subQuestionSeq] = resultString == '正解' ? 1 : 0;
        quizObj.questionRows.shift();
        //questionObj.updateCorrectAnswer(resultString, questionRow);
    }

    // 現在のページにエンドメッセージがあるか判定
    this.existsEndMessage = function ()
    {
        var end_messageId = "#end_message_1";
        var end_message = $(end_messageId).val();
        if (end_message) {
            return true;
        }
        return false;
    }

    // 回答後処理
    this.afterAnswer = async function()
    {
        // 回答終了時の処理
        console.log('回答終了時の処理を実行します');
        if (!!quizObj.fromErrataTalbe) {
            questionObj.backPage();
            return;
        }
        // 次の問題があるかどうかを判定
        var next_page_number = quizObj.currentPage + 1;
        var myNavigator = document.querySelector('#myNavigator');
        // 次の問題が無ければ終了
        if (!!quizObj.isQuestionFinished(next_page_number)) {
            /*questionObj.updateAnswerCountHistry().then(function(){
                questionObj.insertAnswerCountHistry().then(function(){
                    questionObj.updateCorrectAnswer().then(function(){
                        questionObj.insertAnswerHistry().then(function(){
                            questionObj.updateAnswerHistry().then(function(){
                                myNavigator.pushPage('finish.html');
                                quizObj.questionRows = null;
                            });
                        });
                    });
                });
            });
            */
           await questionObj.updateAnswerCountHistry()
           await questionObj.insertAnswerCountHistry()
           await questionObj.saveAnswerCountHistry()
           await questionObj.insertAllAnswerCountHistry()
           await questionObj.updateAllAnswerCountHistry()
           await questionObj.updateCorrectAnswer()
           await questionObj.insertAnswerHistry()
           await questionObj.updateAnswerHistry()
           if(quizObj.option.mistakeQuizOnlyFlag){
            await questionObj.updateSkipAnswerHistry()
           }
           removeLocalStorage(setting.storedQuizObjKey);
           myNavigator.pushPage('finish.html');
           quizObj.questionRows = null;
           quizObj.questionAllRows = null;
        } else {
            // 次の問題があればその問題に移動
            console.log("最終問題ではないので次のページに移動します...");
            var nodeBaseId = 1;
            /*
            // 使った要素はIDを変える(pushPageの際に重複しないように)
            $('#question-quizSeq_'+ nodeBaseId).attr('id', 'question-quizSeq_'+ next_page_number);
            $('#question-titleCategory_'+ nodeBaseId).attr('id', 'question-titleCategory_'+ next_page_number);
            $('#question-categoryName_'+ nodeBaseId).attr('id', 'question-categoryName_'+ next_page_number);
            $('#question-examTimes_'+ nodeBaseId).attr('id', 'question-examTimes_'+ next_page_number);
            $('#question-mainQuestionSeq_'+ nodeBaseId).attr('id', 'question-mainQuestionSeq_'+ next_page_number);
            $('#question-subQuestionSeq_'+ nodeBaseId).attr('id', 'question-subQuestionSeq_'+ next_page_number);
            $('#question-question_'+ nodeBaseId).attr('id', 'question-question_'+ next_page_number);
            var twoSelections = $("#question-onsRow_" + nodeBaseId);
            if(twoSelections){
                twoSelections.attr('id', 'question-onsRow_'+ next_page_number);
            }
            var questionSelection = $('#question-selection_'+ nodeBaseId);
            if (questionSelection) {
                questionSelection.attr('id', 'question-selection_'+ next_page_number);
            }
            $('#question-selectionButtons_' + nodeBaseId).attr('id', 'question-selectionButtons_'+ next_page_number);
            $('#end_message_' + nodeBaseId).attr('id', 'end_message_'+ next_page_number);
            $('#answer_result_' + nodeBaseId).attr('id', 'answer_result_'+ next_page_number);
            $('#question-answerKey_' + nodeBaseId).attr('id', 'question-answerKey_'+ next_page_number);
            $('#question-explanation_' + nodeBaseId).attr('id', 'question-explanation_'+ next_page_number);
            $('#question-afterAnswerButton_' + nodeBaseId).attr('id', 'question-afterAnswerButton_'+ next_page_number);
            */

            this.resetQuizPage(nodeBaseId, next_page_number);
            // 集計処理
            this.increasePageNumber();
            myNavigator.pushPage('quiz.html');

            // pushPageでonTransitionEndが効かないので独自にコールバック
            setTimeout(function(){
                questionObj.load(nodeBaseId, next_page_number - 1);
            }, 0.1);
        }
    }
    this.resetQuizPage = function(nodeBaseId, next_page_number)
    {
        console.log("resetQuizPage");
            // 使った要素はIDを変える(pushPageの際に重複しないように)
            $('#question-quizSeq_'+ nodeBaseId).attr('id', 'question-quizSeq_'+ next_page_number);
            $('#question-titleCategory_'+ nodeBaseId).attr('id', 'question-titleCategory_'+ next_page_number);
            $('#question-categoryName_'+ nodeBaseId).attr('id', 'question-categoryName_'+ next_page_number);
            $('#question-examTimes_'+ nodeBaseId).attr('id', 'question-examTimes_'+ next_page_number);
            $('#question-mainQuestionSeq_'+ nodeBaseId).attr('id', 'question-mainQuestionSeq_'+ next_page_number);
            $('#question-subQuestionSeq_'+ nodeBaseId).attr('id', 'question-subQuestionSeq_'+ next_page_number);
            $('#question-question_'+ nodeBaseId).attr('id', 'question-question_'+ next_page_number);
            $('#question-progress_'+ nodeBaseId).attr('id', 'question-progress_'+ next_page_number);
            $('#question-bookmark_'+ nodeBaseId).attr('id', 'question-bookmark_'+ next_page_number);

            //$('#question_progress_'+ nodeBaseId).html( next_page_number + "/" + quizObj.option.questionCount + "");
            //$('#question_progress_'+ next_page_number).html( next_page_number + "/" + quizObj.option.questionCount + "");

            var twoSelections = $("#question-onsRow_" + nodeBaseId);
            if(twoSelections){
                twoSelections.attr('id', 'question-onsRow_'+ next_page_number);
            }
            var questionSelection = $('#question-selection_'+ nodeBaseId);
            if (questionSelection) {
                questionSelection.attr('id', 'question-selection_'+ next_page_number);
            }
            $('#question-selectionButtons_' + nodeBaseId).attr('id', 'question-selectionButtons_'+ next_page_number);
            $('#end_message_' + nodeBaseId).attr('id', 'end_message_'+ next_page_number);
            $('#answer_result_' + nodeBaseId).attr('id', 'answer_result_'+ next_page_number);
            $('#question-answerKey_' + nodeBaseId).attr('id', 'question-answerKey_'+ next_page_number);
            $('#question-explanation_' + nodeBaseId).attr('id', 'question-explanation_'+ next_page_number);
            $('#question-afterAnswerButton_' + nodeBaseId).attr('id', 'question-afterAnswerButton_'+ next_page_number);


            console.log(quizObj);
            //bookmark
            bookmarkrow = quizObj.questionRows[0];
            bookmarkrow.nodeBaseId = next_page_number;
            $('#question-bookmark_'+ next_page_number).attr("data-quizdata",JSON.stringify(bookmarkrow));
            if(bookmarkObj.is_bookmark(bookmarkrow)){
                console.log("2登録済");
                $('#question-bookmark_'+ next_page_number+" .star").addClass("bookmarked");    
            } else {
                console.log("2未登録");
                $('#question-bookmark_'+ next_page_number+" .star").removeClass("bookmarked");    
            }
        

    }
    this.isQuestionFinished = function()
    {
        console.log('oha this.questionRows.length:', this.questionRows.length);
        return this.questionRows && this.questionRows.length == 0;
    }

    // 入力問題の正誤判定
    this.inputQuizAnswerCheck = function (rightAnswerString)
    {

        var userAnswerString = $("#text_input_" + this.quiz_number + '-' + this.currentPage).val();
        console.log("入力値" + userAnswerString);
        console.log("答え" + rightAnswerString);
        if (userAnswerString == rightAnswerString) {
            return this.rightAnswer();
        }
        return this.wrongAnswer();
    }

    // 複数選択問題の正誤判定
    this.multiselectQuizAnswerCheck = function(rightAnswerString)
    {
        console.log("複数選択問題の正誤判定を実行します");
        var currentPageName = this.getCurrentPageName();
        var rightAnswerArray = new Array;
        for (var i = 0 ; i < rightAnswerString.length; i++) {
            rightAnswerArray.push(rightAnswerString.charAt(i));
        }

        var userAnswerArray = new Array;
        // チェックボックス分ループしてユーザーの回答を配列に格納
        $("div#" + currentPageName + " input[type='checkbox']").each(function(){
            if ($(this).is(':checked')) {
                userAnswerArray.push($(this).val());
            }
        });

        // 回答の個数と正解の個数が違えば不正解
        if (userAnswerArray.length != rightAnswerArray.length) {
            console.log(userAnswerArray.length + "回答の数が合わないので不正解です。" + rightAnswerArray.length);
            return this.wrongAnswer();
        }

        // 正解の要素が選択されていない場合は不正解
        for (var i = 0; i < rightAnswerArray.length; i++) {
            var currentAnswer = rightAnswerArray[i];
            // currentAnswerが回答に含まれていない場合は不正解
            var flag = false;
            for (var j = 0; j < userAnswerArray.length; j++) {
                if (userAnswerArray[j] == currentAnswer) {
                    flag = true;
                }
            }
            if (flag == false) {
                console.log(currentAnswer + "が回答に含まれていないので不正解です。");
                return this.wrongAnswer();
            }
        }
        console.log("正解です。");
        // チェックを通過した場合は正解
        return this.rightAnswer();
    }


    this.getCurrentPageName = function()
    {
        return 'question-' + this.quiz_number + '-' + this.currentPage;
    }

    this.increasePageNumber = function ()
    {
        this.currentPage++;

    }

    this.getTimeLimit = function ()
    {
        return this.time_limit;
    }

    this.getRatio = function () {

        var rat = this.rightCount / (this.quizCount) * 100;
        return Math.round(rat * 100) / 100;
    }

    this.getRank = function(ratio)
    {
        var ratio = ratio ? ratio : this.getRatio();

        if (ratio == 100) {
            rank_title   = this.rankArray['rank_1_title'];
        } else if (ratio >= 80) {
            rank_title   = this.rankArray['rank_2_title'];
        } else if (ratio >= 60) {
            rank_title   = this.rankArray['rank_3_title'];
        } else if (ratio >= 40) {
            rank_title   = this.rankArray['rank_4_title'];
        } else if (ratio >= 20) {
            rank_title   = this.rankArray['rank_5_title'];
        } else {
            rank_title   = this.rankArray['rank_6_title'];
        }
        return rank_title;
    }


    this.getComment = function ()
    {
        var ratio = this.getRatio();
        if (ratio == 100) {
            rank_comment = this.rankArray['rank_1_comment'];
        } else if (ratio >= 80) {
            rank_comment = this.rankArray['rank_2_comment'];
        } else if (ratio >= 60) {
            rank_comment = this.rankArray['rank_3_comment'];
        } else if (ratio >= 40) {
            rank_comment = this.rankArray['rank_4_comment'];
        } else if (ratio >= 20) {
            rank_comment = this.rankArray['rank_5_comment'];
        } else {
            rank_comment = this.rankArray['rank_6_comment'];
        }
        return rank_comment;
    }
}
function quizClass_getrank(ratio){
        var  rankresult = {};
        var rankArray ={
            'rank_1_title': 'Sランク',
            'rank_1_comment': '全問正解！よく出来ました。',
            'rank_2_title': 'Aランク',
            'rank_2_comment': 'おめでとうございます。次はSランクを目指しましょう。',
            'rank_3_title': 'Bランク',
            'rank_3_comment': 'よく出来ました。次はAランクを目指しましょう。',
            'rank_4_title': 'Cランク',
            'rank_4_comment': 'お疲れ様でした。次はBランクを目指しましょう。',
            'rank_5_title': 'Dランク',
            'rank_5_comment': 'お疲れ様でした。日々の積み重ねが合格への近道です。',
            'rank_6_title': 'Eランク',
            'rank_6_comment': 'お疲れ様でした。日々の積み重ねが合格への近道です。'
        }

        if (ratio == 100) {
            rankresult.comment = rankArray['rank_1_comment'];
            rankresult.title   = rankArray['rank_1_title'];
        } else if (ratio >= 80) {
            rankresult.comment = rankArray['rank_2_comment'];
            rankresult.title   = rankArray['rank_2_title'];
        } else if (ratio >= 60) {
            rankresult.comment = rankArray['rank_3_comment'];
            rankresult.title   = rankArray['rank_3_title'];
        } else if (ratio >= 40) {

            rankresult.comment = rankArray['rank_4_comment'];
            rankresult.title   = rankArray['rank_4_title'];
        } else if (ratio >= 20) {
            rankresult.comment = rankArray['rank_5_comment'];
            rankresult.title   = rankArray['rank_5_title'];
        } else {
            rankresult.comment = rankArray['rank_6_comment'];
            rankresult.title   = rankArray['rank_6_title'];
        }
        return rankresult;
}