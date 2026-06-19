import React, { useState } from 'react';
import { Package, AlertTriangle, CheckCircle, Wrench, Plus, Archive, Search } from 'lucide-react';

const INITIAL_INVENTORY = [
    { id: 'INV-001', name: 'Microscopes (Binocular)', category: 'Lab Equipment', quantity: 15, status: 'Good' },
    { id: 'INV-002', name: 'MacBook Air M1', category: 'Office Supplies', quantity: 5, status: 'Good' },
    { id: 'INV-003', name: 'Toyota Coaster Bus', category: 'Transport', quantity: 2, status: 'Maintenance' },
    { id: 'INV-004', name: 'Advanced Physics Textbooks', category: 'Library', quantity: 120, status: 'Good' },
    { id: 'INV-005', name: 'Chemistry Beakers (500ml)', category: 'Lab Equipment', quantity: 3, status: 'Damaged' },
];

export default function InventoryManagement() {
    const [inventory, setInventory] = useState(INITIAL_INVENTORY);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        category: 'Library',
        quantity: '',
        status: 'Good'
    });

    // Calculate summaries
    const totalAssets = inventory.reduce((acc, item) => acc + Number(item.quantity), 0);
    const itemsInMaintenance = inventory.filter(item => item.status === 'Maintenance').length;
    const lowStockWarnings = inventory.filter(item => Number(item.quantity) < 10).length;

    const handleSubmit = (e) => {
        e.preventDefault();
        const newItem = {
            id: `INV-${String(inventory.length + 1).padStart(3, '0')}`,
            name: formData.name,
            category: formData.category,
            quantity: Number(formData.quantity),
            status: formData.status
        };
        setInventory([newItem, ...inventory]);
        setFormData({ name: '', category: 'Library', quantity: '', status: 'Good' });
    };

    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto mb-10">

            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Archive className="text-indigo-600" size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-indigo-950 font-extrabold uppercase tracking-tight">Asset & Inventory</h1>
                    <p className="text-sm font-bold text-slate-500 font-medium">Track school equipment, library books, and vehicles.</p>
                </div>
            </div>

            {/* Top Section: Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-indigo-500 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Assets Tracked</p>
                        <h3 className="text-3xl font-black text-indigo-950 font-extrabold">{totalAssets}</h3>
                    </div>
                    <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center">
                        <Package className="text-indigo-500" size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-rose-500 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Low Stock / Damaged</p>
                        <h3 className="text-3xl font-black text-indigo-950 font-extrabold">{lowStockWarnings}</h3>
                    </div>
                    <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center">
                        <AlertTriangle className="text-rose-500" size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-amber-500 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">In Maintenance</p>
                        <h3 className="text-3xl font-black text-indigo-950 font-extrabold">{itemsInMaintenance}</h3>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center">
                        <Wrench className="text-amber-500" size={24} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Middle Section: Add New Asset Form */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2 text-indigo-950 font-extrabold">
                            <Plus size={18} className="text-indigo-600" /> Log New Asset
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 font-medium uppercase mb-1">Item Name</label>
                                <input
                                    type="text" required
                                    placeholder="e.g. Dell Monitor"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:border-indigo-500"
                                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 font-medium uppercase mb-1">Category</label>
                                <select
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:border-indigo-500"
                                    value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="Library">Library & Books</option>
                                    <option value="Lab Equipment">Lab Equipment</option>
                                    <option value="Office Supplies">Office & IT Supplies</option>
                                    <option value="Transport">Transport & Vehicles</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 font-medium uppercase mb-1">Quantity</label>
                                    <input
                                        type="number" required min="1"
                                        placeholder="1"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:border-indigo-500"
                                        value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 font-medium uppercase mb-1">Status</label>
                                    <select
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:border-indigo-500"
                                        value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="Good">Good</option>
                                        <option value="Maintenance">Maintenance</option>
                                        <option value="Damaged">Damaged</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-slate-800 text-white text-sm font-bold rounded-lg hover:bg-slate-900 transition shadow-md mt-2"
                            >
                                Add to Registry
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Section: Inventory Data Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-indigo-950 font-extrabold">
                                <Package size={18} className="text-indigo-600" /> Active Inventory List
                            </h2>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search assets..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400 border-y border-slate-200">
                                        <th className="p-4 font-bold">Asset ID</th>
                                        <th className="p-4 font-bold">Item Name</th>
                                        <th className="p-4 font-bold">Category</th>
                                        <th className="p-4 font-bold text-center">Qty</th>
                                        <th className="p-4 font-bold text-center">Condition</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredInventory.length === 0 ? (
                                        <tr><td colSpan="5" className="p-6 text-center text-sm font-medium text-slate-400 italic">No assets found matching your search.</td></tr>
                                    ) : (
                                        filteredInventory.map((item, idx) => (
                                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                <td className="p-4 font-mono font-bold text-slate-500 font-medium text-xs">{item.id}</td>
                                                <td className="p-4 font-bold text-indigo-950 font-extrabold">{item.name}</td>
                                                <td className="p-4 font-semibold text-slate-500 font-medium text-sm">{item.category}</td>
                                                <td className="p-4 font-black text-indigo-600 text-center">{item.quantity}</td>
                                                <td className="p-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${item.status === 'Good' ? 'bg-emerald-100 text-emerald-700' :
                                                            item.status === 'Maintenance' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-rose-100 text-rose-700'
                                                        }`}>
                                                        {item.status === 'Good' && <CheckCircle size={12} />}
                                                        {item.status === 'Maintenance' && <Wrench size={12} />}
                                                        {item.status === 'Damaged' && <AlertTriangle size={12} />}
                                                        {item.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}