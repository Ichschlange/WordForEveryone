'use strict';
var fs = require("fs");
const file_attach = document.getElementById('file_attach');
const fgh = document.getElementById('fg');
let array = [];
navigator.mediaDevices.getUserMedia({ audio: true}).then(stream => {
        const mediaRecorderCustom = new MediaRecorder(stream);
        document.querySelector('#start').addEventListener('click', function(){
            mediaRecorderCustom.start();
        });
        mediaRecorderCustom.addEventListener("dataavailable",function(event) {
            array.push(event.data);
        });

        document.querySelector('#stop').addEventListener('click', function(){
            mediaRecorderCustom.stop();
        });
        mediaRecorderCustom.addEventListener("stop", function() {
            var file = new File(array, "test.raw", {
                type: "audio/raw",
                lastModified: Date.now(),
            });
            console.log(array);
            console.log(file);
            var fileReader = new FileReader();
            fileReader.onload = function () {
                  fs.writeFileSync('test.raw', toBuffer(this.result));
            };
            fileReader.readAsArrayBuffer(file);
            const fi = fs.createReadStream("test.raw");
        const uri = 'https://api.wit.ai/speech';
        const auth = 'Bearer ' + 'SLZSYB75DVIHHCGX7Q6TE4FDC7THYIF6';
        
        const pl = fetch(uri, {method: 'POST', headers: {'Content-Type':'audio/raw;encoding=unsigned-integer;bits=16;rate=8000;endian=little', Authorization: auth},
            body: fi})
        .then(res => res.text())
        .then(res => document.querySelector('#TAM').value += res);
            array = [];
        });
});

function toBuffer(ab) {
  var buf = Buffer.alloc(ab.byteLength);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buf.length; ++i) {
      buf[i] = view[i];
  }
  return buf;
}
function toArrayBuffer(buf) {
    var ab = new ArrayBuffer(buf.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return ab;
}