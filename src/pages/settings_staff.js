import React, { useEffect, useState } from 'react';
import supabase from '../utils/supabase';
import PageContainer from '../components/PageContainer';
import Papa from 'papaparse';
import { useVenue } from '../context/VenueContext';

const StaffPage = () => {
  const { venueId } = useVenue();
  const [staffList, setStaffList] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', role: '' });
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (venueId) loadStaff();
  }, [venueId]);

  useEffect(() => {
    handleSearch(searchTerm);
  }, [staffList, searchTerm]);

  const loadStaff = async () => {
    const { data } = await supabase.from('staff').select('*').eq('venue_id', venueId);
    setStaffList(data || []);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddOrUpdateStaff = async (e) => {
    e.preventDefault();
    const payload = { ...form, venue_id: venueId };

    if (editingId) {
      const { error: updateError } = await supabase
        .from('staff')
        .update(payload)
        .eq('id', editingId);

      if (updateError) {
        alert('Update error: ' + updateError.message);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from('staff')
        .insert([payload]);

      if (insertError) {
        alert('Insert error: ' + insertError.message);
        return;
      }
    }

    setForm({ first_name: '', last_name: '', email: '', role: '' });
    setEditingId(null);
    setModalOpen(false);
    loadStaff();
  };

  const handleEdit = (staff) => {
    setForm({
      first_name: staff.first_name,
      last_name: staff.last_name,
      email: staff.email,
      role: staff.role || ''
    });
    setEditingId(staff.id);
    setModalOpen(true);
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const rows = results.data
          .filter(r => r.first_name && r.last_name && r.email)
          .map(r => ({
            first_name: r.first_name,
            last_name: r.last_name,
            email: r.email,
            role: r.role || '',
            venue_id: venueId
          }));

        if (rows.length) await supabase.from('staff').insert(rows);
        loadStaff();
        setUploading(false);
      },
    });
  };

  const handleDownloadCSV = () => {
    const csv = Papa.unparse(staffList);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'staff_list.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    await supabase.from('staff').delete().eq('id', id);
    loadStaff();
  };

  const handleSearch = (term) => {
    const lowered = term.toLowerCase();
    const filtered = staffList.filter(
      (s) =>
        s.first_name.toLowerCase().includes(lowered) ||
        s.last_name.toLowerCase().includes(lowered) ||
        s.email.toLowerCase().includes(lowered)
    );
    setFilteredStaff(filtered);
    setCurrentPage(1);
  };

  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <PageContainer>
      <h1 className="text-3xl font-bold mb-6">Manage Staff</h1>

      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <input
            type="text"
            placeholder="Search staff..."
            className="border p-3 rounded-xl w-full max-w-md focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={() => { setModalOpen(true); setForm({ first_name: '', last_name: '', email: '', role: '' }); setEditingId(null); }}
            className="bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-all font-semibold"
          >
            Add Staff Member
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Staff List</h2>
            <button onClick={handleDownloadCSV} className="text-sm text-blue-600 hover:underline font-medium">Download CSV</button>
          </div>

          {paginatedStaff.length === 0 ? (
            <p className="text-sm text-gray-500">No staff members found.</p>
          ) : (
            <table className="w-full text-sm table-auto">
              <thead>
                <tr className="border-b bg-gray-100 text-left">
                  <th className="py-3 px-2">Name</th>
                  <th className="py-3 px-2">Email</th>
                  <th className="py-3 px-2">Job Title</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStaff.map((staff, index) => (
                  <tr key={staff.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b`}>
                    <td className="py-3 px-2">{staff.first_name} {staff.last_name}</td>
                    <td className="py-3 px-2">{staff.email}</td>
                    <td className="py-3 px-2">{staff.role}</td>
                    <td className="py-3 px-2 text-right space-x-3">
                      <button onClick={() => handleEdit(staff)} className="text-blue-600 hover:underline text-sm">Edit</button>
                      <button onClick={() => handleDelete(staff.id)} className="text-red-600 hover:underline text-sm">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="flex justify-between items-center pt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="text-sm px-4 py-2 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm font-medium">Page {currentPage}</span>
            <button
              onClick={() => setCurrentPage((prev) =>
                prev * itemsPerPage < filteredStaff.length ? prev + 1 : prev
              )}
              disabled={currentPage * itemsPerPage >= filteredStaff.length}
              className="text-sm px-4 py-2 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative space-y-6">
            <button
              className="absolute top-3 right-4 text-gray-500 hover:text-black"
              onClick={() => setModalOpen(false)}
            >
              ✕
            </button>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{editingId ? 'Edit Staff' : 'Add Staff'}</h2>
              <label className="text-sm text-blue-600 hover:underline cursor-pointer">
                Upload CSV
                <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
              </label>
            </div>

            <form onSubmit={handleAddOrUpdateStaff} className="grid grid-cols-1 gap-4">
              <input name="first_name" placeholder="First Name*" value={form.first_name} onChange={handleFormChange} className="border p-3 rounded-xl focus:ring-2 focus:ring-blue-500" required />
              <input name="last_name" placeholder="Last Name*" value={form.last_name} onChange={handleFormChange} className="border p-3 rounded-xl focus:ring-2 focus:ring-blue-500" required />
              <input name="email" placeholder="Email*" value={form.email} onChange={handleFormChange} className="border p-3 rounded-xl focus:ring-2 focus:ring-blue-500" required />
              <input name="role" placeholder="Role (optional)" value={form.role} onChange={handleFormChange} className="border p-3 rounded-xl focus:ring-2 focus:ring-blue-500" />
              <button type="submit" className="bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-all font-semibold">
                {editingId ? 'Update Staff' : 'Add Staff'}
              </button>
            </form>

            {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default StaffPage;