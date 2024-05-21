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

    // Load teams from JSON file
    fetch('data/teams.json')
        .then(response => response.json())
        .then(data => {
            teams.push(...data);
            if (teams.length > 0) {
                currentTeam = teams[0];
            }
            updateTeamSelectOptions();
            updatePlayerList();
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
        const data = JSON.stringify(teams);
        fetch('https://api.github.com/repos/{omarabdiy}/{hockey}/actions/workflows/save_data.yml/dispatches', {
            method: 'POST',
            headers: {
                'Authorization': `token ${OMAR}`, // You need to set this token
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ref: 'main',
                inputs: { data }
            })
        });
    }
});
