"use client";

import React from "react";
import { useDataManagement } from "../../services/dataManagement/dataManagementService";
import { Database } from "@/app/components/icons";

export default function DataManagementBasePage() {
  const {
    statistics,
    nationalPassingRates,
    programs,
    departments,
    schools,
    regions,
    roles,
    users,
    loading,
    error,
  } = useDataManagement();

  if (loading)
    return (
      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600">Loading data...</p>
      </div>
    );
  if (error)
    return (
      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-red-600">Error loading data: {error.message}</p>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-700 mb-3">
        Data Management Hub
      </h2>
      <p className="text-gray-600 mb-6">
        Select a management section from the navigation above to view or edit
        data.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DataCard
          title="Statistics Data"
          count={statistics?.length || 0}
          icon={<Database className="h-5 w-5 text-blue-600" />}
        />
        <DataCard
          title="National Passing Rates"
          count={nationalPassingRates?.length || 0}
          icon={<Database className="h-5 w-5 text-blue-600" />}
        />
        <DataCard
          title="Programs"
          count={programs?.length || 0}
          icon={<Database className="h-5 w-5 text-blue-600" />}
        />
        <DataCard
          title="Departments"
          count={departments?.length || 0}
          icon={<Database className="h-5 w-5 text-blue-600" />}
        />
        <DataCard
          title="Schools"
          count={schools?.length || 0}
          icon={<Database className="h-5 w-5 text-blue-600" />}
        />
        <DataCard
          title="Regions"
          count={regions?.length || 0}
          icon={<Database className="h-5 w-5 text-blue-600" />}
        />
        <DataCard
          title="Roles"
          count={roles?.length || 0}
          icon={<Database className="h-5 w-5 text-blue-600" />}
        />
        <DataCard
          title="Users"
          count={users?.length || 0}
          icon={<Database className="h-5 w-5 text-blue-600" />}
        />
      </div>
    </div>
  );
}

function DataCard({ title, count, icon }) {
  return (
    <div className="bg-white p-4 rounded border border-gray-200 flex items-center gap-3">
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <h3 className="font-medium text-gray-700">{title}</h3>
        <p className="text-gray-500">{count} records</p>
      </div>
    </div>
  );
}
