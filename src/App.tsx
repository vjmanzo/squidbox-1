import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import TopPanel from "./TopPanel";
import BottomPanel from "./BottomPanel";
import { DEFAULT_PRESETS, type Preset } from "./Preset";

function App() {
  const [presets, setPresets] = useState<Preset[]>(DEFAULT_PRESETS);
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
        <BottomPanel
          presets={presets}
          setPresets={setPresets}
          activePresetIndex={activePresetIndex}
        />
        <Toaster />
      </main>
    </div>
  );
}

export default App;
