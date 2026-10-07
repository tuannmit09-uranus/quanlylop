import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { TuitionItem } from '../../types';
import { formatVND } from '../../utils/vietqr';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  Layers,
  Columns,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface TuitionRevenueChartProps {
  tuitionItems: TuitionItem[];
  selectedYear: number;
  selectedMonth: number;
  onSelectMonth?: (month: number) => void;
  onSelectYear?: (year: number) => void;
  onNavigateToTuition?: (month: number, year: number) => void;
}

interface MonthlyData {
  month: number;
  label: string;
  shortLabel: string;
  totalExpected: number;
  totalCollected: number;
  totalUnpaid: number;
  studentCount: number;
  collectionRate: number;
}

export const TuitionRevenueChart: React.FC<TuitionRevenueChartProps> = ({
  tuitionItems,
  selectedYear,
  selectedMonth,
  onSelectMonth,
  onSelectYear,
  onNavigateToTuition,
}) => {
  const [chartMode, setChartMode] = useState<'grouped' | 'stacked'>('grouped');

  // Compute 12 months data for the selected fiscal year
  const monthlyData: MonthlyData[] = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const monthItems = tuitionItems.filter(
        (t) => t.periodYear === selectedYear && t.periodMonth === m
      );

      const totalExpected = monthItems.reduce((acc, cur) => acc + (cur.totalAmount || 0), 0);
      const totalCollected = monthItems
        .filter((t) => t.status === 'paid')
        .reduce((acc, cur) => acc + (cur.paidAmount || cur.totalAmount || 0), 0);
      const totalUnpaid = Math.max(0, totalExpected - totalCollected);
      const studentCount = monthItems.length;
      const collectionRate =
        totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

      return {
        month: m,
        label: `Tháng ${m}`,
        shortLabel: `T${m}`,
        totalExpected,
        totalCollected,
        totalUnpaid,
        studentCount,
        collectionRate,
      };
    });
  }, [tuitionItems, selectedYear]);

  // Fiscal Year Aggregations
  const annualSummary = useMemo(() => {
    const totalExpected = monthlyData.reduce((acc, cur) => acc + cur.totalExpected, 0);
    const totalCollected = monthlyData.reduce((acc, cur) => acc + cur.totalCollected, 0);
    const totalUnpaid = Math.max(0, totalExpected - totalCollected);
    const avgRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

    let peakMonth = 0;
    let peakRevenue = 0;
    monthlyData.forEach((d) => {
      if (d.totalExpected > peakRevenue) {
        peakRevenue = d.totalExpected;
        peakMonth = d.month;
      }
    });

    const activeMonthsCount = monthlyData.filter((d) => d.totalExpected > 0).length;

    return {
      totalExpected,
      totalCollected,
      totalUnpaid,
      avgRate,
      peakMonth,
      peakRevenue,
      activeMonthsCount,
    };
  }, [monthlyData]);

  // Available fiscal years from tuition items or nearby years
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>([
      new Date().getFullYear() - 1,
      new Date().getFullYear(),
      new Date().getFullYear() + 1,
      selectedYear,
    ]);
    tuitionItems.forEach((t) => {
      if (t.periodYear) yearsSet.add(t.periodYear);
    });
    return Array.from(yearsSet).sort((a, b) => a - b);
  }, [tuitionItems, selectedYear]);

  // Format axis tick
  const formatYAxisTick = (val: number) => {
    if (val === 0) return '0';
    if (val >= 1_000_000) {
      const millions = val / 1_000_000;
      return millions % 1 === 0 ? `${millions} tr` : `${millions.toFixed(1)} tr`;
    }
    if (val >= 1_000) {
      return `${(val / 1_000).toFixed(0)} k`;
    }
    return String(val);
  };

  // Custom Interactive Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: MonthlyData = payload[0].payload;
      const isSelected = data.month === selectedMonth;

      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-xl border border-slate-700/80 text-xs min-w-[240px] space-y-2.5 z-50">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-sm text-slate-100">
                Kỳ thu {data.label}/{selectedYear}
              </span>
            </div>
            {isSelected && (
              <span className="px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-300 text-[10px] font-bold border border-blue-400/30">
                Đang xem
              </span>
            )}
          </div>

          <div className="space-y-1.5 font-medium">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#0062ff]" />
                <span>Đã thu (Thực thu):</span>
              </span>
              <span className="font-bold text-emerald-400">{formatVND(data.totalCollected)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b]" />
                <span>Chưa thu (Còn nợ):</span>
              </span>
              <span className="font-bold text-amber-400">{formatVND(data.totalUnpaid)}</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
              <span className="text-slate-400">Tổng chỉ tiêu dự thu:</span>
              <span className="font-bold text-white">{formatVND(data.totalExpected)}</span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span>Số học sinh ghi nhận:</span>
              <span className="font-bold text-slate-200">{data.studentCount} học sinh</span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span>Tỷ lệ hoàn thành:</span>
              <span
                className={`font-bold ${
                  data.collectionRate >= 80
                    ? 'text-emerald-400'
                    : data.collectionRate >= 50
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {data.collectionRate}%
              </span>
            </div>
          </div>

          {onSelectMonth && (
            <div className="pt-2 border-t border-slate-800 text-[11px] text-blue-300 flex items-center justify-between">
              <span>Nhấp chuột để chọn Tháng {data.month}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const handleBarClick = (entry: any) => {
    if (entry && entry.month) {
      if (onSelectMonth) {
        onSelectMonth(entry.month);
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
      {/* Top Header of Chart Card */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Xu Hướng Doanh Thu Học Phí Năm Tài Chính {selectedYear}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100/70 text-[#0062ff] text-xs font-bold">
                  12 Tháng
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Biểu đồ phân tích doanh thu đã thu và số tiền còn nợ theo từng kỳ thu học phí trong năm.
              </p>
            </div>
          </div>
        </div>

        {/* Controls: Year selector + Mode toggle + Navigate button */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Grouped vs Stacked Toggle */}
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setChartMode('grouped')}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartMode === 'grouped'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'hover:text-slate-900 text-slate-500'
              }`}
              title="Xem dạng cột đôi (Đã thu cạnh Chưa thu)"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Cột đôi</span>
            </button>
            <button
              type="button"
              onClick={() => setChartMode('stacked')}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartMode === 'stacked'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'hover:text-slate-900 text-slate-500'
              }`}
              title="Xem dạng cột chồng (Cộng dồn tổng học phí)"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Chồng cột</span>
            </button>
          </div>

          {/* Fiscal Year Dropdown */}
          {onSelectYear && (
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => onSelectYear(Number(e.target.value))}
                className="bg-white text-slate-900 font-bold text-xs sm:text-sm rounded-xl px-3 py-1.5 border border-slate-200/90 shadow-2xs appearance-none pr-7 cursor-pointer hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    Năm {y}
                  </option>
                ))}
              </select>
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          {/* Jump to Selected Month Detail Button */}
          {onNavigateToTuition && (
            <button
              type="button"
              onClick={() => onNavigateToTuition(selectedMonth, selectedYear)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0062ff] hover:text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <span>Chi tiết T{selectedMonth}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Mini Stats Banner for Fiscal Year */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/70 p-3.5 sm:p-4 rounded-2xl border border-slate-100">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block">Tổng thực thu cả năm</span>
          <span className="text-sm sm:text-base font-black text-emerald-600 tracking-tight">
            {formatVND(annualSummary.totalCollected)}
          </span>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 block">Tổng dự thu cả năm</span>
          <span className="text-sm sm:text-base font-black text-slate-800 tracking-tight">
            {formatVND(annualSummary.totalExpected)}
          </span>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 block">Tỷ lệ thu hồi cả năm</span>
          <span className="text-sm sm:text-base font-black text-[#0062ff] tracking-tight">
            {annualSummary.avgRate}%
          </span>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 block">Tháng thu cao điểm</span>
          <span className="text-sm sm:text-base font-black text-purple-700 tracking-tight">
            {annualSummary.peakMonth > 0
              ? `Tháng ${annualSummary.peakMonth}`
              : 'Chưa có dữ liệu'}
          </span>
        </div>
      </div>

      {/* Recharts Bar Chart Container */}
      <div className="w-full h-[320px] sm:h-[350px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={monthlyData}
            margin={{ top: 15, right: 15, left: 0, bottom: 5 }}
            onClick={(state: any) => {
              const activePayload = state?.activePayload;
              if (activePayload && activePayload.length) {
                handleBarClick(activePayload[0].payload);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="shortLabel"
              axisLine={false}
              tickLine={false}
              tick={(props) => {
                const { x, y, payload } = props;
                const monthIndex = Number(payload.value.replace('T', ''));
                const isCurrentSelected = monthIndex === selectedMonth;
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={0}
                      y={0}
                      dy={14}
                      textAnchor="middle"
                      fill={isCurrentSelected ? '#0062ff' : '#64748b'}
                      fontWeight={isCurrentSelected ? 'bold' : '500'}
                      fontSize={isCurrentSelected ? 13 : 11}
                      className="cursor-pointer select-none"
                    >
                      {payload.value}
                    </text>
                    {isCurrentSelected && (
                      <circle cx={0} cy={22} r={2.5} fill="#0062ff" />
                    )}
                  </g>
                );
              }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={formatYAxisTick}
              width={65}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingBottom: '12px', fontSize: '12px', fontWeight: 600 }}
              formatter={(value) => {
                if (value === 'totalCollected') return 'Đã thu (Thực thu)';
                if (value === 'totalUnpaid') return 'Chưa thu (Còn nợ)';
                return value;
              }}
            />

            {/* Bars for Collected and Unpaid */}
            <Bar
              dataKey="totalCollected"
              name="totalCollected"
              fill="#0062ff"
              stackId={chartMode === 'stacked' ? 'revenueStack' : undefined}
              radius={chartMode === 'stacked' ? [0, 0, 0, 0] : [6, 6, 0, 0]}
              maxBarSize={38}
              className="cursor-pointer hover:opacity-90 transition-opacity"
            >
              {monthlyData.map((entry) => (
                <Cell
                  key={`cell-collected-${entry.month}`}
                  fill={entry.month === selectedMonth ? '#0052d9' : '#0062ff'}
                />
              ))}
            </Bar>

            <Bar
              dataKey="totalUnpaid"
              name="totalUnpaid"
              fill="#f59e0b"
              stackId={chartMode === 'stacked' ? 'revenueStack' : undefined}
              radius={[6, 6, 0, 0]}
              maxBarSize={38}
              className="cursor-pointer hover:opacity-90 transition-opacity"
            >
              {monthlyData.map((entry) => (
                <Cell
                  key={`cell-unpaid-${entry.month}`}
                  fill={entry.month === selectedMonth ? '#d97706' : '#f59e0b'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Notes & Navigation Hint */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span>
            Đang hiển thị trọng tâm <strong>Tháng {selectedMonth}/{selectedYear}</strong>. Nhấp vào cột tháng bất kỳ trên biểu đồ để chuyển đổi kỳ hiển thị.
          </span>
        </div>

        {onNavigateToTuition && (
          <button
            type="button"
            onClick={() => onNavigateToTuition(selectedMonth, selectedYear)}
            className="text-[#0062ff] font-bold hover:underline flex items-center space-x-1 cursor-pointer self-start sm:self-auto"
          >
            <span>Mở menu Quản lý Học phí</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
