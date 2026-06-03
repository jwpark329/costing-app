import React, { useState, useMemo, useRef } from 'react';
import { 
  Calculator, LayoutDashboard, FileSpreadsheet, TrendingUp, 
  DollarSign, Package, Plus, Image as ImageIcon, Trash2, 
  ChevronRight, ChevronDown, ChevronUp, Download, Upload,
  BarChart3, Calendar, Lock, User, LogIn, Save
} from 'lucide-react';

// ============================================================================
// 1. UTILS & CONSTANTS
// ============================================================================
const initialData = [
  { 
    id: 1, buyer: 'NIKE', status: 'Open', style: '7834930018(6153480)', item: 'L/S V-NECK', 
    imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=150&q=80', 
    po: 'V04-007811', delivery: '2026-07-15', color: '010 BLACK', 
    s: 1200, m: 500, l: 0, xl: 0, xxl: 0,
    fab1Name: '2X2 RIB', fab1Loss: 3, fab1Cons: 1.25, fab1Price: 2.25,
    fab2Name: '', fab2Loss: 0, fab2Cons: 0, fab2Price: 0,
    trimThread: 0.05, trimButton: 0, trimPrint: 0.1, trimLabel: 0.08,
    cmt: 1.05, fob: 5.50 
  },
  { 
    id: 2, buyer: 'ADIDAS', status: 'Invoiced', style: '992019388(771239)', item: 'S/S T-SHIRT (COLOR BLOCK)', 
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=150&q=80', 
    po: 'T01-001122', delivery: '2026-08-20', color: '030 WHITE/NAVY', 
    s: 3000, m: 4000, l: 2000, xl: 1000, xxl: 500,
    fab1Name: 'JERSEY (BODY)', fab1Loss: 5, fab1Cons: 0.65, fab1Price: 1.95,
    fab2Name: 'JERSEY (SLEEVE)', fab2Loss: 5, fab2Cons: 0.25, fab2Price: 2.10,
    trimThread: 0.05, trimButton: 0, trimPrint: 0, trimLabel: 0.08,
    cmt: 0.95, fob: 4.80 
  },
  { 
    id: 3, buyer: 'ADIDAS', status: 'Cancel', style: '992019388(771239)', item: 'S/S T-SHIRT (COLOR BLOCK)', 
    imageUrl: '', 
    po: 'T01-001123', delivery: '2026-08-25', color: '050 RED/BLACK', 
    s: 1000, m: 1500, l: 1500, xl: 500, xxl: 200,
    fab1Name: 'JERSEY (BODY)', fab1Loss: 5, fab1Cons: 0.65, fab1Price: 1.95,
    fab2Name: 'JERSEY (SLEEVE)', fab2Loss: 5, fab2Cons: 0.25, fab2Price: 2.10,
    trimThread: 0.05, trimButton: 0, trimPrint: 0, trimLabel: 0.08,
    cmt: 0.95, fob: 4.80 
  }
];

const editableColumns = [
  'buyer', 'status', 'style', 'item', 'po', 'delivery', 'color', 
  's', 'm', 'l', 'xl', 'xxl', 'fob', 
  'fab1Name', 'fab1Loss', 'fab1Cons', 'fab1Price', 
  'fab2Name', 'fab2Loss', 'fab2Cons', 'fab2Price', 
  'trimThread', 'trimButton', 'trimPrint', 'trimLabel', 'cmt'
];

const formatDeliveryDate = (val) => {
  const strVal = String(val).trim();
  if (/^\d{8}$/.test(strVal)) {
    return `${strVal.slice(0, 4)}-${strVal.slice(4, 6)}-${strVal.slice(6, 8)}`;
  }
  return strVal;
};

const getMonthKey = (val) => {
  if (!val) return 'TBD';
  const strVal = String(val).trim();
  
  if (/^\d{8}$/.test(strVal)) {
    return `${strVal.slice(0, 4)}-${strVal.slice(4, 6)}`;
  }
  
  if (/^\d{6}$/.test(strVal)) {
    return `20${strVal.slice(0, 2)}-${strVal.slice(2, 4)}`;
  }
  
  const parts = strVal.split(/[-/.]/);
  if (parts.length >= 2) {
    let year = parts[0];
    if (year.length === 2) year = '20' + year;
    let month = parts[1].padStart(2, '0');
    return `${year}-${month}`;
  }
  
  return 'TBD';
};

const calculateRowCosts = (row) => {
  const totalQty = (Number(row.s) || 0) + (Number(row.m) || 0) + (Number(row.l) || 0) + (Number(row.xl) || 0) + (Number(row.xxl) || 0);
  const fab1LossRate = 1 + ((Number(row.fab1Loss) || 0) / 100);
  const fab2LossRate = 1 + ((Number(row.fab2Loss) || 0) / 100);
  
  const fab1Cost = (Number(row.fab1Cons) || 0) * (Number(row.fab1Price) || 0) * fab1LossRate;
  const fab2Cost = (Number(row.fab2Cons) || 0) * (Number(row.fab2Price) || 0) * fab2LossRate;
  const totalFabricCost = fab1Cost + fab2Cost;
  
  const totalTrimCost = (Number(row.trimThread) || 0) + (Number(row.trimButton) || 0) + (Number(row.trimPrint) || 0) + (Number(row.trimLabel) || 0);
  const unitCmtCost = Number(row.cmt) || 0;
  
  const unitTotalCost = totalFabricCost + totalTrimCost + unitCmtCost;
  const amount = totalQty * (Number(row.fob) || 0);
  const profit = (Number(row.fob) || 0) - unitTotalCost;
  const profitMargin = Number(row.fob) > 0 ? (profit / Number(row.fob)) * 100 : 0;

  return { ...row, totalQty, totalFabricCost, totalTrimCost, unitTotalCost, amount, profit, profitMargin };
};

const getMarginBadgeClass = (margin) => {
  if (margin < 0) return 'bg-red-100 text-red-700 border border-red-200';
  if (margin < 3) return 'bg-slate-100 text-slate-700 border border-slate-200';
  if (margin < 5) return 'bg-sky-100 text-sky-700 border border-sky-200';
  if (margin < 10) return 'bg-blue-100 text-blue-700 border border-blue-200';
  if (margin < 15) return 'bg-teal-100 text-teal-700 border border-teal-200';
  return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
};

const getMarginTextClass = (margin) => {
  if (margin < 0) return 'text-red-600';
  if (margin < 3) return 'text-slate-600';
  if (margin < 5) return 'text-sky-600';
  if (margin < 10) return 'text-blue-600';
  if (margin < 15) return 'text-teal-600';
  return 'text-emerald-600';
};

