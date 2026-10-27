"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ConditionalChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideChrome =
    (pathname?.startsWith("/dashboard") ?? false) ||
    (pathname?.startsWith("/admin") ?? false) ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/complete-profile" ||
    (pathname?.startsWith("/complete-profile") ?? false);

  if (hideChrome) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
