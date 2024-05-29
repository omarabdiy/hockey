document.addEventListener('DOMContentLoaded', () => {
    let teams = [];

    // Carica i dati dal file JSON
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            teams = data;
            console.log('Teams loaded from JSON file:', teams);
            initializeApp();
        })
        .catch(error => {
            console.error('Error loading teams:', error);
        });

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

    let currentTeam = null;
    let shots = { goals: 0, misses: 0, hits: 0 };
    let clickPosition = { x: 0, y: 0 };

    function initializeApp() {
        currentTeam = teams[0];
        updateTeamSelectOptions();
        updatePlayerList();
        updatePlayerSelectOptions();

        createTeamButton.addEventListener('click', () => {
            const teamName = prompt('Enter the name of the new team:');
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

        startMatchButton.addEventListener('click', () => {
            alert('Starting the match! Click on the hockey field to record shots.');
            clearField();
            hockeyField.addEventListener('click', onHockeyFieldClick);
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

            updateStats(player, shotType);
            updatePlayerList();
            shotPopup.style.display = 'none';
        });

        function onHockeyFieldClick(event) {
            clickPosition.x = event.clientX - hockeyField.getBoundingClientRect().left;
            clickPosition.y = event.clientY - hockeyField.getBoundingClientRect().top;
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
            teamSelect.value = currentTeam.name;
        }

        function updatePlayerList() {
            playerList.innerHTML = '';
            currentTeam.players.forEach(player => {
                const playerInfo = document.createElement('div');
                playerInfo.classList.add('player-info');
                playerInfo.textContent = `${player.name} (#${player.jerseyNumber}, ${player.role}) - Shots: ${player.shots}, Goals: ${player.goals}, Misses: ${player.misses}`;
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
                Player: ${player.name}<br>
                Shot Type: ${shotType}<br><br>
                Statistics:<br>
                Goals: ${shots.goals}<br>
                Misses: ${shots.misses}<br>
                Hits: ${shots.hits}
            `;
        }

        function clearField() {
            const markers = document.querySelectorAll('.marker');
            markers.forEach(marker => marker.remove());
        }
    }
});

