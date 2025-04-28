import { useEffect, useState, useRef } from "react";
import Daemon from "arduino-create-agent-js-client";

const chromeExtensionID = "hfejhkbipnickajaidoppbadcomekkde";
const isChromeOs = () => window.navigator.userAgent.indexOf(" CrOS ") !== -1;

const scrollToBottom = (target: HTMLElement | null) => {
  if (target) target.scrollTop = target.scrollHeight;
};

const daemon = new Daemon(
  "https://builder.arduino.cc/v3/boards",
  chromeExtensionID,
);

const AgentDemo = () => {
  const [agentStatus, setAgentStatus] = useState(false);
  const [channelStatus, setChannelStatus] = useState(false);
  const [serialDevices, setSerialDevices] = useState([]);
  const [networkDevices, setNetworkDevices] = useState([]);
  const [agentInfo, setAgentInfo] = useState("");
  const [serialMonitorContent, setSerialMonitorContent] = useState("");
  const [serialPortOpen, setSerialPortOpen] = useState("");
  const [serialInput, setSerialInput] = useState("");
  const [supportedBoards, setSupportedBoards] = useState([]);
  const [error, setError] = useState("");

  const serialTextareaRef = useRef<HTMLTextAreaElement>(null);
  const serialInputRef = useRef<HTMLInputElement>(null);

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
          return updated;
        });
      }),
    ];

    return () => {
      subs.forEach((sub) => sub.unsubscribe?.());
    };
  }, []);

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
  };

  return (
    <div>
      <h1>Arduino Create Plugin Client Demo</h1>

      <div className="section">
        <h2>Plugin info</h2>
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

      <div className="section">
        <div>
          <h2 style={{ display: "inline-block", marginRight: 10 }}>
            Connected Devices{" "}
          </h2>
          {isChromeOs() && (
            <button onClick={requestDevicePermission}>
              Request access to serial port
            </button>
          )}
        </div>
        <strong>serial:</strong>
        <ul>
          {serialDevices.map((device, i) => (
            <li key={i}>
              {device.Name} - IsOpen:{" "}
              <span className={device.IsOpen ? "open" : "closed"}>
                {device.IsOpen ? "true" : "false"}
              </span>{" "}
              -{" "}
              <button onClick={(e) => handleOpen(e, device.Name)}>open</button>{" "}
              -{" "}
              <button onClick={(e) => handleClose(e, device.Name)}>
                close
              </button>
            </li>
          ))}
        </ul>
        <strong>network:</strong>
        <ul>
          {networkDevices.map((device, i) => (
            <li key={i}>{device.Name}</li>
          ))}
        </ul>
        <p id="error"></p>
      </div>

      {supportedBoards.length > 0 && (
        <div className="section">
          <h2>Supported boards</h2>
          <ul>
            {supportedBoards.map((board, i) => (
              <li key={i}>{board}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="serial-monitor section">
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

      <div className="section">
        <h2>Errors</h2>
        <div className="error">{error}</div>
      </div>
    </div>
  );
};

export default AgentDemo;
