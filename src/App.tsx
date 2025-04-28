import "./App.css";
import AgentDemo from "./AgentDemo";
import TopPanel from "./TopPanel";
import BottomPanel from "./BottomPanel";
import { Button } from "@/components/ui/button";

const shouldShowAgentDemo = false;

function App() {
  return (
    <div className="App">
      <header className="App-header">Squidbox</header>
      <main className="App-main">
        <TopPanel />
        <BottomPanel />
      </main>
      {shouldShowAgentDemo && <AgentDemo />}
      <div className="flex flex-col items-center justify-center min-h-svh">
        <Button>Click me</Button>
      </div>
    </div>
  );
}

export default App;
