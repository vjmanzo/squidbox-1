import "./App.css";
import AgentDemo from "./AgentDemo";
import TopPanel from "./TopPanel";
import BottomPanel from "./BottomPanel";

function App() {
  return (
    <div className="App">
      <header className="App-header">Squidbox</header>

      <TopPanel />

      <BottomPanel />

      {false && <AgentDemo />}
    </div>
  );
}

export default App;
