import React, { Profiler, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Container from './components/container/Container';
import Emojis from "./components/emojis/Emojis";
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';

const ROLES = ["🧑‍🏫 Professor", "🧑‍🎓 Student"];

const buttonStyle = {
  padding: '15px',
  margin: '10px',
  fontSize: '32px',
  borderRadius: '20px'
};

function App() {
  const [profOrStudentSelected, setProfOrStudentSelected] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  return profOrStudentSelected ? (
    
      <Container role={true}/>
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
            <Button 
              variant="outline-primary"
              style={buttonStyle} 
              onClick={e => {
                setProfOrStudentSelected(true)
                setSelectedRole(e.currentTarget.textContent)
              }}
            >{role}</Button>
          )
        }
      </div>
    </div>
  ) ;
}

export default App;