import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  remove,
  onValue,
  update,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const appSettings = {
  databaseURL:
    "https://map-of-members-25d50-default-rtdb.europe-west1.firebasedatabase.app/",
};

const app = initializeApp(appSettings);
const database = getDatabase(app);
const WeAreTheChampionsDB = ref(database, "WeAreTheChampions");

const endorsementFieldEl = document.getElementById("endorsement-field");
const fromFieldEl = document.getElementById("from-field");
const toFieldEl = document.getElementById("to-field");
const publishButtonEl = document.getElementById("publish-button");
const endorsementsEl = document.getElementById("endorsements");

let lastChangeWasUpdate = false;
let endorsementsArray;

onValue(WeAreTheChampionsDB, function (snapshot) {
  if (!lastChangeWasUpdate) {
    endorsementsEl.innerHTML = "";
    if (snapshot.val()) {
      endorsementsArray = Object.entries(snapshot.val());
      console.log(endorsementsArray);
      if (endorsementsArray.length > 0) {
        for (let i = endorsementsArray.length - 1; i >= 0; i--) {
          let endorsementArray = endorsementsArray[i];
          addEndorsement(endorsementArray, i);
        }
      }
    }
  }
});

function addEndorsement(endorsementArray, indexNumber) {
  let endorsementID = endorsementArray[0];
  let thisEndorsement = endorsementArray[1];
  let newEl = document.createElement("div");
  newEl.classList.add("endorsement");
  newEl.innerHTML = buildEndorsementHTML(thisEndorsement);
  newEl.addEventListener("click", function () {
    let exactLocationOfEndorsementInDB = ref(
      database,
      `WeAreTheChampions/${endorsementID}`
    );
    thisEndorsement.loveCount++;
    // Update the count in the web page
    newEl.innerHTML = buildEndorsementHTML(thisEndorsement);
    // Update the database and set the flag to not redraw the screen
    lastChangeWasUpdate = true; // This must come before the update line
    update(exactLocationOfEndorsementInDB, thisEndorsement);
  });
  newEl.addEventListener("dblclick", function () {
    let exactLocationOfEndorsementInDB = ref(
      database,
      `WeAreTheChampions/${endorsementID}`
    );
    lastChangeWasUpdate = false; // This must come before the remove line
    remove(exactLocationOfEndorsementInDB);
  });
  endorsementsEl.append(newEl);
}

function buildEndorsementHTML(thisEndorsement) {
  return (
    `<span class="fromToFont">From ${thisEndorsement.fromString}</span>` +
    `<br><br>${thisEndorsement.endorsementString}<br><br>` +
    `<p class="fromToFont">To ${thisEndorsement.toString}` +
    `<span class="loveCount">❤ ${thisEndorsement.loveCount}</span></p>`
  );
}

publishButtonEl.addEventListener("click", function () {
  let endorsementFieldValue = endorsementFieldEl.value;
  let fromFieldValue = fromFieldEl.value;
  let toFieldValue = toFieldEl.value;
  if (!endorsementFieldValue) {
    endorsementFieldEl.focus();
    endorsementFieldEl.classList.add("red");
  } else if (!fromFieldValue) {
    fromFieldEl.focus();
    fromFieldEl.classList.add("red");
  } else if (!toFieldValue) {
    toFieldEl.focus();
    toFieldEl.classList.add("red");
  } else {
    let entry = {
      endorsementString: endorsementFieldValue,
      fromString: fromFieldValue,
      toString: toFieldValue,
      loveCount: 0,
    };
    lastChangeWasUpdate = false; // This must come before the push line
    push(WeAreTheChampionsDB, entry);
    endorsementFieldEl.value = "";
    fromFieldEl.value = "";
    toFieldEl.value = "";
    endorsementFieldEl.classList.remove("red");
    fromFieldEl.classList.remove("red");
    toFieldEl.classList.remove("red");
  }
});
