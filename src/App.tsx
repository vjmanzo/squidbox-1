import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import TopPanel from "./TopPanel";
import BottomPanel from "./BottomPanel";
import { type Preset } from "./Preset";

function App() {
  const [presets, setPresets] = useState<Preset[]>([
    {
      name: "Major Triads",
      description: "Standard major triads",
      notes: [
        [60, 64, 67], // C4, E4, G4
        [62, 65, 69], // D4, F4, A4
        [64, 67, 71], // E4, G4, B4
        [65, 69, 72], // F4, A4, C5
        [67, 71, 74], // G4, B4, D5
        [69, 72, 76], // A4, C5, E5
        [71, 74, 77], // B4, D5, F5
        [72, 76, 79], // C5, E5, G5
      ],
    },
    {
      name: "Minor Triads",
      description: "Standard minor triads",
      notes: [
        [60, 63, 67], // C4, D#4, G4
        [62, 65, 68], // D4, F4, G#4
        [64, 67, 70], // E4, G4, A#4
        [65, 68, 72], // F4, G#4, C5
        [67, 70, 74], // G4, A#4, D5
        [69, 72, 75], // A4, C5, D#5
        [71, 74, 77], // B4, D5, F5
        [72, 75, 79], // C5, D#5, G5
      ],
    },
  ]);
  const [activePresetIndex, setActivePresetIndex] = useState(0);

  const handleSelectPreset = (index: number) => {
    setActivePresetIndex(index);
  };

  const handleDeletePreset = (index: number) => {
    setPresets((prevPresets) => prevPresets.filter((_, i) => i !== index));
    if (activePresetIndex === index) {
      setActivePresetIndex(0);
    }
  };

  const handleAddPreset = (preset: Preset) => {
    setPresets((prevPresets) => [...prevPresets, preset]);
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-blue-200 text-center text-2xl border-b">
        Squidbox
      </header>
      <main className="flex-1 flex flex-col">
        <TopPanel
          presets={presets}
          activePresetIndex={activePresetIndex}
          onSelectPreset={handleSelectPreset}
          onAddPreset={handleAddPreset}
          onDeletePreset={handleDeletePreset}
        />
        <BottomPanel buttonMappings={presets[activePresetIndex].notes} />
        <Toaster />
      </main>
    </div>
  );
}

export default App;
