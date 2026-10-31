import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../client.js', import.meta.url), 'utf8');
const fixture = JSON.parse(readFileSync(new URL('./fixtures/status-pending.json', import.meta.url)));
const now = Date.parse('2026-10-22T10:11:53.095Z');

function client(shared = {}) {
  const window = new EventTarget();
  const document = new EventTarget();
  document.visibilityState = 'visible';
  const intervals = new Map();
  const timeouts = new Map();
  let clock = now;
  let api;
  let moduleId;
  let requests = [];
  let response = fixture;
  const storageAccesses = [];
  const storage = shared.storage || new Map();
  const notifications = shared.notifications || [];
  const permission = shared.permission || { current: 'granted', requests: 0 };
  window.localStorage = {
    getItem(key) {
      storageAccesses.push(['read', key]);
      if (shared.storageBlocked) throw new Error('storage blocked');
      return storage.has(key) ? storage.get(key) : null;
    },
    setItem(key, value) {
      storageAccesses.push(['write', key]);
      if (shared.storageBlocked) throw new Error('storage blocked');
      storage.set(key, String(value));
    },
  };
  class NotificationStub {
    static get permission() { return permission.current; }
    static requestPermission() {
      permission.requests += 1;
      return Promise.resolve(permission.current);
    }
    constructor(title, options) { notifications.push({ title, options }); }
    close() {}
  }
  const react = {
    createElement: (tag, props, ...children) => ({ tag, props, children: children.flat(Infinity) }),
    useState: (initial) => [typeof initial === 'function' ? initial() : initial, () => {}],
    useEffect() {},
    useLayoutEffect() {},
    useMemo: (fn) => fn(),
    useCallback: (fn) => fn,
    useRef: (current) => ({ current }),
    useSyncExternalStore: (_subscribe, getSnapshot) => getSnapshot(),
  };
  window.__ModuleLoader__ = { load(module) {
    moduleId = module.id;
    api = module.factory(() => react);
  } };
  class Clock extends Date { static now() { return clock; } }
  const globals = {
    window, document, URL, Intl, Date: Clock, AbortController,
    setInterval(fn, ms) { intervals.set(fn, ms); return fn; },
    clearInterval(id) { intervals.delete(id); },
    setTimeout(fn, ms) { timeouts.set(fn, ms); return fn; },
    clearTimeout(id) { timeouts.delete(id); },
    fetch: async (url, options) => {
      requests.push({ url: String(url), options });
      if (typeof response === 'function') return response(url, options);
      return { ok: true, headers: new Headers(), json: async () => response };
    },
  };
  if (!shared.withoutNotificationApi) globals.Notification = NotificationStub;
  if (shared.locks) globals.navigator = { locks: shared.locks };
  const context = vm.createContext(globals);
  const instrumented = source.replace('return { name, inject, apply };', `return { name, inject, apply,
    ResetSummary, resetHappenedToday, reportedVerdict: typeof reportedVerdict === "function" ? reportedVerdict : undefined, latestResetRecord, resetCompletionTime,
    NoticePermissionControl, todayCompletionKeys,
    ensureStatus, retainStatusPolling, statusStore, CodexResetDock, en, zh };`);
  vm.runInContext(instrumented, context);
  return {
    api, moduleId, window, document, intervals, timeouts, requests, storageAccesses,
    notifications, permission, storage,
    renderDock(localeId = 'zh-CN') {
      const dictionary = localeId.startsWith('zh') ? api.zh : api.en;
      const locale = { subscribe: () => () => {}, getSnapshot: () => localeId };
      const render = (node) => {
        if (node == null || typeof node !== 'object') return node;
        if (typeof node.tag === 'function') return render(node.tag(node.props || {}));
        return { ...node, children: (node.children || []).map(render) };
      };
      return render(api.CodexResetDock({ locale, t: (key) => dictionary[key] }));
    },
    advance(ms) { clock += ms; },
    respond(value) { response = value; },
  };
}
const t = (key) => key;
const textOf = (node) => node == null ? '' : typeof node === 'object'
  ? (node.children || []).map(textOf).join(' ') : String(node);
