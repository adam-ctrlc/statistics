import React from "react";
import {
  Users,
  GraduationCap,
  Percent,
  Repeat,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
} from "@/app/components/icons";

const ComparisonMetricsCards = ({
  primary,
  secondary,
  primaryNational,
  secondaryNational,
}) => {
  // Function to safely format a value
  const safeFormat = (value, formatFn, unit = "") => {
    if (value === undefined || value === null) return "N/A";
    if (value === 0) return "0" + unit;
    return formatFn(value) + unit;
  };

  // Calculate the difference and determine if it's positive or negative
  const calculateDifference = (
    secondaryValue,
    primaryValue,
    isInverse = false
  ) => {
    // Handle null or undefined values
    if (
      secondaryValue === undefined ||
      secondaryValue === null ||
      primaryValue === undefined ||
      primaryValue === null
    ) {
      return { value: "N/A", isPositive: false };
    }

    const diff = secondaryValue - primaryValue;
    const formattedDiff = diff.toFixed(1);

    // For metrics where lower is better (like gender gap), we invert the color logic
    const isPositive = isInverse ? diff < 0 : diff > 0;

    return {
      value: formattedDiff,
      isPositive,
    };
  };

  // Define key metrics for the cards
  const metrics = [
    {
      name: "Total Students",
      icon: Users,
      iconColor: "text-blue-600",
      primaryValue: primary?.totalCount,
      secondaryValue: secondary?.totalCount,
      format: (val) => val,
      isInverse: false,
      unit: "",
    },
    {
      name: "Pass Rate",
      icon: Percent,
      iconColor: "text-green-600",
      primaryValue: primary?.passRate,
      secondaryValue: secondary?.passRate,
      format: (val) => val.toFixed(1),
      isInverse: false,
      unit: "%",
    },
    {
      name: "First-time Takers",
      icon: GraduationCap,
      iconColor: "text-purple-600",
      primaryValue: primary?.firstTimeTakers,
      secondaryValue: secondary?.firstTimeTakers,
      format: (val) => val,
      isInverse: false,
      unit: "",
    },
    {
      name: "First-time Pass Rate",
      icon: GraduationCap,
      iconColor: "text-purple-600",
      primaryValue: primary?.firstTimePassRate,
      secondaryValue: secondary?.firstTimePassRate,
      format: (val) => val?.toFixed(1),
      isInverse: false,
      unit: "%",
    },
    {
      name: "Retakers",
      icon: Repeat,
      iconColor: "text-amber-600",
      primaryValue: primary?.retakers,
      secondaryValue: secondary?.retakers,
      format: (val) => val,
      isInverse: false,
      unit: "",
    },
    {
      name: "Retaker Pass Rate",
      icon: Repeat,
      iconColor: "text-amber-600",
      primaryValue: primary?.retakerPassRate,
      secondaryValue: secondary?.retakerPassRate,
      format: (val) => val?.toFixed(1),
      isInverse: false,
      unit: "%",
    },
    {
      name: "Male Students",
      icon: Users,
      iconColor: "text-blue-600",
      primaryValue: primary?.maleCount,
      secondaryValue: secondary?.maleCount,
      format: (val) => val,
      isInverse: false,
      unit: "",
    },
    {
      name: "Male Distribution",
      icon: Users,
      iconColor: "text-blue-600",
      primaryValue: primary?.malePct,
      secondaryValue: secondary?.malePct,
      format: (val) => val?.toFixed(1),
      isInverse: false,
      unit: "%",
    },
    {
      name: "Female Students",
      icon: Users,
      iconColor: "text-pink-600",
      primaryValue: primary?.femaleCount,
      secondaryValue: secondary?.femaleCount,
      format: (val) => val,
      isInverse: false,
      unit: "",
    },
    {
      name: "Female Distribution",
      icon: Users,
      iconColor: "text-pink-600",
      primaryValue: primary?.femalePct,
      secondaryValue: secondary?.femalePct,
      format: (val) => val?.toFixed(1),
      isInverse: false,
      unit: "%",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main comparison metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => {
          const diff = calculateDifference(
            metric.secondaryValue,
            metric.primaryValue,
            metric.isInverse
          );
          const IconComponent = metric.icon;

          return (
            <div
              key={index}
              className="bg-white overflow-hidden border border-gray-100 rounded-lg"
            >
              <div className="p-4 md:p-5">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 p-2 bg-gray-100 rounded-md ${
                      metric.iconColor
                        ? metric.iconColor
                            .replace("text-", "bg-")
                            .replace("-600", "-100")
                        : "bg-gray-100"
                    }`}
                  >
                    <IconComponent
                      className={`h-5 w-5 ${
                        metric.iconColor || "text-gray-600"
                      }`}
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <dt className="text-sm font-medium text-gray-500 truncate mb-1">
                      {metric.name}
                    </dt>
                    <dd className="flex flex-col">
                      {/* Primary vs Secondary */}
                      <div className="flex items-baseline text-lg md:text-xl font-semibold text-gray-900 mb-1">
                        <span>
                          {safeFormat(
                            metric.primaryValue,
                            metric.format,
                            metric.unit
                          )}
                        </span>
                        <ArrowRight
                          className="h-3 w-3 text-gray-400 mx-1.5 flex-shrink-0"
                          strokeWidth={2}
                        />
                        <span>
                          {safeFormat(
                            metric.secondaryValue,
                            metric.format,
                            metric.unit
                          )}
                        </span>
                      </div>
                      {/* Difference */}
                      <div className="flex items-center text-xs font-medium">
                        {diff.value === "N/A" ? (
                          <span className="text-gray-500 flex items-center gap-1">
                            <Minus className="h-3 w-3" />
                            N/A
                          </span>
                        ) : (
                          <>
                            {diff.isPositive ? (
                              <TrendingUp
                                className="h-3.5 w-3.5 mr-1 text-green-500"
                                strokeWidth={2}
                              />
                            ) : (
                              <TrendingDown
                                className="h-3.5 w-3.5 mr-1 text-red-500"
                                strokeWidth={2}
                              />
                            )}
                            <span
                              className={
                                diff.isPositive
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {diff.value > 0 ? "+" : ""}
                              {diff.value}
                              {metric.unit}
                            </span>
                            <span className="ml-1 text-gray-500"> change</span>
                          </>
                        )}
                      </div>
                    </dd>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* National comparison cards */}
      {(primaryNational || secondaryNational) && (
        <div className="pt-4">
          <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-3 border-t border-gray-100 pt-4">
            National Comparisons
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {primaryNational && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <TrendingUp
                    className="h-4 w-4 text-red-600 mr-2"
                    strokeWidth={1.5}
                  />
                  <h4 className="text-sm font-semibold text-red-800">
                    {primary?.name || "Primary Program"} vs National
                  </h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Month/Year:</span>
                    <span className="text-sm font-medium">
                      {primaryNational.month} {primaryNational.year}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      National Pass Rate:
                    </span>
                    <span className="text-sm font-medium">
                      {primaryNational.passing_rate}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Program Pass Rate:
                    </span>
                    <span className="text-sm font-medium">
                      {primary?.passRate?.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-red-100 pt-2 mt-2">
                    <span className="text-sm font-medium text-gray-700">
                      Difference:
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        primary?.passRate - primaryNational.passing_rate >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {(
                        primary?.passRate - primaryNational.passing_rate
                      )?.toFixed(1)}
                      %
                    </span>
                  </div>
                </div>
              </div>
            )}

            {secondaryNational && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <TrendingUp
                    className="h-4 w-4 text-blue-600 mr-2"
                    strokeWidth={1.5}
                  />
                  <h4 className="text-sm font-semibold text-blue-800">
                    {secondary?.name || "Secondary Program"} vs National
                  </h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Month/Year:</span>
                    <span className="text-sm font-medium">
                      {secondaryNational.month} {secondaryNational.year}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      National Pass Rate:
                    </span>
                    <span className="text-sm font-medium">
                      {secondaryNational.passing_rate}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Program Pass Rate:
                    </span>
                    <span className="text-sm font-medium">
                      {secondary?.passRate?.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-blue-100 pt-2 mt-2">
                    <span className="text-sm font-medium text-gray-700">
                      Difference:
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        secondary?.passRate - secondaryNational.passing_rate >=
                        0
                          ? "text-green-600"
                          : "text-blue-600"
                      }`}
                    >
                      {(
                        secondary?.passRate - secondaryNational.passing_rate
                      )?.toFixed(1)}
                      %
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonMetricsCards;
