import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import "../App.css";
import { Button, IconButton, TextField, Card, CardContent, Typography, Box } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import LogoutIcon from '@mui/icons-material/Logout';
import { AuthContext } from '../contexts/AuthContext';

function HomeComponent() {

    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const { addToUserHistory } = useContext(AuthContext);

    let handleJoinVideoCall = async () => {
        if (meetingCode.trim()) {
            await addToUserHistory(meetingCode)
            navigate(`/${meetingCode}`)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleJoinVideoCall();
        }
    }

    return (
        <>
            <div className="navBar">
                <div style={{ display: "flex", alignItems: "center" }}>
                    <h2>Easy Connect</h2>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <IconButton 
                        onClick={() => navigate("/history")}
                        title="View meeting history"
                        sx={{ color: 'white' }}
                    >
                        <RestoreIcon />
                    </IconButton>
                    <Typography sx={{ color: 'white', fontWeight: 500 }}>History</Typography>

                    <Button 
                        onClick={() => {
                            localStorage.removeItem("token")
                            navigate("/auth")
                        }}
                        startIcon={<LogoutIcon />}
                        sx={{
                            ml: 1,
                            background: 'rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            '&:hover': {
                                background: 'rgba(255, 255, 255, 0.3)',
                            }
                        }}
                    >
                        Logout
                    </Button>
                </div>
            </div>

            <div className="meetContainer">
                <div className="leftPanel">
                    <Card sx={{
                        width: '100%',
                        maxWidth: 500,
                        borderRadius: 3,
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                    }}>
                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#333' }}>
                                Start or Join Meeting
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
                                Enter a meeting code to join an existing meeting
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 1.5, flexDirection: 'column' }}>
                                <TextField 
                                    onChange={e => setMeetingCode(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    fullWidth
                                    label="Meeting Code" 
                                    variant="outlined"
                                    placeholder="e.g., abc123xyz"
                                    value={meetingCode}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                        }
                                    }}
                                />
                                <Button 
                                    onClick={handleJoinVideoCall}
                                    variant='contained'
                                    fullWidth
                                    size="large"
                                    sx={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        fontWeight: 600,
                                        py: 1.5,
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
                                        }
                                    }}
                                >
                                    Join Meeting
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </div>

                <div className='rightPanel'>
                    <img srcSet='/logo3.png' alt="Video call illustration" />
                </div>
            </div>
        </>
    )
}

export default withAuth(HomeComponent)