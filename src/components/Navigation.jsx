import React from 'react';
import { Box, Tabs, Tab } from '@mui/material'; 
import { Link, useLocation } from 'react-router-dom'; 

import ShowChartIcon from '@mui/icons-material/ShowChart';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SettingsIcon from '@mui/icons-material/Settings';

function Navigation() {
  const location = useLocation();

  return (
    <Box sx={{ paddingLeft: '40px', paddingRight: '40px' }}>
      <Box 
                sx={{
                  display: 'block',
                  width: '100%', // 화면 너비에 따라 유동적으로 조절
                  maxWidth: 510, // 최대 너비는 510px 유지
                  backgroundColor: '#eeeeee',
                  borderRadius: '50px',
                  padding: '4px',
                  marginBottom: 0,
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                  mt: -2
                }}      >
        <Tabs
          value={location.pathname}
          variant="fullWidth" 
          TabIndicatorProps={{ style: { display: 'none' } }}
          sx={{
            '& .MuiTabs-flexContainer': {
              justifyContent: 'center',
            },
            minHeight: '40px',
          }}
        >
          <Tab
            icon={<ShowChartIcon />}
            iconPosition="start"
            label="요약관리"
            value="/"
            component={Link}
            to="/"
            sx={tabStyles}
          />
          <Tab
            icon={<WarningAmberIcon />}
            iconPosition="start"
            label="위협관리"
            value="/risk"
            component={Link}
            to="/risk"
            sx={tabStyles}
          />
          <Tab
            icon={<SettingsIcon />}
            iconPosition="start"
            label="설정"
            value="/settings"
            component={Link}
            to="/settings"
            sx={tabStyles}
          />
        </Tabs>
      </Box>
    </Box>
  );
}

const tabStyles = {
  textTransform: 'none', 
  fontWeight: 'bold',
  fontSize: '1rem',
  color: '#555', 
  borderRadius: '50px', 
  minHeight: '40px', 
  '&.Mui-selected': {
    backgroundColor: 'white', 
    color: 'black', 
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
  },
};

export default Navigation;