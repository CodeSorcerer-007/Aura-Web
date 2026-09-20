import React from 'react';

export const TaskCardSkeleton = ({ count = 3 }) => {
    return (
        <div className="space-y-3 w-full" aria-busy="true" aria-label="Loading task cards">
            {[...Array(count)].map((_, idx) => (
                <div
                    key={idx}
                    className="p-4 rounded-2xl aura-glass border border-white/5 flex items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Checkbox placeholder */}
                        <div className="w-5 h-5 rounded-full aura-skeleton flex-shrink-0" />
                        {/* Text bar placeholder */}
                        <div className="space-y-1.5 flex-1">
                            <div
                                className="h-4 aura-skeleton rounded-md"
                                style={{ width: `${65 + ((idx * 17) % 25)}%` }}
                            />
                            {idx % 2 === 0 && (
                                <div className="h-2.5 w-1/3 aura-skeleton rounded-md opacity-60" />
                            )}
                        </div>
                    </div>

                    {/* Chips placeholder */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        <div className="w-14 h-5 aura-skeleton rounded-full" />
                        <div className="w-8 h-5 aura-skeleton rounded-full opacity-60" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TaskCardSkeleton;
