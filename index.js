
// Conexion a firebase
const firebaseConfig = {
  apiKey: "AIzaSyDPoYyORxac0mgrXCj7qdJ1485QBpC8MNc",
  authDomain: "baseballteammanager-539be.firebaseapp.com",
  projectId: "baseballteammanager-539be",
  storageBucket: "baseballteammanager-539be.appspot.com",
  messagingSenderId: "663442234546",
  appId: "1:663442234546:web:e7c28f8ecdf40ab8c57dab"
};
var app = firebase.initializeApp(firebaseConfig);
var db = firebase.firestore(app);

// helper para crear elemetos y adirle atributos
function myCreateAttr(element, attributes) {
  return Object.keys(attributes).reduce((addedAttr, key) => {
    addedAttr.setAttribute(key, attributes[key]);
    return addedAttr;
  }, element);
}

// manejador de radioInput
let team = "teamA";
const radioInput = (e) => {
  team = e.target.defaultValue;
};

function addPlayerToTeam() {
  const input = document.getElementById("playerName");
  if (input.value != "") {
    db.collection(team)
      .add({
        name: input.value,
      })
      .then(function (docRef) {
        alertAction("success", "Jugador Añadido con exito");
        console.log("Document written with ID: ", docRef.id);
      })
      .catch(function (error) {
        console.error("Error adding document: ", error);
      });
    input.value = "";
  } else {
    alertAction("danger", "El nombre no puede estar vacio");
  }
}

// inserta una alerta  con color y mensaje persanalizable
const players = { teamA: [], teamL: [] };
function alertAction(type, massage, time = 3000) {
  players.teamL = [];
  players.teamA = [];
  const alert = document.getElementById("alert");
  const activeAlert = myCreateAttr(document.createElement("div"), {
    class: `alert alert-${type}`,
    role: "alert",
  });
  activeAlert.innerHTML = massage;
  alert.appendChild(activeAlert);
  setTimeout(() => {
    activeAlert.remove();
  }, time);

  dataTableUdate("teamL");
  dataTableUdate();
}

// manejador de checkbox
function playersSelected(e, id) {
  let playerSelected;
  const idValue = e.target.id ? e.target.id : id;
  const value = e.target.value ? e.target.value : e;
  if (value === "teamA") {
    playerSelected = players.teamA;
  } else {
    playerSelected = players.teamL;
  }
  const index = playerSelected.findIndex((id) => id === idValue);
  if (index === -1) {
    playerSelected.push(idValue);
  } else {
    playerSelected.splice(index, 1);
  }
}

// mover los jugadores seleccionados de un equipo a otro
function movePlayersSelected(e) {
  let idsArray, teamLocation, teamC;
  const addToteam = e.target.value;
  if (addToteam === "teamA") {
    idsArray = players.teamL;
    teamLocation = "teamL";
  } else {
    idsArray = players.teamA;
    teamLocation = "teamA";
  }

  //   const collectins = db.collection(e.target.value);
  idsArray.forEach((id) => {
    db.collection(teamLocation)
      .doc(id)
      .get()
      .then((querySnapshot) => {
        db.collection(addToteam)
          .add({
            name: querySnapshot.data().name,
          })
          .then(() => {
            playerRemover(
              id,
              idsArray,
              teamLocation,
              "jugador/@s transferido/@s",
              3000
            );
          })
          .catch((error) => {
            console.log("no se encontro");
          });
      });
  });
}

// removedor de jugadores
function playerRemover(id, data, location, massage, time, type = "success") {
  let count = data.findIndex((index) => index === id);
  db.collection(location)
    .doc(id)
    .delete()
    .then(() => {
      if (count >= data.length - 1) {
        alertAction(type, massage, time);
      }
      count++;
    })
    .catch((error) => {
      console.error("Error removing document: ", error);
    });
}

// mover todos los jugadores de u lugar a otro
function moveAllPlayers(e) {
  const seurce = e.target.value === "allToA" ? "teamL" : "teamA";
  const destination = seurce === "teamA" ? "teamL" : "teamA";
  const data = [];
  db.collection(seurce)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        data.push(doc.id);
        db.collection(destination)
          .add({
            name: doc.data().name,
          })
          .then((docRef) => {
            playerRemover(
              doc.id,
              data,
              seurce,
              `Todos los jugadores se han movido a ${
                seurce === "teamL" ? "Las Aguilas" : "Licey"
              }`,
              3000
            );
          });
      });
    })
    .catch((error) => {
      console.log(error);
    });
}

// actuliza la tabla
function dataTableUdate(team = "teamA") {
  const idTable = team === "teamA" ? "teamA" : "teamL";
  db.collection(team)
    .get()
    .then((querySnapshot) => {
      const table = document.getElementById(idTable);
      table.innerHTML = ``;
      querySnapshot.forEach((doc) => {
        table.innerHTML += `
          <tr>
              <th scope="row">
              <input
                  type="checkbox"
                  id=${doc.id}
                  value=${idTable}
                  onclick=playersSelected(event)
                  aria-label="Checkbox for following text input"
              />
              </th>
              <td>${doc.data().name}</td>
          </tr>
          `;
      });
    });
}
dataTableUdate("teamL");
dataTableUdate();
