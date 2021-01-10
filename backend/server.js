const crypto = require('crypto');
//const ENC_KEY = "bf3c199c2470cb477d907b1e0917c17b"; // set random encryption key
const IV = "Agd34fg13KuKIL2$"; // set random initialisation vector
// ENC_KEY and IV can be generated as crypto.randomBytes(32).toString('hex');

//const phrase = "who let the dogs out";









const port = 4000
const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');
//const rateLimit = require('ws-rate-limit')('10s', 4)

const server = http.createServer();
const wss = new WebSocket.Server({ server });
var ips = []

wss.on('connection', function connection(ws, req) {
  console.log("connection from "+req.socket.remoteAddress);
  fs.appendFile("clogs.txt", req.socket.remoteAddress+`\n`, (err) => { if (err) throw err; })
  //rateLimit(ws);
  const ip = req.socket.remoteAddress;
  if (ips.includes(ip)) {
    //ws.close();
    ips.push(ip);
    //return;
  } else {
    ips.push(ip);
  }
  ws.on('message', function incoming(data) {
    console.log("recieved message")
    fs.appendFile("logs.txt", data+'\n', (err) => { if (err) throw err; })
    if (data.length > 400000) { return; }
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
	console.log(data)
       var a = data.split("|")
	console.log(a)
       console.log(a[0])
       console.log(a[0].substr(0,32))
	var ENC_KEY = a[0].substr(0,32)
var encrypt = ((val) => {
  let cipher = crypto.createCipheriv('aes-256-cbc', ENC_KEY, IV);
  let encrypted = cipher.update(val, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
});
	console.log(ENC_KEY+" < enc key")
	client.send(encrypt(data))

//client !== ws
      }
    });
  });
  ws.on('close', function close() {
    ips = ips.filter(item => item !== ip)
    console.log("disconnecting : "+ip)
  });
});

server.listen(port);