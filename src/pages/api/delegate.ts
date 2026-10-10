import type { APIRoute } from 'astro';
import { z } from 'astro/zod';
import Micro from '@todaqmicro/payment-node';

// The persona can either be statically set or retrieved from some database.
// It is not recommended to get the persona from the front-end. 
// const persona = "418274c1055fc2311584a10b95a9345ba96dc7c3fb095f508034044c51e20aa1df"; // Staging
const persona = "419eee27815968b961dc090aaee01de10c237dd36bb15dd9c87ce0e1f214a80016";

// Use production API for 'main' version, staging for 'stage' version
// Default to production if not set via environment variable
if (!process.env.API_BASE_URL) {
  process.env.API_BASE_URL = 'https://pay.m.todaq.net';
}

// The SDK needs to be initialized with your account's client id and secret.
// They come from the server's environment at request time, never from source:
// this repository is public. Read them from process.env, not import.meta.env,
// which Astro can inline into the build.
//
const CREDENTIALS = ['DELEGATE_CLIENT_ID', 'DELEGATE_CLIENT_SECRET'] as const;

let sdk: Micro | null = null;

function getMicro(): Micro | null {
  if (!sdk) {
    const [clientId, clientSecret] = CREDENTIALS.map((name) => process.env[name]);
    if (!clientId || !clientSecret) {
      const missing = CREDENTIALS.filter((name) => !process.env[name]);
      console.error('delegate: missing configuration', missing.join(', '));
      return null;
    }
    sdk = new Micro(clientId, clientSecret, { apiVersion: 'v2' });
  }
  return sdk;
}

// payment-node 0.3.6 console.logs the client secret, access and refresh
// tokens, request headers and the persona's name and email. Mute console.log
// while its calls run; this route logs with console.info and console.error.
//
let muted = 0;
const log = console.log;

async function quietly<T>(call: () => Promise<T>): Promise<T> {
  if (muted++ === 0) {
    console.log = () => {};
  }
  try {
    return await call();
  } finally {
    if (--muted === 0) {
      console.log = log;
    }
  }
}

const DelegateRequest = z.object({
  hash: z.string().min(1),
  nonce: z.union([z.string().min(1), z.number()]),
  timestamp: z.union([z.string().min(1), z.number()]),
  hostname: z.string().optional(),
  name: z.string().optional(),
  email: z.string().optional(),
});

function json(status: number, body: object): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// Ignore the function signature, this will change based on what your server
// side stack is
//
export const POST: APIRoute = async ({ request }) => {
  const micro = getMicro();
  if (!micro) {
    return json(500, { error: 'internal_error', message: 'Internal Server Error' });
  }

  // Now first we grab the validation bits to verify the payment before we
  // delegate.
  //
  const body = DelegateRequest.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return json(400, { error: 'bad_request', message: 'Bad Request' });
  }
  const { email, hash, hostname, name, nonce, timestamp } = body.data;

  try {
    // @ts-ignore
    const isValid = await quietly<boolean>(() => micro.Payment.validPayment(micro.accessToken, hash, nonce, timestamp));

    if (!isValid) {
      console.info('delegate: payment not valid');
      return json(406, { error: 'payment_not_valid', message: 'Not Acceptable - Payment validation failed' });
    }

    // Now we know that the user is the actual person who made the purchase
    // We can delegate a persona to the users twin.
    //
    // @ts-ignore
    const response = await quietly<Response | null>(() => micro.Persona.delegatePersona({ hash: persona, hostname, name, email }));
    console.info('delegate: persona delegated', response ? response.status : 'failed');
  } catch {
    console.error('delegate: payment API request failed');
    return json(502, { error: 'upstream_error', message: 'Bad Gateway' });
  }

  return json(200, {
    status: 200,
    message: "OK",
  });
}
