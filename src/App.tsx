import { useState } from "react";
import { useQueryState, parseAsJson } from "nuqs";
import { Toaster } from "@/components/ui/sonner";
import TopPanel from "./TopPanel";
import BottomPanel from "./BottomPanel";
import {
  DEFAULT_CONFIG,
  type Preset,
  SquidboxConfigSchema,
} from "./squidboxConfig";

function App() {
  const [squidboxConfig, setSquidBoxConfig] = useQueryState(
    "config",
    parseAsJson(SquidboxConfigSchema.parse).withDefault(DEFAULT_CONFIG),
  );
  const [activePresetIndex, setActivePresetIndex] = useState(0);

  const setPresets = (presets: Preset[]) => {
    setSquidBoxConfig((prevConfig) => ({
      ...prevConfig,
      presets,
    }));
  };

  const handleSelectPreset = (index: number) => {
    setActivePresetIndex(index);
  };

  const handleDeletePreset = (index: number) => {
    setSquidBoxConfig((prevConfig) => ({
      ...prevConfig,
      presets: prevConfig.presets.filter((_, i) => i !== index),
    }));
    if (activePresetIndex === index) {
      setActivePresetIndex(0);
    }
  };

  const handleAddPreset = (preset: Preset) => {
    setSquidBoxConfig((prevConfig) => ({
      ...prevConfig,
      presets: [...prevConfig.presets, preset],
    }));
  };

  const presets = squidboxConfig.presets;

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
          squidboxConfig={squidboxConfig}
          setPresets={setPresets}
          activePresetIndex={activePresetIndex}
        />
        <Toaster />
      </main>
    </div>
  );
}

export default App;
