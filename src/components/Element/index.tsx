import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

// import { whenMounted } from '../../utils.ts';
import Destroy from '../SVG/Destroy';
import Reset from '../SVG/Reset';

type ConsentOptions = {
  type: ConsentType;
  metadata: Array<ActiveConsent | PassiveConsent>;
};

enum ConsentType {
  EMAIL = 0x00,
  TWIN = 0x01,

  TERMS = 0x03,

  CUSTOM = 0x0F,
}

type PassiveConsent = {
  name: string;
  label: string;
  description: string;
}

type ActiveConsent = {
  name: string;
  label: string;
  checked: boolean;
}

/** The payment element's display options, as payment-js's `create()` takes them. */
type DisplayOptions = {
  theme?: 'light' | 'dark';
  decimalPoints?: number;
  leading?: string;
  middle?: string;
  trailing?: string;
  styles?: Record<string, string | number>;
};

/** JSON that is inert inside an inline script: nothing can close the element. */
const scriptJson = (value: unknown) =>
  JSON.stringify(value ?? null)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');

type Props = DisplayOptions & {
  consent?: { [key: string]: ConsentOptions };
  destroy?: boolean;
  hash: string;
  type: string;
  environment: 'cdn.m.todaq.net' | 'cdn.stage.m.todaq.net';
  publicSecret: string;
};

export default function Element({
  consent,
  destroy,
  hash,
  type,
  environment = 'cdn.m.todaq.net',
  publicSecret = 'mp_e4c4131291c24ea3922c9f376367a4f1',
  theme,
  decimalPoints,
  leading,
  middle,
  trailing,
  styles,
}: Props) {
  const display: DisplayOptions = { theme, decimalPoints, leading, middle, trailing, styles };
  const [ random, _ ] = useState(uuidv4());
 
  return (
    <div style={{ display: 'flex' }}>
      <script type="module" crossOrigin="anonymous" src={`https://${environment}/micropay.js`}></script>
      {/* Rendered on the server only: use <Element … /> without a client:
          directive. micropay.js mounts the element's iframe into this div once
          the page has loaded. A hydrated island re-renders the div when its
          JavaScript arrives after that mount, wiping the iframe and leaving
          the embed blank. */}
      <div id={`ref-${random}`} />
      {destroy && (
        <button id={`destroy-${random}`} style={{ border: 0, background: 'transparent', cursor: 'pointer' }}>
          <Destroy size={32} />
          <span style={{ display: 'none' }}>Destroy</span>
        </button>
      )}
      {destroy && (
        <button id={`reset-${random}`} style={{ border: 0, background: 'transparent', cursor: 'pointer' }}>
          <Reset size={32} />
          <span style={{ display: 'none' }}>Reset</span>
        </button>
      )}
      <script defer type="text/javascript" dangerouslySetInnerHTML={{
        __html: `

(() => {
  async function loaded() {
    const el = document.getElementById("ref-${random}");
    const destroy = document.getElementById("destroy-${random}");
    const reset = document.getElementById("reset-${random}");
    const micro = await loadMicroPayments("${publicSecret}", { apiVersion: "main" });
    const elements = micro.elements();

    if (elements) {
      const options = {
        ...${scriptJson(Object.fromEntries(Object.entries(display).filter(([, v]) => v !== undefined)))},
        consent: ${scriptJson(consent ?? null)},
        hash: ${scriptJson(hash)},
      };

      const embed = await elements.create("${type}", options);

      if (embed && el) {
        window.addEventListener("message", (event) => {
          if(embed && event.data && event.data.includes &&  event.data.includes("_TQMEventDestroy_${random}")) {
            embed.destroy();
          }
        });

        embed.mount(el); 

        if (destroy) {
          destroy.addEventListener("click", (event) => {
            window.postMessage("_TQMEventDestroy_${random}", "*");
          });
        }

        if (reset) {
          reset.addEventListener("click", (event) => {
            window.postMessage("_TQMEventDestroy_${random}", "*");
            loaded();
          });
        }
      }
    };
  }

  document.addEventListener("DOMContentLoaded", loaded);
})();
`
      }} />
    </div>
  );
}
