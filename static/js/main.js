const teamsSection = document.getElementById('teams-section');
const teamRadioGroup = document.getElementById('team-radio-group');
const playersSection = document.getElementById('players-section');
const playerList = document.getElementById('player-list');
let playersCache = {};

const playerSearchBox = document.getElementById('player-search-box');
const searchResultsList = document.getElementById('search-results-list');

const sensitivityRadioGroup = document.getElementById('sensitivity-radio-group');
const sensitivityResultsList = document.getElementById('sensitivity-results-list');

// eDPI計算＋ソート（感度順用）
function calculateEdpiAndSort(players) {
    return players.map(player => {
        const dpi = typeof player.sensitivity_dpi === 'number' ? player.sensitivity_dpi : null;
        const inGameSens = typeof player.sensitivity_in_game === 'number' ? player.sensitivity_in_game : null;
        player.eDPI = (dpi !== null && inGameSens !== null) ? (dpi * inGameSens) : null;
        return player;
    }).sort((a, b) => {
        if (a.eDPI === null && b.eDPI === null) return 0;
        if (a.eDPI === null) return 1;
        if (b.eDPI === null) return -1;
        return a.eDPI - b.eDPI;
    });
}

// 名前順ソート
function sortByName(players) {
    return players.slice().sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
}

function updateTeams(selectedRegion) {
    playersSection.classList.add('hidden');
    teamsSection.classList.add('hidden');
    displayNewTeams(selectedRegion);
}

function displayNewTeams(selectedRegion) {
    teamRadioGroup.innerHTML = '';
    const filteredTeams = teams.filter(team => team.region === selectedRegion);
    if (filteredTeams.length > 0) {
        teamRadioGroup.innerHTML = filteredTeams.map(team => {
            return `
                <div class="radio-item">
                    <input type="radio" name="team" id="team_${team.id}" value="${team.id}">
                    <label for="team_${team.id}">
                        <img src="/static/images/teams/${team.image_file}" alt="${team.name} Logo" 
                             onerror="this.onerror=null;this.src='https://placehold.co/80x80/f7f9fc/0d1e3d?text=${team.name}';">
                        <span>${team.name}</span>
                    </label>
                </div>
            `;
        }).join('');

        document.querySelectorAll('input[name="team"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const selectedTeamId = e.target.value;
                updatePlayers(selectedTeamId);
            });
        });

        teamsSection.classList.remove('hidden');
        teamsSection.classList.add('fade-in');
    } else {
        teamsSection.classList.add('hidden');
    }
}

async function updatePlayers(selectedTeamId) {
    playerList.innerHTML = '';
    playersSection.classList.remove('hidden');
    playersSection.classList.add('fade-in');

    if (!selectedTeamId) {
        playerList.innerHTML = '<p>チームを選択してください...</p>';
        return;
    }

    if (playersCache[selectedTeamId]) {
        renderPlayerList(playersCache[selectedTeamId], playerList);
        return;
    }

    playerList.innerHTML = '<p>選手を読み込み中...</p>';
    try {
        const response = await fetch(`/api/teams/${selectedTeamId}/players`);
        let players = await response.json();
        players = sortByName(players); // チーム別は名前順に変更
        playersCache[selectedTeamId] = players;
        renderPlayerList(players, playerList);
    } catch (error) {
        console.error('Error fetching players:', error);
        playerList.innerHTML = '<p>選手の取得に失敗しました。</p>';
    }
}

function renderPlayerList(players, resultsContainer) {
    if (players.length > 0) {
        resultsContainer.innerHTML = players.map(player => {
            const dpi = (player.sensitivity_dpi ?? player.setting?.sensitivity_dpi) ?? '不明';
            const inGameSens = (player.sensitivity_in_game ?? player.setting?.sensitivity_in_game) ?? '不明';

            const sensitivityInfo =
                (dpi !== '不明' && inGameSens !== '不明') ? `DPI${dpi} ${inGameSens}` : '';

            return `
                <div class="player-list-item" onclick="window.location.href='/players/${encodeURIComponent(player.name)}'">
                    <span>${player.name}</span>
                    <span style="font-size: 0.9em; color: #666;">${sensitivityInfo}</span>
                </div>
            `;
        }).join('');
    } else {
        resultsContainer.innerHTML = '<p>選手が見つかりませんでした。</p>';
    }
}

// 🔹 検索ボックス（先頭一致優先 → サーバー順を保持）
playerSearchBox.addEventListener('input', async (e) => {
    const query = e.target.value.trim();

    if (query.length > 0) {
        searchResultsList.innerHTML = '<p>検索中...</p>';
        try {
            const response = await fetch(`/api/players/search?query=${encodeURIComponent(query)}`);
            let players = await response.json();
            // サーバーが先頭一致優先で返しているので、ここで並び替えしない
            renderPlayerList(players, searchResultsList);
        } catch (error) {
            console.error('Error fetching search results:', error);
            searchResultsList.innerHTML = '<p>検索結果の取得に失敗しました。</p>';
        }
    } else {
        searchResultsList.innerHTML = '<p>検索結果はここに表示されます。</p>';
    }
});

// 感度検索（感度順ソートあり）
sensitivityRadioGroup.addEventListener('change', async (e) => {
    const sensitivityType = e.target.value;
    sensitivityResultsList.innerHTML = '<p>検索中...</p>';
    try {
        const response = await fetch(`/api/players/sensitivity_search?type=${encodeURIComponent(sensitivityType)}`);
        let players = await response.json();
        players = calculateEdpiAndSort(players);
        renderPlayerList(players, sensitivityResultsList);
    } catch (error) {
        console.error('Error fetching sensitivity search results:', error);
        sensitivityResultsList.innerHTML = '<p>感度検索結果の取得に失敗しました。</p>';
    }
});

const regionRadios = document.querySelectorAll('input[name="region"]');
regionRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        updateTeams(e.target.value);
    });
});
