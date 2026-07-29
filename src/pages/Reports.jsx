import { useState, useMemo } from "react";
import {
  FiTrendingUp,
  FiDownload,
  FiPrinter,
  FiArchive,
  FiClock,
  FiCalendar,
  FiChevronDown,
  FiChevronUp
} from "react-icons/fi";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import AdminLayout from "../components/AdminLayout";
import { useHelpingHands } from "../hooks/useHelpingHands";

ChartJS.register(
  CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend
);

// ── Helpers ──────────────────────────────────────────────────────────────────
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const SHORT_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function monthKey(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key) {
  if (!key) return "—";
  const [year, mon] = key.split("-");
  return `${MONTH_NAMES[parseInt(mon) - 1]} ${year}`;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Reports() {
  const { borrowers, equipment, stats } = useHelpingHands();
  const [expandedMonth, setExpandedMonth] = useState(null);

  // ── Build month-by-month structured data from borrow records ──────────────
  const monthlyData = useMemo(() => {
    const map = {};

    borrowers.forEach(b => {
      const key = monthKey(b.borrow_date);
      if (!key) return;
      if (!map[key]) {
        map[key] = { key, borrows: [], returns: [], outstanding: 0, overdue: 0 };
      }
      map[key].borrows.push(b);

      // Track returns in the month they were returned
      if (b.actual_return_date && b.status === "Returned") {
        const retKey = monthKey(b.actual_return_date);
        if (retKey) {
          if (!map[retKey]) {
            map[retKey] = { key: retKey, borrows: [], returns: [], outstanding: 0, overdue: 0 };
          }
          map[retKey].returns.push(b);
        }
      }
    });

    // Compute outstanding & overdue per month
    const today = new Date().toISOString().split("T")[0];
    Object.values(map).forEach(m => {
      m.outstanding = m.borrows.filter(b => b.status === "Borrowed" || b.status === "Overdue").length;
      m.overdue     = m.borrows.filter(b =>
        (b.status === "Borrowed" || b.status === "Overdue") && b.expected_return_date < today
      ).length;
    });

    // Sort descending (newest first)
    return Object.values(map).sort((a, b) => b.key.localeCompare(a.key));
  }, [borrowers]);

  // ── Build chart data from real monthly borrow counts ─────────────────────
  const last6Months = useMemo(() => {
    const keys = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }
    return keys;
  }, []);

  const chartBorrowCounts = last6Months.map(k => {
    const m = monthlyData.find(x => x.key === k);
    return m ? m.borrows.length : 0;
  });

  const chartReturnCounts = last6Months.map(k => {
    const m = monthlyData.find(x => x.key === k);
    return m ? m.returns.length : 0;
  });

  const lineChartData = {
    labels: last6Months.map(k => SHORT_MONTHS[parseInt(k.split("-")[1]) - 1] + " " + k.split("-")[0]),
    datasets: [
      {
        label: "Borrows",
        data: chartBorrowCounts,
        borderColor: "#2563EB",
        backgroundColor: "rgba(37,99,235,0.15)",
        tension: 0.4,
        pointBackgroundColor: "#2563EB",
        pointRadius: 5,
        borderWidth: 2
      },
      {
        label: "Returns",
        data: chartReturnCounts,
        borderColor: "#10B981",
        backgroundColor: "rgba(16,185,129,0.15)",
        tension: 0.4,
        pointBackgroundColor: "#10B981",
        pointRadius: 5,
        borderWidth: 2
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,

    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: { legend: { display: true, position: "top", labels: { usePointStyle: true, font: { size: 11 } } } },
    scales: {
      y: { beginAtZero: true, grid: { color: "#f1f5f9" }, ticks: { stepSize: 1 } },
      x: { grid: { display: false } }
    }
  };

  // ── Category utilization bar ──────────────────────────────────────────────
  const categories = ["Wheelchairs", "Oxygen", "Hospital Beds", "Nebulizers", "Walkers", "Others"];
  const categoryCounts = categories.map(cat =>
    borrowers.filter(b => {
      const eq = equipment.find(e => e.id === b.equipment_id);
      return eq && eq.category === cat;
    }).length
  );

  const barChartData = {
    labels: categories,
    datasets: [{
      label: "Total Borrows",
      data: categoryCounts,
      backgroundColor: ["#2563EB","#3B82F6","#60A5FA","#93C5FD","#6EE7B7","#FCD34D"],
      borderWidth: 0,
      borderRadius: 8
    }]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: "#f1f5f9" }, ticks: { stepSize: 1 } },
      x: { grid: { display: false } }
    }
  };

  // ── CSV Export (includes monthly summary) ─────────────────────────────────
  const exportToCSV = () => {
    // Sheet 1: All borrow records
    const header1 = "Borrower ID,Name,Phone,Patient,Equipment,Borrow Date,Expected Return,Actual Return,Status,Returned By,Notes\n";
    const rows1 = borrowers.map(b => {
      const eq = equipment.find(e => e.id === b.equipment_id);
      return `"${b.id}","${b.name}","${b.phone}","${b.patient_name}","${eq?.name || ""}","${b.borrow_date}","${b.expected_return_date}","${b.actual_return_date || ""}","${b.status}","${b.returned_by || ""}","${b.notes || ""}"`;
    }).join("\n");

    // Sheet 2: Monthly summary
    const header2 = "\n\nMONTHLY SUMMARY\nMonth,Total Borrows,Total Returns,Outstanding,Overdue\n";
    const rows2 = [...monthlyData].sort((a,b) => a.key.localeCompare(b.key)).map(m =>
      `"${monthLabel(m.key)}","${m.borrows.length}","${m.returns.length}","${m.outstanding}","${m.overdue}"`
    ).join("\n");

    const blob = new Blob([header1 + rows1 + header2 + rows2], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `helping_hands_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,"0")}`;
  const currentMonthData = monthlyData.find(m => m.key === currentMonthKey);

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fadeIn print:bg-white print:space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 shadow-sm p-6 rounded-2xl print:hidden">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Operational Reports</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Monthly structured data — all borrow & return records organised by month
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border border-slate-200 transition-colors"
            >
              <FiDownload /> Export CSV
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
            >
              <FiPrinter /> Print PDF
            </button>
          </div>
        </div>

        {/* ── KPI Strip ── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Inventory", value: stats.total, color: "text-slate-800", bg: "bg-slate-50", icon: <FiArchive /> },
            { label: "Available Now",   value: stats.available, color: "text-emerald-600", bg: "bg-emerald-50", icon: <FiArchive /> },
            { label: "This Month Borrows", value: currentMonthData?.borrows.length ?? 0, color: "text-blue-600", bg: "bg-blue-50", icon: <FiTrendingUp /> },
            { label: "Overdue Alerts",  value: stats.overdue, color: "text-red-600", bg: "bg-red-50", icon: <FiClock /> }
          ].map(({ label, value, color, bg, icon }) => (
            <div key={label} className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</p>
                <h3 className={`text-3xl font-black mt-1 ${color}`}>{value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0 text-xl`}>
                {icon}
              </div>
            </div>
          ))}
        </section>

        {/* ── Charts Row ── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200/80 shadow-sm rounded-3xl p-6">
            <h3 className="text-base font-bold text-slate-800 mb-1">Borrow vs Return Trend</h3>
            <p className="text-slate-400 text-xs mb-5">Monthly comparison of issued vs returned equipment (last 6 months)</p>
            <div className="h-64 relative">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 shadow-sm rounded-3xl p-6">
            <h3 className="text-base font-bold text-slate-800 mb-1">Category Utilization</h3>
            <p className="text-slate-400 text-xs mb-5">Total borrows per equipment category (all time)</p>
            <div className="h-64 relative">
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </div>
        </section>

        {/* ── Monthly Structured Table ── */}
        <section className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FiCalendar className="text-xl" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Monthly Data — Structured Summary</h3>
              <p className="text-xs text-slate-400 mt-0.5">Each month's borrow and return records, click a row to expand full detail</p>
            </div>
          </div>

          {monthlyData.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">No borrow records yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {/* Table header */}
              <div className="grid grid-cols-6 bg-slate-50/60 text-[10px] font-bold uppercase tracking-wider text-slate-400 px-6 py-3">
                <div className="col-span-2">Month</div>
                <div className="text-center">Borrows</div>
                <div className="text-center">Returns</div>
                <div className="text-center">Outstanding</div>
                <div className="text-center">Overdue</div>
              </div>

              {monthlyData.map(m => {
                const isOpen = expandedMonth === m.key;
                const isCurrentMonth = m.key === currentMonthKey;
                return (
                  <div key={m.key}>
                    {/* Summary row */}
                    <button
                      onClick={() => setExpandedMonth(isOpen ? null : m.key)}
                      className={`w-full grid grid-cols-6 px-6 py-4 text-xs text-left hover:bg-slate-50 transition-colors items-center ${isCurrentMonth ? "bg-blue-50/40" : ""}`}
                    >
                      <div className="col-span-2 flex items-center gap-2">
                        {isOpen ? <FiChevronUp className="text-blue-500 shrink-0" /> : <FiChevronDown className="text-slate-400 shrink-0" />}
                        <span className="font-bold text-slate-800">{monthLabel(m.key)}</span>
                        {isCurrentMonth && (
                          <span className="text-[9px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded-full">Current</span>
                        )}
                      </div>
                      <div className="text-center font-bold text-blue-700">{m.borrows.length}</div>
                      <div className="text-center font-bold text-emerald-700">{m.returns.length}</div>
                      <div className="text-center font-bold text-orange-700">{m.outstanding}</div>
                      <div className={`text-center font-bold ${m.overdue > 0 ? "text-red-600" : "text-slate-400"}`}>
                        {m.overdue > 0 ? m.overdue : "—"}
                      </div>
                    </button>

                    {/* Expanded detail rows */}
                    {isOpen && (
                      <div className="bg-slate-50/60 border-t border-slate-100 px-6 pb-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pt-3 pb-2">
                          Borrow Records — {monthLabel(m.key)}
                        </p>
                        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                                <th className="px-4 py-2.5">ID</th>
                                <th className="px-4 py-2.5">Borrower</th>
                                <th className="px-4 py-2.5">Equipment</th>
                                <th className="px-4 py-2.5">Borrow Date</th>
                                <th className="px-4 py-2.5">Return Date</th>
                                <th className="px-4 py-2.5">Returned By</th>
                                <th className="px-4 py-2.5">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-slate-700">
                              {m.borrows.map(b => {
                                const eq = equipment.find(e => e.id === b.equipment_id);
                                const today = new Date().toISOString().split("T")[0];
                                const isOverdue = (b.status === "Borrowed") && b.expected_return_date < today;
                                return (
                                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-2.5 font-mono text-slate-400">#BOR-{b.id}</td>
                                    <td className="px-4 py-2.5">
                                      <p className="font-bold text-slate-800">{b.name}</p>
                                      <p className="text-[10px] text-slate-400">{b.patient_name}</p>
                                    </td>
                                    <td className="px-4 py-2.5 font-semibold text-slate-700">{eq?.name || "—"}</td>
                                    <td className="px-4 py-2.5">{new Date(b.borrow_date).toLocaleDateString()}</td>
                                    <td className="px-4 py-2.5">
                                      {b.actual_return_date
                                        ? new Date(b.actual_return_date).toLocaleDateString()
                                        : <span className="text-slate-300">Pending</span>}
                                    </td>
                                    <td className="px-4 py-2.5">
                                      {b.returned_by
                                        ? <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full text-[10px] font-bold">{b.returned_by}</span>
                                        : <span className="text-slate-300">—</span>}
                                    </td>
                                    <td className="px-4 py-2.5">
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                        b.status === "Returned"    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : isOverdue                ? "bg-red-50 text-red-700 border-red-200"
                                        : "bg-blue-50 text-blue-700 border-blue-200"
                                      }`}>
                                        {isOverdue ? "Overdue" : b.status}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Print-only summary ── */}
        <div className="hidden print:block text-slate-700 space-y-4 pt-8 border-t border-slate-200">
          <h2 className="text-2xl font-black text-slate-800 text-center">Helping Hands Charity Trust — Operational Audit</h2>
          <p className="text-xs text-center text-slate-400">Generated: {new Date().toLocaleDateString()} | PYDC Admin</p>
          <p className="text-sm"><strong>Summary:</strong> {stats.total} total assets · {stats.available} available · {stats.borrowed} on loan · {stats.overdue} overdue.</p>
          <table className="w-full text-xs border border-slate-200 mt-4" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Month","Borrows","Returns","Outstanding","Overdue"].map(h => (
                  <th key={h} style={{ border: "1px solid #e2e8f0", padding: "6px 10px", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...monthlyData].sort((a,b) => a.key.localeCompare(b.key)).map(m => (
                <tr key={m.key}>
                  <td style={{ border: "1px solid #e2e8f0", padding: "6px 10px" }}>{monthLabel(m.key)}</td>
                  <td style={{ border: "1px solid #e2e8f0", padding: "6px 10px", textAlign: "center" }}>{m.borrows.length}</td>
                  <td style={{ border: "1px solid #e2e8f0", padding: "6px 10px", textAlign: "center" }}>{m.returns.length}</td>
                  <td style={{ border: "1px solid #e2e8f0", padding: "6px 10px", textAlign: "center" }}>{m.outstanding}</td>
                  <td style={{ border: "1px solid #e2e8f0", padding: "6px 10px", textAlign: "center", color: m.overdue > 0 ? "#dc2626" : "#64748b" }}>{m.overdue || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </AdminLayout>
  );
}
