// See https://github.com/danigb/soundfont-player
// for more documentation on prop options.
import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import Soundfont from "soundfont-player";

const SoundfontProvider = ({
  instrumentName = "acoustic_grand_piano",
  hostname,
  format = "mp3",
  soundfont = "MusyngKite",
  audioContext,
  render,
}) => {
  const [activeAudioNodes, setActiveAudioNodes] = useState({});
  const [instrument, setInstrument] = useState(null);

  const loadInstrument = useCallback(
    (name) => {
      setInstrument(null); // Reset instrument while loading
      Soundfont.instrument(audioContext, name, {
        format,
        soundfont,
        nameToUrl: (name, soundfont, format) =>
          `${hostname}/${soundfont}/${name}-${format}.js`,
      }).then(setInstrument);
    },
    [audioContext, format, soundfont, hostname],
  );

  useEffect(() => {
    loadInstrument(instrumentName);
  }, [instrumentName, loadInstrument]);

  const playNote = useCallback(
    (midiNumber) => {
      audioContext.resume().then(() => {
        if (instrument) {
          const audioNode = instrument.play(midiNumber);
          setActiveAudioNodes((prev) => ({
            ...prev,
            [midiNumber]: audioNode,
          }));
        }
      });
    },
    [audioContext, instrument],
  );

  const stopNote = useCallback(
    (midiNumber) => {
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

SoundfontProvider.propTypes = {
  instrumentName: PropTypes.string.isRequired,
  hostname: PropTypes.string.isRequired,
  format: PropTypes.oneOf(["mp3", "ogg"]),
  soundfont: PropTypes.oneOf(["MusyngKite", "FluidR3_GM"]),
  audioContext: PropTypes.instanceOf(window.AudioContext),
  render: PropTypes.func,
};

export default SoundfontProvider;
