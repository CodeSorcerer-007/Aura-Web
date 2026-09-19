export const defaultCategories = {
    'Work': { bg: 'bg-sky-500/30', border: 'border-sky-400/50', text: 'text-sky-200', solid: 'bg-sky-500', glowColor: '#38bdf8' },
    'Personal': { bg: 'bg-lime-500/30', border: 'border-lime-400/50', text: 'text-lime-200', solid: 'bg-lime-500', glowColor: '#a3e635' },
    'Design': { bg: 'bg-fuchsia-500/30', border: 'border-fuchsia-400/50', text: 'text-fuchsia-200', solid: 'bg-fuchsia-500', glowColor: '#d946ef' },
    'Development': { bg: 'bg-indigo-500/30', border: 'border-indigo-400/50', text: 'text-indigo-200', solid: 'bg-indigo-500', glowColor: '#818cf8' },
    'Study': { bg: 'bg-amber-500/30', border: 'border-amber-400/50', text: 'text-amber-200', solid: 'bg-amber-500', glowColor: '#fbbd23' },
    'Urgent': { bg: 'bg-rose-500/30', border: 'border-rose-400/50', text: 'text-rose-200', solid: 'bg-rose-500', glowColor: '#fb7185' },
    'Health': { bg: 'bg-green-500/30', border: 'border-green-400/50', text: 'text-green-200', solid: 'bg-green-500', glowColor: '#4ade80' },
    'Finance': { bg: 'bg-teal-500/30', border: 'border-teal-400/50', text: 'text-teal-200', solid: 'bg-teal-500', glowColor: '#2dd4bf' },
    'Ideas': { bg: 'bg-orange-500/30', border: 'border-orange-400/50', text: 'text-orange-200', solid: 'bg-orange-500', glowColor: '#fb923c' },
    'Chores': { bg: 'bg-stone-500/30', border: 'border-stone-400/50', text: 'text-stone-200', solid: 'bg-stone-500', glowColor: '#a8a29e' },
    'General': { bg: 'bg-slate-500/30', border: 'border-slate-400/50', text: 'text-slate-200', solid: 'bg-slate-500', glowColor: '#94a3b8' },
};

