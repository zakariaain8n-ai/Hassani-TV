require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const moment = require('moment-timezone');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = (process.env.API_FOOTBALL_KEY || '').trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const STREAMS_FILE = path.join(__dirname, 'streams.json');
const CACHE_MS = 10 * 60 * 1000; // 10 minutes
const TZ = 'Africa/Casablanca';

function loadStreams() {
  try {
    if (fs.existsSync(STREAMS_FILE)) {
      return JSON.parse(fs.readFileSync(STREAMS_FILE, 'utf8') || '{}');
    }
  } catch (e) {
    console.error('streams.json read error:', e.message);
  }
  return {};
}

function saveStreams(data) {
  try {
    fs.writeFileSync(STREAMS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('streams.json write error:', e.message);
  }
}

let streamsDB = loadStreams();
let cache = {
  today: { t: 0, data: null },
  tomorrow: { t: 0, data: null },
  yesterday: { t: 0, data: null }
};

// block ONLY when daily limit is hit (reset next day roughly)
let rateLimitedUntil = 0;

const ALLOWED_LEAGUES = {
  2: 1000, 3: 900, 848: 800,
  39: 950, 140: 950, 135: 900, 78: 900, 61: 850,
  1: 1000, 4: 950, 9: 900, 6: 900, 5: 700,
  45: 600, 143: 600, 137: 600, 81: 600, 66: 600
};

const SECONDARY_LEAGUES = {
  200: 750, 307: 700, 233: 650, 94: 500, 88: 450, 13: 600, 71: 500
};

const VIP = [
  'wydad', 'raja', 'far rabat', 'rsb berkane',
  'al-hilal', 'al hilal', 'al-nassr', 'al nassr', 'al-ittihad', 'al-ahli', 'al ahly', 'zamalek',
  'real madrid', 'barcelona', 'atletico',
  'manchester city', 'manchester united', 'liverpool', 'arsenal', 'chelsea', 'tottenham',
  'juventus', 'inter', 'ac milan', 'milan', 'napoli', 'roma',
  'bayern', 'dortmund', 'psg', 'paris saint', 'marseille', 'monaco',
  'benfica', 'porto', 'sporting', 'ajax', 'psv', 'feyenoord'
];

function isVip(name) {
  const n = (name || '').toLowerCase();
  return VIP.some(v => n.includes(v));
}

function isDirty(m) {
  const t = `${m.league?.name || ''} ${m.teams?.home?.name || ''} ${m.teams?.away?.name || ''}`.toLowerCase();
  return ['women', 'femenil', 'frauen', 'wsl', 'u15', 'u17', 'u18', 'u19', 'u20', 'u21', 'u23', 'youth', 'reserve', 'friendly', 'esports', 'futsal']
    .some(w => t.includes(w));
}

function buildMatch(item) {
  const now = moment().tz(TZ);
  const matchTime = moment(item.fixture.date).tz(TZ);
  const diff = matchTime.diff(now, 'minutes');
  const st = item.fixture.status.short;
  const live = ['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE', 'INT'].includes(st);
  const finished = ['FT', 'AET', 'PEN', 'CANC', 'ABD', 'AWD', 'WO'].includes(st) || diff < -150;

  let type, mainText, pillText, order;

  if (live) {
    type = 'live';
    mainText = `${item.goals.home ?? 0} - ${item.goals.away ?? 0}`;
    pillText = `مباشر ${item.fixture.status.elapsed || ''}'`;
    order = 1;
  } else if (finished) {
    type = 'finished';
    mainText = `${item.goals.home ?? 0} - ${item.goals.away ?? 0}`;
    pillText = 'انتهت';
    order = 4;
  } else {
    type = 'upcoming';
    mainText = matchTime.format('hh:mm A');
    if (diff >= 0 && diff <= 120) {
      pillText = `بعد قليل ${diff}m`;
      order = 2;
    } else {
      pillText = 'لم تبدأ بعد';
      order = 3;
    }
  }

  const id = String(item.fixture.id);
  const leagueId = item.league.id;
  let priority = ALLOWED_LEAGUES[leagueId] || SECONDARY_LEAGUES[leagueId] || 100;
  if (isVip(item.teams.home.name)) priority += 80;
  if (isVip(item.teams.away.name)) priority += 80;

  return {
    id,
    league: item.league.name,
    home: item.teams.home.name,
    homeLogo: item.teams.home.logo,
    away: item.teams.away.name,
    awayLogo: item.teams.away.logo,
    mainText,
    pillText,
    type,
    ts: matchTime.valueOf(),
    order,
    priority,
    streams: streamsDB[id] || []
  };
}

function filterMatches(fixtures) {
  let list = (fixtures || []).filter(m => {
    if (isDirty(m)) return false;
    const id = m.league.id;
    if (ALLOWED_LEAGUES[id]) return true;
    if (SECONDARY_LEAGUES[id] && (isVip(m.teams.home.name) || isVip(m.teams.away.name))) return true;
    return false;
  }).map(buildMatch);

  list.sort((a, b) => (a.order - b.order) || (b.priority - a.priority) || (a.ts - b.ts));
  return list.slice(0, 20);
}

function attachStreams(matches) {
  streamsDB = loadStreams();
  return (matches || []).map(m => ({
    ...m,
    streams: streamsDB[String(m.id)] || []
  }));
}

function getDateForDay(day) {
  const now = moment().tz(TZ);
  if (day === 'tomorrow') return now.clone().add(1, 'day').format('YYYY-MM-DD');
  if (day === 'yesterday') return now.clone().subtract(1, 'day').format('YYYY-MM-DD');
  return now.format('YYYY-MM-DD');
}

async function fetchFromApi(date) {
  if (!API_KEY) {
    const err = new Error('MISSING_API_KEY');
    err.code = 'MISSING_API_KEY';
    throw err;
  }

  if (Date.now() < rateLimitedUntil) {
    const err = new Error('RATE_LIMITED');
    err.code = 'RATE_LIMITED';
    throw err;
  }

  const response = await axios.get(
    `https://v3.football.api-sports.io/fixtures?date=${date}`,
    {
      headers: {
        'x-apisports-key': API_KEY
      },
      timeout: 12000
    }
  );

  const errors = response.data?.errors;
  if (errors && Object.keys(errors).length) {
    const msg = JSON.stringify(errors);
    if (/request limit|requests/i.test(msg)) {
      // block ~until next day utc roughly 6h minimum
      rateLimitedUntil = Date.now() + 6 * 60 * 60 * 1000;
      const err = new Error('RATE_LIMITED');
      err.code = 'RATE_LIMITED';
      err.detail = msg;
      throw err;
    }
    const err = new Error(msg);
    err.code = 'API_ERROR';
    throw err;
  }

  return response.data?.response || [];
}

// ================== API ==================
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    hasKey: Boolean(API_KEY),
    rateLimited: Date.now() < rateLimitedUntil,
    tz: TZ,
    now: moment().tz(TZ).format()
  });
});

