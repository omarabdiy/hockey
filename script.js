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

        playerDiv.appendChild(playerName);
        playerDiv.appendChild(addShotButton);

        playersList.appendChild(playerDiv);
    });
}

function recordShot(event) {
    const field = document.getElementById('hockeyField');
    const rect = field.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

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
        closeShotDialog();
    }
}
