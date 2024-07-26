type Props = {
  hash: string;
  type: string;
};

export default function EmbedElement(props: Props) {
  const { hash, type } = props;

  return (
    <div>
      <script type="module" crossOrigin="anonymous" src="https://cdn.m.todaq.net/micropay.js"></script>
      <div id="ref" />
      <script defer type="text/javascript" dangerouslySetInnerHTML={{
        __html: `

(() => {
  document.addEventListener("DOMContentLoaded", async () => {
    const el = document.getElementById("ref");
    const micro = await loadMicroPayments("mp_e4c4131291c24ea3922c9f376367a4f1", { apiVersion: "main" });
    const elements = micro.elements();

    console.log('TEST!!');

    if (elements) {
      const embed = await elements.create("${type}", { hash: "${hash}" });

      if (embed && el) {
        embed.mount(el);
      }
    };
  });
})();

`
      }} />
    </div>
  );
}
