/** @jsxImportSource theme-ui */
import { Button } from 'theme-ui';

export default function PlayButton() {
  return (
    <div sx={{
      background: '#000',
      borderRadius: '32px',
      color: '#FFF',
      fontFamily: 'Open Sans, sans-serif',
      p: 2,
    }}>
      Digital Wavelength
      <Button sx={{
        background: '#FFF',
        borderRadius: '100%',
        color: '#000',
        cursor: 'pointer',
        fontSize: '18px',
        height: '44px',
        ml: '8px',
        width: '44px',
      }}>
         &#9658;
      </Button>
    </div>
  );
}
