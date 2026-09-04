require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const moment = require('moment-timezone');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = (process.env.API_FOOTBALL_KEY || '').trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const TZ = 'Africa/Casablanca';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const STREAMS_FILE = path.join(__dirname, 'streams.json');
const CACHE_MS = 5 * 60 * 1000;

function loadStreams() {
  try {
    if (fs.existsSync(STREAMS_FILE)) {
      return JSON.parse(fs.readFileSync(STREAMS_FILE, 'utf8') || '{}');
    }
  } catch (e) {}
  return {};
}
function saveStreams(data) {
  try {
    fs.writeFileSync(STREAMS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {}
}

let streamsDB = loadStreams();
let cache = {
  today: { t: 0, data: null },
  tomorrow: { t: 0, data: null },
  yesterday: { t: 0, data: null }
};

const ALLOWED_LEAGUES = {
  2: 1000, 3: 900, 848: 800,
  39: 950, 140: 950, 135: 900, 78: 900, 61: 850,
  1: 1000, 4: 950, 9: 900, 6: 900, 5: 700,
  45: 600, 143: 600, 137: 600, 81: 600, 66: 600,
  200: 750, 307: 700, 233: 650
};

const VIP = [
  'wydad', 'raja', 'far rabat', 'rsb berkane',
  'al-hilal', 'al hilal', 'al-nassr', 'al nassr', 'al-ittihad', 'al-ahli', 'al ahly', 'zamalek',
  'real madrid', 'barcelona', 'atletico',
  'manchester city', 'manchester united', 'liverpool', 'arsenal', 'chelsea', 'tottenham',
  'juventus', 'inter', 'ac milan', 'milan', 'napoli', 'roma', 'lecce',
  'bayern', 'dortmund', 'psg', 'paris saint', 'marseille', 'monaco',
  'benfica', 'porto', 'sporting'
];

function isVip(name = '') {
  const n = name.toLowerCase();
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
    pillText = (diff >= 0 && diff <= 120) ? `بعد قليل ${Math.max(diff, 0)}m` : 'لم تبدأ بعد';
    order = (diff >= 0 && diff <= 120) ? 2 : 3;
  }

  const id = String(item.fixture.id);
  let priority = ALLOWED_LEAGUES[item.league.id] || 100;
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

function filterMatches(fixtures = []) {
  const list = fixtures
    .filter(m => {
      if (isDirty(m)) return false;
      const id = m.league?.id;
      if (ALLOWED_LEAGUES[id]) return true;
      // VIP even outside main list
      return isVip(m.teams?.home?.name) || isVip(m.teams?.away?.name);
    })
    .map(buildMatch)
    .sort((a, b) => (a.order - b.order) || (b.priority - a.priority) || (a.ts - b.ts))
    .slice(0, 30);

  return list;
}

function attachStreams(matches = []) {
  streamsDB = loadStreams();
  return matches.map(m => ({ ...m, streams: streamsDB[String(m.id)] || [] }));
}

function dayToDate(day) {
  const now = moment().tz(TZ);
  if (day === 'tomorrow') return now.clone().add(1, 'day').format('YYYY-MM-DD');
  if (day === 'yesterday') return now.clone().subtract(1, 'day').format('YYYY-MM-DD');
  return now.format('YYYY-MM-DD');
}

async function fetchFixtures(date) {
  if (!API_KEY) {
    return {
      ok: false,
      code: 'MISSING_API_KEY',
      status: 0,
      errors: 'API key missing',
      rawCount: 0,
      fixtures: []
    };
  }

  try {
    const response = await axios.get(
      `https://v3.football.api-sports.io/fixtures`,
      {
        params: { date },
        headers: {
          'x-apisports-key': API_KEY
        },
        timeout: 20000,
        validateStatus: () => true
      }
    );

    const status = response.status;
    const data = response.data || {};
    const errors = data.errors;
    const fixtures = Array.isArray(data.response) ? data.response : [];

    // normalize errors
    let hasErrors = false;
    let errorsText = null;
    if (typeof errors === 'string' && errors.trim()) {
      hasErrors = true;
      errorsText = errors;
    } else if (Array.isArray(errors) && errors.length) {
      hasErrors = true;
      errorsText = JSON.stringify(errors);
    } else if (errors && typeof errors === 'object' && Object.keys(errors).length) {
      hasErrors = true;
      errorsText = JSON.stringify(errors);
    }

    if (status === 401 || status === 403) {
      return {
        ok: false,
        code: 'INVALID_API_KEY',
        status,
        errors: errorsText || 'Unauthorized',
        rawCount: 0,
        fixtures: []
      };
    }

    if (hasErrors) {
      return {
        ok: false,
        code: 'API_ERROR',
        status,
        errors: errorsText,
        rawCount: fixtures.length,
        fixtures: []
      };
    }

    if (status >= 500) {
      return {
        ok: false,
        code: 'API_SERVER_ERROR',
        status,
        errors: `HTTP ${status}`,
        rawCount: 0,
        fixtures: []
      };
    }

    return {
      ok: true,
      code: 'OK',
      status,
      errors: null,
      rawCount: fixtures.length,
      fixtures
    };
  } catch (e) {
    return {
      ok: false,
      code: 'NETWORK_ERROR',
      status: 0,
      errors: e.message,
      rawCount: 0,
      fixtures: []
    };
  }
}

// ===== API =====
app.get('/api/health', async (req, res) => {
  res.json({
    ok: true,
    hasKey: Boolean(API_KEY),
    keyLength: API_KEY.length,
    tz: TZ,
    now: moment().tz(TZ).format()
  });
});

// debug endpoint
app.get('/api/debug-football', async (req, res) => {
  const date = dayToDate(req.query.day || 'today');
  const result = await fetchFixtures(date);
  res.json({
    date,
    hasKey: Boolean(API_KEY),
    keyLength: API_KEY.length,
    result: {
      ok: result.ok,
      code: result.code,
      status: result.status,
      errors: result.errors,
      rawCount: result.rawCount
    }
  });
});

app.get('/api/matches', async (req, res) => {
  const day = req.query.day || 'today';
  const date = dayToDate(day);

  if (cache[day]?.data && Date.now() - cache[day].t < CACHE_MS) {
    const cached = { ...cache[day].data, cached: true };
    cached.matches = attachStreams(cached.matches || []);
    return res.json(cached);
  }

  const result = await fetchFixtures(date);

  if (!result.ok) {
    // if old cache exists, use it
    if (cache[day]?.data?.matches?.length) {
      const cached = { ...cache[day].data, stale: true };
      cached.matches = attachStreams(cached.matches);
      cached.warning = result.code;
      cached.detail = result.errors;
      return res.json(cached);
    }

    return res.json({
      success: true,
      source: 'empty',
      day,
      date,
      count: 0,
      matches: [],
      warning: result.code,
      detail: result.errors,
      httpStatus: result.status,
      message: 'Could not fetch live matches right now'
    });
  }

  const matches = attachStreams(filterMatches(result.fixtures));
  const payload = {
    success: true,
    source: 'api-football',
    day,
    date,
    count: matches.length,
    rawCount: result.rawCount,
    matches
  };

  cache[day] = { t: Date.now(), data: payload };
  return res.json(payload);
});

app.get('/api/match/:id', (req, res) => {
  const id = String(req.params.id);
  streamsDB = loadStreams();

  for (const day of ['today', 'tomorrow', 'yesterday']) {
    const found = (cache[day]?.data?.matches || []).find(m => String(m.id) === id);
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
  cache = { today: { t: 0, data: null }, tomorrow: { t: 0, data: null }, yesterday: { t: 0, data: null } };
  return res.json({ success: true });
});

// pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/matches', (req, res) => res.sendFile(path.join(__dirname, 'public', 'site.html')));
app.get('/site', (req, res) => res.sendFile(path.join(__dirname, 'public', 'site.html')));
app.get('/site.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'site.html')));
app.get('/watch', (req, res) => res.sendFile(path.join(__dirname, 'public', 'watch.html')));
app.get('/watch.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'watch.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/admin.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

app.listen(PORT, () => {
  console.log(`🚀 Hassani TV port=${PORT}`);
  console.log(`🔑 key=${API_KEY ? 'OK len=' + API_KEY.length : 'MISSING'}`);
  console.log(`🕒 ${moment().tz(TZ).format()}`);
});