let timerId = setTimeout(function tick() {
    let isFetch = false;
    //Проверка доступности сети Интернет
    fetch("https://google.com").then((response) => {
        console.log(response);
        let indLine = this.document.getElementById("indicatorLine");
        indLine.textContent = "В сети";
        let indlight = this.document.getElementById("indicatorLight");
        indlight.style.backgroundColor = "green";
        document.getElementById("enterId").hidden = false;
        isFetch = true;//Если есть связь
    }).catch((error) => {
        console.log(error);
        let indLine = this.document.getElementById("indicatorLine");
        indLine.textContent = "Не в сети";
        let indlight = this.document.getElementById("indicatorLight");
        indlight.style.backgroundColor = "red";
        document.getElementById("enterId").hidden = true;
        isFetch = true;//Если нет связи
    });
    timerId = setTimeout(tick, 2000);
}, 2000);
