"use client";

import React, { useState, useRef } from "react";
import dynamic from "next/dynamic"; // Use dynamic import for ApexCharts
import ComparisonTable from "./ComparisonTable";
import ComparisonMetricsCards from "./ComparisonMetricsCards";
import {
  Download,
  FileText,
  BarChart3,
  Table2,
  Info,
  FileSpreadsheet,
} from "@/app/components/icons";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

// Dynamically import ApexCharts only on the client-side
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

// Placeholder for export functions - implement these later if needed
const exportToPDF = async (ref) => {
  if (!ref?.current) return;
  try {
    const canvas = await html2canvas(ref.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    // Fit image to page
    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
    pdf.save("comparison-results.pdf");
  } catch (error) {
    console.error("Error exporting PDF:", error);
    throw error;
  }
};

const exportToExcel = async (data) => {
  try {
    // Flatten the data for export (summary only)
    const { primary, secondary } = data;
    // Helper to format numbers to 2 decimal places (if number)
    const fmt = (val) => (typeof val === "number" ? val.toFixed(2) : val ?? "");
    const fmtPct = (val) =>
      val != null && !isNaN(val) ? `${Number(val).toFixed(2)}%` : "";
    // Metrics definition (copied from ComparisonTable for consistency)
    const metrics = [
      {
        name: "Total Students",
        p: primary?.totalCount,
        s: secondary?.totalCount,
        isPct: false,
        isInverse: false,
      },
      {
        name: "Passed Students",
        p: primary?.passedCount,
        s: secondary?.passedCount,
        isPct: false,
        isInverse: false,
      },
      {
        name: "Failed Students",
        p: primary?.failedCount,
        s: secondary?.failedCount,
        isPct: false,
        isInverse: true,
      },
      {
        name: "Pass Rate",
        p: primary?.passRate,
        s: secondary?.passRate,
        isPct: true,
        isInverse: false,
      },
      {
        name: "Fail Rate",
        p: primary?.failRate,
        s: secondary?.failRate,
        isPct: true,
        isInverse: true,
      },
      {
        name: "First-time Takers",
        p: primary?.firstTimeTakers,
        s: secondary?.firstTimeTakers,
        isPct: false,
        isInverse: false,
      },
      {
        name: "First-time Pass Rate",
        p: primary?.firstTimePassRate,
        s: secondary?.firstTimePassRate,
        isPct: true,
        isInverse: false,
      },
      {
        name: "Retakers",
        p: primary?.retakers,
        s: secondary?.retakers,
        isPct: false,
        isInverse: false,
      },
      {
        name: "Retaker Pass Rate",
        p: primary?.retakerPassRate,
        s: secondary?.retakerPassRate,
        isPct: true,
        isInverse: false,
      },
      {
        name: "Male Students",
        p: primary?.maleCount,
        s: secondary?.maleCount,
        isPct: false,
        isInverse: false,
      },
      {
        name: "Male Distribution",
        p: primary?.malePct,
        s: secondary?.malePct,
        isPct: true,
        isInverse: false,
      },
      {
        name: "Female Students",
        p: primary?.femaleCount,
        s: secondary?.femaleCount,
        isPct: false,
        isInverse: false,
      },
      {
        name: "Female Distribution",
        p: primary?.femalePct,
        s: secondary?.femalePct,
        isPct: true,
        isInverse: false,
      },
    ];
    // Calculate difference (secondary - primary)
    const calcDiff = (s, p, isPct) => {
      if ((s === undefined || s === null) && (p === undefined || p === null))
        return "N/A";
      if ((p === undefined || p === null) && s != null)
        return isPct ? fmtPct(s) : fmt(s);
      if ((s === undefined || s === null) && p != null)
        return isPct ? fmtPct(-p) : fmt(-p);
      const diff = s - p;
      return isPct ? fmtPct(diff) : fmt(diff);
    };
    const rows = metrics.map((m) => ({
      Metric: m.name,
      [primary?.name || "Primary"]: m.isPct ? fmtPct(m.p) : fmt(m.p),
      [secondary?.name || "Secondary"]: m.isPct ? fmtPct(m.s) : fmt(m.s),
      Difference: calcDiff(m.s, m.p, m.isPct),
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Comparison");
    XLSX.writeFile(workbook, "comparison-results.xlsx");
  } catch (error) {
    console.error("Error exporting Excel:", error);
    throw error;
  }
};

export default function ComparisonResults({ results }) {
  const [activeTab, setActiveTab] = useState("summary");
  const [exportLoading, setExportLoading] = useState({
    excel: false,
  });
  const resultsRef = useRef(null);

  if (!results || (!results.primary && !results.secondary)) {
    // This case should ideally be handled by the parent page state,
    // but keep a fallback message.
    return (
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 md:p-8 text-center">
        <Info className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No Data Available</h3>
        <p className="mt-1 text-sm text-gray-500">
          No comparison data found for the selected criteria.
        </p>
      </div>
    );
  }

  const { primary, secondary, primaryNational, secondaryNational } = results;

  // Prepare data for charts
  const getChartOptions = (title) => ({
    chart: {
      type: "bar",
      height: 380,
      toolbar: { show: false },
      fontFamily: "Inter, sans-serif",
    },
    title: {
      text: title,
      align: "left",
      style: {
        fontSize: "16px",
        fontWeight: 600,
        color: "#111827" /* gray-900 */,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 4,
        dataLabels: { position: "top" },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => val?.toFixed(1) + "%",
      offsetY: -20,
      style: { fontSize: "12px", colors: ["#374151" /* gray-700 */] },
    },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      categories: ["Overall", "First-Timers", "Retakers"],
      labels: { style: { fontSize: "12px", colors: "#6b7280" /* gray-500 */ } },
    },
    yaxis: {
      title: {
        text: "Pass Rate (%)",
        style: { fontSize: "12px", color: "#6b7280" },
      },
      min: 0,
      max: 100,
      labels: {
        formatter: (val) => `${val?.toFixed(0)}%`,
        style: { colors: "#6b7280" },
      },
    },
    fill: { opacity: 1 },
    tooltip: { y: { formatter: (val) => val?.toFixed(1) + "%" } },
    legend: {
      position: "top",
      horizontalAlign: "left",
      offsetY: 5,
      fontSize: "13px",
      markers: { radius: 12 },
      itemMargin: { horizontal: 10 },
    },
    // Use Tailwind colors or project-specific colors
    colors: ["#991b1b", "#1e40af", "#047857", "#7e22ce", "#0369a1"], // Example: red-800, blue-800, green-600, purple-600, cyan-600
    grid: {
      borderColor: "#e5e7eb" /* gray-200 */,
      strokeDashArray: 4,
      yaxis: { lines: { show: true } },
    },
  });

  const passRateChartSeries = [
    {
      name: primary?.name || "Primary",
      data: [
        primary?.passRate,
        primary?.firstTimePassRate,
        primary?.retakerPassRate,
      ].map((v) => v ?? 0),
    },
    {
      name: secondary?.name || "Secondary",
      data: [
        secondary?.passRate,
        secondary?.firstTimePassRate,
        secondary?.retakerPassRate,
      ].map((v) => v ?? 0),
    },
    ...(primaryNational
      ? [
          {
            name: "Primary National",
            data: [primaryNational.passing_rate ?? 0, 0, 0],
          },
        ]
      : []),
    ...(secondaryNational
      ? [
          {
            name: "Secondary National",
            data: [secondaryNational.passing_rate ?? 0, 0, 0],
          },
        ]
      : []),
  ];

  const genderChartOptions = {
    ...getChartOptions("Gender Distribution (%)"), // Reuse base options
    xaxis: {
      categories: ["Male", "Female"],
      labels: { style: { fontSize: "12px", colors: "#6b7280" } },
    },
    yaxis: {
      title: { text: "Distribution (%)" },
      min: 0,
      max: 100,
      labels: {
        formatter: (val) => `${val?.toFixed(0)}%`,
        style: { colors: "#6b7280" },
      },
    },
    dataLabels: { formatter: (val) => val?.toFixed(1) + "%" },
  };

  const genderChartSeries = [
    {
      name: primary?.name || "Primary",
      data: [primary?.malePct, primary?.femalePct].map((v) => v ?? 0),
    },
    {
      name: secondary?.name || "Secondary",
      data: [secondary?.malePct, secondary?.femalePct].map((v) => v ?? 0),
    },
  ];

  // Simplified Export Handlers (implement actual logic later)
  const handleExport = async (exportFn, type) => {
    setExportLoading((prev) => ({ ...prev, [type]: true }));
    try {
      await exportFn(results);
      // Add success notification if needed
    } catch (error) {
      console.error(`Error during ${type} export:`, error);
      // Add error notification if needed
    } finally {
      setExportLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const renderTabs = () => (
    <nav className="flex border-b border-gray-200 mb-6">
      <button
        onClick={() => setActiveTab("summary")}
        className={`py-3 px-4 md:px-5 text-sm font-medium flex items-center gap-2 transition-colors duration-150 ${
          activeTab === "summary"
            ? "border-b-2 border-red-700 text-red-700"
            : "border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
        }`}
      >
        <BarChart3 className="h-4 w-4" /> Summary & Charts
      </button>
      <button
        onClick={() => setActiveTab("table")}
        className={`py-3 px-4 md:px-5 text-sm font-medium flex items-center gap-2 transition-colors duration-150 ${
          activeTab === "table"
            ? "border-b-2 border-red-700 text-red-700"
            : "border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
        }`}
      >
        <Table2 className="h-4 w-4" /> Detailed Table
      </button>
    </nav>
  );

  const renderExportButtons = () => (
    <div className="flex flex-wrap gap-2 justify-start md:justify-end mb-4 md:mb-0">
      <button
        onClick={() => handleExport(exportToExcel, "excel")}
        disabled={exportLoading.excel}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-green-600 rounded-md text-green-700 bg-green-50 hover:bg-green-100 disabled:opacity-50"
      >
        <FileSpreadsheet className="h-3.5 w-3.5" />{" "}
        {exportLoading.excel ? "Exporting..." : "Export Excel"}
      </button>
    </div>
  );

  return (
    <div
      ref={resultsRef}
      className="bg-white border border-gray-100 rounded-xl p-6 md:p-8"
    >
      <header className="flex flex-col md:flex-row justify-between md:items-center mb-4 border-b border-gray-100 pb-4">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-0">
          Comparison Results
        </h2>
        {renderExportButtons()}
      </header>

      {renderTabs()}

      {activeTab === "summary" && (
        <div className="space-y-6 md:space-y-8">
          <ComparisonMetricsCards
            primary={primary}
            secondary={secondary}
            primaryNational={primaryNational}
            secondaryNational={secondaryNational}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {typeof window !== "undefined" && (
              <>
                <Chart
                  options={getChartOptions("Pass Rate Comparison (%)")}
                  series={passRateChartSeries}
                  type="bar"
                  height={380}
                />
                <Chart
                  options={genderChartOptions}
                  series={genderChartSeries}
                  type="bar"
                  height={380}
                />
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === "table" && (
        <ComparisonTable
          primary={primary}
          secondary={secondary}
          primaryNational={primaryNational}
          secondaryNational={secondaryNational}
        />
      )}
    </div>
  );
}
