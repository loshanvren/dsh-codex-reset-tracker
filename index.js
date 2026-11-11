import Schema from '@deepseek-ai/schemastery';

export const Config = Schema.object({
  apiBaseUrl: Schema.string().default('https://didcodexreset.com/openapi/v1'),
  cacheTtlSeconds: Schema.number().default(60).min(5).max(3600),
  timeoutMs: Schema.number().default(20000).min(1000).max(120000),
});

const KINDS = ['all', 'reset_scheduled', 'reset_completed'];
const LANGS = ['en', 'zh-CN', 'zh-HK', 'ja', 'ko'];
const CACHE_MAX = 32;

/** URL -> { at, data, meta, rate }; bounded by CACHE_MAX. */
const responseCache = new Map();

function makeApi(config) {
  const ttlMs = config.cacheTtlSeconds * 1000;

  return async function apiFetch(path, params, signal) {
    const url = new URL(config.apiBaseUrl + path);
    for (const [key, value] of Object.entries(params || {})) {
      if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
    }
    const key = url.toString();
    const hit = responseCache.get(key);
    if (hit && Date.now() - hit.at < ttlMs) return hit;

    const res = await fetch(url, {
      signal,
      headers: { accept: 'application/json' },
    });
    let body = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }
    if (!res.ok || !body || body.ok !== true) {
      const error = new Error(
        `didcodexreset.com ${path} failed: ${body && body.error ? body.error : 'HTTP ' + res.status}` +
          (body && body.detail ? ` (${body.detail})` : ''),
      );
      error.status = res.status;
      if (body && typeof body.retryAfter === 'number') error.retryAfter = body.retryAfter;
      throw error;
    }
    const entry = {
      at: Date.now(),
      data: body.data,
      meta: body.meta || null,
      rate: {
        limit: res.headers.get('X-RateLimit-Limit'),
        remaining: res.headers.get('X-RateLimit-Remaining'),
        reset: res.headers.get('X-RateLimit-Reset'),
      },
    };
    responseCache.set(key, entry);
    if (responseCache.size > CACHE_MAX) {
      const oldest = responseCache.keys().next().value;
      responseCache.delete(oldest);
    }
    return entry;
  };
}

function pickString(value, allowed) {
  return typeof value === 'string' && allowed.includes(value) ? value : undefined;
}

function pickPositiveInt(value, max) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 1) return undefined;
  return Math.min(Math.floor(value), max);
}

const RESET_TYPE_LEGEND =
  'resetType legend: global = global reset (全体重置); ' +
  'banked = banked reset card (重置卡); ' +
  'global_and_banked = one event covering both kinds. ' +
  'A record\'s kind (reset_scheduled / reset_completed) is separate from its resetType; ' +
  'scope reports the affected plans and usage windows separately.';

/**
 * Human-readable type explanation that keeps the raw value visible. Missing
 * or unknown values are reported as unknown, never guessed as global or joint.
 */
function describeResetType(value) {
  if (value === 'global') return 'type global (global reset)';
  if (value === 'banked') return 'type banked (banked reset)';
  if (value === 'global_and_banked') return 'type global_and_banked (one event covering both global and banked resets)';
  if (value === undefined || value === null || String(value).trim() === '') {
    return 'type unknown (not declared by the API)';
  }
  return `type ${value} (unknown reset type)`;
}

function describeRecord(prefix, record) {
  if (!record) return `${prefix}: none`;
  const when = record.effectiveAt || record.completedAt || record.announcedAt || 'unknown time';
  const bits = [`${prefix}: ${describeResetType(record.resetType)}`, when];
  if (record.kind === 'reset_scheduled' && record.scheduleState) bits.push(record.scheduleState);
  if (typeof record.confidence === 'number') bits.push(`confidence ${record.confidence}`);
  const quote = (record.text || '').split('\n')[0].slice(0, 160);
  const line = bits.join(' · ');
  const source = record.source && record.source.url ? `\n  source: ${record.source.url}` : '';
  const detailUrl = record.detailUrl ? `\n  detail: ${record.detailUrl}` : '';
  return `${line}${quote ? `\n  "${quote}"` : ''}${source}${detailUrl}`;
}