const flush = () => new Promise((resolve) => setImmediate(resolve));
const descendants = (node) => node == null || typeof node !== 'object'
  ? [] : [node, ...(node.children || []).flatMap(descendants)];
const visibleText = (node) => node == null ? '' : typeof node !== 'object' ? String(node)
  : node.props?.['aria-hidden'] ? '' : (node.children || []).map(visibleText).join('');
// Every text node in the subtree, hidden ones included, joined without padding.
const rawText = (node) => node == null ? '' : typeof node !== 'object' ? String(node)
  : (node.children || []).map(rawText).join('');
const dockButton = (tree) => descendants(tree).find((node) => node.props?.className === 'dcr-dock-button');
const dockEntry = (tree) => descendants(tree).find((node) => node.props?.className === 'dcr-dock');
const probabilityNode = (button) => descendants(button).find((node) => node.props?.className === 'dcr-chip-probability');
const completedToday = () => {
  const value = structuredClone(fixture);
  value.data.latestGlobal.completedAt = '2026-10-22T09:30:00Z';
  return value;
};

test('installation identity includes tracker in manifest, lockfile, loader and patch', () => {
  const name = 'dsh-codex-reset-tracker';
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
  const lock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url)));
  assert.equal(pkg.name, name);
  assert.equal(lock.name, name);
  assert.equal(lock.packages[''].name, name);
  assert.equal(client().moduleId, name);
  assert.match(readFileSync(new URL('../cordis.patch.yml', import.meta.url), 'utf8'), /name: 'dsh-codex-reset-tracker'/);
});

test('the entry registers immediately before auto-compact in the right status group', () => {
  const { api } = client();
  const registered = [];
  const injected = [];
  const ctx = {
    effect(fn) { fn(); },
    locale: { register: () => () => {}, bind: () => (key) => key },
    slots: {
      inject(name, setup) { injected.push(name); setup(); },
      register(options) { registered.push(options); return () => {}; },
    },
  };
  api.apply(ctx);
  assert.deepEqual(injected, ['conversation.input.right']);
  assert.deepEqual(registered.map((entry) => [entry.name, entry.id]), [
    ['conversation.input.right', 'codex-reset-status'],
  ]);
  // auto-compact registers its ring in this slot with order 10.
  const entries = [
    { id: 'dsh-auto-compact-ring', order: 10 },
    ...registered,
  ].sort((left, right) => left.order - right.order);
  assert.deepEqual(entries.map((entry) => entry.id), [
    'codex-reset-status', 'dsh-auto-compact-ring',
  ]);
});

test('dock shows only the forecast percentage, with no name and no reserved width', async () => {
  const c = client();
  await c.api.ensureStatus('zh-CN', false);
  for (const localeId of ['zh-CN', 'en']) {
    const tree = c.renderDock(localeId);
    const button = dockButton(tree);
    assert.equal(visibleText(button), ' ≥86%');
    // One space plus the four label characters: the gap is part of the text.
    assert.equal([...visibleText(button)].length, 5);
    // Hidden reservation text would make the entry wider than what it shows.
    assert.equal(rawText(dockEntry(tree)), ' ≥86%');
    assert.equal(visibleText(probabilityNode(button)), ' ≥86%');
  }
  assert.equal(dockButton(c.renderDock('zh-CN')).props['aria-label'], 'Codex 重置追踪状态');
  assert.equal(dockButton(c.renderDock('en')).props['aria-label'], 'Codex reset status');
});

test('dock shows only the glyph while there is no forecast to report', async () => {
  const c = client();
  const tree = c.renderDock();
  const button = dockButton(tree);
  assert.equal(visibleText(button), '');
  assert.equal(rawText(dockEntry(tree)), '');
  assert.equal(button.props.title, 'Codex 重置追踪状态');
  assert.equal(descendants(button).some((node) => node.tag === 'svg'), true);
  assert.equal(probabilityNode(button), undefined);
});

