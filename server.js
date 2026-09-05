require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const moment = require('moment-timezone');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_FOOTBALL_KEY;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'zikopato2010@tv';

app.use(express.json());

// 🟢 هادي مهمة بزاف: كتقول لـ Render أي ملف ف public يقدر يتقرا مباشرة
app.use(express.static(path.join(__dirname, 'public')));

const STREAMS_FILE = path.join(__dirname, 'streams.json');

function loadSavedStreams() {
    try {
        if (fs.existsSync(STREAMS_FILE)) {
            const raw = fs.readFileSync(STREAMS_FILE, 'utf8');
            return JSON.parse(raw) || {};
        }
    } catch (e) { console.error(e.message); }
    return {};
}

function saveStreamsToFile(data) {
    try { fs.writeFileSync(STREAMS_FILE, JSON.stringify(data, null, 2), 'utf8'); } 
    catch (e) { console.error(e.message); }
}

let streamsDatabase = loadSavedStreams();
const CACHE_DURATION = 10 * 60 * 1000;
let cache = { today: { t: 0, data: null }, tomorrow: { t: 0, data: null }, yesterday: { t: 0, data: null } };
let API_BLOCKED = false;

const ALLOWED_LEAGUES = { 39:950, 140:950, 135:900, 78:900, 61:850, 2:1000, 3:900, 848:800, 1:1000, 4:950, 9:900, 6:900, 5:700, 45:600, 143:600, 137:600, 81:600, 66:600 };
const SECONDARY_LEAGUES = { 200:750, 307:700, 233:650, 94:500, 88:450, 13:600, 71:500 };
const VIP_TEAMS = ['wydad', 'raja', 'far rabat', 'rsb berkane', 'mas fez', 'al-hilal', 'al-nassr', 'al-ittihad', 'al-ahli', 'al ahly', 'zamalek', 'real madrid', 'barcelona', 'atletico madrid', 'manchester city', 'manchester united', 'liverpool', 'arsenal', 'chelsea', 'tottenham', 'juventus', 'inter', 'ac milan', 'milan', 'napoli', 'roma', 'bayern', 'dortmund', 'psg', 'marseille', 'monaco'];

function isVip(name) { return VIP_TEAMS.some(v => (name || '').toLowerCase().includes(v)); }
function isDirty(match) { return ['women', 'femenil', 'frauen', 'wsl', 'u15', 'u17', 'u19', 'u20', 'u21', 'u23', 'youth', 'reserve', 'friendly', 'esports', 'futsal'].some(w => `${match.league?.name} ${match.teams?.home?.name} ${match.teams?.away?.name}`.toLowerCase().includes(w)); }

function buildMatch(item) {
    const now = moment().tz('Africa/Casablanca');
    const matchTime = moment(item.fixture.date).tz('Africa/Casablanca');
    const diff = matchTime.diff(now, 'minutes');
    const st = item.fixture.status.short;
    const live = ['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE', 'INT'].includes(st);
    const finished = ['FT', 'AET', 'PEN', 'CANC', 'ABD'].includes(st) || diff < -150;

    let type, mainText, pillText, order;
    if (live) { type = 'live'; mainText = `${item.goals.home ?? 0} - ${item.goals.away ?? 0}`; pillText = `مباشر ${item.fixture.status.elapsed || ''}'`; order = 1; } 
    else if (finished) { type = 'finished'; mainText = `${item.goals.home ?? 0} - ${item.goals.away ?? 0}`; pillText = 'انتهت'; order = 4; } 
    else { type = 'upcoming'; mainText = matchTime.format('hh:mm A'); pillText = (diff >= 0 && diff <= 120) ? `بعد قليل ${diff}m` : 'لم تبدأ بعد'; order = 3; }

    const leagueId = item.league.id;
    let priority = ALLOWED_LEAGUES[leagueId] || SECONDARY_LEAGUES[leagueId] || 100;
    if (isVip(item.teams.home.name)) priority += 80;
    if (isVip(item.teams.away.name)) priority += 80;

    const matchId = String(item.fixture.id);
    return { id: matchId, league: item.league.name, home: item.teams.home.name, homeLogo: item.teams.home.logo, away: item.teams.away.name, awayLogo: item.teams.away.logo, mainText, pillText, type, ts: matchTime.valueOf(), order, priority, streams: streamsDatabase[matchId] || [] };
}

function filterMatches(fixtures) {
    let list = fixtures.filter(m => {
        if (isDirty(m)) return false;
        const id = m.league.id;
        return ALLOWED_LEAGUES.hasOwnProperty(id) || (SECONDARY_LEAGUES.hasOwnProperty(id) && (isVip(m.teams.home.name) || isVip(m.teams.away.name)));
    }).map(buildMatch);
    list.sort((a, b) => (a.order - b.order) || (b.priority - a.priority) || (a.ts - b.ts));
    return list.slice(0, 15);
}

