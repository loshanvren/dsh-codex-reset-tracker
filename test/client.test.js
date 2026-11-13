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
  let dockOpen = false;
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
    useState: (initial) => initial === false
      ? [dockOpen, (open) => { dockOpen = open; }]
      : [typeof initial === 'function' ? initial() : initial, () => {}],
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
    ResetSummary, ResetHistory, TiboPost, tiboPostTextParts, selectedPostPart, resetHappenedToday, reportedVerdict: typeof reportedVerdict === "function" ? reportedVerdict : undefined, resetCompletionTime,
    NoticePermissionControl, todayCompletionKeys, todayCompletionEvents, todayCompletionCoverage,
    resetTypeOf, resetTypeLabelKey, completedTypeLabelKeys, resetNoticeTypeLabel, resetScopeLabel,
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
const summaryText = (node) => [node.props?.['aria-label'], textOf(node)].filter(Boolean).join(' ');
const flush = () => new Promise((resolve) => setImmediate(resolve));
const descendants = (node) => node == null || typeof node !== 'object'
  ? [] : [node, ...(node.children || []).flatMap(descendants)];
const visibleText = (node) => node == null ? '' : typeof node !== 'object' ? String(node)
  : node.props?.['aria-hidden'] ? '' : (node.children || []).map(visibleText).join('');
const dockButton = (tree) => descendants(tree).find((node) => node.props?.className === 'dcr-dock-button');
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

test('dock displays high-confidence forecasts in either language without adding Yes', async () => {
  const c = client();
  await c.api.ensureStatus('zh-CN', false);
  for (const [localeId, label, accessibleName] of [
    ['zh-CN', 'Codex ≥86%', 'Codex 重置追踪状态'],
    ['en', 'Codex ≥86%', 'Codex reset status'],
  ]) {
    const button = dockButton(c.renderDock(localeId));
    assert.equal(visibleText(button), label);
    assert.ok(button.props['aria-label'].startsWith(accessibleName));
    assert.ok(button.props['aria-label'].includes('≥86%'));
    assert.equal(descendants(button).find(n => n.props?.['data-reset-type'])?.props['data-reset-type'], 'global');
    assert.ok(button.props.title.startsWith(accessibleName));
    assert.equal(visibleText(probabilityNode(button)), '≥86%');
  }
});

test('dock uses a distinct accessible icon for each type without repeating its name', async () => {
  const c = client();
  for (const [resetType, label] of [
    ['banked', 'banked'],
    ['global_and_banked', 'global_and_banked'],
    ['mystery', 'unknown'],
  ]) {
    const value = structuredClone(fixture);
    value.data.nextScheduled.resetType = resetType;
    c.respond(value);
    await c.api.ensureStatus('zh-CN', true);
    const button = dockButton(c.renderDock());
    assert.equal(visibleText(button), 'Codex ≥86%', resetType);
    const mark = descendants(button).find(n => n.props?.['data-reset-type']);
    assert.equal(mark.props['data-reset-type'], label);
    assert.equal(mark.props['aria-label'], c.api.zh[c.api.resetTypeLabelKey(label)]);
  }
});

test('dock uses the displayed rounded probability for the inclusive 80% threshold', async () => {
  const c = client();
  for (const [confidence, expected] of [
    [0.79, 'Codex'],
    [0.794, 'Codex'],
    [0.795, 'Codex ≥80%'],
    [0.8, 'Codex ≥80%'],
    [0.93, 'Codex ≥93%'],
    [1, 'Codex 100%'],
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
  assert.equal(visibleText(dockButton(c.renderDock())), 'Codex');
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
    assert.equal(visibleText(button), 'Codex');
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
  assert.equal(visibleText(dockButton(c.renderDock())), 'Codex ≥86%');
  finish();
  await pending;
  unsubscribe();
  release();
  assert.deepEqual(labels, ['Codex ≥86%', 'Codex ≥93%']);
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
    'Codex ≥93%', 'Codex', 'Codex', 'Codex ≥99%',
  ]);
});

test('failed refresh uses the default label without a valid cached forecast', async () => {
  const c = client();
  c.respond(() => { throw new Error('offline'); });
  await c.api.ensureStatus('zh-CN', true);
  assert.equal(visibleText(dockButton(c.renderDock())), 'Codex');
  c.respond(fixture);
  await c.api.ensureStatus('zh-CN', true);
  c.respond(() => { throw new Error('offline'); });
  await c.api.ensureStatus('zh-CN', true);
  c.advance(8 * 60 * 60 * 1000);
  assert.equal(visibleText(dockButton(c.renderDock())), 'Codex');
});

