import assert from 'node:assert/strict';
import test from 'node:test';
import { buildToolForTests, describeResetTypeForTests } from '../index.js';

// Synthetic API payloads (fixtures); values do not reflect live upstream data.
const statusBody = {
  ok: true,
  data: {
    currentTime: '2026-11-02T09:35:51.386Z',
    timeZone: 'America/Los_Angeles',
    nextScheduled: { id: 's-1', kind: 'reset_scheduled', resetType: 'global_and_banked', effectiveAt: '2026-11-02T18:00:00Z' },
    latestGlobal: { id: 'g-1', kind: 'reset_completed', resetType: 'global', announcedAt: '2026-10-28T06:29:38Z' },
    latestBanked: { id: 'b-1', kind: 'reset_completed', announcedAt: '2026-11-01T23:27:20Z' },
  },
  meta: { generatedAt: '2026-11-02T09:35:51Z' },
};
const recordsBody = {
  ok: true,
  data: {
    items: [
      { id: 'r-1', kind: 'reset_scheduled', resetType: 'banked', effectiveAt: '2026-11-03T18:00:00Z' },
      { id: 'r-2', kind: 'reset_completed', resetType: 'global_and_banked', announcedAt: '2026-10-30T06:00:00Z' },
      { id: 'r-3', kind: 'reset_completed', resetType: 'mystery', announcedAt: '2026-10-29T06:00:00Z' },
    ],
    page: 1,
    totalPages: 1,
    total: 3,
  },
  meta: { generatedAt: '2026-11-02T09:36:00Z' },
};

function stubFetch(body) {
  const original = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url: String(url), options });
    return {
      ok: true,
      json: async () => body,
      headers: { get: () => null },
    };
  };
  return { requests, restore() { globalThis.fetch = original; } };
}

test('describeResetType keeps known values and marks unknown values explicitly', () => {
  assert.equal(describeResetTypeForTests('global'), 'type global (global reset)');
  assert.equal(describeResetTypeForTests('banked'), 'type banked (banked reset)');
  assert.equal(
    describeResetTypeForTests('global_and_banked'),
    'type global_and_banked (one event covering both global and banked resets)',
  );
  assert.equal(describeResetTypeForTests(undefined), 'type unknown (not declared by the API)');
  assert.equal(describeResetTypeForTests(null), 'type unknown (not declared by the API)');
  assert.equal(describeResetTypeForTests(''), 'type unknown (not declared by the API)');
  assert.equal(describeResetTypeForTests('mystery'), 'type mystery (unknown reset type)');
});

test('status render explains reset types while preserving raw values and queries', async () => {
  const stub = stubFetch(statusBody);
  try {
    const tool = buildToolForTests({
      apiBaseUrl: 'https://example.test/openapi/v1',
      cacheTtlSeconds: 60,
      timeoutMs: 1000,
    });
    const value = await tool.execute({ action: 'status' });
    const rendered = tool.output.render({ action: 'status' }, value);
    const text = rendered.map((part) => part.text).join('\n');
    assert.match(text, /resetType legend: global = global reset/);
    assert.match(text, /banked = banked reset card/);
    assert.match(text, /global_and_banked = one event covering both/);
    assert.match(text, /kind \(reset_scheduled \/ reset_completed\) is separate from its resetType/);
    assert.match(text, /Next scheduled: type global_and_banked \(one event covering both global and banked resets\)/);
    assert.match(text, /Latest global reset: type global \(global reset\)/);
    assert.match(text, /Latest banked reset: type unknown \(not declared by the API\)/);
    // Raw data stays available on the returned value for downstream callers.
    assert.equal(value.data.nextScheduled.resetType, 'global_and_banked');
    assert.equal(value.data.latestBanked.resetType, undefined);
    // Existing query parameters remain on the request.
    assert.equal(new URL(stub.requests[0].url).pathname, '/openapi/v1/status');
  } finally {
    stub.restore();
  }
});

test('records render explains each record type including unknown values', async () => {
  const stub = stubFetch(recordsBody);
  try {
    const tool = buildToolForTests({
      apiBaseUrl: 'https://example.test/openapi/v1',
      cacheTtlSeconds: 60,
      timeoutMs: 1000,
    });
    const value = await tool.execute({ action: 'records', kind: 'all', page: 1 });
    const text = tool.output.render({ action: 'records' }, value).map((part) => part.text).join('\n');
    assert.match(text, /resetType legend/);
    assert.match(text, /\[scheduled\]: type banked \(banked reset\)/);
    assert.match(text, /\[completed\]: type global_and_banked \(one event covering both global and banked resets\)/);
    assert.match(text, /type mystery \(unknown reset type\)/);
    assert.equal(value.query.kind, 'all');
  } finally {
    stub.restore();
  }
});

test('the tool description names the reset types and the kind axis', () => {
  const tool = buildToolForTests({
    apiBaseUrl: 'https://example.test/openapi/v1',
    cacheTtlSeconds: 60,
    timeoutMs: 1000,
  });
  assert.match(tool.description, /resetType: global \| banked \| global_and_banked/);
  assert.match(tool.description, /kind \(scheduled\/completed\) is a separate axis/);
});
