
// Kreira se instanca klijenta koja je zapravo NULL
client = null;
connected = false;

// Funkcija koja se poziva pritiskom na dugme za povezivanje
function connect(){
    var hostname = 'broker.mqttdashboard.com'; //Unaprijed određeni poslužitelj (broker)
    var port = '8000'; //port
    var clientId = document.getElementById("ime").value; //Dohvaćanje imena korisnika
  
    client = new Paho.MQTT.Client(hostname, Number(port), clientId); //Kreiranje instance MQTT klijenta
    
    console.info('Connecting to Server: Hostname: ', hostname, '. Port: ', port, '. Client ID: ', clientId);

    // Postavljanje metoda koje će se koristiti kao event handleri za određene događaje
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    // Parametri koje funkcija za uspostavljanje veze poprima spremljeni u jednu varijablu
    var options = {
      invocationContext: {host : hostname, port: port, clientId: clientId},
      onSuccess: onConnect,
      onFailure: onFail
    };
    
    // Povezivanje klijenta
    client.connect(options);

}


// Event handler za uspješno povezivanje
function onConnect(context) {
  console.log("Client Connected");
  connected = true;
  var poruka = document.createElement('span');
  var korisnik = document.getElementById("ime").value;
  poruka.innerHTML = korisnik + ' se povezao! </span><br/>';
  var messages = document.getElementById("messages");
  messages.appendChild(poruka);
  setFormEnabledState(true);
}

// Event handler za neuspješno povezivanje
function onFail(context) {
  console.log("Failed to connect");
  connected = false;
  var poruka = document.createElement('span');
  poruka.innerHTML = 'Neuspješno povezivanje! </span><br/>';
  var messages = document.getElementById("messages");
  messages.appendChild(poruka);
  setFormEnabledState(false);
}

// Event handler za gubitak veze
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

// Event handler za pristiglu poruku
function onMessageArrived(message) {
  console.log('Message Recieved: Topic: ', message.destinationName, '. Payload: ', message.payloadString, '. QoS: ', message.qos);
  console.log(message);
  var messageTime = new Date().toISOString(); //timestamp primitka pristigle poruke
  var poruka = document.createElement('span'); //kreiranje html elementa sa sadržajem poruke
  poruka.innerHTML = 'Tema: ' + message.destinationName + '  |  ' + message.payloadString + '</span><br/>'; 
  var messages = document.getElementById("messages"); //dohvaćanje html elementa za prikazivanje poruka
  messages.appendChild(poruka); //dodavanje nove poruke html elementu predviđenom za prikaz pristiglih poruka
}


function connectionToggle(){
  if(connected){
    disconnect();
  } else {
    connect();
  }
}

// Metoda za ugasit vezu klijenta s poslužiteljem
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

// Postavlja html elemente da budu omogućeni ili neomogućeni
function setFormEnabledState(enabled){

    // Elementi za povezivanje ili gašenje veze
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

// Metoda za objavljivanje poruke
function publish(){
    var topic = document.getElementById("tema").value; //dohvaćanje naziva teme
    var topic1 = 'zavrsni_rad/' + topic + '/test'; //dodavanje prefiksa i sufiksa
    var korisnik = document.getElementById("ime").value; //dohvaćanje imena korisnika
    var qos = 2; //razina qos
    var message = document.getElementById("ulaz").value; //sadržaj poruke
    var poruka = korisnik + ':  ' + message; //poruka pripremljena za objavljivanje
    console.info('Publishing Message: Topic: ', topic1, '. QoS: ' + qos + '. Message: ', poruka);
    message = new Paho.MQTT.Message(poruka); //mqtt objekt poruke
    message.destinationName = topic1; //objektu dodana destinacija
    message.qos = Number(qos); //objektu određen qos
    client.send(message); //objavljivanje poruke
}

// Metoda za pretplaćivanje na tematsku skupinu
function subscribe(){
    var topic = document.getElementById("tema").value; //dohvaćanje naziva teme
    var topic1 = 'zavrsni_rad/' + topic + '/test'; //dodavanje prefiksa i sufiksa
    var qos = 2; //određivanje qos
    console.info('Subscribing to: Topic: ', topic1, '. QoS: ', qos);
    var poruka = document.createElement('span'); 
    var korisnik = document.getElementById("ime").value; //dohvaćanje imena korisnika
    poruka.innerHTML = korisnik + ' se pretplatio na ' + topic1 + '</span><br/>';
    var messages = document.getElementById("messages");
    messages.appendChild(poruka); //prikazivanje poruke o pretplaćivanju
    client.subscribe(topic1, {qos: Number(qos)}); //pretplaćivanje na tematsku skupinu
}

