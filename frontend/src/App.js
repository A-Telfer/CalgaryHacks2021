import React, { Profiler, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Container from './components/container/Container';
import Emojis from "./components/emojis/Emojis";

const ROLES = ["🧑‍🏫 Professor", "🧑‍🎓 Student"];

const buttonStyle = {
  padding: '5px',
  margin: '5px',
  fontSize: '32px'
};

function App() {
  const [profOrStudentSelected, setProfOrStudentSelected] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  return profOrStudentSelected ? (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '20px' }}>
        <span style={{ fontSize: '40px' }}>Zoom but better</span>
        { selectedRole == ROLES[0] ? <Emojis/> : '' }
      </div>
      <Container/>
    </div>
  ) : (
    <div style={{ 
      width: '100vw', 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <p style={{ fontSize: '40px' }}>Enter meeting as:</p>
      <div>
        {
          ROLES.map(role =>
            <button 
              style={buttonStyle} 
              onClick={e => {
                setProfOrStudentSelected(true)
                setSelectedRole(e.currentTarget.textContent)
              }}
            >{role}</button>
          )
        }
      </div>
    </div>
  ) ;
}

export default App;