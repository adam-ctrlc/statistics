import React, { Fragment } from "react";
import { X, AlertTriangle } from "@/app/components/icons";
import { Dialog, Transition } from "@headlessui/react";

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  canDelete = true,
  permissionMessage = "",
  isViewer = false,
}) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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

        {/* Centered panel */}
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
            <Dialog.Panel className="bg-white rounded-lg border border-gray-300 w-full md:w-auto md:min-w-[400px]">
              <header className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  {title || "Confirm Deletion"}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </header>

              <div className="p-6">
                <div className="flex items-start mb-6 gap-3">
                  <div className="flex-shrink-0 bg-red-100 rounded-full p-2">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-gray-700 mt-0.5">
                      {message ||
                        "Are you sure you want to delete this item? This action cannot be undone."}
                    </p>
                    {!canDelete && permissionMessage && (
                      <p className="text-sm text-red-600 mt-2">
                        {permissionMessage}
                      </p>
                    )}
                  </div>
                </div>

                <footer className="flex justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                      canDelete
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                    onClick={canDelete ? onConfirm : undefined}
                    disabled={!canDelete}
                    aria-disabled={!canDelete}
                  >
                    {canDelete ? "Delete" : "Not allowed"}
                  </button>
                </footer>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
