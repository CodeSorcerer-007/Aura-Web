export const formatLocalDate = (d) => {
    if (!d || !(d instanceof Date) || isNaN(d.getTime())) return null;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const getTodayDateString = () => formatLocalDate(new Date());

export const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const isOverdue = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(dateString + 'T00:00:00');
    return deadline < today;
};

export const parseIntelligentDeadline = (text) => {
    let cleanedText = text;
    let deadline = null;
    let recurring = null;
    const now = new Date();

    const recurringPatterns = [
        { regex: /every day/i, type: 'daily' },
        { regex: /every week/i, type: 'weekly' },
        { regex: /every month/i, type: 'monthly' }
    ];

    for (const pattern of recurringPatterns) {
        if (pattern.regex.test(cleanedText)) {
            recurring = { type: pattern.type };
            cleanedText = cleanedText.replace(pattern.regex, '').trim();
            break;
        }
    }

    const patterns = [
        {
            regex: /in (\d+) (day|week|month)s?/i,
            handler: (matches) => {
                const num = parseInt(matches[1], 10);
                const unit = matches[2].toLowerCase();
                const d = new Date(now);
                if (unit === 'day') d.setDate(now.getDate() + num);
                if (unit === 'week') d.setDate(now.getDate() + num * 7);
                if (unit === 'month') d.setMonth(now.getMonth() + num);
                return d;
            }
        },
        {
            regex: /today|tomorrow/i,
            handler: (matches) => {
                const d = new Date(now);
                if (matches[0].toLowerCase() === 'tomorrow') d.setDate(now.getDate() + 1);
                return d;
            }
        },
        {
            regex: /next (monday|tuesday|wednesday|thursday|friday|saturday|sunday|week)/i,
            handler: (matches) => {
                const d = new Date(now);
                if (matches[1].toLowerCase() === 'week') {
                    d.setDate(now.getDate() + 7);
                    return d;
                }
                const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                const targetDay = weekdays.indexOf(matches[1].toLowerCase());
                const currentDay = now.getDay();
                let dayDiff = targetDay - currentDay;
                if (dayDiff <= 0) dayDiff += 7;
                d.setDate(now.getDate() + dayDiff);
                return d;
            }
        },
        {
            regex: /(?:by|on) (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
            handler: (matches) => {
                const d = new Date(now);
                const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                const targetDay = weekdays.indexOf(matches[1].toLowerCase());
                let dayDiff = targetDay - now.getDay();
                if (dayDiff < 0) dayDiff += 7;
                d.setDate(now.getDate() + dayDiff);
                return d;
            }
        },
        {
            regex: /(?:on)?\s?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s(\d{1,2})(?:st|nd|rd|th)?/i,
            handler: (matches) => {
                const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
                const month = months.indexOf(matches[1].toLowerCase().substring(0, 3));
                const day = parseInt(matches[2], 10);
                if (month === -1 || isNaN(day)) return null;
                const year = now.getFullYear();
                const d = new Date(year, month, day);
                const todayStart = new Date(year, now.getMonth(), now.getDate());
                if (d < todayStart) d.setFullYear(year + 1);
                return d;
            }
        }
    ];

    for (const pattern of patterns) {
        const match = cleanedText.match(pattern.regex);
        if (match) {
            const dateResult = pattern.handler(match);
            if (dateResult) {
                deadline = formatLocalDate(dateResult);
                cleanedText = cleanedText.replace(match[0], '').replace(/  +/g, ' ').trim();
                break;
            }
        }
    }

    if (recurring && !deadline) {
        deadline = getTodayDateString();
    }

    return { deadline, cleanedText, recurring };
};

