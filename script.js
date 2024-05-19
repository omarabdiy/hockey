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

        const filterCheckbox = document.createElement('input');
        filterCheckbox.type = 'checkbox';
        filterCheckbox.id = `filterCheckbox${index}`;
        filterCheckbox.addEventListener('change', () => togglePlayerFilter(index));

        const filterLabel = document.createElement('label');
        filterLabel.textContent = 'Filter Shots';
        filterLabel.setAttribute('for', `filterCheckbox${index}`);

        const addShotButton = document.createElement('button');
        addShotButton.textContent = 'Add Shot';
        addShotButton.onclick = () => addShot(index);

        const viewStatsButton = document.createElement('button');
        viewStatsButton.textContent = 'View Stats';
        viewStatsButton.onclick = () => viewPlayerStats(index);

        playerDiv.appendChild(playerName);
        playerDiv.appendChild(filterCheckbox);
        playerDiv.appendChild(filterLabel);
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
    const overlay = document.getElementById('hockeyFieldOverlay');
    const rect = overlay.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width * 100;
    const y = (event.clientY - rect.top) / rect.height * 100;

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
        renderShots(); // Aggiunto per visualizzare i tiri sulla mappa principale
        closeShotDialog();
    }
}

function viewPlayerStats(playerIndex) {
    const player = players[playerIndex];
    const overlay = document.getElementById('playerStatsFieldOverlay');
    const field = document.getElementById('playerStatsField');
    const overlayRect = overlay.getBoundingClientRect();
    const fieldRect = field.getBoundingClientRect();
    const scaleX = overlayRect.width / fieldRect.width;
    const scaleY = overlayRect.height / fieldRect.height;
    const playerShotsList = document.getElementById('playerShotsList');

    clearPlayerStatsShots();

    player.shotDetails.forEach(shot => {
        const marker = document.createElement('div');
        marker.className = 'shot-marker';
        marker.style.left = `${shot.x * scaleX}px`;
        marker.style.top = `${shot.y * scaleY}px`;
        marker.textContent = shot.type === 'Goal' ? 'G' : (shot.type === 'On Target' ? 'X' : '-');
        overlay.appendChild(marker);
    });

    const playerShotsListItem = document.createElement('li');
    playerShotsListItem.textContent = `Player: ${player.name} - Shots: ${player.shots}`;
    playerShotsList.innerHTML = '';
    playerShotsList.appendChild(playerShotsListItem);

    openPlayerStatsDialog();
}

function clearPlayerStatsShots() {
    const markers = document.querySelectorAll('#playerStatsFieldOverlay .shot-marker');
    markers.forEach(marker => marker.remove());
}

function openPlayerStatsDialog() {
    const dialog = document.getElementById('playerStatsDialog');
    dialog.style.display = 'flex';
}

function closePlayerStatsDialog() {
    const dialog = document.getElementById('playerStatsDialog');
    dialog.style.display = 'none';
}

function clearShots() {
    const markers = document.querySelectorAll('.shot-marker');
    markers.forEach(marker => marker.remove());
}

function renderShots() {
    const overlay = document.getElementById('hockeyFieldOverlay');
    const field = document.getElementById('hockeyField');
    const overlayRect = overlay.getBoundingClientRect();
    const fieldRect = field.getBoundingClientRect();
    const scaleX = overlayRect.width / fieldRect.width;
    const scaleY = overlayRect.height / fieldRect.height;

    clearShots();
    players.forEach(player => {
        player.shotDetails.forEach(shot => {
            const marker = document.createElement('div');
            marker.className = 'shot-marker';
            marker.style.left = `${shot.x * scaleX}px`;
            marker.style.top = `${shot.y * scaleY}px`;
            marker.textContent = shot.type === 'Goal' ? 'G' : (shot.type === 'On Target' ? 'X' : '-');
            overlay.appendChild(marker);
        });
    });
}

function togglePlayerFilter(playerIndex) {
    const filterCheckbox = document.getElementById(`filterCheckbox${playerIndex}`);
    const isChecked = filterCheckbox.checked;

    if (isChecked) {
        filterPlayerShots(playerIndex);
    } else {
        renderShots();
    }
}

function filterPlayerShots(playerIndex) {
    const overlay = document.getElementById('hockeyFieldOverlay');
    const field = document.getElementById('hockeyField');
    const overlayRect = overlay.getBoundingClientRect();
    const fieldRect = field.getBoundingClientRect();
    const scaleX = overlayRect.width / fieldRect.width;
    const scaleY
