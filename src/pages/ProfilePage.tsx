import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaBoxOpen, FaHeart, FaRegAddressBook, FaSignOutAlt, FaBars, FaEdit, FaEllipsisV, FaTimes, FaTrash } from 'react-icons/fa';
import { WishlistSection } from '@/components/profile/WishlistSection';
import { OrdersSection } from '@/components/profile/OrdersSection';
import { Button } from "@/components/ui/button";
import { BASE_URL } from '@/config';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type TabType = 'profileInfo' | 'addresses' | 'wishlist' | 'orders';

const SIDEBAR_ITEMS = [
  { key: 'profileInfo' as TabType, label: 'Profile Information', icon: <FaUser /> },
  { key: 'addresses' as TabType, label: 'Manage Addresses', icon: <FaRegAddressBook /> },
  { key: 'wishlist' as TabType, label: 'My Wishlist', icon: <FaHeart /> },
  { key: 'orders' as TabType, label: 'My Orders', icon: <FaBoxOpen /> },
];

const mockAddresses = [
  {
    id: 'A1',
    label: 'WORK',
    name: 'Jairam Bontu',
    phone: '9392273983',
    address: 'Centurion university, vizianagaram, Nellimarla, AP - 535003',
  },
  {
    id: 'A2',
    label: 'WORK',
    name: 'Bonthu Jayaram',
    phone: '9392273983',
    address: 'Bhargavi boys hostel, Jatni Road, Odisha - 752050',
  },
];

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    // Initialize activeTab from location state if available
    return (location.state?.activeTab as TabType) || 'profileInfo';
  });
  const [showMenu, setShowMenu] = useState(false);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    gender: '',
    email: '',
    phone: ''
  });
  const [editing, setEditing] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: 'HOME',
    name: '',
    phone: '',
    address: ''
  });
  const [addresses, setAddresses] = useState([]);
  const [editingAddress, setEditingAddress] = useState(null);
  const [editAddressForm, setEditAddressForm] = useState({
    label: 'HOME',
    name: '',
    phone: '',
    address: ''
  });
  const [menuOpenId, setMenuOpenId] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/users/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch user data');
        const data = await response.json();
        setForm({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          gender: data.gender || '',
          email: data.email || '',
          phone: data.phone || ''
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const fetchAddresses = async () => {
      try {
        const response = await fetch(`${BASE_URL}/users/${user.id}/addresses`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch addresses');
        const data = await response.json();
        setAddresses(data);
      } catch (error) {
        console.error('Error fetching addresses:', error);
      }
    };

    if (user?.id) {
      fetchUserData();
      fetchAddresses();
    }
  }, [user]);

  // Update activeTab when location state changes
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      const response = await fetch(`${BASE_URL}/users/${user.id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(form)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleDeleteAddress = (id) => {
    fetch(`${BASE_URL}/users/${user.id}/addresses/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => {
        if (res.ok) {
          setAddresses(addresses.filter(a => a.id !== id));
          setMenuOpenId(null);
        }
      });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEditAddress = async () => {
    try {
      const response = await fetch(`${BASE_URL}/users/${user.id}/addresses/${editingAddress.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editAddressForm)
      });

      if (!response.ok) {
        throw new Error('Failed to update address');
      }

      setAddresses(addresses.map(addr => 
        addr.id === editingAddress.id ? { ...editAddressForm, id: addr.id } : addr
      ));
      setEditingAddress(null);
      setEditAddressForm({ label: 'HOME', name: '', phone: '', address: '' });
    } catch (error) {
      console.error('Error updating address:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profileInfo':
        return (
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 animate-fadein mb-20 md:mb-6">
            <div className="flex justify-between items-center mb-6 w-full">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">Profile Information</h2>
              <button
                onClick={() => setEditing(!editing)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 ml-auto"
              >
                <FaEdit />
                <span>{editing ? 'Cancel' : 'Edit'}</span>
              </button>
            </div>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-blue-800 text-sm whitespace-normal break-words font-semibold">First Name</label>
                <input
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  disabled={!editing}
                  className="mt-1 w-full border border-blue-200 rounded-lg px-3 py-2 text-base text-gray-900 focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                />
              </div>
              <div>
                <label className="text-blue-800 text-sm whitespace-normal break-words font-semibold">Last Name</label>
                <input
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  disabled={!editing}
                  className="mt-1 w-full border border-blue-200 rounded-lg px-3 py-2 text-base text-gray-900 focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-blue-800 text-sm whitespace-normal break-words font-semibold">Gender</label>
                <div className="mt-2 flex gap-6 flex-wrap">
                  <label className="flex items-center gap-2 whitespace-normal break-words text-blue-700">
                    <input
                      type="radio"
                      name="gender"
                      value="Male"
                      checked={form.gender === "Male"}
                      onChange={handleChange}
                      disabled={!editing}
                    /> Male
                  </label>
                  <label className="flex items-center gap-2 whitespace-normal break-words text-blue-700">
                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      checked={form.gender === "Female"}
                      onChange={handleChange}
                      disabled={!editing}
                    /> Female
                  </label>
                  <label className="flex items-center gap-2 whitespace-normal break-words text-blue-700">
                    <input
                      type="radio"
                      name="gender"
                      value="Other"
                      checked={form.gender === "Other"}
                      onChange={handleChange}
                      disabled={!editing}
                    /> Other
                  </label>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="text-blue-800 text-sm whitespace-normal break-words font-semibold">Email Address</label>
                <input
                  name="email"
                  value={user?.email || form.email}
                  disabled={true}
                  className="mt-1 w-full border border-blue-200 rounded-lg px-3 py-2 text-base text-gray-500 bg-gray-50 cursor-not-allowed"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-blue-800 text-sm whitespace-normal break-words font-semibold">Mobile Number</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  disabled={!editing}
                  className="mt-1 w-full border border-blue-200 rounded-lg px-3 py-2 text-base text-gray-900 focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                />
              </div>
              <div className="md:col-span-2 flex justify-end pb-4 md:pb-0">
                {editing && (
                  <button
                    type="button"
                    onClick={handleSave}
                    className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-8 py-2 rounded-lg font-bold shadow-lg hover:scale-105 transition"
                  >
                    Save Changes
                  </button>
                )}
              </div>
            </form>
          </div>
        );
      case 'addresses':
        return (
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 animate-fadein mb-20 md:mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-center w-full mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">My Addresses</h2>
              <button
                onClick={() => setShowAddressModal(true)}
                className="w-full sm:w-auto mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold"
              >
                Add New Address
              </button>
            </div>
            <div className="space-y-4 pb-4 md:pb-0">
              {addresses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No addresses added yet
                </div>
              ) : (
                addresses.map((addr) => (
                  <div key={addr.id} className="border border-gray-200 rounded-xl p-4 shadow-sm relative bg-white hover:shadow-md transition-all duration-200">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="bg-blue-100 text-xs font-bold px-2 py-1 rounded text-blue-900">
                            {addr.label}
                          </span>
                          <span className="font-semibold text-gray-900">{addr.name}</span>
                        </div>
                        <div className="text-gray-600 text-sm mb-1">{addr.phone}</div>
                        <div className="text-gray-600 text-sm break-words">{addr.address}</div>
                      </div>
                      <button
                        className="text-gray-400 hover:text-gray-600 p-1"
                        onClick={() => setMenuOpenId(addr.id === menuOpenId ? null : addr.id)}
                      >
                        <FaEllipsisV size={16} />
                      </button>
                      {menuOpenId === addr.id && (
                        <div className="absolute right-0 top-10 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            onClick={() => {
                              setEditingAddress(addr);
                              setEditAddressForm({
                                label: addr.label,
                                name: addr.name,
                                phone: addr.phone,
                                address: addr.address
                              });
                              setMenuOpenId(null);
                            }}
                          >
                            <FaEdit size={14} />
                            Edit
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                            onClick={() => handleDeleteAddress(addr.id)}
                          >
                            <FaTrash size={14} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      case 'wishlist':
        return <WishlistSection />;
      case 'orders':
        return <OrdersSection />;
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 overflow-x-hidden">
      {/* Mobile Header */}
      <div className="md:hidden bg-gradient-to-r from-blue-600 to-blue-400 p-4 flex justify-between items-center shadow-lg fixed top-0 left-0 right-0 z-40">
        <h1 className="text-xl font-bold text-white">My Profile</h1>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="text-white focus:outline-none"
        >
          <FaBars className="w-6 h-6" />
        </button>
      </div>

      <div className="flex min-h-screen pt-0 md:pt-0">
        {/* Sidebar */}
        <div className={`fixed md:static w-full md:w-[280px] h-[100vh] md:h-auto bg-white shadow-lg transform transition-transform duration-200 ease-in-out z-30 top-0 md:top-auto ${
          showMenu ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } md:mt-8 md:ml-8`}>
          <div className="p-6 rounded-2xl bg-white shadow-xl mt-[56px] md:mt-0">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-xl md:text-2xl font-bold text-blue-600">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900 break-words">{user?.name || 'User'}</h2>
                <p className="text-sm text-gray-500 break-words">{user?.email}</p>
              </div>
              <button
                onClick={() => setShowMenu(false)}
                className="ml-auto text-gray-400 hover:text-gray-600 md:hidden"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>

            <nav className="space-y-1.5">
              {SIDEBAR_ITEMS.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setActiveTab(item.key);
                    setShowMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                    activeTab === item.key
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  <span className="text-base">{item.label}</span>
                </button>
              ))}

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 rounded-lg"
                  >
                    <FaSignOutAlt className="w-4 h-4" />
                    <span className="text-base">Logout</span>
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-semibold">Are you sure you want to logout?</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600">
                      You will need to login again to access your account.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-900">
                      No, cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleLogout}
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      Yes, logout
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 md:ml-8 w-full">
          <div className="max-w-5xl mx-auto">
            {/* Profile Info Section */}
            {activeTab === 'profileInfo' && (
              <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 animate-fadein mb-20 md:mb-6">
                <div className="flex justify-between items-center mb-6 w-full">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">Profile Information</h2>
                  <button
                    onClick={() => setEditing(!editing)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 ml-auto"
                  >
                    <FaEdit />
                    <span>{editing ? 'Cancel' : 'Edit'}</span>
                  </button>
                </div>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-blue-800 text-sm whitespace-normal break-words font-semibold">First Name</label>
                    <input
                      name="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      disabled={!editing}
                      className="mt-1 w-full border border-blue-200 rounded-lg px-3 py-2 text-base text-gray-900 focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="text-blue-800 text-sm whitespace-normal break-words font-semibold">Last Name</label>
                    <input
                      name="last_name"
                      value={form.last_name}
                      onChange={handleChange}
                      disabled={!editing}
                      className="mt-1 w-full border border-blue-200 rounded-lg px-3 py-2 text-base text-gray-900 focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-blue-800 text-sm whitespace-normal break-words font-semibold">Gender</label>
                    <div className="mt-2 flex gap-6 flex-wrap">
                      <label className="flex items-center gap-2 whitespace-normal break-words text-blue-700">
                        <input
                          type="radio"
                          name="gender"
                          value="Male"
                          checked={form.gender === "Male"}
                          onChange={handleChange}
                          disabled={!editing}
                        /> Male
                      </label>
                      <label className="flex items-center gap-2 whitespace-normal break-words text-blue-700">
                        <input
                          type="radio"
                          name="gender"
                          value="Female"
                          checked={form.gender === "Female"}
                          onChange={handleChange}
                          disabled={!editing}
                        /> Female
                      </label>
                      <label className="flex items-center gap-2 whitespace-normal break-words text-blue-700">
                        <input
                          type="radio"
                          name="gender"
                          value="Other"
                          checked={form.gender === "Other"}
                          onChange={handleChange}
                          disabled={!editing}
                        /> Other
                      </label>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-blue-800 text-sm whitespace-normal break-words font-semibold">Email Address</label>
                    <input
                      name="email"
                      value={user?.email || form.email}
                      disabled={true}
                      className="mt-1 w-full border border-blue-200 rounded-lg px-3 py-2 text-base text-gray-500 bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-blue-800 text-sm whitespace-normal break-words font-semibold">Mobile Number</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      disabled={!editing}
                      className="mt-1 w-full border border-blue-200 rounded-lg px-3 py-2 text-base text-gray-900 focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end pb-4 md:pb-0">
                    {editing && (
                      <button
                        type="button"
                        onClick={handleSave}
                        className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-8 py-2 rounded-lg font-bold shadow-lg hover:scale-105 transition"
                      >
                        Save Changes
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* Addresses Section */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 animate-fadein mb-20 md:mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-center w-full mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">My Addresses</h2>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="w-full sm:w-auto mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold"
                  >
                    Add New Address
                  </button>
                </div>
                <div className="space-y-4 pb-4 md:pb-0">
                  {addresses.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No addresses added yet
                    </div>
                  ) : (
                    addresses.map((addr) => (
                      <div key={addr.id} className="border border-gray-200 rounded-xl p-4 shadow-sm relative bg-white hover:shadow-md transition-all duration-200">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="bg-blue-100 text-xs font-bold px-2 py-1 rounded text-blue-900">
                                {addr.label}
                              </span>
                              <span className="font-semibold text-gray-900">{addr.name}</span>
                            </div>
                            <div className="text-gray-600 text-sm mb-1">{addr.phone}</div>
                            <div className="text-gray-600 text-sm break-words">{addr.address}</div>
                          </div>
                          <button
                            className="text-gray-400 hover:text-gray-600 p-1"
                            onClick={() => setMenuOpenId(addr.id === menuOpenId ? null : addr.id)}
                          >
                            <FaEllipsisV size={16} />
                          </button>
                          {menuOpenId === addr.id && (
                            <div className="absolute right-0 top-10 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                onClick={() => {
                                  setEditingAddress(addr);
                                  setEditAddressForm({
                                    label: addr.label,
                                    name: addr.name,
                                    phone: addr.phone,
                                    address: addr.address
                                  });
                                  setMenuOpenId(null);
                                }}
                              >
                                <FaEdit size={14} />
                                Edit
                              </button>
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                                onClick={() => handleDeleteAddress(addr.id)}
                              >
                                <FaTrash size={14} />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Address Modal */}
            {showAddressModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-3xl shadow-xl p-5 w-full max-w-[400px] mx-4 animate-fadein">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Add New Address</h3>
                    <button 
                      onClick={() => setShowAddressModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FaTimes size={16} />
                    </button>
                  </div>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        const response = await fetch(`${BASE_URL}/users/${user.id}/addresses`, {
                          method: 'POST',
                          headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                          },
                          body: JSON.stringify(addressForm)
                        });

                        if (!response.ok) {
                          throw new Error('Failed to add address');
                        }

                        const data = await response.json();
                        setAddresses([...addresses, { ...addressForm, id: data.id }]);
                        setAddressForm({ label: 'HOME', name: '', phone: '', address: '' });
                        setShowAddressModal(false);
                      } catch (error) {
                        console.error('Error adding address:', error);
                      }
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm text-gray-700 mb-1.5">
                        Address Type
                      </label>
                      <select
                        value={addressForm.label}
                        onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                        className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                      >
                        <option value="HOME">Home</option>
                        <option value="WORK">Work</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={addressForm.name}
                        onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                        className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1.5">
                        Address
                      </label>
                      <textarea
                        value={addressForm.address}
                        onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                        className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                        rows={3}
                        placeholder="Enter your address"
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setShowAddressModal(false)}
                        className="px-5 py-2 text-gray-700 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors text-sm"
                      >
                        Save Address
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Edit Address Modal */}
            {editingAddress && (
              <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center bg-black/50 pt-4 pb-20 md:py-4 px-4 overflow-y-auto scrollbar-hide">
                <div className="bg-white rounded-3xl shadow-xl p-5 w-full max-w-[400px] mx-auto my-auto relative">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Edit Address</h3>
                    <button 
                      onClick={() => {
                        setEditingAddress(null);
                        setEditAddressForm({ label: 'HOME', name: '', phone: '', address: '' });
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FaTimes size={16} />
                    </button>
                  </div>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      await handleEditAddress();
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm text-gray-700 mb-1.5">
                        Address Type
                      </label>
                      <select
                        value={editAddressForm.label}
                        onChange={(e) => setEditAddressForm({ ...editAddressForm, label: e.target.value })}
                        className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm appearance-none"
                      >
                        <option value="HOME">Home</option>
                        <option value="WORK">Work</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={editAddressForm.name}
                        onChange={(e) => setEditAddressForm({ ...editAddressForm, name: e.target.value })}
                        className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={editAddressForm.phone}
                        onChange={(e) => setEditAddressForm({ ...editAddressForm, phone: e.target.value })}
                        className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1.5">
                        Address
                      </label>
                      <textarea
                        value={editAddressForm.address}
                        onChange={(e) => setEditAddressForm({ ...editAddressForm, address: e.target.value })}
                        className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                        rows={3}
                        placeholder="Enter your address"
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAddress(null);
                          setEditAddressForm({ label: 'HOME', name: '', phone: '', address: '' });
                        }}
                        className="px-5 py-2 text-gray-700 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors text-sm"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Other sections */}
            {activeTab === 'wishlist' && <WishlistSection />}
            {activeTab === 'orders' && <OrdersSection />}
          </div>
        </main>
      </div>

      {/* Backdrop for mobile menu */}
      {showMenu && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20" 
          onClick={() => setShowMenu(false)} 
        />
      )}
      <style>{`
        .animate-fadein {
          animation: fadein 0.7s cubic-bezier(.4,0,.2,1);
        }
        @keyframes fadein {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: none; }
        }
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;  /* Chrome, Safari and Opera */
        }
      `}</style>
    </div>
  );
};

export default ProfilePage; 
