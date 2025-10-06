import React, { useState, useEffect } from "react";
import {
  Pencil,
  Trash,
  Plus,
  Search,
  Filter,
  X,
  Save,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Loader
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deletingUser, setDeletingUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const roleColors = {
    Admin: "bg-red-100 text-red-800 border-red-200",
    User: "bg-green-100 text-green-800 border-green-200",
  };

  const roleIcons = {
    Admin: "👑",
    User: "👤",
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch users from Supabase
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("id, firstname, lastname, username, role");

      if (error) throw error;

      const mappedUsers = data?.map((user: any) => ({
        id: user.id,
        username: user.username,
        fullname: `${user.firstname} ${user.lastname}`,
        role: user.role,
      })) || [];

      setUsers(mappedUsers);
    } catch (err: any) {
      console.error("Error fetching users:", err.message);
      showNotification("error", "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- Edit User ---
  const handleEditClick = (user: any) => setEditingUser({ ...user });

  const handleInputChange = (field: string, value: string) =>
    setEditingUser((prev: any) => ({ ...prev, [field]: value }));

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      // Split fullname into first and last name
      const nameParts = editingUser.fullname.trim().split(" ");
      const firstname = nameParts[0];
      const lastname = nameParts.slice(1).join(" ") || "";

      const { error } = await supabase
        .from("admin_users")
        .update({ firstname, lastname, username: editingUser.username, role: editingUser.role })
        .eq("id", editingUser.id);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((user) =>
          user.id === editingUser.id ? { ...editingUser } : user
        )
      );
      setEditingUser(null);
      showNotification("success", "User updated successfully");
    } catch (err: any) {
      console.error("Failed to update user:", err.message);
      showNotification("error", "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => setEditingUser(null);

  // --- Delete User ---
  const handleDeleteClick = (user: any) => setDeletingUser(user);

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("admin_users")
        .delete()
        .eq("id", deletingUser.id);

      if (error) throw error;

      setUsers((prev) => prev.filter((user) => user.id !== deletingUser.id));
      setDeletingUser(null);
      showNotification("success", "User deleted successfully");
    } catch (err: any) {
      console.error("Failed to delete user:", err.message);
      showNotification("error", "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => setDeletingUser(null);

  const filteredUsers = users.filter(
    (user) =>
      user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/30 p-6 relative">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 p-4 rounded-xl shadow-lg border-l-4 ${
          notification.type === "success"
            ? "bg-green-50 text-green-800 border-green-500"
            : "bg-red-50 text-red-800 border-red-500"
        }`}>
          {notification.type === "success" ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
          <span className="font-medium">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="p-1 hover:bg-black/10 rounded-lg">
            <X size={16} />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center mt-20 space-y-4">
          <Loader size={32} className="animate-spin text-blue-600" />
          <p className="text-gray-500 text-lg">Loading users...</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
              <p className="text-gray-600 mt-2">
                Manage all users. {users.length} users total • {filteredUsers.length} filtered
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search users by name, username, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200">
                <Filter size={18} />
                Filter
              </button>
            </div>
          </div>

          {/* Users Grid */}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredUsers.map((user) => (
              <div key={user.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:border-gray-200 transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xl shadow-lg">
                      {user.fullname.split(" ").map((n: string) => n[0]).join("")}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{user.fullname}</h3>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${roleColors[user.role]}`}>
                        {roleIcons[user.role]} {user.role}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditClick(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => handleDeleteClick(user)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200">
                      <Trash size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Edit User</h3>
              <button onClick={handleCancelEdit} className="p-2 hover:bg-gray-100 rounded-lg" disabled={saving}>
                <X size={20} />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={editingUser.fullname}
                onChange={(e) => handleInputChange("fullname", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={editingUser.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={editingUser.role}
                onChange={(e) => handleInputChange("role", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                disabled={saving}
              >
                <option value="Admin">Admin</option>
                <option value="User">User</option>
              </select>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={handleCancelEdit} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50" disabled={saving}>Cancel</button>
              <button onClick={handleSaveEdit} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2" disabled={saving}>
                {saving ? <><Loader size={18} className="animate-spin" /> Saving...</> : <><Save size={18} /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={24} /> Confirm Delete
              </h3>
              <button onClick={handleCancelDelete} className="p-2 hover:bg-gray-100 rounded-lg" disabled={deleting}>
                <X size={20} />
              </button>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-800 text-sm font-medium">⚠️ This action cannot be undone. The user will be permanently removed from the system.</p>
            </div>

            <p className="text-gray-600">Are you sure you want to delete <strong>{deletingUser.fullname}</strong>?</p>

            <div className="flex gap-2 mt-6">
              <button onClick={handleCancelDelete} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50" disabled={deleting}>Cancel</button>
              <button onClick={handleConfirmDelete} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2" disabled={deleting}>
                {deleting ? <><Loader size={18} className="animate-spin" /> Deleting...</> : <><Trash size={18} /> Delete User</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
