import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';


const MinimalLayout = () => {
  return (
    <Box >
    {/* <div>no header</div> */}
    <Outlet />
    {/* <Drawer open={open} handleDrawerToggle={handleDrawerToggle} />
    <Box component="main" sx={{ width: '100%', flexGrow: 1, p: { xs: 2, sm: 3 } }}>
      <Toolbar />
      <Breadcrumbs navigation={navigation} title />
      <Outlet />
    </Box> */}
  </Box>
  );
};

export default MinimalLayout;