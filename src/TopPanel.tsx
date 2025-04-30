import { useState } from "react";
import { type Preset, TEMPLATE_PRESETS } from "./Preset";
import { Button } from "@/components/ui/button";

const getNoteName = (noteNumber: number): string => {
  const notes = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];
  const octave = Math.floor(noteNumber / 12) - 1;
  const noteName = notes[noteNumber % 12];
  return `${noteName}${octave}`;
};

const TopPanel = ({
  presets,
  activePresetIndex,
  onSelectPreset,
  onAddPreset,
  onDeletePreset,
}: {
  presets: Preset[];
  activePresetIndex: number;
  onSelectPreset: (index: number) => void;
  onAddPreset: (preset: Preset) => void;
  onDeletePreset: (index: number) => void;
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);

  return (
    <div className="text-center flex flex-row items-start border-y-3 border-black overflow-x-auto">
      <div className="flex flex-row items-start flex-nowrap min-w-full">
        {presets.map((preset, index) => (
          <div
            key={index}
            className="bg-amber-200 text-xl h-[35vh] min-w-[25vw] flex-shrink-0 flex flex-col gap-2 justify-between p-4 border border-gray-300 mr-4"
          >
            <div className="flex-1 overflow-y-auto">
              <h2 className="font-bold">{preset.name}</h2>
              <p className="text-sm text-gray-700">{preset.description}</p>
              <ul className="mt-2">
                {preset.notes.map((note, idx) => (
                  <li key={idx} className="text-xs text-gray-600">
                    {note.map((n) => getNoteName(n)).join(", ")}
                  </li>
                ))}
              </ul>
            </div>
            {presets.length > 1 && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDeletePreset(index)}
              >
                Delete
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => onSelectPreset(index)}
              variant={index === activePresetIndex ? "secondary" : "ghost"}
            >
              {index === activePresetIndex ? "Selected" : "Select"}
            </Button>
          </div>
        ))}
        <div className="flex justify-center items-center bg-gray-100 h-[35vh] min-w-[25vw] max-w-[25vw] flex-shrink-0">
          {showAddMenu ? (
            <div className="flex flex-col items-center gap-2 p-2 w-full h-full">
              <h3 className="font-bold">Add Preset</h3>
              <div className="overflow-y-auto max-h-[25vh] w-full">
                {TEMPLATE_PRESETS.map((preset, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full text-sm mb-1"
                    onClick={() => {
                      onAddPreset(preset);
                      setShowAddMenu(false);
                    }}
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
              <Button
                variant="ghost"
                className="w-full mt-2"
                onClick={() => setShowAddMenu(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              className="h-full w-full text-4xl"
              onClick={() => setShowAddMenu(true)}
            >
              +
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopPanel;
