import { BlotterApp } from './components/BlotterApp/BlotterApp';
import './App.css'; // Your layout styles go here

export default function App() {
  return (
    <div className="app-layout">
      <header className="site-header">
          <div className="site-brand">
              <span className="site-presenter">KwAsant</span>
              <span className="site-presents">presents</span>
          </div>

          <div className="site-links">
              <a
                  href="https://github.com/kwAsant/live-quote-blotter"
                  target="_blank"
                  rel="noreferrer"
              >
                  Repository
              </a>
          

              <a
                  href="https://github.com/kwAsant"
                  target="_blank"
                  rel="noreferrer"
              >
                  GitHub
              </a>

              <a
                  href="https://www.linkedin.com/in/jody-a-gyekye"
                  target="_blank"
                  rel="noreferrer"
              >
                  LinkedIn
              </a>
          </div>
      </header>
      <main>
        <BlotterApp />
      </main>
    </div>
  );
}