test('closed dock rechecks expired schedules with the current render time', async () => {
  const c = client();
  await c.api.ensureStatus('zh-CN', true);
  assert.equal(visibleText(dockButton(c.renderDock())), 'Codex ≥86%');
  c.advance(8 * 60 * 60 * 1000);
  assert.equal(visibleText(dockButton(c.renderDock())), 'Codex');
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
  assert.equal(button.props['aria-label'], 'Codex 重置追踪状态 · 全体重置 · ≥86%');
  assert.equal(descendants(button).some((node) => node.props?.className === 'dcr-unread-dot'), false);
});

test('reset completion raises one system notification and never repeats it on later polls', async () => {
  const c = client();
  await c.api.ensureStatus('zh-CN', true);
  assert.deepEqual(c.notifications, []);
  c.respond(completedToday());
  await c.api.ensureStatus('zh-CN', true);
  assert.equal(c.notifications.length, 1);
  assert.equal(c.notifications[0].title, 'Codex 已经重置（全体重置）');
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
  assert.deepEqual(first.notifications.map((notice) => notice.title), ['Codex has reset (Global reset)']);
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
  assert.deepEqual(reopened.notifications.map((notice) => notice.title), ['Codex 已经重置（全体重置）']);
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
  assert.equal(control.props['aria-label'], '开启系统通知');
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
    assert.equal(rendered.props['aria-label'], label, state);
    assert.equal(visibleText(rendered), '', state);
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
    const marker = textOf(time).match(/今天|明天/)?.[0] || '';
    assert.equal(marker, suffix.replace(/[（）]/g, ''), `${current} → ${target}`);
  }
});

test('captured Day 17 headline reports the source page probability and Yes', () => {
  const { api } = client();
  assert.equal(api.resetHappenedToday(fixture.data, now), false);
  const rendered = summaryText(api.ResetSummary({ data: fixture.data, t, localeId: 'zh-CN', now }));
  assert.match(rendered, /upcomingQuestion/);
  assert.match(rendered, /≥86%/);
  assert.match(rendered, /todayYes/);
  assert.doesNotMatch(rendered, /todayUnconfirmed/);
  assert.equal(api.reportedVerdict(fixture.data, now).percent, 86);
});

test('confirmed completion today switches to yes; an elapsed schedule never does', () => {
  const { api } = client();
  const data = structuredClone(fixture.data);
  data.latestGlobal.completedAt = '2026-10-22T09:00:00Z';
  assert.equal(api.resetHappenedToday(data, now), true);
  assert.match(summaryText(api.ResetSummary({ data, t, localeId: 'en', now })), /todayYes/);
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
    const rendered = summaryText(api.ResetSummary({ data, t, localeId: 'en', now }));
    assert.ok(rendered.includes(expected));
    assert.match(rendered, /todayYes/);
  }
});

test('missing confidence is not fabricated and no schedule uses the source daily answer', () => {
  const { api } = client();
  const data = structuredClone(fixture.data);
  data.nextScheduled.confidence = null;
  let rendered = summaryText(api.ResetSummary({ data, t, localeId: 'en', now }));
  assert.doesNotMatch(rendered, /%/);
  assert.match(rendered, /upcomingQuestion/);
  data.nextScheduled = null;
  rendered = summaryText(api.ResetSummary({ data, t, localeId: 'en', now }));
  assert.match(rendered, /todayQuestion/);
  assert.match(rendered, /todayNo/);
  assert.doesNotMatch(rendered, /todayYes|%/);
});

