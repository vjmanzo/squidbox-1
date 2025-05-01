import { useState, useEffect, useRef } from "react";
import { Piano, KeyboardShortcuts } from "react-piano";
import "react-piano/dist/styles.css";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import SquidboxButton from "./SquidboxButton";
import SoundfontProvider from "./SoundfontProvider";
import DimensionsProvider from "./DimensionsProvider";
import { useDimensions } from "./useDimensions";
import PianoConfig, {
  type PianoConfig as PianoConfigType,
} from "./PianoConfig";
import InstrumentListProvider from "./InstrumentListProvider";
import {
  getButtonColorFromIndex,
  Preset,
  SquidboxConfig,
} from "./squidboxConfig";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import { InstrumentName } from "soundfont-player";
import Daemon, {
  NetworkDevice,
  SerialDevice,
} from "arduino-create-agent-js-client";

const chromeExtensionID = "hfejhkbipnickajaidoppbadcomekkde";
const isChromeOs = () => window.navigator.userAgent.indexOf(" CrOS ") !== -1;
const soundfontHostname = "https://d1pzp51pvbm36p.cloudfront.net";

// @ts-expect-error arudino-create-agent-js-client does not have types
const daemon = new Daemon(
  "https://builder.arduino.cc/v3/boards",
  chromeExtensionID,
);

const scrollToBottom = (target: HTMLElement | null) => {
  if (target) target.scrollTop = target.scrollHeight;
};

