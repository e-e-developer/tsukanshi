// 広告
function nextPage() {
    var id = $('#id').val();
    var password = $('#password').val();
    if (id == 'uFMXBmYvSNt7' && password == 'mik59kaio'){
         localStorage.setItem('login',"flag");
         myNavigator.pushPage('home.html');
    }else if(id  == '' && password == ''){
        ons.notification.alert('入力されていません');
    }else if(id  == ''){
        ons.notification.alert('IDが入力されていません');
    }else if(password == ''){
        ons.notification.alert('パスワードが入力されていません');
    }else if(id != 'uFMXBmYvSNt7' && password != 'mik59kaio'){
        ons.notification.alert('ID／パスワード共に不一致です');
    }else if(id != 'uFMXBmYvSNt7'){
        ons.notification.alert('IDが不一致です');
    }else if(password != 'mik59kaio'){
        ons.notification.alert('パスワードが不一致です');
    }
}