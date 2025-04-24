import { useState, useEffect } from "react";
import PropTypes from "prop-types";

const InstrumentListProvider = ({
  hostname,
  soundfont = "MusyngKite",
  render,
}) => {
  const [instrumentList, setInstrumentList] = useState(null);

  useEffect(() => {
    const loadInstrumentList = async () => {
      try {
        const response = await fetch(`${hostname}/${soundfont}/names.json`);
        const data = await response.json();
        setInstrumentList(data);
      } catch (error) {
        console.error("Failed to load instrument list:", error);
      }
    };

    loadInstrumentList();
  }, [hostname, soundfont]);

  return render(instrumentList);
};

InstrumentListProvider.propTypes = {
  hostname: PropTypes.string.isRequired,
  soundfont: PropTypes.oneOf(["MusyngKite", "FluidR3_GM"]),
  render: PropTypes.func.isRequired,
};

export default InstrumentListProvider;
