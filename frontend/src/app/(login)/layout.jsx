"use client";

import { useState, useEffect, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Table,
  Columns,
  Database,
  User,
  RefreshCcw,
  LogOut,
  Menu,
  X,
  GraduationCap,
} from "@/app/components/icons";
import LoadingIndicator from "./profile/components/LoadingIndicator";
import { fetchApi } from "@/app/lib/api";

const handleRefreshSession = () => console.log("Refresh session clicked");

const navLinks = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/table",
    label: "Student Records",
    icon: Table,
  },
  {
    href: "/compare-data",
    label: "Compare Data",
    icon: Columns,
  },
  {
    href: "/data-management",
    label: "Data Management",
    icon: Database,
    adminOnly: true,
  },
  {
    href: "/profile",
    label: "View Profile",
    icon: User,
  },
];

const SidebarMenu = memo(function SidebarMenu({
  user,
  userLoading,
  userError,
  isAdmin,
  isActive,
  navLinks,
  setIsSidebarOpen,
}) {
  if (userLoading) {
    return (
      <div className="flex flex-col gap-1 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center px-3 py-2.5 rounded-md">
            <div className="w-5 h-5 bg-gray-200 rounded mr-3"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        ))}
      </div>
    );
  }
  if (userError) {
    return <div className="text-red-600 text-sm px-3 py-2">{userError}</div>;
  }
  if (user) {
    return navLinks.map((link) => {
      if (link.adminOnly && !isAdmin) {
        return null;
      }
      const IconComponent = link.icon;
      return (
        <Link
          key={link.href}
          href={link.href}
          onClick={() => setIsSidebarOpen(false)}
          className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
            isActive(link.href)
              ? "bg-red-800 text-white"
              : "text-gray-700 hover:bg-red-50 hover:text-red-800"
          }`}
        >
          <IconComponent className="h-5 w-5 mr-3" strokeWidth={1.5} />
          {link.label}
        </Link>
      );
    });
  }
  return null;
});

export default function LoginLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // User state
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchUser() {
      setUserLoading(true);
      setUserError(null);
      try {
        const data = await fetchApi("/auth/profile");
        if (!mounted) {
          return;
        }

        setUser(data);
        console.log("Fetched user:", data);
      } catch (err) {
        if (!mounted) {
          return;
        }

        setUserError("Could not load user info");
        setUser(null);
        router.replace("/");
      } finally {
        if (mounted) {
          setUserLoading(false);
        }
      }
    }
    fetchUser();

    return () => {
      mounted = false;
    };
  }, [router]);

  const isAdmin = user?.role_id?.role?.toLowerCase() === "admin";

  const isActive = (path) =>
    path === "/data-management" ? pathname.startsWith(path) : pathname === path;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const data = await fetchApi("/auth/logout", { method: "POST" });
      router.push("/");
    } catch (err) {
      alert("Logout failed. Please try again.");
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside
        className={`w-72 border-r border-gray-200 bg-white flex flex-col fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <header className="px-6 py-4 border-b border-gray-100 flex items-start justify-between">
          <div className="flex flex-col">
            <div className="flex mb-4">
              <Image
                src={"/cea_logo.png"}
                alt="College of Engineering and Architecture Logo"
                width={80}
                height={80}
                priority
              />
            </div>
            <div className="text-xs font-medium text-red-800">
              College of Engineering & Architecture
            </div>
            <div className="text-xs font-medium text-red-800 mb-2">
              PHINMA - Cagayan de Oro College
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1 text-gray-500 hover:text-red-800"
            aria-label="Close sidebar"
          >
            <X className="h-6 w-6" />
          </button>
        </header>

        <div className="px-6 py-4">
          <h1 className="text-lg font-bold text-red-800">Welcome back!</h1>
          <p className="text-sm text-gray-600 mt-1">
            Check out the latest board exam statistics.
          </p>
        </div>

        <nav className="flex-grow px-4 py-2 overflow-y-auto">
          <div className="flex flex-col gap-1">
            <SidebarMenu
              user={user}
              userLoading={userLoading}
              userError={userError}
              isAdmin={isAdmin}
              isActive={isActive}
              navLinks={navLinks}
              setIsSidebarOpen={setIsSidebarOpen}
            />
          </div>
        </nav>

        <footer className="border-t border-gray-100 px-6 py-6">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="h-5 w-5 text-gray-500" strokeWidth={1.5} />
            </div>
            <div className="ml-3">
              <div className="font-medium text-gray-900 text-sm">
                {user ? `${user.first_name} ${user.last_name}` : "User"}
              </div>
              <div className="text-xs text-gray-500">
                {user?.role_id?.role || "User"}
              </div>
            </div>
            <button
              onClick={handleRefreshSession}
              className="ml-auto text-gray-500 hover:text-red-800 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              title="Refresh session"
              aria-label="Refresh session"
            >
              <RefreshCcw className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="mt-4 flex items-center justify-center w-full px-4 py-2 border border-red-800 text-red-800 text-sm font-medium rounded-md hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <LogOut className="h-4 w-4 mr-2" strokeWidth={1.5} />
            Logout
          </button>
        </footer>
      </aside>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-30 bg-white p-4 border-b border-gray-200 md:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1 text-gray-700 hover:text-red-800"
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>

        <div className="p-4 md:p-6 lg:p-8">
          {isLoggingOut ? (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
              <LoadingIndicator />
              <span
                className="mt-4 text-red-700 text-lg font-semibold"
                role="status"
                aria-live="polite"
              >
                Logging out...
              </span>
            </div>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  );
}
