import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  useMediaQuery,
  useTheme,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Home as HomeIcon,
  Search as SearchIcon,
  LocalOffer as LocalOfferIcon,
  Menu as MenuIcon
} from '@mui/icons-material';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    {
      label: 'Ingreso de Prendas',
      path: '/home',
      icon: <LocalOfferIcon />,
      description: 'Registrar nuevas prendas'
    },
    {
      label: 'Búsqueda de Prendas',
      path: '/busqueda',
      icon: <SearchIcon />,
      description: 'Buscar prendas perdidas'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    handleMenuClose();
  };

  const isCurrentPath = (path) => location.pathname === path;

  return (
    <AppBar 
      position="sticky" 
      elevation={4}
      sx={{
        backgroundColor: '#1976d2',
        backgroundImage: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ py: 1 }}>
          {/* Logo/Brand */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              flexGrow: isMobile ? 1 : 0,
              cursor: 'pointer'
            }}
            onClick={() => navigate('/home')}
          >
            <LocalOfferIcon 
              sx={{ 
                fontSize: '2rem',
                color: 'white',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
              }} 
            />
            <Typography
              variant="h5"
              component="div"
              sx={{
                fontWeight: 'bold',
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                display: { xs: 'none', sm: 'block' }
              }}
            >
             Peñalolen Lost and Found
            </Typography>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 'bold',
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                display: { xs: 'block', sm: 'none' }
              }}
            >
              Prendas
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', gap: 2, ml: 4 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  startIcon={item.icon}
                  variant={isCurrentPath(item.path) ? "contained" : "text"}
                  sx={{
                    color: 'white',
                    fontWeight: 'bold',
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    backgroundColor: isCurrentPath(item.path) ? 'rgba(255,255,255,0.2)' : 'transparent',
                    backdropFilter: isCurrentPath(item.path) ? 'blur(10px)' : 'none',
                    border: isCurrentPath(item.path) ? '1px solid rgba(255,255,255,0.3)' : 'none',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Mobile Menu */}
          {isMobile && (
            <>
              <IconButton
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleMenuOpen}
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)',
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 280,
                    borderRadius: 2,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }
                }}
              >
                {menuItems.map((item) => (
                  <MenuItem
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      py: 2,
                      px: 3,
                      backgroundColor: isCurrentPath(item.path) ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                      borderLeft: isCurrentPath(item.path) ? '4px solid #1976d2' : '4px solid transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.05)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Box sx={{ color: '#1976d2' }}>
                        {item.icon}
                      </Box>
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: isCurrentPath(item.path) ? 'bold' : 'medium',
                            color: isCurrentPath(item.path) ? '#1976d2' : '#333',
                          }}
                        >
                          {item.label}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#666',
                            display: 'block',
                            lineHeight: 1.2,
                          }}
                        >
                          {item.description}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}

          {/* Current Page Indicator (Desktop) */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': {
                      opacity: 0.7,
                    },
                    '50%': {
                      opacity: 1,
                    },
                    '100%': {
                      opacity: 0.7,
                    },
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255,255,255,0.8)',
                  fontWeight: 'medium',
                }}
              >
                {menuItems.find(item => isCurrentPath(item.path))?.label || 'Sistema de Prendas'}
              </Typography>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;