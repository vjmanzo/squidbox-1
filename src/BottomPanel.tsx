import { useState, useEffect } from "react";
import { Piano, MidiNumbers, KeyboardShortcuts } from "react-piano";
import "react-piano/dist/styles.css";
import SquidboxButton from "./SquidboxButton";
import SoundfontProvider from "./SoundfontProvider";
import { DimensionsProvider, useDimensions } from "./DimensionsProvider";
import PianoConfig from "./PianoConfig";
import InstrumentListProvider from "./InstrumentListProvider";

const soundfontHostname = "https://d1pzp51pvbm36p.cloudfront.net";
const buttonMappings = [
  ["c4", "e4", "g4"].map(MidiNumbers.fromNote),
  ["d4", "f4", "a4"].map(MidiNumbers.fromNote),
  ["e4", "g4", "b4"].map(MidiNumbers.fromNote),
  ["f4", "a4", "c5"].map(MidiNumbers.fromNote),
  ["g4", "b4", "d5"].map(MidiNumbers.fromNote),
  ["a4", "c5", "e5"].map(MidiNumbers.fromNote),
  ["b4", "d5", "f5"].map(MidiNumbers.fromNote),
  ["c5", "e5", "g5"].map(MidiNumbers.fromNote),
];

const BottomPanel = () => {
  const [audioContext, setAudioContext] = useState(null);
  const [config, setConfig] = useState({
    instrumentName: "acoustic_grand_piano",
    noteRange: {
      first: MidiNumbers.fromNote("c4"),
      last: MidiNumbers.fromNote("f6"),
    },
    keyboardShortcutOffset: 0,
    activeNotes: [],
  });

  const keyboardShortcuts = KeyboardShortcuts.create({
    firstNote: config.noteRange.first + config.keyboardShortcutOffset,
    lastNote: config.noteRange.last + config.keyboardShortcutOffset,
    keyboardConfig: KeyboardShortcuts.HOME_ROW,
  });

  const onSquidboxButtonPress = (index: number) => {
    const notes = buttonMappings[index];
    setConfig((prevConfig) => ({
      ...prevConfig,
      activeNotes: notes,
    }));
  };

  const onSquidboxButtonRelease = () => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      activeNotes: [],
    }));
  };

  useEffect(() => {
    if (!audioContext) {
      const AudioContextClass =
        // @ts-expect-error webkitAudioContext fallback needed to support Safari
        window.AudioContext || window.webkitAudioContext;
      // @ts-expect-error AudioContextClass is not defined
      setAudioContext(new AudioContextClass());
    }

    return () => {
      // @ts-expect-error audioContext is not defined
      if (audioContext && audioContext.state !== "closed") {
        // @ts-expect-error close method is not defined
        audioContext.close();
      }
    };
  }, [audioContext]);

  if (!audioContext) {
    return <div className="keyboard-container">Click to initialize piano</div>;
  }

  return (
    <div className="flex-1 flex flex-col items-center text-center gap-8">
      <div>
        <button>Connect Squidbox</button>
        <button>Add Voicing</button>
        <button>Select Mode</button>
      </div>
      <div className="flex gap-2">
        {buttonMappings.map((_, index) => {
          return (
            <SquidboxButton
              key={index}
              color={["red", "green", "purple", "yellow"][index % 4]}
              alt={`Button ${index + 1}`}
              onMouseDown={() => onSquidboxButtonPress(index)}
              onMouseUp={onSquidboxButtonRelease}
              onMouseLeave={onSquidboxButtonRelease}
              onTouchStart={() => onSquidboxButtonPress(index)}
              onTouchEnd={onSquidboxButtonRelease}
            />
          );
        })}
      </div>
      <SoundfontProvider
        instrumentName={config.instrumentName}
        audioContext={audioContext}
        hostname={soundfontHostname}
        render={({ isLoading, playNote, stopNote, stopAllNotes }) => (
          <div className="flex flex-col items-center">
            <InstrumentListProvider
              hostname={soundfontHostname}
              render={(instrumentList) => (
                <PianoConfig
                  config={config}
                  setConfig={(config) => {
                    setConfig((prevConfig) => ({
                      ...prevConfig,
                      ...config,
                    }));
                    stopAllNotes();
                  }}
                  instrumentList={instrumentList || [config.instrumentName]}
                  keyboardShortcuts={keyboardShortcuts}
                />
              )}
            />
            <DimensionsProvider>
              <div>
                <ResponsivePiano
                  noteRange={config.noteRange}
                  activeNotes={config.activeNotes}
                  playNote={playNote}
                  stopNote={stopNote}
                  isLoading={isLoading}
                  keyboardShortcuts={keyboardShortcuts}
                  className="keyboard"
                />
              </div>
            </DimensionsProvider>
          </div>
        )}
      />
    </div>
  );
};

const ResponsivePiano = (props) => {
  const { width } = useDimensions();

  return <Piano width={width} {...props} />;
};

export default BottomPanel;
