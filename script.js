document.addEventListener('DOMContentLoaded', () => {
    let teams = [];
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

    const githubUsername = 'omarabdiy';
    const repoName = 'hockey';
    const token = 'YOUR_PERSONAL_ACCESS_TOKEN'; // Inserisci qui il tuo token

    // Carica i dati dal file JSON
    fetch(`https://raw.githubusercontent.com/${githubUsername}/${repoName}/main/data.json`)
        .then(response => response.json())
        .then(data => {
            teams = data;
            console.log('Teams loaded from JSON file:', teams);
            initializeApp();
        })
        .catch(error => {
            console.error('Error loading teams:', error);
        });

    function initializeApp() {
        if (teams.length > 0) {
            currentTeam = teams[0];
        }
        updateTeamSelectOptions();
        updatePlayerList();
        updatePlayerSelectOptions();

        createTeamButton.addEventListener('click', () => {
            const teamName = prompt('Inserisci il nome della nuova squadra:');
            if (teamName) {
                teams.push({ name: teamName, players: [] });
                saveTeams();
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
            saveTeams();
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

            const marker = document.createElement('div');
            marker.classList.add('marker');
            marker.classList.add(shotType === 'G' ? 'green' : shotType === 'X' ? 'red' : 'blue');
            marker.style.left = `${clickPosition.x}px`;
            marker.style.top = `${clickPosition.y}px`;
            hockeyField.appendChild(marker);

            updateStats(player, shotType);
            saveTeams();
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
            if (currentTeam) {
                teamSelect.value = currentTeam.name;
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

        function clearField() {
            const markers = document.querySelectorAll('.marker');
            markers.forEach(marker => marker.remove());
        }

        function saveTeams() {
            const filePath = 'data.json';

            // Prima, ottieni l'SHA del file corrente
            fetch(`https://api.github.com/repos/${githubUsername}/${repoName}/contents/${filePath}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(response => response.json())
                .then(data => {
                    const sha = data.sha;
                    const content = btoa(JSON.stringify(teams));
                    const message = 'Update teams data';

                    // Poi, salva il nuovo contenuto
                    fetch(`https://api.github.com/repos/${githubUsername}/${repoName}/contents/${filePath}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            message: message,
                            content: content,
                            sha: sha
                        })
                    })
                        .then(response => response.json())
                        .then(data => {
                            console.log('Teams saved to GitHub:', data);
                        })
                        .catch(error => {
                            console.error('Error saving teams:', error);
                        });
                })
                .catch(error => {
                    console.error('Error retrieving file SHA:', error);
                });
        }
    }
});
