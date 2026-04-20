import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar, Alert, Typography } from '@mui/material';

const defaultTheme = createTheme({
    palette: {
        primary: {
            main: '#667eea',
        },
        secondary: {
            main: '#764ba2',
        },
    },
    typography: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    },
});

export default function Authentication() {

    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [name, setName] = React.useState("");

    const [error, setError] = React.useState("");
    const [message, setMessage] = React.useState("");

    const [formState, setFormState] = React.useState(0);

    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    const handleAuth = async () => {

        setError("");

        // Validate form fields
        if (!username.trim()) {
            setError("Username is required");
            return;
        }

        if (!password.trim()) {
            setError("Password is required");
            return;
        }

        if (formState === 1 && !name.trim()) {
            setError("Name is required for registration");
            return;
        }

        setLoading(true);

        try {

            if (formState === 0) {

                const result = await handleLogin(username, password);

                if (result?.data?.message) {
                    setMessage(result.data.message);
                    setOpen(true);
                }

            }

            if (formState === 1) {

                const result = await handleRegister(name, username, password);

                setMessage(result?.data?.message || "Registration successful");

                setOpen(true);

                setUsername("");
                setPassword("");
                setName("");

                setFormState(0);

            }

        } catch (err) {

            console.error(err);

            const errorMessage =
                err?.response?.data?.message ||
                err?.message ||
                "Something went wrong";

            setError(errorMessage);

        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <Grid container component="main" sx={{ height: '100vh' }}>

                <CssBaseline />

                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={7}
                    sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            width: '400px',
                            height: '400px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '50%',
                            top: '-100px',
                            right: '-100px',
                        },
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            width: '300px',
                            height: '300px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '50%',
                            bottom: '-100px',
                            left: '-100px',
                        },
                    }}
                >
                    <Box sx={{ color: 'white', textAlign: 'center', zIndex: 1 }}>
                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, letterSpacing: -1 }}>
                            Easy Connect
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                            Connect with loved ones seamlessly
                        </Typography>
                    </Box>
                </Grid>

                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={0}>

                    <Box
                        sx={{
                            my: 8,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            background: '#fff',
                        }}
                    >

                        <Avatar sx={{
                            m: 1,
                            bgcolor: '#667eea',
                            width: 56,
                            height: 56,
                            fontSize: '1.5rem',
                        }}>
                            <LockOutlinedIcon />
                        </Avatar>

                        <Typography component="h1" variant="h5" sx={{ fontWeight: 700, mb: 2, mt: 1 }}>
                            {formState === 0 ? "Welcome Back" : "Create Account"}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>

                            <Button
                                variant={formState === 0 ? "contained" : "outlined"}
                                onClick={() => setFormState(0)}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                }}
                            >
                                Sign In
                            </Button>

                            <Button
                                variant={formState === 1 ? "contained" : "outlined"}
                                onClick={() => setFormState(1)}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                }}
                            >
                                Sign Up
                            </Button>

                        </Box>

                        <Box component="form" noValidate sx={{ mt: 2, width: '100%' }}>

                            {formState === 1 && (
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    label="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                        }
                                    }}
                                />
                            )}

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !loading && handleAuth()}
                                disabled={loading}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    }
                                }}
                            />

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !loading && handleAuth()}
                                disabled={loading}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    }
                                }}
                            />

                            {error && (
                                <Alert severity="error" sx={{ mt: 2, mb: 2, borderRadius: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            <Button
                                fullWidth
                                variant="contained"
                                disabled={loading}
                                sx={{
                                    mt: 3,
                                    mb: 2,
                                    py: 1.5,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    '&:hover': {
                                        transform: !loading ? 'translateY(-2px)' : 'none',
                                        boxShadow: !loading ? '0 8px 25px rgba(102, 126, 234, 0.4)' : 'none',
                                    },
                                    '&:disabled': {
                                        opacity: 0.6,
                                    }
                                }}
                                onClick={handleAuth}
                            >
                                {loading ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <span>Processing...</span>
                                    </Box>
                                ) : (
                                    formState === 0 ? "Login" : "Register"
                                )}
                            </Button>

                        </Box>

                    </Box>

                </Grid>

            </Grid>

            <Snackbar
                open={open}
                autoHideDuration={4000}
                onClose={() => setOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setOpen(false)} severity="success" sx={{ borderRadius: 2 }}>
                    {message}
                </Alert>
            </Snackbar>

        </ThemeProvider>
    );
}