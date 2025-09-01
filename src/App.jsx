import React, { useState, useMemo, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { Users, Clock, Filter, RefreshCw, Download, Settings, Sun, Moon, Target, TrendingUp, PhoneCall, Eye, Grid, DollarSign, Mail, AlertCircle, ChevronRight, Calendar, X, Linkedin, Building, Mail as MailIcon, Phone as PhoneIcon, BarChart2, CheckCircle, Zap, ChevronDown } from 'lucide-react';

// --- Helper Functions ---
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

// --- Mock Data Generation (utils/dataGenerator.js) ---
const generateProspects = () => {
    const companyNamePrefixes = ['Quantum', 'Stellar', 'Apex', 'Zenith', 'Momentum', 'Synergy', 'Pinnacle', 'Fusion', 'Evolve', 'Innovate', 'NextGen', 'BlueWave', 'Core', 'Vertex', 'Summit'];
    const companyNameSuffixes = ['Solutions', 'Dynamics', 'Corp', 'Labs', 'Co', 'Systems', 'Tech', 'Works', 'AI', 'Inc.', 'Enterprises', 'Group', 'Global', 'Logic'];
    
    const roles = ['CEO', 'CTO', 'COO', 'VP Sales', 'Director Marketing', 'CFO', 'VP Engineering', 'CMO'];
    const industries = ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Energy', 'Telecom'];
    const names = ['Alex Johnson', 'Maria Garcia', 'Chen Wei', 'Fatima Al-Fassi', 'David Smith', 'Yuki Tanaka', 'Amara Okoro', 'Liam O\'Connell', 'Sofia Rossi', 'Noah Williams', 'Isabella Chen', 'James O\'Malley', 'Olivia Kim', 'Ben Carter', 'Sophia Rodriguez'];
    const reps = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];
    const signalTypes = [
        { type: 'Page View', description: 'Viewed Pricing Page', icon: Eye },
        { type: 'Form Fill', description: 'Downloaded "Future of AI" Whitepaper', icon: Download },
        { type: 'Email', description: 'Opened "Introductory Offer" Email', icon: MailIcon },
        { type: 'Call', description: 'Logged a 15-minute discovery call', icon: PhoneCall },
        { type: 'Meeting', description: 'Booked a demo for next week', icon: Calendar }
    ];

    const getStage = () => {
        const rand = Math.random();
        if (rand < 0.40) return 'Lead';
        if (rand < 0.65) return 'MQL';
        if (rand < 0.80) return 'SAL';
        if (rand < 0.90) return 'SQL';
        if (rand < 0.97) return 'Opportunity';
        return 'Negotiation';
    };

    const generateNormalRandom = () => (Math.random() + Math.random() + Math.random() + Math.random()) / 4;

    let allProspects = [];
    let prospectId = 1;
    let companyCount = 400; // Generate around 400 companies

    for (let i = 0; i < companyCount; i++) {
        const company = {
            name: `${companyNamePrefixes[i % companyNamePrefixes.length]} ${companyNameSuffixes[i % companyNameSuffixes.length]}`,
            size: '50-200 Employees' // Simplified for generation
        };

        const numContacts = Math.floor(Math.random() * 4) + 1; // 1 to 4 contacts
        for (let j = 0; j < numContacts; j++) {
            if (prospectId > 1000) break; // Cap at 1000 prospects

            const lastActivity = new Date();
            const daysSince = Math.floor(Math.random() * 30);
            lastActivity.setDate(lastActivity.getDate() - daysSince);
            
            const sourcedDate = new Date();
            sourcedDate.setDate(sourcedDate.getDate() - Math.floor(Math.random() * 365));

            const name = names[(prospectId -1 + j) % names.length];
            const fitScore = Math.floor(generateNormalRandom() * 101);
            const engagementScore = Math.floor(generateNormalRandom() * 101);
            let intentScore;
            const baseIntent = (fitScore + engagementScore) / 2;
            const intentNoise = (Math.random() * 70) - 35;
            intentScore = clamp(baseIntent + intentNoise, 0, 100);
            if (Math.random() < 0.08) {
                intentScore = Math.floor(Math.random() * 101);
            }

            allProspects.push({
                id: prospectId,
                name: name,
                company: company.name,
                companySize: company.size,
                role: roles[(prospectId -1 + j) % roles.length],
                industry: industries[(prospectId -1) % industries.length],
                email: `${name.toLowerCase().replace(' ', '.')}@${company.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
                phone: `+1-555-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
                linkedinUrl: `https://linkedin.com/in/${name.toLowerCase().replace(' ', '')}`,
                fitScore: fitScore,
                engagementScore: Math.round(engagementScore),
                intentScore: Math.round(intentScore),
                dealSize: Math.floor(Math.random() * 450000) + 50000,
                daysInPipeline: Math.floor(Math.random() * 90),
                lastActivity: lastActivity,
                daysSinceLastActivity: daysSince,
                sourcedDate: sourcedDate,
                stage: getStage(),
                callsMade: Math.floor(Math.random() * 20),
                lastCallDuration: Math.floor(Math.random() * 45) + 5,
                callQualityScore: Math.floor(Math.random() * 50) + 50,
                salesRep: reps[(prospectId -1) % reps.length],
                signals: Array.from({ length: Math.floor(Math.random() * 5) + 3 }, (_, k) => {
                    const signalDate = new Date();
                    signalDate.setDate(signalDate.getDate() - Math.floor(Math.random() * 30));
                    return { ...signalTypes[k % signalTypes.length], date: signalDate };
                }).sort((a,b) => b.date - a.date),
            });
            prospectId++;
        }
        if (prospectId > 1000) break;
    }

    return allProspects;
};

const prospectsData = generateProspects();

