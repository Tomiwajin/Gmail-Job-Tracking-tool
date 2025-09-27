"use client";
import { usePathname } from "next/navigation";

export default function Visibility({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showSidebar = pathname !== "/";

  if (!showSidebar) {
    return <>{children}</>;
  }
  return <>{children}</>;
}
