import React from "react";
import { TrendingUp, TrendingDown, Minus } from "@/app/components/icons";

const ComparisonTable = ({
  primary,
  secondary,
  primaryNational,
  secondaryNational,
}) => {
  // Check if we have valid data
  if (!primary || !secondary) {
    return (
      <div className="bg-white rounded-md p-4 text-center text-gray-500">
        Comparison data is incomplete or missing.
      </div>
    );
  }

  // Function to safely format a value
  const safeFormat = (value, formatFn, unit = "") => {
    if (value === undefined || value === null) return "N/A";
    if (value === 0) return "0" + unit;
    return formatFn(value) + unit;
  };

  // Function to calculate and format difference with proper sign
  const calculateDifference = (
    secondaryValue,
    primaryValue,
    isInverse = false
  ) => {
    // Both missing
    if (
      (secondaryValue === undefined || secondaryValue === null) &&
      (primaryValue === undefined || primaryValue === null)
    ) {
      return { value: "N/A", isPositive: false, isNeutral: true };
    }
    // Only secondary present
    if (
      (primaryValue === undefined || primaryValue === null) &&
      secondaryValue !== undefined &&
      secondaryValue !== null
    ) {
      return {
        value:
          (typeof secondaryValue === "number"
            ? secondaryValue.toFixed(1)
            : secondaryValue) || "0.0",
        isPositive: false,
        isNeutral: true,
      };
    }
    // Only primary present
    if (
      (secondaryValue === undefined || secondaryValue === null) &&
      primaryValue !== undefined &&
      primaryValue !== null
    ) {
      return {
        value:
          (typeof primaryValue === "number"
            ? (-primaryValue).toFixed(1)
            : -primaryValue) || "0.0",
        isPositive: false,
        isNeutral: true,
      };
    }
    // Both present
    const diff = secondaryValue - primaryValue;
    const formattedDiff = diff.toFixed(1);
    // For metrics where lower is better (like gender gap), we invert the color logic
    const isPositive = isInverse ? diff < 0 : diff > 0;
    return {
      value: formattedDiff,
      isPositive,
      isNeutral: false,
    };
  };

  // Define all metrics to compare
  const metrics = [
    {
      name: "Total Students",
      primaryValue: primary?.totalCount,
      secondaryValue: secondary?.totalCount,
      format: (val) => val,
      isInverse: false,
      unit: "",
    },
    {
      name: "Passed Students",
      primaryValue: primary?.passedCount,
      secondaryValue: secondary?.passedCount,
      format: (val) => val,
      isInverse: false,
      unit: "",
    },
    {
      name: "Failed Students",
      primaryValue: primary?.failedCount,
      secondaryValue: secondary?.failedCount,
      format: (val) => val,
      isInverse: true,
      unit: "",
    },
    {
      name: "Pass Rate",
      primaryValue: primary?.passRate,
      secondaryValue: secondary?.passRate,
      format: (val) => val.toFixed(1),
      isInverse: false,
      unit: "%",
    },
    {
      name: "Fail Rate",
      primaryValue: primary?.failRate,
      secondaryValue: secondary?.failRate,
      format: (val) => val.toFixed(1),
      isInverse: true,
      unit: "%",
    },
    {
      name: "First-time Takers",
      primaryValue: primary?.firstTimeTakers,
      secondaryValue: secondary?.firstTimeTakers,
      format: (val) => val,
      isInverse: false,
      unit: "",
    },
    {
      name: "First-time Pass Rate",
      primaryValue: primary?.firstTimePassRate,
      secondaryValue: secondary?.firstTimePassRate,
      format: (val) => val?.toFixed(1),
      isInverse: false,
      unit: "%",
    },
    {
      name: "Retakers",
      primaryValue: primary?.retakers,
      secondaryValue: secondary?.retakers,
      format: (val) => val,
      isInverse: false,
      unit: "",
    },
    {
      name: "Retaker Pass Rate",
      primaryValue: primary?.retakerPassRate,
      secondaryValue: secondary?.retakerPassRate,
      format: (val) => val?.toFixed(1),
      isInverse: false,
      unit: "%",
    },
    {
      name: "Male Students",
      primaryValue: primary?.maleCount,
      secondaryValue: secondary?.maleCount,
      format: (val) => val,
      isInverse: false,
      unit: "",
    },
    {
      name: "Male Distribution",
      primaryValue: primary?.malePct,
      secondaryValue: secondary?.malePct,
      format: (val) => val?.toFixed(1),
      isInverse: false,
      unit: "%",
    },
    {
      name: "Female Students",
      primaryValue: primary?.femaleCount,
      secondaryValue: secondary?.femaleCount,
      format: (val) => val,
      isInverse: false,
      unit: "",
    },
    {
      name: "Female Distribution",
      primaryValue: primary?.femalePct,
      secondaryValue: secondary?.femalePct,
      format: (val) => val?.toFixed(1),
      isInverse: false,
      unit: "%",
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Metric
            </th>
            <th
              scope="col"
              className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {primary?.name || "Program A"}
              <span className="block text-xs normal-case text-gray-400">
                {primary?.school || "All Schools"}
              </span>
            </th>
            <th
              scope="col"
              className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {secondary?.name || "Program B"}
              <span className="block text-xs normal-case text-gray-400">
                {secondary?.school || "All Schools"}
              </span>
            </th>
            <th
              scope="col"
              className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Difference
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {metrics.map((metric, index) => {
            const diff = calculateDifference(
              metric.secondaryValue,
              metric.primaryValue,
              metric.isInverse
            );

            return (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
              >
                <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                  {metric.name}
                </td>
                <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                  {safeFormat(metric.primaryValue, metric.format, metric.unit)}
                </td>
                <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                  {safeFormat(
                    metric.secondaryValue,
                    metric.format,
                    metric.unit
                  )}
                </td>
                <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-right">
                  {diff.value === "N/A" ? (
                    <span className="text-gray-400 flex items-center justify-end gap-1">
                      <Minus className="h-3.5 w-3.5" /> N/A
                    </span>
                  ) : diff.isNeutral ? (
                    <span className="flex items-center justify-end gap-1">
                      <span className="font-medium text-gray-500">
                        {diff.value}
                        {metric.unit}
                      </span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-end gap-1">
                      {diff.value !== "0.0" &&
                        (diff.isPositive ? (
                          <TrendingUp
                            className="h-3.5 w-3.5 text-green-500"
                            strokeWidth={2}
                          />
                        ) : (
                          <TrendingDown
                            className="h-3.5 w-3.5 text-red-500"
                            strokeWidth={2}
                          />
                        ))}
                      <span
                        className={`font-medium ${
                          diff.isPositive
                            ? "text-green-600"
                            : diff.value === "0.0"
                            ? "text-gray-500"
                            : "text-red-600"
                        }`}
                      >
                        {diff.value > 0 ? "+" : ""}
                        {diff.value}
                        {metric.unit}
                      </span>
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable;
