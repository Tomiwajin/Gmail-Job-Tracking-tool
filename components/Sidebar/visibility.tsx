"use client";
import { usePathname } from "next/navigation";
import Appsidebar from "./Appsidebar";

export default function Visibility({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showSidebar =
    pathname !== "/" && pathname !== "/privacy" && pathname !== "/terms";

  if (!showSidebar) {
    return <>{children}</>;
  }
  return (
    <div className="grid grid-cols-[auto_1fr] flex-1 w-full">
      <Appsidebar />
      <main className="flex flex-col overflow-auto">{children}</main>
    </div>
  );
}