test('dock uses the displayed rounded probability for the inclusive 80% threshold', async () => {
  const c = client();
  for (const [confidence, expected] of [
    [0.79, ''],
    [0.794, ''],
    [0.795, ' ≥80%'],
    [0.8, ' ≥80%'],
    [0.93, ' ≥93%'],
    [1, ' 100%'],
  ]) {
    const value = structuredClone(fixture);
    value.data.nextScheduled.confidence = confidence;
    c.respond(value);
    await c.api.ensureStatus('zh-CN', true);
    assert.equal(visibleText(dockButton(c.renderDock())), expected);
  }
});

test('dock falls back for missing probability, invalid schedules and completed-today priority', async () => {
  const c = client();
  assert.equal(visibleText(dockButton(c.renderDock())), '');
  const changes = [
    (data) => { data.nextScheduled.confidence = null; },
    (data) => { data.nextScheduled = null; },
    (data) => { data.nextScheduled.scheduleState = 'elapsed'; },
    (data) => { data.nextScheduled.scheduleState = 'fulfilled'; },
    (data) => { data.nextScheduled.effectiveAt = '2026-10-21T00:00:00Z'; data.nextScheduled.scheduleWindow = null; },
    (data) => { data.latestGlobal.completedAt = '2026-10-22T09:00:00Z'; },
    (data) => { data.nextScheduled.confidence = 1.1; },
  ];
  for (const change of changes) {
    const value = structuredClone(fixture);
    change(value.data);
    c.respond(value);
    await c.api.ensureStatus('zh-CN', true);
    const button = dockButton(c.renderDock());
    assert.equal(visibleText(button), '');
    assert.equal(probabilityNode(button), undefined);
  }
});

test('background refresh keeps the probability until the updated snapshot arrives', async () => {
  const c = client();
  await c.api.ensureStatus('zh-CN', true);
  const release = c.api.retainStatusPolling('zh-CN');
  const labels = [];
  const unsubscribe = c.api.statusStore.subscribe(() => labels.push(visibleText(dockButton(c.renderDock()))));
  const updated = structuredClone(fixture);
  updated.data.nextScheduled.confidence = 0.93;
  let finish;
  c.respond(() => new Promise((resolve) => {
    finish = () => resolve({ ok: true, headers: new Headers(), json: async () => updated });
  }));
  c.advance(10 * 60 * 1000);
  for (const poll of c.intervals.keys()) poll();
  const pending = c.api.ensureStatus('zh-CN', false);
  assert.equal(c.api.statusStore.getSnapshot().phase, 'refreshing');
  assert.equal(visibleText(dockButton(c.renderDock())), ' ≥86%');
  finish();
  await pending;
  unsubscribe();
  release();
  assert.deepEqual(labels, [' ≥86%', ' ≥93%']);
});

test('failed refresh hides the dock probability until retry succeeds with a valid forecast', async () => {
  const c = client();
  const initial = structuredClone(fixture);
  initial.data.nextScheduled.confidence = 0.93;
  c.respond(initial);
  await c.api.ensureStatus('zh-CN', true);
  const labels = [];
  const unsubscribe = c.api.statusStore.subscribe(() => labels.push(visibleText(dockButton(c.renderDock()))));
  c.respond(() => { throw new Error('offline'); });
  await c.api.ensureStatus('zh-CN', true);
  assert.equal(c.api.statusStore.getSnapshot().phase, 'error');
  assert.equal(c.api.statusStore.getSnapshot().entry.data.nextScheduled.confidence, 0.93);
  const updated = structuredClone(fixture);
  updated.data.nextScheduled.confidence = 0.99;
  let finish;
  c.respond(() => new Promise((resolve) => {
    finish = () => resolve({ ok: true, headers: new Headers(), json: async () => updated });
  }));
  const pending = c.api.ensureStatus('zh-CN', true);
  finish();
  await pending;
  unsubscribe();
  assert.deepEqual(labels, [
    ' ≥93%', '', '', ' ≥99%',
  ]);
});

