// See https://github.com/danigb/soundfont-player
// for more documentation on prop options.
import { useState, useEffect, useCallback } from "react";
import Soundfont, { type InstrumentName, type Player } from "soundfont-player";

const SoundfontProvider = ({
  instrumentName = "acoustic_grand_piano",
  hostname,
  format = "mp3",
  soundfont = "MusyngKite",
  audioContext,
  render,
}: {
  instrumentName: InstrumentName;
  hostname: string;
  format: "mp3" | "ogg";
  soundfont: "MusyngKite" | "FluidR3_GM";
  audioContext: AudioContext;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  render: Function;
}) => {
  const [activeAudioNodes, setActiveAudioNodes] = useState<
    Record<number, AudioBufferSourceNode | null>
  >({});
  const [instrument, setInstrument] = useState<Player | null>(null);

  const loadInstrument = useCallback(
    (name: InstrumentName) => {
      setInstrument(null); // Reset instrument while loading
      Soundfont.instrument(audioContext, name, {
        format,
        soundfont,
        nameToUrl: (name: InstrumentName, soundfont: string, format: string) =>
          `${hostname}/${soundfont}/${name}-${format}.js`,
      }).then(setInstrument);
    },
    [audioContext, format, soundfont, hostname],
  );

  useEffect(() => {
    loadInstrument(instrumentName);
  }, [instrumentName, loadInstrument]);

  const playNote = useCallback(
    (midiNumber: number) => {
      audioContext.resume().then(() => {
        if (instrument) {
          const audioNode = instrument.play(midiNumber.toString());
          setActiveAudioNodes((prev) => ({
            ...prev,
            [midiNumber.toString()]: audioNode,
          }));
        }
      });
    },
    [audioContext, instrument],
  );

  const stopNote = useCallback(
    (midiNumber: number) => {
      audioContext.resume().then(() => {
        setActiveAudioNodes((prev) => {
          const audioNode = prev[midiNumber];
          if (audioNode) {
            audioNode.stop();
          }
          return { ...prev, [midiNumber]: null };
        });
      });
    },
    [audioContext],
  );

  const stopAllNotes = useCallback(() => {
    audioContext.resume().then(() => {
      Object.values(activeAudioNodes).forEach((node) => {
        if (node) {
          node.stop();
        }
      });
      setActiveAudioNodes({});
    });
  }, [audioContext, activeAudioNodes]);

  return render({
    isLoading: !instrument,
    playNote,
    stopNote,
    stopAllNotes,
  });
};

export default SoundfontProvider;
