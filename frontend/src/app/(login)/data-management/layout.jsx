"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Building,
  BookCopy,
  School,
  Globe,
  ShieldCheck,
  Table,
  BarChartHorizontal,
  Percent,
  UserCog,
  Network,
} from "@/app/components/icons";

// Define nested tab structure with hrefs
const tabGroups = [
  {
    groupLabel: "User & Access",
    groupId: "userAccess",
    icon: UserCog,
    basePath: "/data-management", // Base path for this group
    subTabs: [
      {
        id: "users",
        label: "Users",
        icon: Users,
        href: "/data-management/users",
      },
      {
        id: "role-status",
        label: "Roles",
        icon: ShieldCheck,
        href: "/data-management/roles", // Assuming this path
      },
    ],
  },
  {
    groupLabel: "Academic Structure",
    groupId: "academicStructure",
    icon: Network,
    basePath: "/data-management/regions", // Base path for this group (e.g., first item)
    subTabs: [
      {
        id: "regions",
        label: "Regions",
        icon: Globe,
        href: "/data-management/regions",
      },
      {
        id: "schools",
        label: "Schools",
        icon: School,
        href: "/data-management/schools",
      },
      {
        id: "departments",
        label: "Departments",
        icon: Building,
        href: "/data-management/departments",
      },
      {
        id: "programs",
        label: "Programs",
        icon: BookCopy,
        href: "/data-management/programs",
      },
    ],
  },
  {
    groupLabel: "Performance Data",
    groupId: "performanceData",
    icon: BarChartHorizontal,
    basePath: "/data-management/statistics", // Base path for this group
    subTabs: [
      {
        id: "national-passing-rates",
        label: "National Rates",
        icon: BarChartHorizontal,
        href: "/data-management/national-passing-rates",
      },
    ],
  },
];

export default function DataManagementLayout({ children }) {
  const pathname = usePathname(); // Get the current path

  // Determine active group and sub-tab based on pathname
  let activeGroupId = null;
  let activeSubTabId = null;

  for (const group of tabGroups) {
    for (const subTab of group.subTabs) {
      // Check if pathname starts with the subTab's href
      // More specific paths should match first if structure allows (e.g., /data-management/users/edit)
      if (pathname.startsWith(subTab.href)) {
        activeGroupId = group.groupId;
        activeSubTabId = subTab.id;
        break; // Found the most specific match
      }
    }
    if (activeGroupId) break; // Stop searching groups if match found
  }

  // Fallback if no sub-tab matches directly (e.g., on /data-management itself)
  // You might want to redirect or select a default group/tab here.
  // For now, we'll try to infer the group based on the base path if no sub-tab matched.
  if (!activeGroupId) {
    const matchingGroup = tabGroups.find((group) =>
      pathname.startsWith(group.basePath)
    );
    if (matchingGroup) {
      activeGroupId = matchingGroup.groupId;
      // Optionally select the first sub-tab of this group as active
      // activeSubTabId = matchingGroup.subTabs[0]?.id;
    } else {
      // Default to the first group if even base path doesn't match
      activeGroupId = tabGroups[0].groupId;
    }
  }

  const activeGroup = tabGroups.find(
    (group) => group.groupId === activeGroupId
  );

  // Assume server is online for now
  const isServerOnline = true;

  return (
    <article>
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-red-800 mb-2">
          Data Management
        </h1>
        <p className="text-base md:text-lg text-gray-600">
          Manage application entities, performance data, and user accounts.
        </p>
      </header>

      {/* Server Error Alert Placeholder */}
      {!isServerOnline && (
        <div className="border-l-4 border-red-600 bg-red-50 text-red-800 px-6 py-4 rounded-md mb-6 flex items-start gap-3">
          {/* TODO: Add AlertTriangle icon */}
          <div>
            <h3 className="font-semibold text-red-800 text-lg">
              Cannot connect to server
            </h3>
            <p className="text-red-700 mt-1">
              Unable to connect. Please check server status.
            </p>
            {/* TODO: Add Try Again button */}
          </div>
        </div>
      )}

      {isServerOnline && (
        <section>
          {/* Primary Tabs (Groups) */}
          <nav className="border-b border-gray-200 mb-4">
            <div className="flex overflow-x-auto hide-scrollbar -mb-px">
              {tabGroups.map((group) => {
                const Icon = group.icon;
                const isGroupActive = activeGroupId === group.groupId;
                // Link to the first sub-tab of the group or a base path if defined
                const groupHref =
                  group.subTabs[0]?.href ||
                  group.basePath ||
                  "/data-management";
                return (
                  <Link
                    key={group.groupId}
                    href={groupHref}
                    className={`flex items-center gap-2 py-3 md:py-4 px-4 md:px-5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-150 ${
                      isGroupActive
                        ? "text-red-700 border-red-700"
                        : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                    }`}
                    aria-current={isGroupActive ? "page" : undefined}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                    {group.groupLabel}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Secondary Tabs (Sub-tabs for active group) */}
          {activeGroup && activeGroup.subTabs.length > 0 && (
            <nav className="mb-6 md:mb-8">
              <div className="flex flex-wrap gap-x-4 gap-y-2 px-1">
                {activeGroup.subTabs.map((subTab) => {
                  const Icon = subTab.icon;
                  const isSubTabActive = activeSubTabId === subTab.id;
                  return (
                    <Link
                      key={subTab.id}
                      href={subTab.href}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                        isSubTabActive
                          ? "bg-red-100 text-red-800 font-medium"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                      }`}
                      aria-current={isSubTabActive ? "true" : undefined}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.5} />
                      {subTab.label}
                    </Link>
                  );
                })}
              </div>
            </nav>
          )}

          {/* Page Content Area */}
          {/* The content of the specific page (e.g., users/page.jsx) will be rendered here */}
          <div className="min-h-[400px]">{children}</div>
        </section>
      )}
    </article>
  );
}
