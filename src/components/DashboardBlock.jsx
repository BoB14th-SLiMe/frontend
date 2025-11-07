import React from 'react';
import { Box, Typography } from '@mui/material';

const DashboardBlock = ({ title, controls, sx, children }) => (
    <Box 
        sx={{
            backgroundColor: '#FFFFFF',
            borderRadius: 2,
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            display: 'flex', 
            flexDirection: 'column',
            ...sx 
        }}
    >
        <Box sx={{ padding: 1.2, display: 'flex', flexDirection: 'column', minHeight: 0, flexGrow: 1 }}> 
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" fontWeight="bold">
                    {title}
                </Typography>
                {controls && <Box>{controls}</Box>}
            </Box>
            {children}
        </Box>
    </Box>
);

export default DashboardBlock;