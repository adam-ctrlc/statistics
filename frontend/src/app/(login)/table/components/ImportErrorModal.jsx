"use client";

import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, AlertTriangle } from "@/app/components/icons";

export default function ImportErrorModal({
  isOpen,
  onClose,
  errors = [], // Array of error messages (strings)
}) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[60]" onClose={onClose}>
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
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        </Transition.Child>

        {/* Modal container */}
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
            <Dialog.Panel className="bg-white rounded-lg border border-gray-300 w-full max-w-md flex flex-col shadow-xl overflow-hidden">
              {/* Header */}
              <header className="sticky top-0 bg-red-50 z-10 px-6 py-4 border-b border-red-200 flex justify-between items-center flex-shrink-0">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="text-red-600" size={24} />
                  <Dialog.Title
                    as="h2"
                    className="text-lg font-semibold text-red-800"
                  >
                    Import Errors Encountered
                  </Dialog.Title>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-red-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-100"
                  aria-label="Close error modal"
                >
                  <X size={20} />
                </button>
              </header>

              {/* Error List Content */}
              <div className="p-6 overflow-y-auto flex-grow">
                <p className="text-sm text-gray-700 mb-4">
                  The import failed due to the following validation errors.
                  Please correct your file and try again:
                </p>

                {errors.length > 0 ? (
                  <ul className="list-disc list-inside space-y-2 text-sm text-red-700 pl-4">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">
                    No specific error details available. Please check the file
                    format and content.
                  </p>
                )}
              </div>

              {/* Footer */}
              <footer className="sticky bottom-0 bg-gray-50 z-10 px-6 py-4 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  onClick={onClose}
                >
                  Close
                </button>
              </footer>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
