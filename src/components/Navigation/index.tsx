import type { CollectionEntry } from "astro:content";

export type NavigationRoute = string;

export type NavigationEntry = CollectionEntry<'guide'> | CollectionEntry<'reference'>;

export type NavigationEntries = Array<NavigationEntry>;

export interface Props {
  entries: Array<NavigationEntries | NavigationEntry>,
  root: Boolean,
}

const styles = {
  nav: {
    flexGrow: 1,
    minWidth: '20%',
  },
  navRoot: {
    display: 'flex',
    padding: '64px 16px',
  },
  navList: {
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  navListItem: { },
  heading: {
    fontSize: '1.0rem',
    fontFamily: 'Open Sans',
    fontWeight: 400,
    margin: '0 0 8px 0',
  },
  headingLink: {},
  desc: {
    display: 'none',
    margin: 0,
  },
};

export default function Navigation({ entries = [], root = false }: Props) {
  return (
    <nav style={{ ...styles.nav, ...(root ? styles.navRoot : {}) }}>
      <ul style={styles.navList}>
        {entries.map((entry) => Array.isArray(entry)
          ? <Navigation entries={entry} root={false} />
          : (
              <li style={styles.navListItem}>
                <h5 style={styles.heading}>
                  <a style={styles.headingLink} href={`/${entry.collection}/${entry.slug}/`}>
                    {entry.data.title}
                  </a>
                </h5>
                {entry.data.description ? <p style={styles.desc}>{entry.data.description}</p> : null}
              </li>
            )
          )}
      </ul>
    </nav>
  );
}
