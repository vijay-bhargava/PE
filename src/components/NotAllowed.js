
import { Container, Typography, Button, Box } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

function NotFoundPage({ heading, body1, returnlink,headingStyle }) {
  return (
    <Container maxWidth="sm" className="mt-5">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        p={4}
        border="1px solid #e0e0e0"
        borderRadius={4}
        boxShadow={3}
        bgcolor="#fafafa"
      >
        <LockOutlinedIcon style={{ fontSize: 60, color: '#f44336', marginBottom: '16px' }} />
        <Typography variant="h4" component="h3" gutterBottom color="error"   style={{ fontSize: '14px', ...headingStyle }}  >
          {heading || "Access Denied"}
        </Typography>
        <Typography variant="body1" gutterBottom>
          {body1 || "You do not have the necessary permissions to view this page."}
        </Typography>
        {returnlink && (
          <Typography variant="body2" color="textSecondary" mt={2}>
            {returnlink}
          </Typography>
        )}
        <Button
          variant="contained"
          color="primary"
          style={{ marginTop: '24px' }}
          onClick={() => window.history.back()}
        >
          Go Back
        </Button>
      </Box>
    </Container>
  );
}
export default NotFoundPage;