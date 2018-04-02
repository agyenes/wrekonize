'use strict';

const video = document.querySelector('video');
const canvas = window.canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const button = document.querySelector('.button');
const resultsContainer = document.querySelector('.results-container');
const results = document.querySelector('.results');
const errorContainer = document.querySelector('.error-container');
const error = document.querySelector('.error');
const webcamDeniedContainer = document.querySelector('.webcam-denied');
const webcamAllowedContainer = document.querySelector('.webcam-allowed');
const capable = document.querySelector('.capable');
const notCapable = document.querySelector('.not-capable');
const apiNotAvailable = document.querySelector('.api-not-available');

(function detectEnviroment() {
    function evaluateEnviroment(result) {
        if (!result.checksPassed) {
            notCapable.style.display = 'block';
            capable.style.display = 'none';
        }
    }

    if (Realeyesit) {
        Realeyesit.EnvironmentalDetectionAPI.start(evaluateEnviroment);
        capable.style.display = 'block';
        showMedia(webcamAllowed, webcamNotAllowed);
    } else {
        apiNotAvailable.style.display = 'block';
    }
})()

function webcamAllowed(stream) {
    webcamAllowedContainer.style.display = 'flex';
    window.stream = stream; // make stream available to browser console
    video.srcObject = stream;
}

function webcamNotAllowed(error) {
    webcamDeniedContainer.style.display = 'block';
    webcamAllowedContainer.style.display = 'none';
}

function showMedia(success, error) {
    var constraints = {
        audio: false,
        video: true
    };
    navigator.mediaDevices.getUserMedia(constraints).
        then(success).catch(error);
}

button.onclick = function () {
    takePicture();
    const img = createImg();
    const blob = dataURItoBlob(img);
    connectApi(showResponse, blob);
}

function takePicture() {
    canvas.width = video.videoWidth * (video.height / video.videoHeight);
    canvas.height = video.height;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
}

function createImg() {
    return canvas.toDataURL('image/jpeg', 1.0)
}

function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
    }
    return new Blob([ab], { type: 'image/jpeg' });
}

function connectApi(callback, blob) {
    const fd = new FormData();
    fd.append('blob', blob);

    fetch('/api/pictures/Create/',
        {
            method: 'post',
            body: fd
        })
        .then(response => Promise.all([response, response.json()]))
        .then(([response, json]) => {
            if (response.status < 200 || response.status >= 300) {
                const error = new Error(json.message)
                error.response = response
                throw error
            }
            callback(json)
        })
        .catch(function(ex) {
            console.log('Unhandled Error! ', ex)
        })
}


///////

function isErrorInApi(data) {
    return data.message !== undefined;
}

function showResults(data) {
    resultsContainer.style.display = 'block';
    errorContainer.style.display = 'none';
    results.innerHTML = '';
    results.innerHTML += 'Number of faces: ' + data.length + '\n' +
        '---------------------' + '\n';

    Object.keys(data).forEach((face) => {
        results.innerHTML +=
            'face: ' + face + '\n' +
            'gender: ' + data[face].Gender.Value + '\n' +
            'ageRange: ' + data[face].AgeRange.Low + ' - ' + data[face].AgeRange.High + '\n' +
            '---------------------' + '\n'
    });
}

function showFaces(data) {
    const boundingBox = {
        'x': 0,
        'y': 0,
        'width': 0,
        'height': 0
    }
    Object.keys(data).forEach((face) => {
        boundingBox.x = data[face].BoundingBox.Left * canvas.width;
        boundingBox.y = data[face].BoundingBox.Top * canvas.height;
        boundingBox.width = data[face].BoundingBox.Width * canvas.width;
        boundingBox.height = data[face].BoundingBox.Height * canvas.height;
        ctx.rect(boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height);
        ctx.fillText('face: ' + face, boundingBox.x, boundingBox.y - 5);
        ctx.strokeStyle = '#56BB68';
        ctx.stroke();
    })
}

function showError(data) {
    errorContainer.style.display = 'block';
    resultsContainer.style.display = 'none';
    error.innerHTML = data.message;
}

function showResponse(data) {
    const response = data;
    const error = isErrorInApi(response);
    if (!error) {
        if (data.noface) {
            results.innerHTML = data.noface;
        } else {
            showResults(response);
            showFaces(response);
        }
    } else {
        showError(response)
    }
}