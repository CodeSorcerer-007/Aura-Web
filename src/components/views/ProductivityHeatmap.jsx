import React, { useMemo, useState, useRef, useEffect } from 'react';
import { formatDate } from '../../utils/dateUtils';
import { Flame, CheckCircle2, Calendar } from 'lucide-react';

const LEVEL_CLASSES = [
    'bg-white/[0.05] border-white/[0.04]', // Level 0: 0 tasks
    'bg-emerald-950/90 border-emerald-800/60 text-emerald-300', // Level 1: 1 task
    'bg-emerald-700 border-emerald-600/80 text-white', // Level 2: 2 tasks
    'bg-emerald-500 border-emerald-400 text-black', // Level 3: 3 tasks
    'bg-emerald-400 border-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.5)] text-black' // Level 4+: 4+ tasks
];

const formatLocalDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const ProductivityHeatmap = ({ completedTasks = [], streak = 0 }) => {
    const today = useMemo(() => new Date(), []);
    const currentYear = today.getFullYear();
    const todayStr = useMemo(() => formatLocalDate(today), [today]);
    const scrollContainerRef = useRef(null);

    // Available years: current year, previous year, and any years with completed tasks
    const availableYears = useMemo(() => {
        const years = new Set([currentYear, currentYear - 1]);
        completedTasks.forEach(task => {
            if (task.completionDate) {
                const y = parseInt(task.completionDate.split('-')[0], 10);
                if (!isNaN(y)) years.add(y);
            }
        });
        return Array.from(years).sort((a, b) => b - a);
    }, [completedTasks, currentYear]);

    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [hoveredDay, setHoveredDay] = useState(null);

    // Auto-scroll mobile view to the current month on mount/year switch
    useEffect(() => {
        if (scrollContainerRef.current && selectedYear === currentYear) {
            const currentMonth = today.getMonth();
            const scrollTarget = Math.max(0, (currentMonth / 12) * 730 - 60);
            scrollContainerRef.current.scrollTo({ left: scrollTarget, behavior: 'smooth' });
        }
    }, [selectedYear, currentYear, today]);

    // Map completion dates to task counts
    const completedMap = useMemo(() => {
        const map = {};
        completedTasks.forEach(task => {
            if (task.completionDate) {
                const dateKey = task.completionDate.split('T')[0];
                map[dateKey] = (map[dateKey] || 0) + 1;
            }
        });
        return map;
    }, [completedTasks]);

    // Build the full Jan - Dec calendar grid for selectedYear
    const { weeks, monthLabels, totalInYear } = useMemo(() => {
        // First day of selected year: Jan 1
        const jan1 = new Date(selectedYear, 0, 1);
        jan1.setHours(0, 0, 0, 0);

        // Start on Sunday of the week containing Jan 1
        const gridStart = new Date(jan1);
        gridStart.setDate(jan1.getDate() - jan1.getDay());

        // Last day of selected year: Dec 31
        const dec31 = new Date(selectedYear, 11, 31);
        dec31.setHours(0, 0, 0, 0);

        // End on Saturday of the week containing Dec 31
        const gridEnd = new Date(dec31);
        gridEnd.setDate(dec31.getDate() + (6 - dec31.getDay()));

        const weeksArr = [];
        const months = [];
        let lastMonth = -1;
        let total = 0;

        const cursor = new Date(gridStart);
        let weekIndex = 0;

        while (cursor <= gridEnd) {
            const daysInWeek = [];
            for (let d = 0; d < 7; d++) {
                const dateStr = formatLocalDate(cursor);
                const isCurrentYear = cursor.getFullYear() === selectedYear;
                const isFuture = dateStr > todayStr && selectedYear === currentYear;
                const isToday = dateStr === todayStr;
                const count = (isCurrentYear && !isFuture) ? (completedMap[dateStr] || 0) : 0;

                if (isCurrentYear && !isFuture) {
                    total += count;
                }

                // Month header label detection
                if (isCurrentYear) {
                    const currentMonth = cursor.getMonth();
                    if (currentMonth !== lastMonth) {
                        months.push({
                            weekIndex,
                            name: cursor.toLocaleDateString('en-US', { month: 'short' })
                        });
                        lastMonth = currentMonth;
                    }
                }

                let level = 0;
                if (count >= 4) level = 4;
                else if (count === 3) level = 3;
                else if (count === 2) level = 2;
                else if (count === 1) level = 1;

                daysInWeek.push({
                    date: dateStr,
                    count,
                    level,
                    isCurrentYear,
                    isFuture,
                    isToday,
                    dayOfWeek: d
                });

                cursor.setDate(cursor.getDate() + 1);
            }
            weeksArr.push(daysInWeek);
            weekIndex++;
        }

        return { weeks: weeksArr, monthLabels: months, totalInYear: total };
    }, [selectedYear, completedMap, currentYear, todayStr]);

    return (
        <div className="w-full p-5 sm:p-6 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl shadow-sm">
            {/* Header with Title, Year Tabs, and Streak KPI */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                <div>
                    <h3 className="text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-emerald-400" />
                        <span>Productivity Heatmap</span>
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                        {totalInYear} {totalInYear === 1 ? 'task' : 'tasks'} completed in {selectedYear}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Year Switcher Pills */}
                    <div className="flex items-center gap-1 bg-black/25 p-1 rounded-xl border border-white/5">
                        {availableYears.map(yr => (
                            <button
                                key={yr}
                                onClick={() => setSelectedYear(yr)}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                    selectedYear === yr
                                        ? 'bg-emerald-500 text-black font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                                        : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {yr}
                            </button>
                        ))}
                    </div>

                    {/* Streak badge (when viewing current year) */}
                    {selectedYear === currentYear && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-300 text-xs font-semibold">
                            <Flame className="w-3.5 h-3.5 fill-amber-400/40 text-amber-400 animate-pulse" />
                            <span>{streak} day streak</span>
                        </div>
                    )}

                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{completedTasks.length} total wins</span>
                    </div>
                </div>
            </div>

            {/* Mobile Scroll Hint */}
            <div className="flex sm:hidden justify-end mb-1">
                <span className="text-[10px] text-emerald-400/80 font-mono flex items-center gap-1">
                    <span>←</span> Swipe to view Jan–Dec <span>→</span>
                </span>
            </div>

            {/* GitHub Calendar Container (Jan to Dec) */}
            <div ref={scrollContainerRef} className="overflow-x-auto pb-2 scrollbar-thin">
                <div className="inline-block min-w-full">
                    {/* Month labels header (Jan to Dec) */}
                    <div className="relative h-4 mb-1.5 text-[10px] text-[var(--color-text-secondary)] font-medium select-none" style={{ marginLeft: '28px' }}>
                        {monthLabels.map((m, idx) => (
                            <span
                                key={idx}
                                className="absolute tracking-tight"
                                style={{ left: `${m.weekIndex * 14}px` }}
                            >
                                {m.name}
                            </span>
                        ))}
                    </div>

                    {/* Heatmap Grid with Weekday Labels on Left */}
                    <div className="flex gap-1 items-start">
                        {/* Day labels (Sun, Mon, Tue, Wed, Thu, Fri, Sat) */}
                        <div className="flex flex-col gap-[3px] text-[9px] text-[var(--color-text-secondary)]/70 pr-2 pt-0.5 select-none w-6 text-right leading-[11px]">
                            <span className="h-[11px]"></span>
                            <span className="h-[11px]">Mon</span>
                            <span className="h-[11px]"></span>
                            <span className="h-[11px]">Wed</span>
                            <span className="h-[11px]"></span>
                            <span className="h-[11px]">Fri</span>
                            <span className="h-[11px]"></span>
                        </div>

                        {/* Jan to Dec Week Columns */}
                        <div className="flex gap-[3px]">
                            {weeks.map((week, wIdx) => (
                                <div key={wIdx} className="flex flex-col gap-[3px]">
                                    {week.map((day) => {
                                        // Days not belonging to selectedYear are invisible placeholders
                                        if (!day.isCurrentYear) {
                                            return (
                                                <div
                                                    key={day.date}
                                                    className="w-[11px] h-[11px] rounded-[2px] opacity-0 pointer-events-none"
                                                />
                                            );
                                        }

                                        const levelClass = LEVEL_CLASSES[day.level];
                                        const todayHighlight = day.isToday
                                            ? 'ring-2 ring-emerald-400 ring-offset-1 ring-offset-[var(--color-bg-secondary)] z-20 scale-110'
                                            : '';

                                        return (
                                            <div
                                                key={day.date}
                                                onMouseEnter={() => setHoveredDay(day)}
                                                onMouseLeave={() => setHoveredDay(null)}
                                                className={`w-[11px] h-[11px] rounded-[2px] border transition-all cursor-pointer hover:ring-2 hover:ring-white/50 hover:scale-125 hover:z-30 relative ${levelClass} ${todayHighlight}`}
                                                title={`${day.count} ${day.count === 1 ? 'task' : 'tasks'} on ${formatDate(day.date)}${day.isToday ? ' (Today)' : ''}${day.isFuture ? ' (Future)' : ''}`}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Footer: Active tooltip preview & Legend */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4 pt-3 border-t border-white/5 text-xs">
                <div className="text-[11px] text-[var(--color-text-secondary)] min-h-[1.25rem]">
                    {hoveredDay ? (
                        <span>
                            <strong className="text-white font-medium">
                                {hoveredDay.count} {hoveredDay.count === 1 ? 'task' : 'tasks'} completed
                            </strong>{' '}
                            on {formatDate(hoveredDay.date)}
                            {hoveredDay.isToday && (
                                <span className="ml-2 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                                    Today
                                </span>
                            )}
                            {hoveredDay.isFuture && (
                                <span className="ml-2 px-1.5 py-0.5 rounded bg-white/10 text-white/50 text-[10px]">
                                    Future
                                </span>
                            )}
                        </span>
                    ) : (
                        <span>Hover over any day square to inspect contributions</span>
                    )}
                </div>

                {/* GitHub Legend */}
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)]">
                    <span>Less</span>
                    <div className="w-[11px] h-[11px] rounded-[2px] border bg-white/[0.05] border-white/[0.04]" />
                    <div className="w-[11px] h-[11px] rounded-[2px] border bg-emerald-950/90 border-emerald-800/60" />
                    <div className="w-[11px] h-[11px] rounded-[2px] border bg-emerald-700 border-emerald-600/80" />
                    <div className="w-[11px] h-[11px] rounded-[2px] border bg-emerald-500 border-emerald-400" />
                    <div className="w-[11px] h-[11px] rounded-[2px] border bg-emerald-400 border-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                    <span>More</span>
                </div>
            </div>
        </div>
    );
};
