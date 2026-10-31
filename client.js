window.__ModuleLoader__.load({
  id: 'dsh-codex-reset-tracker',
  factory(require) {
    const React = require('react');
    const { useState, useEffect, useMemo, useCallback, useLayoutEffect, useRef } = React;
    const h = React.createElement;
    const useSyncExternalStore = React.useSyncExternalStore;

    const NS = 'codex-reset';
    const API_BASE = 'https://didcodexreset.com/openapi/v1';
    const SITE_URL = 'https://didcodexreset.com/zh/';
    const TIBO_TRANSLATION_LANG = 'zh-CN';
    const TIBO_AVATAR_DATA_URI = 'data:image/webp;base64,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';
    const AUTO_REFRESH_MS = 10 * 60 * 1000;
    const INTERACTIVE_REFRESH_MS = 60 * 1000;
    const REQUEST_TIMEOUT_MS = 20 * 1000;
    const RESET_NOTICE_STORAGE_KEY = 'dsh-codex-reset-tracker.reset-notice.v1';
    const MAX_RESET_NOTICE_KEYS = 128;
    const zh = {
      'title': 'Codex 重置追踪',
      'refresh': '刷新 Codex 重置状态',
      'close': '关闭',
      'statusOf': 'Codex 重置追踪状态',
      'justNow': '刚刚',
      'minAgo': '{n} 分钟前',
      'hourAgo': '{n}小时前',
      'dayAgo': '{n} 天前',
      'noSchedule': '暂无排期',
      'scheduleUnknown': '排期时间未知',
      'scheduledAt': '预计 {time}',
      'errorTitle': '加载失败',
      'errorStale': '更新失败，仍显示上次抓取的信号。',
      'retryAfter': '请求过于频繁，请 {n} 秒后重试。',
      'retryIn': '{n} 秒后重试',
      'retry': '重试',
      'typeGlobal': 'Global',
      'typeBanked': '重置卡',
      'typeGlobalBanked': '全局 + 重置卡',
      'typeUnknown': '范围未知',
      'precisionDate': '按日期排期',
      'noTime': '时间未知',
      'latestReset': '最近完成重置',
      'noResetSummary': '暂无重置记录',
      'todayQuestion': '今天重置了吗？',
      'todayYes': '是',
      'todayNo': '否',
      'upcomingQuestion': '接下来会有 Codex 重置吗？',
      'scheduledReport': '原站报道 · 已排期',
      'localTimeZone': '本地时区：{zone}',
      'fetchedAt': '获取于 {time}',
      'todayUnknown': '无法确认',
      'completionAnnouncementTime': '按完成公告时间：{time}',
      'nextScheduleLabel': '预计下次重置',
      'scheduleToday': '（今天）',
      'scheduleTomorrow': '（明天）',
      'viewOriginal': '查看原帖',
      'dataSource': '数据来源',
      'refreshFetched': '刷新；上次获取于 {time}',
      'openTiboPost': '打开 Tibo 原帖',
      'notifyReset': 'Codex 已经重置',
      'notifyAsk': '开启系统通知',
      'notifyOn': '系统通知已开启',
      'notifyBlocked': '系统通知已被阻止',
    };

    const en = {
      'title': 'Codex Reset Tracker',
      'refresh': 'Refresh Codex reset status',
      'close': 'Close',
      'statusOf': 'Codex reset status',
      'justNow': 'just now',
      'minAgo': '{n} min ago',
      'hourAgo': '{n} h ago',
      'dayAgo': '{n} d ago',
      'noSchedule': 'No scheduled reset',
      'scheduleUnknown': 'Schedule time unknown',
      'scheduledAt': 'Expected {time}',
      'errorTitle': 'Failed to load',
      'errorStale': 'Update failed. Showing the last fetched signal.',
      'retryAfter': 'Rate limited. Retry in {n}s.',
      'retryIn': 'Retry in {n}s',
      'retry': 'Retry',
      'typeGlobal': 'Global',
      'typeBanked': 'Banked',
      'typeGlobalBanked': 'Global + Banked',
      'typeUnknown': 'Unknown scope',
      'precisionDate': 'date-level schedule',
      'noTime': 'time unknown',
      'latestReset': 'Latest completed reset',
      'noResetSummary': 'No reset record',
      'todayQuestion': 'Reset today?',
      'todayYes': 'Yes',
      'todayNo': 'No',
      'upcomingQuestion': 'Will there be a Codex reset?',
      'scheduledReport': 'Source report · Scheduled',
      'localTimeZone': 'Local time zone: {zone}',
      'fetchedAt': 'Fetched {time}',
      'todayUnknown': 'Unable to confirm',
      'completionAnnouncementTime': 'Using completion announcement time: {time}',
      'nextScheduleLabel': 'Next expected reset',
      'scheduleToday': '(Today)',
      'scheduleTomorrow': '(Tomorrow)',
      'viewOriginal': 'View original post',
      'dataSource': 'Source',
      'refreshFetched': 'Refresh; last fetched {time}',
      'openTiboPost': 'Open Tibo post',
      'notifyReset': 'Codex has reset',
      'notifyAsk': 'Enable notifications',
      'notifyOn': 'Notifications on',
      'notifyBlocked': 'Notifications blocked',
    };

    function makeT(raw) {
      return (key, params) => {
        let text;
        try {
          text = raw(key);
        } catch {
          text = undefined;
        }
        if (typeof text !== 'string') text = key;
        if (params) {
          text = text.replace(/\{(\w+)\}/g, (match, name) =>
            params[name] === undefined || params[name] === null ? match : String(params[name]),
          );
        }
        return text;
      };
    }

    function localeIdOf(service) {
      if (!service) return 'en';
      for (const getter of ['getSnapshot', 'getLocale']) {
        try {
          const snap = typeof service[getter] === 'function' ? service[getter]() : null;
          if (typeof snap === 'string') return snap;
          if (snap && typeof snap.active === 'string') return snap.active;
          if (snap && snap.active && typeof snap.active.id === 'string') return snap.active.id;
          if (snap && snap.active && typeof snap.active.locale === 'string') return snap.active.locale;
          if (snap && typeof snap.id === 'string') return snap.id;
          if (snap && typeof snap.locale === 'string') return snap.locale;
        } catch {}
      }
      return 'en';
    }

    const isZh = (id) => String(id || '').toLowerCase().startsWith('zh');
    const siteLangOf = (id) => (isZh(id) ? 'zh-CN' : 'en');
    const intlLocaleOf = (id) => (isZh(id) ? 'zh-CN' : 'en');

    function fmtAbs(iso, localeId) {
      const date = new Date(iso);
      if (Number.isNaN(date.getTime())) return '-';
      try {
        return new Intl.DateTimeFormat(intlLocaleOf(localeId), {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(date);
      } catch {
        return date.toISOString().slice(0, 16).replace('T', ' ');
      }
    }

    function fmtAbsExact(iso, localeId) {
      const date = new Date(iso);
      if (Number.isNaN(date.getTime())) return '';
      try {
        return new Intl.DateTimeFormat(intlLocaleOf(localeId), {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }).format(date);
      } catch {
        return date.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, 'Z');
      }
    }

    function fmtAbsCompact(iso, localeId) {
      const date = new Date(iso);
      if (Number.isNaN(date.getTime())) return '';
      try {
        const parts = new Intl.DateTimeFormat(intlLocaleOf(localeId), {
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hourCycle: 'h23',
          numberingSystem: 'latn',
        }).formatToParts(date);
        const fields = Object.fromEntries(parts.map((part) => [part.type, part.value]));
        return fields.month + '/' + fields.day + ' ' + fields.hour + ':' + fields.minute;
      } catch {
        return String(date.getMonth() + 1).padStart(2, '0') + '/' +
          String(date.getDate()).padStart(2, '0') + ' ' +
          String(date.getHours()).padStart(2, '0') + ':' +
          String(date.getMinutes()).padStart(2, '0');
      }
    }

    function fmtRel(iso, t, now) {
      const at = Date.parse(iso);
      if (Number.isNaN(at)) return '-';
      const seconds = Math.max(0, Math.round((now - at) / 1000));
      if (seconds < 45) return t('justNow');
      const minutes = Math.round(seconds / 60);
      if (minutes < 60) return t('minAgo', { n: minutes });
      const hours = Math.round(minutes / 60);
      if (hours < 24) return t('hourAgo', { n: hours });
      return t('dayAgo', { n: Math.round(hours / 24) });
    }

    // Prefer completedAt, then effectiveAt, and use announcedAt when needed.
    function resetCompletionTime(record) {
      if (!record) return null;
      let firstAvailable = null;
      for (const field of ['completedAt', 'effectiveAt', 'announcedAt']) {
        const value = record[field];
        if (typeof value !== 'string' || !value.trim()) continue;
        const candidate = { value: value.trim(), field };
        if (!firstAvailable) firstAvailable = candidate;
        if (Number.isFinite(Date.parse(candidate.value))) return candidate;
      }
      return firstAvailable;
    }

    function resolveSummaryTimeZone(apiTimeZone) {
      try {
        const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (localTimeZone) {
          new Intl.DateTimeFormat('en', { timeZone: localTimeZone });
          return localTimeZone;
        }
      } catch {
        // Use the API zone only when the browser has no usable local zone.
      }
      if (typeof apiTimeZone === 'string' && apiTimeZone.trim()) {
        try {
          new Intl.DateTimeFormat('en', { timeZone: apiTimeZone.trim() });
          return apiTimeZone.trim();
        } catch {
          // Intl's default zone remains the final fallback.
        }
      }
      return undefined;
    }

    function dateKeyAt(instant, timeZone) {
      const at = typeof instant === 'number' ? instant : Date.parse(instant || '');
      if (!Number.isFinite(at)) return null;
      try {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        if (timeZone) options.timeZone = timeZone;
        const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(new Date(at));
        const fields = Object.fromEntries(parts.map((part) => [part.type, part.value]));
        if (!fields.year || !fields.month || !fields.day) return null;
        return fields.year + '-' + fields.month + '-' + fields.day;
      } catch {
        return null;
      }
    }

    function resetHappenedToday(data, now) {
      if (!data) return null;
      const hasResetSummaryData = ['latestGlobal', 'latestBanked', 'nextScheduled']
        .some((field) => Object.prototype.hasOwnProperty.call(data, field));
      if (!hasResetSummaryData) return null;
      const timeZone = resolveSummaryTimeZone(data.timeZone);
      const currentAt = Number.isFinite(now)
        ? now
        : Date.parse(data.currentTime || '');
      const today = dateKeyAt(currentAt, timeZone);
      if (!today) return null;

      const records = [data.latestGlobal, data.latestBanked].filter(Boolean);
      if (!records.length) return false;
      let unresolved = false;
      for (const record of records) {
        if (record.kind === 'reset_scheduled') continue;
        if (record.kind && record.kind !== 'reset_completed') {
          unresolved = true;
          continue;
        }
        const eventTime = resetCompletionTime(record);
        const eventDay = eventTime && dateKeyAt(eventTime.value, timeZone);
        if (!eventDay) {
          unresolved = true;
          continue;
        }
        if (eventDay === today) return true;
      }
      return unresolved ? null : false;
    }

    // Report the public page's live-schedule headline: confidence + Yes.
    // This presentation never changes the schedule into a completion record.
    function reportedVerdict(data, now) {
      const completedToday = resetHappenedToday(data, now);
      const daily = {
        questionKey: 'todayQuestion',
        answerKey: completedToday === null ? 'todayUnknown' : completedToday ? 'todayYes' : 'todayNo',
        percent: null,
        scheduled: false,
      };
      if (completedToday === true) return daily;
      const next = data && data.nextScheduled;
      if (!next || next.kind !== 'reset_scheduled' ||
          (next.scheduleState && next.scheduleState !== 'pending')) return daily;
      const window = next.scheduleWindow;
      const target = (window && (window.endAt || window.startAt)) || next.effectiveAt;
      const targetAt = Date.parse(target || '');
      const currentAt = Number.isFinite(now) ? now : Date.parse(data.currentTime || '');
      if (!Number.isFinite(targetAt) || !Number.isFinite(currentAt) || targetAt < currentAt) return daily;
      const confidence = next.confidence;
      const percent = typeof confidence === 'number' && Number.isFinite(confidence) &&
        confidence >= 0 && confidence <= 1 ? Math.round(confidence * 100) : null;
      const zone = resolveSummaryTimeZone(data.timeZone);
      const startsAt = (window && window.startAt) || next.effectiveAt;
      const startAt = Date.parse(startsAt || '');
      const coversToday = (Number.isFinite(startAt) && startAt <= currentAt && currentAt < targetAt) ||
        dateKeyAt(startsAt, zone) === dateKeyAt(currentAt, zone) ||
        dateKeyAt(targetAt, zone) === dateKeyAt(currentAt, zone);
      return {
        questionKey: 'upcomingQuestion',
        answerKey: percent !== null || (coversToday && next.scheduleBasis !== 'contextual_inference')
          ? 'todayYes' : 'todayNo',
        percent,
        scheduled: true,
      };
    }

    function latestResetRecord(data) {
      const records = data ? [data.latestGlobal, data.latestBanked].filter(Boolean) : [];
      if (!records.length) return null;
      return records
        .map((record, index) => {
          const time = resetCompletionTime(record);
          return { record, index, at: time ? Date.parse(time.value) : NaN };
        })
        .sort((left, right) => {
          const leftAt = Number.isFinite(left.at) ? left.at : -Infinity;
          const rightAt = Number.isFinite(right.at) ? right.at : -Infinity;
          return rightAt - leftAt || left.index - right.index;
        })[0].record;
    }

    function fmtTiboTime(iso, localeId) {
      const date = new Date(iso);
      if (Number.isNaN(date.getTime())) return '';
      try {
        return new Intl.DateTimeFormat(intlLocaleOf(localeId), {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(date);
      } catch {
        return '';
      }
    }

    async function fetchStatus(lang, signal) {
      const url = new URL(API_BASE + '/status');
      // Request the Chinese translation for the bilingual source post.
      url.searchParams.set('lang', TIBO_TRANSLATION_LANG);
      const timeZone = resolveSummaryTimeZone();
      if (timeZone) url.searchParams.set('timeZone', timeZone);
      let res;
      let body;
      try {
        res = await fetch(url.toString(), { signal, cache: 'no-store', headers: { accept: 'application/json' } });
        body = await res.json();
      } catch (err) {
        if (err && err.name === 'AbortError') throw err;
        const error = new Error(isZh(lang) ? '网络请求失败' : 'network request failed');
        error.kind = 'network';
        throw error;
      }
      const rate = {
        limit: toInt(res.headers.get('X-RateLimit-Limit')),
        remaining: toInt(res.headers.get('X-RateLimit-Remaining')),
        reset: res.headers.get('X-RateLimit-Reset'),
      };
      if (!res.ok || !body || body.ok !== true) {
        const error = new Error((body && (body.detail || body.error)) || 'HTTP ' + res.status);
        error.status = res.status;
        const retryHeader = res.headers.get('Retry-After');
        const retrySeconds = body && typeof body.retryAfter === 'number'
          ? body.retryAfter
          : retryHeader && Number.isFinite(Number(retryHeader))
            ? Number(retryHeader)
            : retryHeader
              ? Math.max(0, Math.ceil((Date.parse(retryHeader) - Date.now()) / 1000))
              : null;
        if (retrySeconds !== null && retrySeconds > 0) error.retryAfter = retrySeconds;
        throw error;
      }
      return { data: body.data, meta: body.meta || null, rate, at: Date.now() };
    }

    function toInt(value) {
      if (value === null || value === undefined || String(value).trim() === '') return null;
      const n = Number(value);
      return Number.isFinite(n) ? n : null;
    }

    function createStore(initial) {
      let state = initial;
      const listeners = new Set();
      return {
        subscribe(cb) {
          listeners.add(cb);
          return () => listeners.delete(cb);
        },
        getSnapshot() {
          return state;
        },
        set(next) {
          state = next;
          for (const cb of listeners) cb();
        },
      };
    }

    /** The module-level snapshot survives client remounts. */
    const statusStore = createStore({ phase: 'loading', entry: null, error: null, lang: null, retryAt: 0 });
    const statusInflight = new Map();
    let statusPollUsers = 0;
    let statusPollLang = null;
    let statusPollTimer = null;
    let requestedLang = null;
    let retryAt = 0;
    /** Recent completion identities observed by this page and shared storage. */
    let resetNoticeKeys = [];
    let resetNoticeReady = false;

    /** Unique event identities, independent of which status slot contains them. */
    function todayCompletionKeys(data, now) {
      if (resetHappenedToday(data, now) !== true) return [];
      const timeZone = resolveSummaryTimeZone(data.timeZone);
      const currentAt = Number.isFinite(now) ? now : Date.parse(data.currentTime || '');
      const today = dateKeyAt(currentAt, timeZone);
      return Array.from(new Set([data.latestGlobal, data.latestBanked]
        .filter((record) => record && (!record.kind || record.kind === 'reset_completed'))
        .map((record) => {
          const time = resetCompletionTime(record);
          const at = time && Date.parse(time.value);
          if (!Number.isFinite(at) || at > currentAt || dateKeyAt(at, timeZone) !== today) return null;
          return record.id ? 'id:' + record.id : 'time:' + record.resetType + ':' + time.value;
        })
        .filter(Boolean)));
    }

    function normalizeResetNoticeKeys(keys) {
      return Array.from(new Set(keys.filter((key) =>
        typeof key === 'string' && key.length > 0 && key.length <= 1024,
      ))).slice(-MAX_RESET_NOTICE_KEYS);
    }

    /** undefined means this browser has not recorded its first baseline. */
    function readStoredResetNotices() {
      try {
        const parsed = JSON.parse(window.localStorage.getItem(RESET_NOTICE_STORAGE_KEY));
        return parsed && Array.isArray(parsed.keys) ? normalizeResetNoticeKeys(parsed.keys) : undefined;
      } catch {
        return undefined;
      }
    }

    function writeStoredResetNotices(keys) {
      try {
        window.localStorage.setItem(RESET_NOTICE_STORAGE_KEY, JSON.stringify({ keys }));
      } catch {
        // Blocked storage still dedupes within this page through in-memory keys.
      }
    }

    function notificationPermission() {
      if (typeof Notification !== 'function') return 'unsupported';
      return Notification.permission || 'default';
    }

    function resetNoticeText() {
      return isZh(requestedLang) ? zh['notifyReset'] : en['notifyReset'];
    }

    function showSystemResetNotice() {
      if (notificationPermission() !== 'granted') return;
      try {
        const notice = new Notification(resetNoticeText(), { tag: 'codex-reset-completed' });
        notice.onclick = () => {
          try {
            window.focus();
          } catch {
            // A background tab cannot always raise itself.
          }
          try {
            notice.close();
          } catch {
            // The browser already dismissed it.
          }
        };
      } catch {
        // Some browsers expose the API but refuse to construct a notification.
      }
    }

    /** Refresh shared seen IDs for every decision; serialize concurrent pages when supported. */
    async function observeResetCompletion(data) {
      const current = todayCompletionKeys(data, Date.now());
      const update = () => {
        const stored = readStoredResetNotices();
        const seen = new Set([...resetNoticeKeys, ...(stored || [])]);
        const baseline = !resetNoticeReady && stored === undefined;
        const fresh = current.some((key) => !seen.has(key));
        resetNoticeReady = true;
        resetNoticeKeys = normalizeResetNoticeKeys([...seen, ...current]);
        writeStoredResetNotices(resetNoticeKeys);
        if (!baseline && fresh) showSystemResetNotice();
      };
      const locks = typeof navigator !== 'undefined' && navigator.locks;
      if (locks && typeof locks.request === 'function') {
        try {
          await locks.request(RESET_NOTICE_STORAGE_KEY, update);
          return;
        } catch {
          // Fall back to shared-storage checks if browser coordination is unavailable.
        }
      }
      update();
    }

    function requestNotificationPermission(onPermission) {
      if (typeof Notification !== 'function' || typeof Notification.requestPermission !== 'function') return;
      let pending;
      try {
        pending = Notification.requestPermission();
      } catch {
        return;
      }
      Promise.resolve(pending).then((value) => onPermission(String(value || 'default')), () => {});
    }

    /**
     * Footer control for the browser's notification permission. Asking needs a
     * click, so the request cannot run unattended when the page loads.
     */
    function NoticePermissionControl(props) {
      const permission = props.permission === undefined ? notificationPermission() : props.permission;
      if (permission === 'unsupported') return null;
      const label = permission === 'granted' ? props.t('notifyOn')
        : permission === 'denied' ? props.t('notifyBlocked') : props.t('notifyAsk');
      const settled = permission === 'granted' || permission === 'denied';
      return h('button', {
        type: 'button',
        className: 'dcr-notify-toggle',
        onClick: settled ? undefined : () => requestNotificationPermission(props.onPermission || (() => {})),
        disabled: settled,
        title: label,
        'aria-label': label,
      }, label);
    }

    function ensureStatus(lang, force) {
      const snapshot = statusStore.getSnapshot();
      const entry = snapshot.entry;
      requestedLang = lang;
      const existing = statusInflight.get(lang);
      if (existing) return existing.promise;
      if (
        !force &&
        entry &&
        entry.lang === lang &&
        Date.now() - entry.at < INTERACTIVE_REFRESH_MS
      ) {
        if (snapshot.phase !== 'error' && snapshot.phase !== 'refreshing') {
          statusStore.set({ ...snapshot, phase: 'ready', lang, error: null });
        }
        return Promise.resolve();
      }
      if (retryAt > Date.now()) return Promise.resolve();

      const old = statusStore.getSnapshot();
      statusStore.set({
        phase: old.entry ? 'refreshing' : 'loading',
        entry: old.entry,
        // A retry is not a successful response; clear the error only on success.
        error: old.error,
        lang,
        retryAt,
      });
      const controller = new AbortController();
      let timedOut = false;
      const timeout = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, REQUEST_TIMEOUT_MS);
      const promise = (async () => {
        try {
          const fresh = await fetchStatus(lang, controller.signal);
          if (requestedLang === lang) {
            retryAt = 0;
            statusStore.set({ phase: 'ready', entry: { ...fresh, lang }, error: null, lang, retryAt: 0 });
            await observeResetCompletion(fresh.data);
          }
        } catch (err) {
          if (err && err.name === 'AbortError' && !timedOut) return;
          if (timedOut) err = new Error(isZh(lang) ? '请求超时，请重试。' : 'Request timed out. Please retry.');
          if (requestedLang === lang) {
            if (err && err.status === 429 && typeof err.retryAfter === 'number') {
              retryAt = Date.now() + err.retryAfter * 1000;
            }
            statusStore.set({
              phase: 'error',
              entry: statusStore.getSnapshot().entry,
              error: err,
              lang,
              retryAt,
            });
          }
        } finally {
          clearTimeout(timeout);
          const current = statusInflight.get(lang);
          if (current && current.promise === promise) statusInflight.delete(lang);
        }
      })();
      statusInflight.set(lang, { lang, promise, controller });
      return promise;
    }

    function refreshVisibleStatus() {
      if (statusPollUsers > 0 && statusPollLang && document.visibilityState === 'visible') {
        ensureStatus(statusPollLang, false);
      }
    }

    function retainStatusPolling(lang) {
      statusPollUsers += 1;
      statusPollLang = lang;
      ensureStatus(lang, false);
      if (!statusPollTimer) {
        document.addEventListener('visibilitychange', refreshVisibleStatus);
        window.addEventListener('focus', refreshVisibleStatus);
        window.addEventListener('online', refreshVisibleStatus);
        statusPollTimer = setInterval(() => {
          if (statusPollUsers > 0 && statusPollLang) ensureStatus(statusPollLang, true);
        }, AUTO_REFRESH_MS);
      }
      return () => {
        statusPollUsers = Math.max(0, statusPollUsers - 1);
        if (statusPollUsers === 0 && statusPollTimer) {
          clearInterval(statusPollTimer);
          document.removeEventListener('visibilitychange', refreshVisibleStatus);
          window.removeEventListener('focus', refreshVisibleStatus);
          window.removeEventListener('online', refreshVisibleStatus);
          statusPollTimer = null;
          statusPollLang = null;
        }
      };
    }

    const strokeProps = {
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.7,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      'aria-hidden': true,
    };

    function ResetGlyph({ size }) {
      const s = size || 14;
      return h(
        'svg',
        { viewBox: '0 0 24 24', width: s, height: s, ...strokeProps },
        h('path', { d: 'M20 12a8 8 0 1 1-2.4-5.7' }),
        h('path', { d: 'M20 3.2v3.4h-3.4' }),
        h('circle', { cx: 12, cy: 12, r: 1.4, fill: 'currentColor', stroke: 'none' }),
      );
    }

    function IconRefresh({ size, className }) {
      const s = size || 13;
      return h(
        'svg',
        { viewBox: '0 0 24 24', width: s, height: s, className, ...strokeProps },
        h('path', { d: 'M20 12a8 8 0 1 1-2.4-5.7' }),
        h('path', { d: 'M20 3.2v3.4h-3.4' }),
      );
    }

    function IconLink({ size }) {
      const s = size || 11;
      return h(
        'svg',
        { viewBox: '0 0 24 24', width: s, height: s, ...strokeProps },
        h('path', { d: 'M14 5h5v5' }),
        h('path', { d: 'M19 5l-8 8' }),
        h('path', { d: 'M18.5 14v3.6A1.4 1.4 0 0 1 17.1 19H6.4A1.4 1.4 0 0 1 5 17.6V6.9A1.4 1.4 0 0 1 6.4 5.5H10' }),
      );
    }

    function IconClose({ size }) {
      const s = size || 13;
      return h(
        'svg',
        { viewBox: '0 0 24 24', width: s, height: s, ...strokeProps },
        h('path', { d: 'M6 6l12 12M18 6L6 18' }),
      );
    }

    function IconAlert({ size }) {
      const s = size || 13;
      return h(
        'svg',
        { viewBox: '0 0 24 24', width: s, height: s, ...strokeProps },
        h('circle', { cx: 12, cy: 12, r: 8.2 }),
        h('path', { d: 'M12 7.8v4.6' }),
        h('circle', { cx: 12, cy: 15.9, r: 0.9, fill: 'currentColor', stroke: 'none' }),
      );
    }

    const CSS = `
.dcr-dock{position:relative;display:inline-flex;flex:0 0 auto;align-items:center;min-width:0;color:var(--dsw-alias-label-primary);font:inherit}
.dcr-dock-button{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:0;min-height:28px;padding:0 6px;border:0;box-sizing:border-box;font:inherit;font-size:12px;font-weight:550;white-space:nowrap;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;transition:background .14s ease}
.dcr-chip-probability{font-variant-numeric:tabular-nums;white-space:pre}
.dcr-chip-probability,.dcr-summary-answer.has-probability{color:#6d28d9}
body[data-ds-dark-theme] .dcr-chip-probability,body[data-ds-dark-theme] .dcr-summary-answer.has-probability{color:#a78bfa}
.dcr-dock-button:hover,.dcr-dock-button[aria-expanded=true]{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font-weight:650}
.dcr-dock-button:focus-visible,.dcr-panel-icon-button:focus-visible,.dcr-refresh-action:focus-visible,.dcr-btn:focus-visible,.dcr-external-link:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}
.dcr-external-link:focus-visible{text-decoration:underline}
.dcr-dock-glyph{display:inline-flex;align-items:center;justify-content:center;flex:none;color:var(--dsw-alias-state-business-primary)}
.dcr-card{position:fixed;z-index:2147483000;box-sizing:border-box;display:flex;flex-direction:column;gap:0;width:min(380px,calc(100vw - 24px));max-height:min(540px,calc(100dvh - 16px));overflow:auto;overscroll-behavior:contain;padding:16px;border:1px solid var(--dsw-alias-border-l1);border-radius:20px;background:var(--dsw-alias-bg-base,var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-label-primary);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);box-shadow:var(--dsw-elevation-prominent,0 8px 28px rgba(9,12,24,.18));font:inherit;animation:dcr-in .16s cubic-bezier(.23,1,.32,1) both}
@keyframes dcr-in{from{opacity:0;transform:translateY(4px) scale(.99)}to{opacity:1;transform:translateY(0) scale(1)}}
.dcr-head{display:flex;align-items:center;justify-content:space-between;gap:8px;min-width:0}
.dcr-title-group{display:flex;align-items:center;gap:8px;min-width:0}
.dcr-title-glyph{display:inline-flex;flex:none;align-items:center;justify-content:center;color:var(--dsw-alias-state-business-primary)}
.dcr-title{margin:0;color:var(--dsw-alias-label-primary);font-size:14px;font-weight:600;line-height:20px;text-wrap:balance}
.dcr-btn{position:relative;display:inline-flex;flex:none;align-items:center;justify-content:center;box-sizing:border-box;width:36px;height:36px;padding:0;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;text-decoration:none;cursor:pointer;transition:background .14s ease,border-color .14s ease,transform .12s ease}
.dcr-btn::before{content:"";position:absolute;inset:-2px}
.dcr-btn:hover:not(:disabled){background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l2)}
.dcr-btn:active:not(:disabled){transform:scale(.98)}
.dcr-btn:disabled{opacity:.58;cursor:default}
.dcr-panel-icon-button{position:relative;display:inline-flex;flex:none;align-items:center;justify-content:center;box-sizing:border-box;width:32px;height:32px;padding:0;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;transition:background .14s ease,color .14s ease,transform .12s ease}
.dcr-panel-icon-button:hover:not(:disabled){background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.dcr-panel-icon-button:active:not(:disabled){transform:scale(.96)}
.dcr-panel-icon-button:disabled{opacity:.58;cursor:default}
.dcr-refresh-action{position:relative;display:inline-flex;flex:none;align-items:center;justify-content:center;box-sizing:border-box;width:32px;height:32px;min-width:32px;min-height:32px;padding:0;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer}
.dcr-refresh-action:hover:not(:disabled){background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.dcr-refresh-action:disabled{opacity:.58;cursor:default}
.dcr-notify-toggle{display:inline-flex;flex:none;align-items:center;min-width:0;max-width:11em;margin-right:4px;padding:0 8px;min-height:32px;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dcr-notify-toggle:hover:not(:disabled){background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.dcr-notify-toggle:disabled{opacity:.58;cursor:default}
.dcr-spin{animation:dcr-rot .8s linear infinite}
@keyframes dcr-rot{to{transform:rotate(360deg)}}
.dcr-status-line{box-sizing:border-box;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);align-items:stretch;gap:16px;width:100%;min-width:0;margin-top:12px;padding:16px;border-radius:12px;background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 6%,var(--dsw-alias-bg-base));color:var(--dsw-alias-label-primary);line-height:1.4;text-align:left}
.dcr-summary-today{display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:8px;min-width:0}
.dcr-summary-question{color:var(--dsw-alias-label-secondary);font-size:13px;font-weight:500;line-height:1.4;overflow-wrap:anywhere}
.dcr-summary-answer{color:var(--dsw-alias-state-business-primary);font-size:32px;font-weight:650;line-height:1;letter-spacing:-.025em}
.dcr-summary-answer.has-probability{font-size:24px;line-height:1.25;overflow-wrap:anywhere}
.dcr-summary-answer.is-unknown{font-size:20px;line-height:1.25;letter-spacing:0}
.dcr-summary-details{display:flex;flex-direction:column;justify-content:center;gap:10px;min-width:0;padding-left:16px;border-left:1px solid var(--dsw-alias-border-l1)}
.dcr-summary-item{display:flex;flex-direction:column;gap:4px;min-width:0}
.dcr-summary-label{color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:500;line-height:1.35}
.dcr-summary-next-label{font-weight:700}
.dcr-summary-value{color:var(--dsw-alias-label-primary);font-size:15px;font-weight:600;line-height:1.35;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
.dcr-summary-subvalue{color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:400;line-height:1.35;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
.dcr-summary-latest .dcr-summary-label{font-size:11px}
.dcr-summary-latest .dcr-summary-value{font-size:14px;font-weight:400}
.dcr-summary-latest .dcr-summary-subvalue{font-size:11px}
.dcr-freshness{margin:10px 0 0;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.5;overflow-wrap:anywhere}
.dcr-summary-meta{color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:400;line-height:1.35}
.dcr-tibo-post{box-sizing:border-box;width:100%;min-width:0;margin-top:16px}
.dcr-tibo-head{display:grid;grid-template-columns:32px minmax(0,1fr);align-items:start;gap:12px;min-width:0}
.dcr-tibo-avatar{display:block;flex:none;width:32px;height:32px;border-radius:50%;object-fit:cover}
.dcr-tibo-main{flex:1;min-width:0}
.dcr-tibo-author{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:4px 8px;min-width:0;color:var(--dsw-alias-label-secondary);font-size:14px;font-weight:400;line-height:20px}
.dcr-tibo-identity{display:inline-flex;align-items:baseline;flex-wrap:wrap;gap:0 6px;min-width:0}
.dcr-tibo-name{color:var(--dsw-alias-label-primary);font-weight:600}
.dcr-tibo-handle{color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:400;line-height:18px}
.dcr-tibo-time{display:block;margin-top:4px;color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:400;line-height:18px;font-variant-numeric:tabular-nums}
.dcr-visually-hidden{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.dcr-tibo-link{flex:none;align-self:center;white-space:nowrap}
.dcr-external-link{display:inline-flex;align-items:center;justify-content:center;gap:.35em;min-height:24px;color:color-mix(in srgb,var(--dsw-alias-state-business-primary) 70%,var(--dsw-alias-label-primary));font-size:13px;font-weight:500;text-decoration:none;text-underline-offset:.2em;white-space:nowrap;transition:color .14s ease,text-decoration-thickness .14s ease}
.dcr-external-link:hover{color:var(--dsw-alias-label-primary);text-decoration:underline;text-decoration-thickness:.12em}
.dcr-tibo-copy{display:flex;flex-direction:column;gap:5px;min-width:0;margin-top:10px}
.dcr-tibo-text{display:-webkit-box;margin:0;color:var(--dsw-alias-label-primary);font-size:16px;font-weight:400;line-height:24px;white-space:pre-line;overflow-wrap:anywhere;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:4}
.dcr-tibo-text.is-original{color:var(--dsw-alias-label-secondary);font-size:14px;line-height:20px}
.dcr-error{display:flex;align-items:flex-start;gap:8px;padding:9px 10px;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 7%,var(--dsw-alias-bg-layer-1))}
.dcr-error-icon{flex:none;margin-top:1px;color:var(--dsw-alias-state-warn-primary)}
.dcr-error-main{flex:1;min-width:0}
.dcr-error-title{color:var(--dsw-alias-label-primary);font-size:.875em;font-weight:500;line-height:1.4}
.dcr-error-text{margin-top:.2em;color:var(--dsw-alias-label-secondary);font-size:.8125em;line-height:1.45;overflow-wrap:anywhere}
.dcr-error .dcr-btn{width:auto;min-width:36px;height:32px;padding:0 10px;font-size:.8125em;white-space:nowrap}
.dcr-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;min-width:0;margin-top:16px;padding-top:8px;border-top:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.dcr-foot-tools{display:inline-flex;align-items:center;justify-content:flex-end;gap:0;min-width:0}
.dcr-source-link,.dcr-source-action{min-height:24px}
@media(max-width:420px){
  .dcr-card{width:min(380px,calc(100vw - 16px))}
  .dcr-status-line{gap:12px;padding:12px}
  .dcr-summary-details{padding-left:12px}
  .dcr-summary-answer{font-size:30px}
  .dcr-summary-answer.is-unknown{font-size:18px}
}
@media(pointer:coarse){
  .dcr-dock-button,.dcr-panel-icon-button{min-width:44px;min-height:44px}
  .dcr-panel-icon-button{width:44px;height:44px}
  .dcr-source-link,.dcr-source-action,.dcr-refresh-action{min-height:44px}
  .dcr-refresh-action{width:44px;height:44px;min-width:44px;min-height:44px;padding:0 8px}
}
@media (prefers-reduced-motion: reduce){
  .dcr-dock-button,.dcr-btn,.dcr-panel-icon-button,.dcr-refresh-action,.dcr-external-link{transition:none}
  .dcr-spin,.dcr-card{animation:none}
}
`;

    function Styles() {
      return h('style', null, CSS);
    }

    function resetScopeLabel(record, t) {
      if (!record) return t('typeUnknown');
      if (record.resetType === 'global') return t('typeGlobal');
      if (record.resetType === 'banked') return t('typeBanked');
      if (record.resetType === 'global_and_banked') return t('typeGlobalBanked');
      return t('typeUnknown');
    }

    function fmtScheduleAbs(iso, localeId, precision) {
      const date = new Date(iso);
      if (Number.isNaN(date.getTime())) return '';
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      if (precision !== 'date') {
        options.hour = '2-digit';
        options.minute = '2-digit';
      }
      try {
        return new Intl.DateTimeFormat(intlLocaleOf(localeId), options).format(date);
      } catch {
        return date.toISOString().slice(0, precision === 'date' ? 10 : 16).replace('T', ' ');
      }
    }

    function scheduleDaySuffix(iso, now, t) {
      const target = new Date(iso);
      const current = new Date(now);
      const sameDay = (a, b) => a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
      if (sameDay(target, current)) return t('scheduleToday');
      const tomorrow = new Date(current);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return sameDay(target, tomorrow) ? t('scheduleTomorrow') : '';
    }

    function ResetSummary({ data, t, localeId, now }) {
      const latest = latestResetRecord(data);
      const latestTime = resetCompletionTime(latest);
      const latestAt = latestTime && Number.isFinite(Date.parse(latestTime.value))
        ? latestTime.value
        : null;
      const verdict = reportedVerdict(data, now);
      const question = t(verdict.questionKey);
      const next = data && data.nextScheduled ? data.nextScheduled : null;
      const scheduleWindow = next && next.scheduleWindow;
      const nextTarget = scheduleWindow && (scheduleWindow.startAt || scheduleWindow.endAt)
        ? scheduleWindow.startAt || scheduleWindow.endAt
        : next && next.effectiveAt;
      const nextAt = nextTarget && Number.isFinite(Date.parse(nextTarget))
        ? nextTarget
        : null;
      const probability = verdict.percent === null ? ''
        : (verdict.percent === 100 ? '' : '≥') + verdict.percent + '%';
      const todayAnswer = [probability, t(verdict.answerKey)].filter(Boolean).join(' ');
      const latestDisplay = latestAt ? fmtAbsCompact(latestAt, localeId) : latest ? t('noTime') : t('noResetSummary');
      const latestRelative = latestAt ? fmtRel(latestAt, t, now) : '';
      const latestTimeTitle = latestAt
        ? latestTime.field === 'announcedAt'
          ? t('completionAnnouncementTime', { time: fmtAbsExact(latestAt, localeId) })
          : fmtAbsExact(latestAt, localeId)
        : undefined;
      const nextDisplay = nextAt
        ? [fmtScheduleAbs(nextAt, localeId, next.schedulePrecision), scheduleDaySuffix(nextAt, now, t)].filter(Boolean).join(' ')
        : next
          ? t('scheduleUnknown')
          : t('noSchedule');
      const nextTimeTitle = nextAt
        ? [
            t('scheduledAt', { time: fmtScheduleAbs(nextAt, localeId, next.schedulePrecision) }),
            next.schedulePrecision === 'date' ? t('precisionDate') : '',
          ].filter(Boolean).join(' · ')
        : undefined;

      return h(
        'section',
        {
          className: 'dcr-status-line',
          'aria-label': [question, todayAnswer, t('nextScheduleLabel'), nextDisplay, t('latestReset'), latestDisplay].join(' · '),
        },
        h('div', { className: 'dcr-summary-today' },
          h('span', { className: 'dcr-summary-question' }, question),
          h('strong', { className: 'dcr-summary-answer' + (verdict.answerKey === 'todayUnknown' ? ' is-unknown' : probability ? ' has-probability' : '') }, todayAnswer),
          verdict.scheduled ? h('span', { className: 'dcr-summary-meta' }, t('scheduledReport')) : null,
        ),
        h('div', { className: 'dcr-summary-details' },
          h('div', { className: 'dcr-summary-item' },
            h('strong', { className: 'dcr-summary-label dcr-summary-next-label' }, t('nextScheduleLabel')),
            nextAt
              ? h('time', { className: 'dcr-summary-value', dateTime: nextAt, title: nextTimeTitle }, nextDisplay)
              : h('span', { className: 'dcr-summary-meta' }, nextDisplay),
          ),
          h('div', { className: 'dcr-summary-item dcr-summary-latest' },
            h('span', { className: 'dcr-summary-label' }, t('latestReset')),
            latestAt
              ? h('time', { className: 'dcr-summary-value', dateTime: latestAt, title: latestTimeTitle }, latestDisplay)
              : h('span', { className: 'dcr-summary-value' }, latestDisplay),
            latestRelative
              ? h('span', { className: 'dcr-summary-subvalue' }, latestRelative)
              : latest
                ? h('span', { className: 'dcr-summary-subvalue' }, resetScopeLabel(latest, t))
                : null,
          ),
        ),
      );
    }

    function tiboPostUrl(record) {
      const source = record && record.source;
      const raw = source && source.url;
      if (typeof raw !== 'string' || !raw) return null;
      try {
        const url = new URL(raw);
        const host = url.hostname.toLowerCase();
        const isSocialHost = host === 'x.com' || host === 'www.x.com' ||
          host === 'twitter.com' || host === 'www.twitter.com';
        const handle = typeof source.handle === 'string'
          ? source.handle.replace(/^@/, '').toLowerCase()
          : '';
        const isTiboPost = /^\/thsottiaux\/status\/\d+\/?$/i.test(url.pathname);
        const isStatusUrl = /\/status\/\d+\/?$/i.test(url.pathname);
        if (
          url.protocol !== 'https:' ||
          !isSocialHost ||
          !(isTiboPost || (handle === 'thsottiaux' && isStatusUrl))
        ) return null;
        return url.href;
      } catch {
        return null;
      }
    }

    function latestTiboPost(data) {
      const records = data
        ? [data.latestGlobal, data.latestBanked, data.nextScheduled]
            .filter(Boolean)
            .map((record) => ({ record, translationLang: TIBO_TRANSLATION_LANG }))
        : [];
      return records
        .map(({ record, translationLang }, index) => ({
          record,
          translationLang,
          index,
          url: tiboPostUrl(record),
          at: Date.parse(record.announcedAt || record.completedAt || record.effectiveAt || ''),
        }))
        .filter((item) =>
          item.url &&
          [item.record.text, item.record.translatedText].some((text) =>
            typeof text === 'string' && text.trim(),
          ),
        )
        .sort((left, right) => {
          const leftAt = Number.isFinite(left.at) ? left.at : -Infinity;
          const rightAt = Number.isFinite(right.at) ? right.at : -Infinity;
          return rightAt - leftAt || left.index - right.index;
        })[0] || null;
    }

    function tiboPostTextParts(record, translationLang) {
      if (!record) return [];
      const original = typeof record.text === 'string' ? record.text.trim() : '';
      const translated = typeof record.translatedText === 'string'
        ? record.translatedText.trim()
        : '';
      const hasChineseTranslation = translationLang === TIBO_TRANSLATION_LANG && translated;
      const normalize = (value) => value.normalize('NFC').replace(/\s+/gu, ' ').trim();

      if (hasChineseTranslation && original && normalize(translated) !== normalize(original)) {
        return [
          { text: translated, lang: TIBO_TRANSLATION_LANG, original: false },
          { text: original, lang: 'en', original: true },
        ];
      }
      if (hasChineseTranslation) {
        return [{
          text: original || translated,
          lang: original ? 'en' : TIBO_TRANSLATION_LANG,
          original: false,
        }];
      }
      if (original) return [{ text: original, lang: 'en', original: false }];
      if (translated) return [{ text: translated, lang: 'en', original: false }];
      return [];
    }

    function resetSummaryTimestamp(data) {
      const next = data && data.nextScheduled ? data.nextScheduled : null;
      if (next) {
        const scheduleWindow = next.scheduleWindow;
        const target = scheduleWindow && (scheduleWindow.startAt || scheduleWindow.endAt)
          ? scheduleWindow.startAt || scheduleWindow.endAt
          : next.effectiveAt;
        return target && Number.isFinite(Date.parse(target)) ? target : null;
      }
      const latest = resetCompletionTime(latestResetRecord(data));
      return latest ? latest.value : null;
    }

    function TiboPost({ data, summaryTimeIso, localeId, t }) {
      const item = latestTiboPost(data);
      if (!item) return null;
      const textParts = tiboPostTextParts(item.record, item.translationLang);
      if (!textParts.length) return null;
      const postIso = item.record.announcedAt || item.record.completedAt || item.record.effectiveAt || '';
      const postTime = fmtTiboTime(postIso, localeId);
      const postAt = Date.parse(postIso);
      const summaryAt = Date.parse(summaryTimeIso || '');
      const repeatsSummaryTime = Number.isFinite(postAt) && Number.isFinite(summaryAt) && postAt === summaryAt;
      return h(
        'article',
        { className: 'dcr-tibo-post', 'aria-label': 'Tibo @thsottiaux' },
        h(
          'div',
          { className: 'dcr-tibo-head' },
          h(
            'img',
            {
              className: 'dcr-tibo-avatar',
              src: TIBO_AVATAR_DATA_URI,
              alt: '',
              'aria-hidden': true,
              width: 32,
              height: 32,
              decoding: 'async',
            },
          ),
          h('div', { className: 'dcr-tibo-main' },
            h(
              'div',
              { className: 'dcr-tibo-author' },
              h('div', { className: 'dcr-tibo-identity' },
                h('span', { className: 'dcr-tibo-name' }, 'Tibo'),
                h('span', { className: 'dcr-tibo-handle' }, '@thsottiaux'),
              ),
              h(
                'a',
                {
                  className: 'dcr-tibo-link dcr-source-action dcr-external-link',
                  href: item.url,
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  title: t('openTiboPost'),
                  'aria-label': t('openTiboPost'),
                },
                t('viewOriginal'),
                h(IconLink, { size: 12 }),
              ),
            ),
            postTime
              ? h('time', {
                  className: 'dcr-tibo-time' + (repeatsSummaryTime ? ' dcr-visually-hidden' : ''),
                  dateTime: postIso,
                  title: fmtAbs(postIso, localeId),
                }, postTime)
              : null,
          ),
        ),
        h('div', { className: 'dcr-tibo-copy' },
          ...textParts.map((part) => h(
            'p',
            {
              className: 'dcr-tibo-text' + (part.original ? ' is-original' : ''),
              lang: part.lang,
            },
            part.text,
          )),
        ),
      );
    }

    function ErrorBox({ status, t, onRetry, now }) {
      const error = status.error;
      const wait = Math.max(0, Math.ceil(((status.retryAt || 0) - now) / 1000));
      const message = wait > 0
        ? t('retryAfter', { n: wait })
        : status.entry
          ? t('errorStale')
          : (error && error.message) || t('errorTitle');
      return h(
        'div',
        { className: 'dcr-error', role: 'alert' },
        h('span', { className: 'dcr-error-icon' }, h(IconAlert, null)),
        h(
          'div',
          { className: 'dcr-error-main' },
          h('div', { className: 'dcr-error-title' }, t('errorTitle')),
          h('div', { className: 'dcr-error-text' }, message),
        ),
        h(
          'button',
          {
            className: 'dcr-btn',
            onClick: onRetry,
            disabled: wait > 0 || !onRetry,
            'aria-label': wait > 0 ? t('retryIn', { n: wait }) : t('retry'),
          },
          wait > 0 ? t('retryIn', { n: wait }) : t('retry'),
        ),
      );
    }

    function CodexResetDock(props) {
      const locale = props.locale;
      const t = useMemo(() => makeT(props.t || ((key) => key)), [props.t]);
      const subscribeLocale = useCallback((cb) => locale.subscribe(cb), [locale]);
      const getLocaleSnapshot = useCallback(() => locale.getSnapshot(), [locale]);
      useSyncExternalStore(subscribeLocale, getLocaleSnapshot);

      const localeId = localeIdOf(locale);
      const lang = siteLangOf(localeId);
      const status = useSyncExternalStore(statusStore.subscribe, statusStore.getSnapshot);
      const [open, setOpen] = useState(false);
      const [now, setNow] = useState(() => Date.now());
      const [position, setPosition] = useState(null);
      const [noticePermission, setNoticePermission] = useState(notificationPermission);
      const triggerRef = useRef(null);
      const panelRef = useRef(null);
      const panelId = useRef('dcr-popover-' + Math.random().toString(36).slice(2));
      const busy = status.phase === 'loading' || status.phase === 'refreshing';
      const data = status.entry ? status.entry.data : null;
      const fetchedAt = status.entry ? status.entry.at : null;
      const summaryTimeIso = resetSummaryTimestamp(data);
      const dockAccessibleLabel = t('statusOf');
      // Closed docks do not run the popover's one-second clock. Use the current
      // render time so each poll also reevaluates expiry and local-day priority.
      const verdict = reportedVerdict(data, open ? now : Date.now());
      const chipPercent = status.phase !== 'error' && !status.error && verdict.percent !== null && verdict.percent >= 80
        ? verdict.percent : null;
      // One literal space separates the glyph from the number: it is part of
      // the label (` ≥93%`), so the gap is a space wide, not a CSS gap.
      const chipProbability = chipPercent === null ? ''
        : ' ' + (chipPercent === 100 ? '' : '≥') + chipPercent + '%';
      const refreshTitle = fetchedAt
        ? t('refreshFetched', { time: fmtAbs(new Date(fetchedAt).toISOString(), localeId) })
        : t('refresh');

      useEffect(() => retainStatusPolling(lang), [lang]);

      useEffect(() => {
        if (open) ensureStatus(lang, false);
      }, [open, lang]);

      useEffect(() => {
        if (!open) return undefined;
        setNow(Date.now());
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
      }, [open]);

      useEffect(() => {
        if (!open) return undefined;
        const onPointerDown = (event) => {
          const target = event.target;
          if (panelRef.current && panelRef.current.contains(target)) return;
          if (triggerRef.current && triggerRef.current.contains(target)) return;
          setOpen(false);
        };
        const onKeyDown = (event) => {
          if (event.key !== 'Escape') return;
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
          if (triggerRef.current) triggerRef.current.focus({ preventScroll: true });
        };
        document.addEventListener('pointerdown', onPointerDown, true);
        document.addEventListener('keydown', onKeyDown);
        return () => {
          document.removeEventListener('pointerdown', onPointerDown, true);
          document.removeEventListener('keydown', onKeyDown);
        };
      }, [open]);

      useLayoutEffect(() => {
        if (!open) {
          if (position) setPosition(null);
          return undefined;
        }
        const updatePosition = () => {
          const trigger = triggerRef.current;
          const panel = panelRef.current;
          if (!trigger || !panel) return;
          const visualViewport = window.visualViewport;
          const viewportLeft = visualViewport ? visualViewport.offsetLeft : 0;
          const viewportTop = visualViewport ? visualViewport.offsetTop : 0;
          const viewportWidth = visualViewport ? visualViewport.width : window.innerWidth;
          const viewportHeight = visualViewport ? visualViewport.height : window.innerHeight;
          const width = Math.max(1, Math.min(380, viewportWidth - (viewportWidth <= 420 ? 16 : 24)));
          const maxHeight = Math.max(1, Math.min(540, viewportHeight - 16));
          const panelRect = panel.getBoundingClientRect();
          const panelWidth = Math.min(width, panelRect.width || width);
          const panelHeight = Math.min(maxHeight, panelRect.height || maxHeight);
          const triggerRect = trigger.getBoundingClientRect();
          const minLeft = viewportLeft + 8;
          const maxLeft = Math.max(minLeft, viewportLeft + viewportWidth - panelWidth - 8);
          const left = Math.max(minLeft, Math.min(triggerRect.left, maxLeft));
          const minTop = viewportTop + 8;
          const maxTop = Math.max(minTop, viewportTop + viewportHeight - panelHeight - 8);
          const above = triggerRect.top - panelHeight - 8 >= minTop;
          const requestedTop = above ? triggerRect.top - panelHeight - 8 : triggerRect.bottom + 8;
          const top = Math.max(minTop, Math.min(requestedTop, maxTop));
          setPosition((previous) => {
            const next = { left, top, width, maxHeight, above };
            if (previous && Math.abs(previous.left - left) < 0.5 &&
              Math.abs(previous.top - top) < 0.5 && previous.width === width &&
              previous.maxHeight === maxHeight && previous.above === above) return previous;
            return next;
          });
        };
        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);
        const visualViewport = window.visualViewport;
        if (visualViewport) {
          visualViewport.addEventListener('resize', updatePosition);
          visualViewport.addEventListener('scroll', updatePosition);
        }
        const observer = typeof ResizeObserver === 'function'
          ? new ResizeObserver(updatePosition)
          : null;
        if (observer) {
          if (triggerRef.current) observer.observe(triggerRef.current);
          if (panelRef.current) observer.observe(panelRef.current);
        }
        return () => {
          window.removeEventListener('resize', updatePosition);
          window.removeEventListener('scroll', updatePosition, true);
          if (visualViewport) {
            visualViewport.removeEventListener('resize', updatePosition);
            visualViewport.removeEventListener('scroll', updatePosition);
          }
          if (observer) observer.disconnect();
        };
      }, [open, position && position.width, position && position.maxHeight, status.entry, status.phase]);

      const closeToTrigger = () => {
        setOpen(false);
        if (triggerRef.current) triggerRef.current.focus({ preventScroll: true });
      };
      const panelStyle = position
        ? { left: position.left + 'px', top: position.top + 'px', width: position.width + 'px', maxHeight: position.maxHeight + 'px', transformOrigin: position.above ? 'bottom left' : 'top left' }
        : { left: '0px', top: '0px', visibility: 'hidden' };

      return h(
        React.Fragment,
        null,
        h(Styles, null),
        h(
          'div',
          { className: 'dcr-dock' },
          h(
            'button',
            {
              ref: triggerRef,
              type: 'button',
              className: 'dcr-dock-button',
              'aria-label': dockAccessibleLabel,
              title: dockAccessibleLabel,
              'aria-expanded': open,
              'aria-controls': panelId.current,
              onClick: () => setOpen(!open),
            },
            h('span', { className: 'dcr-dock-glyph', 'aria-hidden': true }, h(ResetGlyph, { size: 16 })),
            // The glyph alone carries the idle state; a forecast adds its
            // percentage so the entry stays as narrow as what it reports.
            chipProbability
              ? h('span', { className: 'dcr-chip-probability' }, chipProbability)
              : null,
          ),
          open
            ? h(
                'section',
                {
                  ref: panelRef,
                  id: panelId.current,
                  className: 'dcr-card',
                  role: 'dialog',
                  'aria-label': t('statusOf'),
                  'aria-busy': busy,
                  style: panelStyle,
                },
                h(
                  'header',
                  { className: 'dcr-head' },
                  h('div', { className: 'dcr-title-group' },
                    h('span', { className: 'dcr-title-glyph', 'aria-hidden': true }, h(ResetGlyph, { size: 17 })),
                    h('h2', { className: 'dcr-title' }, t('title')),
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dcr-panel-icon-button',
                      onClick: closeToTrigger,
                      title: t('close'),
                      'aria-label': t('close'),
                    },
                    h(IconClose, { size: 16 }),
                  ),
                ),
                status.phase === 'error'
                  ? h(ErrorBox, { status, t, onRetry: () => ensureStatus(lang, true), now })
                : null,
                h(ResetSummary, { data, t, localeId, now }),
                h('p', { className: 'dcr-freshness' },
                  [
                    t('localTimeZone', { zone: resolveSummaryTimeZone(data && data.timeZone) || Intl.DateTimeFormat().resolvedOptions().timeZone || '-' }),
                    fetchedAt ? t('fetchedAt', { time: fmtAbsExact(new Date(fetchedAt).toISOString(), localeId) }) : '',
                  ].filter(Boolean).join(' · '),
                ),
                h(TiboPost, {
                  data,
                  summaryTimeIso,
                  localeId,
                  t,
                }),
                h(
                  'footer',
                  { className: 'dcr-foot' },
                  h(
                    'a',
                    {
                      className: 'dcr-source-link dcr-external-link',
                      href: SITE_URL,
                      target: '_blank',
                      rel: 'noopener noreferrer',
                      title: t('dataSource'),
                    },
                    t('dataSource'),
                    h(IconLink, { size: 12 }),
                  ),
                  h('div', { className: 'dcr-foot-tools' },
                    h(NoticePermissionControl, {
                      t,
                      permission: noticePermission,
                      onPermission: setNoticePermission,
                    }),
                    h(
                      'button',
                      {
                        type: 'button',
                        className: 'dcr-refresh-action',
                        onClick: () => ensureStatus(lang, true),
                        disabled: busy,
                        title: refreshTitle,
                        'aria-label': t('refresh'),
                        'aria-busy': busy,
                      },
                      h(IconRefresh, { size: 16, className: busy ? 'dcr-spin' : '' }),
                    ),
                  ),
                ),
              )
            : null,
        ),
      );
    }

    const name = NS;

    const inject = ['slots', 'locale'];

    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'codex-reset: dictionaries');
      const t = ctx.locale.bind(NS);

      // Share the right status group with auto-compact's ring (order 10),
      // immediately before it. The composer dock is a separate row below.
      ctx.slots.inject('conversation.input.right', () =>
        ctx.slots.register(
          {
            name: 'conversation.input.right',
            id: 'codex-reset-status',
            order: 9,
            label: () => t('statusOf'),
            locale: NS,
            inject: () => ({ t, locale: ctx.locale }),
          },
          CodexResetDock,
        ),
      );
    }

    return { name, inject, apply };
  },
});
