"use client";
import React from "react";
import { Trash2, AlertTriangle } from "@/app/components/icons";
import MainModal from "./MainModal";

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) {
  if (!isOpen) return null;

  return (
    <MainModal
      isOpen={isOpen}
      onClose={onClose}
      title={title || "Confirm Deletion"}
      onSubmit={(e) => {
        e.preventDefault();
        onConfirm();
      }}
      submitLabel="Delete"
      isEditing={false}
      destructive={true}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 bg-red-100 rounded-full p-2 mt-0.5">
          <AlertTriangle className="h-5 w-5 text-red-600" strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <p className="mt-1 text-sm text-gray-500">
            {message ||
              "Are you sure you want to delete this item? This action cannot be undone."}
          </p>
        </div>
      </div>
    </MainModal>
  );
}
