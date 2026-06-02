import React, { useState, useMemo, useRef } from 'react';
import { 
  Calculator, LayoutDashboard, FileSpreadsheet, TrendingUp, 
  DollarSign, Package, Plus, Image as ImageIcon, Trash2, 
  ChevronRight, ChevronDown, ChevronUp 
} from 'lucide-react';

// 1. 초기 샘플 데이터
const initialData = [
  { 
    id: 1, 
    style: '7834930018(6153480)',
    item: 'L/S V-NECK', 
    imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=150&q=80', 
    po: 'V04-007811', delivery: '2026-07-15', color: '010 BLACK', 
    s: 1200, m: 500, l: 0, xl: 0, 
    fab1Name: '2X2 RIB', fab1Cons: 1.25, fab1Price: 2.25,
    fab2Name: '', fab2Cons: 0, fab2Price: 0,
    trimThread: 0.05, trimButton: 0, trimPrint: 0.1, trimLabel: 0.08,
    cmt: 1.05, fob: 5.50 
  },
  { 
    id: 2, 
    style: '992019388(771239)',
    item: 'S/S T-SHIRT (COLOR BLOCK)', 
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=150&q=80', 
    po: 'T01-001122', delivery: '2026-08-20', color: '030 WHITE/NAVY', 
    s: 3000, m: 4000, l: 2000, xl: 1000, 
    fab1Name: 'JERSEY (BODY)', fab1Cons: 0.65, fab1Price: 1.95,
    fab2Name: 'JERSEY (SLEEVE)', fab2Cons: 0.25, fab2Price: 2.10,
    trimThread: 0.05, trimButton: 0, trimPrint: 0, trimLabel: 0.08,
    cmt: 0.95, fob: 4.80 
  },
  { 
    id: 3, 
    style: '992019388(771239)',
    item: 'S/S T-SHIRT (COLOR BLOCK)', 
    imageUrl: '', 
    po: 'T01-001123', delivery: '2026-08-25', color: '050 RED/BLACK', 
    s: 1000, m: 1500, l: 1500, xl: 500, 
    fab1Name: 'JERSEY (BODY)', fab1Cons: 0.65, fab1Price: 1.95,
    fab2Name: 'JERSEY (SLEEVE)', fab2Cons: 0.25, fab2Price: 2.10,
    trimThread: 0.05, trimButton: 0, trimPrint: 0, trimLabel: 0.08,
    cmt: 0.95, fob: 4.80 
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('sheet');
  const [data, setData] = useState(initialData);
  const [showTrims, setShowTrims] = useState(false);
  const [showFabric, setShowFabric] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState("");

  const fileInputRef = useRef(null);
  const [editingImageId, setEditingImageId] = useState(null);

  const handleDoubleClick = (id, field, value) => {
    setEditingCell({ id, field });
    setEditValue(value === 0 && typeof value === 'number' ? "" : value);
  };

  const handleSave = () => {
    if (!editingCell) return;
    const { id, field } = editingCell;
    
    setData(prevData => prevData.map(row => {
      if (row.id === id) {
        const isStringField = ['style', 'item', 'imageUrl', 'po', 'delivery', 'color', 'fab1Name', 'fab2Name'].includes(field);
        let newValue = editValue;
        
        if (!isStringField) {
          newValue = parseFloat(editValue);
          if (isNaN(newValue)) newValue = 0;
        }
        
        return { ...row, [field]: newValue };
      }
      return row;
    }));
    setEditingCell(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') setEditingCell(null);
  };

  const handleImageClick = (id) => {
    setEditingImageId(id);
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && editingImageId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData(prevData => prevData.map(row => 
          row.id === editingImageId ? { ...row, imageUrl: reader.result } : row
        ));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddRow = () => {
    const newRow = {
      id: Date.now(),
      style: 'NEW STYLE', item: 'NEW ITEM', imageUrl: '', po: 'NEW-PO', delivery: '', color: 'COLOR',
      s: 0, m: 0, l: 0, xl: 0,
      fab1Name: 'FABRIC 1', fab1Cons: 0, fab1Price: 0,
      fab2Name: '', fab2Cons: 0, fab2Price: 0,
      trimThread: 0, trimButton: 0, trimPrint: 0, trimLabel: 0,
      cmt: 0, fob: 0
    };
    setData([...data, newRow]);
  };

  const handleDeleteRow = (id) => {
    setData(data.filter(row => row.id !== id));
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const renderEditableCell = (row, field, format = 'text', align = 'left') => {
    const isEditing = editingCell?.id === row.id && editingCell?.field === field;
    
    if (isEditing) {
      return (
        <input 
          type={format === 'text' ? (field === 'delivery' ? 'date' : 'text') : 'number'}
          autoFocus 
          value={editValue} 
          onChange={(e) => setEditValue(e.target.value)} 
          onBlur={handleSave} 
          onKeyDown={handleKeyDown} 
          className={`w-full min-w-[50px] border-2 border-blue-500 rounded bg-white shadow-sm focus:outline-none px-1 py-1 text-slate-800 text-xs ${align === 'right' ? 'text-right' : 'text-left'}`}
          step={format === 'cons' ? "0.001" : "0.01"} 
        />
      );
    }

    let displayValue = row[field];
    
    if (format === 'currency') displayValue = `$${Number(row[field] || 0).toFixed(2)}`;
    else if (format === 'cons') displayValue = Number(row[field] || 0).toFixed(3);
    else if (format === 'number') displayValue = Number(row[field] || 0).toLocaleString();

    return (
      <div 
        className={`cursor-pointer hover:bg-blue-100 hover:ring-1 hover:ring-blue-300 rounded px-1 py-1 -mx-1 transition-colors min-h-[20px] text-xs ${align === 'right' ? 'text-right' : 'text-left'}`}
        onDoubleClick={() => handleDoubleClick(row.id, field, row[field])} 
        title="더블클릭하여 수정 (Enter로 저장)"
      >
        {displayValue || (format === 'text' ? <span className="text-slate-300 italic">...</span> : displayValue)}
      </div>
    );
  };

  const renderImageCell = (row) => {
    return (
      <div 
        className="cursor-pointer flex items-center justify-center w-12 h-12 bg-slate-100 rounded border border-slate-200 overflow-hidden hover:ring-2 hover:ring-blue-400 transition-all mx-auto group relative"
        onDoubleClick={() => handleImageClick(row.id)}
        title="더블클릭하여 PC에서 이미지 삽입"
      >
        {row.imageUrl ? (
          <img src={row.imageUrl} alt={row.style} className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
        ) : (
          <ImageIcon className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
          <span className="text-[10px] font-bold text-slate-800 bg-white/80 px-1 py-0.5 rounded">Upload</span>
        </div>
      </div>
    );
  };

  const processedData = useMemo(() => {
    let calculatedData = data.map(row => {
      const totalQty = (Number(row.s) || 0) + (Number(row.m) || 0) + (Number(row.l) || 0) + (Number(row.xl) || 0);
      const fab1Cost = (Number(row.fab1Cons) || 0) * (Number(row.fab1Price) || 0);
      const fab2Cost = (Number(row.fab2Cons) || 0) * (Number(row.fab2Price) || 0);
      const totalFabricCost = fab1Cost + fab2Cost;
      const totalTrimCost = (Number(row.trimThread) || 0) + (Number(row.trimButton) || 0) + (Number(row.trimPrint) || 0) + (Number(row.trimLabel) || 0);
      const unitCmtCost = Number(row.cmt) || 0;
      
      const unitTotalCost = totalFabricCost + totalTrimCost + unitCmtCost;
      const amount = totalQty * (Number(row.fob) || 0);
      const profit = (Number(row.fob) || 0) - unitTotalCost;
      const profitMargin = Number(row.fob) > 0 ? (profit / Number(row.fob)) * 100 : 0;

      return {
        ...row, totalQty, totalFabricCost, totalTrimCost, unitTotalCost, amount, profit, profitMargin
      };
    });

    if (sortConfig.key) {
      calculatedData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    let finalData = [];
    let currentStyle = null;
    let subtotal = null;

    calculatedData.forEach((row, index) => {
      if (currentStyle !== row.style) {
        if (subtotal && subtotal.count > 0) {
          finalData.push({ ...subtotal, isSubtotal: true, id: `subtotal-${currentStyle}` });
        }
        currentStyle = row.style;
        subtotal = { style: currentStyle, count: 0, totalQty: 0, amount: 0, totalProfit: 0 };
      }

      finalData.push({ ...row, isSubtotal: false });
      subtotal.count += 1;
      subtotal.totalQty += row.totalQty;
      subtotal.amount += row.amount;
      subtotal.totalProfit += (row.profit * row.totalQty);

      if (index === calculatedData.length - 1 && subtotal) {
        finalData.push({ ...subtotal, isSubtotal: true, id: `subtotal-${currentStyle}` });
      }
    });

    return finalData;
  }, [data, sortConfig]);

  const summary = useMemo(() => {
    let totalOrderQty = 0, grandTotalCost = 0, grandTotalSales = 0, grandTotalProfit = 0;
    processedData.filter(row => !row.isSubtotal).forEach(row => {
      totalOrderQty += row.totalQty;
      grandTotalSales += row.amount;
      grandTotalProfit += (row.profit * row.totalQty);
    });
    const avgMarginRate = grandTotalSales > 0 ? (grandTotalProfit / grandTotalSales) * 100 : 0;
    return { totalOrderQty, grandTotalSales, grandTotalProfit, avgMarginRate };
  }, [processedData]);

  const SortHeader = ({ label, sortKey, className = "", rowSpan, colSpan }) => (
    <th 
      rowSpan={rowSpan} colSpan={colSpan}
      onClick={() => sortKey && requestSort(sortKey)}
      className={`px-2 py-2 border-r border-b border-slate-200 font-semibold text-center ${sortKey ? 'cursor-pointer hover:bg-slate-200 transition-colors select-none' : ''} ${className}`}
      title={sortKey ? "클릭하여 정렬" : ""}
    >
      <div className="flex items-center justify-center gap-1">
        {label}
        {sortConfig.key === sortKey && (
          sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-600" /> : <ChevronDown className="w-3 h-3 text-blue-600" />
        )}
      </div>
    </th>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <input 
        type="file" 
        accept="image/jpeg, image/png" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />

      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/20 p-2 rounded-lg border border-blue-500/30">
            <Calculator className="text-blue-400 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Costing Master V3</h1>
            <p className="text-xs text-slate-400">Garment Order & Cost Analysis</p>
          </div>
        </div>
        <div className="flex gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button 
            onClick={() => setActiveTab('sheet')}
            className={`flex items-center gap-2 px-5 py-2 rounded-md font-medium text-sm transition-all duration-200 ${activeTab === 'sheet' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}
          >
            <FileSpreadsheet className="w-4 h-4" /> Data Sheet
          </button>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-5 py-2 rounded-md font-medium text-sm transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}
          >
            <LayoutDashboard className="w-4 h-4" /> Analytics
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 lg:px-6 w-full flex flex-col">
        {activeTab === 'dashboard' && (
           <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto w-full">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 border-l-4 border-l-blue-500">
               <div className="bg-blue-100 p-3 rounded-xl"><Package className="w-6 h-6 text-blue-600" /></div>
               <div>
                 <p className="text-sm font-medium text-slate-500">Total Volume</p>
                 <p className="text-2xl font-bold text-slate-900">{summary.totalOrderQty.toLocaleString()} <span className="text-sm font-normal text-slate-500">pcs</span></p>
               </div>
             </div>
             <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 border-l-4 border-l-green-500">
               <div className="bg-green-100 p-3 rounded-xl"><DollarSign className="w-6 h-6 text-green-600" /></div>
               <div>
                 <p className="text-sm font-medium text-slate-500">Total Sales Amount</p>
                 <p className="text-2xl font-bold text-slate-900">${summary.grandTotalSales.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
               </div>
             </div>
             <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 border-l-4 border-l-indigo-500">
               <div className="bg-indigo-100 p-3 rounded-xl"><TrendingUp className="w-6 h-6 text-indigo-600" /></div>
               <div>
                 <p className="text-sm font-medium text-slate-500">Total Profit</p>
                 <p className="text-2xl font-bold text-indigo-700">${summary.grandTotalProfit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
               </div>
             </div>
             <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center border-l-4 border-l-purple-500">
               <div className="flex justify-between items-end mb-2">
                 <p className="text-sm font-medium text-slate-500">Blended Margin</p>
                 <p className={`text-2xl font-bold ${summary.avgMarginRate < 15 ? 'text-red-500' : 'text-emerald-500'}`}>
                   {summary.avgMarginRate.toFixed(1)}%
                 </p>
               </div>
               <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                 <div className={`h-full ${summary.avgMarginRate < 15 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(summary.avgMarginRate, 100)}%` }}></div>
               </div>
             </div>
           </div>
         </div>
        )}

        {activeTab === 'sheet' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-1 animate-in fade-in duration-300">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <h2 className="font-semibold text-slate-800">Master Order Sheet</h2>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowFabric(!showFabric)}
                  className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm border ${showFabric ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                  {showFabric ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  {showFabric ? 'Hide Fabric Detail' : 'Show Fabric Detail'}
                </button>
                <button 
                  onClick={() => setShowTrims(!showTrims)}
                  className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm border ${showTrims ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                  {showTrims ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  {showTrims ? 'Hide Trims Detail' : 'Show Trims Detail'}
                </button>
                <button 
                  onClick={handleAddRow}
                  className="flex items-center gap-1.5 text-sm font-medium text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Row
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
              <table className="w-full text-xs text-left border-collapse min-w-[max-content]">
                <thead className="text-slate-600 uppercase bg-slate-100 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <SortHeader label="Style" sortKey="style" rowSpan="2" className="sticky left-0 z-20 bg-slate-100 min-w-[120px]" />
                    <SortHeader label="Item" sortKey="item" rowSpan="2" className="bg-slate-100 min-w-[120px]" />
                    <SortHeader label="Image" rowSpan="2" className="bg-slate-100" />
                    <SortHeader label="PO" sortKey="po" rowSpan="2" className="bg-slate-100" />
                    <SortHeader label="Delivery" sortKey="delivery" rowSpan="2" className="bg-slate-100" />
                    <SortHeader label="Color" sortKey="color" rowSpan="2" className="bg-slate-100" />
                    <th colSpan="4" className="px-2 py-1 border-r border-b border-slate-200 text-center font-semibold bg-slate-200/50">Qty</th>
                    <SortHeader label="Total Q'ty" sortKey="totalQty" rowSpan="2" className="bg-blue-50/50 text-blue-800" />
                    <SortHeader label="FOB($)" sortKey="fob" rowSpan="2" className="bg-emerald-50/50 text-emerald-800" />
                    <SortHeader label="Amount" sortKey="amount" rowSpan="2" className="bg-emerald-100/50 text-emerald-900" />
                    {showFabric ? (
                      <>
                        <th colSpan="3" className="px-2 py-1 border-r border-b border-slate-200 text-center font-semibold bg-amber-50/50 text-amber-800">Fabric 1</th>
                        <th colSpan="3" className="px-2 py-1 border-r border-b border-slate-200 text-center font-semibold bg-orange-50/50 text-orange-800">Fabric 2</th>
                      </>
                    ) : (
                      <SortHeader label="Fabric Total" sortKey="totalFabricCost" rowSpan="2" className="bg-amber-50/50 text-amber-800" />
                    )}
                    <th colSpan={showTrims ? 5 : 1} className="px-2 py-1 border-r border-b border-slate-200 text-center font-semibold bg-purple-50/50 text-purple-800">
                      Trims {showTrims ? '(Details)' : '(Total)'}
                    </th>
                    <SortHeader label="CMT($)" sortKey="cmt" rowSpan="2" className="bg-indigo-50/50 text-indigo-800" />
                    <SortHeader label="Unit Cost" sortKey="unitTotalCost" rowSpan="2" className="bg-slate-200" />
                    <SortHeader label="Profit($)" sortKey="profit" rowSpan="2" className="bg-sky-50/50 text-sky-800" />
                    <SortHeader label="Profit(%)" sortKey="profitMargin" rowSpan="2" className="bg-sky-50/50 text-sky-800" />
                    <th rowSpan="2" className="px-2 py-2 border-b border-slate-200 bg-slate-100 text-center">Del</th>
                  </tr>
                  <tr className="bg-slate-50 text-slate-500 text-[10px]">
                    <th className="px-2 py-1 border-r border-b border-slate-200 text-right">S</th>
                    <th className="px-2 py-1 border-r border-b border-slate-200 text-right">M</th>
                    <th className="px-2 py-1 border-r border-b border-slate-200 text-right">L</th>
                    <th className="px-2 py-1 border-r border-b border-slate-200 text-right">XL</th>
                    {showFabric && (
                      <>
                        <th className="px-2 py-1 border-r border-b border-slate-200 text-left bg-amber-50/30 min-w-[80px]">Item</th>
                        <th className="px-2 py-1 border-r border-b border-slate-200 text-right bg-amber-50/30">Con's</th>
                        <th className="px-2 py-1 border-r border-b border-slate-200 text-right bg-amber-50/30">Price($)</th>
                        <th className="px-2 py-1 border-r border-b border-slate-200 text-left bg-orange-50/30 min-w-[80px]">Item</th>
                        <th className="px-2 py-1 border-r border-b border-slate-200 text-right bg-orange-50/30">Con's</th>
                        <th className="px-2 py-1 border-r border-b border-slate-200 text-right bg-orange-50/30">Price($)</th>
                      </>
                    )}
                    {showTrims && (
                      <>
                        <th className="px-2 py-1 border-r border-b border-slate-200 text-right bg-purple-50/30">Thread</th>
                        <th className="px-2 py-1 border-r border-b border-slate-200 text-right bg-purple-50/30">Button</th>
                        <th className="px-2 py-1 border-r border-b border-slate-200 text-right bg-purple-50/30">Print</th>
                        <th className="px-2 py-1 border-r border-b border-slate-200 text-right bg-purple-50/30">Label</th>
                      </>
                    )}
                    <th className="px-2 py-1 border-r border-b border-slate-200 text-right bg-purple-100/50 font-bold">Total Trim</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700 font-medium divide-y divide-slate-100">
                  {processedData.map((row) => {
                    if (row.isSubtotal) {
                      return (
                        <tr key={row.id} className="bg-slate-100 font-bold border-y-2 border-slate-300 hover:bg-slate-200 transition-colors">
                          <td colSpan="10" className="px-3 py-3 border-r border-slate-200 sticky left-0 z-10 bg-slate-100 text-right text-slate-600">
                            {row.style} <span className="text-[10px] font-normal ml-2">({row.count} items) Subtotal :</span>
                          </td>
                          <td className="px-2 py-3 border-r border-slate-200 text-right text-blue-700 bg-blue-100/50">
                            {row.totalQty.toLocaleString()}
                          </td>
                          <td className="border-r border-slate-200 bg-slate-100"></td>
                          <td className="px-2 py-3 border-r border-slate-200 text-right text-emerald-700 bg-emerald-100/50">
                            ${row.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                          </td>
                          <td colSpan={showFabric ? 6 : 1} className="border-r border-slate-200 bg-slate-100"></td>
                          <td colSpan={showTrims ? 5 : 1} className="border-r border-slate-200 bg-slate-100"></td>
                          <td colSpan="2" className="border-r border-slate-200 bg-slate-100"></td>
                          <td className="px-2 py-3 border-r border-slate-200 text-right text-sky-700 bg-sky-100/50">
                            ${row.totalProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}
                          </td>
                          <td colSpan="2" className="bg-slate-100"></td>
                        </tr>
                      );
                    }
                    return (
                      <tr key={row.id} className="hover:bg-blue-50/40 transition-colors group">
                        <td className="px-3 py-2 border-r border-slate-100 sticky left-0 z-10 bg-white group-hover:bg-blue-50/40 font-bold text-slate-800 align-middle">
                          {renderEditableCell(row, 'style', 'text')}
                        </td>
                        <td className="px-3 py-2 border-r border-slate-100 font-semibold text-slate-700 align-middle">
                          {renderEditableCell(row, 'item', 'text')}
                        </td>
                        <td className="px-2 py-1 border-r border-slate-100 align-middle">
                          {renderImageCell(row)}
                        </td>
                        <td className="px-3 py-2 border-r border-slate-100 text-slate-600 align-middle">
                          {renderEditableCell(row, 'po', 'text')}
                        </td>
                        <td className="px-3 py-2 border-r border-slate-100 text-slate-600 align-middle">
                          {renderEditableCell(row, 'delivery', 'text')}
                        </td>
                        <td className="px-3 py-2 border-r border-slate-100 text-slate-600 align-middle min-w-[100px]">
                          {renderEditableCell(row, 'color', 'text')}
                        </td>
                        <td className="px-2 py-2 border-r border-slate-100 w-12">{renderEditableCell(row, 's', 'number', 'right')}</td>
                        <td className="px-2 py-2 border-r border-slate-100 w-12">{renderEditableCell(row, 'm', 'number', 'right')}</td>
                        <td className="px-2 py-2 border-r border-slate-100 w-12">{renderEditableCell(row, 'l', 'number', 'right')}</td>
                        <td className="px-2 py-2 border-r border-slate-100 w-12">{renderEditableCell(row, 'xl', 'number', 'right')}</td>
                        <td className="px-2 py-2 border-r border-slate-100 text-right font-bold text-blue-700 bg-blue-50/20 align-middle">
                          {row.totalQty > 0 ? row.totalQty.toLocaleString() : '-'}
                        </td>
                        <td className="px-2 py-2 border-r border-slate-100 font-bold text-emerald-700 bg-emerald-50/10 w-16">
                          {renderEditableCell(row, 'fob', 'currency', 'right')}
                        </td>
                        <td className="px-2 py-2 border-r border-slate-100 text-right font-bold text-emerald-800 bg-emerald-100/20 align-middle text-sm">
                          ${row.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </td>
                        {showFabric ? (
                          <>
                            <td className="px-2 py-2 border-r border-slate-100 bg-amber-50/10 text-slate-600">{renderEditableCell(row, 'fab1Name', 'text')}</td>
                            <td className="px-2 py-2 border-r border-slate-100 bg-amber-50/10 w-14">{renderEditableCell(row, 'fab1Cons', 'cons', 'right')}</td>
                            <td className="px-2 py-2 border-r border-slate-100 bg-amber-50/10 w-14">{renderEditableCell(row, 'fab1Price', 'currency', 'right')}</td>
                            <td className="px-2 py-2 border-r border-slate-100 bg-orange-50/10 text-slate-600">{renderEditableCell(row, 'fab2Name', 'text')}</td>
                            <td className="px-2 py-2 border-r border-slate-100 bg-orange-50/10 w-14">{renderEditableCell(row, 'fab2Cons', 'cons', 'right')}</td>
                            <td className="px-2 py-2 border-r border-slate-100 bg-orange-50/10 w-14">{renderEditableCell(row, 'fab2Price', 'currency', 'right')}</td>
                          </>
                        ) : (
                          <td className="px-2 py-2 border-r border-slate-100 bg-amber-50/10 text-right font-semibold align-middle text-amber-700">
                            ${row.totalFabricCost.toFixed(2)}
                          </td>
                        )}
                        {showTrims && (
                          <>
                            <td className="px-2 py-2 border-r border-slate-100 bg-purple-50/10 w-14">{renderEditableCell(row, 'trimThread', 'currency', 'right')}</td>
                            <td className="px-2 py-2 border-r border-slate-100 bg-purple-50/10 w-14">{renderEditableCell(row, 'trimButton', 'currency', 'right')}</td>
                            <td className="px-2 py-2 border-r border-slate-100 bg-purple-50/10 w-14">{renderEditableCell(row, 'trimPrint', 'currency', 'right')}</td>
                            <td className="px-2 py-2 border-r border-slate-100 bg-purple-50/10 w-14">{renderEditableCell(row, 'trimLabel', 'currency', 'right')}</td>
                          </>
                        )}
                        <td className="px-2 py-2 border-r border-slate-100 bg-purple-100/30 text-right font-semibold align-middle">
                          ${row.totalTrimCost.toFixed(2)}
                        </td>
                        <td className="px-2 py-2 border-r border-slate-100 bg-indigo-50/10 w-16">{renderEditableCell(row, 'cmt', 'currency', 'right')}</td>
                        <td className="px-2 py-2 border-r border-slate-100 text-right font-bold text-slate-800 bg-slate-100/80 align-middle">
                          ${row.unitTotalCost.toFixed(2)}
                        </td>
                        <td className="px-2 py-2 border-r border-slate-100 text-right font-bold text-sky-700 bg-sky-50/20 align-middle text-sm">
                          ${row.profit.toFixed(2)}
                        </td>
                        <td className="px-2 py-2 border-r border-slate-100 text-right font-bold bg-sky-50/20 align-middle">
                          {row.totalQty > 0 ? (
                            <span className={`px-2 py-0.5 rounded ${row.profitMargin >= 15 ? 'bg-sky-100 text-sky-700' : row.profitMargin > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                              {row.profitMargin.toFixed(1)}%
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-2 py-2 text-center align-middle">
                          <button 
                            onClick={() => handleDeleteRow(row.id)}
                            className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="행 삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
