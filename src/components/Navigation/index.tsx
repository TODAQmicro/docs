import type { CollectionEntry } from "astro:content";

export type NavigationRoute = string;

export type NavigationEntry = CollectionEntry<'guide'> | CollectionEntry<'reference'>;

export type NavigationEntries = Array<NavigationEntry>;

export interface Props {
  entries: Array<NavigationEntries | NavigationEntry>,
  root: Boolean,
}

export default function Navigation({ entries = [], root = false }: Props) {
  return (
    <nav className={root ? 'nav-root' : 'nav-sub'}>
      <ul className="nav-list">
        {entries && entries.map((entry) => Array.isArray(entry)
          ? null
          : (
            <li className="nav-item">
              <a href={`/${entry.collection}/${entry.slug}/`} className="nav-link">
                {entry.data.title}
              </a>
              {entry.data.description ? <p className="nav-desc">{entry.data.description}</p> : null}
            </li>
          )
        )}
      </ul>
    </nav>
  );
}