app.get('/api/matches', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const day = req.query.day || 'today';
  const date = getDateForDay(day);

  // fresh cache hit
  if (cache[day]?.data && Date.now() - cache[day].t < CACHE_MS) {
    const cached = cache[day].data;
    cached.matches = attachStreams(cached.matches);
    return res.json(cached);
  }

  try {
    console.log(`[API] fetching ${date} (day=${day}) key=${API_KEY ? 'yes' : 'NO'}`);
    const raw = await fetchFromApi(date);
    const matches = attachStreams(filterMatches(raw));

    const payload = {
      success: true,
      source: 'api-football',
      isMock: false,
      day,
      date,
      count: matches.length,
      matches
    };

    cache[day] = { t: Date.now(), data: payload };
    console.log(`[API] ok ${date} => ${matches.length} matches`);
    return res.json(payload);

  } catch (e) {
    console.error('[API] fail:', e.code || e.message);

    // if we have old cache, serve it (better than fake/random)
    if (cache[day]?.data?.matches?.length) {
      const cached = cache[day].data;
      cached.matches = attachStreams(cached.matches);
      cached.stale = true;
      cached.warning = e.code || e.message;
      return res.json(cached);
    }

    // NO fake classic matches anymore (Roma/Barca fake confusion)
    return res.json({
      success: true,
      source: 'empty',
      isMock: false,
      day,
      date,
      count: 0,
      matches: [],
      warning: e.code || e.message,
      message:
        e.code === 'MISSING_API_KEY'
          ? 'API key missing on server'
          : e.code === 'RATE_LIMITED'
          ? 'API daily limit reached'
          : 'Could not fetch live matches right now'
    });
  }
});

app.get('/api/match/:id', (req, res) => {
  const id = String(req.params.id);
  streamsDB = loadStreams();

  for (const day of ['today', 'tomorrow', 'yesterday']) {
    const list = cache[day]?.data?.matches || [];
    const found = list.find(m => String(m.id) === id);
    if (found) {
      found.streams = streamsDB[id] || [];
      return res.json({ success: true, match: found });
    }
  }

  return res.status(404).json({ success: false, error: 'Match not found' });
});

app.post('/api/admin/login', (req, res) => {
  if (req.body?.password === ADMIN_PASSWORD) return res.json({ success: true });
  return res.status(401).json({ success: false });
});

app.post('/api/admin/streams', (req, res) => {
  const { password, matchId, streams } = req.body || {};
  if (password && password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  if (!matchId || !Array.isArray(streams)) {
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }

  streamsDB = loadStreams();
  streamsDB[String(matchId)] = streams;
  saveStreams(streamsDB);

  // bust cache so streams appear immediately
  cache = {
    today: { t: 0, data: null },
    tomorrow: { t: 0, data: null },
    yesterday: { t: 0, data: null }
  };

  return res.json({ success: true, matchId, streams });
});

// pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/home', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/matches', (req, res) => res.sendFile(path.join(__dirname, 'public', 'site.html')));
app.get('/site', (req, res) => res.sendFile(path.join(__dirname, 'public', 'site.html')));
app.get('/site.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'site.html')));
app.get('/watch', (req, res) => res.sendFile(path.join(__dirname, 'public', 'watch.html')));
app.get('/watch.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'watch.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/admin.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

app.listen(PORT, () => {
  console.log(`🚀 Hassani TV on port ${PORT}`);
  console.log(`🔑 API key: ${API_KEY ? 'OK' : 'MISSING'}`);
  console.log(`🕒 TZ ${TZ} => ${moment().tz(TZ).format()}`);
});