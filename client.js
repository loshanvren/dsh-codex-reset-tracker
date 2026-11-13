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
    const TIBO_AVATAR_DATA_URI = 'data:image/webp;base64,UklGRoYIAABXRUJQVlA4IHoIAABQKwCdASqgAKAAPmEuk0ckIqGlJxLqQKAMCWVuSV+sDE9XxyhHBzt2BbIcoBHJkpQ1biZio+lZ+PKFPyn8VxnrY/Aiw31Dk1byo/W/sCkVtFNQzAgS/75/NhovpxPwPx4WAQLJiU26Fm3J+c/M0uscjO+OTFPEYTKCd87oOeBFp3wQquBLt8ka/n4xkxrtrGS0IquSEJSaMOn7XT7xenSU3JxlnrKxXkuF2d18TbuVLBrxx2Mvw09ByirKmMfqr7dUVIR1PQMjzTQIgwlvnWG3zbBUXRAberpkOQF6dTCwCAQ+3b+pbXuN2qH+h72Jnj4e/S+moLAj4ybZAfgZPsapwLHffd6FkzpzpcALZ1jNRJpos8/n9jMMOe3F4BBUvTT/NUvPHEty93KDRN8J+Z6NGq6OoBbZOVA7f22SeNOIVj3xupyHJyEmgOx231hrsqfY9syLtbkpjHwMJftQYxqcy/mQAP64cgnKi+EF/xb8c/BrwP7U/O3sHR/9lp9UDQpLGVsyP3/n8WX2of4fHw8pFZv3tPPiiIgD2kEeMasnB1uuI0nNJC7UIq1Hnk2f6lZf9c1EuhmiD9iYU8/oBvoeIuzwT6GPB3sBCkondujuDypq9Yl1/z3ISWSDnfjydFntHcrDA73y4E2JWlEiFKPLQceuc5OBz/Tp2jNwg275zdlYvZgeNASaKbt8RQNyWXyStcAvqjx/XMpxjRm6HOfHvMD5q5UT69iZBk5M6pt745ifNzvaIo1DncBEhCuHSavDSWyvxE5xPWE0FWFTeyal2raWuKfwALKGxembYAlIsO1U9I8DzLfmKLqFxhNrLparuE7mixieuw8xwgbl5YQqm4p7C4aV69mxQvPaxxsQ9xnjeLXSF2suMK9HX3LY92MR/uc3DGetqWFONSHAdXFdgZ35kK/Fzg8ZRkd9dh/1kkAPu+2o8PUUMVgGFVG7E4G6qYzvhek/N2Wllv3BVkbujsWhMGz60U1BtVN+N3HEO8roN3YfspIbxbluslgrZLgE6yIZMy/Yks3N238BcWLX7hsuajYWo8+xSHLcHBpMzXhWjbyRtMLvgY3k07DSxuZf9Jr86uu5yfev/SDTlKX5uGY99IwZvDVbgt9wFp6A7+HvLhqLqW4GYRu14G4xvKlk2ulFl2meZUwyrkep0Skeoxo6KE9+xkICbtNw/IpORyx4RJn88Cs97hoW5j4Ko0zpAS8vk0LVk+XqHncuZtSqdKaLErDvbpVfW7i24gw1A9XscBw6E8QfXhvRIv8aEauD1XkMS9Mtl5TgpZGWKVdo7x/K57rATNc4NrBA21Doe7ZKRaoDTGmKK6hXSZwEJ+k8P/ODpbVXIzmGXYZevUi8WpImCA7TT7yt4tNQmxUU6f/CNk5rmUyPonCyqffp/4yQpzVW6HH7pKPE0DedEwEpe2Rf0NCLlt1vZrjjL8VOHY6HHjCw150Klva/oPfW6Yi1+7Kt27IB5HvVJ0RAI95W6wfAbRrrlh6rGLqz7sVMcO6yJCOXozKImYLQIzLtQugd68Sunz/AeL8/ToKOVaksM9WkupH9ttUzMynn+cWIHb9QI2ZFT3DscV+D2oohneA3qqDot1lFH1uFW0suQM94JUKG2myxnBLP06n6jKhhsto8mRQeeiyo2w2/0TR+PopVA/NZ3K6tNFpGwPetaDj4Oa0anIvkz/TtPwf6VDkZ/I+TFBsrvCazkDhnwpnc1eZVgZGZJCTROQ4La89ue6NWC3vU4JX9s37wthxda/h7o65PipEfUTuZWvuzCrDJZRGaveYl1Tj6g8KuhvZHwl88Oo0EU+YfhXNL4nL50N6CVzg/+0S7aOwRBLQLjRUpUdFBUZsyvVHIvS7CKqDwYNQwDwsKj6q8NTPLpUqBYOntyP+asnZ/3aUCYl/oR+ojaxIc4gJ2c3rqDYEo25ThW6rU2TDIsLHoxz4W3Vf/BUqgg7GzfX1K4hiTJ2SMtRe/J9CqoXxqOgCuUH5c7uCOJZIfTquj7GuBG9IwZGhNYNcXcQnFXtX7ZSAie0YAwqDiqVY8ELTA8a5IJO+0AEE71OcLrQKLUm/J5KBAzZhTtPXBFijcD0DexG2soyx16vZj8D2DOEZ1wFbzE9jee1cURwXyejOge2cBkumhLvUcjEp2jSn+HZFnf/X9+rjs9t8wiz91RHTHzmnz/xp/t0rQ0z3cV+DLarGKCX7APSu+N2Sz1SfWMOSRvzfo2H3vfoUOWc382hoXX6OZwBf9aPp3gAtIBwIBvd3ygRWDS2MCLxTS6FPCgyL/HYZxrbYv5s0v45YO+a5+h1Xja7UmwrWD/CObR9ZnEeBxl8CrM3wsyMN8tCHdx0PuX4OsUsQxDjcRgezON6dl9/7svkq1My44LRZv+93vempev7PPqplIUyNk+XJnqRFA6wK9aeAKjnBObaC5u6Zxm3GJ2g+RJR34mJ+U0oohBz8Q+scR6W9ij8GZ4UHGnKm9WlQRFvngZrSgFP1Pk0NAJhocFmMopglm+0Jrk3toC6Bc7m9jLb6qpoJeesH+FxzIdwh1sxxSaMMBNSPnhPXtFKtvOHgQ4V2PzJeXKaSoY9q+zx2raAwfxbFF7pd1Vweqqimx0HKi/qe+hVfTTqP11nfw1OOfYSdOsobPxSfdJl1OnnVgJXJ/jmixr+HwgLTrI3fOyEzYMXsShe+5Hbm21stxZm3QH69nA7JuE4p0n4YnXZbw657XOhn+omP3AgLI/GyzxGItyYwDeZtLEZE61qp7Tc7EF3PNkdDkt1RODBfCCkzl/5IHqq+49aPCTuMv5Zyyh3hQ4s4Jwe/SdPAs9ufKIYdesCR+/EBrfIAAIjPPHg87jD1Q/KZqDlgjlDYTrAJHWMwxLGTHelypheltdd1WAAAA';
    const AUTO_REFRESH_MS = 10 * 60 * 1000;
    const INTERACTIVE_REFRESH_MS = 60 * 1000;
    const REQUEST_TIMEOUT_MS = 20 * 1000;
    const RELATED_SCHEDULE_TIMEOUT_MS = 5 * 1000;
    const RESET_NOTICE_STORAGE_KEY = 'dsh-codex-reset-tracker.reset-notice.v1';
    const MAX_RESET_NOTICE_KEYS = 128;
    const zh = {
      'title': 'Codex 重置',
      'chipName': 'Codex',
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
      'typeGlobal': '全体重置',
      'typeBanked': '重置卡',
      'typeGlobalBanked': '全体重置 + 重置卡',
      'typeUnknown': '类型未知',
      'precisionDate': '按日期排期',
      'noTime': '时间未知',
      'latestGlobalLabel': '最近全体重置',
      'latestBankedLabel': '最近重置卡',
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
      'dataSource': '数据来源',
      'refreshFetched': '刷新；上次获取于 {time}',
      'openTiboPost': '打开 Tibo 原帖',
      'notifyReset': 'Codex 已经重置',
      'notifyResetTyped': 'Codex 已经重置（{type}）',
      'compactGlobal': '全体',
      'compactBanked': '重置卡',
      'compactRecent': '最近重置',
      'compactForecast': '预计重置',
      'expectedShort': '预计',
      'compactNone': '今天暂无重置',
      'compactUnknown': '状态待确认',
      'compactNext': '下次',
      'compactUpdated': '{time} 更新',
      'sourcePost': '来源公告',
      'notifyAsk': '开启系统通知',
      'notifyOn': '系统通知已开启',
      'notifyBlocked': '系统通知已被阻止',
    };

    const en = {
      'title': 'Codex Reset',
      'chipName': 'Codex',
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
      'typeGlobal': 'Global reset',
      'typeBanked': 'Banked reset',
      'typeGlobalBanked': 'Global + Banked reset',
      'typeUnknown': 'Unknown type',
      'precisionDate': 'date-level schedule',
      'noTime': 'time unknown',
      'latestGlobalLabel': 'Latest global reset',
      'latestBankedLabel': 'Latest banked reset',
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
      'dataSource': 'Source',
      'refreshFetched': 'Refresh; last fetched {time}',
      'openTiboPost': 'Open Tibo post',
      'notifyReset': 'Codex has reset',
      'notifyResetTyped': 'Codex has reset ({type})',
      'compactGlobal': 'Global',
      'compactBanked': 'Banked',
      'compactRecent': 'Recent resets',
      'compactForecast': 'Expected reset',
      'expectedShort': 'Expected',
      'compactNone': 'No reset today',
      'compactUnknown': 'Status unavailable',
      'compactNext': 'Next',
      'compactUpdated': 'Updated {time}',
      'sourcePost': 'Source announcement',
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

    // Reset types declared by the upstream OpenAPI. `kind` (scheduled/completed)
    // is a different axis and never substitutes for a type.
    const RESET_TYPE_VALUES = ['global', 'banked', 'global_and_banked'];

    /** Canonical type value, or null when the value is missing or unknown. */
    function resetTypeOf(record) {
      const value = record && record.resetType;
      return RESET_TYPE_VALUES.includes(value) ? value : null;
    }

    function resetTypeLabelKey(type) {
      if (type === 'global') return 'typeGlobal';
      if (type === 'banked') return 'typeBanked';
      if (type === 'global_and_banked') return 'typeGlobalBanked';
      return 'typeUnknown';
    }

    /** Which completion kinds a record's type covers; unknown types attribute nothing. */
    function resetTypeCoverage(type) {
      return {
        global: type === 'global' || type === 'global_and_banked',
        banked: type === 'banked' || type === 'global_and_banked',
      };
    }

    /** Label keys describing today's completed coverage, unknown listed explicitly. */
    function completedTypeLabelKeys(coverage) {
      if (!coverage) return ['typeUnknown'];
      const keys = [];
      if (coverage.global && coverage.banked) keys.push('typeGlobalBanked');
      else {
        if (coverage.global) keys.push('typeGlobal');
        if (coverage.banked) keys.push('typeBanked');
      }
      if (coverage.unknown) keys.push('typeUnknown');
      return keys;
    }

    /**
     * Per-type completion coverage for the browser-local day. Returns
     * {global, banked, unknown} booleans, or null when the day cannot be
     * determined or completion records exist that cannot be interpreted.
     * Unknown resetType completions count as "a reset happened" (unknown) but
     * never attribute to global or banked.
     */
    function todayCompletionCoverage(data, now) {
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

      const coverage = { global: false, banked: false, unknown: false };
      const records = [data.latestGlobal, data.latestBanked].filter(Boolean);
      if (!records.length) return coverage;
      let sawCompletion = false;
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
        if (eventDay !== today) continue;
        sawCompletion = true;
        const type = resetTypeOf(record);
        const covers = resetTypeCoverage(type);
        if (covers.global) coverage.global = true;
        if (covers.banked) coverage.banked = true;
        if (!type) coverage.unknown = true;
      }
      if (!sawCompletion && unresolved) return null;
      return coverage;
    }

    function resetHappenedToday(data, now) {
      return hasCompletion(todayCompletionCoverage(data, now));
    }

    function hasCompletion(coverage) {
      if (coverage === null) return null;
      return coverage.global || coverage.banked || coverage.unknown;
    }

    function completionAnswerKey(coverage) {
      const completed = hasCompletion(coverage);
      if (completed === null) return 'todayUnknown';
      return completed ? 'todayYes' : 'todayNo';
    }

    // Report the public page's live-schedule headline: confidence + Yes.
    // This presentation never changes the schedule into a completion record.
    // Suppressing a forecast is per type: completing only banked today keeps a
    // pending global forecast visible, and a joint schedule needs both kinds
    // completed before a completion conclusion replaces it.
    function reportedVerdict(data, now) {
      const coverage = todayCompletionCoverage(data, now);
      const daily = {
        questionKey: 'todayQuestion',
        answerKey: completionAnswerKey(coverage),
        percent: null,
        scheduled: false,
        type: null,
        completed: coverage,
      };
      const next = data && data.nextScheduled;
      if (!next || next.kind !== 'reset_scheduled' ||
          (next.scheduleState && next.scheduleState !== 'pending')) return daily;
      // A schedule with an unknown type can never be counted as covered: an
      // unknown completion must not be assumed to be the same event. Its
      // forecast therefore stays visible and is labelled as unknown.
      const type = resetTypeOf(next);
      const needed = type === null ? null : resetTypeCoverage(type);
      // Unknown historical completion times do not invalidate a known future
      // schedule; only confirmed coverage may suppress its forecast.
      const covered = coverage !== null && needed !== null && (needed.global
        ? needed.banked ? coverage.global && coverage.banked : coverage.global
        : coverage.banked);
      if (covered) return daily;
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
        type: type === null ? 'unknown' : type,
        completed: coverage,
      };
    }

    function recentResetEntries(data) {
      return [
        { record: data?.latestGlobal, labelKey: 'latestGlobalLabel' },
        { record: data?.latestBanked, labelKey: 'latestBankedLabel' },
      ].filter(({ record }) => record)
        .map((entry) => {
          const time = resetCompletionTime(entry.record)?.value;
          const timestamp = Date.parse(time || '');
          const hasTime = Number.isFinite(timestamp);
          return { ...entry, at: hasTime ? time : null, timestamp: hasTime ? timestamp : -Infinity };
        })
        .sort((left, right) => right.timestamp - left.timestamp);
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
        const retrySeconds = retryAfterSeconds(res, body);
        if (retrySeconds > 0) error.retryAfter = retrySeconds;
        throw error;
      }
      return { data: body.data, meta: body.meta || null, rate, at: Date.now() };
    }

    function retryAfterSeconds(res, body) {
      if (typeof body?.retryAfter === 'number') return body.retryAfter;
      const header = res.headers.get('Retry-After');
      if (!header) return 0;
      const seconds = Number(header);
      return Number.isFinite(seconds) ? seconds : Math.ceil((Date.parse(header) - Date.now()) / 1000);
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
    const relatedSchedulesStore = createStore([]);
    let relatedSchedulesPending = false;
    let relatedSchedulesLookup = null;
    let relatedSchedulesLimitedUntil = 0;
    const statusInflight = new Map();
    let statusPollUsers = 0;
    let statusPollLang = null;
    let statusPollTimer = null;
    let requestedLang = null;
    let retryAt = 0;
    /** Recent completion identities observed by this page and shared storage. */
    let resetNoticeKeys = [];
    let resetNoticeReady = false;

    /**
     * Unique completion events for the browser-local day, independent of which
     * status slot contains them. A joint event that occupies both slots yields
     * one event; two different types completing on the same day yield separate
     * events. Each event carries its reset type for the notification text.
     */
    function todayCompletionEvents(data, now) {
      if (resetHappenedToday(data, now) !== true) return [];
      const timeZone = resolveSummaryTimeZone(data.timeZone);
      const currentAt = Number.isFinite(now) ? now : Date.parse(data.currentTime || '');
      const today = dateKeyAt(currentAt, timeZone);
      const events = [];
      const seenKeys = new Set();
      for (const record of [data.latestGlobal, data.latestBanked]) {
        if (!record || (record.kind && record.kind !== 'reset_completed')) continue;
        const time = resetCompletionTime(record);
        const at = time && Date.parse(time.value);
        if (!Number.isFinite(at) || at > currentAt || dateKeyAt(at, timeZone) !== today) continue;
        const key = record.id ? 'id:' + record.id : 'time:' + record.resetType + ':' + time.value;
        if (seenKeys.has(key)) continue;
        seenKeys.add(key);
        events.push({ key, type: resetTypeOf(record) || 'unknown', time });
      }
      return events;
    }

    /** Kept for compatibility: the dedup identities behind today's events. */
    function todayCompletionKeys(data, now) {
      return todayCompletionEvents(data, now).map((event) => event.key);
    }

    /** Combined type label for freshly observed events, unknown kept explicit. */
    function resetNoticeTypeLabel(events, dictionary) {
      const types = new Set(events.map((event) => event.type));
      const segments = [];
      if (types.has('global_and_banked') || (types.has('global') && types.has('banked'))) {
        segments.push('typeGlobalBanked');
      } else {
        if (types.has('global')) segments.push('typeGlobal');
        if (types.has('banked')) segments.push('typeBanked');
      }
      if (types.has('unknown')) segments.push('typeUnknown');
      if (!segments.length) segments.push('typeUnknown');
      return segments.map((key) => dictionary[key]).join(' + ');
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

    function resetNoticeText(events) {
      const dictionary = isZh(requestedLang) ? zh : en;
      const base = dictionary['notifyReset'];
      if (!events || !events.length) return base;
      return dictionary['notifyResetTyped'].replace('{type}', resetNoticeTypeLabel(events, dictionary));
    }

    function showSystemResetNotice(events) {
      if (notificationPermission() !== 'granted') return;
      try {
        const notice = new Notification(resetNoticeText(events), { tag: 'codex-reset-completed' });
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
      const current = todayCompletionEvents(data, Date.now());
      const update = () => {
        const stored = readStoredResetNotices();
        const seen = new Set([...resetNoticeKeys, ...(stored || [])]);
        const baseline = !resetNoticeReady && stored === undefined;
        const fresh = current.filter((event) => !seen.has(event.key));
        resetNoticeReady = true;
        resetNoticeKeys = normalizeResetNoticeKeys([...seen, ...current.map((event) => event.key)]);
        writeStoredResetNotices(resetNoticeKeys);
        if (!baseline && fresh.length) showSystemResetNotice(fresh);
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
        className: 'dcr-notify-toggle' + (permission === 'granted' ? ' is-on' : ''),
        onClick: settled ? undefined : () => requestNotificationPermission(props.onPermission || (() => {})),
        disabled: settled,
        title: label,
        'aria-label': label,
      }, h(IconBell, { size: 16 }));
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
            void refreshRelatedSchedules(fresh.data, fresh.rate);
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

    function IconBell({ size }) {
      return h('svg', { viewBox: '0 0 24 24', width: size || 16, height: size || 16, ...strokeProps },
        h('path', { d: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4' }));
    }

    function ScopeMark({ type, t, size = 16 }) {
      const glyph = (kind) => h('svg', { viewBox: '0 0 24 24', width: size, height: size, ...strokeProps, 'aria-hidden': true },
        ...(kind === 'global' ? [
          h('circle', { cx: 12, cy: 12, r: 8.5 }),
          h('ellipse', { cx: 12, cy: 12, rx: 3.7, ry: 8.5 }),
          h('path', { d: 'M3.5 12h17' }),
        ] : kind === 'banked' ? [
          h('rect', { x: 3.5, y: 5.5, width: 17, height: 13, rx: 2.5 }),
          h('path', { d: 'M3.5 9.5h17M8 14h3M16 12v4m-2-2h4' }),
        ] : [h('circle', { cx: 12, cy: 12, r: 8.5 }), h('path', { d: 'M9.5 9a2.5 2.5 0 1 1 4 2c-1.5 1-1.5 1.5-1.5 2M12 16h.01' })]));
      return h('span', {
        className: 'dcr-scope-mark is-' + type,
        'data-reset-type': type,
        role: 'img',
        title: t(resetTypeLabelKey(type)),
        'aria-label': t(resetTypeLabelKey(type)),
      }, ...(type === 'global_and_banked'
        ? [h('span', { className: 'is-global' }, glyph('global')), h('span', { className: 'is-banked' }, glyph('banked'))]
        : [glyph(type)]));
    }

    const CSS = `
.dcr-dock{position:relative;display:inline-grid;flex:0 1 auto;align-items:center;min-width:0;max-width:100%;overflow:hidden;color:var(--dsw-alias-label-primary);font:inherit}
.dcr-dock-button,.dcr-dock-sizer{grid-area:1/1;position:relative;display:inline-flex;align-items:center;gap:6px;min-height:28px;min-width:0;padding:3px 8px;border:0;box-sizing:border-box;font:inherit;font-size:12px;font-weight:550;white-space:nowrap}
.dcr-dock-button{justify-self:start;width:max-content;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;transition:background .14s ease}
.dcr-dock-sizer{visibility:hidden;pointer-events:none;font-weight:650}
.dcr-dock-label-sizer{display:inline-grid}
.dcr-dock-label-sizer>span{grid-area:1/1}
.dcr-chip-probability,.dcr-dock-label-sizer{font-variant-numeric:tabular-nums}
.dcr-chip-probability{color:#6d28d9}
body[data-ds-dark-theme] .dcr-chip-probability{color:#a78bfa}
.dcr-dock-button:hover,.dcr-dock-button[aria-expanded=true]{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font-weight:650}
.dcr-dock-button:focus-visible,.dcr-panel-icon-button:focus-visible,.dcr-refresh-action:focus-visible,.dcr-btn:focus-visible,.dcr-external-link:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}
.dcr-external-link:focus-visible{text-decoration:underline}
.dcr-dock-glyph{display:inline-flex;align-items:center;justify-content:center;flex:none;color:var(--dsw-alias-state-business-primary)}
.dcr-card{position:fixed;z-index:2147483000;box-sizing:border-box;display:flex;flex-direction:column;gap:0;width:min(340px,calc(100vw - 24px));max-height:min(540px,calc(100dvh - 16px));overflow:auto;overscroll-behavior:contain;padding:18px;border:0;border-radius:16px;background:var(--dsw-alias-bg-base,var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-label-primary);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);box-shadow:var(--dsw-elevation-prominent,0 8px 28px rgba(9,12,24,.18));font:inherit;animation:dcr-in .16s cubic-bezier(.23,1,.32,1) both}
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
.dcr-notify-toggle{display:inline-flex;align-items:center;justify-content:center;flex:none;width:30px;height:30px;padding:0;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}
.dcr-notify-toggle:hover:not(:disabled){background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.dcr-notify-toggle.is-on{color:var(--dsw-alias-state-business-primary)}
.dcr-notify-toggle:disabled{cursor:default}
.dcr-notify-toggle:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}
.dcr-spin{animation:dcr-rot .8s linear infinite}
@keyframes dcr-rot{to{transform:rotate(360deg)}}
.dcr-status-line{box-sizing:border-box;width:100%;min-width:0;margin-top:16px;color:var(--dsw-alias-label-primary);line-height:1.4;text-align:left}
.dcr-forecast{min-width:0}
.dcr-reset-heading{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:12px;min-height:48px;margin:0;color:var(--dsw-alias-label-secondary);font-size:13px;font-weight:500}
.dcr-reset-copy{display:grid;gap:3px;min-width:0;overflow-wrap:anywhere}
.dcr-reset-completion{display:flex;align-items:baseline;flex-wrap:wrap;gap:0 6px;color:var(--dsw-alias-label-primary);font-size:14px;font-weight:600}
.dcr-completion-time{color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:500;font-variant-numeric:tabular-nums;white-space:nowrap}
.dcr-completion-time::before{content:"·";margin-inline-end:6px}
.dcr-reset-state{color:var(--dsw-alias-label-primary);font-size:34px;font-weight:700;line-height:1.15;letter-spacing:-.02em}
.dcr-reset-state[data-reset-state=todayYes]{color:var(--dsw-alias-state-business-primary)}
.dcr-reset-outlook{display:flex;align-items:baseline;flex-wrap:wrap;gap:4px 6px;margin-top:6px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.6}
.dcr-forecast-time{font-variant-numeric:tabular-nums}
.dcr-forecast-probability{color:#6d28d9;font-size:13px;font-weight:600;font-variant-numeric:tabular-nums}
body[data-ds-dark-theme] .dcr-forecast-probability{color:#c4b5fd}
.dcr-scope-mark,.dcr-scope-mark>span{display:inline-flex;align-items:center;justify-content:center;flex:none;gap:3px}
.dcr-scope-mark.is-global,.dcr-scope-mark .is-global{color:#2563eb}
.dcr-scope-mark.is-banked,.dcr-scope-mark .is-banked{color:#a86608}
.dcr-scope-mark.is-unknown{color:var(--dsw-alias-label-secondary)}
body[data-ds-dark-theme] .dcr-scope-mark.is-global,body[data-ds-dark-theme] .dcr-scope-mark .is-global{color:#89b4ff}
body[data-ds-dark-theme] .dcr-scope-mark.is-banked,body[data-ds-dark-theme] .dcr-scope-mark .is-banked{color:#efbd64}
.dcr-recent{margin-top:16px;padding-top:12px;border-top:1px solid var(--dsw-alias-border-l1)}
.dcr-recent-title{margin:0 0 4px;color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:400}
.dcr-summary-latest{display:flex;align-items:center;gap:8px;min-height:30px;min-width:0}
.dcr-recent-kind{flex:1;min-width:0;font-size:13px;color:var(--dsw-alias-label-primary)}
.dcr-summary-value{color:var(--dsw-alias-label-primary);font-size:13px;font-variant-numeric:tabular-nums;white-space:nowrap}
.dcr-summary-subvalue{color:var(--dsw-alias-label-secondary);font-size:12px;min-width:44px;text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.dcr-freshness{margin:0;color:var(--dsw-alias-label-secondary);font-size:11px;line-height:1.5}
.dcr-tibo-post{min-width:0;margin-top:18px}
.dcr-tibo-avatar{display:block;flex:none;width:20px;height:20px;border-radius:50%;object-fit:cover}
.dcr-post-toolbar{display:flex;align-items:center;flex-wrap:wrap;gap:0 12px;min-width:0}
.dcr-post-byline{display:flex;align-items:center;flex-wrap:wrap;gap:4px 8px;min-width:0}
.dcr-post-language{flex:none;min-width:62px;min-height:32px;margin-inline-start:auto;padding:3px 8px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-state-business-primary);font:inherit;font-size:12px;font-weight:500;cursor:pointer}
.dcr-post-language:hover{background:var(--dsw-alias-bg-layer-2)}
.dcr-post-language:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}

.dcr-tibo-time{display:block;color:var(--dsw-alias-label-secondary);font-size:12px;font-variant-numeric:tabular-nums}
.dcr-external-link{display:inline-flex;align-items:center;justify-content:center;gap:.35em;min-height:24px;color:color-mix(in srgb,var(--dsw-alias-state-business-primary) 70%,var(--dsw-alias-label-primary));font-size:13px;font-weight:500;text-decoration:none;text-underline-offset:.2em;white-space:nowrap;transition:color .14s ease,text-decoration-thickness .14s ease}
.dcr-external-link:hover{color:var(--dsw-alias-label-primary);text-decoration:underline;text-decoration-thickness:.12em}
.dcr-post-author.dcr-external-link{gap:6px;color:var(--dsw-alias-label-primary);font-weight:600}
.dcr-tibo-text{margin:8px 0 0;color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:21px;white-space:pre-line;overflow-wrap:anywhere}
.dcr-error{display:flex;align-items:flex-start;gap:8px;padding:9px 10px;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 7%,var(--dsw-alias-bg-layer-1))}
.dcr-error-icon{flex:none;margin-top:1px;color:var(--dsw-alias-state-warn-primary)}
.dcr-error-main{flex:1;min-width:0}
.dcr-error-title{color:var(--dsw-alias-label-primary);font-size:.875em;font-weight:500;line-height:1.4}
.dcr-error-text{margin-top:.2em;color:var(--dsw-alias-label-secondary);font-size:.8125em;line-height:1.45;overflow-wrap:anywhere}
.dcr-error .dcr-btn{width:auto;min-width:36px;height:32px;padding:0 10px;font-size:.8125em;white-space:nowrap}
.dcr-foot{position:sticky;bottom:0;flex-shrink:0;display:flex;align-items:center;justify-content:space-between;gap:12px;min-width:0;margin-top:12px;padding-top:10px;border-top:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base,var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.dcr-foot-tools .dcr-source-link{width:30px;height:30px;min-height:30px}
.dcr-foot-tools{display:inline-flex;align-items:center;justify-content:flex-end;gap:0;min-width:0}
.dcr-source-link,.dcr-source-action{min-height:24px}
@media(max-width:420px){
  .dcr-card{width:min(340px,calc(100vw - 16px));padding:16px}
  .dcr-summary-subvalue{min-width:42px}
}
@media(max-width:280px){
  .dcr-completion-time::before{content:none}
  .dcr-summary-latest{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:0 8px;min-height:38px}
  .dcr-summary-latest>.dcr-scope-mark,.dcr-recent-kind{grid-row:span 2}
  .dcr-recent-kind{overflow-wrap:anywhere}
  .dcr-summary-value,.dcr-summary-subvalue{grid-column:3;text-align:end}
}
@media(pointer:coarse){
  .dcr-dock-button,.dcr-dock-sizer,.dcr-panel-icon-button{min-width:44px;min-height:44px}
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
      return t(resetTypeLabelKey(record ? resetTypeOf(record) : null));
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

    function fmtClock(iso, localeId) {
      return new Intl.DateTimeFormat(intlLocaleOf(localeId), { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(iso));
    }

    function fmtScheduleCompact(iso, localeId, precision, now, t) {
      const day = scheduleDaySuffix(iso, now, t).replace(/[（）()]/g, '') ||
        new Intl.DateTimeFormat(intlLocaleOf(localeId), { month: 'short', day: 'numeric' }).format(new Date(iso));
      return precision === 'date' ? day : day + ' ' + fmtClock(iso, localeId);
    }

    function LatestResetItem({ record, labelKey, at, t, localeId, now }) {
      const slotType = labelKey === 'latestGlobalLabel' ? 'global' : 'banked';
      const type = resetTypeOf(record) ? slotType : 'unknown';
      const title = [t(labelKey), resetScopeLabel(record, t), at ? fmtAbsExact(at, localeId) : ''].filter(Boolean).join(' · ');
      return h('div', { key: labelKey, className: 'dcr-summary-latest', title, 'aria-label': title },
        ScopeMark({ type, t, size: 15 }),
        h('span', { className: 'dcr-recent-kind' }, t(type === 'unknown' ? 'typeUnknown' : slotType === 'global' ? 'compactGlobal' : 'compactBanked')),
        at ? h('time', { className: 'dcr-summary-value', dateTime: at, title }, fmtAbsCompact(at, localeId))
          : h('span', { className: 'dcr-summary-value' }, t('noTime')),
        at ? h('span', { className: 'dcr-summary-subvalue' }, fmtRel(at, t, now)) : null,
      );
    }

    function compactTypeLabel(type, t) {
      if (type === 'global') return t('compactGlobal');
      if (type === 'banked') return t('compactBanked');
      if (type === 'global_and_banked') return t('compactGlobal') + ' / ' + t('compactBanked');
      return t('typeUnknown');
    }

    function ResetSummary({ data, t, localeId, now }) {
      const verdict = reportedVerdict(data, now);
      const answerKey = completionAnswerKey(verdict.completed);
      const unknown = answerKey === 'todayUnknown';
      const answerLabel = t('todayQuestion') + ' ' + t(answerKey);
      const completedTypeKeys = answerKey === 'todayYes' ? completedTypeLabelKeys(verdict.completed) : [];
      const completedTypes = completedTypeKeys.map((key) => t(key));
      const events = completedTypeKeys.length === 1 ? todayCompletionEvents(data, now) : [];
      const event = events.length === 1 ? events[0] : null;
      // A single time describes one confirmed event, not a sum of separate resets.
      const completionAt = event && resetTypeLabelKey(event.type) === completedTypeKeys[0] &&
        event.time.field !== 'announcedAt' ? event.time.value : null;
      const next = data && data.nextScheduled;
      const window = next && next.scheduleWindow;
      const target = window && (window.startAt || window.endAt) || next && next.effectiveAt;
      const nextAt = target && Number.isFinite(Date.parse(target)) ? target : null;
      const probability = verdict.percent === null ? '' : (verdict.percent === 100 ? '' : '≥') + verdict.percent + '%';
      const nextText = nextAt ? fmtScheduleCompact(nextAt, localeId, next.schedulePrecision, now, t) : next ? t('scheduleUnknown') : t('noSchedule');
      const expiresAt = Date.parse(window && (window.endAt || window.startAt) || next && next.effectiveAt || '');
      const currentAt = Number.isFinite(now) ? now : Date.parse(data && data.currentTime || '');
      const hasUpcoming = next && next.kind === 'reset_scheduled' && (!next.scheduleState || next.scheduleState === 'pending') &&
        (!Number.isFinite(expiresAt) || expiresAt >= currentAt);
      const accessible = [answerLabel,
        ...completedTypes,
        ...(verdict.scheduled ? [t(verdict.questionKey), probability, t(verdict.answerKey)] : []),
        next ? t('nextScheduleLabel') + ' · ' + resetScopeLabel(next, t) + ' · ' + nextText : '',
      ].filter(Boolean).join(' · ');
      return h('section', { className: 'dcr-status-line', 'aria-label': accessible },
        h('div', { className: 'dcr-forecast' },
          h('h3', { className: 'dcr-reset-heading', 'aria-label': unknown ? answerLabel : undefined },
            h('span', { className: 'dcr-reset-copy' },
              h('span', null, t('todayQuestion')),
              completedTypes.length ? h('span', { className: 'dcr-reset-completion' },
                h('span', null, completedTypes.join(' · ')),
                completionAt ? h('time', { className: 'dcr-completion-time', dateTime: completionAt }, fmtClock(completionAt, localeId)) : null,
              ) : null,
            ),
            h('strong', { className: 'dcr-reset-state', 'data-reset-state': answerKey, title: unknown ? t(answerKey) : undefined },
              unknown ? '—' : t(answerKey)),
          ),
          h('div', { className: 'dcr-reset-outlook' },
            hasUpcoming ? [
              h('span', { key: 'scope' }, compactTypeLabel(resetTypeOf(next), t) + ' · ' + t('expectedShort')),
              nextAt ? h('time', { key: 'time', className: 'dcr-forecast-time', dateTime: nextAt, title: fmtScheduleAbs(nextAt, localeId, next.schedulePrecision) }, nextText)
                : h('span', { key: 'time' }, nextText),
              probability ? h('span', { key: 'probability', className: 'dcr-forecast-probability' }, '· ' + probability) : null,
            ] : h('span', null, t('noSchedule')),
          ),
        ),
      );
    }

    function ResetHistory({ data, t, localeId, now }) {
      const entries = recentResetEntries(data);
      if (!entries.length) return null;
      return h('section', { className: 'dcr-recent', 'aria-label': t('compactRecent') },
        h('h3', { className: 'dcr-recent-title' }, t('compactRecent')),
        ...entries.map((entry) => LatestResetItem({ ...entry, t, localeId, now })),
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
        const isStatusUrl = /^\/i\/(?:web\/)?status\/\d+\/?$/i.test(url.pathname);
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

    function tiboPostCandidate(record) {
      const url = tiboPostUrl(record);
      if (!url || ![record.text, record.translatedText].some((text) => typeof text === 'string' && text.trim())) {
        return null;
      }
      const postIso = [record.announcedAt, record.completedAt, record.effectiveAt]
        .find((value) => typeof value === 'string' && Number.isFinite(Date.parse(value)));
      return { record, url, postIso, at: postIso ? Date.parse(postIso) : -Infinity };
    }

    function relatedRecordIds(record) {
      return Array.isArray(record.relatedRecordIds) ? record.relatedRecordIds : [];
    }

    function completionsWithoutTiboPost(data) {
      return [data?.latestGlobal, data?.latestBanked].filter((record) =>
        record?.kind === 'reset_completed' &&
        (record.source?.origin === 'operator' || relatedRecordIds(record).length > 0) &&
        !tiboPostCandidate(record),
      );
    }

    async function refreshRelatedSchedules(data, rate) {
      const completions = completionsWithoutTiboPost(data);
      if (!completions.length || relatedSchedulesPending || rate.remaining === 0) return;
      const key = JSON.stringify(completions.map((record) => [record.id, relatedRecordIds(record)]));
      const now = Date.now();
      if (now < relatedSchedulesLimitedUntil ||
          (relatedSchedulesLookup?.key === key && now < relatedSchedulesLookup.expiresAt)) return;

      // Fulfilled schedules are absent from nextScheduled and may be omitted from kind=all.
      const url = new URL(API_BASE + '/records');
      url.searchParams.set('kind', 'reset_scheduled');
      url.searchParams.set('lang', TIBO_TRANSLATION_LANG);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), RELATED_SCHEDULE_TIMEOUT_MS);
      relatedSchedulesPending = true;
      relatedSchedulesLookup = { key, expiresAt: now + INTERACTIVE_REFRESH_MS };
      try {
        const res = await fetch(url.toString(), {
          signal: controller.signal, cache: 'no-store', headers: { accept: 'application/json' },
        });
        if (res.status === 429) {
          const body = await res.json().catch(() => null);
          const seconds = Math.max(INTERACTIVE_REFRESH_MS / 1000, retryAfterSeconds(res, body) || 0);
          relatedSchedulesLimitedUntil = Date.now() + seconds * 1000;
        } else if (res.ok) {
          const body = await res.json();
          if (!controller.signal.aborted && body?.ok === true && Array.isArray(body.data?.items)) {
            relatedSchedulesStore.set(body.data.items);
          }
        }
      } catch {
        // Supplemental post content is optional. Retain the last valid page.
      } finally {
        clearTimeout(timeout);
        relatedSchedulesPending = false;
        // A later status refresh may have found another completion during this request.
        const latest = statusStore.getSnapshot().entry;
        if (latest && latest.data !== data) void refreshRelatedSchedules(latest.data, latest.rate);
      }
    }

    function latestTiboPost(data, relatedSchedules) {
      const direct = [data?.latestGlobal, data?.latestBanked, data?.nextScheduled];
      const completions = completionsWithoutTiboPost(data);
      const linked = relatedSchedules.filter((record) =>
        record?.kind === 'reset_scheduled' && record.scheduleState === 'fulfilled' &&
        typeof record.announcedAt === 'string' && Number.isFinite(Date.parse(record.announcedAt)) &&
        completions.some((completion) => {
          if (record.completionRecordId) return record.completionRecordId === completion.id;
          return typeof record.id === 'string' && relatedRecordIds(completion).includes(record.id);
        }),
      );
      return [...direct, ...linked].map(tiboPostCandidate).filter(Boolean)
        .sort((left, right) => right.at - left.at)[0] || null;
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

    function selectedPostPart(parts, preferredLanguage) {
      return parts.find((part) => part.lang === preferredLanguage) || parts[0] || null;
    }

    function TiboPost({ data, relatedSchedules = [], localeId, t, preferredLanguage, onLanguageChange }) {
      const item = latestTiboPost(data, relatedSchedules);
      if (!item) return null;
      const textParts = tiboPostTextParts(item.record, TIBO_TRANSLATION_LANG);
      const part = selectedPostPart(textParts, preferredLanguage || (isZh(localeId) ? TIBO_TRANSLATION_LANG : 'en'));
      if (!part) return null;
      const alternate = textParts.find((candidate) => candidate.lang !== part.lang);
      const postIso = item.postIso;
      return h('article', { className: 'dcr-tibo-post', 'aria-label': 'Tibo · ' + t('sourcePost') },
        h('div', { className: 'dcr-post-toolbar' },
          h('div', { className: 'dcr-post-byline' },
            h('a', { className: 'dcr-post-author dcr-external-link', href: item.url, target: '_blank', rel: 'noopener noreferrer', title: t('openTiboPost'), 'aria-label': t('openTiboPost') },
              h('img', { className: 'dcr-tibo-avatar', src: TIBO_AVATAR_DATA_URI, alt: '', width: 20, height: 20 }),
              'Tibo'),
            postIso ? h('time', { className: 'dcr-tibo-time', dateTime: postIso }, fmtTiboTime(postIso, localeId)) : null,
          ),
          alternate ? h('button', {
            type: 'button', className: 'dcr-post-language', lang: alternate.lang,
            onClick: () => onLanguageChange?.(alternate.lang),
          }, alternate.lang === TIBO_TRANSLATION_LANG ? '中文' : 'English') : null,
        ),
        h('p', { className: 'dcr-tibo-text', lang: part.lang, 'aria-live': 'polite' }, part.text),
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
      const relatedSchedules = useSyncExternalStore(relatedSchedulesStore.subscribe, relatedSchedulesStore.getSnapshot);
      const [open, setOpen] = useState(false);
      const [now, setNow] = useState(() => Date.now());
      const [position, setPosition] = useState(null);
      const [noticePermission, setNoticePermission] = useState(notificationPermission);
      const [postLanguage, setPostLanguage] = useState(() => isZh(localeId) ? TIBO_TRANSLATION_LANG : 'en');
      useEffect(() => setPostLanguage(isZh(localeId) ? TIBO_TRANSLATION_LANG : 'en'), [localeId]);
      const triggerRef = useRef(null);
      const panelRef = useRef(null);
      const panelId = useRef('dcr-popover-' + Math.random().toString(36).slice(2));
      const busy = status.phase === 'loading' || status.phase === 'refreshing';
      const data = status.entry ? status.entry.data : null;
      const fetchedAt = status.entry ? status.entry.at : null;
      const dockAccessibleLabel = t('statusOf');
      // Closed docks do not run the popover's one-second clock. Use the current
      // render time so each poll also reevaluates expiry and local-day priority.
      const verdict = reportedVerdict(data, open ? now : Date.now());
      const chipPercent = status.phase !== 'error' && !status.error && verdict.percent !== null && verdict.percent >= 80
        ? verdict.percent : null;
      const chipProbability = chipPercent === null ? ''
        : (chipPercent === 100 ? '' : '≥') + chipPercent + '%';
      // The high-probability forecast names its reset type; an unknown schedule
      // type is stated as unknown instead of defaulting to global.
      const chipTypeLabel = chipProbability ? t(resetTypeLabelKey(verdict.type)) : null;
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
          const width = Math.max(1, Math.min(340, viewportWidth - (viewportWidth <= 420 ? 16 : 24)));
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
          // Reserve the current language's widest label outside the button so
          // neighbours stay put while the hover and hit area fit visible text.
          h('span', { className: 'dcr-dock-sizer', 'aria-hidden': true },
            h('span', { style: { width: 35, flex: 'none' } }),
            h('span', { className: 'dcr-dock-label-sizer' },
              h('span', null, t('chipName')),
              h('span', null, t('chipName') + ' ≥88%'),
              h('span', null, t('chipName') + ' 100%'),
            ),
          ),
          h(
            'button',
            {
              ref: triggerRef,
              type: 'button',
              className: 'dcr-dock-button',
              'aria-label': chipTypeLabel ? [dockAccessibleLabel, chipTypeLabel, chipProbability].join(' · ') : dockAccessibleLabel,
              title: chipTypeLabel ? dockAccessibleLabel + ' · ' + chipTypeLabel : dockAccessibleLabel,
              'aria-expanded': open,
              'aria-controls': panelId.current,
              onClick: () => setOpen(!open),
            },
            h('span', { className: 'dcr-dock-glyph' }, chipProbability ? ScopeMark({ type: verdict.type, t, size: 15 }) : h(ResetGlyph, { size: 16 })),
            h('span', { className: 'dcr-dock-label' },
              chipProbability
                ? [t('chipName') + ' ', h('span', { className: 'dcr-chip-probability', key: 'probability' }, chipProbability)]
                : t('chipName'),
            ),
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
                h(TiboPost, {
                  preferredLanguage: postLanguage,
                  onLanguageChange: setPostLanguage,
                  data,
                  relatedSchedules,
                  localeId,
                  t,
                }),
                h(ResetHistory, { data, t, localeId, now }),
                h(
                  'footer',
                  { className: 'dcr-foot' },
                  h('p', { className: 'dcr-freshness', title: [
                    t('localTimeZone', { zone: resolveSummaryTimeZone(data && data.timeZone) || '-' }),
                    fetchedAt ? t('fetchedAt', { time: fmtAbsExact(new Date(fetchedAt).toISOString(), localeId) }) : '',
                  ].filter(Boolean).join(' · ') }, fetchedAt ? t('compactUpdated', { time: fmtClock(fetchedAt, localeId) }) : ''),
                  h('div', { className: 'dcr-foot-tools' },
                    h('a', { className: 'dcr-source-link dcr-external-link', href: SITE_URL, target: '_blank', rel: 'noopener noreferrer', title: t('dataSource'), 'aria-label': t('dataSource') }, h(IconLink, { size: 15 })),
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

      ctx.slots.inject('conversation.composer.dock', () =>
        ctx.slots.register(
          {
            name: 'conversation.composer.dock',
            id: 'codex-reset-status',
            order: -100,
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
