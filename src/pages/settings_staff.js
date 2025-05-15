import React, { useEffect, useState } from 'react';
import supabase from '../utils/supabase';
import PageContainer from '../components/PageContainer';
import Papa from 'papaparse';
import { useVenue } from '../context/VenueContext';

const StaffPage = () => {
  const { venueId } = useVenue();
  const [staffList, setStaffList] = useState([]);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', role: '' });
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (venueId) loadStaff();
  }, [venueId]);

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
    if (!form.first_name || !form.last_name || !form.email) return;

    if (editingId) {
      await supabase.from('staff').update(form).eq('id', editingId);
    } else {
      await supabase.from('staff').insert([{ ...form, venue_id: venueId }]);
    }

    setForm({ first_name: '', last_name: '', email: '', role: '' });
    setEditingId(null);
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

  return (
    <PageContainer>
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Manage Staff</h1>

      <div className="bg-white p-4 rounded-lg shadow border">
        <h2 className="text-lg font-semibold mb-2">{editingId ? 'Edit Staff Member' : 'Add Staff Member'}</h2>
        <form onSubmit={handleAddOrUpdateStaff} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="first_name" placeholder="First Name*" value={form.first_name} onChange={handleFormChange} className="border p-2 rounded" required />
          <input name="last_name" placeholder="Last Name*" value={form.last_name} onChange={handleFormChange} className="border p-2 rounded" required />
          <input name="email" placeholder="Email*" value={form.email} onChange={handleFormChange} className="border p-2 rounded col-span-2" required />
          <input name="role" placeholder="Role (optional)" value={form.role} onChange={handleFormChange} className="border p-2 rounded col-span-2" />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded col-span-2 hover:bg-blue-700">
            {editingId ? 'Update Staff' : 'Add Staff'}
          </button>
        </form>
      </div>

      <div className="bg-white p-4 rounded-lg shadow border">
        <h2 className="text-lg font-semibold mb-2">Upload CSV</h2>
        <input type="file" accept=".csv" onChange={handleCSVUpload} className="mb-2" />
        {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
      </div>

      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Staff List</h2>
          <button onClick={handleDownloadCSV} className="text-sm text-blue-600 hover:underline">Download CSV</button>
        </div>
        {staffList.length === 0 ? (
          <p className="text-sm text-gray-500">No staff members yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Name</th>
                <th className="py-2">Email</th>
                <th className="py-2">Role</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map(staff => (
                <tr key={staff.id} className="border-b">
                  <td className="py-2">{staff.first_name} {staff.last_name}</td>
                  <td className="py-2">{staff.email}</td>
                  <td className="py-2">{staff.role}</td>
                  <td className="py-2 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(staff)}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(staff.id)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
    </PageContainer>
  );
};

export default StaffPage;