export const motivationalQuotes = [
    { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { quote: "It’s not the load that breaks you down, it’s the way you carry it.", author: "Lou Holtz" },
    { quote: "The best way to predict the future is to create it.", author: "Peter Drucker" },
    { quote: "Believe you can and you’re halfway there.", author: "Theodore Roosevelt" },
    { quote: "Well done is better than well said.", author: "Benjamin Franklin" },
    { quote: "A year from now you may wish you had started today.", author: "Karen Lamb" }
];

export const achievementsList = [
    { id: 'first_task', title: 'First Step', description: 'Complete your first task.', check: (tasks) => tasks.some(t => t.completed) },
    { id: 'high_priority', title: 'Task Master', description: 'Complete a high-priority task.', check: (tasks) => tasks.some(t => t.completed && t.priority === 3) },
    { id: 'first_win', title: 'Big Win!', description: 'Record your first win in the Grove.', check: (tasks) => tasks.some(t => t.win) },
    { id: 'golden_seed', title: 'Golden Touch', description: 'Earn your first Golden Seed.', check: (tasks, stats) => stats.goldenSeeds > 0 },
    { id: 'streak_3', title: 'On a Roll', description: 'Complete a task 3 days in a row.', check: (tasks, stats) => stats.streak >= 3 },
    { id: 'focused_finish', title: 'Deep Focus', description: 'Complete a task using the Focus Timer.', check: (tasks, stats) => stats.focusedTasksCompleted > 0 },
    { id: 'tree_grower', title: 'Tree Grower', description: 'Fully grow your first tree.', check: (tasks, stats, grove) => grove.some(t => t.growthPoints >= t.maxGrowth) },
];

export const baseThemes = [
    { id: 'circadian', name: 'Circadian Sky (Auto)', bg: 'bg-[#0a0e17]', text: 'text-amber-100' },
    { id: 'dark', name: 'OLED Dark', bg: 'bg-black', text: 'text-white' },
    { id: 'light', name: 'Clean Light', bg: 'bg-gray-100', text: 'text-black' },
    { id: 'cyberpunk', name: 'Cyberpunk', bg: 'bg-black', text: 'text-cyan-400' },
    { id: 'crimson', name: 'Crimson', bg: 'bg-black', text: 'text-red-400' },
    { id: 'forest', name: 'Forest', bg: 'bg-[#0b2e13]', text: 'text-[#a3b899]' },
    { id: 'ocean', name: 'Ocean', bg: 'bg-[#001f3f]', text: 'text-[#81d4fa]' },
    { id: 'dune', name: 'Dune', bg: 'bg-[#2a1d0c]', text: 'text-[#e3d5b8]' },
    { id: 'sakura', name: 'Sakura', bg: 'bg-[#fef6f6]', text: 'text-[#5e2d2d]' },
    { id: 'solarized', name: 'Solarized', bg: 'bg-[#002b36]', text: 'text-[#93a1a1]' },
    { id: 'dracula', name: 'Dracula', bg: 'bg-[#282a36]', text: 'text-[#f8f8f2]' },
    { id: 'nord', name: 'Nord', bg: 'bg-[#2E3440]', text: 'text-[#E5E9F0]' },
    { id: 'gruvbox', name: 'Gruvbox', bg: 'bg-[#282828]', text: 'text-[#ebdbb2]' },
    { id: 'monokai', name: 'Monokai', bg: 'bg-[#272822]', text: 'text-[#F8F8F2]' },
    { id: 'rose_pine', name: 'Rosé Pine', bg: 'bg-[#191724]', text: 'text-[#e0def4]' },
    { id: 'matcha', name: 'Matcha', bg: 'bg-[#243029]', text: 'text-[#adadad]' },
    { id: 'latte', name: 'Latte', bg: 'bg-[#eff1f5]', text: 'text-[#4c4f69]' },
];

export const getShutdownRitualMessages = (tasksCompletedToday = 0) => [
    `Let's wind down for the day. You completed ${tasksCompletedToday} tasks today. How do you feel?`,
    "What is the single seed you want to nurture tomorrow morning?",
    "Your mind is clear and tomorrow's seed is safely planted. It's time to disconnect. Good night!"
];

export const demoTasks = [
    { id: 'demo-task-1', text: "🌱 Savor your morning tea & write down 3 intentions @mindful", completed: false, priority: 3, category: 'Personal', timeOfDay: 'morning', deadline: new Date().toISOString().split('T')[0], subtasks: [{ text: "Brew ceremonial green tea", completed: true }, { text: "Reflect on today's highest priority", completed: false }], win: null, completionDate: null, recurring: null, dependsOn: null, notes: 'Anchor the day in stillness and clarity before checking notifications.', attachments: [], tags: ['mindful', 'ritual'], isPinned: true, focusSessions: 0, isArchived: false },
    { id: 'demo-task-2', text: "💎 Design zen sanctuary layout in Cosmic Constellations #Design", completed: false, priority: 2, category: 'Design', timeOfDay: 'morning', deadline: null, subtasks: [], win: null, completionDate: null, recurring: null, dependsOn: null, notes: 'Cosmic Constellations visualizes tasks as luminous orbiting stars around category hubs.', attachments: [], tags: ['creative'], isPinned: false, focusSessions: 0, isArchived: false },
    { id: 'demo-task-3', text: "⚡ Deep focus sprint: craft high-leverage architectural thoughts #Work", completed: false, priority: 3, category: 'Work', timeOfDay: 'afternoon', deadline: new Date().toISOString().split('T')[0], subtasks: [{ text: "Open Focus Pomodoro timer", completed: true }, { text: "Layer ambient rainfall & 432 Hz Solfeggio soundscape", completed: true }], win: null, completionDate: null, recurring: null, dependsOn: null, notes: 'Focus sessions nurture your Grove trees into full blossom.', attachments: [], tags: ['deepwork'], isPinned: false, focusSessions: 1, isArchived: false },
    { id: 'demo-task-4', text: "⠿ Drag task cards by the handle to orchestrate daily flow", completed: true, priority: 2, category: 'General', timeOfDay: 'morning', deadline: null, subtasks: [], win: 'Smooth tactile flow reordering mastered', completionDate: new Date().toISOString().split('T')[0], recurring: null, dependsOn: null, notes: 'Tactile reordering keeps your morning in harmonious rhythm.', attachments: [], tags: [], isPinned: false, focusSessions: 0, isArchived: false },
    { id: 'demo-task-5', text: "🌊 Evening wind-down ritual: reflect on today's wins in the Grove #Personal", completed: false, priority: 2, category: 'Personal', timeOfDay: 'evening', deadline: new Date().toISOString().split('T')[0], subtasks: [], win: null, completionDate: null, recurring: { type: 'daily' }, dependsOn: null, notes: 'Shutdown ritual clears your mind and plants tomorrow\'s seed.', attachments: [], tags: ['routine'], isPinned: false, focusSessions: 0, isArchived: false },
    { id: 'demo-task-6', text: "📖 Mindful reading: 20 pages of Meditations @study #Study", completed: false, priority: 1, category: 'Study', timeOfDay: 'evening', deadline: null, subtasks: [], win: null, completionDate: null, recurring: null, dependsOn: null, notes: 'Wisdom from Marcus Aurelius on tranquil equanimity.', attachments: [], tags: ['study', 'reading'], isPinned: false, focusSessions: 0, isArchived: false }
];
