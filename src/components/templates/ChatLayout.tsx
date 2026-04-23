import { cn } from "@/lib/cn.ts";
import type { ReactNode } from "react";

export type ChatLayoutProps = {
  header: ReactNode;
  sidebar?: ReactNode;
  drawer?: ReactNode;
  drawerOpen?: boolean;
  onCloseDrawer?: () => void;
  overlay?: ReactNode;
  children: ReactNode;
};

export function ChatLayout({
  header,
  sidebar,
  drawer,
  drawerOpen,
  onCloseDrawer,
  overlay,
  children,
}: ChatLayoutProps) {
  return (
    <div className="flex h-svh flex-col">
      {header}
      {overlay}
      <div className="relative flex flex-1 overflow-hidden">
        {sidebar && <div className="hidden sm:flex">{sidebar}</div>}

        {drawer && drawerOpen && (
          <>
            <button
              type="button"
              aria-label="Drawer schliessen"
              className="absolute inset-0 z-10 bg-black/40 sm:hidden"
              onClick={onCloseDrawer}
            />
            <div className={cn("absolute inset-y-0 left-0 z-20 w-72 bg-neutral-950 sm:hidden")}>
              {drawer}
            </div>
          </>
        )}

        <main className="flex min-w-0 flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
