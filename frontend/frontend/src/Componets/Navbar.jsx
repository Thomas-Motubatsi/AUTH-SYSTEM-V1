
import React from 'react';

import {
    Box,
    Drawer,
    CssBaseline,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Divider,
    Avatar,
} from '@mui/material';

import {
    DashboardRounded,
    ConfirmationNumberRounded,
    LogoutRounded,
    LocalHospitalRounded,
} from '@mui/icons-material';

import { Link, useLocation, useNavigate } from 'react-router-dom';
import AxiosInstance from './AxiosInstance';

const drawerWidth = 250;

export default function Navbar({ content }) {
    const location = useLocation();
    const navigate = useNavigate();

    const LogoutUser = async () => {
        try {
            await AxiosInstance.post('logout/', {});
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('Token');
            navigate('/');
        }
    };

    const navigationItems = [
        {
            title: 'Dashboard',
            path: '/home',
            icon: <DashboardRounded />,
        },
        {
            title: 'Tickets',
            path: '/tickets',
            icon: <ConfirmationNumberRounded />,
        },
    ];

    return (
        <Box
            sx={{
                display: 'flex',
                minHeight: '100vh',
                backgroundColor: '#f4f6fa',
            }}
        >
            <CssBaseline />

            {/* Sidebar */}
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,

                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        border: 'none',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                    },
                }}
            >
                {/* Brand */}
                <Box
                    sx={{
                        px: 3,
                        py: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                    }}
                >
                    <Avatar
                        sx={{
                            bgcolor: '#172b4d',
                            width: 42,
                            height: 42,
                            borderRadius: 2,
                        }}
                    >
                        <LocalHospitalRounded />
                    </Avatar>

                    <Box>
                        <Typography
                            variant="subtitle1"
                            fontWeight={800}
                            color="#172b4d"
                        >
                            IT SUPPORT
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            Hospital Ticket System
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ borderColor: '#edf0f5' }} />

                {/* Navigation */}
                <Box sx={{ px: 2, py: 3, flexGrow: 1 }}>
                    <Typography
                        variant="caption"
                        sx={{
                            px: 1.5,
                            mb: 1.5,
                            display: 'block',
                            color: '#929bad',
                            fontWeight: 700,
                            letterSpacing: 1,
                        }}
                    >
                        WORKSPACE
                    </Typography>

                    <List disablePadding>
                        {navigationItems.map((item) => {
                            const active = location.pathname === item.path;

                            return (
                                <ListItem
                                    key={item.path}
                                    disablePadding
                                    sx={{ mb: 1 }}
                                >
                                    <ListItemButton
                                        component={Link}
                                        to={item.path}
                                        selected={active}
                                        sx={{
                                            borderRadius: 2,
                                            py: 1.3,
                                            px: 1.5,

                                            color: active ? '#ffffff' : '#64748b',

                                            backgroundColor: active
                                                ? '#172b4d'
                                                : 'transparent',

                                            '&.Mui-selected': {
                                                backgroundColor: '#172b4d',
                                                color: '#ffffff',
                                            },

                                            '&.Mui-selected:hover': {
                                                backgroundColor: '#243e68',
                                            },

                                            '&:hover': {
                                                backgroundColor: active
                                                    ? '#243e68'
                                                    : '#f1f4f9',
                                            },

                                            '& .MuiListItemIcon-root': {
                                                color: 'inherit',
                                                minWidth: 40,
                                            },
                                        }}
                                    >
                                        <ListItemIcon>
                                            {item.icon}
                                        </ListItemIcon>

                                        <ListItemText
                                            primary={item.title}
                                            primaryTypographyProps={{
                                                fontSize: 14,
                                                fontWeight: active ? 700 : 500,
                                            }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                    </List>
                </Box>

                {/* Logout */}
                <Box sx={{ p: 2 }}>
                    <Divider sx={{ mb: 2, borderColor: '#edf0f5' }} />

                    <ListItem disablePadding>
                        <ListItemButton
                            onClick={LogoutUser}
                            sx={{
                                borderRadius: 2,
                                py: 1.3,
                                color: '#dc4c4c',

                                '&:hover': {
                                    backgroundColor: '#fff1f1',
                                },

                                '& .MuiListItemIcon-root': {
                                    color: '#dc4c4c',
                                    minWidth: 40,
                                },
                            }}
                        >
                            <ListItemIcon>
                                <LogoutRounded />
                            </ListItemIcon>

                            <ListItemText
                                primary="Logout"
                                primaryTypographyProps={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                </Box>
            </Drawer>

            {/* Main content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    minWidth: 0,
                    minHeight: '100vh',
                    p: { xs: 2, md: 4 },
                    backgroundColor: '#f4f6fa',
                }}
            >
                {content}
            </Box>
        </Box>
    );
}
