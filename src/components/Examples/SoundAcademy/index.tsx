/** @jsxImportSource theme-ui */
import { ThemeUIProvider } from 'theme-ui';

import AppBar from './AppBar';
import PlayButton from './PlayButton';
import WavelengthAnimation from './WavelengthAnimation';

export default function SoundAcademyExample () {
  return (
    <ThemeUIProvider theme={{ }}>
      <section id="sound-academy" sx={{
        background: '#ffd632',
        minHeight: [400, 600],
      }}>
        <AppBar />
        <section sx={{
          alignItems: 'center',
          alignContent: 'space-evenly',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'wrap',
          justifyContent: 'space-evenly',
          minHeight: [400, 600],
          textAlign: 'center',
        }}>
          <h2 sx={{
            fontSize: '64px',
            fontWeight: 600,
            margin: 0,
          }}>
            Creating harmony<br />with the power of AI.
          </h2>
          <span sx={{
            fontFamily: 'Open Sans, sans-serif',
            letterSpacing: '0.75px',
            lineHeight: '24px',
            width: ['50%', '33.3%' ],
          }}>
            Welcome to Sound Academy &mdash; the streaming service that
            harnesses the power of artificial intelligence to bring you
            music you love.
          </span>
          <PlayButton />
          <span sx={{
            fontFamily: 'Open Sans, sans-serif',
          }}>
            Try it out for 10 seconds
          </span>
          <WavelengthAnimation count={2} colors={['#FFF', '#000']} />
        </section>
      </section>
    </ThemeUIProvider>
  );
}