test('failed refresh uses the default label without a valid cached forecast', async () => {
  const c = client();
  c.respond(() => { throw new Error('offline'); });
  await c.api.ensureStatus('zh-CN', true);
  assert.equal(visibleText(dockButton(c.renderDock())), '');
  c.respond(fixture);
  await c.api.ensureStatus('zh-CN', true);
  c.respond(() => { throw new Error('offline'); });
  await c.api.ensureStatus('zh-CN', true);
  c.advance(8 * 60 * 60 * 1000);
  assert.equal(visibleText(dockButton(c.renderDock())), '');
});

test('closed dock rechecks expired schedules with the current render time', async () => {
  const c = client();
  await c.api.ensureStatus('zh-CN', true);
  assert.equal(visibleText(dockButton(c.renderDock())), ' ≥86%');
  c.advance(8 * 60 * 60 * 1000);
  assert.equal(visibleText(dockButton(c.renderDock())), '');
});

test('loading and receiving new reset signals never reads or writes unread storage', async () => {
  const c = client();
  await c.api.ensureStatus('zh-CN', true);
  const value = structuredClone(fixture);
  value.data.nextScheduled.id = 'new-announcement';
  c.respond(value);
  await c.api.ensureStatus('zh-CN', true);
  assert.equal(c.storageAccesses.some(([, key]) => /unread/i.test(key)), false);
  const button = dockButton(c.renderDock());
  assert.equal(button.props['aria-label'], 'Codex 重置追踪状态');
  assert.equal(descendants(button).some((node) => node.props?.className === 'dcr-unread-dot'), false);
});

test('reset completion raises one system notification and never repeats it on later polls', async () => {
  const c = client();
  await c.api.ensureStatus('zh-CN', true);
  assert.deepEqual(c.notifications, []);
  c.respond(completedToday());
  await c.api.ensureStatus('zh-CN', true);
  assert.equal(c.notifications.length, 1);
  assert.equal(c.notifications[0].title, 'Codex 已经重置');
  c.advance(10 * 60 * 1000);
  await c.api.ensureStatus('zh-CN', true);
  assert.equal(c.notifications.length, 1);
});

test('reset notification uses the active language and survives a page reload', async () => {
  const shared = { storage: new Map(), permission: { current: 'granted', requests: 0 } };
  const first = client(shared);
  await first.api.ensureStatus('en', true);
  first.respond(completedToday());
  await first.api.ensureStatus('en', true);
  assert.deepEqual(first.notifications.map((notice) => notice.title), ['Codex has reset']);
  const reloaded = client({ ...shared, notifications: first.notifications });
  reloaded.respond(completedToday());
  await reloaded.api.ensureStatus('en', true);
  assert.equal(first.notifications.length, 1);
});

test('reset notification reports a completion that landed while the page was closed', async () => {
  const shared = { storage: new Map(), permission: { current: 'granted', requests: 0 } };
  await client(shared).api.ensureStatus('zh-CN', true);
  const reopened = client(shared);
  reopened.respond(completedToday());
  await reopened.api.ensureStatus('zh-CN', true);
  assert.deepEqual(reopened.notifications.map((notice) => notice.title), ['Codex 已经重置']);
});

test('reset notification stays silent without browser permission', async () => {
  const c = client({ permission: { current: 'default', requests: 0 } });
  await c.api.ensureStatus('zh-CN', true);
  c.respond(completedToday());
  await c.api.ensureStatus('zh-CN', true);
  assert.deepEqual(c.notifications, []);
});

test('reset notification dedupes in memory when storage is blocked', async () => {
  const c = client({ storageBlocked: true });
  await c.api.ensureStatus('zh-CN', true);
  c.respond(completedToday());
  await c.api.ensureStatus('zh-CN', true);
  await c.api.ensureStatus('zh-CN', true);
  assert.equal(c.notifications.length, 1);
});

