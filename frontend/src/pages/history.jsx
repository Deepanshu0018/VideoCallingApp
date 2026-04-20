import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { IconButton, Button } from '@mui/material';
import '../styles/history.module.css';

export default function History() {

    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([])
    const [copied, setCopied] = useState(null);
    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(history);
            } catch {
                // IMPLEMENT SNACKBAR
            }
        }

        fetchHistory();
    }, [getHistoryOfUser])

    let formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0")
        const year = date.getFullYear();
        return `${day}/${month}/${year}`
    }

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopied(code);
        setTimeout(() => setCopied(null), 2000);
    }

    const handleJoinMeeting = (code) => {
        routeTo(`/${code}`);
    }

    return (
        <div className="historyContainer">
            <div className="historyHeader">
                <IconButton 
                    onClick={() => routeTo("/home")} 
                    className="backButton"
                    sx={{ color: 'white' }}
                >
                    <HomeIcon />
                </IconButton>
                <h1>Meeting History</h1>
            </div>

            <div className="historyContentWrapper">
                {meetings.length !== 0 ? (
                    <div className="historyGrid">
                        {meetings.map((e, i) => (
                            <Card key={i} className="historyCard" variant="outlined">
                                <CardContent className="historyCardContent">
                                    <div className="meetingCodeSection">
                                        <Typography className="codeLabel" color="text.secondary">
                                            Meeting Code
                                        </Typography>
                                        <div className="codeContainer">
                                            <Typography className="meetingCode">
                                                {e.meetingCode}
                                            </Typography>
                                            <IconButton 
                                                size="small"
                                                onClick={() => handleCopyCode(e.meetingCode)}
                                                className="copyButton"
                                                title="Copy code"
                                            >
                                                <FileCopyIcon fontSize="small" />
                                            </IconButton>
                                        </div>
                                        {copied === e.meetingCode && (
                                            <span className="copiedText">Copied!</span>
                                        )}
                                    </div>

                                    <Typography className="dateInfo" color="text.secondary">
                                        📅 {formatDate(e.date)}
                                    </Typography>

                                    <Button 
                                        variant="contained" 
                                        className="joinButton"
                                        onClick={() => handleJoinMeeting(e.meetingCode)}
                                        fullWidth
                                    >
                                        Join Meeting
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="emptyState">
                        <Typography variant="h5" color="text.secondary">
                            No meetings yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Your meeting history will appear here
                        </Typography>
                    </div>
                )}
            </div>
        </div>
    )
}
