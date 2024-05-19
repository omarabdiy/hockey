const players = [];
let currentShot = null;

function addPlayer() {
    const playerNameInput = document.getElementById('playerNameInput');
    const playerName = playerNameInput.value.trim();

    if (playerName) {
        const player = {
            name: playerName,
            shots: 0,
            shotDetails: []
        };

        players.push(player);
        playerNameInput.value = '';
        renderPlayers();
    }
}

function addShot(index) {
    players[index].shots++;
    renderPlayers();
}

function renderPlayers() {
    const playersList = document.getElementById('playersList');
    playersList.innerHTML = '';

    players.forEach((player, index) => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player';

        const playerName = document.createElement('span');
        playerName.textContent = `${player.name} - Shots: ${player.shots}`;

        const addShotButton = document.createElement('button');
        addShotButton.textContent = 'Add Shot';
        addShotButton.onclick = () => addShot(index);

        const viewStatsButton = document.createElement('button');
        viewStatsButton.textContent = 'View Stats';
        viewStatsButton.onclick = () => viewPlayerStats(index);

        playerDiv.appendChild(playerName);
        playerDiv.appendChild(addShotButton);
        playerDiv.appendChild(viewStatsButton);

        playersList.appendChild(playerDiv);
    });
}

function startNewGame() {
    players.forEach(player => {
        player.shots = 0;
        player.shotDetails = [];
    });
    renderPlayers();
}

function recordShot(event) {
    const field = document.getElementById('hockeyField');
    const overlay = document.getElementById('hockeyFieldOverlay');
    const rect = field.getBoundingClientRect();
    const overlayRect = overlay.getBoundingClientRect();
    const x = event.clientX - rect.left - (overlayRect.left - rect.left);
    const y = event.clientY - rect.top - (overlayRect.top - rect.top);

    currentShot = { x, y };

    const playerSelect = document.getElementById('playerSelect');
    playerSelect.innerHTML = '';

    players.forEach((player, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = player.name;
        playerSelect.appendChild(option);
    });

    openShotDialog();
}

function renderShots() {
    const field = document.getElementById('hockeyField');
    const overlay = document.getElementById('hockeyFieldOverlay');
    const rect = field.getBoundingClientRect();
    const overlayRect = overlay.getBoundingClientRect();
    const fieldWidth = rect.width;
    const fieldHeight = rect.height;

    players.forEach(player => {
        player.shotDetails.forEach(shot => {
            const marker = document.createElement('div');
            marker.className = 'shot-marker';
            marker.style.position = 'absolute';

            // Calcola le coordinate corrette in base alle dimensioni del rettangolo sopra l'immagine
            const markerX = ((shot.x - rect.left) / fieldWidth) * 100 + '%';
            const markerY = ((shot.y - rect.top) / fieldHeight) * 100 + '%';
            marker.style.left = markerX;
            marker.style.top = markerY;

            // Imposta il testo del segno in base al tipo di tiro
            switch (shot.type) {
                case 'Goal':
                    marker.textContent = 'G';
                    break;
                case 'On Target':
                    marker.textContent = 'X';
                    break;
                case 'Off Target':
                    marker.textContent = 'O';
                    break;
                default:
                    marker.textContent = '-';
                    break;
            }

            // Aggiungi il segno al campo da hockey
            field.parentNode.appendChild(marker);
        });
    });
}


function openShotDialog() {
    const dialog = document.getElementById('shotDialog');
    dialog.style.display = 'flex';
}

function closeShotDialog() {
    const dialog = document.getElementById('shotDialog');
    dialog.style.display = 'none';
}

function saveShot() {
    const playerSelect = document.getElementById('playerSelect');
    const shotType = document.getElementById('shotType').value;
    const playerIndex = playerSelect.value;

    if (playerIndex !== '' && currentShot) {
        const player = players[playerIndex];
        player.shots++;
        player.shotDetails.push({ ...currentShot, type: shotType });
        renderPlayers();
        closeShotDialog();
    }
}

function viewPlayerStats(playerIndex) {
    const player = players[playerIndex];
    const playerStatsField = document.getElementById('playerStatsField');
    const playerShotsList = document.getElementById('playerShotsList');

    playerStatsField.parentNode.removeChild(playerStatsField); // Remove previous canvas if any

    const newField = document.createElement('img');
    newField.src = 'hockey_field.png';
    newField.id = 'playerStatsField';
    newField.style.position = 'relative';
    newField.style.width = '100%';

    const fieldContainer = document.getElementById('playerStatsFieldContainer');
    fieldContainer.innerHTML = '';
    fieldContainer.appendChild(newField);

    player.shotDetails.forEach(shot => {
        const marker = document.createElement('div');
        marker.className = 'shot-marker';
        marker.style.position = 'absolute';
        marker.style.left = `${shot.x}px`;
        marker.style.top = `${shot.y}px`;
        marker.textContent = shot.type;

        newField.parentNode.appendChild(marker);
    });

    const playerShotsListItem = document.createElement('li');
    playerShotsListItem.textContent = `Player: ${player.name} - Shots: ${player.shots}`;
    playerShotsList.innerHTML = '';
    playerShotsList.appendChild(playerShotsListItem);

    openPlayerStatsDialog();
}

function openPlayerStatsDialog() {
    const dialog = document.getElementById('playerStatsDialog');
    dialog.style.display = 'flex';
}

function closePlayerStatsDialog() {
    const dialog = document.getElementById('playerStatsDialog');
    dialog.style.display = 'none';
}

