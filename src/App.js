import React from 'react'
import logo from './logo.svg'
import './App.less'

import { Button } from 'antd'

function App() {
  console.log(123)
  return (
    <div className="App">
      <Button type="primary">12测12121112试</Button>
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer">
          Learn React
        </a>
      </header>
    </div>
  )
}

export default App
