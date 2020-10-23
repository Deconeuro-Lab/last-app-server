const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
io.origins('*:*');

const PORT = process.env.PORT || 4000;

const connectedPatients = {};
const connectedExaminers = {};

// console.clear();

const logClients = () => {
  // console.clear();
  console.log('Patients: ' + Object.keys(connectedPatients));
  console.log('Examiners: ' + Object.keys(connectedExaminers));
};

io.on('connection', (socket) => {
  console.log(`${socket.id} connected`);

  const sessionID = socket.id.substring(0, 5).toLowerCase(); // first 5 chars

  socket.on('patientRegistration', (firstName, lastName) => {
    connectedPatients[sessionID] = { firstName, lastName, socket };
    delete connectedExaminers[sessionID];
    logClients();
  });

  socket.on('examinerRegistration', (firstName, lastName) => {
    connectedExaminers[sessionID] = { firstName, lastName, socket };
    delete connectedPatients[sessionID];
    logClients();
  });

  socket.on('getPatientWithSessionID', (patientSessionID, examinerID, acknowledge) => {
    let patient = connectedPatients[patientSessionID];
    if (patient) {
      let firstName = patient.firstName;
      let lastName = patient.lastName;

      // notify patient
      patient.socket.emit('notify', examinerID);

      acknowledge({ firstName, lastName, patientSessionID });
    } else {
      acknowledge(null);
    }
  });

  socket.on('disconnect', () => {
    console.log(`${socket.id} disconnected`);

    delete connectedPatients[sessionID];
    delete connectedExaminers[sessionID];
    logClients();
  });
});

http.listen(PORT, () => {
  console.log('listening on port 4000');
});
