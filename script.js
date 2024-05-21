// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getDatabase, ref, set, get, child, update } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBadeVqLzYNQ_5mSJzzai7XUUQ7c_F2oik",
    authDomain: "stats-a563e.firebaseapp.com",
    projectId: "stats-a563e",
    storageBucket: "stats-a563e.appspot.com",
    messagingSenderId: "38172856657",
    appId: "1:38172856657:web:b67254ec35646010178370",
    measurementId: "G-1GPB04G48C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

document.addEventListener('DOMContentLoaded', () => {
    const teams = [];
    const teamSelect = document.getElementById('teamSelect');
    const createTeamButton = document.getElementById('createTeamButton');
    const playerList = document.getElementById('playerList');
    const startMatchButton = document.getElementById('startMatchButton');
    const hockeyField = document.getElementById('hockeyField');
    const stats = document.getElementById('stats');
    const playerForm = document.getElementById('playerForm');
    const playerName = document.getElementById('playerName');
    const playerSurname = document.getElementById('playerSurname');
    const playerBirthdate = document.getElementById('playerBirthdate');
    const playerJerseyNumber = document.getElementById('playerJerseyNumber');
    const playerRole = document.getElementById('playerRole');
    const addPlayerButton = document.getElementById('addPlayerButton');
    const shotPopup = document.getElementById('shotPopup');
    const playerSelect = document.getElementById('playerSelect');
    const shotTypeSelect = document.getElementById('shotType');
    const saveShotButton = document.getElementById('saveShotButton');
    let currentTeam = null;
    let shots = { goals: 0, misses: 0, hits: 0 };
    let clickPosition = { x: 0, y: 0 };

    // Reference to the database
    const dbRef = ref(getDatabase());

    // Load teams from Firebase
    get(child(dbRef, `teams`)).then((snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            for (let key in data) {
                teams.push(data[key]);
            }
            if (teams.length > 0) {
                currentTeam = teams[0];
            }
            updateTeamSelectOptions();
            updatePlayerList();
        } else {
            console.log("No data available");
        }
    }).catch((error) => {
        console.error("Error loading teams:", error);
    });

    createTeamButton.addEventListener('click', () => {
        const teamName = prompt('Inserisci il nome della nuova squadra:');
        if (teamName) {
            const newTeam = { name: teamName, players: [] };
            teams.push(newTeam);
            currentTeam = newTeam;
            updateTeamSelectOptions();
            saveTeamsData();
        }
    });

    teamSelect.addEventListener('change', () => {
        const selectedTeamName = teamSelect.value;
        currentTeam = teams.find(team => team.name === selectedTeamName);
        updatePlayerList();
    });

    addPlayerButton.addEventListener('click', () => {
        const newPlayer = {
            name: playerName.value,
            surname: playerSurname.value,
            birthdate: playerBirthdate.value,
            jerseyNumber: playerJerseyNumber.value,
            role: playerRole.value,
            shots: 0,
            goals: 0,
            misses: 0
        };
        currentTeam.players.push(newPlayer);
        updatePlayerList();
        saveTeamsData();
    });

    startMatchButton.addEventListener('click', () => {
        alert('Avvio della partita! Clicca sul campo da hockey per segnare i tiri.');
        hockeyField.addEventListener('click', handleFieldClick);
    });

    saveShotButton.addEventListener('click', () => {
        const selectedPlayerName = playerSelect.value;
        const shotType = shotTypeSelect.value;
        const selectedPlayer = currentTeam.players.find(player => player.name === selectedPlayerName);
        if (shotType === 'G') {
            shots.goals++;
            selectedPlayer.goals++;
        } else if (shotType === 'X') {
            shots.misses++;
            selectedPlayer.misses++;
        } else if (shotType === 'H') {
            shots.hits++;
            selectedPlayer.shots++;
        }
        updatePlayerList();
        updateStats(selectedPlayer, shotType);
        const marker = document.createElement('div');
        marker.classList.add('marker');
        marker.classList.add(shotType === 'G' ? 'green' : shotType === 'X' ? 'red' : 'blue');
        marker.style.left = `${clickPosition.x}px`;
        marker.style.top = `${clickPosition.y}px`;
        hockeyField.appendChild(marker);
        shotPopup.style.display = 'none';
        saveTeamsData();
    });

    function handleFieldClick(event) {
        const rect = hockeyField.getBoundingClientRect();
        clickPosition = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        updatePlayerSelectOptions();
        shotPopup.style.display = 'block';
    }

    function updateTeamSelectOptions() {
        teamSelect.innerHTML = '';
        teams.forEach(team => {
            const option = document.createElement('option');
            option.value = team.name;
            option.textContent = team.name;
            teamSelect.appendChild(option);
        });
    }

    function updatePlayerList() {
        playerList.innerHTML = '';
        if (currentTeam) {
            currentTeam.players.forEach(player => {
                const playerInfo = document.createElement('div');
                playerInfo.classList.add('player-info');
                playerInfo.textContent = `${player.name} (#${player.jerseyNumber}, ${player.role}) - Tiri: ${player.shots}, Gol: ${player.goals}, Fuori: ${player.misses}`;
                playerList.appendChild(playerInfo);
            });
        }
    }

    function updatePlayerSelectOptions() {
        playerSelect.innerHTML = '';
        if (currentTeam) {
            currentTeam.players.forEach(player => {
                const option = document.createElement('option');
                option.value = player.name;
                option.textContent = `${player.name} (#${player.jerseyNumber})`;
                playerSelect.appendChild(option);
            });
        }
    }

    function updateStats(player, shotType) {
        stats.innerHTML = `
            Giocatore: ${player.name}<br>
            Tipo di tiro: ${shotType}<br><br>
            Statistiche:<br>
            Gol: ${shots.goals}<br>
            Tiri fuori: ${shots.misses}<br>
            Colpiti: ${shots.hits}
        `;
    }

    function saveTeamsData() {
        set(ref(database, 'teams'), teams)
            .then(() => {
                console.log('Dati salvati con successo nel database Firebase');
            })
            .catch((error) => {
                console.error('Errore nel salvataggio dei dati:', error);
            });
    }
});