// --- Calculation Utilities (utils/calculations.js) ---
const calculateHotnessScore = (prospect) => Math.round((prospect.fitScore * 0.3) + (prospect.engagementScore * 0.3) + (prospect.intentScore * 0.4));
const getIntentLevel = (score) => {
    if (score >= 70) return 'High';
    if (score >= 30) return 'Medium';
    return 'Low';
};
const getIntentColor = (score) => {
    if (score >= 70) return '#10b981';
    if (score >= 30) return '#f59e0b';
    return '#ef4444';
};
const getQuadrant = (prospect) => {
    if (prospect.fitScore >= 75 && prospect.engagementScore >= 50) return 'Hot Leads';
    if (prospect.fitScore >= 75 && prospect.engagementScore < 50) return 'Nurture';
    if (prospect.fitScore < 75 && prospect.engagementScore >= 50) return 'Educate';
    return 'Qualify';
};
const calculateSummaryMetrics = (prospects) => {
    if (!prospects || prospects.length === 0) return { totalProspects: 0, avgLastActivity: 0, intentBreakdown: { high: 0, medium: 0, low: 0 }, stageBreakdown: { lead: 0, mql: 0, sal: 0, sql: 0, opp: 0 } };
    const stageBreakdown = {
            lead: prospects.filter(p => p.stage === 'Lead').length,
            mql: prospects.filter(p => p.stage === 'MQL').length,
            sal: prospects.filter(p => p.stage === 'SAL').length,
            sql: prospects.filter(p => p.stage === 'SQL').length,
            opp: prospects.filter(p => p.stage === 'Opportunity' || p.stage === 'Negotiation').length
    };
    const stages = ['lead', 'mql', 'sal', 'sql', 'opp'];
    stages.forEach(stage => { if(!stageBreakdown[stage]) { stageBreakdown[stage] = 0; } });
    return {
        totalProspects: prospects.length,
        avgLastActivity: Math.round(prospects.reduce((sum, p) => sum + p.daysSinceLastActivity, 0) / prospects.length),
        intentBreakdown: {
            high: prospects.filter(p => p.intentScore >= 70).length,
            medium: prospects.filter(p => p.intentScore >= 30 && p.intentScore < 70).length,
            low: prospects.filter(p => p.intentScore < 30).length
        },
        stageBreakdown: stageBreakdown
    };
};
const generateFeatureImportance = (metric, prospect) => {
    const isPositive = (value, threshold) => value >= threshold;
    const features = {
        Potential: [
            { name: 'Role Seniority', value: prospect.role.includes('VP') || prospect.role.includes('CEO') ? 25 : 5, impact: isPositive(prospect.role.includes('VP') || prospect.role.includes('CEO'), 1) ? 'positive' : 'negative' },
            { name: 'Industry Match (Tech)', value: prospect.industry === 'Technology' ? 20 : 2, impact: isPositive(prospect.industry === 'Technology', 1) ? 'positive' : 'negative' },
            { name: 'Deal Size', value: (prospect.dealSize / 500000) * 15, impact: isPositive(prospect.dealSize, 250000) ? 'positive' : 'negative' },
            { name: 'Company Size', value: 10, impact: 'positive' },
        ],
        'Sales Effectiveness': [
            { name: 'Call Quality Score', value: (prospect.callQualityScore / 100) * 30, impact: isPositive(prospect.callQualityScore, 60) ? 'positive' : 'negative' },
            { name: 'Engagement Score', value: (prospect.engagementScore / 100) * 25, impact: isPositive(prospect.engagementScore, 50) ? 'positive' : 'negative' },
            { name: 'Recent Activity', value: (30 - prospect.daysSinceLastActivity) / 30 * 15, impact: isPositive(prospect.daysSinceLastActivity, 15) ? 'negative' : 'positive' },
            { name: 'Calls Made', value: (prospect.callsMade / 20) * 10, impact: 'positive' },
        ],
        'Close Probability': [
            { name: 'Hotness Score', value: (calculateHotnessScore(prospect) / 100) * 35, impact: isPositive(calculateHotnessScore(prospect), 65) ? 'positive' : 'negative' },
            { name: 'Fit Score', value: (prospect.fitScore / 100) * 20, impact: isPositive(prospect.fitScore, 50) ? 'positive' : 'negative' },
            { name: 'In Opportunity Stage', value: prospect.stage === 'Opportunity' || prospect.stage === 'Negotiation' ? 15 : 0, impact: 'positive' },
            { name: 'Days in Pipeline', value: (90 - prospect.daysInPipeline) / 90 * 10, impact: isPositive(prospect.daysInPipeline, 60) ? 'negative' : 'positive' },
        ]
    };
    return features[metric].sort((a, b) => b.value - a.value);
};

