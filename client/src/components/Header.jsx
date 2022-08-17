import * as React from 'react';
import { Box, Typography } from '@mui/material';

function Header() {
  return (
    <Box sx={{
      py: 4, pl: '6px', display: 'flex', alignItems: 'baseline',
    }}
    >
      <Typography variant="h3" sx={{ paddingRight: '4px', color: '#6977C9' }}>QUICK</Typography>
      <Typography variant="subtitle1" color="GrayText">notes</Typography>
    </Box>
  );
}

export default Header;