test('completed today takes priority over a pending forecast without changing record kind', () => {
  const { api } = client();
  const data = structuredClone(fixture.data);
  data.latestGlobal.completedAt = '2026-10-22T09:00:00Z';
  const rendered = summaryText(api.ResetSummary({ data, t, localeId: 'en', now }));
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
  const rendered = summaryText(api.ResetSummary({ data, t, localeId: 'en', now }));
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

// ---- Reset-type regression (all fixture values below are synthetic test data) ----

const completeTodaySlot = (slot, resetType, at = '2026-10-22T09:30:00Z') => {
  const value = structuredClone(fixture);
  value.data[slot].kind = 'reset_completed';
  value.data[slot].resetType = resetType;
  value.data[slot].completedAt = at;
  return value;
};

test('type helpers keep unknown or missing values explicit without inventing global', () => {
  const { api } = client();
  for (const [value, expected] of [
    ['global', 'typeGlobal'], ['banked', 'typeBanked'], ['global_and_banked', 'typeGlobalBanked'],
    ['weird', 'typeUnknown'], ['', 'typeUnknown'], [undefined, 'typeUnknown'], [null, 'typeUnknown'],
  ]) {
    assert.equal(api.resetTypeLabelKey(api.resetTypeOf({ resetType: value })), expected, String(value));
  }
  assert.deepEqual([...api.completedTypeLabelKeys({ global: true, banked: false, unknown: false })], ['typeGlobal']);
  assert.deepEqual([...api.completedTypeLabelKeys({ global: false, banked: true, unknown: true })], ['typeBanked', 'typeUnknown']);
  assert.deepEqual([...api.completedTypeLabelKeys({ global: true, banked: true, unknown: true })], ['typeGlobalBanked', 'typeUnknown']);
  assert.deepEqual([...api.completedTypeLabelKeys({ global: false, banked: false, unknown: false })], []);
});

test('completing only banked today keeps the pending global forecast visible', () => {
  const { api } = client();
  const value = completeTodaySlot('latestBanked', 'banked');
  const verdict = api.reportedVerdict(value.data, now);
  assert.equal(verdict.scheduled, true);
  assert.equal(verdict.type, 'global');
  assert.equal(verdict.percent, 86);
  const rendered = summaryText(api.ResetSummary({ data: value.data, t, localeId: 'en', now }));
  assert.match(rendered, /upcomingQuestion/);
  assert.match(rendered, /typeGlobal/);
  assert.match(rendered, /todayQuestion todayYes/);
});

test('completing only global today keeps the pending banked forecast visible', () => {
  const { api } = client();
  const value = completeTodaySlot('latestGlobal', 'global');
  value.data.nextScheduled.resetType = 'banked';
  const verdict = api.reportedVerdict(value.data, now);
  assert.equal(verdict.scheduled, true);
  assert.equal(verdict.type, 'banked');
  assert.equal(verdict.percent, 86);
});

test('a joint schedule stays visible until both kinds completed, then reports the joint conclusion', () => {
  const { api } = client();
  const partial = completeTodaySlot('latestBanked', 'banked');
  partial.data.nextScheduled.resetType = 'global_and_banked';
  let verdict = api.reportedVerdict(partial.data, now);
  assert.equal(verdict.scheduled, true);
  assert.equal(verdict.type, 'global_and_banked');
  const separate = structuredClone(partial);
  separate.data.latestGlobal.kind = 'reset_completed';
  separate.data.latestGlobal.resetType = 'global';
  separate.data.latestGlobal.completedAt = '2026-10-22T10:30:00Z';
  verdict = api.reportedVerdict(separate.data, now);
  assert.equal(verdict.scheduled, false);
  assert.equal(verdict.answerKey, 'todayYes');
  const rendered = summaryText(api.ResetSummary({ data: separate.data, t, localeId: 'en', now }));
  assert.match(rendered, /typeGlobalBanked/);
  assert.doesNotMatch(rendered, /upcomingQuestion/);
});

test('one joint completion covers both kinds and its double-slot snapshot stays joint', () => {
  const { api } = client();
  const value = completeTodaySlot('latestGlobal', 'global_and_banked', '2026-10-22T10:00:00Z');
  value.data.nextScheduled.resetType = 'global_and_banked';
  value.data.latestBanked = structuredClone(value.data.latestGlobal);
  const verdict = api.reportedVerdict(value.data, now);
  assert.equal(verdict.scheduled, false);
  assert.equal(verdict.answerKey, 'todayYes');
  const rendered = summaryText(api.ResetSummary({ data: value.data, t: (key) => api.zh[key], localeId: 'zh-CN', now }));
  assert.match(rendered, /全体重置 \+ 重置卡/);
  assert.doesNotMatch(rendered, /upcomingQuestion/);
});

test('an unknown-type completion never suppresses a typed forecast and stays unknown alone', () => {
  const { api } = client();
  const withForecast = completeTodaySlot('latestGlobal', 'weird');
  let verdict = api.reportedVerdict(withForecast.data, now);
  assert.equal(verdict.scheduled, true);
  assert.equal(verdict.type, 'global');
  assert.equal(verdict.percent, 86);
  assert.equal(api.todayCompletionCoverage(withForecast.data, now).unknown, true);
  const alone = structuredClone(withForecast);
  alone.data.nextScheduled = null;
  verdict = api.reportedVerdict(alone.data, now);
  assert.equal(verdict.scheduled, false);
  assert.equal(verdict.answerKey, 'todayYes');
  const rendered = summaryText(api.ResetSummary({ data: alone.data, t, localeId: 'en', now }));
  assert.match(rendered, /typeUnknown/);
  assert.doesNotMatch(rendered, /typeGlobal|upcomingQuestion/);
});

test('an unknown-type schedule keeps its forecast even when an unknown reset completed', () => {
  const { api } = client();
  const value = completeTodaySlot('latestGlobal', 'weird');
  value.data.nextScheduled.resetType = 'mystery';
  const verdict = api.reportedVerdict(value.data, now);
  assert.equal(verdict.scheduled, true);
  assert.equal(verdict.type, 'unknown');
});

test('unknown completion times preserve a valid forecast without claiming a completion', () => {
  const { api } = client();
  const value = structuredClone(fixture);
  for (const record of [value.data.latestGlobal, value.data.latestBanked]) {
    record.completedAt = null;
    record.effectiveAt = null;
    record.announcedAt = null;
  }
  assert.equal(api.resetHappenedToday(value.data, now), null);
  for (const type of ['global', 'banked', 'global_and_banked', 'future_type', null]) {
    value.data.nextScheduled.resetType = type;
    const verdict = api.reportedVerdict(value.data, now);
    assert.equal(verdict.scheduled, true, String(type));
    assert.equal(verdict.percent, 86, String(type));
    assert.equal(verdict.completed, null, String(type));
    assert.equal(verdict.type, type === 'future_type' || type === null ? 'unknown' : type);
  }
  value.data.nextScheduled = null;
  assert.equal(api.reportedVerdict(value.data, now).answerKey, 'todayUnknown');
});

test('today completion events carry types and dedupe a joint record across slots', () => {
  const { api } = client();
  const value = structuredClone(fixture);
  value.data.nextScheduled = null;
  const joint = structuredClone(value.data.latestBanked);
  joint.kind = 'reset_completed';
  joint.resetType = 'global_and_banked';
  joint.completedAt = '2026-10-22T10:00:00Z';
  joint.id = 'joint-1';
  value.data.latestGlobal = structuredClone(joint);
  value.data.latestBanked = structuredClone(joint);
  const events = api.todayCompletionEvents(value.data, now);
  assert.deepEqual([...events.map((event) => event.key)], ['id:joint-1']);
  assert.deepEqual([...events.map((event) => event.type)], ['global_and_banked']);
});

test('same-day sequential completions of different types notify separately with their types', async () => {
  const c = client();
  await c.api.ensureStatus('zh-CN', true);
  c.respond(completeTodaySlot('latestGlobal', 'global', '2026-10-22T09:00:00Z'));
  await c.api.ensureStatus('zh-CN', true);
  assert.deepEqual(c.notifications.map((notice) => notice.title), ['Codex 已经重置（全体重置）']);
  const value = completeTodaySlot('latestGlobal', 'global', '2026-10-22T09:00:00Z');
  value.data.latestBanked = {
    ...structuredClone(fixture.data.latestBanked),
    id: 'banked-done',
    resetType: 'banked',
    completedAt: '2026-10-22T10:00:00Z',
  };
  c.respond(value);
  await c.api.ensureStatus('zh-CN', true);
  assert.deepEqual(c.notifications.map((notice) => notice.title), [
    'Codex 已经重置（全体重置）', 'Codex 已经重置（重置卡）',
  ]);
});

test('fresh global and banked completions in one snapshot announce the combined type once', async () => {
  const c = client();
  await c.api.ensureStatus('zh-CN', true);
  const value = structuredClone(fixture);
  value.data.nextScheduled = null;
  value.data.latestGlobal.completedAt = '2026-10-22T09:00:00Z';
  value.data.latestBanked.completedAt = '2026-10-22T09:30:00Z';
  c.respond(value);
  await c.api.ensureStatus('zh-CN', true);
  assert.deepEqual(c.notifications.map((notice) => notice.title), ['Codex 已经重置（全体重置 + 重置卡）']);
});

test('compact history sorts by completion time and keeps both accessible type labels', () => {
  const { api } = client();
  const value = structuredClone(fixture);
  value.data.nextScheduled = null;
  value.data.latestGlobal.completedAt = '2026-10-22T08:00:00Z';
  const tree = api.ResetHistory({ data: value.data, t: (key) => api.zh[key], localeId: 'zh-CN', now });
  const rows = descendants(tree).filter(n => n.props?.className === 'dcr-summary-latest');
  assert.equal(rows.length, 2);
  assert.match(rows[0].props['aria-label'], /最近全体重置/);
  assert.match(rows[1].props['aria-label'], /最近重置卡/);
  assert.ok(rows.every(row => descendants(row).some(n => n.tag === 'time')));
  assert.doesNotMatch(textOf(tree), /最近全体重置|全体重置 \+ 重置卡/);
  value.data.latestBanked.completedAt = '2026-10-22T09:00:00Z';
  const reversed = api.ResetHistory({ data: value.data, t: (key) => api.zh[key], localeId: 'zh-CN', now });
  const reversedRows = descendants(reversed).filter(n => n.props?.className === 'dcr-summary-latest');
  assert.match(reversedRows[0].props['aria-label'], /最近重置卡/);
  assert.match(reversedRows[1].props['aria-label'], /最近全体重置/);
  for (const field of ['completedAt', 'effectiveAt', 'announcedAt']) {
    value.data.latestGlobal[field] = 'invalid time';
  }
  const undated = api.ResetHistory({ data: value.data, t: (key) => api.zh[key], localeId: 'zh-CN', now });
  const undatedRows = descendants(undated).filter(n => n.props?.className === 'dcr-summary-latest');
  assert.match(undatedRows[0].props['aria-label'], /最近重置卡/);
  assert.match(textOf(undatedRows[1]), /时间未知/);
  const joint = {...value.data.latestGlobal, resetType: 'global_and_banked'};
  value.data.latestGlobal = joint;
  value.data.latestBanked = structuredClone(joint);
  const joined = api.ResetHistory({ data: value.data, t: (key) => api.zh[key], localeId: 'zh-CN', now });
  const joinedRows = descendants(joined).filter(n => n.props?.className === 'dcr-summary-latest');
  assert.ok(joinedRows.every(row => row.props.title.includes('全体重置 + 重置卡')));
});

test('the dock reserves its compact forecast width in both languages', () => {
  const c = client();
  for (const localeId of ['zh-CN', 'en']) {
    const tree = c.renderDock(localeId);
    const dockDiv = descendants(tree).find((node) => node.props?.className === 'dcr-dock');
    const label = textOf(dockDiv);
    assert.ok(label.includes('≥88%'), label);
    assert.ok(label.includes('100%'), label);
  }
});

test('the primary heading explicitly reports no completion despite a future forecast', () => {
  const { api } = client();
  const tree = api.ResetSummary({data: fixture.data, t: (key) => api.zh[key], localeId: 'zh-CN', now});
  const forecast = descendants(tree).find(n => n.props?.className === 'dcr-forecast');
  const answer = descendants(forecast).find(n => n.props?.className === 'dcr-reset-state');
  assert.equal(textOf(answer), '否');
  assert.match(tree.props['aria-label'], /今天重置了吗？ 否/);
  const heading = descendants(forecast).find(n => n.tag === 'h3');
  assert.equal(visibleText(heading), '今天重置了吗？否');
  assert.equal(descendants(forecast).some(n => n.tag === 'svg'), false);
  assert.match(textOf(forecast), /明天 02:00/);
  assert.match(textOf(forecast), /≥86%/);
});

test('the primary heading shows the confirmed reset type in both languages', () => {
  const { api } = client();
  for (const [slot, type, forecastType, zhType, enType] of [
    ['latestBanked', 'banked', 'global', '重置卡', 'Banked reset'],
    ['latestGlobal', 'global', 'banked', '全体重置', 'Global reset'],
    ['latestGlobal', 'global_and_banked', 'global_and_banked', '全体重置 + 重置卡', 'Global + Banked reset'],
    ['latestGlobal', 'future_type', 'global', '类型未知', 'Unknown type'],
  ]) {
    const value = completeTodaySlot(slot, type);
    value.data.nextScheduled.resetType = forecastType;
    for (const [localeId, messages, expected, typeLabel] of [['zh-CN', api.zh, '是', zhType], ['en', api.en, 'Yes', enType]]) {
      const tree = api.ResetSummary({data: value.data, t: (key) => messages[key], localeId, now});
      const heading = descendants(tree).find(n => n.tag === 'h3');
      const answer = descendants(heading).find(n => n.props?.className === 'dcr-reset-state');
      assert.equal(textOf(answer), expected);
      assert.ok(visibleText(heading).includes(typeLabel), `${localeId}: ${typeLabel} is missing from the visible heading`);
      if (type !== forecastType) {
        assert.ok(!visibleText(heading).includes(messages[api.resetTypeLabelKey(forecastType)]));
      }
    }
  }
});

test('unknown completion timestamps stay explicitly unknown while the valid forecast remains', () => {
  const { api } = client();
  const data = structuredClone(fixture.data);
  for (const record of [data.latestGlobal, data.latestBanked]) {
    record.completedAt = record.effectiveAt = record.announcedAt = null;
  }
  const tree = api.ResetSummary({data, t: (key) => api.zh[key], localeId: 'zh-CN', now});
  const heading = descendants(tree).find(n => n.tag === 'h3');
  const answer = descendants(heading).find(n => n.props?.className === 'dcr-reset-state');
  assert.equal(textOf(answer), '—');
  assert.equal(visibleText(heading), '今天重置了吗？—');
  assert.equal(heading.props['aria-label'], '今天重置了吗？ 无法确认');
  assert.match(textOf(tree), /≥86%/);
});

test('a source post renders one language and offers a single button for the other', () => {
  const { api } = client();
  for (const [localeId, expected, switchLabel] of [
    ['zh-CN', fixture.data.nextScheduled.translatedText, 'English'],
    ['en', fixture.data.nextScheduled.text, '中文'],
  ]) {
    const post = api.TiboPost({data: fixture.data, localeId, t: (key) => api.en[key]});
    assert.equal(post.tag, 'article');
    const source = descendants(post).find(n => n.tag === 'a');
    assert.equal(source.props.href, fixture.data.nextScheduled.source.url);
    const paragraphs = descendants(post).filter(n => n.props?.className === 'dcr-tibo-text');
    assert.equal(paragraphs.length, 1);
    assert.equal(paragraphs[0].props.lang, localeId);
    assert.equal(textOf(paragraphs[0]), expected);
    const controls = descendants(post).filter(n => n.props?.className === 'dcr-post-language');
    assert.equal(controls.length, 1);
    assert.equal(textOf(controls[0]), switchLabel);
  }
});

function operatorCompletionFixture() {
  const completionId = 'manual:completion';
  const completedAt = '2026-11-12T22:30:00.000Z';
  const status = {
    ok: true,
    data: {
      currentTime: '2026-11-13T06:20:00.000Z',
      timeZone: 'Asia/Shanghai',
      latestGlobal: { ...fixture.data.latestGlobal, announcedAt: '2026-10-28T06:29:38.000Z' },
      latestBanked: {
        id: completionId,
        kind: 'reset_completed',
        resetType: 'banked',
        announcedAt: null,
        effectiveAt: completedAt,
        completedAt,
        text: null,
        translatedText: null,
        source: { origin: 'operator', postId: null, handle: null, url: null },
        relatedRecordIds: ['102', '103', '105', '106', '107', '108'],
      },
      nextScheduled: null,
    },
  };
  const schedule = (id, fields) => ({
    id,
    kind: 'reset_scheduled',
    resetType: 'banked',
    announcedAt: '2026-11-12T21:59:39.000Z',
    effectiveAt: '2026-11-12T08:00:00.000Z',
    completedAt,
    text: 'The banked reset has been activated.',
    translatedText: '重置卡已启用。',
    source: { origin: 'x', postId: id, handle: 'thsottiaux', url: 'https://x.com/thsottiaux/status/' + id },
    scheduleState: 'fulfilled',
    completionRecordId: completionId,
    ...fields,
  });
  const announcement = schedule('101');
  const records = {
    ok: true,
    data: {
      items: [
        schedule('104', {
          announcedAt: '2026-11-12T22:20:00.000Z',
          completionRecordId: 'manual:unrelated',
          text: 'Unrelated reset announced on the same day.',
        }),
        schedule('103', {
          announcedAt: '2026-11-12T22:10:00.000Z',
          source: { origin: 'x', postId: '103', handle: 'thsottiaux', url: 'https://x.com/another/status/103' },
        }),
        schedule('105', {
          announcedAt: '2026-11-12T22:22:00.000Z',
          completionRecordId: 'manual:unrelated',
        }),
        schedule('106', {
          announcedAt: '2026-11-12T22:23:00.000Z',
          completionRecordId: null,
          scheduleState: 'pending',
        }),
        schedule('107', { announcedAt: 'invalid announcement date' }),
        schedule('108', {
          announcedAt: '2026-11-12T22:24:00.000Z',
          text: '  ',
          translatedText: null,
        }),
        schedule('102', { announcedAt: '2026-11-11T06:57:08.000Z', completionRecordId: null, text: 'Earlier hint.' }),
        announcement,
      ],
    },
  };
  return { status, records, announcement, completedAt };
}

const jsonResponse = (body, init = {}) => ({
  ok: true, headers: new Headers(), json: async () => body, ...init,
});
const featuredPost = (tree) => descendants(tree).find(n => n.props?.className === 'dcr-tibo-post');

test('a manual Banked completion shows its newest linked Tibo announcement after refresh', async () => {
  const c = client();
  const { status, records, announcement, completedAt } = operatorCompletionFixture();
  const current = Date.parse(status.data.currentTime);
  c.advance(current - now);
  c.respond((raw) => jsonResponse(new URL(raw).pathname.endsWith('/status') ? status : records));
  await c.api.ensureStatus('zh-CN', true);
  await flush();
  dockButton(c.renderDock()).props.onClick();
  for (const [localeId, message, other] of [
    ['zh-CN', announcement.translatedText, 'English'],
    ['en', announcement.text, '中文'],
  ]) {
    const post = featuredPost(c.renderDock(localeId));
    const nodes = descendants(post);
    assert.equal(textOf(nodes.find(n => n.props?.className === 'dcr-tibo-text')), message);
    assert.equal(nodes.find(n => n.tag === 'a').props.href, announcement.source.url);
    assert.equal(nodes.find(n => n.tag === 'time').props.dateTime, announcement.announcedAt);
    assert.deepEqual(nodes.filter(n => n.tag === 'button').map(textOf), [other]);
  }
  assert.equal(c.requests.length, 2);
  const recordsUrl = new URL(c.requests[1].url);
  assert.equal(recordsUrl.pathname, '/openapi/v1/records');
  assert.equal(recordsUrl.searchParams.get('kind'), 'reset_scheduled');
  assert.equal(recordsUrl.searchParams.get('lang'), 'zh-CN');
  const tree = c.renderDock();
  assert.equal(textOf(descendants(tree).find(n => n.props?.className === 'dcr-reset-state')), '是');
  assert.match(textOf(tree), /暂无排期/);
  const history = descendants(tree).find(n => n.props?.className === 'dcr-recent');
  assert.equal(descendants(history).find(n => n.tag === 'time').props.dateTime, completedAt);
});

test('a direct related ID can recover a fulfilled announcement and preserve authorless X URLs', async () => {
  const c = client();
  const { status, records, announcement } = operatorCompletionFixture();
  status.data.latestBanked.relatedRecordIds = [announcement.id];
  announcement.completionRecordId = null;
  announcement.source.url = 'https://twitter.com/i/web/status/' + announcement.id;
  c.respond((raw) => jsonResponse(new URL(raw).pathname.endsWith('/status') ? status : records));
  await c.api.ensureStatus('en', true);
  await flush();
  dockButton(c.renderDock('en')).props.onClick();
  const post = featuredPost(c.renderDock('en'));
  assert.equal(descendants(post).find(n => n.tag === 'a').props.href, announcement.source.url);
});

test('a slow supplemental request leaves the status and notification ready, then can retry', async () => {
  const c = client();
  const { status, records, announcement } = operatorCompletionFixture();
  const initial = structuredClone(status);
  initial.data.latestBanked = null;
  c.advance(Date.parse(status.data.currentTime) - now);
  c.respond(initial);
  await c.api.ensureStatus('zh-CN', true);
  dockButton(c.renderDock()).props.onClick();
  let relatedSignal;
  c.respond((raw, { signal }) => {
    if (new URL(raw).pathname.endsWith('/status')) return jsonResponse(status);
    relatedSignal = signal;
    return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason)));
  });
  await c.api.ensureStatus('zh-CN', true);
  assert.equal(c.api.statusStore.getSnapshot().phase, 'ready');
  assert.equal(c.notifications.length, 1);
  assert.equal(descendants(featuredPost(c.renderDock())).find(n => n.tag === 'a').props.href, status.data.latestGlobal.source.url);
  assert.equal(c.timeouts.size, 1);
  for (const timeout of c.timeouts.keys()) timeout();
  await flush();
  assert.equal(relatedSignal.aborted, true);
  assert.equal(c.timeouts.size, 0);
  assert.equal(c.api.statusStore.getSnapshot().phase, 'ready');
  c.respond((raw) => jsonResponse(new URL(raw).pathname.endsWith('/status') ? status : records));
  await c.api.ensureStatus('zh-CN', true);
  assert.equal(c.requests.filter(r => new URL(r.url).pathname.endsWith('/records')).length, 1);
  c.advance(60_001);
  await c.api.ensureStatus('zh-CN', true);
  await flush();
  assert.equal(c.requests.filter(r => new URL(r.url).pathname.endsWith('/records')).length, 2);
  assert.equal(descendants(featuredPost(c.renderDock())).find(n => n.tag === 'a').props.href, announcement.source.url);
  assert.equal(c.notifications.length, 1);
});

