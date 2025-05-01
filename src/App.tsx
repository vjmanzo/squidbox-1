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
    setSquidBoxConfig((prevConfig) => {
      const newConfig = { ...prevConfig, presets };
      // Ensure activePresetIndex is valid
      if (activePresetIndex >= presets.length) {
        setActivePresetIndex(Math.max(0, presets.length - 1));
      }
      return newConfig;
    });
  };

  const handleSelectPreset = (index: number) => {
    if (index < 0 || index >= squidboxConfig.presets.length) {
      return;
    }

    setActivePresetIndex(index);
  };

  const handleDeletePreset = (index: number) => {
    if (0 > index || index >= squidboxConfig.presets.length) {
      return;
    }

    setSquidBoxConfig((prevConfig) => {
      const updatedPresets = prevConfig.presets.filter((_, i) => i !== index);
      // Adjust activePresetIndex if necessary
      if (activePresetIndex >= updatedPresets.length) {
        setActivePresetIndex(Math.max(0, updatedPresets.length - 1));
      } else if (activePresetIndex === index) {
        setActivePresetIndex(0);
      }
      return { ...prevConfig, presets: updatedPresets };
    });
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