function getMockData() {
    return [
        { id: "101", league: 'Serie A', home: 'Lecce', homeLogo: 'https://media.api-sports.io/football/teams/887.png', away: 'AS Roma', awayLogo: 'https://media.api-sports.io/football/teams/497.png', mainText: '0 - 3', pillText: "مباشر", type: 'live', order: 1, ts: Date.now(), streams: streamsDatabase["101"] || [] },
        { id: "102", league: 'La Liga', home: 'Real Madrid', homeLogo: 'https://media.api-sports.io/football/teams/541.png', away: 'Barcelona', awayLogo: 'https://media.api-sports.io/football/teams/529.png', mainText: '04:00 PM', pillText: 'بعد قليل 25m', type: 'upcoming', order: 2, ts: Date.now() + 1, streams: streamsDatabase["102"] || [] }
    ];
}

app.get('/api/matches', async (req, res) => {
    const day = req.query.day || 'today';
    const now = moment().tz('Africa/Casablanca');
    let date = now.format('YYYY-MM-DD');
    if (day === 'tomorrow') date = now.clone().add(1, 'day').format('YYYY-MM-DD');
    if (day === 'yesterday') date = now.clone().subtract(1, 'day').format('YYYY-MM-DD');

    streamsDatabase = loadSavedStreams();
    if (cache[day].data && Date.now() - cache[day].t < CACHE_DURATION) {
        let cData = cache[day].data;
        if (cData.matches) cData.matches.forEach(m => { m.streams = streamsDatabase[m.id] || []; });
        return res.json(cData);
    }

    if (API_BLOCKED || !API_KEY) {
        const payload = { success: true, isMock: true, day, date, count: getMockData().length, matches: getMockData() };
        cache[day] = { t: Date.now(), data: payload };
        return res.json(payload);
    }

    try {
        const response = await axios.get(`https://v3.football.api-sports.io/fixtures?date=${date}`, { headers: { 'x-apisports-key': API_KEY, 'x-rapidapi-host': 'v3.football.api-sports.io' }, timeout: 5000 });
        if (response.data.errors && Object.keys(response.data.errors).length) { API_BLOCKED = true; throw new Error('Limit'); }
        let list = filterMatches(response.data.response || []);
        if (!list.length) list = getMockData();
        const payload = { success: true, isMock: false, day, date, count: list.length, matches: list };
        cache[day] = { t: Date.now(), data: payload };
        return res.json(payload);
    } catch (e) {
        API_BLOCKED = true;
        const payload = { success: true, isMock: true, day, date, count: getMockData().length, matches: getMockData() };
        cache[day] = { t: Date.now(), data: payload };
        return res.json(payload);
    }
});

app.get('/api/match/:id', (req, res) => {
    const matchId = req.params.id;
    streamsDatabase = loadSavedStreams();
    
    let foundMatch = null;
    ['today', 'tomorrow', 'yesterday'].forEach(day => {
        if (cache[day] && cache[day].data && cache[day].data.matches) {
            const m = cache[day].data.matches.find(x => String(x.id) === matchId);
            if (m) foundMatch = m;
        }
    });

    if (!foundMatch) {
        const mock = getMockData().find(x => String(x.id) === matchId);
        if (mock) foundMatch = mock;
    }

    if (foundMatch) {
        foundMatch.streams = streamsDatabase[matchId] || [];
        return res.json({ success: true, match: foundMatch });
    }
    return res.status(404).json({ success: false, error: 'Match not found' });
});

app.post('/api/admin/streams', (req, res) => {
    const { matchId, streams } = req.body;
    streamsDatabase[String(matchId)] = streams;
    saveStreamsToFile(streamsDatabase);
    cache = { today: { t: 0, data: null }, tomorrow: { t: 0, data: null }, yesterday: { t: 0, data: null } };
    return res.json({ success: true });
});

app.post('/api/admin/login', (req, res) => {
    if (req.body?.password === ADMIN_PASSWORD) return res.json({ success: true });
    return res.status(401).json({ success: false });
});

// 🌐 ROUTES - برمجة صارمة لـ Linux / Render
app.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'site.html');
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.send(`<h1 style="color:white;background:black;padding:20px;">Error 404: The server works, but site.html is missing at ${filePath}</h1>`);
    }
});

app.get('/home', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(filePath)) res.sendFile(filePath);
    else res.send('Error: index.html not found');
});

app.get('/watch', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'watch.html');
    if (fs.existsSync(filePath)) res.sendFile(filePath);
    else res.send('Error: watch.html not found');
});

app.get('/admin', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'admin.html');
    if (fs.existsSync(filePath)) res.sendFile(filePath);
    else res.send('Error: admin.html not found');
});

// أي رابط آخر غير هادو، رجعو للصفحة الرئيسية
app.get('*', (req, res) => {
    res.redirect('/');
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));