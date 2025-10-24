
// グローバル変数一覧
var right_count = 0;
var wrong_count = 0;
var sound_flag = false;

var time_limit = 20;

var quizObj;


// 正解時のサウンドファイル名
var sound_right_answer = "right.mp3";

// 不正解時のサウンドファイル名
var sound_wrong_answer = "wrong.mp3";
var time_current = 0;
var timer_p = 100;

// 現在表示している問題番号
// var current_page_number = 1;

// カウントダウンタイマー
var timerObj;

// 正解時のサウンドファイル名
var sound_right_answer = "right.mp3";

// 不正解時のサウンドファイル名
var sound_wrong_answer = "wrong.mp3";


var quiz_number = 0;
var quiz_title = "";

var rankArray = {
    "rank_1_title": "Sランク",
    "rank_1_comment": "全問正解！よく出来ました。",
    "rank_2_title": "Aランク",
    "rank_2_comment": "おめでとうございます。次はSランクを目指しましょう。",
    "rank_3_title": "Bランク",
    "rank_3_comment": "よく出来ました。次はAランクを目指しましょう。",
    "rank_4_title": "Cランク",
    "rank_4_comment": "お疲れ様でした。次はBランクを目指しましょう。",
    "rank_5_title": "Dランク",
    "rank_5_comment": "残念！次からはもう少し頑張ってください。",
    "rank_6_title": "Eランク",
    "rank_6_comment": "全然ダメです。もっと精進しましょう。"
}

var media_array = new Object();
// ランダム順で出題するか
var randamSelectFlag = false;
// androidもSqliteを使うよう修正
var useSqlite = true;
if ("cordova" in window) {
    if (cordova.platformId == 'ios') {
        useSqlite = true;
    }
    document.addEventListener("deviceready", onMyDeviceReady, false);
} else {
    setTimeout(() => {
        onMyDeviceReady();
    }, 500);
}
function onMyDeviceReady() {
    if (typeof (Media) !== 'undefined') {
        // メディアオブジェクトを定義
        var pathRoot = location.pathname.substring(0, location.pathname.lastIndexOf('/') + 1);
        media_array[sound_right_answer] = new Media(pathRoot + 'sounds/' + sound_right_answer, onMyPlaySoundSuccess, onMyPlaySoundError);
        media_array[sound_wrong_answer] = new Media(pathRoot + 'sounds/' + sound_wrong_answer, onMyPlaySoundSuccess, onMyPlaySoundError);
    }
    if (cordova.platformId == 'ios') {
        var iscsvread = getLocalStorage(setting.CSVImportedKey);
        if (iscsvread) {
            readAllCsv(true);
        } else {
            readAllCsv(false);
        }
    } else {
        checkTableDataExists(setting.TTuuKanJituMuQuiz).then((iscsvread) => {
            if (iscsvread) {
                readAllCsv(true);
            } else {
                readAllCsv(false);
            }
        });
    }

    var islogin = localStorage.getItem('login', "");
    if (islogin === "flag") {
        myNavigator.pushPage('home.html');
    }
}

function onMyPlaySoundSuccess() {
    console.log("playAudio():音声の再生に成功しました");
}

function onMyPlaySoundError(error) {
    console.log("playAudio():音声の再生中にエラーが発生しました");
}

function toggleSoundFlag(btn) {
    if (isSoundOn()) {
        setSoundOff();
        $("#sound_off").show();
        $("#sound_on").hide();

    } else {
        setSoundOn();
        $("#sound_off").hide();
        $("#sound_on").show();
    }
}

function setSoundOn() {
    saveLocalStorage('muteFlag', null);
    console.log("setSoundOnを実行しました");
    sound_flag = true;
}

function setSoundOff() {
    $('#sound_btn')
    saveLocalStorage('muteFlag', true);
    console.log("setSoundOffを実行しました");
    sound_flag = false;
}

function isSoundOn() {
    var flag = getLocalStorage('muteFlag');

    if (flag == null) {
        console.log("SoundはONです");
        return true;
    }
    console.log("SoundはOFFです");
    return false;

}




