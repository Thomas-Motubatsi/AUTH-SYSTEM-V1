
import { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Select,
    MenuItem,
    Switch,
    Chip,
    CircularProgress,
    Alert
} from '@mui/material';

import AxiosInstance from './AxiosInstance';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        try {
            setLoading(true);

            const response = await AxiosInstance.get('users/');
            setUsers(response.data);

        } catch (err) {
            console.error(err);
            setError('Unable to load users. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await AxiosInstance.patch(`users/${userId}/`, {
                role: newRole
            });

            setUsers(prev =>
                prev.map(user =>
                    user.id === userId
                        ? { ...user, role: newRole }
                        : user
                )
            );

        } catch (err) {
            console.error(err);
            setError('Failed to update user role.');
        }
    };

    const handleStatusChange = async (userId, isActive) => {
        try {
            await AxiosInstance.patch(`users/${userId}/`, {
                is_active: isActive
            });

            setUsers(prev =>
                prev.map(user =>
                    user.id === userId
                        ? { ...user, is_active: isActive }
                        : user
                )
            );

        } catch (err) {
            console.error(err);
            setError('Failed to update account status.');
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={5}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" fontWeight="bold" mb={1}>
                Manage Users
            </Typography>

            <Typography color="text.secondary" mb={3}>
                View hospital system users, manage their roles
                and control account access.
            </Typography>

            {error && (
                <Alert
                    severity="error"
                    onClose={() => setError('')}
                    sx={{ mb: 2 }}
                >
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper} elevation={2}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Name</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>Role</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Access</strong></TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {users.map(user => (
                            <TableRow key={user.id} hover>
                                <TableCell>
                                    {user.first_name} {user.last_name}
                                </TableCell>

                                <TableCell>{user.email}</TableCell>

                                <TableCell>
                                    <Select
                                        size="small"
                                        value={user.role}
                                        onChange={e =>
                                            handleRoleChange(
                                                user.id,
                                                e.target.value
                                            )
                                        }
                                        sx={{ minWidth: 145 }}
                                    >
                                        <MenuItem value="STAFF">
                                            Staff
                                        </MenuItem>

                                        <MenuItem value="IT_STAFF">
                                            IT Staff
                                        </MenuItem>

                                        <MenuItem value="IT_ADMIN">
                                            IT Administrator
                                        </MenuItem>
                                    </Select>
                                </TableCell>

                                <TableCell>
                                    <Chip
                                        label={
                                            user.is_active
                                                ? 'Active'
                                                : 'Inactive'
                                        }
                                        color={
                                            user.is_active
                                                ? 'success'
                                                : 'default'
                                        }
                                        size="small"
                                    />
                                </TableCell>

                                <TableCell>
                                    <Switch
                                        checked={user.is_active}
                                        onChange={e =>
                                            handleStatusChange(
                                                user.id,
                                                e.target.checked
                                            )
                                        }
                                        color="success"
                                    />
                                </TableCell>
                            </TableRow>
                        ))}

                        {users.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default Users;
