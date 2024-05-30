document.addEventListener('DOMContentLoaded', () => {
    let teams = [];
    let matches = [];

    // Carica i dati dal file JSON
    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            teams = data.teams;
            matches = data.matches;
            console.log('Data loaded from JSON file:', { teams, matches });
            initializeApp();
        })
        .catch(error => {
            console.error('Error loading data:', error);
        });

    const teamSelect = document.getElementById('teamSelect');
    const createTeamButton = document.getElementById('createTeamButton');
    const matchSelect = document.getElementById('matchSelect');
    const createMatchButton = document.getElementById('createMatchButton');
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

    const downloadDataButton = document.getElementById('downloadDataButton');
    const uploadDataInput = document.getElementById('uploadDataInput');
    const uploadDataButton = document.getElementById('uploadDataButton');

    let currentTeam = null;
    let currentMatch = null;
    let shots = { goals: 0, misses: 0, hits: 0 };
    let clickPosition = { x: 0, y: 0 };

    function initializeApp() {
        if (teams.length > 0) {
            currentTeam = teams[0];
        }
        updateTeamSelectOptions();
        updatePlayerList();
        updatePlayerSelectOptions();
        updateMatchSelectOptions();

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

        createMatchButton.addEventListener('click', () => {
            const matchName = prompt('Inserisci il nome della nuova partita:');
            if (matchName) {
                matches.push({ name: matchName, team: currentTeam.name, shots: [] });
                updateMatchSelectOptions();
            }
        });

        matchSelect.addEventListener('change', () => {
            const selectedMatchName = matchSelect.value;
            currentMatch = matches.find(match => match.name === selectedMatchName);
            clearField();
            currentMatch.shots.forEach(shot => addShotMarker(shot.x, shot.y, shot.type));
            updateStats();
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
            alert('Avvio della partita! Clicca sul campo da hockey per segnare i tiri.');
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

            currentMatch.shots.push({ player: playerName, type: shotType, x: clickPosition.x, y: clickPosition.y });

            addShotMarker(clickPosition.x, clickPosition.y, shotType);
            updateStats(player, shotType);
            updatePlayerList();
            shotPopup.style.display = 'none';
        });

        downloadDataButton.addEventListener('click', saveData);

        uploadDataButton.addEventListener('click', () => {
            uploadDataInput.click();
        });

        uploadDataInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const uploadedData = JSON.parse(e.target.result);
                        teams = uploadedData.teams;
                        matches = uploadedData.matches;
                        if (teams.length > 0) {
                            currentTeam = teams[0];
                        }
                        if (matches.length > 0) {
                            currentMatch = matches[0];
                        }
                        updateTeamSelectOptions();
                        updatePlayerList();
                        updatePlayerSelectOptions();
                        updateMatchSelectOptions();
                    } catch (error) {
                        console.error('Error parsing uploaded file:', error);
                        alert('Errore nel caricamento del file. Assicurati che il file sia in formato JSON corretto.');
                    }
                };
                reader.readAsText(file);
            }
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
            if (currentTeam) {
                teamSelect.value = currentTeam.name;
            }
        }

        function updateMatchSelectOptions() {
            matchSelect.innerHTML = '';
            matches.forEach(match => {
                const option = document.createElement('option');
                option.value = match.name;
                option.textContent = match.name;
                matchSelect.appendChild(option);
            });
            if (currentMatch) {
                matchSelect.value = currentMatch.name;
            }
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

        function updateStats() {
            stats.innerHTML = `
                Partita: ${currentMatch.name}<br><br>
                Statistiche:<br>
                Gol: ${shots.goals}<br>
                Tiri fuori: ${shots.misses}<br>
                Colpiti: ${shots.hits}
            `;
        }

        function clearField() {
            const markers = document.querySelectorAll('.marker');
            markers.forEach(marker => marker.remove());
        }

        function addShotMarker(x, y, type) {
            const marker = document.createElement('div');
            marker.classList.add('marker');
            marker.classList.add(type === 'G' ? 'green' : type === 'X' ? 'red' : 'blue');
            marker.style.left = `${x}px`;
            marker.style.top = `${y}px`;
            hockeyField.appendChild(marker);
        }

        function saveData() {
            const data = {
                teams: teams,
                matches: matches
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'data.json';
            a.click();
            URL.revokeObjectURL(url);
        }
    }
});

