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

type Props = {
  consent?: { [key: string]: ConsentOptions };
  destroy?: boolean;
  hash: string;
  type: string;
};

export default function EmbedElement({ consent, destroy, hash, type }: Props) {
  const [ random, _ ] = useState(uuidv4());
 
  return (
    <div style={{ display: 'flex' }}>
      <script type="module" crossOrigin="anonymous" src="http://localhost:3000/micropay.js"></script>
      <div id={`ref-${random}`}><iframe frameBorder="0" width="auto" height="auto" /></div>
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
    const micro = await loadMicroPayments("mp_e4c4131291c24ea3922c9f376367a4f1", { apiVersion: "main" });
    const elements = micro.elements();

    if (elements) {
      const options = {
${`        consent: JSON.parse('${JSON.stringify(consent ? consent : null)}'),`}
        hash: "${hash}",
      };

      const embed = await elements.create("${type}", options);

      if (embed && el) {
        window.addEventListener("message", (event) => {
          if(embed && event.data.includes("_TQMEventDestroy_${random}")) {
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
