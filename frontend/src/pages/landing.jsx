import React from 'react'
import "../App.css"
import { Link, useNavigate } from 'react-router-dom'

export default function LandingPage() {

    const router = useNavigate();

    return (
        <div className='landingPageContainer'>
            <nav>
                <div className='navHeader'>
                    <h2>Easy Connect</h2>
                </div>
                <div className='navlist'>
                    <p onClick={() => {
                        router("/aljk23")
                    }}>Join as Guest</p>
                    <p onClick={() => {
                        router("/auth")
                    }}>Register</p>
                    <div onClick={() => {
                        router("/auth")
                    }} role='button'>
                        <p style={{ margin: 0 }}>Login</p>
                    </div>
                </div>
            </nav>

            <div className="landingMainContainer">
                <div>
                    <h1>
                        <span style={{ color: "#f5576c" }}>Connect</span> with your loved Ones
                    </h1>

                    <p>Have seamless video calls with crystal-clear quality</p>
                    <div role='button'>
                        <Link to={"/auth"}>Get Started</Link>
                    </div>
                </div>
                <div>
                    <img src="/mobile.png" alt="Mobile app preview" />
                </div>
            </div>
        </div>
    )
}
