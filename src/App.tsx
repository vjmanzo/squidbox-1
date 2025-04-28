import "./App.css";
import AgentDemo from "./AgentDemo";
import TopPanel from "./TopPanel";
import BottomPanel from "./BottomPanel";

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
    </div>
  );
}

export default App;