function startTimer(i) {
    if (timerObj) {
        clearTimeout(timerObj);
        timerObj = false;
    }

    // 現在の経過時間（秒）
    time_current = 0;
    // 残りの時間（割合）
    timer_p = 100;

    var local_time_limit = quizObj.getTimeLimit();

    var countUp = function () {
        time_current += 1;
        timer_p = (local_time_limit - time_current) / local_time_limit * 100;



        if (timer_p <= 0) {
            // 時間切れ
            console.log("時間切れなのでタイマーの幅を100%にします");
            document.querySelector('#ons_progress_' + i).value = 100;

            console.log("clearTimeout(timerObj); timerObj=" + timerObj);
            clearTimeout(timerObj);
            stopTimer();
            if (i == quizObj.currentPage) {
                timeOut();
            }

            return;
        } else {
            // バーの幅を変える
            var timer_width = 100 - timer_p;

            var progbar = document.querySelector('#ons_progress_' + i);
            if (progbar) {
                progbar.value = timer_width;
            }
            timerObj = setTimeout(function () { countUp() }, 1000);

        }


    }
    countUp();
}





// タイマー終了
function stopTimer() {
    console.log("Execute StopTimer():");
    console.log(" timerObj=" + timerObj);

    if (timerObj) {
        console.log("clearTimeout(timerObj);");
        clearTimeout(timerObj);
        timerObj = false;
    }
}


// 時間切れ処理
function timeOut() {
    console.log("Execute timeOut():: current_page_number=" + quizObj.currentPage);

    var timerDiv = $("#ons_progress_" + quizObj.currentPage);

    if (!timerDiv || timerDiv == undefined) {
        return;
    }

    var timerValue = document.querySelector('#ons_progress_' + quizObj.currentPage).value;
    console.log("timerValue=" + timerValue);
    if (timerValue >= 100) {
        quizObj.wrongAnswer();
        console.log("時間切れ::timerValue=" + timerValue);


    }
}


var elem1;
var modal_flag = true;

window.addEventListener('load', onLoad, false);
// 事前にすべての広告を読み込んでおく
function onLoad() {




}

function loadRectBanner() {
}
function loadIndexBanner() {
    console.log("loading index banner...");
}
var banner_quiz_header = '';
var banner_quiz_middle = '';
var banner_quiz_footer = '';
function loadQuizBanner() {

    console.log("loading quiz banner...");



}
function loadFinishBanner() {
    console.log("loading finish banner...");
}

// レクタングル広告関係
function showModal() {
    if (modal_flag) {
        if ($('#new_nend_wrapper_rect_home').html() && $('#new_nend_wrapper_rect_home').html().match('click.php')) {
            var modal = document.querySelector('ons-modal');
            modal.show();
        } else if ($('#new_nend_wrapper_rect_home').html() && $('#new_nend_wrapper_rect_home').html().match('mobile.co.jp')) {
            var modal = document.querySelector('ons-modal');
            modal.show();
        }

        modal_flag = false;
        // 30秒は広告を表示しない
        setTimeout(function () {
            modal_flag = true;

        }, 30000);
    }
}



function hideModal() {
    var modal = document.querySelector('ons-modal');
    modal.hide();
}

function toggleRandamSelect(event) {
    randamSelectFlag = event.value == 'on';
}

