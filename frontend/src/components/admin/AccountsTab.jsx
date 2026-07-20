import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../../contexts/NotificationContext';
import { 
  searchAdminUsers, 
  changeUserStatus, 
  deleteUser, 
  assignUserRoles 
} from '../../api/adminUserApi';
import UserRoleAssignmentModal from './UserRoleAssignmentModal';

const AVAILABLE_ROLES = [
  { id: 1, name: 'ROLE_ADMIN', label: 'Admin' },
  { id: 2, name: 'ROLE_GENERAL', label: 'General / Spectator' },
  { id: 3, name: 'ROLE_JOCKEY', label: 'Jockey' },
  { id: 4, name: 'ROLE_HORSE_OWNER', label: 'Horse Owner' },
  { id: 5, name: 'ROLE_REFEREE', label: 'Referee' },
];

export default function AccountsTab() {
  const { showToast } = useNotification();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [size, setSize] = useState(10);
  
  // Filters
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  const [searchInput, setSearchInput] = useState('');

  // Modal states
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await searchAdminUsers({
        page,
        size,
        keyword,
        status: statusFilter,
        roleId: roleFilter,
      });
      setUsers(data?.content || []);
      
      const totalElements = data?.page?.totalElements ?? data?.totalElements ?? 0;
      const calculatedPages = totalElements > 0 ? Math.ceil(totalElements / size) : 1;
      setTotalPages(data?.page?.totalPages ?? data?.totalPages ?? calculatedPages);
    } catch (error) {
      console.error(error);
      showToast('Error', error.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [page, size, keyword, statusFilter, roleFilter, showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setKeyword(searchInput);
      setPage(0); // Reset page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const handleStatusChange = async (user, newStatus) => {
    try {
      await changeUserStatus(user.id, newStatus);
      showToast('Success', `User ${user.username} status changed to ${newStatus}`);
      fetchUsers();
    } catch (error) {
      showToast('Error', error.message || 'Failed to change status');
    }
  };

  const handleAssignRoles = async (userId, roleIds) => {
    try {
      await assignUserRoles(userId, roleIds);
      showToast('Success', 'Roles updated successfully');
      fetchUsers();
    } catch (error) {
      showToast('Error', error.message || 'Failed to update roles');
      throw error; // Let modal handle loading state
    }
  };

  const handleDeleteUser = async () => {
    if (!confirmDeleteUser) return;
    try {
      setIsDeleting(true);
      await deleteUser(confirmDeleteUser.id);
      showToast('Success', `User ${confirmDeleteUser.username} has been deleted (soft delete).`);
      setConfirmDeleteUser(null);
      fetchUsers();
    } catch (error) {
      showToast('Error', error.message || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-display text-4xl text-on-surface font-bold tracking-tight">Account Management</h2>
          <p className="font-body text-lg text-on-surface-variant mt-1">Manage users, roles, statuses, and monitor wallets.</p>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-outline-variant p-4 flex flex-col gap-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] transition-colors group-focus-within:text-primary">search</span>
            <input 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="bg-surface-container-low border border-outline-variant rounded-lg pl-10 pr-4 py-2 font-interactive text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all w-full" 
              placeholder="Search by username or email..." 
              type="text" 
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <select 
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              className="bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 font-interactive text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="banned">Banned</option>
            </select>
            <select 
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
              className="bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 font-interactive text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="">All Roles</option>
              {AVAILABLE_ROLES.map(role => (
                <option key={role.id} value={role.id}>{role.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-outline-variant">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant border-b-2 border-primary/20">
                <th className="py-3 px-4 font-body text-xs font-bold tracking-widest uppercase">User Info</th>
                <th className="py-3 px-4 font-body text-xs font-bold tracking-widest uppercase">Type & Wallet</th>
                <th className="py-3 px-4 font-body text-xs font-bold tracking-widest uppercase">Roles</th>
                <th className="py-3 px-4 font-body text-xs font-bold tracking-widest uppercase">Status</th>
                <th className="py-3 px-4 font-body text-xs font-bold tracking-widest uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body text-sm text-on-surface">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined animate-spin text-[32px]">progress_activity</span>
                    <p className="mt-2 font-interactive">Loading users...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[32px] opacity-50">group_off</span>
                    <p className="mt-2 font-interactive">No users found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors group">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                          {user.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-on-surface">{user.username}</p>
                          <p className="text-xs text-on-surface-variant">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-on-surface">{user.userType}</p>
                      <p className="text-xs text-primary font-bold">
                        {user.walletBalance != null ? `$${user.walletBalance.toLocaleString()}` : 'No Wallet'}
                      </p>
                    </td>
                    <td className="py-3 px-4 max-w-[200px]">
                      <div className="flex flex-wrap gap-1">
                        {user.roles && user.roles.length > 0 ? user.roles.map(r => (
                          <span key={r} className="inline-block px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 text-[10px] font-bold">
                            {r.replace('ROLE_', '')}
                          </span>
                        )) : (
                          <span className="text-xs text-on-surface-variant italic">No Roles</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-bold border ${
                        user.status === 'active' ? 'bg-success/10 text-success border-success/20' :
                        user.status === 'banned' ? 'bg-error/10 text-error border-error/20' :
                        'bg-surface-variant text-on-surface-variant border-outline-variant'
                      }`}>
                        {user.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setRoleModalUser(user)}
                          title="Assign Roles"
                          className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">verified_user</span>
                        </button>
                        
                        {user.status === 'active' ? (
                          <button 
                            onClick={() => handleStatusChange(user, 'banned')}
                            title="Ban User"
                            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">block</span>
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleStatusChange(user, 'active')}
                            title="Unban/Activate User"
                            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-success hover:bg-success/10 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                          </button>
                        )}

                        <button 
                          onClick={() => setConfirmDeleteUser(user)}
                          title="Delete User"
                          className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center px-2 py-4 border-t border-outline-variant">
          <span className="font-body text-sm text-on-surface-variant">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button 
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 rounded-lg border border-outline-variant bg-surface hover:bg-surface-container-low text-on-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button 
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 rounded-lg border border-outline-variant bg-surface hover:bg-surface-container-low text-on-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <UserRoleAssignmentModal 
        isOpen={!!roleModalUser} 
        onClose={() => setRoleModalUser(null)} 
        user={roleModalUser}
        onSave={handleAssignRoles}
      />

      {/* Confirmation Dialog for Delete */}
      <AnimatePresence>
        {confirmDeleteUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-surface/50 backdrop-blur-sm"
              onClick={() => !isDeleting && setConfirmDeleteUser(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-surface rounded-2xl border border-outline-variant shadow-lg w-full max-w-sm p-6 flex flex-col gap-4 text-center items-center"
            >
              <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center text-error mb-2">
                <span className="material-symbols-outlined text-[32px]">warning</span>
              </div>
              <h3 className="font-display text-xl font-bold text-on-surface">Delete User?</h3>
              <p className="font-body text-sm text-on-surface-variant">
                Are you sure you want to delete <span className="font-bold text-on-surface">{confirmDeleteUser.username}</span>? This will deactivate their account (Soft Delete).
              </p>
              
              <div className="flex gap-3 w-full mt-2">
                <button 
                  onClick={() => setConfirmDeleteUser(null)}
                  disabled={isDeleting}
                  className="flex-1 py-2 rounded-lg border border-outline-variant font-interactive hover:bg-surface-container-lowest transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteUser}
                  disabled={isDeleting}
                  className="flex-1 py-2 rounded-lg bg-error text-on-error font-interactive hover:bg-error/90 transition-colors flex justify-center items-center gap-2"
                >
                  {isDeleting ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> : null}
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
