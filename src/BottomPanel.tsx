import { useState, useEffect, useRef } from "react";
import { Piano, MidiNumbers, KeyboardShortcuts } from "react-piano";
import Daemon from "arduino-create-agent-js-client";
import "react-piano/dist/styles.css";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import SquidboxButton from "./SquidboxButton";
import SoundfontProvider from "./SoundfontProvider";
import { DimensionsProvider, useDimensions } from "./DimensionsProvider";
import PianoConfig from "./PianoConfig";
import InstrumentListProvider from "./InstrumentListProvider";

const chromeExtensionID = "hfejhkbipnickajaidoppbadcomekkde";
const isChromeOs = () => window.navigator.userAgent.indexOf(" CrOS ") !== -1;
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

const daemon = new Daemon(
  "https://builder.arduino.cc/v3/boards",
  chromeExtensionID,
);

const scrollToBottom = (target: HTMLElement | null) => {
  if (target) target.scrollTop = target.scrollHeight;
};

const BottomPanel = () => {
  /* Agent states */
  const [agentStatus, setAgentStatus] = useState(false);
  const [channelStatus, setChannelStatus] = useState(false);
  const [serialDevices, setSerialDevices] = useState([]);
  const [networkDevices, setNetworkDevices] = useState([]);
  const [agentInfo, setAgentInfo] = useState("");
  const [serialMonitorContent, setSerialMonitorContent] = useState("");
  const [serialPortOpen, setSerialPortOpen] = useState("");
  const [serialInput, setSerialInput] = useState("");
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [supportedBoards, setSupportedBoards] = useState([]);
  const [shouldShowAgentDebug, setShouldShowAgentDebug] = useState(false);
  const [error, setError] = useState("");

  const serialTextareaRef = useRef<HTMLTextAreaElement>(null);
  const serialInputRef = useRef<HTMLInputElement>(null);
  /* Piano states */
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

  useEffect(() => {
    const subs = [
      daemon.agentFound.subscribe((status: boolean) => {
        setAgentStatus(status);
        setAgentInfo(JSON.stringify(daemon.agentInfo, null, 2));
      }),
      daemon.channelOpen.subscribe(setChannelStatus),
      daemon.error.subscribe(showError),
      daemon.serialMonitorError.subscribe(showError),
      daemon.devicesList.subscribe(({ serial, network }) => {
        setSerialDevices(serial);
        setNetworkDevices(network);
      }),
      daemon.supportedBoards.subscribe(setSupportedBoards),
      daemon.serialMonitorMessages.subscribe((message: string) => {
        setSerialMonitorContent((prev) => {
          const updated = prev + message;
          requestAnimationFrame(() =>
            scrollToBottom(serialTextareaRef.current),
          );

          if (waitingForResponse) {
            if (message.includes("OK")) {
              toast.success("Command succeeded.");
            } else if (message.includes("ERR")) {
              toast.error("Command failed.");
            } else if (message.includes("Unrecognized command")) {
              toast.error("Unrecognized command.");
            } else {
              // Optional: default case
              toast("Received response.");
            }
            setWaitingForResponse(false);
          }

          return updated;
        });
      }),
    ];

    return () => {
      subs.forEach((sub) => sub.unsubscribe?.());
    };
  }, [waitingForResponse]);

  const requestDevicePermission = async () => {
    if ("serial" in navigator) {
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
    daemon.openSerialMonitor(port, 9600);
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
    const command = "GETCONF";
    setSerialInput(command);
    daemon.writeSerial(serialPortOpen, `${command}\n`);
    serialInputRef.current?.focus();
    setSerialInput("");
    setWaitingForResponse(true);
  };

  const handleUploadConfig = () => {
    const command = "SETCONF {}";
    setSerialInput(command);
    daemon.writeSerial(serialPortOpen, `${command}\n`);
    serialInputRef.current?.focus();
    setSerialInput("");
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
            <Button onClick={handleDownloadConfig}>Donwload Config</Button>
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
      </div>
      {/* Row 1, Column 3: Empty */}
      <div />
      {/* Row 2, Columns 1-3 merged: Piano and Config */}
      <div className="col-span-3">
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
    </div>
  );
};

const ResponsivePiano = (props) => {
  const { width } = useDimensions();

  return <Piano width={width} {...props} />;
};

export default BottomPanel;
