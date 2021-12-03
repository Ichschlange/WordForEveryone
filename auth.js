'use strict'
var loginEnter = document.getElementById("loginEnter");
var passwordEnter = document.getElementById("passwordEnter");
var login = document.getElementById("login");
var email = document.getElementById("email");
var passwordCreate = document.getElementById("passwordCreate");
var passwordRepeat = document.getElementById("passwordRepeat");
var submit = document.getElementById("submit");
var link = document.getElementById("theme-link");
document.title = "Word4Everyone";
//Отображение вкладок
var $tabs = function (target) {
var _elemTabs = (typeof target === 'string' ? document.querySelector(target) : target),
    _eventTabsShow,
    _showTab = function (tabsLinkTarget) {
        var tabsPaneTarget, tabsLinkActive, tabsPaneShow;
        tabsPaneTarget = document.querySelector(tabsLinkTarget.getAttribute('href'));
        tabsLinkActive = tabsLinkTarget.parentElement.querySelector('.tabs__link_active');
        tabsPaneShow = tabsPaneTarget.parentElement.querySelector('.tabs__pane_show');
        
        if (tabsLinkTarget === tabsLinkActive) {
            return;
        }
        
        if (tabsLinkActive !== null) {
            tabsLinkActive.classList.remove('tabs__link_active');
        }
        if (tabsPaneShow !== null) {
            tabsPaneShow.classList.remove('tabs__pane_show');
        }
        
        tabsLinkTarget.classList.add('tabs__link_active');
        tabsPaneTarget.classList.add('tabs__pane_show');
        document.dispatchEvent(_eventTabsShow);
    },
        _switchTabTo = function (tabsLinkIndex) {
        var tabsLinks = _elemTabs.querySelectorAll('.tabs__link');
        if (tabsLinks.length > 0) {
            if (tabsLinkIndex > tabsLinks.length) {
            tabsLinkIndex = tabsLinks.length;
            } else if (tabsLinkIndex < 1) {
            tabsLinkIndex = 1;
            }
            _showTab(tabsLinks[tabsLinkIndex - 1]);
        }
    };
_eventTabsShow = new CustomEvent('tab.show', { detail: _elemTabs });
_elemTabs.addEventListener('click', function (e) {
    var tabsLinkTarget = e.target;
    
    if (!tabsLinkTarget.classList.contains('tabs__link')) {
    return;
    }
    
    e.preventDefault();
    _showTab(tabsLinkTarget);
});
return {
    showTab: function (target) {
    _showTab(target);
    },
    switchTabTo: function (index) {
    _switchTabTo(index);
    }
}
};
$tabs('.tabs');
//Изменение темы
function ChangeTheme()
{
    let indexTheme = "styles/index.css";
    let altTheme = "styles/alt_index.css";
    var currTheme = link.getAttribute("href");
    var theme = "";
    if(currTheme == indexTheme)
    {
        currTheme = altTheme;
        theme = "alt";
    }
    else
    {    
        currTheme = indexTheme;
        theme = "index";
    }
    link.setAttribute("href", currTheme);
    console.log(currTheme);
}
//Переход на полную версию
function fullVersion()
{
    window.location.href = "indexFull.html", true;
}
//Отправить данные о регистрации
function sendDataReg()
{
    let customData = {
        "email": email.value,
        "password": passwordCreate.value,
        "passwordConfirm": passwordRepeat.value
    };
      
    let data = JSON.stringify(customData);
    console.log(data);
    let div = document.createElement("div");
    div.className = "loader";
    div.id = "modal-div__area";
    div.innerHTML = `
        <img id="loadImg" src="../img/loader.gif" alt="Загрузка">
    `;
    console.log(document.querySelectorAll("button")[1]);
    document.querySelectorAll("button")[1].style.display = "flex";
    document.querySelectorAll("button")[1].append(div);
    console.log(document.querySelectorAll("button"));
    let response = fetch('https://word4everyone.ml/api/Auth/Register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
        },
        body: data
    }).then((response) => {
        if (response.ok) {
            console.log(response);
            responsiveVoice.speak("Вы зарегестрированы", "Russian Female");
            setTimeout(function() {
                window.localStorage.setItem("token", data.message); // Saving
                let newEditor = window.open("list_document.html");
                newEditor.onload = function() {
                    window.close();
                }
            }, 3000);
        } else {
            responsiveVoice.speak("Неверные данные для регистрации", "Russian Female");
            div.remove();
            document.querySelector("button").style.display = "block";
        }
    }).catch((error) => {
        console.log(error);
    });
}

function outLog()
{
    let newEditor = window.open("list_document.html");
    newEditor.onload = function() {
        window.close();
    }
}
//Авторизация
function sendDataLog()
{
    loginEnter.style.borderColor = "black";
    let customData = {
        "email": loginEnter.value,
        "password": passwordEnter.value,
    };
      
    let data = JSON.stringify(customData);
    console.log(data);
    let div = document.createElement("div");
    div.className = "loader";
    div.id = "modal-div__area";
    div.innerHTML = `
        <img id="loadImg" src="../img/loader.gif" alt="Загрузка">
    `;
    document.querySelector("button").style.display = "flex";
    document.querySelector("button").append(div);
    let response = fetch('https://word4everyone.ml/api/Auth/Login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
        },
        body: data
    }).then(response => response.json()).then((data) => {
        console.log(data);
        if(data.isSuccess)
            {
                responsiveVoice.speak("Вы авторизованы", "Russian Female");
                setTimeout(function() {
                    window.localStorage.setItem("token", data.message); // Saving
                    let newEditor = window.open("list_document.html");
                    newEditor.onload = function() {
                        window.close();
                    }
                }, 2000);
            }
        else
        {
            responsiveVoice.speak("Название учетной записи и/или пароль неверны", "Russian Female");
            div.remove();
            document.querySelector("button").style.display = "block";
        }
      })
}
function forgetPass()
{
    if(loginEnter.value == "")
    {
        responsiveVoice.speak("Введите электронную почту", "Russian Female");
        loginEnter.style.borderColor = "red";
    }else{
        loginEnter.style.borderColor = "black";
        let response = fetch(`https://word4everyone.ml/api/Auth/ForgetPassword/?email=${loginEnter.value}`, {
            method: 'GET',
        }).then(response => response.json()).then((data) => {
            console.log(data);
            responsiveVoice.speak("Сообщение отправлено на электронную почту", "Russian Female");
        });
    }
}