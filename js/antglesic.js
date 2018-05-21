
// Create a client instance
client = null;
connected = false;

// called when the client connects
function onConnect(context) {
  // Once a connection has been made, make a subscription and send a message.
  console.log("Client Connected");
  connected = true;
  var poruka = document.createElement('span');
  var korisnik = document.getElementById("ime").value;
  poruka.innerHTML = korisnik + ' se povezao! </span><br/>';
  var messages = document.getElementById("messages");
  messages.appendChild(poruka);
  setFormEnabledState(true);
}

function onFail(context) {
  console.log("Failed to connect");
  connected = false;
  var poruka = document.createElement('span');
  poruka.innerHTML = 'Neuspješno povezivanje! </span><br/>';
  var messages = document.getElementById("messages");
  messages.appendChild(poruka);
  setFormEnabledState(false);
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("Connection Lost: " + responseObject.errorMessage);
    var poruka = document.createElement('span');
    poruka.innerHTML = 'Veza izgubljena! </span><br/>';
    var messages = document.getElementById("messages");
    messages.appendChild(poruka);
  }
  connected = false;
}

// called when a message arrives
function onMessageArrived(message) {
  console.log('Message Recieved: Topic: ', message.destinationName, '. Payload: ', message.payloadString, '. QoS: ', message.qos);
  console.log(message);
  var messageTime = new Date().toISOString();
  var poruka = document.createElement('span');
  poruka.innerHTML = 'Tema: ' + message.destinationName + '  |  ' + message.payloadString + '</span><br/>';
  var messages = document.getElementById("messages");
  messages.appendChild(poruka);
}

function connectionToggle(){
  if(connected){
    disconnect();
  } else {
    connect();
  }
}

function connect(){
    var hostname = 'broker.mqttdashboard.com';
    var port = '8000';
    var clientId = document.getElementById("ime").value;
  
    client = new Paho.MQTT.Client(hostname, Number(port), clientId);
    
    console.info('Connecting to Server: Hostname: ', hostname, '. Port: ', port, '. Client ID: ', clientId);

    // set callback handlers
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;


    var options = {
      invocationContext: {host : hostname, port: port, clientId: clientId},
      onSuccess: onConnect,
      onFailure: onFail
    };
    
    // connect the client
    client.connect(options);

}

function disconnect(){
    console.info('Disconnecting from Server');
    client.disconnect();
    connected = false;
    var poruka = document.createElement('span');
    poruka.innerHTML = 'Veza uništena! </span><br/>';
    var messages = document.getElementById("messages");
    messages.appendChild(poruka);
    setFormEnabledState(false);
}

// Sets various form controls to either enabled or disabled
function setFormEnabledState(enabled){

    // Connection Panel Elements
    if(enabled){
      document.getElementById("clientConnectButton").innerHTML = "Disconnect";
    } else {
      document.getElementById("clientConnectButton").innerHTML = "Connect";
    }
    document.getElementById("ime").disabled = enabled;
    document.getElementById("tema").disabled = !enabled;
    document.getElementById("ulaz").disabled = !enabled;
    document.getElementById("slanje").disabled = !enabled;
    document.getElementById("pretplata").disabled = !enabled;
}

function publish(){
    var topic = document.getElementById("tema").value;
    var topic1 = 'zavrsni_rad/' + topic + '/test';
    var korisnik = document.getElementById("ime").value;
    var qos = 2;
    var message = document.getElementById("ulaz").value;
    var poruka = korisnik + ':  ' + message;
    console.info('Publishing Message: Topic: ', topic1, '. QoS: ' + qos + '. Message: ', poruka);
    message = new Paho.MQTT.Message(poruka);
    message.destinationName = topic1;
    message.qos = Number(qos);
    client.send(message);
}


function subscribe(){
    var topic = document.getElementById("tema").value;
    var topic1 = 'zavrsni_rad/' + topic + '/test';
    var qos = 2;
    console.info('Subscribing to: Topic: ', topic1, '. QoS: ', qos);
    var poruka = document.createElement('span');
    var korisnik = document.getElementById("ime").value;
    poruka.innerHTML = korisnik + ' se pretplatio na ' + topic1 + '</span><br/>';
    var messages = document.getElementById("messages");
    messages.appendChild(poruka);
    client.subscribe(topic1, {qos: Number(qos)});
}

