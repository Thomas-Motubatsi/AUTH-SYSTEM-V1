
import { useEffect, useState } from 'react'
import AxiosInstance from './AxiosInstance'
import { useNavigate } from 'react-router-dom'

import {
    Box,
    Typography,
    CircularProgress,
    Grid,
    Card,
    CardContent,
    Button,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Divider,
    Avatar,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    AppBar,
    Toolbar,
    IconButton,
    Drawer,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Alert,
    Snackbar,
    Stack,
    Badge,
    Menu
} from '@mui/material'

import {
    Dashboard as DashboardIcon,
    ConfirmationNumber as TicketIcon,
    People as PeopleIcon,
    Add as AddIcon,
    Logout as LogoutIcon,
    Menu as MenuIcon,
    Assignment as AssignmentIcon,
    CheckCircle as CheckCircleIcon,
    PendingActions as PendingIcon,
    Build as BuildIcon,
    History as HistoryIcon,
    SwapHoriz as MoveIcon,
    Person as PersonIcon,
    Notifications as NotificationsIcon
} from '@mui/icons-material'

const Home = () => {

    const navigate = useNavigate()

    // Dashboard state
    const [user, setUser] = useState(null)
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [mobileOpen, setMobileOpen] = useState(false)

    // Assignment state
    const [selectedTicket, setSelectedTicket] = useState(null)
    const [technicians, setTechnicians] = useState([])
    const [selectedTechnician, setSelectedTechnician] = useState('')
    const [assignOpen, setAssignOpen] = useState(false)

    // Ticket movement state
    const [moveOpen, setMoveOpen] = useState(false)
    const [newStatus, setNewStatus] = useState('')
    const [resolutionNotes, setResolutionNotes] = useState('')

    // Activity history state
    const [historyOpen, setHistoryOpen] = useState(false)
    const [ticketHistory, setTicketHistory] = useState([])
    const [historyLoading, setHistoryLoading] = useState(false)

    // General action state
    const [actionLoading, setActionLoading] = useState(false)

    // Snackbar notifications
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success'
    })

    // Backend notifications
    const [notifications, setNotifications] = useState([])
    const [notificationAnchor, setNotificationAnchor] = useState(null)

    const unreadCount = notifications.filter(
        item => !item.is_read
    ).length


    // Load authenticated user and tickets
    useEffect(() => {

        const loadDashboard = async () => {

            try {

                const userResponse = await AxiosInstance.get('users/me/')
                setUser(userResponse.data)

                const ticketResponse = await AxiosInstance.get(
                    'api/tickets/'
                )

                setTickets(ticketResponse.data)

            } catch (err) {

                console.error(err.response?.data || err.message)

                setError('Unable to load dashboard information.')

            } finally {

                setLoading(false)

            }
        }

        loadDashboard()

    }, [])


    // Fetch notifications
    const fetchNotifications = async () => {

        try {

            const response = await AxiosInstance.get(
                'api/tickets/notifications/'
            )

            setNotifications(response.data)

        } catch (err) {

            console.error(
                'Unable to fetch notifications:',
                err.response?.data || err.message
            )

        }

    }


    // Load notifications when dashboard opens
    useEffect(() => {

        fetchNotifications()

    }, [])


    // Open notification dropdown
    const handleOpenNotifications = (event) => {

        setNotificationAnchor(event.currentTarget)
        fetchNotifications()

    }


    // Close notification dropdown
    const handleCloseNotifications = () => {

        setNotificationAnchor(null)

    }


    // Mark individual notification as read
    const handleMarkAsRead = async (notificationId) => {

        try {

            await AxiosInstance.patch(
                `api/tickets/notifications/${notificationId}/read/`
            )

            setNotifications(previous =>
                previous.map(item =>
                    item.id === notificationId
                        ? { ...item, is_read: true }
                        : item
                )
            )

        } catch (err) {

            console.error(err.response?.data || err.message)

            showNotification(
                'Unable to update notification.',
                'error'
            )

        }

    }


    // Mark all notifications as read
    const handleMarkAllAsRead = async () => {

        try {

            await AxiosInstance.patch(
                'api/tickets/notifications/read-all/'
            )

            setNotifications(previous =>
                previous.map(item => ({
                    ...item,
                    is_read: true
                }))
            )

            showNotification(
                'All notifications marked as read.'
            )

        } catch (err) {

            console.error(err.response?.data || err.message)

            showNotification(
                'Unable to update notifications.',
                'error'
            )

        }

    }


    // Logout
    const handleLogout = () => {

        localStorage.removeItem('Token')
        navigate('/')

    }


    // Role labels
    const roleLabels = {
        STAFF: 'Hospital Staff',
        IT_STAFF: 'IT Technician',
        IT_ADMIN: 'IT Administrator'
    }

    const role = user?.role


    // Snackbar notification handler
    const showNotification = (message, severity = 'success') => {

        setNotification({
            open: true,
            message,
            severity
        })

    }


    // Ticket statistics
    const totalTickets = tickets.length

    const openTickets = tickets.filter(
        ticket => ticket.status === 'OPEN'
    ).length

    const inProgressTickets = tickets.filter(
        ticket => ticket.status === 'IN_PROGRESS'
    ).length

    const resolvedTickets = tickets.filter(
        ticket => ticket.status === 'RESOLVED'
    ).length


    // Status styling
    const getStatusColor = (status) => {

        switch (status) {

            case 'OPEN':
                return 'warning'

            case 'IN_PROGRESS':
                return 'info'

            case 'ON_HOLD':
                return 'default'

            case 'RESOLVED':
                return 'success'

            case 'CLOSED':
                return 'secondary'

            default:
                return 'default'
        }

    }


    // Navigation based on role
    const navigationItems = [

        {
            label: 'Dashboard',
            icon: <DashboardIcon />,
            action: () => navigate('/home')
        },

        {
            label: 'Tickets',
            icon: <TicketIcon />,
            action: () => navigate('/home')
        },

        ...(role === 'STAFF' ? [{
            label: 'Create Ticket',
            icon: <AddIcon />,
            action: () => navigate('/create-ticket')
        }] : []),

        ...(role === 'IT_ADMIN' ? [{
            label: 'Manage Users',
            icon: <PeopleIcon />,
            action: () => navigate('/users')
        }] : [])

    ]


    // Sidebar
    const drawerContent = (

        <Box
            sx={{
                width: 250,
                height: '100%',
                bgcolor: '#111827',
                color: 'white',
                position: 'relative'
            }}
        >

            <Box sx={{ p: 3 }}>

                <Typography variant="h5" fontWeight="bold">
                    HOSPITAL IT
                </Typography>

                <Typography variant="caption" color="#9ca3af">
                    Ticket Management System
                </Typography>

            </Box>

            <Divider sx={{ borderColor: '#374151' }} />

            <List sx={{ px: 1, mt: 2 }}>

                {navigationItems.map((item, index) => (

                    <ListItemButton
                        key={index}
                        onClick={() => {
                            item.action()
                            setMobileOpen(false)
                        }}
                        sx={{
                            borderRadius: 2,
                            mb: 1,
                            color: '#d1d5db',
                            '&:hover': {
                                bgcolor: '#374151',
                                color: 'white'
                            }
                        }}
                    >

                        <ListItemIcon
                            sx={{
                                color: 'inherit',
                                minWidth: 40
                            }}
                        >
                            {item.icon}
                        </ListItemIcon>

                        <ListItemText primary={item.label} />

                    </ListItemButton>

                ))}

            </List>

            <Box
                sx={{
                    position: 'absolute',
                    bottom: 15,
                    px: 2,
                    width: '100%',
                    boxSizing: 'border-box'
                }}
            >

                <Divider sx={{ borderColor: '#374151', mb: 2 }} />

                <ListItemButton
                    onClick={handleLogout}
                    sx={{ color: '#fca5a5' }}
                >

                    <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                        <LogoutIcon />
                    </ListItemIcon>

                    <ListItemText primary="Logout" />

                </ListItemButton>

            </Box>

        </Box>

    )


    // Open assignment dialog
    const handleOpenAssign = async (ticket) => {

        setSelectedTicket(ticket)
        setSelectedTechnician('')
        setTechnicians([])
        setAssignOpen(true)

        try {

            const response = await AxiosInstance.get(
                'api/tickets/technicians/'
            )

            setTechnicians(response.data)

        } catch (err) {

            console.error(err.response?.data || err.message)

            showNotification(
                'Unable to load technicians.',
                'error'
            )

        }

    }


    // Assign ticket
    const handleAssign = async () => {

        if (!selectedTechnician) {

            showNotification(
                'Please select a technician.',
                'warning'
            )

            return
        }

        try {

            setActionLoading(true)

            const response = await AxiosInstance.patch(
                `api/tickets/${selectedTicket.id}/assign/`,
                {
                    assigned_to: selectedTechnician
                }
            )

            setTickets(previous =>
                previous.map(ticket =>
                    ticket.id === selectedTicket.id
                        ? response.data
                        : ticket
                )
            )

            setAssignOpen(false)

            showNotification(
                'Technician assigned successfully.'
            )

            fetchNotifications()

        } catch (err) {

            console.error(err.response?.data || err.message)

            showNotification(
                err.response?.data?.error ||
                'Unable to assign technician.',
                'error'
            )

        } finally {

            setActionLoading(false)

        }

    }


    // Open move ticket dialog
    const handleOpenMove = (ticket) => {

        setSelectedTicket(ticket)
        setNewStatus(ticket.status)
        setResolutionNotes(ticket.resolution_notes || '')

        setMoveOpen(true)

    }


    // Update ticket status
    const handleMoveTicket = async () => {

        if (
            newStatus === 'RESOLVED' &&
            !resolutionNotes.trim()
        ) {

            showNotification(
                'Resolution notes are required before resolving a ticket.',
                'warning'
            )

            return
        }

        try {

            setActionLoading(true)

            const response = await AxiosInstance.patch(
                `api/tickets/${selectedTicket.id}/update/`,
                {
                    status: newStatus,
                    resolution_notes: resolutionNotes
                }
            )

            setTickets(previous =>
                previous.map(ticket =>
                    ticket.id === selectedTicket.id
                        ? response.data
                        : ticket
                )
            )

            setMoveOpen(false)

            showNotification(
                'Ticket status updated successfully.'
            )

            fetchNotifications()

        } catch (err) {

            console.error(err.response?.data || err.message)

            showNotification(
                err.response?.data?.error ||
                'Unable to update ticket.',
                'error'
            )

        } finally {

            setActionLoading(false)

        }

    }


    // Open ticket activity history
    const handleOpenHistory = async (ticket) => {

        setSelectedTicket(ticket)
        setTicketHistory([])
        setHistoryOpen(true)
        setHistoryLoading(true)

        try {

            const response = await AxiosInstance.get(
                `api/tickets/${ticket.id}/history/`
            )

            setTicketHistory(response.data)

        } catch (err) {

            console.error(err.response?.data || err.message)

            showNotification(
                'Unable to load ticket history. Check that the history endpoint has been implemented.',
                'error'
            )

        } finally {

            setHistoryLoading(false)

        }

    }


    // Loading screen
    if (loading) {

        return (

            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh'
                }}
            >

                <CircularProgress />

            </Box>

        )

    }


    // Error screen
    if (error) {

        return (

            <Box sx={{ p: 5 }}>

                <Typography color="error">
                    {error}
                </Typography>

                <Button onClick={() => window.location.reload()}>
                    Retry
                </Button>

            </Box>

        )

    }


    if (!user) return null


    // Dashboard headings
    const dashboardTitle = {
        STAFF: 'My Dashboard',
        IT_STAFF: 'Technician Dashboard',
        IT_ADMIN: 'IT Administration'
    }


    return (

        <Box
            sx={{
                display: 'flex',
                minHeight: '100vh',
                bgcolor: '#f3f4f6'
            }}
        >

            {/* Sidebar */}
            <Box
                component="nav"
                sx={{
                    width: { md: 250 },
                    flexShrink: { md: 0 }
                }}
            >

                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': {
                            width: 250,
                            border: 0
                        }
                    }}
                >

                    {drawerContent}

                </Drawer>


                <Drawer
                    variant="permanent"
                    open
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': {
                            width: 250,
                            border: 0
                        }
                    }}
                >

                    {drawerContent}

                </Drawer>

            </Box>


            {/* Main content */}
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>


                {/* Top bar */}
                <AppBar
                    position="static"
                    elevation={0}
                    sx={{
                        bgcolor: 'white',
                        color: '#111827',
                        borderBottom: '1px solid #e5e7eb'
                    }}
                >

                    <Toolbar>

                        <IconButton
                            onClick={() => setMobileOpen(true)}
                            sx={{
                                display: { md: 'none' },
                                mr: 2
                            }}
                        >

                            <MenuIcon />

                        </IconButton>


                        <Typography
                            variant="h6"
                            fontWeight="bold"
                            sx={{ flexGrow: 1 }}
                        >

                            {dashboardTitle[role] || 'Dashboard'}

                        </Typography>


                        {/* Notification bell */}
                        <IconButton
                            onClick={handleOpenNotifications}
                            sx={{ mr: 2 }}
                            color="inherit"
                            aria-label="Notifications"
                        >

                            <Badge
                                badgeContent={unreadCount}
                                color="error"
                                max={99}
                            >
                                <NotificationsIcon />
                            </Badge>

                        </IconButton>


                        {/* Notification dropdown */}
                        <Menu
                            anchorEl={notificationAnchor}
                            open={Boolean(notificationAnchor)}
                            onClose={handleCloseNotifications}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right'
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right'
                            }}
                            PaperProps={{
                                sx: {
                                    width: 350,
                                    maxWidth: '90vw',
                                    maxHeight: 450,
                                    borderRadius: 2,
                                    mt: 1
                                }
                            }}
                        >

                            <Box
                                sx={{
                                    px: 2,
                                    py: 1.5,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >

                                <Typography fontWeight="bold">
                                    Notifications
                                </Typography>

                                {unreadCount > 0 && (

                                    <Button
                                        size="small"
                                        onClick={handleMarkAllAsRead}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Mark all read
                                    </Button>

                                )}

                            </Box>

                            <Divider />


                            {notifications.length === 0 ? (

                                <Box sx={{ p: 3, textAlign: 'center' }}>

                                    <NotificationsIcon
                                        sx={{
                                            fontSize: 35,
                                            color: '#9ca3af',
                                            mb: 1
                                        }}
                                    />

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        No notifications yet.
                                    </Typography>

                                </Box>

                            ) : (

                                notifications.map(item => (

                                    <MenuItem
                                        key={item.id}
                                        onClick={() => handleMarkAsRead(item.id)}
                                        sx={{
                                            whiteSpace: 'normal',
                                            alignItems: 'flex-start',
                                            py: 1.5,
                                            px: 2,
                                            bgcolor: item.is_read
                                                ? 'white'
                                                : '#eff6ff',
                                            '&:hover': {
                                                bgcolor: '#dbeafe'
                                            }
                                        }}
                                    >

                                        <Box sx={{ width: '100%' }}>

                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    gap: 1,
                                                    alignItems: 'center'
                                                }}
                                            >

                                                <Typography
                                                    variant="body2"
                                                    fontWeight={
                                                        item.is_read
                                                            ? 'normal'
                                                            : 'bold'
                                                    }
                                                >
                                                    {item.title}
                                                </Typography>

                                                {!item.is_read && (

                                                    <Box
                                                        sx={{
                                                            width: 8,
                                                            height: 8,
                                                            borderRadius: '50%',
                                                            bgcolor: '#2563eb',
                                                            flexShrink: 0
                                                        }}
                                                    />

                                                )}

                                            </Box>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                    display: 'block',
                                                    mt: 0.5,
                                                    whiteSpace: 'normal'
                                                }}
                                            >
                                                {item.message}
                                            </Typography>

                                            {item.ticket_number && (

                                                <Typography
                                                    variant="caption"
                                                    color="primary"
                                                    sx={{
                                                        display: 'block',
                                                        mt: 0.5
                                                    }}
                                                >
                                                    Ticket: {item.ticket_number}
                                                </Typography>

                                            )}

                                            <Typography
                                                variant="caption"
                                                color="text.disabled"
                                                sx={{
                                                    display: 'block',
                                                    mt: 0.5
                                                }}
                                            >
                                                {new Date(
                                                    item.created_at
                                                ).toLocaleString()}
                                            </Typography>

                                        </Box>

                                    </MenuItem>

                                ))

                            )}

                        </Menu>


                        {/* User details */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >

                            <Avatar sx={{ bgcolor: '#1d4ed8' }}>
                                {user.first_name?.charAt(0) || 'U'}
                            </Avatar>

                            <Box
                                sx={{
                                    display: {
                                        xs: 'none',
                                        sm: 'block'
                                    }
                                }}
                            >

                                <Typography
                                    fontWeight="bold"
                                    variant="body2"
                                >
                                    {user.first_name}
                                </Typography>

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    {roleLabels[role]}
                                </Typography>

                            </Box>

                        </Box>

                    </Toolbar>

                </AppBar>


                {/* Dashboard body */}
                <Box
                    sx={{
                        px: { xs: 2, md: 3 },
                        py: { xs: 2, md: 4 }
                    }}
                >


                    {/* Welcome */}
                    <Box sx={{ mb: 4 }}>

                        <Typography
                            variant="h4"
                            fontWeight="bold"
                            gutterBottom
                        >
                            Welcome back, {user.first_name}
                        </Typography>

                        <Typography color="text.secondary">
                            Here's an overview of your IT support activities.
                        </Typography>

                    </Box>


                    {/* Statistics */}
                    <Grid container spacing={2} sx={{ mb: 4 }}>

                        <Grid item xs={12} sm={6} lg={3}>

                            <StatCard
                                title="Total Tickets"
                                value={totalTickets}
                                icon={<TicketIcon />}
                                color="#2563eb"
                            />

                        </Grid>


                        <Grid item xs={12} sm={6} lg={3}>

                            <StatCard
                                title="Open Tickets"
                                value={openTickets}
                                icon={<PendingIcon />}
                                color="#d97706"
                            />

                        </Grid>


                        <Grid item xs={12} sm={6} lg={3}>

                            <StatCard
                                title="In Progress"
                                value={inProgressTickets}
                                icon={<BuildIcon />}
                                color="#0891b2"
                            />

                        </Grid>


                        <Grid item xs={12} sm={6} lg={3}>

                            <StatCard
                                title="Resolved"
                                value={resolvedTickets}
                                icon={<CheckCircleIcon />}
                                color="#16a34a"
                            />

                        </Grid>

                    </Grid>


                    {/* Staff action */}
                    {role === 'STAFF' && (

                        <Box sx={{ mb: 3 }}>

                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => navigate('/create-ticket')}
                            >
                                Create New Ticket
                            </Button>

                        </Box>

                    )}


                    {/* Ticket table */}
                    <Box
                        sx={{
                            bgcolor: 'white',
                            borderRadius: 3,
                            border: '1px solid #e5e7eb',
                            overflow: 'hidden'
                        }}
                    >

                        <Box sx={{ p: 3 }}>

                            <Typography variant="h6" fontWeight="bold">

                                {role === 'STAFF'
                                    ? 'My Submitted Tickets'
                                    : role === 'IT_STAFF'
                                        ? 'My Assigned Tickets'
                                        : 'All System Tickets'
                                }

                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >

                                {role === 'STAFF'
                                    ? 'Track the progress of your support requests.'
                                    : role === 'IT_STAFF'
                                        ? 'Tickets assigned to you for investigation.'
                                        : 'Overview of all hospital IT support requests.'
                                }

                            </Typography>

                        </Box>


                        <Divider />


                        {tickets.length === 0 ? (

                            <Box sx={{ p: 5, textAlign: 'center' }}>

                                <AssignmentIcon
                                    sx={{
                                        fontSize: 45,
                                        color: '#9ca3af',
                                        mb: 1
                                    }}
                                />

                                <Typography fontWeight="bold">
                                    No tickets found
                                </Typography>

                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >

                                    {role === 'IT_STAFF'
                                        ? 'You currently have no assigned tickets.'
                                        : 'There are no tickets to display.'
                                    }

                                </Typography>

                            </Box>

                        ) : (

                            <TableContainer>

                                <Table>

                                    <TableHead sx={{ bgcolor: '#f9fafb' }}>

                                        <TableRow>

                                            <TableCell>Ticket</TableCell>
                                            <TableCell>Category</TableCell>
                                            <TableCell>Department</TableCell>
                                            <TableCell>Priority</TableCell>
                                            <TableCell>Status</TableCell>

                                            {role === 'IT_ADMIN' && (
                                                <>
                                                    <TableCell>Created By</TableCell>
                                                    <TableCell>Assigned To</TableCell>
                                                </>
                                            )}

                                            {(role === 'IT_ADMIN' || role === 'IT_STAFF') && (
                                                <TableCell align="right">
                                                    Actions
                                                </TableCell>
                                            )}

                                        </TableRow>

                                    </TableHead>


                                    <TableBody>

                                        {tickets.map((ticket) => (

                                            <TableRow
                                                key={ticket.id}
                                                hover
                                            >

                                                <TableCell>

                                                    <Typography fontWeight="bold">
                                                        {ticket.title}
                                                    </Typography>

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        {ticket.ticket_number}
                                                    </Typography>

                                                </TableCell>


                                                <TableCell>
                                                    {ticket.category}
                                                </TableCell>


                                                <TableCell>
                                                    {ticket.department || 'N/A'}
                                                </TableCell>


                                                <TableCell>
                                                    {ticket.priority}
                                                </TableCell>


                                                <TableCell>

                                                    <Chip
                                                        label={ticket.status.replace('_', ' ')}
                                                        color={getStatusColor(ticket.status)}
                                                        size="small"
                                                    />

                                                </TableCell>


                                                {role === 'IT_ADMIN' && (

                                                    <>

                                                        <TableCell>
                                                            {ticket.created_by_email || 'N/A'}
                                                        </TableCell>

                                                        <TableCell>
                                                            {ticket.assigned_to_email || 'Unassigned'}
                                                        </TableCell>

                                                    </>

                                                )}


                                                {(role === 'IT_ADMIN' || role === 'IT_STAFF') && (

                                                    <TableCell align="right">

                                                        <Stack
                                                            direction="row"
                                                            spacing={1}
                                                            justifyContent="flex-end"
                                                            flexWrap="wrap"
                                                            useFlexGap
                                                        >

                                                            {role === 'IT_ADMIN' && (

                                                                <Button
                                                                    size="small"
                                                                    variant="outlined"
                                                                    startIcon={<PeopleIcon />}
                                                                    onClick={() => handleOpenAssign(ticket)}
                                                                >
                                                                    Assign
                                                                </Button>

                                                            )}


                                                            <Button
                                                                size="small"
                                                                variant="contained"
                                                                startIcon={<MoveIcon />}
                                                                onClick={() => handleOpenMove(ticket)}
                                                            >
                                                                Move
                                                            </Button>


                                                            <Button
                                                                size="small"
                                                                variant="text"
                                                                startIcon={<HistoryIcon />}
                                                                onClick={() => handleOpenHistory(ticket)}
                                                            >
                                                                History
                                                            </Button>

                                                        </Stack>

                                                    </TableCell>

                                                )}

                                            </TableRow>

                                        ))}

                                    </TableBody>

                                </Table>

                            </TableContainer>

                        )}

                    </Box>


                    {/* Technician message */}
                    {role === 'IT_STAFF' && (

                        <Typography
                            color="text.secondary"
                            variant="body2"
                            sx={{ mt: 2 }}
                        >

                            Your dashboard displays only tickets assigned to your account.

                        </Typography>

                    )}

                </Box>

            </Box>


            {/* Assignment dialog */}
            <Dialog
                open={assignOpen}
                onClose={() => !actionLoading && setAssignOpen(false)}
                fullWidth
                maxWidth="sm"
            >

                <DialogTitle>
                    Assign Technician
                </DialogTitle>

                <DialogContent sx={{ pt: 2 }}>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                    >
                        Assign this ticket to an IT technician.
                    </Typography>

                    <Typography fontWeight="bold" sx={{ mb: 2 }}>
                        {selectedTicket?.title}
                    </Typography>

                    <FormControl fullWidth>

                        <InputLabel>Choose Technician</InputLabel>

                        <Select
                            value={selectedTechnician}
                            label="Choose Technician"
                            onChange={(e) => setSelectedTechnician(e.target.value)}
                        >

                            {technicians.map((technician) => (

                                <MenuItem
                                    key={technician.id}
                                    value={technician.id}
                                >

                                    {technician.first_name} {technician.last_name}
                                    {' — '}
                                    {technician.email}

                                </MenuItem>

                            ))}

                        </Select>

                    </FormControl>

                    {technicians.length === 0 && (

                        <Alert severity="warning" sx={{ mt: 2 }}>
                            No active IT technicians were returned.
                        </Alert>

                    )}

                </DialogContent>


                <DialogActions sx={{ p: 2 }}>

                    <Button
                        onClick={() => setAssignOpen(false)}
                        disabled={actionLoading}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleAssign}
                        disabled={actionLoading || !selectedTechnician}
                    >

                        {actionLoading
                            ? 'Assigning...'
                            : 'Confirm Assignment'
                        }

                    </Button>

                </DialogActions>

            </Dialog>


            {/* Move ticket dialog */}
            <Dialog
                open={moveOpen}
                onClose={() => !actionLoading && setMoveOpen(false)}
                fullWidth
                maxWidth="sm"
            >

                <DialogTitle>
                    Move Ticket
                </DialogTitle>

                <DialogContent sx={{ pt: 2 }}>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                    >
                        Update the current status of this ticket.
                    </Typography>

                    <Typography fontWeight="bold" sx={{ mb: 3 }}>
                        {selectedTicket?.title}
                    </Typography>


                    <FormControl fullWidth sx={{ mb: 3 }}>

                        <InputLabel>Ticket Status</InputLabel>

                        <Select
                            value={newStatus}
                            label="Ticket Status"
                            onChange={(e) => setNewStatus(e.target.value)}
                        >

                            <MenuItem value="OPEN">Open</MenuItem>
                            <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                            <MenuItem value="ON_HOLD">On Hold</MenuItem>
                            <MenuItem value="RESOLVED">Resolved</MenuItem>
                            <MenuItem value="CLOSED">Closed</MenuItem>

                        </Select>

                    </FormControl>


                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Resolution Notes"
                        placeholder="Describe the work completed or resolution..."
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                    />


                    {newStatus === 'RESOLVED' && (

                        <Alert severity="info" sx={{ mt: 2 }}>
                            Resolution notes are required before resolving this ticket.
                        </Alert>

                    )}

                </DialogContent>


                <DialogActions sx={{ p: 2 }}>

                    <Button
                        onClick={() => setMoveOpen(false)}
                        disabled={actionLoading}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleMoveTicket}
                        disabled={actionLoading}
                    >

                        {actionLoading
                            ? 'Updating...'
                            : 'Update Ticket'
                        }

                    </Button>

                </DialogActions>

            </Dialog>


            {/* Ticket activity history dialog */}
            <Dialog
                open={historyOpen}
                onClose={() => setHistoryOpen(false)}
                fullWidth
                maxWidth="md"
            >

                <DialogTitle>
                    Ticket Activity History
                </DialogTitle>

                <DialogContent dividers>

                    <Typography fontWeight="bold" sx={{ mb: 1 }}>
                        {selectedTicket?.title}
                    </Typography>

                    <Typography
                        variant="caption"
                        color="text.secondary"
                    >
                        {selectedTicket?.ticket_number}
                    </Typography>


                    <Divider sx={{ my: 2 }} />


                    {historyLoading ? (

                        <Box sx={{ textAlign: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>

                    ) : ticketHistory.length === 0 ? (

                        <Box sx={{ textAlign: 'center', p: 4 }}>

                            <HistoryIcon
                                sx={{
                                    fontSize: 45,
                                    color: '#9ca3af',
                                    mb: 1
                                }}
                            />

                            <Typography fontWeight="bold">
                                No activity history available
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Activity records will appear here once the backend history feature is implemented.
                            </Typography>

                        </Box>

                    ) : (

                        <Stack spacing={2}>

                            {ticketHistory.map((activity) => (

                                <Box
                                    key={activity.id}
                                    sx={{
                                        display: 'flex',
                                        gap: 2,
                                        alignItems: 'flex-start'
                                    }}
                                >

                                    <Avatar
                                        sx={{
                                            bgcolor: '#dbeafe',
                                            color: '#1d4ed8',
                                            width: 38,
                                            height: 38
                                        }}
                                    >
                                        <PersonIcon />
                                    </Avatar>

                                    <Box sx={{ flexGrow: 1 }}>

                                        <Typography fontWeight="bold">
                                            {activity.action || 'Ticket activity'}
                                        </Typography>

                                        <Typography variant="body2">
                                            {activity.description || ''}
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            {activity.performed_by_name ||
                                                activity.performed_by_email ||
                                                'System'}
                                            {' • '}
                                            {activity.created_at
                                                ? new Date(activity.created_at).toLocaleString()
                                                : 'Time unavailable'}
                                        </Typography>

                                    </Box>

                                </Box>

                            ))}

                        </Stack>

                    )}

                </DialogContent>


                <DialogActions sx={{ p: 2 }}>

                    <Button onClick={() => setHistoryOpen(false)}>
                        Close
                    </Button>

                </DialogActions>

            </Dialog>


            {/* Snackbar feedback */}
            <Snackbar
                open={notification.open}
                autoHideDuration={4000}
                onClose={() =>
                    setNotification(previous => ({
                        ...previous,
                        open: false
                    }))
                }
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right'
                }}
            >

                <Alert
                    severity={notification.severity}
                    variant="filled"
                    onClose={() =>
                        setNotification(previous => ({
                            ...previous,
                            open: false
                        }))
                    }
                >
                    {notification.message}
                </Alert>

            </Snackbar>

        </Box>

    )

}


// Reusable statistics card
const StatCard = ({ title, value, icon, color }) => {

    return (

        <Card
            elevation={0}
            sx={{
                borderRadius: 3,
                border: '1px solid #e5e7eb',
                height: '100%'
            }}
        >

            <CardContent
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >

                <Box>

                    <Typography color="text.secondary" variant="body2">
                        {title}
                    </Typography>

                    <Typography
                        variant="h4"
                        fontWeight="bold"
                        sx={{ mt: 1 }}
                    >
                        {value}
                    </Typography>

                </Box>


                <Avatar
                    sx={{
                        bgcolor: `${color}18`,
                        color: color,
                        width: 48,
                        height: 48
                    }}
                >
                    {icon}
                </Avatar>

            </CardContent>

        </Card>

    )

}


export default Home