test('the notification control asks for permission and states what is left to do', async () => {
  const permission = { current: 'default', requests: 0 };
  const c = client({ permission });
  const granted = [];
  const control = c.api.NoticePermissionControl({
    t: (key) => c.api.zh[key], permission: 'default', onPermission: (value) => granted.push(value),
  });
  assert.equal(visibleText(control), '开启系统通知');
  control.props.onClick();
  await flush();
  assert.equal(permission.requests, 1);
  assert.deepEqual(granted, ['default']);
  for (const [state, label, disabled] of [
    ['granted', '系统通知已开启', true],
    ['denied', '系统通知已被阻止', true],
  ]) {
    const rendered = c.api.NoticePermissionControl({
      t: (key) => c.api.zh[key], permission: state, onPermission: () => {},
    });
    assert.equal(visibleText(rendered), label, state);
    assert.equal(rendered.props.disabled, disabled, state);
  }
  assert.equal(c.api.NoticePermissionControl({ t: (key) => c.api.zh[key], permission: 'unsupported' }), null);
  const withoutApi = client({ withoutNotificationApi: true });
  assert.equal(visibleText(withoutApi.api.NoticePermissionControl({ t: (key) => withoutApi.api.zh[key] })), '');
});

test('expanded schedule marks today and tomorrow by local calendar date', () => {
  const { api } = client();
  for (const [current, target, suffix] of [
    ['2026-10-22T10:11:53Z', '2026-10-22T12:00:00Z', '（今天）'],
    ['2026-10-22T10:11:53Z', '2026-10-22T16:01:00Z', '（明天）'],
    ['2026-10-22T10:11:53Z', '2026-10-23T16:01:00Z', ''],
    ['2026-12-31T15:59:00Z', '2026-12-31T16:01:00Z', '（明天）'],
  ]) {
    const data = structuredClone(fixture.data);
    data.nextScheduled.scheduleWindow = null;
    data.nextScheduled.effectiveAt = target;
    const tree = api.ResetSummary({ data, t: (key) => api.zh[key], localeId: 'zh-CN', now: Date.parse(current) });
    const time = descendants(tree).find((node) => node.tag === 'time' && node.props.dateTime === target);
    const marker = textOf(time).match(/（今天）|（明天）/)?.[0] || '';
    assert.equal(marker, suffix, `${current} → ${target}`);
  }
});

test('captured Day 17 headline reports the source page probability and Yes', () => {
  const { api } = client();
  assert.equal(api.resetHappenedToday(fixture.data, now), false);
  const rendered = textOf(api.ResetSummary({ data: fixture.data, t, localeId: 'zh-CN', now }));
  assert.match(rendered, /upcomingQuestion/);
  assert.match(rendered, /≥86%/);
  assert.match(rendered, /todayYes/);
  assert.doesNotMatch(rendered, /todayUnconfirmed/);
  assert.equal(api.reportedVerdict(fixture.data, now).percent, 86);
  assert.equal(api.latestResetRecord(fixture.data).id, fixture.data.latestGlobal.id);
});

test('confirmed completion today switches to yes; an elapsed schedule never does', () => {
  const { api } = client();
  const data = structuredClone(fixture.data);
  data.latestGlobal.completedAt = '2026-10-22T09:00:00Z';
  assert.equal(api.resetHappenedToday(data, now), true);
  assert.match(textOf(api.ResetSummary({ data, t, localeId: 'en', now })), /todayYes/);
  data.latestGlobal = null;
  data.latestBanked = null;
  data.nextScheduled.scheduleState = 'elapsed';
  assert.equal(api.resetHappenedToday(data, now), false);
});

test('completion is checked against browser local day, with invalid time fallback', () => {
  const { api } = client();
  const data = structuredClone(fixture.data);
  data.latestGlobal.completedAt = 'invalid';
  data.latestGlobal.effectiveAt = '2026-10-21T18:00:00Z';
  data.timeZone = 'America/Los_Angeles';
  assert.equal(api.resetHappenedToday(data, now), true);
  assert.equal(api.resetCompletionTime(data.latestGlobal).field, 'effectiveAt');
});

