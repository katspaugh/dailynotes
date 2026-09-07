import type { ReactNode } from "react";
import { useKeyboardInset } from "../../hooks/useKeyboardInset";
import styles from "./AppLayout.module.css";

interface AppLayoutProps {
  header: ReactNode;
  children: ReactNode;
}

export function AppLayout({ header, children }: AppLayoutProps) {
  // The shell must never scroll; only the calendar and note panes do.
  useKeyboardInset();

  return (
    <div className={styles.root}>
      {header}
      <div className={styles.content}>{children}</div>
    </div>
  );
}
