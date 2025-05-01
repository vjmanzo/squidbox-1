import { useState, useEffect } from "react";
import { toast } from "sonner";
import { InstrumentName } from "soundfont-player";

const InstrumentListProvider = ({
  hostname,
  soundfont = "MusyngKite",
  render,
}: {
  hostname: string;
  soundfont: "MusyngKite" | "FluidR3_GM";
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  render: Function;
}) => {
  const [instrumentList, setInstrumentList] = useState<InstrumentName[] | null>(
    null,
  );

  useEffect(() => {
    const loadInstrumentList = async () => {
      try {
        const response = await fetch(`${hostname}/${soundfont}/names.json`);
        const data = await response.json();
        setInstrumentList(data);
      } catch (error) {
        toast.error("Failed to load instrument list: " + error);
      }
    };

    loadInstrumentList();
  }, [hostname, soundfont]);

  return render(instrumentList);
};

export default InstrumentListProvider;