function initQuiz(categoryCode, examTimes, initQuizSeq, categoryName, tableName) {

    var t = 50000;
    var ra = {
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
    };

    quizObj = new quizClass(categoryCode, examTimes, initQuizSeq, categoryName, tableName, ra, t);

    return;

    if (num == 1) {

        var t = 50000;
        var ra = {
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
        };

        quizObj = new quizClass(51, 1, '通関業法（通関業の許可）', ra, t);

        return;

    }
    if (num == 2) {

        var t = 50000;
        var ra = {
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
        };

        quizObj = new quizClass(51, 2, '通関業法（通関業者・通関士の義務）', ra, t);

        return;

    }
    if (num == 3) {

        var t = 50000;
        var ra = {
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
        };

        quizObj = new quizClass(51, 3, '通関業法（通関業者の権利）', ra, t);

        return;

    }
    if (num == 4) {

        var t = 50000;
        var ra = {
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
        };

        quizObj = new quizClass(51, 4, '通関業法（通関士の資格）', ra, t);

        return;

    }
    if (num == 5) {

        var t = 50000;
        var ra = {
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
        };

        quizObj = new quizClass(51, 5, '通関業法（行政処分）', ra, t);

        return;

    }
    if (num == 6) {

        var t = 50000;
        var ra = {
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
        };

        quizObj = new quizClass(51, 6, '通関業法（罰則）', ra, t);

        return;

    }
    if (num == 7) {

        var t = 50000;
        var ra = {
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
        };

        quizObj = new quizClass(51, 7, '通関業法（その他）', ra, t);

        return;

    }
    if (num == 8) {

        var t = 50000;
        var ra = {
            'rank_1_title': 'Sランク',
            'rank_1_comment': '全問正解！よく出来ました。',
            'rank_2_title': 'Aランク',
            'rank_2_comment': 'おめでとうございます。次はSランクを目指しましょう。',
            'rank_3_title': 'Bランク',
            'rank_3_comment': 'よく出来ました。次はAランクを目指しましょう。',
            'rank_4_title': 'Cランク',
            'rank_4_comment': 'お疲れ様でした。次はBランクを目指しましょう。',
            'rank_5_title': 'Dランク',
            'rank_5_comment': '残念！次からはもう少し頑張ってください。',
            'rank_6_title': 'Eランク',
            'rank_6_comment': '全然ダメです。もっと精進しましょう。'
        };

        quizObj = new quizClass(51, 8, '関税法（認定通関業者）', ra, t);

        return;

    }
    if (num == 9) {

        var t = 50000;
        var ra = {
            'rank_1_title': 'Sランク',
            'rank_1_comment': '全問正解！よく出来ました。',
            'rank_2_title': 'Aランク',
            'rank_2_comment': 'おめでとうございます。次はSランクを目指しましょう。',
            'rank_3_title': 'Bランク',
            'rank_3_comment': 'よく出来ました。次はAランクを目指しましょう。',
            'rank_4_title': 'Cランク',
            'rank_4_comment': 'お疲れ様でした。次はBランクを目指しましょう。',
            'rank_5_title': 'Dランク',
            'rank_5_comment': '残念！次からはもう少し頑張ってください。',
            'rank_6_title': 'Eランク',
            'rank_6_comment': '全然ダメです。もっと精進しましょう。'
        };

        quizObj = new quizClass(51, 9, '関税法（関税の確定・納付）', ra, t);

        return;

    }
    if (num == 10) {

        var t = 50000;
        var ra = {
            'rank_1_title': 'Sランク',
            'rank_1_comment': '全問正解！よく出来ました。',
            'rank_2_title': 'Aランク',
            'rank_2_comment': 'おめでとうございます。次はSランクを目指しましょう。',
            'rank_3_title': 'Bランク',
            'rank_3_comment': 'よく出来ました。次はAランクを目指しましょう。',
            'rank_4_title': 'Cランク',
            'rank_4_comment': 'お疲れ様でした。次はBランクを目指しましょう。',
            'rank_5_title': 'Dランク',
            'rank_5_comment': '残念！次からはもう少し頑張ってください。',
            'rank_6_title': 'Eランク',
            'rank_6_comment': '全然ダメです。もっと精進しましょう。'
        };

        quizObj = new quizClass(51, 10, '関税法（附帯税）', ra, t);

        return;

    }
    if (num == 11) {

        var t = 50000;
        var ra = {
            'rank_1_title': 'Sランク',
            'rank_1_comment': '全問正解！よく出来ました。',
            'rank_2_title': 'Aランク',
            'rank_2_comment': 'おめでとうございます。次はSランクを目指しましょう。',
            'rank_3_title': 'Bランク',
            'rank_3_comment': 'よく出来ました。次はAランクを目指しましょう。',
            'rank_4_title': 'Cランク',
            'rank_4_comment': 'お疲れ様でした。次はBランクを目指しましょう。',
            'rank_5_title': 'Dランク',
            'rank_5_comment': '残念！次からはもう少し頑張ってください。',
            'rank_6_title': 'Eランク',
            'rank_6_comment': '全然ダメです。もっと精進しましょう。'
        };

        quizObj = new quizClass(51, 11, '関税法（輸出通関）', ra, t);

        return;

    }
    if (num == 12) {

        var t = 50000;
        var ra = {
            'rank_1_title': 'Sランク',
            'rank_1_comment': '全問正解！よく出来ました。',
            'rank_2_title': 'Aランク',
            'rank_2_comment': 'おめでとうございます。次はSランクを目指しましょう。',
            'rank_3_title': 'Bランク',
            'rank_3_comment': 'よく出来ました。次はAランクを目指しましょう。',
            'rank_4_title': 'Cランク',
            'rank_4_comment': 'お疲れ様でした。次はBランクを目指しましょう。',
            'rank_5_title': 'Dランク',
            'rank_5_comment': '残念！次からはもう少し頑張ってください。',
            'rank_6_title': 'Eランク',
            'rank_6_comment': '全然ダメです。もっと精進しましょう。'
        };

        quizObj = new quizClass(51, 12, '関税法（輸入通関）', ra, t);

        return;

    }
    if (num == 13) {

        var t = 50000;
        var ra = {
            'rank_1_title': 'Sランク',
            'rank_1_comment': '全問正解！よく出来ました。',
            'rank_2_title': 'Aランク',
            'rank_2_comment': 'おめでとうございます。次はSランクを目指しましょう。',
            'rank_3_title': 'Bランク',
            'rank_3_comment': 'よく出来ました。次はAランクを目指しましょう。',
            'rank_4_title': 'Cランク',
            'rank_4_comment': 'お疲れ様でした。次はBランクを目指しましょう。',
            'rank_5_title': 'Dランク',
            'rank_5_comment': '残念！次からはもう少し頑張ってください。',
            'rank_6_title': 'Eランク',
            'rank_6_comment': '全然ダメです。もっと精進しましょう。'
        };

        quizObj = new quizClass(51, 13, '関税法（原産地表示）', ra, t);

        return;

    }
    if (num == 14) {

        var t = 50000;
        var ra = {
            'rank_1_title': 'Sランク',
            'rank_1_comment': '全問正解！よく出来ました。',
            'rank_2_title': 'Aランク',
            'rank_2_comment': 'おめでとうございます。次はSランクを目指しましょう。',
            'rank_3_title': 'Bランク',
            'rank_3_comment': 'よく出来ました。次はAランクを目指しましょう。',
            'rank_4_title': 'Cランク',
            'rank_4_comment': 'お疲れ様でした。次はBランクを目指しましょう。',
            'rank_5_title': 'Dランク',
            'rank_5_comment': '残念！次からはもう少し頑張ってください。',
            'rank_6_title': 'Eランク',
            'rank_6_comment': '全然ダメです。もっと精進しましょう。'
        };

        quizObj = new quizClass(51, 14, '関税法（輸出してはならない貨物）', ra, t);

        return;

    }
    if (num == 15) {

        var t = 50000;
        var ra = {
            'rank_1_title': 'Sランク',
            'rank_1_comment': '全問正解！よく出来ました。',
            'rank_2_title': 'Aランク',
            'rank_2_comment': 'おめでとうございます。次はSランクを目指しましょう。',
            'rank_3_title': 'Bランク',
            'rank_3_comment': 'よく出来ました。次はAランクを目指しましょう。',
            'rank_4_title': 'Cランク',
            'rank_4_comment': 'お疲れ様でした。次はBランクを目指しましょう。',
            'rank_5_title': 'Dランク',
            'rank_5_comment': '残念！次からはもう少し頑張ってください。',
            'rank_6_title': 'Eランク',
            'rank_6_comment': '全然ダメです。もっと精進しましょう。'
        };

        quizObj = new quizClass(51, 15, '関税法（輸入してはならない貨物）', ra, t);

        return;

    }
    if (num == 16) {

        var t = 50000;
        var ra = {
            'rank_1_title': 'Sランク',
            'rank_1_comment': '全問正解！よく出来ました。',
            'rank_2_title': 'Aランク',
            'rank_2_comment': 'おめでとうございます。次はSランクを目指しましょう。',
            'rank_3_title': 'Bランク',
            'rank_3_comment': 'よく出来ました。次はAランクを目指しましょう。',
            'rank_4_title': 'Cランク',
            'rank_4_comment': 'お疲れ様でした。次はBランクを目指しましょう。',
            'rank_5_title': 'Dランク',
            'rank_5_comment': '残念！次からはもう少し頑張ってください。',
            'rank_6_title': 'Eランク',
            'rank_6_comment': '全然ダメです。もっと精進しましょう。'
        };

        quizObj = new quizClass(51, 16, '関税法（保税地域）', ra, t);

        return;

    }
    if (num == 17) {

        var t = 50000;
        var ra = {
            'rank_1_title': 'Sランク',
            'rank_1_comment': '全問正解！よく出来ました。',
            'rank_2_title': 'Aランク',
            'rank_2_comment': 'おめでとうございます。次はSランクを目指しましょう。',
            'rank_3_title': 'Bランク',
            'rank_3_comment': 'よく出来ました。次はAランクを目指しましょう。',
            'rank_4_title': 'Cランク',
            'rank_4_comment': 'お疲れ様でした。次はBランクを目指しましょう。',
            'rank_5_title': 'Dランク',
            'rank_5_comment': '残念！次からはもう少し頑張ってください。',
            'rank_6_title': 'Eランク',
            'rank_6_comment': '全然ダメです。もっと精進しましょう。'
        };

        quizObj = new quizClass(51, 17, '関税法（運送）', ra, t);

        return;

    }
    if (num == 18) {

        var t = 50000;
        var ra = {
            'rank_1_title': 'Sランク',
            'rank_1_comment': '全問正解！よく出来ました。',
            'rank_2_title': 'Aランク',
            'rank_2_comment': 'おめでとうございます。次はSランクを目指しましょう。',
            'rank_3_title': 'Bランク',
            'rank_3_comment': 'よく出来ました。次はAランクを目指しましょう。',
            'rank_4_title': 'Cランク',
            'rank_4_comment': 'お疲れ様でした。次はBランクを目指しましょう。',
            'rank_5_title': 'Dランク',
            'rank_5_comment': '残念！次からはもう少し頑張ってください。',
            'rank_6_title': 'Eランク',
            'rank_6_comment': '全然ダメです。もっと精進しましょう。'
        };

        quizObj = new quizClass(51, 18, '関税法（不服申立て）', ra, t);

        return;

    }
    if (num == 19) {

        var t = 50000;
        var ra = {
            'rank_1_title': 'Sランク',
            'rank_1_comment': '全問正解！よく出来ました。',
            'rank_2_title': 'Aランク',
            'rank_2_comment': 'おめでとうございます。次はSランクを目指しましょう。',
            'rank_3_title': 'Bランク',
            'rank_3_comment': 'よく出来ました。次はAランクを目指しましょう。',
            'rank_4_title': 'Cランク',
            'rank_4_comment': 'お疲れ様でした。次はBランクを目指しましょう。',
            'rank_5_title': 'Dランク',
            'rank_5_comment': '残念！次からはもう少し頑張ってください。',
            'rank_6_title': 'Eランク',
            'rank_6_comment': '全然ダメです。もっと精進しましょう。'
        };

        quizObj = new quizClass(51, 19, '関税法（罰則）', ra, t);

        return;

    }
    if (num == 20) {

        var t = 50000;
        var ra = {
            'rank_1_title': 'Sランク',
            'rank_1_comment': '全問正解！よく出来ました。',
            'rank_2_title': 'Aランク',
            'rank_2_comment': 'おめでとうございます。次はSランクを目指しましょう。',
            'rank_3_title': 'Bランク',
            'rank_3_comment': 'よく出来ました。次はAランクを目指しましょう。',
            'rank_4_title': 'Cランク',
            'rank_4_comment': 'お疲れ様でした。次はBランクを目指しましょう。',
            'rank_5_title': 'Dランク',
            'rank_5_comment': '残念！次からはもう少し頑張ってください。',
            'rank_6_title': 'Eランク',
            'rank_6_comment': '全然ダメです。もっと精進しましょう。'
        };

        quizObj = new quizClass(51, 20, '関税定率法（関税率）', ra, t);

        return;

    }
    if (num == 21) {

        var t = 50000;
        var ra = {
            'rank_1_title': 'Sランク',
            'rank_1_comment': '全問正解！よく出来ました。',
            'rank_2_title': 'Aランク',
            'rank_2_comment': 'おめでとうございます。次はSランクを目指しましょう。',
            'rank_3_title': 'Bランク',
            'rank_3_comment': 'よく出来ました。次はAランクを目指しましょう。',
            'rank_4_title': 'Cランク',
            'rank_4_comment': 'お疲れ様でした。次はBランクを目指しましょう。',
            'rank_5_title': 'Dランク',
            'rank_5_comment': '残念！次からはもう少し頑張ってください。',
            'rank_6_title': 'Eランク',
            'rank_6_comment': '全然ダメです。もっと精進しましょう。'
        };

        quizObj = new quizClass(51, 21, '関税定率法（課税価格の決定）', ra, t);

        return;

    }
    if (num == 22) {

        var t = 50000;
        var ra = {
            'rank_1_title': 'Sランク',
            'rank_1_comment': '全問正解！よく出来ました。',
            'rank_2_title': 'Aランク',
            'rank_2_comment': 'おめでとうございます。次はSランクを目指しましょう。',
            'rank_3_title': 'Bランク',
            'rank_3_comment': 'よく出来ました。次はAランクを目指しましょう。',
            'rank_4_title': 'Cランク',
            'rank_4_comment': 'お疲れ様でした。次はBランクを目指しましょう。',
            'rank_5_title': 'Dランク',
            'rank_5_comment': '残念！次からはもう少し頑張ってください。',
            'rank_6_title': 'Eランク',
            'rank_6_comment': '全然ダメです。もっと精進しましょう。'
        };

        quizObj = new quizClass(51, 22, '関税定率法（特殊関税）', ra, t);

        return;

    }
    if (num == 23) {

        var t = 50000;
        var ra = {
            'rank_1_title': 'Sランク',
            'rank_1_comment': '全問正解！よく出来ました。',
            'rank_2_title': 'Aランク',
            'rank_2_comment': 'おめでとうございます。次はSランクを目指しましょう。',
            'rank_3_title': 'Bランク',
            'rank_3_comment': 'よく出来ました。次はAランクを目指しましょう。',
            'rank_4_title': 'Cランク',
            'rank_4_comment': 'お疲れ様でした。次はBランクを目指しましょう。',
            'rank_5_title': 'Dランク',
            'rank_5_comment': '残念！次からはもう少し頑張ってください。',
            'rank_6_title': 'Eランク',
            'rank_6_comment': '全然ダメです。もっと精進しましょう。'
        };

        quizObj = new quizClass(51, 23, '関税定率法（軽減・免除・払戻し）', ra, t);

        return;

    }
    if (num == 24) {

        var t = 50000;
        var ra = {
            'rank_1_title': 'Sランク',
            'rank_1_comment': '全問正解！よく出来ました。',
            'rank_2_title': 'Aランク',
            'rank_2_comment': 'おめでとうございます。次はSランクを目指しましょう。',
            'rank_3_title': 'Bランク',
            'rank_3_comment': 'よく出来ました。次はAランクを目指しましょう。',
            'rank_4_title': 'Cランク',
            'rank_4_comment': 'お疲れ様でした。次はBランクを目指しましょう。',
            'rank_5_title': 'Dランク',
            'rank_5_comment': '残念！次からはもう少し頑張ってください。',
            'rank_6_title': 'Eランク',
            'rank_6_comment': '全然ダメです。もっと精進しましょう。'
        };

        quizObj = new quizClass(51, 24, '関税定率法（通則）', ra, t);

        return;

    }
    if (num == 25) {

        var t = 50000;
        var ra = {
            'rank_1_title': 'Sランク',
            'rank_1_comment': '全問正解！よく出来ました。',
            'rank_2_title': 'Aランク',
            'rank_2_comment': 'おめでとうございます。次はSランクを目指しましょう。',
            'rank_3_title': 'Bランク',
            'rank_3_comment': 'よく出来ました。次はAランクを目指しましょう。',
            'rank_4_title': 'Cランク',
            'rank_4_comment': 'お疲れ様でした。次はBランクを目指しましょう。',
            'rank_5_title': 'Dランク',
            'rank_5_comment': '残念！次からはもう少し頑張ってください。',
            'rank_6_title': 'Eランク',
            'rank_6_comment': '全然ダメです。もっと精進しましょう。'
        };

        quizObj = new quizClass(51, 25, '関税暫定措置法（軽減・免除・払戻し）', ra, t);

        return;

    }
    if (num == 26) {

        var t = 50000;
        var ra = {
            'rank_1_title': 'Sランク',
            'rank_1_comment': '全問正解！よく出来ました。',
            'rank_2_title': 'Aランク',
            'rank_2_comment': 'おめでとうございます。次はSランクを目指しましょう。',
            'rank_3_title': 'Bランク',
            'rank_3_comment': 'よく出来ました。次はAランクを目指しましょう。',
            'rank_4_title': 'Cランク',
            'rank_4_comment': 'お疲れ様でした。次はBランクを目指しましょう。',
            'rank_5_title': 'Dランク',
            'rank_5_comment': '残念！次からはもう少し頑張ってください。',
            'rank_6_title': 'Eランク',
            'rank_6_comment': '全然ダメです。もっと精進しましょう。'
        };

        quizObj = new quizClass(51, 26, '関税暫定措置法（特恵関税）', ra, t);

        return;

    }
    if (num == 27) {

        var t = 50000;
        var ra = {
            'rank_1_title': 'Sランク',
            'rank_1_comment': '全問正解！よく出来ました。',
            'rank_2_title': 'Aランク',
            'rank_2_comment': 'おめでとうございます。次はSランクを目指しましょう。',
            'rank_3_title': 'Bランク',
            'rank_3_comment': 'よく出来ました。次はAランクを目指しましょう。',
            'rank_4_title': 'Cランク',
            'rank_4_comment': 'お疲れ様でした。次はBランクを目指しましょう。',
            'rank_5_title': 'Dランク',
            'rank_5_comment': '残念！次からはもう少し頑張ってください。',
            'rank_6_title': 'Eランク',
            'rank_6_comment': '全然ダメです。もっと精進しましょう。'
        };

        quizObj = new quizClass(51, 27, '外国為替及び外国貿易法', ra, t);

        return;

    }
    if (num == 28) {

        var t = 50000;
        var ra = {
            'rank_1_title': 'Sランク',
            'rank_1_comment': '全問正解！よく出来ました。',
            'rank_2_title': 'Aランク',
            'rank_2_comment': 'おめでとうございます。次はSランクを目指しましょう。',
            'rank_3_title': 'Bランク',
            'rank_3_comment': 'よく出来ました。次はAランクを目指しましょう。',
            'rank_4_title': 'Cランク',
            'rank_4_comment': 'お疲れ様でした。次はBランクを目指しましょう。',
            'rank_5_title': 'Dランク',
            'rank_5_comment': '残念！次からはもう少し頑張ってください。',
            'rank_6_title': 'Eランク',
            'rank_6_comment': '全然ダメです。もっと精進しましょう。'
        };

        quizObj = new quizClass(51, 28, '関税関係特例法', ra, t);

        return;

    }
    if (num == 29) {

        var t = 50000;
        var ra = {
            'rank_1_title': 'Sランク',
            'rank_1_comment': '全問正解！よく出来ました。',
            'rank_2_title': 'Aランク',
            'rank_2_comment': 'おめでとうございます。次はSランクを目指しましょう。',
            'rank_3_title': 'Bランク',
            'rank_3_comment': 'よく出来ました。次はAランクを目指しましょう。',
            'rank_4_title': 'Cランク',
            'rank_4_comment': 'お疲れ様でした。次はBランクを目指しましょう。',
            'rank_5_title': 'Dランク',
            'rank_5_comment': '残念！次からはもう少し頑張ってください。',
            'rank_6_title': 'Eランク',
            'rank_6_comment': '全然ダメです。もっと精進しましょう。'
        };

        quizObj = new quizClass(51, 29, '通関実務', ra, t);

        return;

    }
}