// --- Theme Definition (utils/theme.js) ---
const getTheme = (isDarkMode) => ({
    isDarkMode,
    bg: { primary: isDarkMode ? 'bg-gray-900' : 'bg-gray-100', secondary: isDarkMode ? 'bg-gray-800' : 'bg-white', tertiary: isDarkMode ? 'bg-gray-700' : 'bg-gray-200', hover: isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200', accent: isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50' },
    text: { primary: isDarkMode ? 'text-gray-100' : 'text-gray-900', secondary: isDarkMode ? 'text-gray-300' : 'text-gray-700', tertiary: isDarkMode ? 'text-gray-400' : 'text-gray-500', accent: isDarkMode ? 'text-blue-400' : 'text-blue-600' },
    border: { primary: isDarkMode ? 'border-gray-700' : 'border-gray-200', secondary: isDarkMode ? 'border-gray-600' : 'border-gray-300' },
    chart: { grid: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', text: isDarkMode ? '#9ca3af' : '#6b7280', tooltip: isDarkMode ? '#1f2937' : '#ffffff' }
});


// --- Shared Components ---
const SummaryCard = ({ icon, title, value, children, theme }) => (
    <div className={`${theme.bg.secondary} p-4 rounded-lg shadow-sm border ${theme.border.primary} flex flex-col justify-between`}>
        <div><div className="flex items-center justify-between"><p className={`text-sm font-medium ${theme.text.secondary}`}>{title}</p>{icon}</div>{value && <p className={`text-3xl font-bold mt-2 ${theme.text.primary}`}>{value}</p>}</div>
        {children}
    </div>
);
const SummaryCards = ({ data, theme }) => {
    const summary = calculateSummaryMetrics(data);
    const intentColors = { high: 'text-green-500', medium: 'text-yellow-500', low: 'text-red-500' };
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SummaryCard icon={<Users className="w-6 h-6 text-blue-500" />} title="Total Prospects" value={summary.totalProspects} theme={theme} />
            <SummaryCard icon={<Clock className="w-6 h-6 text-orange-500" />} title="Avg Last Activity" value={`${summary.avgLastActivity}d`} theme={theme} />
            
            <SummaryCard icon={<Zap className="w-5 h-5 text-purple-500" />} title="Intent" theme={theme}>
                <div className="flex justify-around items-baseline pt-3">
                    {Object.entries(summary.intentBreakdown).map(([level, count]) => (
                        <div key={level} className="text-center px-1">
                            <p className={`text-2xl font-bold ${intentColors[level]}`}>{count}</p>
                            <p className={`text-xs capitalize ${theme.text.tertiary}`}>{level}</p>
                        </div>
                    ))}
                </div>
            </SummaryCard>

            <SummaryCard icon={<TrendingUp className="w-5 h-5 text-pink-500" />} title="Stage" theme={theme}>
                 <div className="flex justify-around items-baseline pt-3">
                    {Object.entries(summary.stageBreakdown).map(([stage, count]) => (
                        <div key={stage} className="text-center px-1">
                            <p className={`text-2xl font-bold ${theme.text.primary}`}>{count}</p>
                            <p className={`text-xs uppercase ${theme.text.tertiary}`}>{stage}</p>
                        </div>
                    ))}
                 </div>
            </SummaryCard>
        </div>
    );
};
const CustomTooltip = ({ active, payload, theme }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className={`${theme.bg.secondary} p-3 rounded-lg shadow-lg border ${theme.border.primary} text-sm ${theme.text.primary}`}>
                <p className="font-bold">{data.name}</p><p className="text-xs text-gray-400">{data.company}</p><hr className={`${theme.border.primary} my-2`} />
                <p>Fit: <span className="font-semibold">{data.fitScore}%</span></p><p>Engagement: <span className="font-semibold">{data.engagementScore}%</span></p>
                <p>Intent: <span className="font-semibold" style={{ color: getIntentColor(data.intentScore) }}>{data.intentScore}% ({getIntentLevel(data.intentScore)})</span></p>
            </div>
        );
    } return null;
};
const ViewContainer = ({ title, subtitle, children, theme }) => (
    <div className={`${theme.bg.secondary} p-6 rounded-xl shadow-sm border ${theme.border.primary} mt-6`}>
        <h2 className={`text-xl font-bold ${theme.text.primary}`}>{title}</h2>
        {subtitle && <p className={`${theme.text.tertiary} text-sm mb-4`}>{subtitle}</p>}
        {children}
    </div>
);
const IntentLegend = ({ selectedIntent, setSelectedIntent, theme }) => {
    const intentLevels = ['All', 'High', 'Medium', 'Low'];
    const colors = { High: '#10b981', Medium: '#f59e0b', Low: '#ef4444' };
    return (
        <div className="flex justify-center items-center space-x-4 mt-4">
            {intentLevels.map(level => (
                <button key={level} onClick={() => setSelectedIntent(level)} className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm transition-opacity ${selectedIntent !== level && selectedIntent !== 'All' ? 'opacity-50' : 'opacity-100'}`}>
                    {level !== 'All' && <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[level] }}></div>}
                    <span className={`${theme.text.secondary} ${selectedIntent === level ? 'font-bold' : ''}`}>{level}</span>
                </button>
            ))}
        </div>
    );
};

// --- View Components ---
const ScatterView = ({ data, theme, onProspectSelect, selectedIntent, setSelectedIntent }) => {
    const scatterData = useMemo(() => data.map(p => ({ x: p.fitScore, y: p.engagementScore, ...p })), [data]);
    return (
        <ViewContainer title="Fit vs Engagement Analysis" subtitle={`Showing ${data.length} of ${prospectsData.length} prospects`} theme={theme}>
            <div style={{ width: '100%', height: 500 }}>
                <ResponsiveContainer>
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 40 }} onClick={(e) => e && e.activePayload && e.activePayload.length > 0 && onProspectSelect(e.activePayload[0].payload)}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.chart.grid} />
                        <XAxis type="number" dataKey="x" name="Fit Score" unit="%" domain={[0, 100]} tick={{ fill: theme.chart.text }} label={{ value: 'Fit Score (%)', position: 'insideBottom', offset: -5, fill: theme.chart.text }} />
                        <YAxis type="number" dataKey="y" name="Engagement Score" unit="%" domain={[0, 100]} tick={{ fill: theme.chart.text }} label={{ value: 'Engagement Score (%)', angle: -90, position: 'insideLeft', offset: -20, fill: theme.chart.text }} />
                        <Tooltip content={<CustomTooltip theme={theme}/>} cursor={{ strokeDasharray: '3 3' }} />
                        <Scatter name="Prospects" data={scatterData} >{scatterData.map((entry, index) => <Cell key={`cell-${index}`} fill={getIntentColor(entry.intentScore)} className="cursor-pointer" />)}</Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
            <IntentLegend selectedIntent={selectedIntent} setSelectedIntent={setSelectedIntent} theme={theme} />
        </ViewContainer>
    );
};

const PipelineView = ({ data, theme, selectedIntent, setSelectedIntent }) => {
    const stages = ['Lead', 'MQL', 'SAL', 'SQL', 'Opportunity', 'Negotiation'];
    const pipelineData = useMemo(() => {
        return stages.map(stage => {
            const prospectsInStage = data.filter(p => p.stage === stage);
            return {
                name: stage,
                High: prospectsInStage.filter(p => getIntentLevel(p.intentScore) === 'High').length,
                Medium: prospectsInStage.filter(p => getIntentLevel(p.intentScore) === 'Medium').length,
                Low: prospectsInStage.filter(p => getIntentLevel(p.intentScore) === 'Low').length,
            };
        });
    }, [data]);

    return (
        <ViewContainer title="Pipeline by Intent" theme={theme}>
            <div style={{ width: '100%', height: 500 }}>
                <ResponsiveContainer>
                    <BarChart data={pipelineData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.chart.grid} />
                        <XAxis dataKey="name" type="category" tick={{ fill: theme.chart.text }} />
                        <YAxis type="number" tick={{ fill: theme.chart.text }} />
                        <Tooltip contentStyle={{ backgroundColor: theme.chart.tooltip, border: 'none', borderRadius: '0.5rem' }} />
                        <Bar dataKey="Low" stackId="a" fill={getIntentColor(10)} name="Low Intent" />
                        <Bar dataKey="Medium" stackId="a" fill={getIntentColor(40)} name="Medium Intent" />
                        <Bar dataKey="High" stackId="a" fill={getIntentColor(80)} name="High Intent" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <IntentLegend selectedIntent={selectedIntent} setSelectedIntent={setSelectedIntent} theme={theme} />
        </ViewContainer>
    );
};

const TopProspectsView = ({ data, theme, onProspectSelect }) => {
    const topProspects = useMemo(() => [...data].map(p => ({ ...p, hotnessScore: calculateHotnessScore(p) })).sort((a, b) => b.hotnessScore - a.hotnessScore).slice(0, 20), [data]);
    const getHotnessColor = (score) => {
        if (score >= 80) return 'bg-green-500/20 text-green-400';
        if (score >= 60) return 'bg-yellow-500/20 text-yellow-400';
        return 'bg-red-500/20 text-red-400';
    };
    return (
        <ViewContainer title="Top 20 Prospects" subtitle="Ranked by Hotness Score" theme={theme}>
            <div className="overflow-x-auto"><table className={`w-full text-sm text-left ${theme.text.secondary}`}>
                <thead className={`text-xs ${theme.text.tertiary} uppercase ${theme.bg.tertiary}`}><tr>
                    <th scope="col" className="px-6 py-3 w-[25%]">Prospect</th><th scope="col" className="px-6 py-3 text-center w-[10%]">Hotness</th><th scope="col" className="px-6 py-3 text-center w-[8%]">Fit</th>
                    <th scope="col" className="px-6 py-3 text-center w-[10%]">Engagement</th><th scope="col" className="px-6 py-3 text-center w-[10%]">Intent</th><th scope="col" className="px-6 py-3 text-right w-[12%]">Deal Size</th>
                    <th scope="col" className="px-6 py-3 text-center w-[10%]">Last Activity</th><th scope="col" className="px-6 py-3 w-[15%]">Next Action</th></tr></thead>
                <tbody>{topProspects.map(p => (<tr key={p.id} className={`${theme.bg.secondary} border-b ${theme.border.primary} hover:${theme.bg.hover} cursor-pointer`} onClick={() => onProspectSelect(p)}>
                    <td className="px-6 py-4"><div className={`font-medium ${theme.text.primary}`}>{p.name}</div><div className="text-xs">{p.company} &bull; {p.role}</div></td>
                    <td className="px-6 py-4 text-center"><span className={`px-2 py-1 rounded-full font-bold text-xs ${getHotnessColor(p.hotnessScore)}`}>{p.hotnessScore}</span></td>
                    <td className="px-6 py-4 text-center">{p.fitScore}%</td><td className="px-6 py-4 text-center">{p.engagementScore}%</td>
                    <td className="px-6 py-4 text-center flex items-center justify-center"><div className="w-2 h-2 rounded-full mr-2" style={{backgroundColor: getIntentColor(p.intentScore)}}></div>{p.intentScore}%</td>
                    <td className="px-6 py-4 text-right font-mono">${p.dealSize.toLocaleString()}</td><td className="px-6 py-4 text-center">{p.daysSinceLastActivity}d ago</td>
                    <td className="px-6 py-4"><a href="#" onClick={(e) => e.stopPropagation()} className={`font-medium text-blue-500 hover:underline`}>Schedule Call</a></td></tr>))}</tbody>
            </table></div>
        </ViewContainer>
    );
};
const SalesEffectivenessView = ({ data, theme }) => {
    const reps = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];
    const repData = useMemo(() => {
        return reps.map(rep => {
            const prospects = data.filter(p => p.salesRep === rep);
            const totalCalls = prospects.reduce((sum, p) => sum + p.callsMade, 0);
            const avgDuration = prospects.length > 0 ? prospects.reduce((sum, p) => sum + p.lastCallDuration, 0) / prospects.length : 0;
            const avgQuality = prospects.length > 0 ? prospects.reduce((sum, p) => sum + p.callQualityScore, 0) / prospects.length : 0;
            const avgLastActivity = prospects.length > 0 ? prospects.reduce((sum, p) => sum + p.daysSinceLastActivity, 0) / prospects.length : 0;
            return { name: rep, totalCalls, avgDuration: avgDuration.toFixed(0), avgQuality: avgQuality.toFixed(0), avgLastActivity: avgLastActivity.toFixed(0), activeProspects: prospects.length };
        });
    }, [data]);
    const getColorClass = (type, value) => {
        if (type === 'quality') { if (value >= 80) return 'text-green-500'; if (value >= 60) return 'text-yellow-500'; return 'text-red-500'; }
        if (type === 'activity') { if (value <= 3) return 'text-green-500'; if (value <= 7) return 'text-yellow-500'; return 'text-red-500'; }
        return '';
    };
    const getFillColor = (type, value) => {
        if (type === 'activity') { if (value <= 3) return '#10b981'; if (value <= 7) return '#f59e0b'; return '#ef4444'; }
        return '#8884d8';
    };
    return (
        <ViewContainer title="Sales Effectiveness" theme={theme}>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {repData.map(rep => (
                    <div key={rep.name} className={`${theme.bg.primary} p-4 rounded-lg border ${theme.border.secondary}`}>
                        <h3 className={`font-bold text-lg ${theme.text.primary}`}>{rep.name}</h3>
                        <div className="mt-4 space-y-3 text-sm">
                            <div className="flex justify-between items-center"><span className={theme.text.secondary}><PhoneCall className="inline w-4 h-4 mr-2"/>Total Calls</span><span className={`font-bold ${theme.text.primary}`}>{rep.totalCalls}</span></div>
                            <div className="flex justify-between items-center"><span className={theme.text.secondary}><Clock className="inline w-4 h-4 mr-2"/>Avg Duration</span><span className={`font-bold ${theme.text.primary}`}>{rep.avgDuration}m</span></div>
                            <div className="flex justify-between items-center"><span className={theme.text.secondary}><Target className="inline w-4 h-4 mr-2"/>Call Quality</span><span className={`font-bold ${getColorClass('quality', rep.avgQuality)}`}>{rep.avgQuality}%</span></div>
                            <div className="flex justify-between items-center"><span className={theme.text.secondary}><Calendar className="inline w-4 h-4 mr-2"/>Last Activity</span><span className={`font-bold ${getColorClass('activity', rep.avgLastActivity)}`}>{rep.avgLastActivity}d</span></div>
                            <div className="flex justify-between items-center"><span className={theme.text.secondary}><Users className="inline w-4 h-4 mr-2"/>Active Prospects</span><span className="font-bold text-blue-500">{rep.activeProspects}</span></div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className={`${theme.bg.primary} p-4 rounded-lg border ${theme.border.secondary}`}>
                    <h4 className={`font-semibold mb-4 ${theme.text.primary}`}>Calls vs. Quality</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={repData}><CartesianGrid stroke={theme.chart.grid} /><XAxis dataKey="name" tick={{ fill: theme.chart.text }} /><YAxis yAxisId="left" orientation="left" stroke="#8884d8" tick={{ fill: theme.chart.text }} /><YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tick={{ fill: theme.chart.text }} /><Tooltip contentStyle={{ backgroundColor: theme.chart.tooltip, border: 'none', borderRadius: '0.5rem' }} /><Legend /><Bar dataKey="totalCalls" yAxisId="left" fill="#8884d8" name="Total Calls" /><Line type="monotone" dataKey="avgQuality" yAxisId="right" stroke="#82ca9d" name="Avg Quality (%)" /></ComposedChart>
                    </ResponsiveContainer>
                </div>
                 <div className={`${theme.bg.primary} p-4 rounded-lg border ${theme.border.secondary}`}>
                    <h4 className={`font-semibold mb-4 ${theme.text.primary}`}>Avg. Last Activity (Days)</h4>
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={repData}><CartesianGrid stroke={theme.chart.grid} /><XAxis dataKey="name" tick={{ fill: theme.chart.text }} /><YAxis tick={{ fill: theme.chart.text }}/><Tooltip contentStyle={{ backgroundColor: theme.chart.tooltip, border: 'none', borderRadius: '0.5rem' }}/><Bar dataKey="avgLastActivity" name="Avg Last Activity (Days)">{repData.map((entry, index) => (<Cell key={`cell-${index}`} fill={getFillColor('activity', entry.avgLastActivity)} />))}</Bar></BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </ViewContainer>
    );
};
const IntentTimelineView = ({ data, theme }) => {
    const timelineData = useMemo(() => {
        const dateMap = {};
        for (let i = 30; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            dateMap[dateStr] = { date: dateStr, high: 0, medium: 0, low: 0 };
        }
        data.forEach(p => {
            const dateStr = p.lastActivity.toISOString().split('T')[0];
            if (dateMap[dateStr]) {
                const intent = getIntentLevel(p.intentScore).toLowerCase();
                dateMap[dateStr][intent]++;
            }
        });
        return Object.values(dateMap);
    }, [data]);
    const summary = data.reduce((acc, p) => { const intent = getIntentLevel(p.intentScore).toLowerCase(); acc[intent]++; return acc; }, { high: 0, medium: 0, low: 0 });
    const summaryCards = [{ title: 'High Intent', count: summary.high, color: 'green' }, { title: 'Medium Intent', count: summary.medium, color: 'yellow' }, { title: 'Low Intent', count: summary.low, color: 'red' }];
    return (
        <ViewContainer title="Intent Timeline" subtitle="Prospect intent signals over the last 30 days" theme={theme}>
            <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                    <AreaChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke={theme.chart.grid} /><XAxis dataKey="date" tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} tick={{ fill: theme.chart.text }} /><YAxis tick={{ fill: theme.chart.text }} /><Tooltip contentStyle={{ backgroundColor: theme.chart.tooltip, border: 'none', borderRadius: '0.5rem' }} /><Legend /><Area type="monotone" dataKey="high" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="High Intent" /><Area type="monotone" dataKey="medium" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Medium Intent" /><Area type="monotone" dataKey="low" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Low Intent" /></AreaChart>
                </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">{summaryCards.map(card => (<div key={card.title} className={`p-4 rounded-lg bg-${card.color}-500/10`}><p className={`text-sm text-${card.color}-400`}>{card.title}</p><p className={`text-3xl font-bold text-${card.color}-400`}>{card.count}</p></div>))}</div>
        </ViewContainer>
    );
};
const IntentHeatmapView = ({ data, theme }) => {
    const intentBins = [{label: 'High (70-100)', min: 70, max: 101}, {label: 'Medium (30-69)', min: 30, max: 70}, {label: 'Low (0-29)', min: 0, max: 30}];
    const fitBins = [{label: '0-25%', min: 0, max: 25}, {label: '25-50%', min: 25, max: 50}, {label: '50-75%', min: 50, max: 75}, {label: '75-100%', min: 75, max: 101}];
    const heatmapData = useMemo(() => {
        const grid = intentBins.map(() => fitBins.map(() => ({ count: 0, dealSize: 0 })));
        data.forEach(p => {
            const intentIndex = intentBins.findIndex(bin => p.intentScore >= bin.min && p.intentScore < bin.max);
            const fitIndex = fitBins.findIndex(bin => p.fitScore >= bin.min && p.fitScore < bin.max);
            if(intentIndex !== -1 && fitIndex !== -1) { grid[intentIndex][fitIndex].count++; grid[intentIndex][fitIndex].dealSize += p.dealSize; }
        });
        return grid;
    }, [data]);
    const maxCount = Math.max(...heatmapData.flat().map(cell => cell.count), 1);
    const intentColors = ['green', 'yellow', 'red'];
    return (
        <ViewContainer title="Intent Heatmap" subtitle="Prospect distribution by Fit and Intent" theme={theme}>
            <div className="flex">
                <div className="flex flex-col justify-around text-sm font-bold pr-4">{intentBins.map(bin => <div key={bin.label} className={`h-24 flex items-center ${theme.text.secondary}`}>{bin.label}</div>)}</div>
                <div className="flex-1 grid grid-cols-4 gap-2">
                    {heatmapData.map((row, i) => ( row.map((cell, j) => (
                        <div key={`${i}-${j}`} className={`relative group aspect-square rounded-lg border border-${intentColors[i]}-500/30 transition-all duration-150 hover:scale-105 hover:ring-2 hover:ring-blue-500`} style={{ backgroundColor: `rgba(${getIntentColor(intentBins[i].min).match(/\d+/g).join(',')}, ${0.1 + (cell.count / maxCount) * 0.85})` }}>
                            <div className="flex flex-col items-center justify-center h-full"><p className={`text-2xl font-bold text-${intentColors[i]}-300`}>{cell.count}</p><p className={`text-xs ${theme.text.tertiary}`}>prospects</p></div>
                            <div className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 rounded-md shadow-lg text-xs transition-opacity opacity-0 group-hover:opacity-100 pointer-events-none z-10 ${theme.bg.tertiary} ${theme.text.primary}`}><p><b>Intent:</b> {intentBins[i].label}</p><p><b>Fit:</b> {fitBins[j].label}</p><p><b>Count:</b> {cell.count}</p><p><b>Avg Deal Size:</b> ${cell.count > 0 ? (cell.dealSize / cell.count).toLocaleString(undefined, {maximumFractionDigits:0}) : 0}</p></div>
                        </div>
                    ))))}
                    <div className="col-span-4 grid grid-cols-4 text-center text-sm font-bold mt-2">{fitBins.map(bin => <div key={bin.label} className={theme.text.secondary}>{bin.label}</div>)}</div>
                </div>
            </div>
        </ViewContainer>
    );
};
const StrategicQuadrantsView = ({ data, theme }) => {
    const quadrantData = useMemo(() => {
        const quadrants = {
            'Hot Leads': { prospects: [], icon: Target, color: 'green', recs: ['Prioritize immediate outreach', 'Personalize with high-intent signals', 'Engage via multiple channels'] },
            'Nurture': { prospects: [], icon: Mail, color: 'yellow', recs: ['Enroll in targeted email campaigns', 'Provide valuable content', 'Monitor engagement spikes'] },
            'Educate': { prospects: [], icon: Users, color: 'blue', recs: ['Share case studies & whitepapers', 'Invite to webinars', 'Build brand awareness'] },
            'Qualify': { prospects: [], icon: AlertCircle, color: 'gray', recs: ['Use automated sequences', 'Gather more firmographic data', 'Disqualify if no response'] },
        };
        data.forEach(p => { const quadrantName = getQuadrant(p); quadrants[quadrantName].prospects.push(p); });
        return quadrants;
    }, [data]);
    const quadrantColors = { green: 'from-green-500/20 to-green-500/5', yellow: 'from-yellow-500/20 to-yellow-500/5', blue: 'from-blue-500/20 to-blue-500/5', gray: 'from-gray-500/20 to-gray-500/5' };
    return (
        <ViewContainer title="Strategic Quadrants" theme={theme}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(quadrantData).map(([name, { prospects, icon: Icon, color, recs }]) => (
                    <div key={name} className={`p-6 rounded-xl bg-gradient-to-br ${quadrantColors[color]} border ${theme.border.primary}`}>
                        <div className="flex items-center space-x-3"><Icon className={`w-8 h-8 text-${color}-400`} /><h3 className={`text-2xl font-bold ${theme.text.primary}`}>{name}</h3></div>
                        <p className={`text-4xl font-bold my-4 ${theme.text.primary}`}>{prospects.length}</p>
                        <p className={`text-sm mb-4 ${theme.text.secondary}`}>
                            { name === 'Hot Leads' && 'High Fit, High Engagement. Ready to engage.' }
                            { name === 'Nurture' && 'High Fit, Low Engagement. Potential but needs warming up.' }
                            { name === 'Educate' && 'Low Fit, High Engagement. Interested but may not be ideal customer.' }
                            { name === 'Qualify' && 'Low Fit, Low Engagement. Needs further qualification.' }
                        </p>
                        <div className={`${theme.bg.secondary}/50 p-4 rounded-lg`}>
                            <h4 className={`text-sm font-semibold mb-2 ${theme.text.primary}`}>Recommendations</h4>
                            <ul className="space-y-1 list-disc list-inside text-xs">{recs.map(rec => <li key={rec} className={theme.text.secondary}>{rec}</li>)}</ul>
                        </div>
                    </div>
                ))}
            </div>
        </ViewContainer>
    );
};
const ProspectDetailView = ({ prospectInfo, onClose, theme }) => {
    const { selected, contacts } = prospectInfo || {};
    const [activeContact, setActiveContact] = useState(selected);
    const [selectedMetric, setSelectedMetric] = useState(null);

    useEffect(() => {
        setActiveContact(selected);
        setSelectedMetric(null); // Reset metric view when prospect changes
    }, [selected]);

    if (!activeContact) return null;

    const potential = Math.round((activeContact.fitScore * 0.7) + (activeContact.dealSize / 500000 * 100 * 0.3));
    const salesEffectiveness = Math.round((activeContact.callQualityScore * 0.6) + (activeContact.engagementScore * 0.4));
    const hotness = calculateHotnessScore(activeContact);
    const closeProbability = Math.round((potential * 0.4) + (salesEffectiveness * 0.3) + (hotness * 0.3));
    
    const getMetricColor = (value) => {
        if (value >= 70) return '#10b981'; // green
        if (value >= 40) return '#f59e0b'; // yellow/orange
        return '#ef4444'; // red
    };
    
    const handleContactChange = (e) => {
        const selectedId = parseInt(e.target.value);
        const newActiveContact = contacts.find(c => c.id === selectedId);
        setActiveContact(newActiveContact);
    };

    const FeatureImportancePanel = ({ metric, prospect, onClosePanel }) => {
        const features = generateFeatureImportance(metric, prospect);
        return (
            <div className={`absolute bottom-0 left-0 right-0 h-1/2 ${theme.bg.primary} border-t-2 ${theme.border.secondary} p-4 rounded-t-lg shadow-2xl flex flex-col`}>
                <div className="flex justify-between items-center mb-2 flex-shrink-0">
                    <h4 className={`text-lg font-semibold ${theme.text.primary}`}>Key Drivers for {metric}</h4>
                    <button onClick={onClosePanel} className={`p-1 rounded-full hover:${theme.bg.hover}`}><X size={20} /></button>
                </div>
                <div className="flex-grow overflow-y-auto pr-2">
                    <ul className="space-y-2">
                        {features.map(feature => (
                            <li key={feature.name} className="text-sm">
                                <div className="flex justify-between items-center mb-1">
                                    <span className={theme.text.secondary}>{feature.name}</span>
                                    <span className={`font-bold ${feature.impact === 'positive' ? 'text-green-400' : 'text-red-400'}`}>{feature.value.toFixed(1)}%</span>
                                </div>
                                <div className={`w-full ${theme.bg.tertiary} rounded-full h-2`}>
                                    <div className={`${feature.impact === 'positive' ? 'bg-green-500' : 'bg-red-500'} h-2 rounded-full`} style={{ width: `${clamp(feature.value, 0, 100)}%` }}></div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    };

    const MetricGauge = ({ value, label, color, onMetricClick }) => (
        <button onClick={() => onMetricClick(label)} className="flex flex-col items-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-2">
            <div style={{ width: 100, height: 100 }}>
                <ResponsiveContainer>
                    <RadialBarChart innerRadius="70%" outerRadius="90%" data={[{ value }]} startAngle={90} endAngle={-270}>
                        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                        <RadialBar background dataKey="value" cornerRadius={10} fill={color} />
                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className={`fill-current ${theme.text.primary} text-2xl font-bold`}>{value}</text>
                    </RadialBarChart>
                </ResponsiveContainer>
            </div>
            <p className={`text-sm font-semibold mt-1 ${theme.text.secondary}`}>{label}</p>
        </button>
    );
    const InfoItem = ({ icon: Icon, label, value, href }) => (
        <div className="flex items-start space-x-3">
            <Icon className={`w-5 h-5 mt-1 ${theme.text.tertiary}`} />
            <div>
                <p className={`text-xs ${theme.text.tertiary}`}>{label}</p>
                {href ? <a href={href} target="_blank" rel="noopener noreferrer" className={`font-medium text-blue-400 hover:underline`}>{value}</a> : <p className={`font-medium ${theme.text.primary}`}>{value}</p>}
            </div>
        </div>
    );
    return (
        <><div className="fixed inset-0 bg-black/60 z-40 transition-opacity" onClick={onClose}></div>
        <div className={`fixed top-0 right-0 h-full w-full max-w-2xl ${theme.bg.secondary} shadow-2xl z-50 transform transition-transform translate-x-0`}>
            <div className="flex flex-col h-full">
                <div className={`flex items-center justify-between p-4 border-b ${theme.border.primary} flex-shrink-0`}>
                    <div><h2 className={`text-xl font-bold ${theme.text.primary}`}>{activeContact.name}</h2><p className={`${theme.text.tertiary}`}>{activeContact.role} at {activeContact.company}</p></div>
                    <button onClick={onClose} className={`p-2 rounded-full hover:${theme.bg.hover}`}><X size={24} /></button>
                </div>
                <div className="flex-grow overflow-y-auto p-6 relative">
                    <div className={`p-4 rounded-lg ${theme.bg.primary} border ${theme.border.secondary}`}>
                        <h3 className={`text-lg font-semibold mb-4 ${theme.text.primary}`}>Overall Metrics</h3>
                        <div className="flex justify-around">
                            <MetricGauge value={potential} label="Potential" color={getMetricColor(potential)} onMetricClick={setSelectedMetric} />
                            <MetricGauge value={salesEffectiveness} label="Sales Effectiveness" color={getMetricColor(salesEffectiveness)} onMetricClick={setSelectedMetric} />
                            <MetricGauge value={closeProbability} label="Close Probability" color={getMetricColor(closeProbability)} onMetricClick={setSelectedMetric} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className={`p-4 rounded-lg ${theme.bg.primary} border ${theme.border.secondary}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className={`text-lg font-semibold ${theme.text.primary}`}>Contact Details</h3>
                                {contacts.length > 1 && (
                                    <div className="relative">
                                        <select value={activeContact.id} onChange={handleContactChange} className={`pl-3 pr-8 py-1 text-sm rounded-md appearance-none cursor-pointer ${theme.bg.tertiary} ${theme.text.secondary} border ${theme.border.secondary} focus:outline-none focus:ring-2 focus:ring-blue-500`}>
                                            {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                        <ChevronDown className={`w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${theme.text.tertiary}`} />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-4"><InfoItem icon={MailIcon} label="Email" value={activeContact.email} href={`mailto:${activeContact.email}`} /><InfoItem icon={PhoneIcon} label="Phone" value={activeContact.phone} href={`tel:${activeContact.phone}`} /><InfoItem icon={Linkedin} label="LinkedIn" value="View Profile" href={activeContact.linkedinUrl} /><InfoItem icon={Calendar} label="Last Interaction" value={activeContact.lastActivity.toLocaleDateString()} /></div>
                        </div>
                        <div className={`p-4 rounded-lg ${theme.bg.primary} border ${theme.border.secondary}`}>
                            <h3 className={`text-lg font-semibold mb-4 ${theme.text.primary}`}>Account Details</h3>
                            <div className="space-y-4"><InfoItem icon={Building} label="Company" value={activeContact.company} /><InfoItem icon={Users} label="Company Size" value={activeContact.companySize} /><InfoItem icon={BarChart2} label="Industry" value={activeContact.industry} /><InfoItem icon={TrendingUp} label="Pipeline Stage" value={activeContact.stage} /></div>
                        </div>
                    </div>
                    <div className={`p-4 mt-6 rounded-lg ${theme.bg.primary} border ${theme.border.secondary}`}>
                        <h3 className={`text-lg font-semibold mb-4 ${theme.text.primary}`}>Recent Signals</h3>
                        <ul className="space-y-4">{activeContact.signals.map((signal, index) => (<li key={index} className="flex items-start space-x-4"><div className={`p-2 rounded-full ${theme.bg.secondary} mt-1`}><signal.icon className={`w-5 h-5 ${theme.text.tertiary}`} /></div><div><p className={`${theme.text.primary}`}>{signal.description}</p><p className={`text-xs ${theme.text.tertiary}`}>{signal.date.toLocaleDateString()} &bull; {signal.type}</p></div></li>))}</ul>
                    </div>
                    {selectedMetric && <FeatureImportancePanel metric={selectedMetric} prospect={activeContact} onClosePanel={() => setSelectedMetric(null)} />}
                </div>
            </div>
        </div></>
    );
};


// --- Core Components ---
const Header = ({ isDarkMode, setIsDarkMode, theme, timePeriod, setTimePeriod }) => {
    const IconBtn = ({ icon: Icon }) => (<button className={`${theme.bg.tertiary} p-2 rounded-full ${theme.text.tertiary} hover:${theme.bg.hover}`}><Icon size={20} /></button>);
    const timePeriods = { '30': 'Last 30 Days', '60': 'Last 60 Days', '90': 'Last 90 Days', '180': 'Last 6 Months', '365': 'Last 12 Months', 'all': 'All Time' };
    return (
        <header className={`${theme.bg.secondary} h-16 border-b ${theme.border.primary} flex items-center justify-between px-4 sm:px-8`}>
            <div className="flex items-center"><Target className="text-blue-500" size={28} /><h1 className={`text-xl font-bold ml-3 ${theme.text.primary}`}>Rev Radar</h1><p className={`text-sm ml-4 hidden md:block ${theme.text.tertiary}`}>Intelligent Sales Dashboard</p></div>
            <div className="flex items-center space-x-2">
                <div className="relative">
                    <select value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)} className={`pl-3 pr-8 py-2 text-sm rounded-md appearance-none cursor-pointer ${theme.bg.primary} ${theme.text.secondary} border ${theme.border.secondary} focus:outline-none focus:ring-2 focus:ring-blue-500`}>
                        {Object.entries(timePeriods).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                    <ChevronDown className={`w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${theme.text.tertiary}`} />
                </div>
                <IconBtn icon={Filter} /><IconBtn icon={RefreshCw} /><IconBtn icon={Download} /><IconBtn icon={Settings} />
                <button onClick={() => setIsDarkMode(!isDarkMode)} className={`${theme.bg.primary} p-2 rounded-full ${theme.text.tertiary} hover:${theme.bg.hover}`}>{isDarkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
            </div>
        </header>
    );
};
const Sidebar = ({ selectedView, setSelectedView, theme }) => {
    const navigationItems = [{ id: 'scatter', label: 'Fit vs Engagement', icon: Target }, { id: 'pipeline', label: 'Pipeline View', icon: TrendingUp }, { id: 'salesEffectiveness', label: 'Sales Effectiveness', icon: PhoneCall }, { id: 'topProspects', label: 'Top Prospects', icon: Users }, { id: 'timeline', label: 'Intent Timeline', icon: Eye }, { id: 'intentHeatmap', label: 'Intent Heatmap', icon: Grid }, { id: 'quadrant', label: 'Strategic Quadrants', icon: DollarSign }];
    return (
        <aside className={`w-64 h-[calc(100vh-64px)] ${theme.bg.secondary} border-r ${theme.border.primary} p-4 fixed flex-shrink-0`}>
            <nav className="space-y-2">{navigationItems.map(item => (<button key={item.id} onClick={() => setSelectedView(item.id)} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedView === item.id ? `${theme.bg.accent} ${theme.text.accent}` : `${theme.text.secondary} hover:${theme.bg.hover}`}`}><item.icon size={20} /><span>{item.label}</span></button>))}</nav>
        </aside>
    );
};
const Dashboard = ({ selectedView, filteredProspects, theme, onProspectSelect, selectedIntent, setSelectedIntent }) => {
    const renderView = () => {
        switch (selectedView) {
            case 'scatter': return <ScatterView data={filteredProspects} theme={theme} onProspectSelect={onProspectSelect} selectedIntent={selectedIntent} setSelectedIntent={setSelectedIntent} />;
            case 'pipeline': return <PipelineView data={filteredProspects} theme={theme} selectedIntent={selectedIntent} setSelectedIntent={setSelectedIntent} />;
            case 'salesEffectiveness': return <SalesEffectivenessView data={filteredProspects} theme={theme} />;
            case 'topProspects': return <TopProspectsView data={filteredProspects} theme={theme} onProspectSelect={onProspectSelect} />;
            case 'timeline': return <IntentTimelineView data={filteredProspects} theme={theme} />;
            case 'intentHeatmap': return <IntentHeatmapView data={filteredProspects} theme={theme} />;
            case 'quadrant': return <StrategicQuadrantsView data={filteredProspects} theme={theme} />;
            default: return <div className={`${theme.bg.secondary} p-6 rounded-xl mt-6 ${theme.text.primary}`}>Select a view</div>;
        }
    };
    return (
        <main className="ml-64 p-6 w-full">
            <SummaryCards data={filteredProspects} theme={theme} />
            {renderView()}
        </main>
    );
};


// --- Main App Component ---
export default function App() {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [selectedView, setSelectedView] = useState('scatter');
    const [selectedProspectInfo, setSelectedProspectInfo] = useState(null);
    const [timePeriod, setTimePeriod] = useState('all'); // 30, 60, 90, 180, 365, 'all'
    const [selectedIntent, setSelectedIntent] = useState('All'); // All, High, Medium, Low

    const theme = getTheme(isDarkMode);
    const [prospects, setProspects] = useState(prospectsData);

    const handleProspectSelect = (prospect) => {
        const companyContacts = prospects.filter(p => p.company === prospect.company);
        setSelectedProspectInfo({ selected: prospect, contacts: companyContacts });
    };

    const filteredProspects = useMemo(() => {
        const now = new Date();
        const timeFiltered = prospects.filter(p => {
            if (timePeriod === 'all') return true;
            const diffDays = (now - p.sourcedDate) / (1000 * 60 * 60 * 24);
            return diffDays <= parseInt(timePeriod);
        });
        
        return timeFiltered.filter(p => {
            if (selectedIntent === 'All') return true;
            return getIntentLevel(p.intentScore) === selectedIntent;
        });

    }, [prospects, timePeriod, selectedIntent]);

    useEffect(() => {
        const handleEsc = (event) => { if (event.keyCode === 27) { setSelectedProspectInfo(null); } };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    return (
        <div className={`${isDarkMode ? 'dark' : ''} ${theme.bg.primary} ${theme.text.primary} min-h-screen`}>
            <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} theme={theme} timePeriod={timePeriod} setTimePeriod={setTimePeriod} />
            <div className="flex">
                <Sidebar selectedView={selectedView} setSelectedView={setSelectedView} theme={theme} />
                <Dashboard selectedView={selectedView} filteredProspects={filteredProspects} theme={theme} onProspectSelect={handleProspectSelect} selectedIntent={selectedIntent} setSelectedIntent={setSelectedIntent} />
            </div>
            <ProspectDetailView prospectInfo={selectedProspectInfo} onClose={() => setSelectedProspectInfo(null)} theme={theme} />
        </div>
    );
}