test('stale status refreshes when tab becomes visible or network returns; listeners clean up', async () => {
  const c = client();
  const release = c.api.retainStatusPolling('en');
  await flush();
  assert.equal(c.requests.length, 1);
  c.advance(61_000);
  c.document.visibilityState = 'hidden';
  c.document.dispatchEvent(new Event('visibilitychange'));
  await flush();
  assert.equal(c.requests.length, 1);
  c.document.visibilityState = 'visible';
  c.document.dispatchEvent(new Event('visibilitychange'));
  await flush();
  assert.equal(c.requests.length, 2);
  c.advance(61_000);
  c.window.dispatchEvent(new Event('online'));
  await flush();
  assert.equal(c.requests.length, 3);
  release();
  c.advance(61_000);
  c.window.dispatchEvent(new Event('online'));
  await flush();
  assert.equal(c.requests.length, 3);
  assert.equal(c.intervals.size, 0);
});

test('interactive freshness check fetches a new completion and coalesces repeated requests', async () => {
  const c = client();
  await c.api.ensureStatus('en', false);
  c.advance(61_000);
  const data = structuredClone(fixture);
  data.data.latestGlobal.completedAt = '2026-10-22T10:00:00Z';
  c.respond(data);
  await Promise.all([c.api.ensureStatus('en', false), c.api.ensureStatus('en', false)]);
  assert.equal(c.requests.length, 2);
  assert.equal(c.api.resetHappenedToday(c.api.statusStore.getSnapshot().entry.data, now), true);
  assert.equal(new URL(c.requests[0].url).searchParams.get('timeZone'), 'Asia/Shanghai');
  assert.equal(c.requests[0].options.cache, 'no-store');
});

test('429 cooldown prevents event/manual refresh from bypassing Retry-After', async () => {
  const c = client();
  c.respond(() => ({ ok: false, status: 429, headers: new Headers({ 'Retry-After': '120' }),
    json: async () => ({ ok: false, error: 'rate_limited', retryAfter: 120 }) }));
  await c.api.ensureStatus('en', true);
  await c.api.ensureStatus('en', true);
  assert.equal(c.requests.length, 1);
  assert.equal(c.api.statusStore.getSnapshot().phase, 'error');
  c.advance(120_001);
  c.respond(fixture);
  await c.api.ensureStatus('en', false);
  assert.equal(c.requests.length, 2);
  assert.equal(c.api.statusStore.getSnapshot().phase, 'ready');
});

test('hung fetch times out and can be retried instead of staying in loading forever', async () => {
  const c = client();
  c.respond((_url, { signal }) => new Promise((_resolve, reject) =>
    signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })))));
  const pending = c.api.ensureStatus('en', true);
  assert.equal(c.timeouts.size, 1);
  for (const fn of [...c.timeouts.keys()]) fn();
  await pending;
  assert.equal(c.api.statusStore.getSnapshot().phase, 'error');
  c.respond(fixture);
  await c.api.ensureStatus('en', true);
  assert.equal(c.api.statusStore.getSnapshot().phase, 'ready');
  assert.equal(c.timeouts.size, 0);
});

// Source-page headline rules observed at https://didcodexreset.com/zh/:
// live schedules display rounded confidence + Yes; 100% has no ≥ prefix.
test('reported probability has no invented threshold and preserves exact 100%', () => {
  const { api } = client();
  const data = structuredClone(fixture.data);
  for (const [confidence, expected] of [[0.8, '≥80%'], [0.65, '≥65%'], [1, '100%']]) {
    data.nextScheduled.confidence = confidence;
    const rendered = textOf(api.ResetSummary({ data, t, localeId: 'en', now }));
    assert.ok(rendered.includes(expected));
    assert.match(rendered, /todayYes/);
  }
});

