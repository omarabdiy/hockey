document.addEventListener('DOMContentLoaded', () => {
    const teams = [
        {
            name: 'Squadra Default',
            players: [
                { name: 'Mario', surname: 'Rossi', birthdate: '1990-01-01', jerseyNumber: 10, role: 'Attaccante', shots: 0, goals: 0, misses: 0 }
            ]
        }
    ];

    const teamSelect = document.getElementById('teamSelect');
    const createTeamButton = document.getElementById('createTeamButton');
    const playerList = document.getElementById('playerList');
    const startMatchButton = document.getElementById('startMatchButton');
    const pauseMatchButton = document.getElementById('pauseMatchButton');
    const hockeyField = document.getElementById('hockeyField');
    const goalView = document.getElementById('goalView');
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
    const goalShotView = document.getElementById('goalShotView');

    let currentTeam = teams[0];
    let shots = { goals: 0, misses: 0, hits: 0 };
    let clickPosition = { x: 0, y: 0 };
    let shotTarget = null;
    let matchActive = false;
    const shotsData = [];
    let goalShotPosition = { x: 0, y: 0 }; // Variabile per memorizzare la posizione del tiro nella porta

    updateTeamSelectOptions();
    updatePlayerList();

    createTeamButton.addEventListener('click', () => {
        const teamName = prompt('Nome della squadra:');
        if (teamName) {
            const newTeam = { name: teamName, players: [] };
            teams.push(newTeam);
            updateTeamSelectOptions();
            teamSelect.value = teamName;
            currentTeam = newTeam;
            updatePlayerList();
        }
    });

    teamSelect.addEventListener('change', () => {
        currentTeam = teams.find(team => team.name === teamSelect.value);
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
        updatePlayerSelectOptions();
    });

    startMatchButton.addEventListener('click', () => {
        if (!matchActive) {
            alert('Avvio della partita! Clicca sul campo da hockey per segnare i tiri.');
            matchActive = true;
            hockeyField.addEventListener('click', handleFieldClick);
            goalView.addEventListener('click', handleGoalViewClick);
        }
    });

    pauseMatchButton.addEventListener('click', () => {
        if (matchActive) {
            matchActive = false;
            hockeyField.removeEventListener('click', handleFieldClick);
            goalView.removeEventListener('click', handleGoalViewClick);
            displayShotSelection();
        }
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

        shotsData.push({ player: selectedPlayer, shotType, position: clickPosition, goalPosition: goalShotPosition });

        updatePlayerList();
        updateStats(selectedPlayer, shotType);

        const marker = document.createElement('div');
        marker.classList.add('marker');
        marker.classList.add(shotType === 'G' ? 'green' : shotType === 'X' ? 'red' : 'blue');
        marker.style.left = `${clickPosition.x}px`;
        marker.style.top = `${clickPosition.y}px`;

        if (shotTarget === hockeyField) {
            hockeyField.appendChild(marker);
        } else if (shotTarget === goalView) {
            clearGoalView();
            goalView.appendChild(marker);
        }

        shotPopup.style.display = 'none';
    });

    goalShotView.addEventListener('click', event => {
        const rect = goalShotView.getBoundingClientRect();
        goalShotPosition = { x: event.clientX - rect.left, y: event.clientY - rect.top }; // Aggiornamento della variabile globale
        const marker = document.createElement('div');
        marker.classList.add('marker');
        marker.style.left = `${goalShotPosition.x}px`;
        marker.style.top = `${goalShotPosition.y}px`;
        goalShotView.appendChild(marker);
    });

    function handleFieldClick(event) {
        const rect = hockeyField.getBoundingClientRect();
        clickPosition = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        shotTarget = hockeyField;

        updatePlayerSelectOptions();
        shotPopup.style.display = 'block';
        clearGoalShotView();
    }

    function handleGoalViewClick(event) {
        const rect = goalView.getBoundingClientRect();
        clickPosition = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        shotTarget = goalView;

        updatePlayerSelectOptions();
        shotPopup.style.display = 'block';
        clearGoalShotView();
    }

    function clearGoalView() {
        while (goalView.firstChild) {
            goalView.removeChild(goalView.firstChild);
        }
    }

    function clearGoalShotView() {
        while (goalShotView.firstChild) {
            goalShotView.removeChild(goalShotView.firstChild);
        }
    }

    function displayShotSelection() {
        const playerName = prompt('Inserisci il nome del giocatore per vedere i tiri (lascia vuoto per vedere tutti):');
        clearGoalView();

        let shotsToDisplay = shotsData;
        if (playerName) {
            shotsToDisplay = shotsData.filter(shot => shot.player.name === playerName);
        }

        shotsToDisplay.forEach(shot => {
            const marker = document.createElement('div');
            marker.classList.add('marker');
            marker.classList.add(shot.shotType === 'G' ? 'green' : shot.shotType === 'X' ? 'red' : 'blue');
            marker.style.left = `${shot.position.x}px`;
            marker.style.top = `${shot.position.y}px`;

            marker.addEventListener('click, () => {
                clearGoalShotView();
                const goalMarker = document.createElement('div');
                goalMarker.classList.add('marker');
                goalMarker.style.left = `${shot.goalPosition.x}px`;
                goalMarker.style.top = `${shot.goalPosition.y}px`;
                goalShotView.appendChild(goalMarker);
            });

            hockeyField.appendChild(marker);
        });
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
        currentTeam.players.forEach(player => {
            const playerInfo = document.createElement('div');
            playerInfo.classList.add('player-info');
            playerInfo.textContent = `${player.name} (#${player.jerseyNumber}, ${player.role}) - Tiri: ${player.shots}, Gol: ${player.goals}, Fuori: ${player.misses}`;
            playerList.appendChild(playerInfo);
        });
    }

    function updatePlayerSelectOptions() {
        playerSelect.innerHTML = '';
        currentTeam.players.forEach(player => {
            const option = document.createElement('option');
            option.value = player.name;
            option.textContent = `${player.name} (#${player.jerseyNumber})`;
            playerSelect.appendChild(option);
        });
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
});
