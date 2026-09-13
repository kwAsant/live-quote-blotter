import { BlotterApp } from './components/BlotterApp/BlotterApp';
import './App.css'; // Your layout styles go here

export default function App() {
  return (
    <div className="app-layout">
      <header className="app-header">
        <h2>FX Option Live Quote Blotter</h2>
      </header>
      <main>
        <BlotterApp />
      </main>
    </div>
  );
}