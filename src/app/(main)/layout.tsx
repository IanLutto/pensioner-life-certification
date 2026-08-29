// app/(main)/layout.tsx
//
// Wraps only the shell screens (home, status, help) with the bottom nav.
// /self-service and /prototypes live outside this route group on purpose —
// see BottomNav.tsx for why.

import { BottomNav } from "@/components/shared/ui/BottomNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-20">
      {children}
      <BottomNav />
    </div>
  );
}
