"use client";

import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import TableActions from "./components/TableActions";
import TableFilters from "./components/TableFilters";
import StudentTable from "./components/StudentTable";
import StudentFormModal from "./components/StudentFormModal";
import NotAllowedModal from "./components/NotAllowedModal";
import DeleteConfirmationModal from "./components/DeleteConfirmationModal";
import ExcelInstructionsModal from "./components/ExcelInstructionsModal";
import IndeterminateCheckbox from "./components/IndeterminateCheckbox";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";
import { createColumnHelper } from "@tanstack/react-table";
import { Edit, Trash2 } from "@/app/components/icons";
import {
  useStatisticsData,
  useStatisticsDataMutations,
  useStatisticsYears,
} from "../../services/hooks";
import { usePrograms, useSchools } from "../../services/hooks";
import { statisticsDataService } from "../../services/statisticsDataService";
import ImportErrorModal from "./components/ImportErrorModal";
import { useAuth, useProfile } from "../../services/hooks";
import Loading from "@/app/components/Loading";

const columnsToggleList = [
  { id: "name", label: "Name" },
  { id: "gender", label: "Gender" },
  { id: "program_id", label: "Program" },
  { id: "school_id", label: "School" },
  { id: "took_board_exam", label: "Took Board Exam" },
  { id: "exam_details", label: "Exam Details" },
  { id: "status", label: "Status" },
  { id: "retake_details", label: "Retake Info" },
  { id: "actions", label: "Actions" },
];

const columnHelper = createColumnHelper();

const DEFAULT_PAGE_SIZE = 10;

