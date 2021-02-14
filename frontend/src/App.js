import React from 'react';
import logo from './logo.svg';
import './App.css';
import Header from "./components/header/Header";
import Container from './components/container/Container';
import Emojis from "./components/emojis/Emojis";

function App() {
  return (
      <div>
        <Header/>
        <Emojis/>
        <Container/>
      </div>
  );
}

export default App;