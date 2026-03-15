import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { auth } from './auth.js';

const app = new Hono();

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

// CORS — credentials:true required for session cookies
app.use(
  '*',
  cors({
    origin: (origin) => (allowedOrigins.includes(origin) ? origin : allowedOrigins[0]),
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['Set-Cookie'],
    credentials: true,
  }),
);

// Mount better-auth handler at /api/auth/*
app.on(['GET', 'POST'], '/api/auth/**', (c) => auth.handler(c.req.raw));

const port = Number(process.env.PORT ?? 3001);

console.log(`[auth-service] Starting on port ${port}`);
console.log(`[auth-service] Allowed origins: ${allowedOrigins.join(', ')}`);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`[auth-service] Listening on http://localhost:${info.port}`);
});