test('a new completion can fetch its own linked post after an older lookup finishes', async () => {
  const c = client();
  const { status, records, announcement } = operatorCompletionFixture();
  const updatedStatus = structuredClone(status);
  updatedStatus.data.latestBanked.id = 'manual:later-completion';
  updatedStatus.data.latestBanked.relatedRecordIds = ['201'];
  const later = {
    ...announcement,
    id: '201',
    announcedAt: '2026-11-12T22:09:00.000Z',
    completionRecordId: updatedStatus.data.latestBanked.id,
    source: { ...announcement.source, postId: '201', url: 'https://x.com/thsottiaux/status/201' },
  };
  let finish;
  c.respond((raw) => {
    if (new URL(raw).pathname.endsWith('/status')) return jsonResponse(status);
    return new Promise((resolve) => { finish = () => resolve(jsonResponse(records)); });
  });
  await c.api.ensureStatus('en', true);
  c.respond((raw) => jsonResponse(new URL(raw).pathname.endsWith('/status')
    ? updatedStatus : { ok: true, data: { items: [later] } }));
  await c.api.ensureStatus('en', true);
  assert.equal(c.requests.length, 3);
  finish();
  await flush();
  assert.equal(c.requests.length, 4);
  dockButton(c.renderDock('en')).props.onClick();
  const post = featuredPost(c.renderDock('en'));
  assert.equal(descendants(post).find(n => n.tag === 'a').props.href, later.source.url);
});

