import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import CONSTANTS from '../Constatnts/';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 2,
        mt: 'auto',
        backgroundColor: '#f5f5f5',
        borderTop: '1px solid #e0e0e0',
      }}
    >
      <Container maxWidth="xl">
        <Typography variant="body2" color="textSecondary" align="center">
          {CONSTANTS.appName} v{CONSTANTS.appVersion}
        </Typography>
        <Typography variant="body2" color="textSecondary" align="center">
          {CONSTANTS.appDeveloper} 
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;