export default function TablePage() {
  const [showNotAllowedModal, setShowNotAllowedModal] = useState(false);
  // Get current user profile
  const {
    data: user,
    isLoading: profileLoading,
    error: profileError,
  } = useProfile();

  // Determine permissions
  const isViewer = user?.role_id?.role === "viewer";

  // Use new hooks for data
  const { data: programsData, isLoading: programsLoading } = usePrograms();
  const { data: schoolsData, isLoading: schoolsLoading } = useSchools();
  const { data: yearsData, isLoading: yearsLoading } = useStatisticsYears();
  const mutations = useStatisticsDataMutations();

  const programs = programsData || [];
  const schools = schoolsData || [];
  const examYears = Array.isArray(yearsData)
    ? yearsData
    : Array.isArray(yearsData?.years)
    ? yearsData.years
    : [];

  const [statisticsData, setStatisticsData] = useState([]);
  const [reloadFlag, setReloadFlag] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const isInitialLoading = programsLoading || schoolsLoading || yearsLoading;
  const [fetchError, setFetchError] = useState(null);

  const [globalFilter, setGlobalFilter] = useState("");
  const [programFilter, setProgramFilter] = useState([]);
  const [schoolFilter, setSchoolFilter] = useState([]);
  const [examStatusFilter, setExamStatusFilter] = useState("");
  const [examYearFilter, setExamYearFilter] = useState([]);
  const [genderFilter, setGenderFilter] = useState("");
  const [retakeFilter, setRetakeFilter] = useState("");
  const [tookExamFilter, setTookExamFilter] = useState("");

  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
    totalPages: 1,
    total: 0,
  });
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState({});

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isImportErrorModalOpen, setIsImportErrorModalOpen] = useState(false);
  const [importErrors, setImportErrors] = useState([]);

  const isAdmin = user?.role_id?.role?.toLowerCase() === "admin";

  const fetchControllerRef = useRef(null);

  const getProgramName = useCallback(
    (programId) => {
      const prog = programs.find((p) => p._id === programId);
      return prog ? prog.program : "Unknown";
    },
    [programs]
  );

  const getSchoolName = useCallback(
    (schoolId) => {
      const school = schools.find((s) => s._id === schoolId);
      return school ? school.school : "Unknown";
    },
    [schools]
  );

  const clearAllFilters = useCallback(() => {
    setGlobalFilter("");
    setProgramFilter(programs.map((p) => p._id));
    setSchoolFilter(schools.map((s) => s._id));
    setExamStatusFilter("");
    const validExamYears = Array.isArray(examYears)
      ? examYears.filter((year) => year != null && year !== undefined)
      : [];
    setExamYearFilter(validExamYears);
    setGenderFilter("");
    setRetakeFilter("");
    setTookExamFilter("");
    setSorting([]);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    toast.success("Filters cleared");
  }, [programs, schools, examYears]);

  const hasActiveFilters = useMemo(() => {
    const allProgramsSelected = programFilter.length === programs.length;
    const allSchoolsSelected = schoolFilter.length === schools.length;
    const validExamYears = Array.isArray(examYears)
      ? examYears.filter((year) => year != null && year !== undefined)
      : [];
    const allYearsSelected = examYearFilter.length === validExamYears.length;

    return (
      globalFilter ||
      !allProgramsSelected ||
      !allSchoolsSelected ||
      examStatusFilter ||
      !allYearsSelected ||
      genderFilter ||
      retakeFilter ||
      tookExamFilter
    );
  }, [
    globalFilter,
    programFilter,
    programs.length,
    schoolFilter,
    schools.length,
    examStatusFilter,
    examYearFilter,
    examYears.length,
    genderFilter,
    retakeFilter,
    tookExamFilter,
  ]);

  // Initialize filters when data is loaded
  useEffect(() => {
    if (!isInitialLoading && programs.length > 0) {
      setProgramFilter(programs.map((p) => p._id));
    }
  }, [programs, isInitialLoading]);

  useEffect(() => {
    if (!isInitialLoading && schools.length > 0) {
      setSchoolFilter(schools.map((s) => s._id));
    }
  }, [schools, isInitialLoading]);

  useEffect(() => {
    if (!isInitialLoading && Array.isArray(examYears) && examYears.length > 0) {
      setExamYearFilter(
        examYears.filter((year) => year != null && year !== undefined)
      );
    }
  }, [examYears, isInitialLoading]);

  // Build filters for statistics data
  const statisticsFilters = useMemo(() => {
    const filters = {};
    if (globalFilter) filters.globalFilter = globalFilter;
    if (programFilter.length !== programs.length)
      filters.programId = programFilter;
    if (schoolFilter.length !== schools.length) filters.schoolId = schoolFilter;
    const validExamYears = Array.isArray(examYears)
      ? examYears.filter((year) => year != null && year !== undefined)
      : [];
    if (examYearFilter.length !== validExamYears.length)
      filters.year = examYearFilter;
    if (examStatusFilter) filters.examStatusFilter = examStatusFilter;
    if (genderFilter) filters.genderFilter = genderFilter;
    if (retakeFilter) filters.retakeFilter = retakeFilter;
    if (tookExamFilter) filters.tookExamFilter = tookExamFilter;
    filters.page = pagination.pageIndex + 1;
    filters.limit = pagination.pageSize;
    return filters;
  }, [
    globalFilter,
    programFilter,
    programs.length,
    schoolFilter,
    schools.length,
    examYearFilter,
    examYears.length,
    examStatusFilter,
    genderFilter,
    retakeFilter,
    tookExamFilter,
    pagination.pageIndex,
    pagination.pageSize,
    reloadFlag,
  ]);

  // Use statistics data hook
  const {
    data: statisticsResponse,
    isLoading: isStatsLoading,
    error: statsError,
  } = useStatisticsData(isInitialLoading ? {} : statisticsFilters);

  // Update state when data changes
  useEffect(() => {
    if (statisticsResponse && !isStatsLoading) {
      const transformedStats = (statisticsResponse.data || []).map((stat) => ({
        ...stat,
        school_id: stat.school_id?._id || stat.school_id,
        program_id: stat.program_id?._id || stat.program_id,
      }));
      setStatisticsData(transformedStats);
      setPagination((prev) => ({
        ...prev,
        totalPages: statisticsResponse.totalPages || 1,
        total: statisticsResponse.total || 0,
      }));
      setIsLoading(false);
      setFetchError(null);
    }
  }, [statisticsResponse, isStatsLoading]);

  // Handle errors
  useEffect(() => {
    if (statsError) {
      setFetchError(statsError.message || "Failed to load statistics data");
      setStatisticsData([]);
      setIsLoading(false);
    }
  }, [statsError]);

  // Set loading state
  useEffect(() => {
    setIsLoading(isStatsLoading || isInitialLoading);
  }, [isStatsLoading, isInitialLoading]);

  const handleAdd = useCallback(() => {
    setIsEditing(false);
    setSelectedRecord(null);
    setIsFormModalOpen(true);
  }, []);

  const handleEdit = useCallback(async (record) => {
    setSelectedRecord({ _id: record._id });
    setIsEditing(true);
    setIsFormModalOpen(true);
  }, []);

  const handleDeleteConfirmation = useCallback((record) => {
    setSelectedRecord(record);
    setIsDeleteModalOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!selectedRecord || !selectedRecord._id) return;

    const originalData = [...statisticsData];
    const recordId = selectedRecord._id;

    setStatisticsData((prevData) => prevData.filter((r) => r._id !== recordId));
    setIsDeleteModalOpen(false);
    setSelectedRecord(null);
    const toastId = toast.loading("Deleting record...");

    const response = await statisticsDataService.remove(recordId);

    if (response.error) {
      toast.error(`Failed to delete: ${response.error}`, { id: toastId });
      setStatisticsData(originalData);
    } else {
      toast.success("Record deleted successfully!", { id: toastId });
      setReloadFlag((f) => f + 1);
    }
  }, [selectedRecord, statisticsData]);

  const handleFormSubmit = useCallback(
    async (formData) => {
      const toastId = toast.loading(
        isEditing ? "Updating record..." : "Creating record..."
      );
      const originalData = [...statisticsData];
      let optimisticUpdateApplied = false;

      try {
        let response;
        let updatedRecordData;

        if (isEditing && selectedRecord?._id) {
          const recordId = selectedRecord._id;
          setStatisticsData((prevData) =>
            prevData.map((r) =>
              r._id === recordId
                ? {
                    ...r,
                    ...formData,
                    took_board_exam: Boolean(formData.took_board_exam),
                    retake: Boolean(formData.retake),
                    _id: r._id,
                  }
                : r
            )
          );
          optimisticUpdateApplied = true;

          response = await statisticsDataService.update(recordId, formData);
          updatedRecordData = response.data;

          if (response.error) throw new Error(response.error);

          const transformedUpdatedRecord = {
            ...updatedRecordData,
            school_id:
              updatedRecordData.school_id?._id || updatedRecordData.school_id,
            program_id:
              updatedRecordData.program_id?._id || updatedRecordData.program_id,
          };
          setStatisticsData((prevData) =>
            prevData.map((r) =>
              r._id === recordId ? transformedUpdatedRecord : r
            )
          );
          toast.success("Record updated successfully!", { id: toastId });
        } else {
          response = await statisticsDataService.create(formData);
          updatedRecordData = response.data;

          if (response.error) throw new Error(response.error);

          const transformedCreatedRecord = {
            ...updatedRecordData,
            school_id:
              updatedRecordData.school_id?._id || updatedRecordData.school_id,
            program_id:
              updatedRecordData.program_id?._id || updatedRecordData.program_id,
          };
          setStatisticsData((prevData) => [...prevData, transformedCreatedRecord]);
          toast.success("Record created successfully!", { id: toastId });
        }

        setIsFormModalOpen(false);
        setSelectedRecord(null);
        setIsEditing(false);
        setReloadFlag((f) => f + 1);
      } catch (err) {
        toast.error(`Operation failed: ${err.message}`, { id: toastId });
        if (optimisticUpdateApplied) {
          setStatisticsData(originalData);
        }
      }
    },
    [isEditing, selectedRecord, statisticsData]
  );

  const handleModalCancel = useCallback(() => {
    setIsFormModalOpen(false);
    setSelectedRecord(null);
    setIsEditing(false);
  }, []);

  const handleExportExcel = useCallback(async () => {
    if (statisticsData.length === 0) {
      toast.error("No data available to export.");
      return;
    }

    const toastId = toast.loading("Preparing export...");
    const filters = {};
    if (globalFilter) filters.globalFilter = globalFilter;
    if (programFilter.length !== programs.length)
      filters.programId = programFilter;
    if (schoolFilter.length !== schools.length) filters.schoolId = schoolFilter;
    if (examYearFilter.length !== examYears.length)
      filters.year = examYearFilter;
    if (examStatusFilter) filters.examStatusFilter = examStatusFilter;
    if (genderFilter) filters.genderFilter = genderFilter;
    if (retakeFilter) filters.retakeFilter = retakeFilter;
    if (tookExamFilter) filters.tookExamFilter = tookExamFilter;

    try {
      const result = await statisticsDataService.exportData(filters);
      const data = result.data;

      if (!data) throw new Error("No data returned from export");
      let exportRows = Array.isArray(data) ? data : data?.data;
      if (!exportRows || exportRows.length === 0) {
        throw new Error("No data returned from export endpoint");
      }

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Student Statistics");
      const fileName = `student_statistics_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast.success("Data exported successfully!", { id: toastId });
    } catch (error) {
      console.error("Error exporting Excel:", error);
      toast.error(`An error occurred during Excel export: ${error.message}`, {
        id: toastId,
      });
    }
  }, [
    statisticsData.length,
    globalFilter,
    programFilter,
    programs.length,
    schoolFilter,
    schools.length,
    examStatusFilter,
    examYearFilter,
    examYears.length,
    genderFilter,
    retakeFilter,
    tookExamFilter,
  ]);

  const handleExcelInstructions = useCallback(() => {
    setIsExcelModalOpen(true);
  }, []);

  const handleCloseExcelModal = useCallback(() => {
    setIsExcelModalOpen(false);
  }, []);

  const handleOpenFilePicker = useCallback(() => {
    document.getElementById("excel-upload")?.click();
  }, []);

  const handleExcelFileChange = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading("Reading Excel file...");
    console.log("Excel file selected:", file.name);

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length < 2) {
          throw new Error("Excel file is empty or has no data rows.");
        }

        const headers = jsonData[0].map((h) => String(h).trim().toLowerCase());
        const expectedHeaders = [
          "last name",
          "first name",
          "school name",
          "gender",
          "program name",
          "took board exam",
          "exam month",
          "exam year",
          "status",
          "retake",
          "retake times",
        ];
        const missingHeaders = expectedHeaders.filter(
          (eh) => !headers.includes(eh)
        );
        if (missingHeaders.length > 0) {
          throw new Error("Excel header validation failed", {
            cause: missingHeaders.map((h) => `Missing expected column: ${h}`),
          });
        }

        const hasMiddleName = headers.includes("middle name");
        const headerMap = {
          "last name": "last_name",
          "first name": "first_name",
          ...(hasMiddleName ? { "middle name": "middle_name" } : {}),
          "school name": "school_name",
          gender: "gender",
          "program name": "program_name",
          "took board exam": "took_board_exam",
          "exam month": "exam_month_taken",
          "exam year": "exam_year_taken",
          status: "status",
          retake: "retake",
          "retake times": "retake_times",
        };

        const recordsToImport = [];
        const allRowValidationErrors = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          const record = {};
          let isEmptyRow = true;
          row.forEach((value, index) => {
            const header = headers[index];
            if (header) {
              const modelKey = headerMap[header];
              if (modelKey) {
                const cleanedValue = String(value).trim();
                record[modelKey] = cleanedValue !== "" ? cleanedValue : null;
                if (record[modelKey] !== null && record[modelKey] !== "") {
                  isEmptyRow = false;
                }
              }
            }
          });

          if (isEmptyRow) continue;

          const rowErrors = [];
          if (!record.last_name)
            rowErrors.push(`Row ${i + 1}: Last name missing.`);
          if (!record.first_name)
            rowErrors.push(`Row ${i + 1}: First name missing.`);
          if (!record.school_name)
            rowErrors.push(`Row ${i + 1}: School name missing.`);
          if (!record.program_name)
            rowErrors.push(`Row ${i + 1}: Program name missing.`);
          if (!record.gender) rowErrors.push(`Row ${i + 1}: Gender missing.`);

          if (rowErrors.length > 0) {
            allRowValidationErrors.push(...rowErrors);
            continue;
          }

          // Normalize boolean fields for backend compatibility
          if ("took_board_exam" in record) {
            const val = String(record["took_board_exam"] || "")
              .trim()
              .toLowerCase();
            record["took_board_exam"] = ["true", "yes", "1"].includes(val);
            console.log(
              "Row",
              i + 1,
              "Took Board Exam:",
              val,
              "->",
              record["took_board_exam"]
            );
          }
          if ("retake" in record) {
            const val = String(record["retake"] || "")
              .trim()
              .toLowerCase();
            record["retake"] = ["true", "yes", "1"].includes(val);
            console.log("Row", i + 1, "Retake:", val, "->", record["retake"]);
          }

          recordsToImport.push(record);
        }

        if (allRowValidationErrors.length > 0) {
          throw new Error("Data validation failed", {
            cause: allRowValidationErrors,
          });
        }
        if (recordsToImport.length === 0) {
          throw new Error("No valid data rows found to import.");
        }

        toast.loading("Importing data...", { id: toastId });

          const response = await statisticsDataService.importData(
            recordsToImport
          );

          if (response.error) {
            throw new Error(response.error);
          }

          const inserted = response?.data?.results?.inserted ?? 0;
          toast.success(`Import successful! ${inserted} record(s) imported.`, {
            id: toastId,
          });

        if (fetchControllerRef.current) {
          fetchControllerRef.current.abort();
        }
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
        setReloadFlag((f) => f + 1);
      } catch (error) {
        console.error("Error processing Excel file:", error);
        toast.dismiss(toastId);
        let errorMessages = [error.message || "An unknown error occurred."];
        if (error.cause && Array.isArray(error.cause)) {
          errorMessages = error.cause.map((e) => String(e));
        } else if (typeof error.cause === "string") {
          errorMessages = [error.cause];
        }
        setImportErrors(errorMessages);
        setIsImportErrorModalOpen(true);
      }
    };

    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      toast.dismiss(toastId);
      setImportErrors(["Failed to read the selected file."]);
      setIsImportErrorModalOpen(true);
    };

    reader.readAsArrayBuffer(file);
    event.target.value = "";
  }, []);

  const handleBulkDelete = useCallback(
    async (ids) => {
      if (!ids || ids.length === 0) return;
      const canDelete = isAdmin;
      if (!canDelete) {
        toast.error("Only admins can delete records.");
        return;
      }
      const toastId = toast.loading("Deleting selected records...");
      const originalData = [...statisticsData];
      try {
        setStatisticsData((prevData) =>
          prevData.filter((r) => !ids.includes(r._id))
        );
        const response = await statisticsDataService.bulkDelete(ids);
        if (response.error) throw new Error(response.error);
        toast.success("Selected records deleted successfully!", {
          id: toastId,
        });
        setRowSelection({});
        if (fetchControllerRef.current) fetchControllerRef.current.abort();
        setPagination((prev) => ({ ...prev }));
      } catch (error) {
        toast.error(`Bulk delete failed: ${error.message}`, { id: toastId });
        setStatisticsData(originalData);
      }
    },
    [statisticsData, isAdmin, user]
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("select", {
        id: "select",
        header: ({ table }) => (
          <IndeterminateCheckbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            aria-label="Select all rows"
          />
        ),
        cell: ({ row }) => (
          <div className="px-1">
            <IndeterminateCheckbox
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              indeterminate={row.getIsSomeSelected()}
              onChange={row.getToggleSelectedHandler()}
              aria-label={`Select row ${row.index}`}
            />
          </div>
        ),
        enableSorting: false,
        size: 60,
      }),
      columnHelper.accessor(
        (row) => {
          const last = row.last_name || "";
          const first = row.first_name || "";
          const middle = row.middle_name ? ` ${row.middle_name}` : "";
          return `${last}, ${first}${middle}`.trim();
        },
        {
          id: "name",
          header: "Name",
          cell: (info) => info.getValue(),
          size: 200,
          enableGlobalFilter: true,
        }
      ),
      columnHelper.accessor("gender", {
        header: "Gender",
        cell: (info) => info.getValue() || "N/A",
        size: 100,
      }),
      columnHelper.accessor("program_id", {
        header: "Program",
        cell: (info) => getProgramName(info.getValue()),
        size: 180,
        enableGlobalFilter: true,
      }),
      columnHelper.accessor("school_id", {
        header: "School",
        cell: (info) => getSchoolName(info.getValue()),
        size: 180,
        enableGlobalFilter: true,
      }),
      columnHelper.accessor("took_board_exam", {
        header: "Took Board Exam",
        cell: (info) => {
          const value = info.getValue();
          const renderedValue = value ? "Yes" : "No";
          console.log(
            `Cell Render (took_board_exam): Row ${info.row.index}, Value:`,
            value,
            `(${typeof value})`,
            "Renders:",
            renderedValue
          );
          return renderedValue;
        },
        size: 100,
        meta: {
          filterVariant: "select",
          filterOptions: ["Yes", "No"],
        },
      }),
      columnHelper.accessor(
        (row) =>
          row.exam_month_taken && row.exam_year_taken
            ? `${row.exam_month_taken}, ${row.exam_year_taken}`
            : "N/A",
        {
          id: "exam_details",
          header: "Exam Date",
          cell: (info) => info.getValue(),
          size: 120,
        }
      ),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => info.getValue() || "Pending",
        size: 120,
      }),
      columnHelper.accessor(
        (row) => {
          if (!row.retake) return "No";
          const count = row.retake_times || 0;
          const label = count === 1 ? "time" : "times";
          return `Yes (${count} ${label})`;
        },
        {
          id: "retake_details",
          header: "Retake Info",
          cell: (info) => info.getValue(),
          size: 140,
        }
      ),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          // Use isViewer and user from closure
          const canEdit = isAdmin;
          const canDelete = isAdmin;
          return (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handleEdit(row.original)}
                className={`text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label={`Edit ${row.original.first_name} ${row.original.last_name}`}
                  title={
                    !isAdmin
                      ? "Only admins can edit records"
                      : canEdit
                      ? "Edit Record"
                      : "You do not have permission to edit"
                }
                disabled={!canEdit}
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => handleDeleteConfirmation(row.original)}
                className={`text-red-600 hover:text-red-800 p-2 rounded-lg border border-orange-200 bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label={`Delete ${row.original.first_name} ${row.original.last_name}`}
                  title={
                    !isAdmin
                      ? "Only admins can delete records"
                      : canDelete
                      ? "Delete Record"
                      : "Only admins can delete records"
                  }
                disabled={!canDelete}
              >
                <Trash2 size={18} />
              </button>
            </div>
          );
        },
        enableSorting: false,
        size: 100,
      }),
    ],
    [
      getProgramName,
      getSchoolName,
      handleEdit,
      handleDeleteConfirmation,
      isAdmin,
      user,
    ]
  );

  useEffect(() => {
    const initialVisibility = {};
    columnsToggleList.forEach((col) => {
      initialVisibility[col.id] = true;
    });
    setColumnVisibility(initialVisibility);
  }, []);

  if (profileLoading || isInitialLoading) {
    return (
      <main id="student-records">
        <header className="mb-6 md:mb-8 lg:mb-10">
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-2 md:mb-3 w-3/4"></div>
          <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2"></div>
        </header>

        {/* Table Actions Skeleton */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <div className="h-10 bg-gray-200 rounded animate-pulse w-24"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse w-20"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse w-20"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
          </div>
        </div>

        {/* Table Filters Skeleton */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-24"></div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {Array.from({ length: 9 }).map((_, index) => (
                    <th key={index} className="px-4 py-3 text-left">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Array.from({ length: 10 }).map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {Array.from({ length: 9 }).map((_, colIndex) => (
                      <td key={colIndex} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    );
  }

  if (profileError) {
    return (
      <section className="p-4 md:p-6 lg:p-8 text-center">
        <h2 className="text-xl text-red-700 font-semibold mb-4">
          Error Loading Profile
        </h2>
        <p className="text-gray-600 mb-4">{profileError}</p>
      </section>
    );
  }

  if (fetchError && !isInitialLoading) {
    return (
      <section className="p-4 md:p-6 lg:p-8 text-center">
        <h2 className="text-xl text-red-700 font-semibold mb-4">
          Error Loading Statistics Data
        </h2>
        <p className="text-gray-600 mb-4">{fetchError}</p>
        <button
          onClick={() => {
            setPagination((prev) => ({ ...prev }));
          }}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Retry Loading Statistics
        </button>
      </section>
    );
  }

  // Debug: Log the data passed to the table
  console.log("Table Data:", statisticsData);

  return (
    <main id="student-records">
      <header className="mb-6 md:mb-8 lg:mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-red-800 mb-2 md:mb-3">
          Student Statistics Records
        </h1>
        <p className="text-gray-600 text-base md:text-lg">
          Manage and view detailed student examination records.
        </p>
      </header>

      <TableActions
        onAddStudent={() => {
          if (!isViewer) setIsFormModalOpen(true);
          else setShowNotAllowedModal(true);
        }}
        onImportClick={() => {
          if (!isViewer) setIsExcelModalOpen(true);
          else setShowNotAllowedModal(true);
        }}
        onExportClick={handleExportExcel}
        onFileChange={handleExcelFileChange}
        isExportDisabled={statisticsData.length === 0}
        columnsForSelector={columnsToggleList}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        rowSelection={rowSelection}
        isViewer={isViewer}
      />

      <TableFilters
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        programFilter={programFilter}
        setProgramFilter={setProgramFilter}
        programs={programs}
        schoolFilter={schoolFilter}
        setSchoolFilter={setSchoolFilter}
        schools={schools}
        examStatusFilter={examStatusFilter}
        setExamStatusFilter={setExamStatusFilter}
        examYearFilter={examYearFilter}
        setExamYearFilter={setExamYearFilter}
        examYears={examYears}
        genderFilter={genderFilter}
        setGenderFilter={setGenderFilter}
        retakeFilter={retakeFilter}
        setRetakeFilter={setRetakeFilter}
        tookExamFilter={tookExamFilter}
        setTookExamFilter={setTookExamFilter}
        clearAllFilters={clearAllFilters}
        hasActiveFilters={hasActiveFilters}
        isFiltersLoading={isInitialLoading}
      />

      <StudentTable
        data={statisticsData}
        columns={columns}
        columnVisibility={columnVisibility}
        pagination={pagination}
        setPagination={setPagination}
        sorting={sorting}
        setSorting={setSorting}
        globalFilter={globalFilter}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        isLoading={isLoading}
        onDeleteSelected={handleBulkDelete}
        user={user}
        isAdmin={isAdmin}
        isTableLoading={isStatsLoading}
      />

      <StudentFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        student={selectedRecord}
        isEditing={isEditing}
        programs={programs}
        schools={schools}
        fetchRecordById={mutations.fetchRecordById}
        isViewer={isViewer}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={selectedRecord?.retake ? "Reset Exam Status?" : "Delete Record?"}
        message={
          selectedRecord
            ? `Are you sure you want to delete ${selectedRecord.first_name} ${selectedRecord.last_name}'s record? This action cannot be undone.`
            : ""
        }
        isViewer={isViewer}
      />

      <ExcelInstructionsModal
        isOpen={isExcelModalOpen}
        onClose={() => {
          handleCloseExcelModal();
          handleOpenFilePicker();
        }}
        onCancel={handleCloseExcelModal}
        expectedColumns={[
          "last_name",
          "first_name",
          "middle_name",
          "school_name",
          "gender",
          "program_name",
          "took_board_exam",
          "exam_month_taken",
          "exam_year_taken",
          "status",
          "retake",
          "retake_times",
        ]}
        isViewer={isViewer}
      />

      <ImportErrorModal
        isOpen={isImportErrorModalOpen}
        onClose={() => setIsImportErrorModalOpen(false)}
        errors={importErrors}
      />

      <NotAllowedModal
        isOpen={showNotAllowedModal}
        onClose={() => setShowNotAllowedModal(false)}
        message={
          "You do not have permission to perform this action as a viewer."
        }
      />
    </main>
  );
}
