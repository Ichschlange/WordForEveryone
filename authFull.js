'use strict'
var loginEnter = document.getElementById("loginEnter");
var passwordEnter = document.getElementById("passwordEnter");
var email = document.getElementById("email");
var passwordCreate = document.getElementById("passwordCreate");
var passwordRepeat = document.getElementById("passwordRepeat");
var submit = document.getElementById("submit");
document.title = "Word4Everyone";
function genVersion()
{
    window.location.href = "index.html", true;
}

function outLog()
{
    let newEditor = window.open("list_document.html");
    newEditor.onload = function() {
        window.close();
    }
}

function sendDataReg()
{
    let customData = {
        "email": email.value,
        "password": passwordCreate.value,
        "passwordConfirm": passwordRepeat.value
    };
      
    let data = JSON.stringify(customData);
    console.log(data);
    let response = fetch('http://word4everyone.somee.com/api/Auth/Register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
        },
        body: data
    }).then((response) => {
        if (response.ok) {
            console.log(responseJson);
            responsiveVoice.speak("Вы зарегестрированы", "Russian Female");
            //alert("Вы зарегестрированы");
            window.localStorage.setItem("token", data.message); // Saving
            let newEditor = window.open("list_document.html");
            newEditor.onload = function() {
                window.close();
            }
        } else {
            responsiveVoice.speak("Неверные данные для регистрации", "Russian Female");
            //alert("Неверные данные для регистрации");
        }
    }).catch((error) => {
        console.log(error);
    });
}
function sendDataLog()
{
    let customData = {
        "email": loginEnter.value,
        "password": passwordEnter.value,
    };
      
    let data = JSON.stringify(customData);
    console.log(data);
    let response = fetch('http://word4everyone.somee.com/api/Auth/Login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
        },
        body: data
    }).then(response => response.json()).then((data) => {
        console.log(data);
        if(data.isSuccess)
            {
                //alert("Вы авторизованы");
                responsiveVoice.speak("Вы авторизованы", "Russian Female");
                window.localStorage.setItem("token", data.message); // Saving
                let newEditor = window.open("list_document.html");
                newEditor.onload = function() {
                    window.close();
                }
            }
        else
        {
            responsiveVoice.speak("Название учетной записи и/или пароль неверны", "Russian Female");
            //alert("Название учетной записи и/или пароль неверны");
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