function renderStatus(value) {
  const data = value.data || {};
  const lines = ['Codex reset status (didcodexreset.com)'];
  if (value.meta && value.meta.generatedAt) lines.push(`snapshot generated at ${value.meta.generatedAt}`);
  if (data.currentTime) lines.push(`server currentTime: ${data.currentTime}`);
  if (data.timeZone) lines.push(`site time zone: ${data.timeZone}`);
  lines.push('');
  lines.push(RESET_TYPE_LEGEND);
  lines.push('');
  lines.push(describeRecord('Next scheduled', data.nextScheduled));
  lines.push(describeRecord('Latest global reset', data.latestGlobal));
  lines.push(describeRecord('Latest banked reset', data.latestBanked));
  if (value.rate && value.rate.remaining !== null && value.rate.remaining !== undefined) {
    lines.push('');
    lines.push(`API quota remaining: ${value.rate.remaining}/${value.rate.limit || 60} per hour`);
  }
  return lines.join('\n');
}

function renderRecords(value) {
  const data = value.data || {};
  const items = Array.isArray(data.items) ? data.items : [];
  const lines = [
    `Codex reset records (kind=${value.query.kind}, page ${data.page || 1} of ${data.totalPages || 1}, ${data.total || 0} total)`,
  ];
  if (value.meta && value.meta.generatedAt) lines.push(`snapshot generated at ${value.meta.generatedAt}`);
  lines.push('');
  lines.push(RESET_TYPE_LEGEND);
  lines.push('');
  if (items.length === 0) lines.push('(no records on this page)');
  for (const item of items) {
    lines.push(describeRecord(`[${item.kind === 'reset_scheduled' ? 'scheduled' : 'completed'}]`, item));
    lines.push('');
  }
  if (value.rate && value.rate.remaining !== null && value.rate.remaining !== undefined) {
    lines.push(`API quota remaining: ${value.rate.remaining}/${value.rate.limit || 60} per hour`);
  }
  return lines.join('\n');
}

// Keep the literal ToolDefinition shape: profile-linked installs cannot resolve dsh-tools here.
function buildTool(config) {
  const apiFetch = makeApi(config);

  return {
    name: 'codex_reset',
    description:
      'Query didcodexreset.com public signals about Codex usage-limit resets. ' +
      'action "status" returns the next scheduled reset plus the latest confirmed global and banked resets; ' +
      'action "records" returns one page of history (kind: all | reset_scheduled | reset_completed, up to 10 per page). ' +
      'Every record carries resetType: global | banked | global_and_banked; kind (scheduled/completed) is a separate axis. ' +
      'Read-only, no key; responses are cached ~60s and the shared quota is 60 requests/hour.',

    parameters: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['status', 'records'],
          description: '"status" for the live snapshot (default); "records" for paginated history.',
        },
        kind: {
          type: 'string',
          enum: KINDS,
          description: 'Record filter for action "records". Defaults to "all".',
        },
        page: { type: 'integer', minimum: 1, description: '1-based page number for action "records".' },
        pageSize: { type: 'integer', minimum: 1, maximum: 10, description: 'Records per page, 1-10. Defaults to 10.' },
        lang: {
          type: 'string',
          enum: LANGS,
          description: 'Optional translation language (adds translatedText to every record).',
        },
      },
      additionalProperties: false,
    },

    output: {
      schema: { type: 'object', additionalProperties: true },
      render(args, value) {
        const text =
          value && value.action === 'records' ? renderRecords(value) : renderStatus(value);
        return [{ type: 'text', text }];
      },
    },

    timeoutMs: config.timeoutMs,
    isConcurrencySafe() {
      return true;
    },

    async execute(args, exec) {
      const action = pickString(args && args.action, ['status', 'records']) || 'status';
      const lang = pickString(args && args.lang, LANGS);
      if (action === 'records') {
        const query = {
          kind: pickString(args && args.kind, KINDS) || 'all',
          page: pickPositiveInt(args && args.page, 100000) || 1,
          pageSize: pickPositiveInt(args && args.pageSize, 10) || 10,
        };
        if (lang) query.lang = lang;
        const entry = await apiFetch('/records', query, exec && exec.signal);
        return { action, query, data: entry.data, meta: entry.meta, rate: entry.rate };
      }
      const entry = await apiFetch('/status', lang ? { lang } : {}, exec && exec.signal);
      return { action, data: entry.data, meta: entry.meta, rate: entry.rate };
    },
  };
}

export function apply(ctx, config) {
  const resolved = Config(config || {});
  ctx.effect(() => ctx.tools.register(buildTool(resolved)), 'codex-reset: codex_reset tool');
}

// Exported for regression tests only; unused at runtime.
export const buildToolForTests = buildTool;
export const describeResetTypeForTests = describeResetType;

export const inject = ['tools'];