test('missing confidence is not fabricated and no schedule uses the source daily answer', () => {
  const { api } = client();
  const data = structuredClone(fixture.data);
  data.nextScheduled.confidence = null;
  let rendered = textOf(api.ResetSummary({ data, t, localeId: 'en', now }));
  assert.doesNotMatch(rendered, /%/);
  assert.match(rendered, /upcomingQuestion/);
  data.nextScheduled = null;
  rendered = textOf(api.ResetSummary({ data, t, localeId: 'en', now }));
  assert.match(rendered, /todayQuestion/);
  assert.match(rendered, /todayNo/);
  assert.doesNotMatch(rendered, /todayYes|%/);
});

test('completed today takes priority over a pending forecast without changing record kind', () => {
  const { api } = client();
  const data = structuredClone(fixture.data);
  data.latestGlobal.completedAt = '2026-10-22T09:00:00Z';
  const rendered = textOf(api.ResetSummary({ data, t, localeId: 'en', now }));
  assert.match(rendered, /todayQuestion/);
  assert.match(rendered, /todayYes/);
  assert.doesNotMatch(rendered, /%|upcomingQuestion/);
  assert.equal(data.nextScheduled.kind, 'reset_scheduled');
});

test('a multi-day explicit schedule covering now reports Yes without inventing confidence', () => {
  const { api } = client();
  const data = structuredClone(fixture.data);
  data.nextScheduled.confidence = null;
  data.nextScheduled.scheduleWindow = {
    startAt: '2026-10-20T18:00:00Z', endAt: '2026-10-23T18:00:00Z',
  };
  const rendered = textOf(api.ResetSummary({ data, t, localeId: 'en', now }));
  assert.match(rendered, /todayYes/);
  assert.doesNotMatch(rendered, /%/);
});


test('two already-open pages share completion dedup state', async () => {
  const shared = { storage: new Map(), notifications: [] };
  const first = client(shared);
  const second = client(shared);
  await first.api.ensureStatus('en', true);
  await second.api.ensureStatus('en', true);
  first.respond(completedToday());
  second.respond(completedToday());
  await first.api.ensureStatus('en', true);
  await second.api.ensureStatus('en', true);
  assert.equal(shared.notifications.length, 1);
});

test('the same completion in both API slots is announced once', async () => {
  const c = client();
  await c.api.ensureStatus('en', true);
  const value = completedToday();
  value.data.latestGlobal.resetType = 'global_and_banked';
  c.respond(value);
  await c.api.ensureStatus('en', true);
  value.data.latestBanked = structuredClone(value.data.latestGlobal);
  await c.api.ensureStatus('en', true);
  assert.equal(c.notifications.length, 1);
});

test('concurrent pages serialize announcement decisions with Web Locks', async () => {
  let tail = Promise.resolve();
  const shared = { storage: new Map(), notifications: [], locks: {
    request(_key, fn) { const pending = tail.then(fn); tail = pending.catch(() => {}); return pending; },
  } };
  const first = client(shared);
  const second = client(shared);
  await Promise.all([first.api.ensureStatus('en', true), second.api.ensureStatus('en', true)]);
  first.respond(completedToday());
  second.respond(completedToday());
  await Promise.all([first.api.ensureStatus('en', true), second.api.ensureStatus('en', true)]);
  assert.equal(shared.notifications.length, 1);
});

test('a previously announced completion remains deduped after a newer snapshot', async () => {
  const c = client();
  await c.api.ensureStatus('en', true);
  const a = completedToday();
  c.respond(a);
  await c.api.ensureStatus('en', true);
  const b = structuredClone(a);
  b.data.latestGlobal.id = 'later-completion';
  b.data.latestGlobal.completedAt = '2026-10-22T10:00:00Z';
  c.respond(b);
  await c.api.ensureStatus('en', true);
  c.respond(a);
  await c.api.ensureStatus('en', true);
  assert.equal(c.notifications.length, 2);
});
