import React from "react";
import { Dialog, Transition } from "@headlessui/react";
import { AlertTriangle } from "@/app/components/icons";

export default function NotAllowedModal({ isOpen, onClose, message }) {
  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="fixed inset-0 bg-black bg-opacity-25"
            aria-hidden="true"
          />
        </Transition.Child>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="bg-white rounded-lg border border-gray-300 w-full max-w-md p-6 shadow-xl">
              <div className="flex flex-col items-center text-center">
                <AlertTriangle className="h-12 w-12 text-orange-500 mb-2" />
                <Dialog.Title
                  as="h3"
                  className="text-lg font-semibold text-gray-800 mb-2"
                >
                  Not Allowed
                </Dialog.Title>
                <div className="text-sm text-gray-600 mb-4">
                  {message ||
                    "You do not have permission to perform this action."}
                </div>
                <button
                  type="button"
                  className="mt-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
