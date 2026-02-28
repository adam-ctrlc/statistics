import React, { Fragment, useState } from "react";
import * as XLSX from "xlsx";
import { X, CheckCircle } from "@/app/components/icons";
import { Dialog, Transition } from "@headlessui/react";

export default function ExcelInstructionsModal({
  isOpen,
  onClose,
  onCancel,
  isViewer = false,
}) {
  const [activeTab, setActiveTab] = useState("format");

  // Updated Sample Data based on StatisticsData.mjs
  const sampleData = [
    {
      "First Name": "Alice",
      "Middle Name": "M.",
      "Last Name": "Smith",
      "School Name": "PHINMA - Cagayan de Oro College", // Mapped to school_id
      Gender: "Female",
      "Program Name": "Civil Engineering", // Mapped to program_id
      "Took Board Exam": "TRUE",
      "Exam Month": "May",
      "Exam Year": "2023",
      Status: "Passed",
      Retake: "FALSE",
      "Retake Times": "0",
    },
    {
      "First Name": "Bob",
      "Middle Name": "",
      "Last Name": "Johnson",
      "School Name": "PHINMA - Cagayan de Oro College",
      Gender: "Male",
      "Program Name": "Mechanical Engineering",
      "Took Board Exam": "TRUE",
      "Exam Month": "June",
      "Exam Year": "2023",
      Status: "Failed",
      Retake: "FALSE",
      "Retake Times": "",
    },
    {
      "First Name": "Charlie",
      "Middle Name": "X.",
      "Last Name": "Brown",
      "School Name": "PHINMA - Cagayan de Oro College",
      Gender: "Male",
      "Program Name": "Electrical Engineering",
      "Took Board Exam": "TRUE",
      "Exam Month": "May",
      "Exam Year": "2024",
      Status: "Passed",
      Retake: "TRUE",
      "Retake Times": "1",
    },
    {
      "First Name": "Diana",
      "Middle Name": "",
      "Last Name": "Prince",
      "School Name": "PHINMA - Cagayan de Oro College",
      Gender: "Female",
      "Program Name": "Architecture",
      "Took Board Exam": "FALSE", // Example for not taking exam
      "Exam Month": "", // Leave blank if not taken
      "Exam Year": "", // Leave blank if not taken
      Status: "Pending", // Status should be Pending if not taken
      Retake: "FALSE",
      "Retake Times": "0",
    },
  ];

  // Function to generate and download a sample Excel template
  const downloadSampleTemplate = () => {
    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sample Data");

    // Generate and download Excel file
    XLSX.writeFile(workbook, "student_records_template.xlsx");
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onCancel}>
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        </Transition.Child>

        {/* Modal container to center the panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="bg-white rounded-lg border border-gray-300 w-full md:w-[700px] lg:w-[800px] h-[90vh] flex flex-col">
              <header className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
                <h2 className="text-xl font-semibold text-gray-800">
                  Excel Import Instructions
                </h2>
                <button
                  onClick={onCancel}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </header>

              <nav className="border-b border-gray-200 flex-shrink-0">
                <div className="flex px-6">
                  <button
                    className={`py-3 px-4 border-b-2 font-medium text-sm ${
                      activeTab === "format"
                        ? "border-red-800 text-red-800"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => setActiveTab("format")}
                    aria-current={activeTab === "format" ? "page" : undefined}
                  >
                    Format Requirements
                  </button>
                  <button
                    className={`py-3 px-4 border-b-2 font-medium text-sm ${
                      activeTab === "sample"
                        ? "border-red-800 text-red-800"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => setActiveTab("sample")}
                    aria-current={activeTab === "sample" ? "page" : undefined}
                  >
                    Sample Data
                  </button>
                  <button
                    className={`py-3 px-4 border-b-2 font-medium text-sm ${
                      activeTab === "tips"
                        ? "border-red-800 text-red-800"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => setActiveTab("tips")}
                    aria-current={activeTab === "tips" ? "page" : undefined}
                  >
                    Tips & FAQ
                  </button>
                </div>
              </nav>

              <div className="px-6 py-4 overflow-y-auto flex-grow">
                {activeTab === "format" && (
                  <section aria-labelledby="format-heading">
                    <div className="mb-6">
                      <h3
                        id="format-heading"
                        className="text-lg font-semibold text-red-800 mb-2"
                      >
                        Required Excel Format
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Please ensure your Excel file contains the following
                        columns with the correct data format. All fields marked
                        with * are required. Optional fields can be left blank
                        or the column can be omitted entirely. The system will
                        map 'School Name' and 'Program Name' to the correct IDs.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded flex-1">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-green-800">
                              No Case Sensitivity
                            </h4>
                            <div className="mt-2 text-sm text-green-700">
                              <p>
                                The Excel import is{" "}
                                <strong>not case-sensitive</strong>. Column
                                names and field values like "male" vs "Male" or
                                "passed" vs "PASSED" will be recognized
                                correctly.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded flex-1">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-green-800">
                              Flexible Column Order & Optional Fields
                            </h4>
                            <div className="mt-2 text-sm text-green-700">
                              <p>
                                <strong>Column order doesn't matter</strong> -
                                the system identifies columns by their header
                                names. Optional columns like{" "}
                                <strong>Middle Name</strong> can be omitted
                                entirely if not needed.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="min-w-full bg-white">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Column Name
                            </th>
                            <th
                              scope="col"
                              className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Required
                            </th>
                            <th
                              scope="col"
                              className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Data Type
                            </th>
                            <th
                              scope="col"
                              className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Description
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          <tr>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              First Name
                            </td>
                            <td className="px-4 py-3 text-sm text-red-600">
                              *
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              Text
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              Student's first name
                            </td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              Middle Name
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              Optional
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              Text
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              Student's middle name (can be left blank or column
                              omitted)
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              Last Name
                            </td>
                            <td className="px-4 py-3 text-sm text-red-600">
                              *
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              Text
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              Student's last name
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              School Name
                            </td>
                            <td className="px-4 py-3 text-sm text-red-600">
                              *
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              Text
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              Name of the school (must match an existing school
                              in the system)
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              Gender
                            </td>
                            <td className="px-4 py-3 text-sm text-red-600">
                              *
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              Text
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              "Male" or "Female" (case insensitive)
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              Program Name
                            </td>
                            <td className="px-4 py-3 text-sm text-red-600">
                              *
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              Text
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              Name of the program (must match an existing
                              program in the system)
                            </td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              Took Board Exam
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              Optional
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              Boolean
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              "TRUE" or "FALSE" (case insensitive). Leave blank
                              for FALSE.
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              Exam Month
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              Optional
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              Text
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              Month exam taken (e.g., "January"). Required if
                              'Took Board Exam' is TRUE.
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              Exam Year
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              Optional
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              Number/Text
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              Year exam taken (e.g., "2023"). Required if 'Took
                              Board Exam' is TRUE.
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              Status
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              Optional
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              Text
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              "Passed" or "Failed" (case insensitive). Default
                              is "Pending". Required if 'Took Board Exam' is
                              TRUE.
                            </td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              Retake
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              Optional
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              Boolean
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              "TRUE" or "FALSE" (case insensitive). Leave blank
                              for FALSE.
                            </td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              Retake Times
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              Optional
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              Number
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              Number of retakes (e.g., 1, 2). Leave blank or 0
                              if 'Retake' is FALSE.
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}

                {activeTab === "sample" && (
                  <section aria-labelledby="sample-heading">
                    <div className="mb-6">
                      <h3
                        id="sample-heading"
                        className="text-lg font-semibold text-red-800 mb-2"
                      >
                        Sample Excel Data
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Here's an example of how your Excel file should look.
                        You can download this sample as a template.
                      </p>
                      <button
                        onClick={downloadSampleTemplate}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-800 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Download Sample Template (.xlsx)
                      </button>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="min-w-full bg-white">
                        <thead className="bg-gray-50">
                          <tr>
                            {Object.keys(sampleData[0]).map((header) => (
                              <th
                                key={header}
                                scope="col"
                                className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {sampleData.map((row, index) => (
                            <tr key={index}>
                              {Object.values(row).map((value, cellIndex) => (
                                <td
                                  key={cellIndex}
                                  className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap"
                                >
                                  {/* Display boolean values as strings for clarity in sample */}
                                  {typeof value === "boolean"
                                    ? String(value).toUpperCase()
                                    : value}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}

                {activeTab === "tips" && (
                  <section aria-labelledby="tips-heading">
                    <h3
                      id="tips-heading"
                      className="text-lg font-semibold text-red-800 mb-4"
                    >
                      Tips for Successful Import & FAQ
                    </h3>
                    <div className="space-y-6">
                      <article>
                        <h4 className="font-medium text-gray-900 mb-1">
                          Which file types are supported?
                        </h4>
                        <p className="text-gray-600">
                          Only <code>.xlsx</code> (Excel Workbook) and{" "}
                          <code>.xls</code> (Excel 97-2003 Workbook) files are
                          supported.
                        </p>
                      </article>
                      <article>
                        <h4 className="font-medium text-gray-900 mb-1">
                          What happens if my column names don't match exactly?
                        </h4>
                        <p className="text-gray-600">
                          The import process looks for specific header names
                          (like 'Student ID', 'First Name', 'Last Name', etc.).
                          Ensure your headers match the required format. Case
                          sensitivity does not matter, but spelling does.
                        </p>
                      </article>
                      <article>
                        <h4 className="font-medium text-gray-900 mb-1">
                          Are empty rows or extra sheets a problem?
                        </h4>
                        <p className="text-gray-600">
                          The importer will typically process the first sheet in
                          the workbook and ignore empty rows within the data
                          range. It's best to clean up your data and remove
                          unnecessary sheets or completely blank rows before
                          importing.
                        </p>
                      </article>
                      <article>
                        <h4 className="font-medium text-gray-900 mb-1">
                          What values are accepted for 'Gender', 'Status', and
                          'Retake'?
                        </h4>
                        <ul className="list-disc list-inside text-gray-600 space-y-1 pl-2">
                          <li>
                            <strong>Gender:</strong> 'Male', 'Female' (case
                            insensitive).
                          </li>
                          <li>
                            <strong>Status:</strong> 'Passed', 'Failed' (case
                            insensitive).
                          </li>
                          <li>
                            <strong>Retake:</strong> 'TRUE'/'FALSE', 1/0,
                            'Yes'/'No' (case insensitive). Blank is treated as
                            FALSE.
                          </li>
                          <li>
                            <strong>Took Board Exam:</strong> 'TRUE'/'FALSE',
                            1/0, 'Yes'/'No' (case insensitive). Blank is treated
                            as FALSE.
                          </li>
                        </ul>
                      </article>
                    </div>
                  </section>
                )}
              </div>

              <footer className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                  onClick={onCancel}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  onClick={onClose}
                >
                  Select Excel File to Import
                </button>
              </footer>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