const getMarginBgClass = (margin) => {
  if (margin < 0) return 'bg-red-500';
  if (margin < 3) return 'bg-slate-400';
  if (margin < 5) return 'bg-sky-500';
  if (margin < 10) return 'bg-blue-500';
  if (margin < 15) return 'bg-teal-500';
  return 'bg-emerald-500';
};

// ============================================================================
// 2. LOGIN COMPONENT
// ============================================================================
const Login = ({ onLogin }) => {
  const [loginId, setLoginId] = useState("");
  const [loginPw, setLoginPw] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loginId === 'jwpark' && loginPw === 'usvn123') {
      onLogin();
    } else {
      setLoginError('아이디 또는 비밀번호가 일치하지 않습니다.');
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2000&auto=format&fit=crop')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"></div>

      <div className="bg-white/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl max-w-sm w-full border border-white/40 animate-in fade-in zoom-in-95 duration-500 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-3 rounded-xl mb-4 shadow-lg shadow-blue-600/30">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Costing Master</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Garment Cost Analysis</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">ID</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-slate-400" />
              </div>
              <input 
                type="text" value={loginId} onChange={(e) => setLoginId(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                placeholder="아이디를 입력하세요" autoFocus
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input 
                type="password" value={loginPw} onChange={(e) => setLoginPw(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                placeholder="비밀번호를 입력하세요"
              />
            </div>
          </div>

          {loginError && (
            <div className="text-red-500 text-xs font-medium bg-red-50 p-2 rounded border border-red-100 text-center animate-in slide-in-from-top-1">
              {loginError}
            </div>
          )}

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors mt-6 shadow-md shadow-blue-600/20">
            <LogIn className="w-4 h-4" /> 로그인
          </button>
        </form>
      </div>
    </div>
  );
};


// ============================================================================
// 3. DASHBOARD COMPONENT
// ============================================================================
const Dashboard = ({ data }) => {
  // 상단 요약용 마스터 필터
  const [selectedBuyerDashboard, setSelectedBuyerDashboard] = useState('ALL');
  const [selectedYearDashboard, setSelectedYearDashboard] = useState('ALL'); // 🆕 연도 필터 추가
  
  // 하단 위젯 전용 필터 상태들
  const [itemBuyerFilter, setItemBuyerFilter] = useState('ALL');
  const [selectedItemFilter, setSelectedItemFilter] = useState('ALL');
  
  const [monthBuyerFilter, setMonthBuyerFilter] = useState('ALL');
  const [selectedYearFilter, setSelectedYearFilter] = useState('ALL');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState('ALL');

  const buyerOptions = useMemo(() => {
    const buyers = new Set(data.map(d => d.buyer).filter(Boolean));
    return ['ALL', ...Array.from(buyers).sort()];
  }, [data]);

  // 원가가 계산된 전체 Base 데이터
  const baseData = useMemo(() => data.map(calculateRowCosts), [data]);

  // 🆕 전체 데이터 기반 사용 가능한 연도 추출 (상단 글로벌 필터용)
  const globalAvailableYears = useMemo(() => {
    const years = new Set();
    baseData.forEach(row => {
      if (row.status === 'Cancel') return;
      const monthKey = getMonthKey(row.delivery);
      if (monthKey !== 'TBD') {
        years.add(monthKey.split('-')[0]);
      }
    });
    return Array.from(years).sort();
  }, [baseData]);

  // 상단 요약 카드용 데이터 (마스터 바이어 및 연도 필터 적용)
  const dashboardData = useMemo(() => {
    return baseData.filter(row => {
      const matchBuyer = selectedBuyerDashboard === 'ALL' || row.buyer === selectedBuyerDashboard;
      
      let matchYear = true;
      if (selectedYearDashboard !== 'ALL') {
        const monthKey = getMonthKey(row.delivery);
        const year = monthKey !== 'TBD' ? monthKey.split('-')[0] : 'TBD';
        matchYear = year === selectedYearDashboard;
      }

      return matchBuyer && matchYear;
    });
  }, [baseData, selectedBuyerDashboard, selectedYearDashboard]);

  // 상단 요약 카드 집계 로직
  const summary = useMemo(() => {
    let stats = {
      total: { qty: 0, sales: 0, profit: 0, margin: 0 },
      open: { qty: 0, sales: 0, profit: 0, margin: 0 },
      invoiced: { qty: 0, sales: 0, profit: 0, margin: 0 }
    };

    dashboardData.forEach(row => {
      if (row.status === 'Cancel') return;
      const amt = row.amount || 0;
      const pft = (row.profit || 0) * (row.totalQty || 0);
      const q = row.totalQty || 0;
      
      stats.total.qty += q;
      stats.total.sales += amt;
      stats.total.profit += pft;
      
      if (row.status === 'Open') {
        stats.open.qty += q; stats.open.sales += amt; stats.open.profit += pft;
      } else if (row.status === 'Invoiced') {
        stats.invoiced.qty += q; stats.invoiced.sales += amt; stats.invoiced.profit += pft;
      }
    });

    stats.total.margin = stats.total.sales > 0 ? (stats.total.profit / stats.total.sales) * 100 : 0;
    stats.open.margin = stats.open.sales > 0 ? (stats.open.profit / stats.open.sales) * 100 : 0;
    stats.invoiced.margin = stats.invoiced.sales > 0 ? (stats.invoiced.profit / stats.invoiced.sales) * 100 : 0;
    return stats;
  }, [dashboardData]);

  // 하단 아이템별 통계 (아이템 전용 바이어 필터 적용)
  const { itemStatsList, itemTotalSales } = useMemo(() => {
    const stats = {};
    let total = 0;
    
    baseData.forEach(row => {
      if (row.status === 'Cancel' || !row.item) return;
      if (itemBuyerFilter !== 'ALL' && row.buyer !== itemBuyerFilter) return;

      if (!stats[row.item]) stats[row.item] = { item: row.item, qty: 0, sales: 0, profit: 0 };
      stats[row.item].qty += row.totalQty;
      stats[row.item].sales += row.amount;
      stats[row.item].profit += (row.profit * row.totalQty);
      total += row.amount;
    });

    return {
      itemStatsList: Object.values(stats).sort((a, b) => b.sales - a.sales),
      itemTotalSales: total
    };
  }, [baseData, itemBuyerFilter]);

  // 하단 월별 납기 통계 (납기 전용 바이어, 연도, 월 필터 적용)
  const { rawMonthStats, availableYears } = useMemo(() => {
    const stats = {};
    const years = new Set();
    
    baseData.forEach(row => {
      if (row.status === 'Cancel') return;
      if (monthBuyerFilter !== 'ALL' && row.buyer !== monthBuyerFilter) return;

      const monthKey = getMonthKey(row.delivery);
      if (monthKey !== 'TBD') {
        years.add(monthKey.split('-')[0]); 
      }

      if (!stats[monthKey]) stats[monthKey] = { month: monthKey, qty: 0, sales: 0, profit: 0 };
      stats[monthKey].qty += row.totalQty;
      stats[monthKey].sales += row.amount;
      stats[monthKey].profit += (row.profit * row.totalQty);
    });
    
    return {
      rawMonthStats: stats,
      availableYears: Array.from(years).sort()
    };
  }, [baseData, monthBuyerFilter]);

  const monthStatsList = useMemo(() => {
    return Object.values(rawMonthStats)
      .filter(stat => {
        if (stat.month === 'TBD') {
          return selectedYearFilter === 'ALL' && selectedMonthFilter === 'ALL';
        }
        const [y, m] = stat.month.split('-');
        if (selectedYearFilter !== 'ALL' && y !== selectedYearFilter) return false;
        if (selectedMonthFilter !== 'ALL' && m !== selectedMonthFilter) return false;
        return true;
      })
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [rawMonthStats, selectedYearFilter, selectedMonthFilter]);

  return (
    <div className="h-full overflow-y-auto pb-6">
      <div className="space-y-4 animate-in fade-in duration-500 max-w-[1600px] mx-auto w-full">
        {/* 상단 글로벌 필터 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-slate-800">Analytics Dashboard</h2>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <label className="text-sm font-semibold text-slate-600 whitespace-nowrap">Global Filter :</label>
            <div className="flex gap-2 flex-1 sm:flex-none">
              <select
                value={selectedBuyerDashboard} onChange={(e) => setSelectedBuyerDashboard(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer flex-1 sm:flex-none min-w-[140px]"
              >
                {buyerOptions.map(b => (
                  <option key={b} value={b}>{b === 'ALL' ? '전체 바이어 (All)' : b}</option>
                ))}
              </select>
              <select
                value={selectedYearDashboard} onChange={(e) => setSelectedYearDashboard(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer flex-1 sm:flex-none min-w-[120px]"
              >
                <option value="ALL">전체 연도 (All)</option>
                {globalAvailableYears.map(y => (
                  <option key={y} value={y}>{y}년</option>
                ))}
                <option value="TBD">TBD (미정)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 요약 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
            <div className="bg-blue-100 p-3 rounded-xl"><Package className="w-6 h-6 text-blue-600" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Volume</p>
              <p className="text-2xl font-bold text-slate-900">{summary.total.qty.toLocaleString()} <span className="text-sm font-normal text-slate-500">pcs</span></p>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center border-l-4 border-l-green-500 hover:shadow-md transition-shadow relative">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Sales Amount</p>
                <p className="text-2xl font-bold text-slate-900">{"$" + summary.total.sales.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
              </div>
              <div className="bg-green-100 p-2 rounded-xl hidden xl:block"><DollarSign className="w-5 h-5 text-green-600" /></div>
            </div>
            <div className="flex gap-2 mt-auto w-full">
              <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded font-semibold border border-blue-100 flex-1 text-center truncate">
                Open: ${summary.open.sales.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-semibold border border-emerald-100 flex-1 text-center truncate">
                Inv: ${summary.invoiced.sales.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 border-l-4 border-l-indigo-500 hover:shadow-md transition-shadow">
            <div className="bg-indigo-100 p-3 rounded-xl"><TrendingUp className="w-6 h-6 text-indigo-600" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Profit</p>
              <p className="text-2xl font-bold text-indigo-700">{"$" + summary.total.profit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-end mb-2">
              <p className="text-sm font-medium text-slate-500">Blended Margin</p>
              <p className={"text-2xl font-bold " + getMarginTextClass(summary.total.margin)}>
                {summary.total.margin.toFixed(1)}%
              </p>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className={"h-full " + getMarginBgClass(summary.total.margin)} style={{ width: Math.max(0, Math.min(summary.total.margin, 100)) + "%" }}></div>
            </div>
          </div>
        </div>

        {/* 요약 테이블 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid grid-cols-5 bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <div className="px-5 py-3 text-left">Status</div>
              <div className="px-5 py-3 text-right">Volume (pcs)</div>
              <div className="px-5 py-3 text-right">Sales Amount</div>
              <div className="px-5 py-3 text-right">Profit Amount</div>
              <div className="px-5 py-3 text-right">Margin</div>
            </div>
            <div className="divide-y divide-slate-100 text-sm">
              <div className="grid grid-cols-5 items-center hover:bg-slate-50 transition-colors">
                <div className="px-5 py-3.5 font-bold text-slate-800 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-700"></div> Total
                </div>
                <div className="px-5 py-3.5 text-right font-semibold text-slate-700">{summary.total.qty.toLocaleString()}</div>
                <div className="px-5 py-3.5 text-right font-bold text-slate-800">${summary.total.sales.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                <div className="px-5 py-3.5 text-right font-bold text-indigo-600">${summary.total.profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                <div className="px-5 py-3.5 text-right font-bold flex justify-end">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getMarginBadgeClass(summary.total.margin)}`}>
                    {summary.total.margin.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-5 items-center hover:bg-slate-50 transition-colors">
                <div className="px-5 py-3.5 font-bold text-blue-600 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div> Open
                </div>
                <div className="px-5 py-3.5 text-right font-medium text-slate-600">{summary.open.qty.toLocaleString()}</div>
                <div className="px-5 py-3.5 text-right font-semibold text-blue-700">${summary.open.sales.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                <div className="px-5 py-3.5 text-right font-semibold text-blue-700">${summary.open.profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                <div className="px-5 py-3.5 text-right font-medium flex justify-end">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getMarginBadgeClass(summary.open.margin)}`}>
                    {summary.open.margin.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-5 items-center hover:bg-slate-50 transition-colors">
                <div className="px-5 py-3.5 font-bold text-emerald-600 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Invoiced
                </div>
                <div className="px-5 py-3.5 text-right font-medium text-slate-600">{summary.invoiced.qty.toLocaleString()}</div>
                <div className="px-5 py-3.5 text-right font-semibold text-emerald-700">${summary.invoiced.sales.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                <div className="px-5 py-3.5 text-right font-semibold text-emerald-700">${summary.invoiced.profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                <div className="px-5 py-3.5 text-right font-medium flex justify-end">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getMarginBadgeClass(summary.invoiced.margin)}`}>
                    {summary.invoiced.margin.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 차트 & 통계 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 아이템별 실적 */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-slate-500" />
                <h3 className="font-semibold text-slate-800">아이템별 실적 (Item Performance)</h3>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={itemBuyerFilter} onChange={(e) => setItemBuyerFilter(e.target.value)}
                  className="text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm cursor-pointer"
                >
                  {buyerOptions.map(b => <option key={b} value={b}>{b === 'ALL' ? '전체 바이어' : b}</option>)}
                </select>
                <select
                  value={selectedItemFilter} onChange={(e) => setSelectedItemFilter(e.target.value)}
                  className="text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm cursor-pointer max-w-[120px] truncate"
                >
                  <option value="ALL">전체 아이템</option>
                  {itemStatsList.map(s => <option key={s.item} value={s.item}>{s.item}</option>)}
                </select>
              </div>
            </div>
            <div className="p-4 flex-1 overflow-auto">
              <div className="space-y-4">
                {(selectedItemFilter === 'ALL' ? itemStatsList : itemStatsList.filter(s => s.item === selectedItemFilter)).map((stat, idx) => {
                  const salesPercent = itemTotalSales > 0 ? (stat.sales / itemTotalSales) * 100 : 0;
                  const marginRate = stat.sales > 0 ? (stat.profit / stat.sales) * 100 : 0;
                  return (
                    <div key={idx} className="flex flex-col gap-2 p-3 rounded-lg border border-slate-100 bg-white hover:border-blue-200 hover:shadow-sm transition-all group">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-slate-800 text-sm group-hover:text-blue-700 transition-colors truncate">{stat.item}</span>
                          <span className="text-xs text-slate-500 mt-0.5">{stat.qty.toLocaleString()} pcs</span>
                        </div>
                        <div className="flex flex-col items-end whitespace-nowrap shrink-0">
                          <span className="font-bold text-slate-800 text-sm">
                            {"$" + stat.sales.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-xs font-normal text-slate-400 ml-1">Sales</span>
                          </span>
                          <span className={"text-xs font-bold mt-1 px-2 py-0.5 rounded-full " + getMarginBadgeClass(marginRate)}>
                            Profit: {"$" + stat.profit.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="font-medium opacity-80 ml-1">({marginRate.toFixed(1)}%)</span>
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex mt-1">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: salesPercent + "%" }}></div>
                      </div>
                    </div>
                  );
                })}
                {itemStatsList.length === 0 && <div className="text-center text-slate-400 py-8 text-sm">데이터가 없습니다.</div>}
              </div>
            </div>
          </div>

          {/* 월별 납기 */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-500" />
                <h3 className="font-semibold text-slate-800">월별 납기 (Delivery)</h3>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <select
                  value={monthBuyerFilter} onChange={(e) => setMonthBuyerFilter(e.target.value)}
                  className="text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm cursor-pointer"
                >
                  {buyerOptions.map(b => <option key={b} value={b}>{b === 'ALL' ? '전체 바이어' : b}</option>)}
                </select>
                <select
                  value={selectedYearFilter} onChange={(e) => setSelectedYearFilter(e.target.value)}
                  className="text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm cursor-pointer max-w-[90px]"
                >
                  <option value="ALL">전체 연도</option>
                  {availableYears.map(y => <option key={y} value={y}>{y}년</option>)}
                </select>
                <select
                  value={selectedMonthFilter} onChange={(e) => setSelectedMonthFilter(e.target.value)}
                  className="text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm cursor-pointer max-w-[80px]"
                >
                  <option value="ALL">전체 월</option>
                  {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => <option key={m} value={m}>{m}월</option>)}
                </select>
              </div>
            </div>
            <div className="p-4 flex-1 overflow-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="text-slate-500 border-b-2 border-slate-100 text-xs uppercase bg-slate-50">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Month</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Q'ty (pcs)</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Sales ($)</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Profit ($)</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthStatsList.map((stat, idx) => {
                    const marginRate = stat.sales > 0 ? (stat.profit / stat.sales) * 100 : 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-medium text-slate-700">{stat.month}</td>
                        <td className="py-3 px-3 text-right text-slate-600">{stat.qty.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-semibold text-slate-800">{"$" + stat.sales.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                        <td className="py-3 px-3 text-right font-medium text-indigo-600">{"$" + stat.profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                        <td className="py-3 px-3 text-right">
                          <span className={"inline-block px-2 py-0.5 rounded-full text-[11px] font-bold " + getMarginBadgeClass(marginRate)}>
                            {marginRate.toFixed(1) + "%"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {monthStatsList.length === 0 && (
                    <tr><td colSpan="5" className="text-center text-slate-400 py-8 text-sm">데이터가 없습니다.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// ============================================================================
// 4. DATASHEET COMPONENT
// ============================================================================
const DataSheet = ({ data, onUpdateData }) => {
  const [showTrims, setShowTrims] = useState(false);
  const [showFabric, setShowFabric] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editingImageId, setEditingImageId] = useState(null);
  const fileInputRef = useRef(null);

  const processedData = useMemo(() => {
    let calculatedData = data.map(calculateRowCosts);

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
          const subtotalMargin = subtotal.amount > 0 ? (subtotal.totalProfit / subtotal.amount) * 100 : 0;
          finalData.push({ ...subtotal, profitMargin: subtotalMargin, isSubtotal: true, id: "subtotal-" + currentStyle });
        }
        currentStyle = row.style;
        subtotal = { style: currentStyle, count: 0, totalQty: 0, amount: 0, totalProfit: 0, s: 0, m: 0, l: 0, xl: 0, xxl: 0 };
      }

      finalData.push({ ...row, isSubtotal: false });
      subtotal.count += 1;
      subtotal.totalQty += row.totalQty;
      subtotal.amount += row.amount;
      subtotal.totalProfit += (row.profit * row.totalQty);
      subtotal.s += Number(row.s) || 0;
      subtotal.m += Number(row.m) || 0;
      subtotal.l += Number(row.l) || 0;
      subtotal.xl += Number(row.xl) || 0;
      subtotal.xxl += Number(row.xxl) || 0;

      if (index === calculatedData.length - 1 && subtotal) {
        const subtotalMargin = subtotal.amount > 0 ? (subtotal.totalProfit / subtotal.amount) * 100 : 0;
        finalData.push({ ...subtotal, profitMargin: subtotalMargin, isSubtotal: true, id: "subtotal-" + currentStyle });
      }
    });

    return finalData;
  }, [data, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const handleDoubleClick = (id, field, value) => {
    setEditingCell({ id, field });
    setEditValue(value === 0 && typeof value === 'number' ? "" : value);
  };

  const handleSaveAndMove = (direction = null) => {
    if (!editingCell) return;
    const { id, field } = editingCell;
    
    let newData = [...data];
    const rowIndex = newData.findIndex(row => row.id === id);
    if (rowIndex === -1) return;

    let row = { ...newData[rowIndex] };
    const isStringField = ['buyer', 'status', 'style', 'item', 'imageUrl', 'po', 'delivery', 'color', 'fab1Name', 'fab2Name'].includes(field);
    
    let newValue = editValue;
    if (field === 'delivery') {
      newValue = formatDeliveryDate(newValue);
    } else if (!isStringField) {
      newValue = parseFloat(editValue);
      if (isNaN(newValue)) newValue = 0;
    }
    
    row[field] = newValue;
    newData[rowIndex] = row;
    onUpdateData(newData);

    if (direction) {
      const currentFieldIndex = editableColumns.indexOf(field);
      let nextFieldIndex = direction === 'next' ? currentFieldIndex + 1 : currentFieldIndex - 1;
      
      if (nextFieldIndex >= 0 && nextFieldIndex < editableColumns.length) {
        const nextField = editableColumns[nextFieldIndex];
        setEditingCell({ id, field: nextField });
        setEditValue(row[nextField] === 0 ? "" : row[nextField]);
      } else {
        setEditingCell(null);
      }
    } else {
      setEditingCell(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); handleSaveAndMove();
    } else if (e.key === 'Tab') {
      e.preventDefault(); handleSaveAndMove(e.shiftKey ? 'prev' : 'next');
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
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
        const updatedData = data.map(row => row.id === editingImageId ? { ...row, imageUrl: reader.result } : row);
        onUpdateData(updatedData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddRow = () => {
    const newRow = {
      id: Date.now(), buyer: 'NEW BUYER', status: 'Open', style: 'NEW STYLE', item: 'NEW ITEM', imageUrl: '', po: 'NEW-PO', delivery: '', color: 'COLOR',
      s: 0, m: 0, l: 0, xl: 0, xxl: 0, fab1Name: 'FABRIC 1', fab1Loss: 0, fab1Cons: 0, fab1Price: 0, fab2Name: '', fab2Loss: 0, fab2Cons: 0, fab2Price: 0,
      trimThread: 0, trimButton: 0, trimPrint: 0, trimLabel: 0, cmt: 0, fob: 0
    };
    onUpdateData([...data, newRow]);
  };

  const handleInsertRowAfter = (sourceRow) => {
    const newRow = {
      id: Date.now(),
      buyer: sourceRow.buyer || '',
      status: sourceRow.status || 'Open',
      style: sourceRow.style || '',
      item: sourceRow.item || '',
      imageUrl: sourceRow.imageUrl || '',
      po: sourceRow.po || '',
      delivery: sourceRow.delivery || '',
      color: '', 
      s: 0, m: 0, l: 0, xl: 0, xxl: 0,
      fab1Name: sourceRow.fab1Name || '', fab1Loss: sourceRow.fab1Loss || 0, fab1Cons: sourceRow.fab1Cons || 0, fab1Price: sourceRow.fab1Price || 0,
      fab2Name: sourceRow.fab2Name || '', fab2Loss: sourceRow.fab2Loss || 0, fab2Cons: sourceRow.fab2Cons || 0, fab2Price: sourceRow.fab2Price || 0,
      trimThread: sourceRow.trimThread || 0, trimButton: sourceRow.trimButton || 0, trimPrint: sourceRow.trimPrint || 0, trimLabel: sourceRow.trimLabel || 0,
      cmt: sourceRow.cmt || 0,
      fob: sourceRow.fob || 0
    };

    const newData = [...data];
    const index = newData.findIndex(r => r.id === sourceRow.id);
    
    if (index !== -1) {
      newData.splice(index + 1, 0, newRow); 
    } else {
      newData.push(newRow);
    }
    
    onUpdateData(newData);
  };

  const handleDeleteRow = (id) => {
    onUpdateData(data.filter(row => row.id !== id));
  };

  const SortHeader = ({ label, sortKey, className = "", rowSpan, colSpan }) => (
    <th 
      rowSpan={rowSpan} colSpan={colSpan}
      onClick={() => sortKey && requestSort(sortKey)}
      className={"px-2 py-2 border-r border-b border-slate-200 font-semibold text-center " + (sortKey ? "cursor-pointer hover:bg-slate-200 transition-colors select-none " : "") + className}
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

  const renderEditableCell = (row, field, format = 'text', align = 'left') => {
    const isEditing = editingCell?.id === row.id && editingCell?.field === field;
    
    if (isEditing) {
      if (field === 'status') {
        return (
          <select
            autoFocus value={editValue} onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => handleSaveAndMove()} onKeyDown={handleKeyDown}
            className="w-full min-w-[70px] border-2 border-blue-500 rounded bg-white shadow-sm focus:outline-none px-1 py-1 text-slate-800 text-xs"
          >
            <option value="Open">Open</option><option value="Invoiced">Invoiced</option><option value="Cancel">Cancel</option>
          </select>
        );
      }
      return (
        <input 
          type="text" autoFocus value={editValue} onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => handleSaveAndMove()} onKeyDown={handleKeyDown}
          className={"w-full min-w-[50px] border-2 border-blue-500 rounded bg-white shadow-sm focus:outline-none px-1 py-1 text-slate-800 text-xs " + (align === 'right' ? 'text-right' : 'text-left')}
          placeholder={field === 'delivery' ? 'YYYYMMDD' : ''}
        />
      );
    }

    let displayValue = row[field];
    if (format === 'status') {
      const statusColors = { 'Open': 'bg-blue-50 text-blue-600 border-blue-200', 'Invoiced': 'bg-emerald-50 text-emerald-600 border-emerald-200', 'Cancel': 'bg-red-50 text-red-600 border-red-200' };
      const badgeClass = statusColors[displayValue] || 'bg-slate-50 text-slate-600 border-slate-200';
      return (
        <div
          className={"cursor-pointer px-1 py-0.5 rounded border text-center text-[10px] font-bold transition-colors " + badgeClass}
          onDoubleClick={() => handleDoubleClick(row.id, field, row[field] || 'Open')} title="더블클릭하여 상태 변경 (Tab으로 이동)"
        >
          {displayValue || 'Open'}
        </div>
      );
    }
    
    if (format === 'currency') displayValue = "$" + Number(row[field] || 0).toFixed(2);
    else if (format === 'cons') displayValue = Number(row[field] || 0).toFixed(3);
    else if (format === 'percent') displayValue = Number(row[field] || 0) + "%";
    else if (format === 'number') displayValue = Number(row[field] || 0).toLocaleString();

    return (
      <div 
        className={"cursor-pointer hover:bg-blue-100 hover:ring-1 hover:ring-blue-300 rounded px-1 py-1 -mx-1 transition-colors min-h-[20px] text-xs " + (align === 'right' ? 'text-right' : 'text-left')}
        onDoubleClick={() => handleDoubleClick(row.id, field, row[field])} title="더블클릭하여 수정 (Tab으로 이동)"
      >
        {displayValue || (format === 'text' ? <span className="text-slate-300 italic">...</span> : displayValue)}
      </div>
    );
  };

  const renderImageCell = (row) => (
    <div 
      className="cursor-pointer flex items-center justify-center w-12 h-12 bg-slate-100 rounded border border-slate-200 overflow-hidden hover:ring-2 hover:ring-blue-400 transition-all mx-auto group relative"
      onDoubleClick={() => handleImageClick(row.id)} title="더블클릭하여 PC에서 이미지 삽입"
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-1 animate-in fade-in duration-300 min-h-0">
      <input type="file" accept="image/jpeg, image/png" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50 flex-wrap gap-2 shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-slate-800">Master Order Sheet</h2>
          <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm hidden sm:inline-block">
            💡 Tip: 더블클릭으로 수정하고, <strong>Tab</strong> 키로 다음 칸으로 바로 이동하세요.
          </span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowFabric(!showFabric)} className={"flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors shadow-sm border " + (showFabric ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")}>
            {showFabric ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />} {showFabric ? 'Hide Fabric' : 'Show Fabric'}
          </button>
          <button onClick={() => setShowTrims(!showTrims)} className={"flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors shadow-sm border " + (showTrims ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")}>
            {showTrims ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />} {showTrims ? 'Hide Trims' : 'Show Trims'}
          </button>
          <button onClick={handleAddRow} className="flex items-center gap-1.5 text-xs font-medium text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Add Row
          </button>
        </div>
      </div>
      
      <div className="overflow-auto flex-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
        <table className="w-full text-xs text-left border-collapse min-w-[max-content]">
          <thead className="text-slate-600 uppercase bg-slate-100 sticky top-0 z-30 shadow-sm">
            <tr>
              <SortHeader label="Buyer" sortKey="buyer" rowSpan="2" className="sticky left-0 z-40 bg-slate-100 min-w-[100px]" />
              <SortHeader label="Status" sortKey="status" rowSpan="2" className="bg-slate-100 min-w-[70px]" />
              <SortHeader label="Style" sortKey="style" rowSpan="2" className="bg-slate-100 min-w-[120px]" />
              <SortHeader label="Item" sortKey="item" rowSpan="2" className="bg-slate-100 min-w-[120px]" />
              <SortHeader label="Image" rowSpan="2" className="bg-slate-100" />
              <SortHeader label="PO" sortKey="po" rowSpan="2" className="bg-slate-100" />
              <SortHeader label="Delivery" sortKey="delivery" rowSpan="2" className="bg-slate-100" />
              <SortHeader label="Color" sortKey="color" rowSpan="2" className="bg-slate-100" />
              <th colSpan="5" className="px-2 py-1 border-r border-b border-slate-200 text-center font-semibold bg-slate-200/50">Qty</th>
              <SortHeader label="Total Q'ty" sortKey="totalQty" rowSpan="2" className="bg-blue-50/50 text-blue-800" />
              <SortHeader label="FOB($)" sortKey="fob" rowSpan="2" className="bg-emerald-50/50 text-emerald-800" />
              <SortHeader label="Amount" sortKey="amount" rowSpan="2" className="bg-emerald-100/50 text-emerald-900" />
              {showFabric ? (
                <><th colSpan="4" className="px-2 py-1 border-r border-b border-slate-200 text-center font-semibold bg-amber-50/50 text-amber-800">Fabric 1</th><th colSpan="4" className="px-2 py-1 border-r border-b border-slate-200 text-center font-semibold bg-orange-50/50 text-orange-800">Fabric 2</th></>
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
              <th rowSpan="2" className="px-2 py-2 border-b border-slate-200 bg-slate-100 text-center">Action</th>
            </tr>
            <tr className="bg-slate-50 text-slate-500 text-[10px]">
              <th className="px-2 py-1 border-r border-b border-slate-200 text-right">S</th><th className="px-2 py-1 border-r border-b border-slate-200 text-right">M</th><th className="px-2 py-1 border-r border-b border-slate-200 text-right">L</th><th className="px-2 py-1 border-r border-b border-slate-200 text-right">XL</th><th className="px-2 py-1 border-r border-b border-slate-200 text-right text-blue-600 font-bold">XXL</th>
              {showFabric && (
                <><th className="px-2 py-1 border-r border-b border-slate-200 text-left bg-amber-50/30 min-w-[80px]">Item</th><th className="px-2 py-1 border-r border-b border-slate-200 text-right bg-amber-50/30 text-amber-700">Loss(%)</th><th className="px-2 py-1 border-r border-b border-slate-200 text-right bg-amber-50/30">Con's</th><th className="px-2 py-1 border-r border-b border-slate-200 text-right bg-amber-50/30">Price($)</th><th className="px-2 py-1 border-r border-b border-slate-200 text-left bg-orange-50/30 min-w-[80px]">Item</th><th className="px-2 py-1 border-r border-b border-slate-200 text-right bg-orange-50/30 text-orange-700">Loss(%)</th><th className="px-2 py-1 border-r border-b border-slate-200 text-right bg-orange-50/30">Con's</th><th className="px-2 py-1 border-r border-b border-slate-200 text-right bg-orange-50/30">Price($)</th></>
              )}
              {showTrims && (
                <><th className="px-2 py-1 border-r border-b border-slate-200 text-right bg-purple-50/30">Thread</th><th className="px-2 py-1 border-r border-b border-slate-200 text-right bg-purple-50/30">Button</th><th className="px-2 py-1 border-r border-b border-slate-200 text-right bg-purple-50/30">Print</th><th className="px-2 py-1 border-r border-b border-slate-200 text-right bg-purple-50/30">Label</th></>
              )}
              <th className="px-2 py-1 border-r border-b border-slate-200 text-right bg-purple-100/50 font-bold">Total Trim</th>
            </tr>
          </thead>
          <tbody className="text-slate-700 font-medium divide-y divide-slate-100">
            {processedData.map((row) => {
              if (row.isSubtotal) {
                return (
                  <tr key={row.id} className="bg-slate-100 font-bold border-y-2 border-slate-300 hover:bg-slate-200 transition-colors">
                    <td colSpan="8" className="px-3 py-3 border-r border-slate-200 sticky left-0 z-20 bg-slate-100 text-right text-slate-600">{row.style} <span className="text-[10px] font-normal ml-2">({row.count} items) Subtotal :</span></td>
                    <td className="px-2 py-3 border-r border-slate-200 text-right text-slate-700 bg-slate-200/50">{row.s.toLocaleString()}</td><td className="px-2 py-3 border-r border-slate-200 text-right text-slate-700 bg-slate-200/50">{row.m.toLocaleString()}</td><td className="px-2 py-3 border-r border-slate-200 text-right text-slate-700 bg-slate-200/50">{row.l.toLocaleString()}</td><td className="px-2 py-3 border-r border-slate-200 text-right text-slate-700 bg-slate-200/50">{row.xl.toLocaleString()}</td><td className="px-2 py-3 border-r border-slate-200 text-right text-blue-800 bg-blue-100/30">{row.xxl.toLocaleString()}</td>
                    <td className="px-2 py-3 border-r border-slate-200 text-right text-blue-700 bg-blue-100/50">{row.totalQty.toLocaleString()}</td>
                    <td className="border-r border-slate-200 bg-slate-100"></td>
                    <td className="px-2 py-3 border-r border-slate-200 text-right text-emerald-700 bg-emerald-100/50">{"$" + row.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td colSpan={showFabric ? 8 : 1} className="border-r border-slate-200 bg-slate-100"></td>
                    <td colSpan={showTrims ? 5 : 1} className="border-r border-slate-200 bg-slate-100"></td>
                    <td colSpan="2" className="border-r border-slate-200 bg-slate-100"></td>
                    <td className="px-2 py-3 border-r border-slate-200 text-right text-sky-700 bg-sky-100/50">{"$" + row.totalProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td className="px-2 py-3 border-r border-slate-200 text-right bg-slate-100/50">
                      <span className={"px-2 py-1 rounded text-xs font-bold " + getMarginBadgeClass(row.profitMargin || 0)}>
                        {row.profitMargin ? row.profitMargin.toFixed(1) + "%" : "0.0%"}
                      </span>
                    </td>
                    <td className="bg-slate-100"></td>
                  </tr>
                );
              }
              return (
                <tr key={row.id} className="hover:bg-blue-50/40 transition-colors group">
                  <td className="px-3 py-2 border-r border-slate-100 sticky left-0 z-20 bg-white group-hover:bg-blue-50/40 font-bold text-slate-800 align-middle">{renderEditableCell(row, 'buyer', 'text')}</td>
                  <td className="px-2 py-1 border-r border-slate-100 align-middle text-center">{renderEditableCell(row, 'status', 'status')}</td>
                  <td className="px-3 py-2 border-r border-slate-100 font-bold text-slate-800 align-middle">{renderEditableCell(row, 'style', 'text')}</td>
                  <td className="px-3 py-2 border-r border-slate-100 font-semibold text-slate-700 align-middle">{renderEditableCell(row, 'item', 'text')}</td>
                  <td className="px-2 py-1 border-r border-slate-100 align-middle">{renderImageCell(row)}</td>
                  <td className="px-3 py-2 border-r border-slate-100 text-slate-600 align-middle">{renderEditableCell(row, 'po', 'text')}</td>
                  <td className="px-3 py-2 border-r border-slate-100 text-slate-600 align-middle">{renderEditableCell(row, 'delivery', 'text')}</td>
                  <td className="px-3 py-2 border-r border-slate-100 text-slate-600 align-middle min-w-[100px]">{renderEditableCell(row, 'color', 'text')}</td>
                  <td className="px-2 py-2 border-r border-slate-100 w-12">{renderEditableCell(row, 's', 'number', 'right')}</td><td className="px-2 py-2 border-r border-slate-100 w-12">{renderEditableCell(row, 'm', 'number', 'right')}</td><td className="px-2 py-2 border-r border-slate-100 w-12">{renderEditableCell(row, 'l', 'number', 'right')}</td><td className="px-2 py-2 border-r border-slate-100 w-12">{renderEditableCell(row, 'xl', 'number', 'right')}</td><td className="px-2 py-2 border-r border-slate-100 w-12 bg-blue-50/20">{renderEditableCell(row, 'xxl', 'number', 'right')}</td>
                  <td className="px-2 py-2 border-r border-slate-100 text-right font-bold text-blue-700 bg-blue-50/40 align-middle">{row.totalQty > 0 ? row.totalQty.toLocaleString() : '-'}</td>
                  <td className="px-2 py-2 border-r border-slate-100 font-bold text-emerald-700 bg-emerald-50/10 w-16">{renderEditableCell(row, 'fob', 'currency', 'right')}</td>
                  <td className="px-2 py-2 border-r border-slate-100 text-right font-bold text-emerald-800 bg-emerald-100/20 align-middle text-sm">{"$" + row.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  {showFabric ? (
                    <><td className="px-2 py-2 border-r border-slate-100 bg-amber-50/10 text-slate-600">{renderEditableCell(row, 'fab1Name', 'text')}</td><td className="px-2 py-2 border-r border-slate-100 bg-amber-50/20 w-14 text-amber-700">{renderEditableCell(row, 'fab1Loss', 'percent', 'right')}</td><td className="px-2 py-2 border-r border-slate-100 bg-amber-50/10 w-14">{renderEditableCell(row, 'fab1Cons', 'cons', 'right')}</td><td className="px-2 py-2 border-r border-slate-100 bg-amber-50/10 w-14">{renderEditableCell(row, 'fab1Price', 'currency', 'right')}</td><td className="px-2 py-2 border-r border-slate-100 bg-orange-50/10 text-slate-600">{renderEditableCell(row, 'fab2Name', 'text')}</td><td className="px-2 py-2 border-r border-slate-100 bg-orange-50/20 w-14 text-orange-700">{renderEditableCell(row, 'fab2Loss', 'percent', 'right')}</td><td className="px-2 py-2 border-r border-slate-100 bg-orange-50/10 w-14">{renderEditableCell(row, 'fab2Cons', 'cons', 'right')}</td><td className="px-2 py-2 border-r border-slate-100 bg-orange-50/10 w-14">{renderEditableCell(row, 'fab2Price', 'currency', 'right')}</td></>
                  ) : (
                    <td className="px-2 py-2 border-r border-slate-100 bg-amber-50/10 text-right font-semibold align-middle text-amber-700">{"$" + row.totalFabricCost.toFixed(2)}</td>
                  )}
                  {showTrims && (
                    <><td className="px-2 py-2 border-r border-slate-100 bg-purple-50/10 w-14">{renderEditableCell(row, 'trimThread', 'currency', 'right')}</td><td className="px-2 py-2 border-r border-slate-100 bg-purple-50/10 w-14">{renderEditableCell(row, 'trimButton', 'currency', 'right')}</td><td className="px-2 py-2 border-r border-slate-100 bg-purple-50/10 w-14">{renderEditableCell(row, 'trimPrint', 'currency', 'right')}</td><td className="px-2 py-2 border-r border-slate-100 bg-purple-50/10 w-14">{renderEditableCell(row, 'trimLabel', 'currency', 'right')}</td></>
                  )}
                  <td className="px-2 py-2 border-r border-slate-100 bg-purple-100/30 text-right font-semibold align-middle">{"$" + row.totalTrimCost.toFixed(2)}</td>
                  <td className="px-2 py-2 border-r border-slate-100 bg-indigo-50/10 w-16">{renderEditableCell(row, 'cmt', 'currency', 'right')}</td>
                  <td className="px-2 py-2 border-r border-slate-100 text-right font-bold text-slate-800 bg-slate-100/80 align-middle">{"$" + row.unitTotalCost.toFixed(2)}</td>
                  <td className="px-2 py-2 border-r border-slate-100 text-right font-bold text-sky-700 bg-sky-50/20 align-middle text-sm">{"$" + row.profit.toFixed(2)}</td>
                  <td className="px-2 py-2 border-r border-slate-100 text-right font-bold align-middle">
                    {row.totalQty > 0 ? (
                      <span className={`px-2 py-0.5 rounded text-[11px] ${getMarginBadgeClass(row.profitMargin)}`}>
                        {row.profitMargin.toFixed(1)}%
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-2 py-2 text-center align-middle">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleInsertRowAfter(row)} className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="현재 스타일 내용 복사하여 아래에 추가">
                        <Plus className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteRow(row.id)} className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="행 삭제">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};


// ============================================================================
// 5. MAIN APP COMPONENT
// ============================================================================
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('sheet');
  const [isSynced, setIsSynced] = useState(false);
  const csvInputRef = useRef(null);

  const loadInitialData = () => {
    try {
      const saved = localStorage.getItem('costingMasterData');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error("데이터 불러오기 실패", e); }
    return initialData;
  };
  
  const [data, setData] = useState(loadInitialData);

  const saveToLocal = (newData) => {
    setData(newData);
    localStorage.setItem('costingMasterData', JSON.stringify(newData));
    setIsSynced(true);
    setTimeout(() => setIsSynced(false), 2000);
  };

  const handleExportCSV = () => {
    const headers = ['id', 'buyer', 'status', 'style', 'item', 'po', 'delivery', 'color', 's', 'm', 'l', 'xl', 'xxl', 'fob', 'fab1Name', 'fab1Loss', 'fab1Cons', 'fab1Price', 'fab2Name', 'fab2Loss', 'fab2Cons', 'fab2Price', 'trimThread', 'trimButton', 'trimPrint', 'trimLabel', 'cmt'];
    const csvRows = [headers.join(',')];
    
    data.forEach(row => {
      const values = headers.map(header => {
        let val = row[header] === null || row[header] === undefined ? '' : row[header];
        val = String(val).replace(/"/g, '""');
        return `"${val}"`;
      });
      csvRows.push(values.join(','));
    });

    const blob = new Blob(['\ufeff' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `CostingMaster_Data_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split('\n');
      if (rows.length < 2) return;
      
      const headers = rows[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
      const newData = [];
      const numericFields = ['id', 's', 'm', 'l', 'xl', 'xxl', 'fob', 'fab1Loss', 'fab1Cons', 'fab1Price', 'fab2Loss', 'fab2Cons', 'fab2Price', 'trimThread', 'trimButton', 'trimPrint', 'trimLabel', 'cmt'];

      for (let i = 1; i < rows.length; i++) {
        if (!rows[i].trim()) continue;
        const values = rows[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^"|"$/g, '').trim());
        let newRow = { imageUrl: '' };
        
        headers.forEach((h, idx) => {
          let val = values[idx];
          if (numericFields.includes(h)) {
            val = val ? Number(String(val).replace(/,/g, '').trim()) || 0 : 0;
          }
          newRow[h] = val;
        });
        
        if (!newRow.id) newRow.id = Date.now() + i;
        if (!newRow.status) newRow.status = 'Open';
        if (!newRow.buyer) newRow.buyer = 'UNKNOWN';
        newData.push(newRow);
      }
      
      saveToLocal(newData);
      e.target.value = null;
    };
    reader.readAsText(file);
  };

  if (!isAuthenticated) return <Login onLogin={() => setIsAuthenticated(true)} />;

  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex flex-col font-sans">
      <input type="file" accept=".csv" ref={csvInputRef} onChange={handleImportCSV} className="hidden" />

      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between sticky top-0 z-50 shadow-md gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-2 rounded-lg border border-blue-500/30">
              <Calculator className="text-blue-400 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Costing Master V4</h1>
              <p className="text-xs text-slate-400">Garment Order & Cost Analysis</p>
            </div>
          </div>
          
          {isSynced && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-full text-[10px] text-emerald-400 font-medium ml-4">
              <Save className="w-3.5 h-3.5" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div> Saved locally
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2">
            <button onClick={() => csvInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-700 transition-colors text-xs font-medium" title="CSV 데이터 불러오기">
              <Upload className="w-3.5 h-3.5" /> CSV 가져오기
            </button>
            <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-700 transition-colors text-xs font-medium" title="현재 데이터를 CSV로 저장">
              <Download className="w-3.5 h-3.5" /> CSV 내보내기
            </button>
          </div>
          
          <div className="flex gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button onClick={() => setActiveTab('sheet')} className={"flex items-center gap-2 px-5 py-2 rounded-md font-medium text-sm transition-all duration-200 " + (activeTab === 'sheet' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-700')}>
              <FileSpreadsheet className="w-4 h-4" /> Data Sheet
            </button>
            <button onClick={() => setActiveTab('dashboard')} className={"flex items-center gap-2 px-5 py-2 rounded-md font-medium text-sm transition-all duration-200 " + (activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-700')}>
              <LayoutDashboard className="w-4 h-4" /> Analytics
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-4 lg:px-6 w-full flex flex-col">
        {activeTab === 'dashboard' ? (
          <Dashboard data={data} />
        ) : (
          <DataSheet data={data} onUpdateData={saveToLocal} />
        )}
      </main>
    </div>
  );
}