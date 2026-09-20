import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { XIcon } from '../common/Icons';

/**
 * ProductivityReportModal
 * Generates an elegant Markdown productivity report that users can copy or download.
 */
export const ProductivityReportModal = ({ isOpen, onClose, stats, energyData, focusStats, completedTasks }) => {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const reportMarkdown = `# 🌸 Aura Mindful Productivity Report
Generated on: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

## 📊 Summary Metrics
- **Completed Tasks**: ${energyData?.totalCompleted || 0}
- **Completion Velocity**: ${energyData?.completionRate || 0}%
- **Daily Momentum Streak**: ${stats?.streak || 0} Days 🔥
- **Deep Work Flow**: ${focusStats?.deepWorkFormatted || '0m'} across ${focusStats?.totalSessions || 0} sessions
- **Golden Seeds Planted**: ${stats?.goldenSeeds || 0} ✨

## ⚡ Bio-Energy Rhythm
- Spark (High Focus): ${energyData?.sparkPct || 0}%
- Flow (Steady Rhythm): ${energyData?.flowPct || 0}%
- Rest (Gentle Wind-down): ${energyData?.restPct || 0}%

## 🏆 Recent Accomplishments
${completedTasks.slice(-10).reverse().map(t => `- [x] ${t.text} ${t.win ? `*(Win: ${t.win})*` : ''}`).join('\n') || '- *No completed tasks recorded yet.*'}

---
*Created with Aura — Mindful Productivity & Ambient Flow*
`;

    const handleCopy = () => {
        navigator.clipboard.writeText(reportMarkdown);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const handleDownload = () => {
        const blob = new Blob([reportMarkdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Aura-Productivity-Report-${new Date().toISOString().split('T')[0]}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                className="w-full max-w-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6 shadow-2xl flex flex-col max-h-[85vh]"
            >
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">📄</span>
                        <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Productivity Report</h3>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-lg text-[var(--color-text-secondary)] hover:text-white">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto my-4 p-3.5 bg-[var(--color-bg)] rounded-xl border border-white/5 font-mono text-xs text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">
                    {reportMarkdown}
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-primary)] hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        {copied ? '✓ Copied to Clipboard' : '📋 Copy Markdown'}
                    </button>
                    <button
                        type="button"
                        onClick={handleDownload}
                        className="px-4 py-2 rounded-xl bg-[var(--color-accent)] text-black text-xs font-bold hover:brightness-110 transition-all cursor-pointer shadow-md"
                    >
                        💾 Download .md
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
