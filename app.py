from flask import Flask, render_template, abort, url_for, jsonify
import json
import os
import re
from urllib.parse import quote

app = Flask(__name__)

# JSONデータ読み込み
with open(os.path.join(app.root_path, './data/players.json'), encoding='utf-8') as f:
    players_data = json.load(f)

# チームリスト作成
teams = []
seen_teams = set()
for p in players_data:
    team_name = p.get("team")
    region = p.get("region")
    if team_name and team_name not in seen_teams:
        file_name = re.sub(r'[^a-z0-9_]', '', team_name.lower().replace(' ', '_').replace('.', '_'))
        teams.append({
            "id": team_name,
            "name": team_name,
            "region": region,
            "image_file": f"{file_name}.png"
        })
        seen_teams.add(team_name)

@app.route('/')
def index():
    ordered_regions = ["Pacific", "Americas", "EMEA", "China"]
    regions = [r for r in ordered_regions if any(t["region"] == r for t in teams)]
    return render_template(
        'index.html',
        regions=regions,
        teams=teams,
        last_updated="2025-08-14"
    )

@app.route('/players/<name>')
def player_detail(name):
    target_name = name.lower()
    player = next((p for p in players_data if p["name"].lower() == target_name), None)
    if not player:
        abort(404)
    return render_template('player_detail.html', player=player)

# チームの選手一覧（アルファベット順）
@app.route('/api/teams/<team_id>/players')
def api_team_players(team_id):
    filtered = [p for p in players_data if p.get("team") == team_id]
    filtered.sort(key=lambda x: x["name"].lower())
    return jsonify(filtered)

# 選手検索（先頭一致優先）
@app.route('/api/players/search')
def api_search_players():
    from flask import request, jsonify
    query = request.args.get("query", "").lower().strip()
    if not query:
        return jsonify([])

    # 1. 入力文字で始まる選手
    starts_with = [p for p in players_data if p["name"].lower().startswith(query)]
    # 2. 含まれる選手（ただし starts_with に含まれていないもの）
    contains = [p for p in players_data if query in p["name"].lower() and p not in starts_with]

    # 両方を結合して返す
    result = starts_with + contains
    return jsonify(result)

@app.route('/api/players/sensitivity_search')
def api_sensitivity_search():
    from flask import request, jsonify
    sens_type = request.args.get("type", "")
    result = []
    for p in players_data:
        dpi = p.get("sensitivity_dpi")
        in_game = p.get("sensitivity_in_game")
        if isinstance(dpi, (int, float)) and isinstance(in_game, (int, float)):
            edpi = dpi * in_game
            if sens_type == "low" and edpi <= 200:
                result.append(p)
            elif sens_type == "middle" and 200 < edpi < 400:
                result.append(p)
            elif sens_type == "high" and edpi >= 400:
                result.append(p)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
