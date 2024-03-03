import Logo from '../SVG/Logo';

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    height: '64px',
    borderBottom: '1px solid #e8e8ec', 
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
  },
  headerHeading: {
    fontFamily: 'Playfair Display, serif',
    fontWeight: 300,
    margin: 0,
    color: '#7A7E8E',
  },
  logoSpan: {
    fontFamily: 'Open Sans, sans-serif',
    fontWeight: 400,
    textTransform: 'uppercase' as const,
    color: '#2D334A',
  },
};

export default function Header() {
  return (
    <header style={styles.header}>
      <div style={styles.headerTitle}>
        <Logo /> 
        <h1 style={styles.headerHeading}>
          <span style={styles.logoSpan}>Micro</span> Documentation
        </h1>
      </div>
 
      <aside>

      </aside>

    </header> 
  );
}