const BottomPanel = ({
  squidboxConfig,
  setPresets,
  activePresetIndex,
}: {
  squidboxConfig: SquidboxConfig;
  setPresets: (presets: Preset[]) => void;
  activePresetIndex: number;
}) => {
  const presets = squidboxConfig.presets;
  const buttonMappings = presets[activePresetIndex].notes;

  const responseBufferRef = useRef("");
  const responseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /* Agent states */
  const [agentStatus, setAgentStatus] = useState(false);
  const [channelStatus, setChannelStatus] = useState(false);
  const [serialDevices, setSerialDevices] = useState<SerialDevice[]>([]);
  const [networkDevices, setNetworkDevices] = useState<NetworkDevice[]>([]);
  const [agentInfo, setAgentInfo] = useState("");
  const [serialMonitorContent, setSerialMonitorContent] = useState("");
  const [serialPortOpen, setSerialPortOpen] = useState<string | null>("");
  const [serialInput, setSerialInput] = useState("");
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  // const [supportedBoards, setSupportedBoards] = useState([]);
  const [shouldShowAgentDebug, setShouldShowAgentDebug] = useState(false);
  const [error, setError] = useState("");

  const serialTextareaRef = useRef<HTMLTextAreaElement>(null);
  const serialInputRef = useRef<HTMLInputElement>(null);
  /* Piano states */
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [pianoConfig, setPianoConfig] = useState<
    PianoConfigType & {
      activeNotes: number[];
    }
  >({
    instrumentName: "acoustic_grand_piano",
    noteRange: {
      first: 60, // c4
      last: 89, // f6
    },
    keyboardShortcutOffset: 0,
    activeNotes: [],
  });

  const keyboardShortcuts = KeyboardShortcuts.create({
    firstNote: pianoConfig.noteRange.first + pianoConfig.keyboardShortcutOffset,
    lastNote: pianoConfig.noteRange.last + pianoConfig.keyboardShortcutOffset,
    keyboardConfig: KeyboardShortcuts.HOME_ROW,
  });

  const onSquidboxButtonPress = (index: number) => {
    const notes = buttonMappings[index];
    setPianoConfig((prevConfig) => ({
      ...prevConfig,
      activeNotes: notes,
    }));
  };

  const onSquidboxButtonRelease = () => {
    setPianoConfig((prevConfig) => ({
      ...prevConfig,
      activeNotes: [],
    }));
  };

  useEffect(() => {
    if (!audioContext) {
      const AudioContextClass =
        // @ts-expect-error webkitAudioContext fallback needed to support Safari
        window.AudioContext || window.webkitAudioContext;
      setAudioContext(new AudioContextClass());
    }

    return () => {
      if (audioContext && audioContext.state !== "closed") {
        audioContext.close();
      }
    };
  }, [audioContext]);

  useEffect(() => {
    const subs = [
      daemon.agentFound.subscribe((status: boolean) => {
        setAgentStatus(status);
        setAgentInfo(JSON.stringify(daemon.agentInfo, null, 2));
      }),
      daemon.channelOpen.subscribe(setChannelStatus),
      daemon.error.subscribe(showError),
      daemon.serialMonitorError.subscribe(showError),
      daemon.devicesList.subscribe(
        ({
          serial,
          network,
        }: {
          serial: SerialDevice[];
          network: NetworkDevice[];
        }) => {
          setSerialDevices(serial);
          setNetworkDevices(network);
        },
      ),
      // daemon.supportedBoards.subscribe(setSupportedBoards),
      daemon.serialMonitorMessages.subscribe((message: string) => {
        setSerialMonitorContent((prev) => {
          const updated = prev + message;
          requestAnimationFrame(() =>
            scrollToBottom(serialTextareaRef.current),
          );
          return updated;
        });

        if (!waitingForResponse) return;

        // Accumulate response
        responseBufferRef.current += message;
        const full = responseBufferRef.current.trim();

        if (full.startsWith("OK {")) {
          try {
            const jsonString = full.slice(3).trim();
            const json = JSON.parse(jsonString);
            const newPresets = json.presets.map((preset: Preset) => ({
              name: preset.name,
              description: preset.description,
              notes: preset.notes,
            }));
            setPresets(newPresets);
            setPianoConfig((prevConfig) => ({
              ...prevConfig,
              activeNotes: [],
            }));
            toast.success("Config downloaded.");
          } catch {
            // Still incomplete, wait
            return;
          }
          // Cleanup on success
          responseBufferRef.current = "";
          if (responseTimeoutRef.current) {
            clearTimeout(responseTimeoutRef.current);
            responseTimeoutRef.current = null;
          }
          setWaitingForResponse(false);
        } else if (
          full.includes("OK") ||
          full.includes("ERR") ||
          full.includes("Unrecognized command")
        ) {
          toast(
            full.includes("ERR")
              ? "Command failed: " + full.slice(3).trim()
              : full.includes("Unrecognized")
                ? "Unrecognized command."
                : "Command succeeded.",
          );
          responseBufferRef.current = "";
          if (responseTimeoutRef.current) {
            clearTimeout(responseTimeoutRef.current);
            responseTimeoutRef.current = null;
          }
          setWaitingForResponse(false);
        }
      }),
    ];

    return () => {
      subs.forEach((sub) => sub.unsubscribe?.());
    };
  }, [waitingForResponse, setPresets]);

  const requestDevicePermission = async () => {
    if ("serial" in navigator) {
      // @ts-expect-error serial is not defined
      const port = await navigator.serial.requestPort([
        { usbVendorId: 0x2341 },
      ]);
      daemon.devicesList.next({ serial: [port], network: [] });
    }
  };

  const showError = (err: string) => {
    setError(err);
    scrollToBottom(document.body);
  };

  const handleOpen = (e: React.MouseEvent, port: string) => {
    e.preventDefault();
    setSerialMonitorContent("");
    daemon.openSerialMonitor(port, 115200);
    setSerialPortOpen(port);
  };

  const handleClose = (e: React.MouseEvent, port: string) => {
    e.preventDefault();
    daemon.closeSerialMonitor(port);
    setSerialPortOpen(null);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    daemon.writeSerial(serialPortOpen, `${serialInput}\n`);
    serialInputRef.current?.focus();
    setSerialInput("");
    setWaitingForResponse(true);
  };

  const handleDownloadConfig = () => {
    if (
      !confirm(
        "This will replace the current config in the browser. Do you want to continue?",
      )
    ) {
      return;
    }
    const command = "GETCONF";
    daemon.writeSerial(serialPortOpen, `${command}\n`);
    setWaitingForResponse(true);
    responseBufferRef.current = "";
    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current);
    }
    // Start timeout
    responseTimeoutRef.current = setTimeout(() => {
      toast.error("Timed out downloading config.");
      responseBufferRef.current = "";
      setWaitingForResponse(false);
    }, 1000);
  };

  const handleUploadConfig = () => {
    if (
      !confirm(
        "This will replace the current config on the Squidbox. Do you want to continue?",
      )
    ) {
      return;
    }
    const configString = JSON.stringify(squidboxConfig);
    const commandWithConfig = `SETCONF|${configString}`;
    daemon.writeSerial(serialPortOpen, `${commandWithConfig}\n`);
    setWaitingForResponse(true);
  };

  if (!audioContext) {
    return <div>Click to initialize piano</div>;
  }

  return (
    <div className="m-4 grid grid-cols-3 grid-rows-[auto_1fr] gap-8">
      {/* Row 1, Column 1: Connect UI */}
      <div className="flex flex-col items-center text-center gap-4">
        {shouldShowAgentDebug && (
          <div>
            <p>
              Agent status:{" "}
              <span className={agentStatus ? "found" : "not-found"}>
                {agentStatus ? "Found" : "Not found"}
              </span>
            </p>
            <p>
              Channel status:{" "}
              <span className={channelStatus ? "found" : "not-found"}>
                {channelStatus ? "Connected" : "Not connected"}
              </span>
            </p>
            <pre>{agentInfo}</pre>
          </div>
        )}
        {isChromeOs() && (
          <Button onClick={requestDevicePermission}>
            Request Serial Port Access
          </Button>
        )}
        <div className="mb-4">
          <h3 className="text-md font-medium">Connected Devices</h3>
          <ul className="space-y-2">
            {serialDevices.length === 0 && networkDevices.length === 0 && (
              <li className="text-red-500 text-sm">
                No devices connected. Please connect a board or refresh the
                page.
              </li>
            )}
            {serialDevices.map((device, i) => (
              <li
                key={i}
                className="flex items-center justify-between p-2 border rounded-md"
              >
                <span>
                  {device.Name} -{" "}
                  <span
                    className={`font-semibold ${
                      device.IsOpen ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {device.IsOpen ? "Open" : "Closed"}
                  </span>
                </span>
                <div className="flex gap-2 m-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => handleOpen(e, device.Name)}
                  >
                    Open
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => handleClose(e, device.Name)}
                  >
                    Close
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <ul className="space-y-2">
            {networkDevices.map((device, i) => (
              <li key={i} className="p-2 border rounded-md">
                {device.Name}
              </li>
            ))}
          </ul>
        </div>

        {/* only show when serial port is open */}
        {serialPortOpen && (
          <div className="flex gap-2 items-center">
            <Button onClick={handleDownloadConfig}>Download Config</Button>
            <Button onClick={handleUploadConfig}>Upload Config</Button>
          </div>
        )}

        {shouldShowAgentDebug && (
          <div>
            <h2>Serial Monitor</h2>
            <form onSubmit={handleSend}>
              <input
                aria-label="serial input"
                id="serial-input"
                value={serialInput}
                ref={serialInputRef}
                onChange={(e) => setSerialInput(e.target.value)}
              />
              <input type="submit" value="Send" />
            </form>
            <textarea
              aria-label="Serial Monitor output"
              id="serial-textarea"
              ref={serialTextareaRef}
              value={serialMonitorContent}
              readOnly
            />
          </div>
        )}

        <div className="flex gap-2 items-center">
          <Toggle
            aria-label="Toggle Agent Debug"
            onClick={() => setShouldShowAgentDebug((prev) => !prev)}
          >
            {shouldShowAgentDebug ? "Hide Debug" : "Show Debug"}
          </Toggle>
          {error ? (
            <p className="text-red-500">Error: {error}</p>
          ) : (
            <p className="text-green-500">No errors</p>
          )}
        </div>
      </div>
      {/* Row 1, Column 2: Squidbox Buttons */}
      <div className="flex flex-col items-center justify-center">
        <div className="flex gap-2">
          {buttonMappings.map((_, index) => {
            return (
              <SquidboxButton
                key={index}
                color={getButtonColorFromIndex(index)}
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
      </div>
      {/* Row 1, Column 3: Config Actions */}
      <div className="flex flex-col items-center justify-center gap-4">
        <h3 className="text-md font-medium">Config Tools</h3>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => {
              const blob = new Blob([JSON.stringify(squidboxConfig, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = "squidbox-config.json";
              link.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export Config
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline">Share Config</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={async () => {
                  try {
                    const shareData = {
                      title: "Squidbox Config",
                      text: "Here's a config for Squidbox!",
                      files: [
                        new File(
                          [JSON.stringify(squidboxConfig, null, 2)],
                          "squidbox-config.json",
                          { type: "application/json" },
                        ),
                      ],
                    };

                    if (navigator.canShare && navigator.canShare(shareData)) {
                      await navigator.share(shareData);
                    } else {
                      toast.error("Sharing not supported on this device.");
                    }
                  } catch (e) {
                    toast.error("Failed to share config: " + e);
                  }
                }}
              >
                JSON
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  try {
                    const shareData = {
                      title: "Squidbox Config",
                      text: "Here's a config for Squidbox!",
                      url: window.location.href,
                    };
                    if (navigator.canShare && navigator.canShare(shareData)) {
                      await navigator.share(shareData);
                    } else {
                      toast.error("Sharing not supported on this device.");
                    }
                  } catch (e) {
                    toast.error("Failed to share config: " + e);
                  }
                }}
              >
                URL
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* Row 2, Columns 1-3 merged: Piano and Config */}
      <div className="col-span-3">
        <SoundfontProvider
          instrumentName={pianoConfig.instrumentName}
          hostname={soundfontHostname}
          format="mp3"
          soundfont="MusyngKite"
          audioContext={audioContext}
          render={({
            isLoading,
            playNote,
            stopNote,
            stopAllNotes,
          }: {
            isLoading: boolean;
            playNote: (midiNumber: number) => void;
            stopNote: (midiNumber: number) => void;
            stopAllNotes: () => void;
          }) => (
            <div className="flex flex-col items-center">
              <InstrumentListProvider
                hostname={soundfontHostname}
                soundfont="MusyngKite"
                render={(instrumentList: InstrumentName[] | null) => (
                  <PianoConfig
                    config={pianoConfig}
                    setPianoConfig={(config) => {
                      setPianoConfig((prevConfig) => ({
                        ...prevConfig,
                        ...config,
                      }));
                      stopAllNotes();
                    }}
                    instrumentList={
                      instrumentList || [pianoConfig.instrumentName]
                    }
                    keyboardShortcuts={keyboardShortcuts}
                  />
                )}
              />
              <DimensionsProvider>
                <div>
                  <ResponsivePiano
                    noteRange={pianoConfig.noteRange}
                    activeNotes={pianoConfig.activeNotes}
                    playNote={playNote}
                    stopNote={stopNote}
                    isLoading={isLoading}
                    keyboardShortcuts={keyboardShortcuts}
                  />
                </div>
              </DimensionsProvider>
            </div>
          )}
        />
      </div>
    </div>
  );
};

const ResponsivePiano = (props: {
  noteRange: { first: number; last: number };
  activeNotes: number[];
  playNote: (midiNumber: number) => void;
  stopNote: (midiNumber: number) => void;
  isLoading: boolean;
  // @ts-expect-error react-piano does not have types for this
  keyboardShortcuts: KeyboardShortcuts;
}) => {
  const { width } = useDimensions();

  return <Piano width={width} {...props} />;
};

export default BottomPanel;
