import React, { useState, useRef } from 'react';
import { Download, LogOut, User, FileText, Plus, Trash2, Eye, Edit, History } from 'lucide-react';
import { useEffect } from 'react';
import Image from 'next/image'

export default function BillingApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const printRef = useRef();

  // Default admin credentials (in production, use proper authentication)
  const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedIn);
    }
  }, []);
  const [billData, setBillData] = useState({
    id: null,
    invoiceNo: '',
    date: new Date().toISOString().split('T')[0],
    createdAt: null,

    // Bill To Party
    billToName: '',
    billToAddress: '',
    billToGSTIN: '',
    billToState: '',
    billToCode: '',

    // Ship To Party
    shipToName: '',
    shipToAddress: '',
    shipToGSTIN: '',
    shipToState: '',
    shipToCode: '',

    // Products
    products: [
      { id: 1, description: '', pcs: '', ctsGm: '', rate: '', amount: '' }
    ],

    // Tax
    cgst: '',
    sgst: '',
    igst: ''
  });

  const [billHistory, setBillHistory] = useState([]);

  const handleLogin = (e) => {
    e.preventDefault();

    if (
      credentials.username === ADMIN_CREDENTIALS.username &&
      credentials.password === ADMIN_CREDENTIALS.password
    ) {
      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true'); // ✅ persist login
      setLoginError('');
    } else {
      setLoginError('Invalid username or password');
    }
  };


  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn'); // ✅ clear persistence
    setCredentials({ username: '', password: '' });
    setShowPreview(false);
  };


  const handleInputChange = (field, value) => {
    setBillData(prev => ({ ...prev, [field]: value }));
  };

  const handleProductChange = (id, field, value) => {
    setBillData(prev => ({
      ...prev,
      products: prev.products.map(product => {
        if (product.id === id) {
          const updated = { ...product, [field]: value };

          // Auto-calculate amount
          if (field === 'ctsGm' || field === 'rate') {
            const ctsGm = parseFloat(field === 'ctsGm' ? value : product.ctsGm) || 0;
            const rate = parseFloat(field === 'rate' ? value : product.rate) || 0;
            updated.amount = (ctsGm * rate).toFixed(2);
          }

          return updated;
        }
        return product;
      })
    }));
  };

  const addProduct = () => {
    setBillData(prev => ({
      ...prev,
      products: [...prev.products, {
        id: Date.now(),
        description: '',
        pcs: '',
        ctsGm: '',
        rate: '',
        amount: ''
      }]
    }));
  };

  const removeProduct = (id) => {
    if (billData.products.length > 1) {
      setBillData(prev => ({
        ...prev,
        products: prev.products.filter(p => p.id !== id)
      }));
    }
  };

  const calculateTotal = () => {
    return billData.products.reduce((sum, product) => {
      return sum + (parseFloat(product.amount) || 0);
    }, 0).toFixed(2);
  };

  const calculateTotalWithTax = () => {
    const total = parseFloat(calculateTotal());
    const cgst = parseFloat(billData.cgst) || 0;
    const sgst = parseFloat(billData.sgst) || 0;
    const igst = parseFloat(billData.igst) || 0;
    return (total + cgst + sgst + igst).toFixed(2);
  };

  const handlePrint = () => {
    window.print();
  };

  const resetForm = () => {
    setBillData({
      id: null,
      invoiceNo: '',
      date: new Date().toISOString().split('T')[0],
      createdAt: null,
      billToName: '',
      billToAddress: '',
      billToGSTIN: '',
      billToState: '',
      billToCode: '',
      shipToName: '',
      shipToAddress: '',
      shipToGSTIN: '',
      shipToState: '',
      shipToCode: '',
      products: [
        { id: 1, description: '', pcs: '', ctsGm: '', rate: '', amount: '' }
      ],
      cgst: '',
      sgst: '',
      igst: ''
    });
    setShowPreview(false);
  };

  const generateBill = () => {
    if (!billData.invoiceNo || !billData.billToName) {
      alert('Please fill in at least Invoice No. and Bill To Name');
      return;
    }

    // Create a copy with ID and timestamp
    const billToSave = {
      ...billData,
      id: billData.id || Date.now(),
      createdAt: billData.createdAt || new Date().toISOString()
    };

    // Update or add to history
    setBillHistory(prev => {
      const existingIndex = prev.findIndex(b => b.id === billToSave.id);
      if (existingIndex >= 0) {
        // Update existing
        const updated = [...prev];
        updated[existingIndex] = billToSave;
        return updated;
      } else {
        // Add new
        return [billToSave, ...prev];
      }
    });

    setBillData(billToSave);
    setShowPreview(true);

    // Scroll to preview
    setTimeout(() => {
      document.getElementById('bill-preview')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const editBill = () => {
    setShowPreview(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadBillFromHistory = (bill) => {
    setBillData({ ...bill });
    setShowPreview(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteBillFromHistory = (billId) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      setBillHistory(prev => prev.filter(b => b.id !== billId));

      // If currently viewing this bill, reset form
      if (billData.id === billId) {
        resetForm();
      }
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[url('/images/gems-bg.jpg')] bg-cover bg-center flex items-center justify-center p-4">
        <div className="bg-white backdrop-blur-lg rounded-lg shadow-2xl p-8 w-full max-w-md border border-white/30">
          <div className="text-center">
            <div className="inline-block mb-4">
              <Image
                src="/images/rg-full-logo.png"
                width={150}
                height={150}
                alt="Rashmi Gems"
              />
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Username
              </label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Password
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter password"
                required
              />
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Login
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-black hidden">
            <p>Demo credentials:</p>
            <p>Username: <span className="font-mono">admin</span></p>
            <p>Password: <span className="font-mono">admin123</span></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <style jsx global>{`
      @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        @page {
            size: auto;
            margin: 0;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-print-area,
          #invoice-print-area * {
            visibility: visible;
          }
          #invoice-print-area {
            position: absolute;
            border: none !important;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="bg-white shadow-md no-print">
        <div className="max-w-full mx-auto px-4 py-4">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <Image
                src="/images/rg-Logo.png"
                width={80}
                height={80}
                alt="Rashmi Gems"
              />
              <h1 className="text-2xl font-bold text-gray-800">Rashmi Gems</h1>
            </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => {
                setShowHistory(false);
                setShowPreview(false);
              }}
              className={`px-6 py-3 font-medium transition-colors ${!showHistory
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              Create Invoice
            </button>
            <button
              onClick={() => setShowHistory(true)}
              className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 ${showHistory
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              <History className="w-5 h-5" />
              Bill History ({billHistory.length})
            </button>
          </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-[#2a2e37] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>

        </div>
      </div>

      <div className="p-6 bg-[url('/images/gems-img.jpg')] bg-cover bg-left h-full">
        {showHistory ? (
          /* Bill History Section */
          <div className="bg-white rounded-lg shadow-md p-6 max-w-7xl mx-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Invoice History</h2>

            {billHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No invoices yet</p>
                <p className="text-sm mt-2">Create your first invoice to see it here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-3 text-left">Invoice No.</th>
                      <th className="border border-gray-300 px-4 py-3 text-left">Date</th>
                      <th className="border border-gray-300 px-4 py-3 text-left">Bill To</th>
                      <th className="border border-gray-300 px-4 py-3 text-right">Amount</th>
                      <th className="border border-gray-300 px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billHistory.map((bill) => {
                      const total = bill.products.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
                      const taxes = (parseFloat(bill.cgst) || 0) + (parseFloat(bill.sgst) || 0) + (parseFloat(bill.igst) || 0);
                      const finalAmount = (total + taxes).toFixed(2);

                      return (
                        <tr key={bill.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 font-medium">{bill.invoiceNo}</td>
                          <td className="border border-gray-300 px-4 py-3">{bill.date}</td>
                          <td className="border border-gray-300 px-4 py-3">{bill.billToName}</td>
                          <td className="border border-gray-300 px-4 py-3 text-right">₹{finalAmount}</td>
                          <td className="border border-gray-300 px-4 py-3">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => {
                                  loadBillFromHistory(bill);
                                  setShowHistory(false);
                                }}
                                className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => deleteBillFromHistory(bill.id)}
                                className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* Create Invoice Section */
          <>
            {/* Form Section */}
            <div className="bg-white rounded-lg shadow-md p-12 mb-6 no-print max-w-7xl mx-auto">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Invoice Details</h2>

              {/* Invoice Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice No.</label>
                  <input
                    type="number"
                    value={billData.invoiceNo}
                    onChange={(e) => handleInputChange('invoiceNo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={billData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Bill To and Ship To */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Bill To Party */}
                <div className="border border-gray-300 rounded-lg p-4">
                  <h3 className="font-semibold text-black mb-3 bg-[#4b86d833] px-3 py-2 rounded">Bill To Party</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Name"
                      value={billData.billToName}
                      onChange={(e) => handleInputChange('billToName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <textarea
                      placeholder="Address"
                      value={billData.billToAddress}
                      onChange={(e) => handleInputChange('billToAddress', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      rows="2"
                    />
                    <input
                      type="text"
                      placeholder="GSTIN"
                      value={billData.billToGSTIN}
                      onChange={(e) => handleInputChange('billToGSTIN', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="State"
                        value={billData.billToState}
                        onChange={(e) => handleInputChange('billToState', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="number"
                        placeholder="Code"
                        value={billData.billToCode}
                        onChange={(e) => handleInputChange('billToCode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Ship To Party */}
                <div className="border border-gray-300 rounded-lg p-4">
                  <h3 className="font-semibold text-black mb-3 bg-[#4b86d833] px-3 py-2 rounded">Ship To Party</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Name"
                      value={billData.shipToName}
                      onChange={(e) => handleInputChange('shipToName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <textarea
                      placeholder="Address"
                      value={billData.shipToAddress}
                      onChange={(e) => handleInputChange('shipToAddress', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      rows="2"
                    />
                    <input
                      type="text"
                      placeholder="GSTIN"
                      value={billData.shipToGSTIN}
                      onChange={(e) => handleInputChange('shipToGSTIN', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="State"
                        value={billData.shipToState}
                        onChange={(e) => handleInputChange('shipToState', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="number"
                        placeholder="Code"
                        value={billData.shipToCode}
                        onChange={(e) => handleInputChange('shipToCode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Table */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-800">Products</h3>
                  <button
                    onClick={addProduct}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Product
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-[#4b86d833]">
                        <th className="border border-gray-300 px-3 py-2 text-left">S.No</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Product Description</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Pcs.</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Cts/Gm</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Rate</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Amount</th>
                        <th className="border border-gray-300 px-3 py-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billData.products.map((product, index) => (
                        <tr key={product.id}>
                          <td className="border border-gray-300 px-3 py-2">{index + 1}</td>
                          <td className="border border-gray-300 px-3 py-2">
                            <input
                              type="text"
                              value={product.description}
                              onChange={(e) => handleProductChange(product.id, 'description', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                              placeholder="OPAL"
                            />
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <input
                              type="number"
                              value={product.pcs}
                              onChange={(e) => handleProductChange(product.id, 'pcs', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                              placeholder="1"
                            />
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <input
                              type="number"
                              step="0.01"
                              value={product.ctsGm}
                              onChange={(e) => handleProductChange(product.id, 'ctsGm', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                              placeholder="3.00"
                            />
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <input
                              type="number"
                              step="0.01"
                              value={product.rate}
                              onChange={(e) => handleProductChange(product.id, 'rate', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                              placeholder="1500"
                            />
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <input
                              type="text"
                              value={product.amount}
                              readOnly
                              className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded"
                            />
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center">
                            <button
                              onClick={() => removeProduct(product.id)}
                              className="text-red-600 hover:text-red-800"
                              disabled={billData.products.length === 1}
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div></div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Amount:</span>
                    <span className="text-lg font-bold">₹{calculateTotal()}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">CGST</label>
                      <input
                        type="number"
                        step="0.01"
                        value={billData.cgst}
                        onChange={(e) => handleInputChange('cgst', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">SGST</label>
                      <input
                        type="number"
                        step="0.01"
                        value={billData.sgst}
                        onChange={(e) => handleInputChange('sgst', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">IGST</label>
                      <input
                        type="number"
                        step="0.01"
                        value={billData.igst}
                        onChange={(e) => handleInputChange('igst', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t-2 border-gray-300">
                    <span className="font-bold text-lg">Total Amount After Tax:</span>
                    <span className="text-xl font-bold text-indigo-600">₹{calculateTotalWithTax()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={generateBill}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <Eye className="w-5 h-5" />
                  Generate Bill
                </button>
                <button
                  onClick={resetForm}
                  className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Reset Form
                </button>
              </div>
            </div>

            {/* Bill Preview Section */}
            {showPreview && (
              <div id="bill-preview" className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6 no-print">
                  <h2 className="text-xl font-bold text-gray-800">Invoice Preview</h2>
                  <div className="flex gap-3">
                    <button
                      onClick={editBill}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                      Edit
                    </button>
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      Print
                    </button>
                  </div>
                </div>

                {/* Invoice Display */}
                <div id="invoice-print-area" ref={printRef} className="border-2 border-gray-800 p-8 bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
                  {/* Header */}
                  <div className="border-b-2 border-gray-800 pb-4 mb-4">
                    <div className="flex justify-between items-start mb-10">
                      <div className="text-xs">
                        <div className="font-semibold">GSTIN: 08BQBPR6927D1ZP</div>
                      </div>
                      <div className="text-xs text-center">
                        <div>|| श्रीराज श्यामा जी सदा सहायते ||</div>
                        <div>|| प्रणामजी ||</div>
                      </div>
                      <div className="text-xs text-right font-bold">
                        <div>Vimal Patel: 9351115678</div>
                        <div>Dixit Patel: 9571079175</div>
                      </div>
                    </div>  

                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-gray-900 mb-2">RASHMI GEMS</h1>
                      <div className="bg-gray-800 text-white py-1 px-4 inline-block mb-2">
                        PRECIOUS & SEMI PRECIOUS STONES
                      </div>
                      <div className="text-xs mt-2">
                        2019, Pitelyon Ka Chowk, Johari Bazar, Jaipur -302003 (Raj.) INDIA<br />
                        Web: www.rashmigems.com • E-mail: rashmigemsjpr@gmail.com
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4 text-sm">
                      <div>No. <span className="font-bold">{billData.invoiceNo}</span></div>
                      <div className="font-bold">APPROVAL MEMO / TAX INVOICE</div>
                      <div>Date: <span className="font-bold">{billData.date}</span></div>
                    </div>
                  </div>

                  {/* Party Information */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* Bill To Party */}
                    <div className="border border-gray-800">
                      <div className="bg-gray-700 text-white px-3 py-2 font-semibold text-sm">
                        Bill To Party
                      </div>
                      <div className="p-3 text-sm space-y-1">
                        <div><span className="font-semibold">Name:</span> {billData.billToName}</div>
                        <div><span className="font-semibold">Address:</span> {billData.billToAddress}</div>
                        <div><span className="font-semibold">GSTIN:</span> {billData.billToGSTIN}</div>
                        <div>
                          <span className="font-semibold">State:</span> {billData.billToState}
                          {billData.billToCode && <span className="ml-4"><span className="font-semibold">Code:</span> {billData.billToCode}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Ship To Party */}
                    <div className="border border-gray-800">
                      <div className="bg-gray-700 text-white px-3 py-2 font-semibold text-sm">
                        Ship To Party
                      </div>
                      <div className="p-3 text-sm space-y-1">
                        <div><span className="font-semibold">Name:</span> {billData.shipToName || '-'}</div>
                        <div><span className="font-semibold">Address:</span> {billData.shipToAddress || '-'}</div>
                        <div><span className="font-semibold">GSTIN:</span> {billData.shipToGSTIN || '-'}</div>
                        <div>
                          <span className="font-semibold">State:</span> {billData.shipToState || '-'}
                          {billData.shipToCode && <span className="ml-4"><span className="font-semibold">Code:</span> {billData.shipToCode}</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Products Table */}
                  <table className="w-full border-collapse border border-gray-800 mb-4">
                    <thead>
                      <tr className="bg-gray-700 text-white">
                        <th className="border border-gray-800 px-3 py-2 text-left text-sm">S.No.</th>
                        <th className="border border-gray-800 px-3 py-2 text-left text-sm">Product Description</th>
                        <th className="border border-gray-800 px-3 py-2 text-center text-sm">Pcs.</th>
                        <th className="border border-gray-800 px-3 py-2 text-center text-sm">Cts/Gm</th>
                        <th className="border border-gray-800 px-3 py-2 text-center text-sm">Rate</th>
                        <th className="border border-gray-800 px-3 py-2 text-right text-sm">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billData.products
                        .filter(product => product.description) // 👈 removes empty rows
                        .map((product, index) => (
                          <tr key={product.id}>
                            <td className="border border-gray-800 px-3 py-2 text-sm">{index + 1}</td>
                            <td className="border border-gray-800 px-3 py-2 text-sm">{product.description}</td>
                            <td className="border border-gray-800 px-3 py-2 text-center text-sm">{product.pcs}</td>
                            <td className="border border-gray-800 px-3 py-2 text-center text-sm">{product.ctsGm}</td>
                            <td className="border border-gray-800 px-3 py-2 text-center text-sm">{product.rate}</td>
                            <td className="border border-gray-800 px-3 py-2 text-right text-sm">{product.amount}</td>
                          </tr>
                        ))}

                      {/* Total Amount */}
                      <tr>
                        <td colSpan="5" className="border border-gray-800 px-3 py-2 text-right font-semibold text-sm">
                          TOTAL AMOUNT
                        </td>
                        <td className="border border-gray-800 px-3 py-2 text-right font-semibold text-sm">
                          {calculateTotal()}
                        </td>
                      </tr>

                      {/* CGST */}
                      {billData.cgst && parseFloat(billData.cgst) > 0 && (
                        <tr>
                          <td colSpan="5" className="border border-gray-800 px-3 py-2 text-right text-sm">
                            CGST @
                          </td>
                          <td className="border border-gray-800 px-3 py-2 text-right text-sm">
                            {billData.cgst}
                          </td>
                        </tr>
                      )}

                      {/* SGST */}
                      {billData.sgst && parseFloat(billData.sgst) > 0 && (
                        <tr>
                          <td colSpan="5" className="border border-gray-800 px-3 py-2 text-right text-sm">
                            SGST @
                          </td>
                          <td className="border border-gray-800 px-3 py-2 text-right text-sm">
                            {billData.sgst}
                          </td>
                        </tr>
                      )}

                      {/* IGST */}
                      {billData.igst && parseFloat(billData.igst) > 0 && (
                        <tr>
                          <td colSpan="5" className="border border-gray-800 px-3 py-2 text-right text-sm">
                            IGST @
                          </td>
                          <td className="border border-gray-800 px-3 py-2 text-right text-sm">
                            {billData.igst}
                          </td>
                        </tr>
                      )}

                      {/* Total Amount After Tax */}
                      <tr className="bg-gray-100">
                        <td colSpan="5" className="border border-gray-800 px-3 py-2 text-right font-bold text-sm">
                          TOTAL AMOUNT AFTER TAX
                        </td>
                        <td className="border border-gray-800 px-3 py-2 text-right font-bold text-sm">
                          {calculateTotalWithTax()}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Footer */}
                  <div className="text-xs mt-6">
                    <div className="mb-12">E. & O. E.</div>
                    <div className="text-right">
                      <div className="mb-1">For <span className="font-bold">RASHMI GEMS</span></div>
                      <div className="mt-16 border-t border-gray-800 inline-block px-8 pt-1">
                        Authorized Signatory
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
