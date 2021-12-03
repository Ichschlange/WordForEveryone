'use strict'
const fs = require('fs');
const refresh = document.getElementById("refreshButton");
const logout = document.getElementById("logout");
const searchNode = document.getElementById("search");
var dictElemText = new Map();
var dictElemTextServer = new Map();
var dictIdText = new Map();
let fileContent = "";
let userID = "";
let TOKEN = window.localStorage.getItem("token");
let serverDocs = [];

let Arr = [];
let result;
//Получение Id пользователя
function getUserID() {
    let response = fetch('http://word4everyone.somee.com/api/CheckIfAuthorized', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            Authorization: 'Bearer ' + TOKEN,
        },
    }).then(response => response.body)
        .then(rb => {
            const reader = rb.getReader();
            return new ReadableStream({
                start(controller) {
                    function push() {
                        reader.read().then(({ done, value }) => {
                            if (done) {

                                controller.close();
                                return;
                            }
                            controller.enqueue(value);
                            push();
                        })
                    }
                    push();
                }
            });
        })
        .then(stream => {
            return new Response(stream, { headers: { "Content-Type": "text/html" } }).text();
        })
        .then(result => {
            userID = result.substr(result.indexOf(": ") + 2, 37);
        });
}
//Обновление списка документов
function refr() {
    getUserID();
    document.querySelectorAll(".customDoc1").forEach(element => {
        element.remove();
    });
    let response = fetch('https://word4everyone.ml/api/Documents', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            Authorization: 'Bearer ' + TOKEN,
        },
    }).then(response => response.json()).then((data) => {
        serverDocs = [];
        for (let i = 0; i < data.length; i++) {
            serverDocs.push(data[i].name);
            var newDiv = document.createElement("div");
            newDiv.innerHTML = `<div aria-label="${data[i].name}" data-microtip-position="bottom" role="tooltip">
            <span class='docNameCustom'>`+ data[i].name + `</span></div>
            <div id="Location">На сервере</div>
            <div id="docToolsId">
            <div aria-label="Переимеовать" data-microtip-position="bottom" role="tooltip" class="docTools">
            <img src = '../img/rename.png' onclick='renameDoc("${data[i].name}", ${"0"})'></div>
            <div aria-label="Удалить" data-microtip-position="bottom" role="tooltip" class="docTools">
            <img src = '../img/delete.png' onclick='deleteDoc("${data[i].name}", ${"0"})'></div></div>`;
            newDiv.className = "customDoc1";
            var creatediv = document.getElementById("createDoc");
            document.getElementById("mainList").insertBefore(newDiv, creatediv);
            fileContent = data[i].text;
            if (fileContent == undefined)
                dictElemTextServer.set(data[i].name, "");
            else
                dictElemTextServer.set(data[i].name, fileContent);
            dictIdText.set(data[i].name, data[i].id);
        }
        var docs = document.querySelectorAll(".customDoc1 span");
        giveHandler(docs);
        Arr = [];
        result = document.getElementById('result');
        for (let key of dictElemText.keys()) {
            Arr.push(key);
        }
        for (let key of dictElemTextServer.keys()) {
            Arr.push(key);
        }
    });
    fs.readdirSync("./files/").forEach(file => {
        fileContent = fs.readFileSync("./files/" + file, "utf8");
        var newDiv = document.createElement("div");
        newDiv.innerHTML = `<div aria-label="${file}" data-microtip-position="bottom" role="tooltip">
        <span class='docNameCustom'>`+ file + `</span></div>
        <div id="Location">Локально</div>
        <div id="docToolsId">
        <div aria-label="Переимеовать" data-microtip-position="bottom" role="tooltip" class="docTools">
        <img src = '../img/rename.png' onclick='renameDoc("${file}", ${"1"})'></div>
        <div aria-label="Удалить" data-microtip-position="bottom" role="tooltip" class="docTools">
        <img src = '../img/delete.png' onclick='deleteDoc("${file}", ${"1"})'></div></div>`;
        newDiv.className = "customDoc1";
        var creatediv = document.getElementById("createDoc");
        document.getElementById("mainList").insertBefore(newDiv, creatediv);
        if (fileContent == undefined)
            dictElemText.set(file, "");
        else
            dictElemText.set(file, fileContent);
    });
    if (window.localStorage.getItem("token") == undefined) {
        var docs = document.querySelectorAll(".customDoc1 span");
        giveHandler(docs);
        Arr = [];
        result = document.getElementById('result');
        for (let key of dictElemText.keys()) {
            Arr.push(key);
        }
        for (let key of dictElemTextServer.keys()) {
            Arr.push(key);
        }
    }
}
//Создание документа
function createDoc() {
    let newEditor = window.open("document.html");
    window.localStorage.setItem("currentDoc", "");   // Saving
    newEditor.onload = function () {
        window.close();
    }
}
//Переименование документа
function renameDoc(data, method) {
    if (method == "1") {
        fs.rename("./files/" + data, "./files/" + prompt("Введите название файла"), () => {
            console.log("\nFile Renamed!\n");
        });
    }
    else {
        let customData = {
            "id": dictIdText.get(String(data)),
            "name": prompt("Введите название файла"),
            "text": dictElemTextServer.get(data),
            "userId": userID,
        };
        let dataPut = JSON.stringify(customData);
        console.log(customData);
        console.log(dataPut);
        let response = fetch('http://word4everyone.somee.com/api/Documents/' + dictIdText.get(String(data)), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                Authorization: 'Bearer ' + TOKEN,
            },
            body: dataPut,
        }).then(response => response.json())
    }
    refr();
}
//удаление документа
function deleteDoc(data, method) {
    console.log(data);
    if (method == "1") {
        fs.unlinkSync("./files/" + data);
    }
    else {
        let response = fetch('http://word4everyone.somee.com/api/Documents/' + dictIdText.get(String(data)), {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                Authorization: 'Bearer ' + TOKEN,
            },
        }).then(response => response.json())
    }
    refr();
}
//отправка файлов на сервер
function upload() {
    var docs = document.querySelectorAll(".customDoc1");
    docs.forEach(function (element) {
        let customData = {
            "name": element.children[0].children[0].textContent,
            "text": dictElemText.get(element.children[0].children[0].textContent),
        };
        if (element.children[1].textContent == "Локально" && !serverDocs.includes(element.children[0].children[0].textContent)) {
            console.log(element);
            let data = JSON.stringify(customData);
            let response = fetch('http://word4everyone.somee.com/api/Documents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8',
                    Authorization: 'Bearer ' + TOKEN,
                },
                body: data
            }).then(response => response.json()).then(response => console.log(response));
        }
        else if (element.children[1].textContent == "Локально") {
            console.log("userID" + userID);
            let customDataModified = {
                id: dictIdText.get(customData.name),
                name: customData.name,
                text: customData.text,
                userId: userID
            };
            let dataPut = JSON.stringify(customDataModified);
            let response = fetch("https://word4everyone.ml/api/Documents/" + customDataModified.id, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json;charset=utf-8",
                    Authorization: "Bearer " + TOKEN
                },
                body: dataPut
            }).then((response) => response.json());
        }
    });
    refr();
}
//Поиск документов
function autoComplete(Arr, Input) {
    return Arr.filter(e => e.toLowerCase().includes(Input.toLowerCase()));
}
//Отображение искомых документов
function getValue(val) {
    if (!val) {
        result.innerHTML = '';
        return
    }
    var data = autoComplete(Arr, val);
    var res = '';
    data.forEach(e => {
        res += "<span class='ref'><span>" + e + "</span></span><br>";
    });
    result.innerHTML = res;
    let docs = document.querySelectorAll(".ref");
    giveHandlerSearch(docs);
}
function giveHandlerSearch(docs) 
{
    docs.forEach(function (element) {
        element.addEventListener("click", function () {
            window.localStorage.setItem("currentDoc", element.textContent);   // Saving
            window.localStorage.setItem("savedText", dictElemText.get(element.textContent));
            let newEditor = window.open("document.html");
            newEditor.onload = function () {
                window.close();
            }
        });
    });
}
//Переход в редактор
function giveHandler(docs) {
    docs.forEach(function (element) {
        element.addEventListener("click", function () {
            window.localStorage.setItem("currentDoc", element.textContent);   // Saving
            if(element.parentElement.nextElementSibling.textContent == "Локально")
                window.localStorage.setItem("savedText", dictElemText.get(element.textContent));
            else
                window.localStorage.setItem("savedText", dictElemTextServer.get(element.textContent));
            let newEditor = window.open("document.html");
            newEditor.onload = function () {
                window.close();
            }
        });
    });
}
//Выход из системы
logout.addEventListener("click", function () {
    window.location.href = "index.html", true;
    let TOKEN = window.localStorage.removeItem("token");
});