var io = require('socket.io-client');
var ss = require('socket.io-stream');
const fs = require('fs');
var es = require('event-stream')
const util = require('util');
let wav = require('node-wav');
const stream2 = require('stream');

var botId = 1456465445;
var sessionId = 54654544;
//http://35.192.81.1:3004
var socket = io.connect("http://35.192.81.1:3004", {
    'reconnection': true,
    'reconnectionDelay': 1000,
    'reconnectionDelayMax': 5000,
    'reconnectionAttempts': 3,
    timeout: 5000,
    // transports: ['websocket'],
    upgrade: false
});
var stream = ss.createStream();
var filename = './welcome.wav';

var writeStream = fs.createWriteStream('./output.wav');

let buffer = fs.readFileSync('one.wav');
let result = wav.decode(buffer);
console.log(result.sampleRate);
// console.log(downsampleBuffer(buffer, 44100, 16000));

socket.emit('session_init', { botId, sessionId });
socket.on('session_init', function (data) {
    console.log('session_init reply', data)
    if (data.status == 'S001') {
        // socket.emit('textData', { inputMode: 'VOICE', outputMode: 'VOICE', greeting: true })

        // console.log('block', left16)
        // socket.emit('stream_user', left16)
        fs.createReadStream(filename).pipe(es.map(function (block, callback) {
            // ss(socket).emit('sending', block);
            socket.emit('stream_user', block)
            // var left16 = downsampleBuffer(block, 44100, 16000);
            // ss(socket).emit('stream_user', block);
            callback(null, util.inspect(block, { colors: true, depth: null }) + '\n')
        }))//.pipe(process.stdout);
    }
});
socket.on('session_terminate', function (data) {
    console.log('session_terminate reply', data)
});

socket.on('stream_bot', function (data) {
    console.log('stream_bot', data);
    // stream2.pipe(writeStream).pipe(process.stdout);
    fs.appendFileSync('out.wav', data);
});

ss(socket).on('stream_bot', function (data) {
    // console.log('stream_bot', data);
    writeStream.emit(data)
    fs.writeFileSync('out.wav', data);
});

socket.on('textData', function (data) {
    console.log('textData', data);
});
socket.on('binaryData', function (data) {
    console.log('binaryData', data);
});
socket.on('error', console.error.bind(console));
socket.on('message', console.log.bind(console));

// ss(socket).emit('stream_user', stream, { name: filename });
// fs.createReadStream(filename).pipe(stream);
writeStream.on('error', function (err) {
    console.log('error', err);
});

setTimeout(() => {
    // socket.emit("end_voice_stream", { botId, sessionId });
    // socket.emit("session_terminate", { botId, sessionId });

}, 3000);

///////////


function downsampleBuffer(buffer, sampleRate, outSampleRate) {
    if (outSampleRate == sampleRate) {
        return buffer;
    }
    if (outSampleRate > sampleRate) {
        throw "downsampling rate show be smaller than original sample rate";
    }
    var sampleRateRatio = sampleRate / outSampleRate;
    var newLength = Math.round(buffer.length / sampleRateRatio);
    var result = new Int16Array(newLength);
    var offsetResult = 0;
    var offsetBuffer = 0;
    while (offsetResult < result.length) {
        var nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
        var accum = 0, count = 0;
        for (var i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
            accum += buffer[i];
            count++;
        }

        result[offsetResult] = Math.min(1, accum / count) * 0x7FFF;
        offsetResult++;
        offsetBuffer = nextOffsetBuffer;
    }
    return result.buffer;
}

// fs.createReadStream(filename).pipe(es.map(function (block, callback) {
//     // ss(socket).emit('sending', block);
//     // socket.emit('stream_user', block)
//     // ss(socket).emit('stream_user', left16);
//     callback(null, util.inspect(block, { colors: true, depth: null }) + '\n')

// }))//.pipe(process.stdout);