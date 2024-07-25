import { useEffect, useRef, useState } from "react";

import { type MicroElements, loadMicroPayments } from "@todaqmicro/payment-js";
import { whenMounted } from "../../utils";

type Props = {
  hash: string;
  type: string;
};

export default function EmbedElement(props: Props) {
  const { hash, type } = props;

  const ref = useRef<HTMLDivElement | null>(null);
  const [ elements, setElements ] = useState<MicroElements | null>(null);
 
  const handleLibrary = async () => {
    if (!elements) {
      const micro = await loadMicroPayments("", { apiVersion: "main" })
      
      setElements(micro.elements());
    }
  };
  useEffect(() => whenMounted(handleLibrary), []);
 
  const handleElements = async () => {
    if (elements) {
      const embed = await elements.create(type, { hash });

      if (embed && ref.current) {
        embed.mount(ref.current);
      }
    };
  };
  useEffect(() => whenMounted(handleElements), [elements]);

  return (
    <div ref={ref} />
  );
}
