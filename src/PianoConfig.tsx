import { useEffect, useRef } from "react";
import { MidiNumbers } from "react-piano";
import { Button } from "@/components/ui/button";

const AutoblurSelect = ({ children, onChange, ...otherProps }) => {
  const selectRef = useRef();

  const handleChange = (event) => {
    onChange(event);
    selectRef.current.blur();
  };

  return (
    <select {...otherProps} onChange={handleChange} ref={selectRef}>
      {children}
    </select>
  );
};

const Label = ({ children }) => <small>{children}</small>;

const PianoConfig = ({
  config,
  setConfig,
  instrumentList,
  keyboardShortcuts,
}) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const numNotes = config.noteRange.last - config.noteRange.first + 1;
      const minOffset = 0;
      const maxOffset = numNotes - keyboardShortcuts.length;

      if (event.key === "ArrowLeft") {
        const reducedOffset = config.keyboardShortcutOffset - 1;
        if (reducedOffset >= minOffset) {
          setConfig({ keyboardShortcutOffset: reducedOffset });
        }
      } else if (event.key === "ArrowRight") {
        const increasedOffset = config.keyboardShortcutOffset + 1;
        if (increasedOffset <= maxOffset) {
          setConfig({ keyboardShortcutOffset: increasedOffset });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [config, setConfig, keyboardShortcuts]);

  const midiNumbersToNotes = MidiNumbers.NATURAL_MIDI_NUMBERS.reduce(
    (obj, midiNumber) => {
      obj[midiNumber] = MidiNumbers.getAttributes(midiNumber).note;
      return obj;
    },
    {},
  );

  const handleChangeFirstNote = (event) => {
    setConfig({
      noteRange: {
        first: parseInt(event.target.value, 10),
        last: config.noteRange.last,
      },
    });
  };

  const handleChangeLastNote = (event) => {
    setConfig({
      noteRange: {
        first: config.noteRange.first,
        last: parseInt(event.target.value, 10),
      },
    });
  };

  const handleChangeInstrument = (event) => {
    setConfig({
      instrumentName: event.target.value,
    });
  };

  const { noteRange, instrumentName } = config;

  return (
    <div className="max-w-2xl flex gap-4 flex-wrap">
      <Button>Select Mode</Button>
      <div className="flex gap-2 items-center">
        <Label>First note</Label>
        <AutoblurSelect
          onChange={handleChangeFirstNote}
          value={noteRange.first}
        >
          {MidiNumbers.NATURAL_MIDI_NUMBERS.map((midiNumber) => (
            <option
              value={midiNumber}
              disabled={midiNumber >= noteRange.last}
              key={midiNumber}
            >
              {midiNumbersToNotes[midiNumber]}
            </option>
          ))}
        </AutoblurSelect>
      </div>
      <div className="flex gap-2 items-center">
        <Label>Last note</Label>
        <AutoblurSelect onChange={handleChangeLastNote} value={noteRange.last}>
          {MidiNumbers.NATURAL_MIDI_NUMBERS.map((midiNumber) => (
            <option
              value={midiNumber}
              disabled={midiNumber <= noteRange.first}
              key={midiNumber}
            >
              {midiNumbersToNotes[midiNumber]}
            </option>
          ))}
        </AutoblurSelect>
      </div>
      <div className="flex gap-2 items-center">
        <Label>Instrument</Label>
        <AutoblurSelect
          className="instrument-dropdown"
          value={instrumentName}
          onChange={handleChangeInstrument}
        >
          {instrumentList.map((value) => (
            <option value={value} key={value}>
              {value}
            </option>
          ))}
        </AutoblurSelect>
      </div>
      <div className="my-2 flex-[1_1_100%] text-center">
        <small className="shortcut-text">
          Use <strong>left arrow</strong> and <strong>right arrow</strong> to
          move the keyboard shortcuts around.
        </small>
      </div>
    </div>
  );
};

export default PianoConfig;
