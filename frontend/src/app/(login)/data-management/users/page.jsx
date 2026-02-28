"use client";

import { useState, useEffect, useMemo, startTransition } from "react";
import { useFetch } from "../../../services/hooks/useFetch";
import UserFormModal from "../components/UserFormModal";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import {
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Users,
  UserCheck,
  UserX,
  Filter,
  X,
} from "@/app/components/icons";
import AlertMessage from "@/app/(login)/profile/components/AlertMessage"; // Reuse alert
import LoadingIndicator from "@/app/(login)/profile/components/LoadingIndicator"; // Reuse loader
import CustomSelect from "@/app/components/CustomSelect"; // Import CustomSelect
import { userService } from "../../../services/dataManagement/userService";
import { roleService } from "../../../services/dataManagement/roleService";
import { schoolService } from "../../../services/dataManagement/schoolService";
import { programService } from "../../../services/dataManagement/programService";

const ITEMS_PER_PAGE = 10;
const initialAddEditState = { type: null, message: null };

const getIdString = (val) => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") return val._id || val.id || "";
  return "";
};

export default function UsersManagement() {
  // Get current user profile
  const { profile: currentUser, profileLoading } =
    require("../../../services/auth/profileService").useProfileData();
  // Data State
  const [users, setUsers] = useState([]);
  const [options, setOptions] = useState({
    roles: [],
    programs: [],
    schools: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteState, setDeleteState] = useState({
    loading: false,
    error: null,
    success: null,
  });

  // Modal States
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // User object for edit/delete
  const [isEditing, setIsEditing] = useState(false);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Add state for field-specific errors
  const [fieldErrors, setFieldErrors] = useState({});

  // --- Data Fetching ---
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await userService.getAll();
        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        setError(err.message || "Failed to load users");
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    async function fetchOptions() {
      try {
        const [rolesRes, programsRes, schoolsRes] = await Promise.all([
          roleService.getAll(),
          programService.getAll(),
          schoolService.getAll(),
        ]);
        setOptions({
          roles: rolesRes.data || [],
          programs: programsRes.data || [],
          schools: schoolsRes.data || [],
        });
      } catch (err) {
        setOptions({ roles: [], programs: [], schools: [] });
      }
    }
    fetchOptions();
  }, []);

  const refreshData = () => {
    // Implement refreshData logic
  };

  // --- Modal Handling ---
  const handleAddUser = () => {
    setSelectedUser(null);
    setIsEditing(false);
    setIsUserModalOpen(true);
  };

  const handleEditUser = async (user) => {
    setIsEditing(true);
    setIsUserModalOpen(true);
    setSelectedUser(null); // Show loading state in modal if needed
    try {
      const freshUser = await userService.getById(user._id || user.id);
      setSelectedUser(freshUser.data);
    } catch (err) {
      setError("Failed to fetch user details for editing.");
      setIsUserModalOpen(false);
    }
  };

  const handleCloseUserModal = () => {
    setIsUserModalOpen(false);
    setSelectedUser(null);
  };

  // --- Deletion Handling ---
  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    setDeleteState({ loading: true, error: null, success: null });
    try {
      await userService.delete(selectedUser._id);
      setDeleteState({
        loading: false,
        error: null,
        success: "User deleted successfully",
      });
      setUsers(users.filter((user) => user._id !== selectedUser._id));
    } catch (err) {
      console.error("Delete error:", err);
      setDeleteState({
        loading: false,
        error: "An unexpected error occurred during deletion.",
        success: null,
      });
    } finally {
      setIsDeleteModalOpen(false); // Close modal regardless of outcome
      setSelectedUser(null);
      // Auto-clear delete status message after a delay
      setTimeout(
        () => setDeleteState({ loading: false, error: null, success: null }),
        3000
      );
    }
  };

  // --- Filtering & Pagination Logic ---
  const filteredUsers = useMemo(() => {
    return (users || []).filter((user) => {
      const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
      const searchMatch =
        searchTerm === "" ||
        fullName.includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase());
      const roleMatch =
        roleFilter === "" || getIdString(user.role_id) === roleFilter;
      const statusMatch = statusFilter === "" || user.status === statusFilter;
      const programMatch =
        programFilter === "" || getIdString(user.program_id) === programFilter;
      const schoolMatch =
        schoolFilter === "" || getIdString(user.school_id) === schoolFilter;
      return (
        searchMatch && roleMatch && statusMatch && programMatch && schoolMatch
      );
    });
  }, [
    users,
    searchTerm,
    roleFilter,
    statusFilter,
    programFilter,
    schoolFilter,
  ]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const currentUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("");
    setStatusFilter("");
    setSchoolFilter("");
    setProgramFilter("");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm || roleFilter || statusFilter || programFilter || schoolFilter;

  // --- Stats Calculation ---
  const userStats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.status === "active").length,
      inactive: users.filter((u) => u.status === "inactive").length,
    }),
    [users]
  );

  // Lookup helpers for displaying names
  const getProgramName = (programObj) => {
    const idStr = programObj?._id || programObj?.id || programObj;
    const prog = options.programs.find((p) => (p._id || p.id) === idStr);
    return prog ? prog.program : programObj?.program || null;
  };

  const getSchoolName = (schoolObj) => {
    const idStr = schoolObj?._id || schoolObj?.id || schoolObj;
    const school = options.schools.find((s) => (s._id || s.id) === idStr);
    return school ? school.school : schoolObj?.school || null;
  };

  const getRoleName = (roleObj) => {
    const idStr = roleObj?._id || roleObj?.id || roleObj;
    const role = options.roles.find((r) => (r._id || r.id) === idStr);
    return role ? role.role : roleObj?.role || null;
  };

  const roleCounts = useMemo(() => {
    const counts = {};
    users.forEach((u) => {
      const role = u.role_id?.role || "Unknown";
      counts[role] = (counts[role] || 0) + 1;
    });
    return counts;
  }, [users]);

  // CRUD Handlers
  const handleCreateUser = async (userData) => {
    try {
      setFieldErrors({}); // Clear previous errors
      console.log("Creating user with data:", userData); // Debug log
      const newUser = await userService.create(userData);
      setUsers((prev) => [...prev, newUser]);
      setIsUserModalOpen(false);
    } catch (err) {
      // Check for backend error details
      if (err.message === "Failed to create user" && err.backendDetails) {
        // Example: { error: 'Username already exists' }
        if (
          err.backendDetails.error &&
          err.backendDetails.error.includes("Username")
        ) {
          setFieldErrors({ username: err.backendDetails.error });
          setError(null);
          return;
        }
      }
      setError(err.message || "Failed to create user");
    }
  };
  const handleUpdateUser = async (id, userData) => {
    console.log("handleUpdateUser called with:", id, userData);
    try {
      const updatedUser = await userService.update(id, userData);
      setUsers((prev) => prev.map((u) => (u._id === id ? updatedUser : u)));
      setIsUserModalOpen(false);
    } catch (err) {
      setError(err.message || "Failed to update user");
    }
  };
  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // --- Render Logic ---
  useEffect(() => {
    console.log("options:", options);
    console.log("users:", users);
    currentUsers.forEach((user) => {
      console.log("user:", user);
      console.log(
        "user.program_id:",
        user.program_id,
        "lookup:",
        getProgramName(user.program_id)
      );
      console.log(
        "user.school_id:",
        user.school_id,
        "lookup:",
        getSchoolName(user.school_id)
      );
      console.log(
        "user.role_id:",
        user.role_id,
        "lookup:",
        getRoleName(user.role_id)
      );
    });
  }, [options, users, currentUsers]);

  if (isLoading)
    return (
      <div className="space-y-6 animate-pulse">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-100 rounded-lg p-4 flex items-center gap-4 h-24"
            >
              <div className="p-2 bg-gray-200 rounded-md h-9 w-9"></div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Table Section Skeleton */}
        <div className="bg-white border border-gray-100 rounded-lg p-4">
          {/* Table Header & Actions Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 items-center mb-4">
            <div className="h-11 bg-gray-200 rounded-lg"></div>{" "}
            {/* Search Bar */}
            <div className="h-11 bg-gray-200 rounded-lg"></div>{" "}
            {/* Role Filter */}
            <div className="h-11 bg-gray-200 rounded-lg"></div>{" "}
            {/* Status Filter */}
            <div className="h-11 bg-gray-200 rounded-lg"></div>{" "}
            {/* Program Filter */}
            <div className="h-11 bg-gray-200 rounded-lg"></div>{" "}
            {/* School Filter */}
            <div className="h-11 bg-gray-200 rounded-lg"></div>{" "}
            {/* Add User Button */}
            <div className="h-11 bg-gray-200 rounded-lg w-11 ml-auto"></div>{" "}
            {/* Refresh Button */}
          </div>

          {/* Table Content Skeleton */}
          <div className="overflow-x-auto">
            <div className="min-w-full divide-y divide-gray-100">
              <div className="bg-gray-50">
                <div className="grid grid-cols-7 gap-x-6 px-6 py-3">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className="h-4 bg-gray-200 rounded w-full"
                    ></div>
                  ))}
                </div>
              </div>
              <div className="bg-white divide-y divide-gray-100">
                {[...Array(ITEMS_PER_PAGE)].map((_, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="grid grid-cols-7 gap-x-6 px-6 py-4 h-16"
                  >
                    {[...Array(7)].map((_, colIndex) => (
                      <div
                        key={colIndex}
                        className="h-4 bg-gray-200 rounded w-full"
                      ></div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pagination Skeleton */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="flex gap-2">
              <div className="h-8 w-20 bg-gray-200 rounded-md"></div>
              <div className="h-8 w-20 bg-gray-200 rounded-md"></div>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <section className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users Card */}
        <div className="bg-white border border-gray-100 rounded-lg p-4 flex items-center gap-4">
          <div className="p-2 bg-blue-100 rounded-md">
            <Users className="h-5 w-5 text-blue-600" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-xl font-semibold text-gray-900">
              {userStats.total}
            </p>
          </div>
        </div>
        {/* Active Users Card */}
        <div className="bg-white border border-gray-100 rounded-lg p-4 flex items-center gap-4">
          <div className="p-2 bg-green-100 rounded-md">
            <UserCheck className="h-5 w-5 text-green-600" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Active Users</p>
            <p className="text-xl font-semibold text-gray-900">
              {userStats.active}
            </p>
          </div>
        </div>
        {/* Inactive Users Card */}
        <div className="bg-white border border-gray-100 rounded-lg p-4 flex items-center gap-4">
          <div className="p-2 bg-red-100 rounded-md">
            <UserX className="h-5 w-5 text-red-600" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Inactive Users</p>
            <p className="text-xl font-semibold text-gray-900">
              {userStats.inactive}
            </p>
          </div>
        </div>
        {/* Roles Card - Example */}
        <div className="bg-white border border-gray-100 rounded-lg p-4 flex items-center gap-4">
          <div className="p-2 bg-purple-100 rounded-md">
            <Users className="h-5 w-5 text-purple-600" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Roles Breakdown</p>
            <ul className="flex flex-wrap gap-4 mt-1">
              {Object.entries(roleCounts).map(([role, count]) => {
                const abbr = role.slice(0, 2).toUpperCase();
                return (
                  <li key={role} className="flex items-center gap-1">
                    <span className="font-medium">{abbr}:</span>
                    <span>{count}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Action/Error Display Area */}
      {(error || deleteState.error || deleteState.success) && (
        <div className="min-h-[40px]">
          {/* Prevent layout shift */}
          {error && <AlertMessage message={error} type="error" />}
          {deleteState.error && (
            <AlertMessage message={deleteState.error} type="error" />
          )}
          {deleteState.success && (
            <AlertMessage message={deleteState.success} type="success" />
          )}
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white border border-gray-100 rounded-lg">
        {/* Table Header & Actions */}
        <div className="bg-white rounded-xl p-4 grid grid-cols-1 lg:grid-cols-5 gap-3 items-center border border-gray-100">
          <div className="flex-1 min-w-[220px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="users-search"
                name="users-search"
                aria-label="Search users"
                type="text"
                autoComplete="off"
                placeholder="Search name or username..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              />
            </div>
          </div>
          <CustomSelect
            id="role-filter"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: "", label: "All Roles" },
              ...(options.roles?.map((r) => ({
                value: r._id?.toString() || r.id?.toString() || "",
                label: r.role,
              })) || []),
            ]}
            placeholder="All Roles"
            className="min-w-[150px] h-11"
          />
          <CustomSelect
            id="status-filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: "", label: "All Statuses" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
            placeholder="All Statuses"
            className="min-w-[150px] h-11"
          />
          <CustomSelect
            id="program-filter"
            value={programFilter}
            onChange={(e) => {
              setProgramFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: "", label: "All Programs" },
              ...(options.programs?.map((p) => ({
                value: p._id?.toString() || p.id?.toString() || "",
                label: p.program,
              })) || []),
            ]}
            placeholder="All Programs"
            className="min-w-[150px] h-11"
          />
          <CustomSelect
            id="school-filter"
            value={schoolFilter}
            onChange={(e) => {
              setSchoolFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: "", label: "All Schools" },
              ...(options.schools?.map((s) => ({
                value: s._id?.toString() || s.id?.toString() || "",
                label: s.school,
              })) || []),
            ]}
            placeholder="All Schools"
            className="min-w-[150px] h-11"
          />
          <button
            onClick={handleAddUser}
            className="inline-flex items-center gap-1.5 bg-red-700 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-red-800 transition-colors h-11"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            Add User
          </button>
          <button
            onClick={refreshData}
            className="p-2 text-gray-500 hover:text-red-600"
            title="Refresh Data"
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <LoadingIndicator />
          ) : currentUsers.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Username
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Program
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {currentUsers.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.first_name} {user.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getRoleName(user.role_id) || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getProgramName(user.program_id) || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-800 p-1 disabled:opacity-50"
                        title="Edit User"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {currentUser && user._id === currentUser._id ? (
                        <button
                          disabled
                          className={
                            "bg-orange-50 text-orange-500 border border-orange-200 p-2 rounded-lg cursor-not-allowed"
                          }
                          title="You cannot delete your own account"
                          aria-label="You cannot delete your own account"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-800 p-1 disabled:opacity-50"
                          title="Delete User"
                          aria-label="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <p>No users found matching your criteria.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && !isLoading && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-200 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-200 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <UserFormModal
        isOpen={isUserModalOpen}
        onClose={handleCloseUserModal}
        onSubmit={isEditing ? handleUpdateUser : handleCreateUser}
        user={selectedUser}
        isEditing={isEditing}
        roles={options.roles}
        programs={options.programs}
        schools={options.schools}
        modalClassName="w-full max-w-3xl"
        fieldErrors={fieldErrors}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete user '${selectedUser?.username}'? This action cannot be undone.`}
      />
    </section>
  );
}
