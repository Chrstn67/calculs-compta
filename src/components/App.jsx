import Table from "./Table";

import "../styles/App.css";

export default function App() {
  return (
    <main className="home">
      <div className="container">
        <div className="header">
          <h1>Comptabilité</h1>
        </div>
        <Table />
      </div>
    </main>
  );
}
