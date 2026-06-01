import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Games from "./pages/Games";
import Login from "./pages/Login";
import GameList from "./pages/GameList";

function App() {
    return (
        <BrowserRouter>

            <Navbar />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/games" element={<GameList />} />
                <Route path="/login" element={<Login />} />
            </Routes>

        </BrowserRouter>
    );
}

export default App;