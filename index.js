const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const connectedPatients = {};
const connectedExaminers = {};

console.clear();

const logClients = () => {
  console.clear();
  console.log('Patients: ' + Object.keys(connectedPatients));
  console.log('Examiners: ' + Object.keys(connectedExaminers));
};

io.on('connection', (socket) => {
  console.log(`${socket.id} connected`);

  const shortID = socket.id.substring(0, 5).toLowerCase(); // first 5 chars

  socket.on('patientRegistration', (firstName, lastName) => {
    connectedPatients[shortID] = { firstName, lastName, socket };
    delete connectedExaminers[shortID];
    logClients();
  });

  socket.on('examinerRegistration', (firstName, lastName) => {
    connectedExaminers[shortID] = { firstName, lastName, socket };
    delete connectedPatients[shortID];
    logClients();
  });

  socket.on('getPatientWithShortID', (shortID, examinerID, acknowledge) => {
    let patient = connectedPatients[shortID];
    if (patient) {
      let firstName = patient.firstName;
      let lastName = patient.lastName;

      // notify patient
      patient.socket.emit('notify', examinerID);

      acknowledge({ firstName, lastName, shortID });
    } else {
      acknowledge(null);
    }
  });

  socket.on('disconnect', () => {
    console.log(`${socket.id} disconnected`);

    delete connectedPatients[shortID];
    delete connectedExaminers[shortID];
    logClients();
  });
});

http.listen(4000, () => {
  console.log('listening on port 4000');
});
