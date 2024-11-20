import type { APIRoute } from 'astro';
import Micro from '@todaqmicro/payment-node';

// The persona can either be statically set or retrieved from some database.
// It is not recommended to get the persona from the front-end. 
const persona = "418274c1055fc2311584a10b95a9345ba96dc7c3fb095f508034044c51e20aa1df";

process.env.API_BASE_URL = 'https://pay.stage.m.todaq.net';

// The SDK needs to be initialized
//
const micro = new Micro(
  // Replace <CLIENT_ID> with your accounts' client id.
  "mid_8c2f3e7401f44194ace7da5c37d3a35b",
  // Replace <CLIENT_SECRET> with your accounts' client secret.
  "mc_fe89b67d100c4b719372270e399ba4ed",
  { apiVersion: 'v2' },
);

// Ignore the function signature, this will change based on what your server
// side stack is
//
export const POST: APIRoute = async ({ request }) => {
  // Now first we grab the validation bits to verify the payment before we 
  // delegate.
  //
  let body: any | null = null;
  try {
    body = await request.json();
  } catch (error) {
    console.error('ERROR', error);
  }
  if (body) {
    const { email, hash, hostname, name, nonce, timestamp } = body;

    console.log('REQUEST1', body);
    if (hash && nonce && timestamp) {
      // @ts-ignore
      if (await micro.Payment.validPayment(micro.accessToken, hash, nonce, timestamp)) {
        // Now we know that the user is the actual person who made the purchase
        // We can delegate a persona to the users twin.
        //
        // @ts-ignore
        await micro.Persona.delegatePersona({ hash: persona, hostname, name, email });

        return new Response(JSON.stringify({
          status: 200,
          message: "OK",
        }));
      } else {
        return new Response(JSON.stringify({
            status: 406,
            message: "Not Acceptable",
          }),
          { status: 406 }
        );
      }
    } else {
      return new Response(JSON.stringify({
          status: 400,
          message: "Bad Request",
        }), { status: 400 });
    }
  } else {
    return new Response(JSON.stringify({
        status: 400,
        message: "Bad Request",
      }), { status: 400 });
  }
}
