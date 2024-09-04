/** @jsxImportSource theme-ui */
import { Box, Button } from "theme-ui";

export default function AppBar() {
  return (
    <div sx={{
      display: 'flex',
      p: 4,
      width: '100%',
    }}>
      <Box>
        <Button
          sx={{
          background: 'transparent',
          border: '2px solid rgba(0,0,0,0.25)',
          borderRadius: '64px',
          color: '#000',
          cursor: 'pointer',
          fontFamily: 'Open Sans, sans-serif',
          fontSize: '18px',
          fontWeight: 800,
          transition: 'border ease-in-out 250ms',
          '&:hover': {
            borderColor: '#000',
          },
        }}>
          SoundAcademy
        </Button>
      </Box>
      <Box sx={{ flexGrow: 1 }}></Box>
      <Box sx={{
        justifyContent: 'end',
      }}>
        <Button sx={{
          background: 'transparent',
          border: '2px solid rgba(0,0,0,0.0)',
          borderRadius: '64px',
          color: '#000',
          cursor: 'pointer',
          fontFamily: 'Open Sans, sans-serif',
          fontSize: '18px',
          fontWeight: 800,
        }}>
          Login
        </Button>
        <Button sx={{
          background: '#000',
          border: '2px solid rgba(0,0,0,1)',
          borderRadius: '64px',
          color: '#ffd632',
          cursor: 'pointer',
          fontFamily: 'Open Sans, sans-serif',
          fontSize: '18px',
          fontWeight: 800,
        }}>
          Sign up
        </Button>

      </Box>
    </div>
  );
}
