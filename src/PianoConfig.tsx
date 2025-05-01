import { useEffect, useRef, useState } from "react";
import { MidiNumbers } from "react-piano";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import { InstrumentName } from "soundfont-player";

const AutoblurSelect = ({
  value,
  children,
  onChange,
}: {
  value: string | number;
  children: React.ReactNode;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}) => {
  const selectRef = useRef<HTMLSelectElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event);
    selectRef.current?.blur();
  };

  return (
    <select value={value} onChange={handleChange} ref={selectRef}>
      {children}
    </select>
  );
};

const Label = ({ children }: { children: React.ReactNode }) => (
  <small>{children}</small>
);

export type PianoConfig = {
  noteRange: {
    first: number;
    last: number;
  };
  instrumentName: InstrumentName;
  keyboardShortcutOffset: number;
};

const PianoConfig = ({
  config,
  setPianoConfig,
  instrumentList,
  keyboardShortcuts,
}: {
  config: PianoConfig;
  setPianoConfig: (config: Partial<PianoConfig>) => void;
  instrumentList: InstrumentName[];
  keyboardShortcuts: string[];
}) => {
  const [mode, setMode] = useState<"Edit Mode" | "Preview Mode">(
    "Preview Mode",
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const numNotes = config.noteRange.last - config.noteRange.first + 1;
      const minOffset = 0;
      const maxOffset = numNotes - keyboardShortcuts.length;

      if (event.key === "ArrowLeft") {
        const reducedOffset = config.keyboardShortcutOffset - 1;
        if (reducedOffset >= minOffset) {
          setPianoConfig({ keyboardShortcutOffset: reducedOffset });
        }
      } else if (event.key === "ArrowRight") {
        const increasedOffset = config.keyboardShortcutOffset + 1;
        if (increasedOffset <= maxOffset) {
          setPianoConfig({ keyboardShortcutOffset: increasedOffset });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [config, setPianoConfig, keyboardShortcuts]);

  const midiNumbersToNotes = MidiNumbers.NATURAL_MIDI_NUMBERS.reduce(
    (obj: Record<number, string>, midiNumber: number) => {
      obj[midiNumber] = MidiNumbers.getAttributes(midiNumber).note;
      return obj;
    },
    {},
  );

  const handleChangeFirstNote = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setPianoConfig({
      noteRange: {
        first: parseInt(event.target.value, 10),
        last: config.noteRange.last,
      },
    });
  };

  const handleChangeLastNote = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setPianoConfig({
      noteRange: {
        first: config.noteRange.first,
        last: parseInt(event.target.value, 10),
      },
    });
  };

  const handleChangeInstrument = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setPianoConfig({
      instrumentName: event.target.value as InstrumentName,
    });
  };

  const { noteRange, instrumentName } = config;

  if (!config) {
    return null;
  }
  return (
    <div className="max-w-2xl flex gap-4 flex-wrap">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="outline">{mode}</Button>{" "}
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setMode("Preview Mode")}>
            Preview Mode
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setMode("Edit Mode")}>
            Edit Mode
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex gap-2 items-center">
        <Label>First note</Label>
        <AutoblurSelect
          onChange={handleChangeFirstNote}
          value={noteRange.first}
        >
          {MidiNumbers.NATURAL_MIDI_NUMBERS.map((midiNumber: number) => (
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
          {MidiNumbers.NATURAL_MIDI_NUMBERS.map((midiNumber: number) => (
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
          value={instrumentName}
          onChange={handleChangeInstrument}
        >
          {instrumentList.map((value) => (
            <option value={value.toString()} key={value.toString()}>
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
