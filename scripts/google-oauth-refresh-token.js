#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Generate a Gmail OAuth2 consent URL and optionally exchange an auth code
 * for access/refresh tokens without external dependencies.
 *
 * Usage:
 *   node scripts/google-oauth-refresh-token.js
 *   node scripts/google-oauth-refresh-token.js --code=AUTH_CODE
 *
 * Required env:
 *   GOOGLE_CLIENT_ID
 *   GOOGLE_CLIENT_SECRET (only needed to обмен code -> token)
 *   GOOGLE_REDIRECT_URI
 *
 * Optional env:
 *   GOOGLE_OAUTH_SCOPE (default: https://mail.google.com/)
 */

const https = require('https');
const { URLSearchParams } = require('url');
const fs = require('fs');
const path = require('path');

// Load .env if present (no external dependency)
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const raw = fs.readFileSync(envPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

const clientId = process.env.GOOGLE_CLIENT_ID || '';
const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
const redirectUri = process.env.GOOGLE_REDIRECT_URI || '';
const scope = process.env.GOOGLE_OAUTH_SCOPE || 'https://mail.google.com/';

const codeArg = process.argv.find((a) => a.startsWith('--code='));
const authCode = codeArg ? codeArg.split('=')[1] : '';

if (!clientId || !redirectUri) {
  console.error('Missing required env. Set GOOGLE_CLIENT_ID and GOOGLE_REDIRECT_URI.');
  process.exit(1);
}

const consentParams = new URLSearchParams({
  client_id: clientId,
  redirect_uri: redirectUri,
  response_type: 'code',
  scope,
  access_type: 'offline',
  prompt: 'consent',
});

const consentUrl = `https://accounts.google.com/o/oauth2/v2/auth?${consentParams.toString()}`;

console.log('Consent URL:');
console.log(consentUrl);
console.log('');
console.log('After consenting, copy the ?code=... value and run:');
console.log('node scripts/google-oauth-refresh-token.js --code=YOUR_CODE');

if (!authCode) {
  process.exit(0);
}

if (!clientSecret) {
  console.error('Missing GOOGLE_CLIENT_SECRET for code exchange.');
  process.exit(1);
}

const tokenParams = new URLSearchParams({
  client_id: clientId,
  client_secret: clientSecret,
  code: authCode,
  grant_type: 'authorization_code',
  redirect_uri: redirectUri,
});

const req = https.request(
  {
    method: 'POST',
    hostname: 'oauth2.googleapis.com',
    path: '/token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  },
  (res) => {
    let data = '';
    res.on('data', (chunk) => (data += chunk));
    res.on('end', () => {
      console.log('');
      console.log('Token response:');
      console.log(data);
    });
  },
);

req.on('error', (err) => {
  console.error('Request error:', err.message);
});

req.write(tokenParams.toString());
req.end();
