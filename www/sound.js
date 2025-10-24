// This is a JavaScript file


// メディアオブジェクトを定義
var media = null;


// 指定した音声ファイルを再生します。
function playAudio(sound_file)
{
    if (!sound_flag) {
        return;
    }


    if( media_array && media_array[sound_file] ) {
        media_array[sound_file].stop();
        media_array[sound_file].play();
    } else {
        var str = location.pathname;
        var i = str.lastIndexOf('/');
        var path = str.substring(0, i + 1);
        if (media) {
            media.stop();
        }

        console.log(typeof Media);
        if (typeof Media === 'undefined') {
            return;
        }

        // 失敗・成功のコールバック関数を指定してメディアオブジェクトを生成
        media = new Media(path + 'sounds/' + sound_file, onPlaySoundSuccess, onPlaySoundError);
        media.play();
    }
}

function stopAudio()
{
    if( media_array ) {
        for (var key in media_array) {
            if( media_array[key] ) {
                media_array[key].stop();
            }
        }
    }
    if (media) {
        media.stop();
    }
}

// Mediaオブジェクトを生成する際の第２引数に設定した音声再生成功時のコールバック関数
function onPlaySoundSuccess() {
    console.log("playAudio():音声の再生に成功しました");
}

// Mediaオブジェクトを生成する際の第３引数に設定した音声再生失敗時のコールバック関数
function onPlaySoundError(error) {
    console.log("playAudio():音声の再生中にエラーが発生しました");
}


