import "@/styles/globals.css";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { HydrateClient } from "@/trpc/server";
import { OrganizationProvider } from "./_context/organization";
import { LanguageProvider } from "./_context/language";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <OrganizationProvider>
        <LanguageProvider>
          <HydrateClient>
            <AppSidebar />
            <SidebarInset>{children}</SidebarInset>
          </HydrateClient>
        </LanguageProvider>
      </OrganizationProvider>
    </SidebarProvider>
  );
}
