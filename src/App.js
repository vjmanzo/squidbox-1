import "./App.css";
import AgentDemo from "./AgentDemo";
import TopPanel from "./TopPanel";
import BottomPanel from "./BottomPanel";

function App() {
  return (
    <div className="App">
      <header className="App-header">Squidbox</header>
      <main className="App-main">
        <TopPanel />
        <BottomPanel />
      </main>
      {false && <AgentDemo />}
    </div>
  );
}

export default App;
