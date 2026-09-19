import React, { useMemo, useState } from 'react';
import { formatDate } from '../../utils/dateUtils';
import { Flame, CheckCircle2 } from 'lucide-react';

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
    const [hoveredDay, setHoveredDay] = useState(null);

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

    // Build the 53-week GitHub-identical calendar grid
    const { weeks, monthLabels, totalInYear } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = formatLocalDate(today);
        const todayDay = today.getDay(); // 0 = Sun, 6 = Sat

        // Sunday of the current week
        const currentSunday = new Date(today);
        currentSunday.setDate(today.getDate() - todayDay);

        // Sunday 52 weeks prior
        const gridStart = new Date(currentSunday);
        gridStart.setDate(currentSunday.getDate() - (52 * 7));

        const weeksArr = [];
        const months = [];
        let lastMonth = -1;
        let total = 0;

        const cursor = new Date(gridStart);
        for (let w = 0; w < 53; w++) {
            const daysInWeek = [];
            for (let d = 0; d < 7; d++) {
                const dateStr = formatLocalDate(cursor);
                const isFuture = dateStr > todayStr;
                const count = isFuture ? 0 : (completedMap[dateStr] || 0);
                if (!isFuture) total += count;

                // Month header label detection
                const currentMonth = cursor.getMonth();
                if (cursor.getDate() <= 7 && currentMonth !== lastMonth) {
                    months.push({
                        weekIndex: w,
                        name: cursor.toLocaleDateString('en-US', { month: 'short' })
                    });
                    lastMonth = currentMonth;
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
                    isFuture,
                    dayOfWeek: d
                });

                cursor.setDate(cursor.getDate() + 1);
            }
            weeksArr.push(daysInWeek);
        }

        return { weeks: weeksArr, monthLabels: months, totalInYear: total };
    }, [completedMap]);

    return (
        <div className="w-full p-5 sm:p-6 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl shadow-sm">
            {/* Header with Title and Streak KPI */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                    <h3 className="text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                        <span>Productivity Heatmap</span>
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                        {totalInYear} {totalInYear === 1 ? 'task' : 'tasks'} completed in the last year
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-300 text-xs font-semibold">
                        <Flame className="w-3.5 h-3.5 fill-amber-400/40 text-amber-400 animate-pulse" />
                        <span>{streak} day streak</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{completedTasks.length} total wins</span>
                    </div>
                </div>
            </div>

            {/* GitHub Calendar Container */}
            <div className="overflow-x-auto pb-2 scrollbar-thin">
                <div className="inline-block min-w-full">
                    {/* Month labels header */}
                    <div className="flex pl-8 text-[10px] text-[var(--color-text-secondary)] mb-1.5 font-medium relative h-4">
                        {monthLabels.map((m, idx) => (
                            <span
                                key={idx}
                                className="absolute"
                                style={{ left: `calc(2rem + ${m.weekIndex * 15}px)` }}
                            >
                                {m.name}
                            </span>
                        ))}
                    </div>

                    {/* Heatmap Grid with Weekday Labels on Left */}
                    <div className="flex gap-1 items-start">
                        {/* Day labels (Sun, Mon, Tue, Wed, Thu, Fri, Sat) */}
                        <div className="flex flex-col gap-1 text-[9px] text-[var(--color-text-secondary)]/70 pr-2 pt-0.5 select-none w-6 text-right leading-[11px]">
                            <span className="h-[11px]"></span>
                            <span className="h-[11px]">Mon</span>
                            <span className="h-[11px]"></span>
                            <span className="h-[11px]">Wed</span>
                            <span className="h-[11px]"></span>
                            <span className="h-[11px]">Fri</span>
                            <span className="h-[11px]"></span>
                        </div>

                        {/* 53 Week Columns */}
                        <div className="flex gap-[3px]">
                            {weeks.map((week, wIdx) => (
                                <div key={wIdx} className="flex flex-col gap-[3px]">
                                    {week.map((day) => {
                                        if (day.isFuture) {
                                            return (
                                                <div
                                                    key={day.date}
                                                    className="w-[11px] h-[11px] rounded-[2px] opacity-0 pointer-events-none"
                                                />
                                            );
                                        }

                                        const levelClass = LEVEL_CLASSES[day.level];
                                        return (
                                            <div
                                                key={day.date}
                                                onMouseEnter={() => setHoveredDay(day)}
                                                onMouseLeave={() => setHoveredDay(null)}
                                                className={`w-[11px] h-[11px] rounded-[2px] border transition-all cursor-pointer hover:ring-2 hover:ring-white/40 hover:scale-125 hover:z-10 relative ${levelClass}`}
                                                title={`${day.count} ${day.count === 1 ? 'task' : 'tasks'} completed on ${formatDate(day.date)}`}
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
                        </span>
                    ) : (
                        <span>Hover over any day square to inspect tasks</span>
                    )}
                </div>

                {/* GitHub Legend */}
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)]">
                    <span>Less</span>
                    <div className="w-[11px] h-[11px] rounded-[2px] border bg-white/[0.05] border-white/[0.04]" />
                    <div className="w-[11px] h-[11px] rounded-[2px] border bg-emerald-950/90 border-emerald-800/60" />
                    <div className="w-[11px] h-[11px] rounded-[2px] border bg-emerald-700 border-emerald-600/80" />
                    <div className="w-[11px] h-[11px] rounded-[2px] border bg-emerald-500 border-emerald-400" />
                    <div className="w-[11px] h-[11px] rounded-[2px] border bg-emerald-400 border-emerald-300" />
                    <span>More</span>
                </div>
            </div>
        </div>
    );
};