test('a rate-limited history refresh preserves the displayed source post during cooldown', async () => {
  const c = client();
  const { status, records, announcement } = operatorCompletionFixture();
  let recordsRequests = 0;
  c.respond((raw) => {
    if (new URL(raw).pathname.endsWith('/status')) return jsonResponse(status);
    recordsRequests += 1;
    if (recordsRequests !== 2) return jsonResponse(records);
    return jsonResponse({ ok: false, error: 'rate_limited' }, {
      ok: false, status: 429, headers: new Headers({ 'Retry-After': '120' }),
    });
  });
  await c.api.ensureStatus('en', true);
  await flush();
  dockButton(c.renderDock('en')).props.onClick();
  c.advance(60_001);
  await c.api.ensureStatus('en', true);
  await flush();
  assert.equal(c.api.statusStore.getSnapshot().phase, 'ready');
  assert.equal(descendants(featuredPost(c.renderDock('en'))).find(n => n.tag === 'a').props.href, announcement.source.url);
  c.advance(61_000);
  await c.api.ensureStatus('en', true);
  assert.equal(recordsRequests, 2);
  c.advance(60_000);
  await c.api.ensureStatus('en', true);
  await flush();
  assert.equal(recordsRequests, 3);
});

test('missing translation falls back to available source text without inventing a translation', () => {
  const { api } = client();
  const data = structuredClone(fixture.data);
  data.nextScheduled.translatedText = null;
  const post = api.TiboPost({data, localeId: 'zh-CN', preferredLanguage: 'zh-CN', t: (key) => api.zh[key]});
  const paragraph = descendants(post).find(n => n.props?.className === 'dcr-tibo-text');
  assert.equal(paragraph.props.lang, 'en');
  assert.equal(textOf(paragraph), data.nextScheduled.text);
  assert.equal(descendants(post).some(n => n.props?.className === 'dcr-post-language'), false);
});

test('source language selection calls the supplied handler with the requested language', () => {
  const { api } = client();
  const changes = [];
  const post = api.TiboPost({data: fixture.data, localeId: 'zh-CN', t, onLanguageChange: language => changes.push(language)});
  const english = descendants(post).find(n => n.props?.className === 'dcr-post-language' && textOf(n) === 'English');
  english.props.onClick();
  assert.deepEqual(changes, ['en']);
});
