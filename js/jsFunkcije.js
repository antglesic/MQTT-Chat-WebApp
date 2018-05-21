
// Create a client instance
client = null;
connected = false;


// Things to do as soon as the page loads
document.getElementById("clientIdInput").value = makeid();

// called when the client connects
function onConnect(context) {
  // Once a connection has been made, make a subscription and send a message.
  console.log("Client Connected");
  connected = true;
  setFormEnabledState(true);
}

function onFail(context) {
  console.log("Failed to connect");
  connected = false;
  setFormEnabledState(false);
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("Connection Lost: " + responseObject.errorMessage);
  }
  connected = false;
}

// called when a message arrives
function onMessageArrived(message) {
  console.log('Message Recieved: Topic: ', message.destinationName, '. Payload: ', message.payloadString, '. QoS: ', message.qos);
  console.log(message);
  var messageTime = new Date().toISOString();
  // Insert into History Table
  var table = document.getElementById("incomingMessageTable").getElementsByTagName('tbody')[0];
  var row = table.insertRow(0);
  row.insertCell(0).innerHTML = message.destinationName;
  row.insertCell(1).innerHTML = safe_tags_regex(message.payloadString);
  
  var messages = document.getElementById("messages");
  messages.append('<span>Tema: ' + message.destinationName + '  | ' + message.payloadString + '</span><br/>');
}

function connectionToggle(){
  if(connected){
    disconnect();
  } else {
    connect();
  }
}

function connect(){
    var hostname = document.getElementById("hostInput").value;
    var port = document.getElementById("portInput").value;
    var clientId = document.getElementById("clientIdInput").value;
  
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
    document.getElementById("hostInput").disabled = enabled;
    document.getElementById("portInput").disabled = enabled;
    document.getElementById("clientIdInput").disabled = enabled;

    // Publish Panel Elements
    document.getElementById("publishTopicInput").disabled = !enabled;
    document.getElementById("publishQosInput").disabled = !enabled;
    document.getElementById("publishMessageInput").disabled = !enabled;
    document.getElementById("publishButton").disabled = !enabled;

    // Subscription Panel Elements
    document.getElementById("subscribeTopicInput").disabled = !enabled;
    document.getElementById("subscribeQosInput").disabled = !enabled;
    document.getElementById("subscribeButton").disabled = !enabled;
    document.getElementById("unsubscribeButton").disabled = !enabled;

}

function publish(){
    var topic = document.getElementById("publishTopicInput").value;
    var topic1 = 'zavrsni_rad/' + topic + '/test';
    var qos = document.getElementById("publishQosInput").value;
    var message = document.getElementById("publishMessageInput").value;
    console.info('Publishing Message: Topic: ', topic1, '. QoS: ' + qos + '. Message: ', message);
    message = new Paho.MQTT.Message(message);
    message.destinationName = topic1;
    message.qos = Number(qos);
    client.send(message);
}


function subscribe(){
    var topic = document.getElementById("subscribeTopicInput").value;
    var topic1 = 'zavrsni_rad/' + topic + '/test';
    var qos = document.getElementById("subscribeQosInput").value;
    console.info('Subscribing to: Topic: ', topic1, '. QoS: ', qos);
    client.subscribe(topic1, {qos: Number(qos)});
}

function unsubscribe(){
    var topic = document.getElementById("subscribeTopicInput").value;
    var topic1 = 'zavrsni_rad/' + topic + '/test';
    console.info('Unsubscribing from ', topic1);
    client.unsubscribe(1, {
         onSuccess: unsubscribeSuccess,
         onFailure: unsubscribeFailure,
         invocationContext: {topic : topic1}
     });
}


function unsubscribeSuccess(context){
    console.info('Successfully unsubscribed from ', context.invocationContext.topic);
}

function unsubscribeFailure(context){
    console.info('Failed to  unsubscribe from ', context.invocationContext.topic);
}

function clearHistory(){
    var table = document.getElementById("incomingMessageTable");
    //or use :  var table = document.all.tableid;
    for(var i = table.rows.length - 1; i > 0; i--)
    {
        table.deleteRow(i);
    }

}


// Just in case someone sends html
function safe_tags_regex(str) {
   return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}