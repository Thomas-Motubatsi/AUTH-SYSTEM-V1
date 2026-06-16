import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import AddHomeWorkIcon from '@mui/icons-material/AddHomeWork';
import InfoIcon from '@mui/icons-material/Info';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link, useLocation } from 'react-router-dom';
import AxiosInstance from './AxiosInstance';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

export default function Navbar(props) {
  const { content } = props;
  
  const location = useLocation();
  const path = location.pathname;
  const Navigate = useNavigate()

  const LogoutUser =()=>{
    AxiosInstance.post(`logout/`,{

    })
    .then(()=>{
      localStorage.removeItem("Token")
      Navigate("/")
    })
  }
  

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Clipped drawer
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            
            <ListItem key="nav-home" disablePadding>
              <ListItemButton component={Link} to="/home" selected={path === "/home"}>
                <ListItemIcon>
                   <AddHomeWorkIcon /> 
                </ListItemIcon>
                <ListItemText primary="Home" /> 
              </ListItemButton>
            </ListItem>

            
            <ListItem key="nav-about" disablePadding>
              <ListItemButton onClick={LogoutUser}>
                <ListItemIcon>
                   <LogoutIcon/> 
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {content}
      </Box>
    </Box>
  );
}
