'use strict';

const crypto = require('node:crypto');
const { handleEvent } = require('./eventHandlers');

const _processedIds = new Set();

function handleWebhook(req, res) {
  // 1. Verify the HMAC-SHA256 signature
  const signature = req.headers['x-webhook-signature'];
  const secret = process.env.WEBHOOK_SECRET;

  if (
    typeof signature !== 'string' ||
    !/^sha256=[0-9a-f]{64}$/i.test(signature) ||
    !secret ||
    !Buffer.isBuffer(req.body)
  ) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const received = Buffer.from(signature.slice(7), 'hex');

  const expected = crypto
    .createHmac('sha256', secret)
    .update(req.body)
    .digest();

  if (
    received.length !== expected.length ||
    !crypto.timingSafeEqual(expected, received)
  ) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // 2. Parse the body only after verification
  let event;

  try {
    event = JSON.parse(req.body);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  // 3. Check whether this event was already processed
  if (_processedIds.has(event.id)) {
    return res.status(200).json({ status: 'already_processed' });
  }

  // 4. Record the event ID before acknowledging
  _processedIds.add(event.id);

  // 5. Acknowledge immediately, then process asynchronously
  res.status(200).json({ status: 'received' });

  setImmediate(() => {
    handleEvent(event);
  });
}

module.exports = { handleWebhook, _processedIds };
