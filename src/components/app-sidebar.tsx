"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import {
  Send,
  GithubIcon,
  ComponentIcon,
  ChefHat,
  Carrot,
  Calendar,
  Heart,
  Tag,
  Shield,
  Globe,
  Key,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { useLanguage } from "../app/(protected)/_context/language";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, status } = useSession();
  const { t, language, setLanguage } = useLanguage();

  const navMain = React.useMemo(() => {
    const items = [
      {
        title: t("nav.dishes"),
        url: "/dishes",
        icon: ChefHat,
      },
      {
        title: t("nav.menus"),
        url: "/menus",
        icon: Calendar,
      },
      {
        title: t("nav.favorites"),
        url: "/favorites",
        icon: Heart,
      },
    ];

    // Add admin items if user is admin
    if (session?.user?.role === "admin") {
      items.push(
        {
          title: t("nav.admin") + " - " + t("nav.dishes"),
          url: "/admin/dishes",
          icon: Shield,
        },
        {
          title: t("nav.admin") + " - " + t("nav.ingredients"),
          url: "/admin/ingredients",
          icon: Carrot,
        },
        {
          title: t("nav.admin") + " - " + t("nav.tags"),
          url: "/admin/tags",
          icon: Tag,
        },
        {
          title: t("nav.admin") + " - API Keys",
          url: "/admin/api-keys",
          icon: Key,
        },
      );
    }

    return items;
  }, [session?.user?.role, t]);

  const navSecondary = [
    {
      title: "Github",
      url: "https://github.com/thanh/exploro",
      icon: GithubIcon,
    },
    {
      title: "Feedback",
      url: "https://github.com/thanh/exploro/issues",
      icon: Send,
    },
  ];

  const user = React.useMemo(() => {
    if (!session?.user) {
      return { name: "", email: "", avatar: "/avatars/default.jpg" };
    }
    const userData = session.user as unknown as {
      name?: string;
      email?: string;
      avatar?: string;
    };
    const name = userData.name ?? "";
    const email = userData.email ?? "";
    const avatar =
      typeof userData.avatar === "string"
        ? userData.avatar
        : "/avatars/default.jpg";
    return { name, email, avatar };
  }, [session]);

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <ComponentIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Exploro</span>
                  <span className="truncate text-xs">
                    Vietnamese Meal Planner
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <div className="px-3 py-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => setLanguage(language === "vi" ? "en" : "vi")}
          >
            <Globe className="mr-2 h-4 w-4" />
            {language === "vi" ? "English" : "Tiếng Việt"}
          </Button>
        </div>
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {status == "loading" ? (
          <div className="flex items-center gap-2 px-1 py-2">
            <Skeleton className="h-8 w-8 rounded-lg bg-gray-200" />
            <div className="grid flex-1 gap-1 text-left text-sm leading-tight">
              <Skeleton className="h-4 w-24 bg-gray-200" />
              <Skeleton className="h-3 w-32 bg-gray-200" />
            </div>
            <Skeleton className="ml-auto h-4 w-4" />
          </div>
        ) : (
          <NavUser user={user} />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
