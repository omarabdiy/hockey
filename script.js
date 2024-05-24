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
    const hockeyField = document.querySelector('.hockey-field');
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
    const arrowsContainer = document.getElementById('arrowsContainer');
    const showArrowsCheckbox = document.getElementById('showArrowsCheckbox');

    let currentTeam = teams[0];
    let shots = { goals: 0, misses: 0, hits: 0 };
    let clickPosition = { x: 0, y: 0 };
    let finalPosition = { x: 0, y: 0 };
    let isDrawing = false;
    let arrowStart = null;

    updateTeamSelectOptions();
    updatePlayerList();
    updatePlayerSelectOptions();

    createTeamButton.addEventListener('click', () => {
        const teamName = prompt('Inserisci il nome della nuova squadra:');
        if (teamName) {
            teams.push({ name: teamName, players: [] });
            updateTeamSelectOptions();
        }
    });

    teamSelect.addEventListener('change', () => {
        const selectedTeamName = teamSelect.value;
        currentTeam = teams.find(team => team.name === selectedTeamName);
        updatePlayerList();
        updatePlayerSelectOptions();
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

    function clearField() {
        const markers = document.querySelectorAll('.marker');
        markers.forEach(marker => marker.remove());
        arrowsContainer.innerHTML = '';
    }

    startMatchButton.addEventListener('click', () => {
        alert('Avvio della partita! Clicca sul campo da hockey per segnare i tiri.');
        clearField();
        hockeyField.addEventListener('mousedown', onHockeyFieldMouseDown);
        hockeyField.addEventListener('mousemove', onHockeyFieldMouseMove);
        hockeyField.addEventListener('mouseup', onHockeyFieldMouseUp);
    });

    saveShotButton.addEventListener('click', () => {
        const playerName = playerSelect.value;
        const shotType = shotTypeSelect.value;
        const player = currentTeam.players.find(p => p.name === playerName);

        if (shotType === 'G') {
            shots.goals++;
            player.goals++;
        } else if (shotType === 'X') {
            shots.misses++;
            player.misses++;
        } else if (shotType === 'H') {
            shots.hits++;
        }

        const marker = document.createElement('div');
        marker.classList.add('marker');
        marker.classList.add(shotType === 'G' ? 'green' : shotType === 'X' ? 'red' : 'blue');
        marker.style.left = `${clickPosition.x}px`;
        marker.style.top = `${clickPosition.y}px`;
        hockeyField.appendChild(marker);

        const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        arrow.setAttribute('class', 'arrow');
        arrow.setAttribute('x1', arrowStart.x);
        arrow.setAttribute('y1', arrowStart.y);
        arrow.setAttribute('x2', finalPosition.x);
        arrow.setAttribute('y2', finalPosition.y);

        const startDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        startDot.setAttribute('class', 'start-dot');
        startDot.setAttribute('cx', arrowStart.x);
        startDot.setAttribute('cy', arrowStart.y);
        startDot.setAttribute('r', '2');

        arrowsContainer.appendChild(arrow);
        arrowsContainer.appendChild(startDot);

        updateStats(player, shotType);
        updatePlayerList();
        shotPopup.style.display = 'none';
        isDrawing = false;
    });

    showArrowsCheckbox.addEventListener('change', () => {
        const arrows = document.querySelectorAll('.arrow');
        arrows.forEach(arrow => {
            arrow.classList.toggle('hidden', !showArrowsCheckbox.checked);
        });
    });

    function onHockeyFieldMouseDown(event) {
        isDrawing = true;
        arrowStart = {
            x: event.clientX - hockeyField.getBoundingClientRect().left,
            y: event.clientY - hockeyField.getBoundingClientRect().top
        };
    }

    function onHockeyFieldMouseMove(event) {
        if (isDrawing) {
            finalPosition = {
                x: event.clientX - hockeyField.getBoundingClientRect().left,
                y: event.clientY - hockeyField.getBoundingClientRect().top
            };
        }
    }

    function onHockeyFieldMouseUp(event) {
        if (isDrawing) {
            finalPosition = {
                x: event.clientX - hockeyField.getBoundingClientRect().left,
                y: event.clientY - hockeyField.getBoundingClientRect().top
            };
            updatePlayerSelectOptions();
            shotPopup.style.display = 'block';
        }
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
