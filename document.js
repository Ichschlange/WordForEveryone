'use strict';
const fs = require('fs');
var EnterCommandButton = document.getElementById("FormatCommand");
var mainText = document.getElementById("mainText");
var BoldCommandButton = document.getElementById("BoldCommand");
var CurveCommandButton = document.getElementById("CurveCommand");
var UnderlineCommandButton = document.getElementById("UnderlineCommand");
var ToLeftCommandButton = document.getElementById("ToLeftCommand");
var ToCenterCommandButton = document.getElementById("ToCenterCommand");
var ToRightCommandButton = document.getElementById("ToRightCommand");
var ToEverCommandButton = document.getElementById("ToEverCommand");
var ULCommandButton = document.getElementById("ULCommand");
var OLCommandButton = document.getElementById("OLCommand");
var FileButton = document.getElementById("FileBack");
var AreaButton = document.getElementById("AreaCommand");
let isRecording = false;
let isCommanding = false;
let isListening = false;
var mainchannel = [];
var recorder = null;
var recordingLength = 0;
var mediaStream = null;
var sampleRate = 44100;
var context = null;
var blob = null;
var volume = null;
var leftArea = 0;
var rightArea = 0;
var topArea = 0;
var bottomArea = 0;
//Получение названия документа и его текста
let savedText = window.localStorage.getItem("savedText");
let CURRENTDOC = window.localStorage.getItem("currentDoc"); // Retrieving
if(CURRENTDOC != null)
{
    document.title = CURRENTDOC;
}


let selAreas = document.getSelection();

let range = new Range();
range.setStart(mainText, 0);
range.setEnd(mainText, 0);
selAreas.removeAllRanges();
selAreas.addRange(range);
console.log(selAreas);


