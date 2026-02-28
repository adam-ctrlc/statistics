import React from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X } from "@/app/components/icons";

export default function MainModal({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  isEditing,
  submitLabel,
  cancelLabel = "Cancel",
  isPending = false,
  className,
  formId,
  destructive = false,
  showSubmitButton = true,
}) {
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
          <div className="fixed inset-0" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`w-full transform overflow-hidden rounded-2xl bg-white border border-gray-200 text-left align-middle transition-all ${
                  className || "max-w-md"
                }`}
              >
                <form onSubmit={onSubmit} id={formId}>
                  <div className="relative">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold leading-6 text-gray-900 p-6 pb-0"
                    >
                      {title}
                    </Dialog.Title>
                    <button
                      type="button"
                      onClick={onClose}
                      className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 focus:outline-none"
                      aria-label="Close modal"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="p-6">{children}</div>
                  <div className="flex justify-end gap-3 p-6 pt-0">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      onClick={onClose}
                    >
                      {cancelLabel}
                    </button>
                    {showSubmitButton && (
                      <button
                        type="submit"
                        className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
                          destructive
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                        disabled={isPending}
                      >
                        {isPending ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="h-4 w-4 bg-white/30 rounded-full animate-pulse"></div>
                            <span className="h-4 w-20 bg-white/30 rounded animate-pulse"></span>
                          </div>
                        ) : (
                          submitLabel ||
                          (destructive
                            ? "Delete"
                            : isEditing
                            ? "Update"
                            : "Create")
                        )}
                      </button>
                    )}
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
