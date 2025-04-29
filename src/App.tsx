import TopPanel from "./TopPanel";
import BottomPanel from "./BottomPanel";

function App() {
  return (
    <div className="h-screen flex flex-col">
      <header className="bg-blue-200 text-center text-2xl border-b">
        Squidbox
      </header>
      <main className="flex-1 flex flex-col">
        <TopPanel />
        <BottomPanel />
      </main>
    </div>
  );
}

export default App;