initAreas();
changeFont();
changeFontSize();
placeSavedText();
//Инициализация полей документа
function initAreas() {
    leftArea = 0;
    rightArea = 0;
    topArea = 0;
    bottomArea = 3;
}
//Проверка правописания речи
function checkSpell(checkText, returnText) {
    const languagetool = require("languagetool-api");
    var params = {
        language: "ru-RU",
        text: checkText,
    };
    languagetool.check(params, function (err, res) {
        if (err) {
            console.log(err);
        } else {
            console.log(res);
            let TempRes = res;
            for (let i = 0; i < TempRes.matches.length; i++) {
                let offset = TempRes.matches[i].offset;
                let length = TempRes.matches[i].length;
                let repairStr = TempRes.matches[i].replacements[0];
                checkText = checkText.replace(checkText.slice(offset, offset+length), repairStr.value);
            }
            if(selAreas.anchorNode.nodeValue==null)
            {
                selAreas.anchorNode.innerText += " " + checkText + "."; ///////////////////////////////!!!!!!!!!!!!
            }else
            {selAreas.anchorNode.nodeValue += " " + checkText + ".";}
        }
    });
}
//Отображение сохраненного текста
function placeSavedText() {
    if (savedText == null)
        return;
    let allPages = document.getElementsByClassName("Text");
    allPages[0].innerHTML = "";
    let k = 0;
    let tempHTML = "";
    let endStr = savedText.indexOf("|", 0);
    let areasStr = savedText.slice(0, endStr);
    let areasArr = areasStr.split("/");
    leftArea = areasArr[0];
    rightArea = areasArr[1];
    topArea = areasArr[2];
    bottomArea = areasArr[3];
    let elements = document.getElementsByClassName("Text");
    for (let i = 0; i < elements.length; i++) {
        elements[i].style.paddingLeft = leftArea + "mm";
        elements[i].style.paddingRight = rightArea + "mm";
        elements[i].style.paddingTop = topArea + "mm";
        elements[i].style.paddingBottom = +(+(bottomArea) + 3) + "mm";
    }
    for (let i = endStr + 1; i < savedText.length; i++) {
        if (savedText[i] == "@" && savedText[i + 1] == "@") {
            allPages[k].innerHTML += tempHTML;
            while (true) {
                try {
                    if (allPages[k].firstChild.localName == "br")
                        allPages[k].firstChild.remove();
                    else
                        break;
                }
                catch (e) {
                    break;
                }
            }
            tempHTML = "";
            k++;
            i++;
            let elem = document.getElementsByClassName("Text");
            let div = document.createElement("div");
            div.className = 'Text';
            div.style = `height: 297mm; width: 210mm; padding-left: ${leftArea}mm; 
            padding-right: ${rightArea}mm; padding-top: ${topArea}mm;
            padding-bottom: ${bottomArea}mm;`;
            div.contentEditable = "true";
            div.innerHTML = "<div><br></div><div><br></div><div><br></div>";
            elem[elem.length - 1].parentNode.append(div);
            div.addEventListener("onfocus", takechanges());
            div.addEventListener("onmouseup", prefirstLine());
            elem[elem.length - 1].lastChild.remove();
        } else {
            tempHTML += savedText[i];

        }
    }
    allPages[k].innerHTML += tempHTML;
    while (true) {
        if (allPages[k].firstChilds == null)
            break;
        if (allPages[k].firstChild.localName == "br")
            allPages[k].firstChild.remove();
        else
            break;
    }
}
//Пользовательский слайдер
let thumb = document.body.getElementsByClassName('thumb');
for (let i = 0; i < thumb.length; i++) {
    thumb[i].onmousedown = function (event) {
        event.preventDefault();
        let shiftX = event.clientX - thumb[i].getBoundingClientRect().left;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        let newLeft = event.clientX - shiftX - slider.getBoundingClientRect().left;
        function onMouseMove(event) {
            let TnewLeft = event.clientX - shiftX - slider.getBoundingClientRect().left;
            if (TnewLeft > newLeft + 18.9) {
                newLeft += 37.8;
            } else if (TnewLeft < newLeft - 18.9) {
                newLeft -= 37.8;
            }
            console.log(leftArea);
            console.log(newLeft);
            if (newLeft < leftArea * 3.78) {
                newLeft = leftArea * 3.78;
            }
            if (newLeft > (793.8 - (rightArea * 3.78))) {
                newLeft = rightEdge;
            }
            thumb[i].style.left = newLeft + 'px';
        }
        function onMouseUp() {
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('mousemove', onMouseMove);
            if (i == 1) {
                newLeft -= leftArea * 3.78;
                secondLine(newLeft);
            }
            else {
                newLeft -= leftArea * 3.78;
                firstLine(newLeft);
            }
        }
    };
    thumb[i].ondragstart = function () {
        return false;
    };
}
//Озучивание текста
function say(text) {
    responsiveVoice.speak(text, "Russian Female");
}
//Нажатие кнопки озвучивания
function sayText() {
    isListening = !isListening;
    if (isListening) {
        say(document.getElementById("mainText").textContent);
    }
    else {
        responsiveVoice.cancel();
    }
}
//Переход на списо документов
FileButton.addEventListener("click", function () {
    var savedText = window.localStorage.removeItem("savedText");
    let newEditor = window.open("list_document.html");
    newEditor.onload = function () {
        window.close();
    }
});
//Нажатие кнопки начала записи
function buttonStartRecording(event) {
    isRecording = !isRecording;
    if (isRecording) {
        isRecording = true;
        startRecording(false);
        event.attributes[0].nodeValue = "../img/stopRecord.svg";
    } else {
        isRecording = false;
        buttonStopRecording();
        event.attributes[0].nodeValue = "../img/startRecord.png";
    }
};
//Нажатие кнопки остановки записи
function buttonStopRecording(event) {
    stopRecording();
    create_wav();
    call_wit("speech");
    mainchannel = [];
    recorder = null;
    recordingLength = 0;
    volume = null;
    mediaStream = null;
    sampleRate = 44100;
    context = null;
    blob = null;
};
//Запись речи
function startRecording(isCommand) {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    navigator.getUserMedia(
        {
            audio: true
        },
        function (e) {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            context = new AudioContext();
            mediaStream = context.createMediaStreamSource(e);
            var bufferSize = 8192;
            var numberOfInputChannels = 1;
            var numberOfOutputChannels = 1;
            if (context.createScriptProcessor) {
                recorder = context.createScriptProcessor(bufferSize, numberOfInputChannels, numberOfOutputChannels);
            } else {
                recorder = context.createJavaScriptNode(bufferSize, numberOfInputChannels, numberOfOutputChannels);
            }
            let fl = [true, false];
            let countPause = 0;
            recorder.onaudioprocess = function (e) {
                mainchannel.push(new Float32Array(e.inputBuffer.getChannelData(0)));
                recordingLength += bufferSize;
                for (let t = 0; t < 8192; t++) {
                    if (Math.round((mainchannel[mainchannel.length - 1][t]) * 1000) / 1000 != 0) {
                        countPause++;
                    }
                    else {
                        fl[0] = true;
                    }
                }
                if(countPause > 10)
                {
                    countPause = 0;
                    fl[0] = false;
                    fl[1] = true;
                }
                if (fl[0] && fl[1] && !isCommand) {
                    create_wav();
                    call_wit("speech");
                    mainchannel = [];
                    recordingLength = 0;
                    blob = null;
                    fl[0] = false;
                    fl[1] = false;
                }
            }
            mediaStream.connect(recorder);
            recorder.connect(context.destination);
        },
        function (e) {
            console.error(e);
        });
}
//Остановка записи
function stopRecording() {
    recorder.disconnect(context.destination);
    mediaStream.disconnect(recorder);
}
//Отправка речи на распознавание
function call_wit(forWhat) {
    const uri = 'https://api.wit.ai/speech';
    const auth = 'Bearer ' + 'SLZSYB75DVIHHCGX7Q6TE4FDC7THYIF6';
    switch (forWhat) {
        case "speech":
            {
                const pl = fetch(uri, {
                    method: 'POST', headers: { 'Transfer-encoding': 'chunked', 'Content-Type': 'audio/wav', Authorization: auth },
                    body: blob
                })
                    .then(res => res.json())
                    .then(res => {
                        console.log(res.text);
                        if (res.text != undefined) {
                            checkSpell(res.text)
                        }
                    });
                break;
            }
        case "command":
            {
                const pl = fetch(uri, {
                    method: 'POST', headers: { 'Content-Type': 'audio/wav', Authorization: auth },
                    body: blob
                })
                    .then(res => res.json())
                    .then(res => executeCommand(res));
                break;
            }
    }
}
//Создание WAV-файла
function create_wav() {
    // we flat the left and right channels down
    // Float32Array[] => Float32Array
    var mainBuffer = flattenArray(mainchannel, recordingLength);
    // we interleave both channels together
    var interleaved = mainBuffer;
    // we create our wav file
    var buffer = new ArrayBuffer(44 + interleaved.length * 2);
    var view = new DataView(buffer);
    // RIFF chunk descriptor
    writeUTFBytes(view, 0, 'RIFF');
    view.setUint32(4, 44 + interleaved.length * 2, true);
    writeUTFBytes(view, 8, 'WAVE');
    // FMT sub-chunk
    writeUTFBytes(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // chunkSize
    view.setUint16(20, 1, true); // wFormatTag
    view.setUint16(22, 1, true); // wChannels
    view.setUint32(24, sampleRate, true); // dwSamplesPerSec
    view.setUint32(28, sampleRate * 4, true); // dwAvgBytesPerSec
    view.setUint16(32, 4, true); // wBlockAlign
    view.setUint16(34, 16, true); // wBitsPerSample
    // data sub-chunk
    writeUTFBytes(view, 36, 'data');
    view.setUint32(40, interleaved.length * 2, true);
    // write the PCM samples
    var index = 44;
    var volume = 1;
    for (var i = 0; i < interleaved.length; i++) {
        view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
        index += 2;
    }
    console.log(view);
    blob = new Blob([view], { type: 'audio/wav' });
}
//Форматирование массива речи
function flattenArray(channelBuffer, recordingLength) {
    var result = new Float32Array(recordingLength);
    var offset = 0;
    for (var i = 0; i < channelBuffer.length; i++) {
        var buffer = channelBuffer[i];
        result.set(buffer, offset);
        offset += buffer.length;
    }
    return result;
}
//Форматирование кодировки
function writeUTFBytes(view, offset, string) {
    for (var i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}
//Запись в буфер
function toBuffer(ab) {
    var buf = Buffer.alloc(ab.byteLength);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
}
//Разграничивание текста по страницам и сохранение полей
function preSaveText() {
    let allPages = document.getElementsByClassName("Text");
    let savedText = `${leftArea}/${rightArea}/${topArea}/${bottomArea}|`;
    for (let j = 0; j < allPages.length; j++) {
        savedText += allPages[j].innerHTML;
        savedText += "@@";
    }
    return savedText;
}
//Сохранить как
function saveCommandOne() {
    let name = prompt("Введите название файла");
    CURRENTDOC = name;
    fs.writeFileSync("./files/" + name, preSaveText());
    document.title = name;
}
//Сохранить
function saveCommand() {
    if (CURRENTDOC == "")
        saveCommandOne();
    else
        fs.writeFileSync("./files/" + CURRENTDOC, preSaveText());
}
//Озвучивание текста и кнопок
document.addEventListener('keyup', function (event) {
    if (event.key == 'Tab') {
        if (document.activeElement.tagName == "DIV")
            say(document.activeElement.textContent);
        if (document.activeElement.tagName == "INPUT")
            say(document.activeElement.value);
        if (document.activeElement.tagName == "IMG")
            say(document.activeElement.alt);
    }
});
//Ввод голосовой команды
EnterCommandButton.addEventListener("click", function () {
    isCommanding = !isCommanding;
    if (isCommanding) {
        startRecording(true);
    } else {
        stopRecording();
        create_wav();
        call_wit("command");
        mainchannel = [];
        recorder = null;
        recordingLength = 0;
        volume = null;
        mediaStream = null;
        sampleRate = 44100;
        context = null;
        blob = null;
    }
});
//Выполнение голосовой команды
function executeCommand(command) {
    switch (command.intents[0].name) {
        case "OneWord":
            {
                selectText(selectionText(command.text, 1));
                break;
            }
        case "GroupWords":
            {
                selectText(selectionText(command.text, 2));
                break;
            }
        case "ColorText":
            {
                changeColorText();
                break;
            }
        case "ToLeft":
            {
                textToLeft();
                break;
            }
        case "ToRight":
            {
                textToRight();
                break;
            }
        case "ToCenter":
            {
                textToCenter();
                break;
            }
        case "ToEver":
            {
                textToEver();
                break;
            }
        case "Bold":
            {
                textBold();
                break;
            }
        case "Italic":
            {
                textItalic();
                break;
            }
        case "Underline":
            {
                textUnderline();
                break;
            }
    }
}
//Поиск и выделение текста
function selectionText(text, param) {
    switch (param) {
        case 1:
            {
                const result = text.substring(text.lastIndexOf(" "), text.length);
                return result;
            }
        case 2:
            {
                const endWord = text.substring(text.lastIndexOf(" "), text.length);
                const strTemp = text.substring(0, text.lastIndexOf(" "));
                const startWord = strTemp.substring(strTemp.lastIndexOf(" "), text.length);
                let selectedString = mainText.textContent.substring(mainText.textContent.indexOf(startWord) + 1, mainText.textContent.indexOf(endWord) + (endWord.length));
                return selectedString;
            }
    }
}
//Подчеркивание текста
UnderlineCommandButton.addEventListener("click", function () {
    document.execCommand('underline', false);
});
//Испольование жирности
BoldCommandButton.addEventListener("click", function () {
    document.execCommand('bold', false);
});
//Выравнивание по ширине
ToEverCommandButton.addEventListener("click", function () {
    document.execCommand('justifyFull', false);
    textToEver();
});
//Выравнивание по центру
ToCenterCommandButton.addEventListener("click", function () {
    document.execCommand('justifyCenter', false);
});
//Выравнивание по левому краю
ToLeftCommandButton.addEventListener("click", function () {
    document.execCommand('justifyLeft', false);
});
//Выравнивание по правому краю
ToRightCommandButton.addEventListener("click", function () {
    document.execCommand('justifyRight', false);
});
//Применение курсива
CurveCommandButton.addEventListener("click", function () {
    document.execCommand('italic', false);
});
//Добавление ненумерованного списка
ULCommandButton.addEventListener("click", function () {
    document.execCommand('insertUnorderedList', false);
});
//Добавление нумерованного списка
OLCommandButton.addEventListener("click", function () {
    document.execCommand('insertOrderedList', false);
});
//Поиск строки, сказанной голосом, в тексте
function selectText(workString) {
    window.getSelection().removeAllRanges();
    document.execCommand("removeFormat", false);
    let startIndexWorkString = mainText.innerText.indexOf(workString);
    var k = 0, fl = false, kprev = 0, nodeNeed;
    var range = new Range();
    recurFindChild(mainText, startIndexWorkString)
    range.setStart(nodeNeed, startIndexWorkString - kprev);
    k = 0, fl = false, kprev = 0, nodeNeed;
    recurFindChild(mainText, startIndexWorkString + workString.length)
    range.setEnd(nodeNeed, startIndexWorkString + workString.length - kprev);
    window.getSelection().addRange(range);
    function recurFindChild(elemCurrent, index) {
        for (let i = 0; i < elemCurrent.childNodes.length; i++) {
            if (fl)
                return;
            if (elemCurrent.childNodes[i].nodeName == "#text") {
                kprev = k;
                k += elemCurrent.childNodes[i].textContent.length;
                if (k > index) {
                    fl = true;
                    if (elemCurrent.childNodes[i].nodeName == "#text") {
                        nodeNeed = elemCurrent.childNodes[i];
                    }
                    else {
                        nodeNeed = elemCurrent.childNodes[i];
                    }
                }
            }
            else
                recurFindChild(elemCurrent.childNodes[i], index);
        }
    }
}
//Изменение шрифта
function changeFont() {
    let fontTemp = document.getElementById("fonts").value;
    document.execCommand('fontName', false, fontTemp);
}
//Изменение размера шрифта
function changeFontSize() {
    let tempSelection = selAreas.getRangeAt(0);
    console.log(selAreas);
    if(tempSelection.startOffset == tempSelection.endOffset)
    {
        console.log("bomb");
        let startPos=tempSelection.startOffset;
        let endPos=tempSelection.endOffset+1;

        if(tempSelection.startContainer.tagName == "DIV"){
            tempSelection.startContainer.innerHTML =
          tempSelection.startContainer.innerHTML.slice(0, startPos) +
          "&nbsp" +
          tempSelection.startContainer.innerHTML.slice(startPos);
            let range = new Range;
            range.setStart(tempSelection.startContainer, startPos);
            range.setEnd(tempSelection.endContainer, endPos);
            selAreas.removeAllRanges();
            selAreas.addRange(range);
        }
        else{
            tempSelection.startContainer.parentElement.innerHTML =
          tempSelection.startContainer.parentElement.innerHTML.slice(
            0,
            startPos
          ) +
          "&nbsp" +
          tempSelection.startContainer.parentElement.innerHTML.slice(startPos);
            let range = new Range;
            range.setStart(tempSelection.startContainer.childNodes[0], startPos);
            range.setEnd(tempSelection.endContainer.childNodes[0], endPos);
            selAreas.removeAllRanges();
            selAreas.addRange(range);
        }
    
        document.execCommand('fontSize', false, "1");
        let arr = document.getElementsByTagName("font");
        let fontSizeTemp = document.getElementById("fontSize").value;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].size == "1") {
                arr[i].removeAttribute("size");
                arr[i].style.fontSize = fontSizeTemp + "pt";
            }
        }
    }
    else
    {
        document.execCommand('fontSize', false, "1");
        let arr = document.getElementsByTagName("font");
        let fontSizeTemp = document.getElementById("fontSize").value;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].size == "1") {
                arr[i].removeAttribute("size");
                arr[i].style.fontSize = fontSizeTemp + "pt";
            }
        }
    }
}
//Применение жирности
function textBold() {
    document.execCommand('bold', false);
}
//Применение курсива
function textItalic() {
    document.execCommand('italic', false);
}
//Подчеркивание текста
function textUnderline() {
    document.execCommand('underline', false);
}
//Выравнивание по центру
function textToCenter() {
    document.execCommand('justifyCenter', false);
}
//Выравнивание по ширине
function textToEver() {
    document.execCommand('justifyFull', false);
}
//Открытие окна изменения полей документа
AreaButton.addEventListener("click", function () {
    let div = document.createElement("div");
    div.className = "modal-div";
    div.id = "modal-div__area";
    div.innerHTML = `
        <div style='position: fixed; left:40vw; top:40vh; opacity: 1; background-color: white'>
            <div>
                <span>Левый отступ</span>
                <input type='text' id='Left' value='${leftArea}'>
            </div>
            <div>
                <span>Правый отступ</span>
                <input type='text' id='Right' value='${rightArea}'>
            </div>
            <div>
                <span>Верхний отступ</span>
                <input type='text' id='Top' value='${topArea}'>
            </div>
            <div>
                <span>Нижний отступ</span>
                <input type='text' id='Bottom' value='${bottomArea}'>
            </div>
            <input type='button' id='modal_areas_confirm' onclick='confirmAreas()' value='Подтвердить'>
        </div>
    `;
    document.body.append(div);
});
//Изменение полей документа
function confirmAreas() {
    leftArea = document.getElementById("Left").value;
    rightArea = document.getElementById("Right").value;
    topArea = document.getElementById("Top").value;
    bottomArea = document.getElementById("Bottom").value;
    let elements = document.getElementsByClassName("Text");
    for (let i = 0; i < elements.length; i++) {
        elements[i].style.paddingLeft = leftArea + "mm";
        elements[i].style.paddingRight = rightArea + "mm";
        elements[i].style.paddingTop = topArea + "mm";
        elements[i].style.paddingBottom = +(+(bottomArea) + 3) + "mm";
    }
    document.getElementById("modal-div__area").remove();
}
//Открытие окна печати
function PrintElem(elem) {
    var mywindow = window.open('', 'my div', 'height=1080,width=1920');
    mywindow.document.write('<html><head><title></title>');
    mywindow.document.write('<link rel="stylesheet" href="../styles/print.css">');
    mywindow.document.write('</head><body>');
    let ar = document.getElementsByClassName("Text");
    console.log(ar);
    for (let i = 0; i < ar.length; i++) {
        mywindow.document.write(`<div style = "${ar[i].attributes[2].nodeValue} box-sizing: border-box;">` + ar[i].innerHTML + "</div>");
    }
    mywindow.document.write('</body></html>');
    setTimeout(() => { mywindow.print(); mywindow.close(); }, 500);
}
//Сохранение выделенного текста
function prefirstLine() {
    selAreas = document.getSelection();
    console.log(selAreas);
}
//Поиск внешнего контейнера абзаца
function findDiv(node) {
    if (node.nodeName == "DIV") {
        return node;
    } else {
        return findDiv(node.parentElement);
    }
}
//Поиск всех выделенных абзацев
function findFocusNodeFirst(node, focusNode, value) {
    if (node === focusNode) {
        node.style.textIndent = ((+value / 37.8) * 10) + "mm";
        return
    }
    else {
        node.style.textIndent = ((+value / 37.8) * 10) + "mm";
        findFocusNodeFirst(node.nextSibling, focusNode, value);
    }
}
function findFocusNodeSecond(node, focusNode, value) {
    if (node === focusNode) {
        node.style.paddingLeft = ((+value / 37.8) * 10) + "mm";
        return
    }
    else {
        node.style.paddingLeft = ((+value / 37.8) * 10) + "mm";
        findFocusNodeSecond(node.nextSibling, focusNode, value);
    }
}
//Именение отступа первой строки абзаца
function firstLine(value) {
    let RangeAreas = selAreas.getRangeAt(0)
    findFocusNodeFirst(findDiv(RangeAreas.startContainer), findDiv(RangeAreas.endContainer), value);
}
//Изменение отступа всего абзаца
function secondLine(value) {
    let RangeAreas = selAreas.getRangeAt(0)
    findFocusNodeSecond(findDiv(RangeAreas.startContainer), findDiv(RangeAreas.endContainer), value);
}
function takechanges() {

}
//Добавление/удаление страниц
document.body.addEventListener("keydown", function () {
    let elements = Array.prototype.slice.call(document.getElementsByClassName("Text"));
    for (let y = 0; y < elements.length; y++) {
        elements[y].addEventListener("keydown", function (event) {
            let elem = document.getElementsByClassName("Text");
            for (let t = 0; t < elem.length; t++) {
                if (elem[t].scrollHeight > (elem[t].clientHeight)) {
                    let div = document.createElement("div");
                    div.className = 'Text';
                    div.style = `height: 297mm; width: 210mm; padding-left: ${leftArea}mm; 
                    padding-right: ${rightArea}mm; padding-top: ${topArea}mm;
                    padding-bottom: ${bottomArea}mm;`;
                    div.contentEditable = "true";
                    div.innerHTML = "<div><br></div><div><br></div><div><br></div>";
                    elem[t].after(div);
                    elem[t].lastChild.remove();
                    div.focus();
                    div.addEventListener("onfocus", takechanges());
                    div.addEventListener("onmouseup", prefirstLine());
                }
                for (let i = 0; i < t + 1; i++) {
                    if (elem[i].scrollHeight > (elem[i].clientHeight) && event.key != "Backspace") {
                        elem[i + 1].focus();
                    }
                    if (elem[i].innerText.length <= 1 && elem.length > 1) {
                        elem[i].remove();
                        console.log("remove");
                    }
                }
            }
        });
    }
});
//Перевод из системы Hex в RGBA
function hexToRgbA(hex) {
    var c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length == 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',1)';
    }
    throw new Error('Bad Hex');
}
//Открытие окна выбора цвета текста
function fontColorCustom() {
    document.getElementById("head").hidden = "false";
    document.getElementById("head").click();
}
//Изменение цвета текста
document.getElementById("head").addEventListener("input", function () {
    let rgba = hexToRgbA(document.getElementById("head").value);
    console.log(rgba);
    document.execCommand('foreColor', false, `${rgba}`);
});