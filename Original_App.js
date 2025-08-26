import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Plus, Minus, Save, Play, FileText, Settings, Database, Link2,
  ChevronRight, Copy, Download, Eye, EyeOff, Trash2,
  GitBranch, TestTube, Globe, Key, Shield, Clock,
  ArrowRight, Square, Circle, Diamond, Zap, Filter,
  Move, Maximize2, Minimize2, Code, Layers, Package,
  MoreVertical, Search, X, Check, AlertCircle, Loader2,
  ChevronDown, Activity, TrendingUp, Users, Lock,

  Sparkles, Command, Workflow, RefreshCw, BarChart3,
  Rocket, UserCheck, Send, ArrowUp, ExternalLink,
  BookOpen, Terminal, CheckCircle, XCircle, Info, MousePointer2,
  UploadCloud, ChevronsUpDown, ArrowLeft, Pause, CheckSquare,
  AlertTriangle, GitMerge, History, Shuffle, List, Cpu,
  FlaskConical, Wand2, ArrowDown, FileJson, Braces,
  Network, ArrowRightLeft, SplitSquareVertical, Bot,
  PlayCircle, PauseCircle, StopCircle, SkipForward,
  Layers3, Boxes, FileCode, FolderOpen, GitCommit,
  Repeat, RotateCw, Server, Cloud, CloudOff, Webhook,
  MessageSquare, Bell, HelpCircle, LogOut, User,
  CreditCard, DollarSign, TrendingDown, BarChart,
  PieChart, LineChart, Calendar, Timer, Gauge,
  Beaker, Target, Award, Sun, Moon, GitPullRequest,
  Share2, ArrowRightCircle, CheckCircle2, CloudUpload,
  Hash, Type, BoxSelect, Grid3x3, Columns,
  FileInput, FileOutput, ZoomIn, ZoomOut, Building, UserCheck2,
  ClipboardCheck, GripVertical
} from 'lucide-react';

// --- NEW: Schema Mapper Component ---
const SchemaMapper = ({ sourceSchema, targetSchema, mappings, onUpdateMappings, theme }) => {
    const [draggedField, setDraggedField] = useState(null);

    const renderSchemaFields = (schema, type) => {
        return Object.entries(schema).map(([key, value]) => (
            <div
                key={`${type}-${key}`}
                draggable
                onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', key);
                    setDraggedField(key);
                }}
                onDragEnd={() => setDraggedField(null)}
                className={`flex items-center justify-between p-2 my-1 rounded-lg cursor-grab transition-colors ${
                    theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}
            >
                <div className="flex items-center gap-2">
                    <GripVertical className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span className={`font-mono text-sm ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{key}</span>
                </div>
                <span className={`text-xs font-mono ${theme === 'dark' ? 'text-purple-400' : 'text-purple-500'}`}>{value.type}</span>
            </div>
        ));
    };

    const handleDrop = (targetField) => {
        if (draggedField) {
            const newMappings = { ...mappings, [draggedField]: targetField };
            onUpdateMappings(newMappings);
        }
    };

    return (
        <div className="grid grid-cols-3 gap-4 items-start">
            {/* Source Schema */}
            <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Source Fields</h4>
                {renderSchemaFields(sourceSchema, 'source')}
            </div>

            {/* Mappings */}
            <div className="col-span-1 flex flex-col items-center pt-8">
                {Object.entries(mappings).map(([source, target]) => (
                    <div key={`${source}-${target}`} className="flex items-center w-full my-2">
                        <div className="flex-1 h-px bg-gray-500"></div>
                        <ArrowRight className="w-5 h-5 text-blue-500 mx-2" />
                        <div className="flex-1 h-px bg-gray-500"></div>
                    </div>
                ))}
            </div>

            {/* Target Schema */}
            <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Target Fields</h4>
                {Object.entries(targetSchema).map(([key, value]) => (
                    <div
                        key={`target-${key}`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop(key)}
                        className={`flex items-center justify-between p-2 my-1 rounded-lg transition-all ${
                            draggedField ? 'bg-blue-500/20' : ''
                        } ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} border`}
                    >
                        <span className={`font-mono text-sm ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>{key}</span>
                        <span className={`text-xs font-mono ${theme === 'dark' ? 'text-purple-400' : 'text-purple-500'}`}>{value.type}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- UTILITY & SHARED COMPONENTS ---

// Enhanced NAQ Logo with Animation
const NAQLogo = ({ className = "w-6 h-6", animate = false }) => (
  <div className={`flex flex-col items-center justify-center gap-1 ${className}`}>
    <div className={`w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full ${animate ? 'animate-pulse' : ''}`}></div>
    <div className={`w-1.5 h-1.5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full ${animate ? 'animate-pulse delay-75' : ''}`}></div>
    <div className={`w-1.5 h-1.5 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full ${animate ? 'animate-pulse delay-150' : ''}`}></div>
  </div>
);

// Toast Notification Component
const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info
  };

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };

  const Icon = icons[type];

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className={`${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]`}>
        <Icon className="w-5 h-5" />
        <span className="flex-1">{message}</span>
        <button onClick={onClose} className="hover:opacity-80">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Loading Skeleton Component
const Skeleton = ({ className = '', variant = 'text' }) => {
  const baseClass = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded';

  if (variant === 'circle') {
    return <div className={`${baseClass} rounded-full ${className}`}></div>;
  }

  return <div className={`${baseClass} ${className}`}></div>;
};

// --- MODAL & PANEL COMPONENTS ---

// Execution Results Panel
const ExecutionResultsPanel = ({ results, onClose, theme }) => {
  return (
    <div className={`w-96 border-l ${
      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } overflow-y-auto`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Execution Results
          </h3>
          <button
            onClick={onClose}
            className={`p-1 rounded transition-colors ${
              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
        </div>
        
        <div className="space-y-4">
          {Object.entries(results).map(([nodeId, result]) => (
            <div
              key={nodeId}
              className={`p-4 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {nodeId}
                </span>
                <span className={`text-sm ${
                  result.status === 'success' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {result.status}
                </span>
              </div>
              
              {result.responseTime && (
                <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Response time: {result.responseTime}ms
                </p>
              )}
              
              {result.data && (
                <pre className={`text-xs overflow-x-auto p-2 rounded ${
                  theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'
                }`}>
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper function to transform internal config to user-specified JSON format
const transformConfigToUserFormat = (config) => {
    const { id, inputSchema, outputSchema, workflow, mockEnabled, mockResponse } = config;

    const transformations = [];
    const chainedAPIs = [];

    // A real implementation would traverse the graph using edges.
    // For this demo, we iterate through nodes.
    if (workflow && workflow.nodes) {
        workflow.nodes.forEach(node => {
            switch (node.type) {
                case 'api':
                case 'graphql':
                    chainedAPIs.push({
                        categoryId: node.data.label || node.id,
                        method: node.data.method || (node.type === 'graphql' ? 'POST' : 'GET'),
                        endpoint: node.data.endpoint,
                        transformations: [] // Per user examples, transformations are top-level
                    });
                    break;

                case 'transform':
                    if (node.data.transformations) {
                        node.data.transformations.forEach(t => {
                            const newT = { type: t.type };
                            if (t.type === 'rename') {
                                newT.mappings = { [t.from]: t.to };
                            } else if (t.type === 'flatten') {
                                newT.path = t.path;
                            } else if (t.type === 'filter') {
                                // This is a simplified mapping from the app's internal structure
                                newT.rules = [{ expression: t.condition }];
                            } else {
                                newT.config = t.config;
                            }
                            transformations.push(newT);
                        });
                    }
                    break;

                case 'filter':
                    transformations.push({
                        type: 'filter',
                        rules: [{ expression: node.data.filterCondition || 'condition not set' }]
                    });
                    break;

                case 'aggregate':
                     transformations.push({
                        type: 'aggregate',
                        groupBy: node.data.groupBy || [],
                        operations: node.data.operations || []
                    });
                    break;

                case 'condition':
                     transformations.push({
                        type: 'condition',
                        if: node.data.if || { field: "status", operator: "equals", value: "active" },
                        then: node.data.then || { set: { "isActive": true } },
                        else: node.data.else || { set: { "isActive": false } }
                    });
                    break;

                case 'start':
                case 'end':
                    break;

                default:
                    break;
            }
        });
    }

    // Find the first API node to populate top-level fields for simplicity
    const firstApiNode = workflow?.nodes.find(n => n.type === 'api' || n.type === 'graphql');
    
    const categoryValues = {
        apiType: firstApiNode ? (firstApiNode.type === 'graphql' ? 'GraphQL' : 'REST') : "WORKFLOW",
        endpoint: firstApiNode?.data?.endpoint,
        method: firstApiNode?.data?.method,
        auth: firstApiNode?.data?.authentication || { type: 'None' },
        inputSchema: inputSchema || {},
        outputSchema: outputSchema || {},
        transformations: transformations,
        chainedAPIs: chainedAPIs,
        mockEnabled: mockEnabled || false,
        mockResponse: mockResponse || {}
    };

    return {
        categoryName: "dynamicAPI",
        categoryId: id,
        categoryValues
    };
};


// JSON Editor Component (MODIFIED to be a read-only view)
const JsonEditor = ({ config, theme, onClose }) => {
  // Generate the user-facing JSON using the transformation logic
  const userFormattedJson = useMemo(() => {
    const formatted = transformConfigToUserFormat(config);
    return JSON.stringify(formatted, null, 2);
  }, [config]);

  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const text = userFormattedJson;
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
    document.body.removeChild(textArea);
  };

  return (
    <div className="fixed inset-0 z-40 bg-black bg-opacity-50 flex flex-col p-4 sm:p-8">
      <div className={`flex-1 flex flex-col rounded-lg shadow-2xl ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`flex items-center justify-between p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Generated JSON Configuration View
          </h3>
          <div className="flex items-center gap-3">
            <button
                onClick={copyToClipboard}
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                    theme === 'dark' 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
            >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy JSON'}
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 p-4 flex flex-col">
          <div className={`p-3 mb-4 rounded-lg flex items-center gap-3 ${theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-50'}`}>
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <p className={`text-sm ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'}`}>
              This is a read-only view showing the final JSON structure based on your workflow configuration.
            </p>
          </div>
          <textarea
            value={userFormattedJson}
            readOnly // This view is not for editing
            className={`w-full flex-1 p-4 font-mono text-sm rounded-lg border resize-none ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700 text-gray-300' 
                : 'bg-white border-gray-200 text-gray-900'
            }`}
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
};


// Promote Modal Component
const PromoteModal = ({ config, onPromote, onClose, theme }) => {
  const [fromEnv, setFromEnv] = useState('dev');
  const [toEnv, setToEnv] = useState('qa');
  
  const environments = ['dev', 'qa', 'uat', 'prod'];
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`rounded-lg shadow-xl p-6 w-full max-w-md ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <GitMerge className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Promote Configuration
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Copy environment configuration
            </p>
          </div>
        </div>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              From Environment
            </label>
            <select
              value={fromEnv}
              onChange={(e) => setFromEnv(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
              }`}
            >
              {environments.slice(0, -1).map(env => (
                <option key={env} value={env}>{env.toUpperCase()}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center justify-center">
            <ArrowDown className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              To Environment
            </label>
            <select
              value={toEnv}
              onChange={(e) => setToEnv(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
              }`}
            >
              {environments.slice(environments.indexOf(fromEnv) + 1).map(env => (
                <option key={env} value={env}>{env.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={() => onPromote(fromEnv, toEnv)}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Promote
          </button>
        </div>
      </div>
    </div>
  );
};


// --- FEATURE-SPECIFIC COMPONENTS ---

// --- NEW SUBSCRIBER DASHBOARD (MODIFIED) ---
const SubscriberDashboard = ({ theme }) => {
    const [timeframe, setTimeframe] = useState('7d');
    const [selectedApi, setSelectedApi] = useState('all');
    const [chartData, setChartData] = useState([]);
    const [hoveredDataPoint, setHoveredDataPoint] = useState(null);

    // Mock data for demonstration
    const apiConfigs = [
        { id: 'api_demo_1', name: 'Weather Data Pipeline' },
        { id: 'api_demo_3', name: 'E-commerce Product API' },
        { id: 'api_demo_5', name: 'Payment Gateway Service' },
    ];
    
    const kpiData = {
        totalApiConfigs: 5,
        totalCalls: 12450,
        successRate: 99.8,
        avgLatency: 120,
    };

    const generateMockData = useCallback((tf, apiId) => {
        const data = [];
        let numPoints;
        let labelFormat;

        switch (tf) {
            case '1d':
                numPoints = 24; // Hourly data
                labelFormat = (i) => `${i}:00`;
                break;
            case '30d':
                numPoints = 30; // Daily data
                labelFormat = (i) => `Day ${i + 1}`;
                break;
            case '7d':
            default:
                numPoints = 7; // Daily data
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const today = new Date().getDay();
                labelFormat = (i) => days[(today - (6-i) + 7) % 7];
                break;
        }

        for (let i = 0; i < numPoints; i++) {
            data.push({
                label: labelFormat(i),
                calls: Math.floor(Math.random() * (apiId === 'all' ? 3000 : 1000) + 500),
                errors: Math.floor(Math.random() * 50),
            });
        }
        return data;
    }, []);

    useEffect(() => {
        setChartData(generateMockData(timeframe, selectedApi));
    }, [timeframe, selectedApi, generateMockData]);

    const maxCalls = Math.max(...chartData.map(d => d.calls), 0);

    const recentActivity = [
        { id: 1, api: 'Weather Data', status: 'Success', time: '2 min ago', statusColor: 'text-green-500' },
        { id: 2, api: 'Payment Gateway', status: 'Success', time: '5 min ago', statusColor: 'text-green-500' },
        { id: 3, api: 'E-commerce Product API', status: 'Failed', time: '10 min ago', statusColor: 'text-red-500' },
        { id: 4, api: 'Weather Data', status: 'Success', time: '12 min ago', statusColor: 'text-green-500' },
        { id: 5, api: 'Social Media Connector', status: 'Success', time: '25 min ago', statusColor: 'text-green-500' },
    ];

    const KpiCard = ({ icon, label, value, unit, iconBgColor }) => {
        const Icon = icon;
        return (
            <div className={`rounded-lg p-6 shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
                        <p className={`text-2xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {value.toLocaleString()}<span className="text-lg ml-1">{unit}</span>
                        </p>
                    </div>
                    <div className={`p-3 rounded-full ${iconBgColor}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                </div>
            </div>
        );
    };

    const LineChart = () => {
        const svgWidth = 500;
        const svgHeight = 200;
        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
        const chartWidth = svgWidth - margin.left - margin.right;
        const chartHeight = svgHeight - margin.top - margin.bottom;

        if (chartData.length === 0) return null;

        const xScale = (index) => margin.left + (index / (chartData.length - 1)) * chartWidth;
        const yScale = (value) => margin.top + chartHeight - (value / maxCalls) * chartHeight;

        const linePath = chartData
            .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.calls)}`)
            .join(' ');

        const areaPath = `${linePath} L ${xScale(chartData.length - 1)} ${yScale(0)} L ${xScale(0)} ${yScale(0)} Z`;

        return (
            <div className="relative h-full w-full">
                <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
                    {/* Y-axis grid lines and labels */}
                    {[0, 0.25, 0.5, 0.75, 1].map(tick => (
                        <g key={tick}>
                            <line
                                x1={margin.left} y1={yScale(maxCalls * tick)}
                                x2={svgWidth - margin.right} y2={yScale(maxCalls * tick)}
                                stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
                                strokeWidth="1"
                            />
                            <text
                                x={margin.left - 5} y={yScale(maxCalls * tick)}
                                textAnchor="end"
                                alignmentBaseline="middle"
                                fontSize="10"
                                fill={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                            >
                                {(maxCalls * tick / 1000).toFixed(1)}k
                            </text>
                        </g>
                    ))}

                    {/* X-axis labels */}
                    {chartData.map((d, i) => (
                        <text
                            key={i}
                            x={xScale(i)}
                            y={svgHeight - margin.bottom + 15}
                            textAnchor="middle"
                            fontSize="10"
                            fill={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                        >
                            {d.label}
                        </text>
                    ))}
                    
                    {/* Gradient for area fill */}
                    <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Area path */}
                    <path d={areaPath} fill="url(#areaGradient)" />

                    {/* Line path */}
                    <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="2" />

                    {/* Data points */}
                    {chartData.map((d, i) => (
                        <circle
                            key={i}
                            cx={xScale(i)}
                            cy={yScale(d.calls)}
                            r="4"
                            fill="#3b82f6"
                            stroke={theme === 'dark' ? '#1f2937' : '#ffffff'}
                            strokeWidth="2"
                            className="cursor-pointer"
                            onMouseOver={() => setHoveredDataPoint({ ...d, x: xScale(i), y: yScale(d.calls) })}
                            onMouseOut={() => setHoveredDataPoint(null)}
                        />
                    ))}
                </svg>
                {/* Tooltip */}
                {hoveredDataPoint && (
                    <div
                        className={`absolute p-2 rounded-lg shadow-lg text-xs pointer-events-none ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}
                        style={{
                            left: `${hoveredDataPoint.x + 5}px`,
                            top: `${hoveredDataPoint.y - 40}px`,
                            transform: 'translateX(-50%)'
                        }}
                    >
                        <p className="font-bold">{hoveredDataPoint.label}</p>
                        <p>Calls: {hoveredDataPoint.calls.toLocaleString()}</p>
                        <p>Errors: {hoveredDataPoint.errors.toLocaleString()}</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`p-4 sm:p-6 overflow-y-auto h-full ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>My Dashboard</h2>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KpiCard icon={Layers3} label="Total API Configs" value={kpiData.totalApiConfigs} unit="" iconBgColor="bg-blue-500" />
                <KpiCard icon={Activity} label="Total Calls (Month)" value={kpiData.totalCalls} unit="" iconBgColor="bg-purple-500" />
                <KpiCard icon={CheckCircle} label="Success Rate" value={kpiData.successRate} unit="%" iconBgColor="bg-green-500" />
                <KpiCard icon={Timer} label="Avg. Latency" value={kpiData.avgLatency} unit="ms" iconBgColor="bg-orange-500" />
            </div>

            {/* Usage Chart & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className={`lg:col-span-2 p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>API Call Metrics</h3>
                        <div className="flex items-center gap-2">
                            <select
                                value={selectedApi}
                                onChange={(e) => setSelectedApi(e.target.value)}
                                className={`text-sm px-3 py-1.5 rounded-lg border focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                            >
                                <option value="all">All API Configs</option>
                                {apiConfigs.map(api => (
                                    <option key={api.id} value={api.id}>{api.name}</option>
                                ))}
                            </select>
                            <div className={`flex items-center p-1 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                {['1d', '7d', '30d'].map(tf => (
                                    <button
                                        key={tf}
                                        onClick={() => setTimeframe(tf)}
                                        className={`px-3 py-1 text-sm rounded-md capitalize ${timeframe === tf ? (theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-white shadow-sm text-gray-800') : (theme === 'dark' ? 'text-gray-400' : 'text-gray-500')}`}
                                    >
                                        {tf}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="h-64">
                        <LineChart />
                    </div>
                </div>
                <div className={`p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h3>
                    <div className="space-y-4">
                        {recentActivity.map(activity => (
                            <div key={activity.id} className="flex items-center justify-between">
                                <div>
                                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>{activity.api}</p>
                                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{activity.time}</p>
                                </div>
                                <span className={`text-sm font-semibold ${activity.statusColor}`}>{activity.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


// Environment Manager Component
const EnvironmentManager = ({ config, onUpdate, currentEnvironment, theme, showToast }) => {
  const environments = ['dev', 'qa', 'uat', 'prod'];
  const [selectedEnv, setSelectedEnv] = useState(currentEnvironment);
  const [showSecrets, setShowSecrets] = useState(false);
  
  const handleAddVariable = (env) => {
    const name = prompt('Variable name:');
    if (name) {
      const updatedConfig = {
        ...config,
        environments: {
          ...config.environments,
          [env]: {
            ...config.environments[env],
            variables: {
              ...config.environments[env]?.variables,
              [name]: ''
            }
          }
        }
      };
      onUpdate(updatedConfig);
      showToast('Variable added', 'success');
    }
  };
  
  const handleUpdateVariable = (env, name, value) => {
    const updatedConfig = {
      ...config,
      environments: {
        ...config.environments,
        [env]: {
          ...config.environments[env],
          variables: {
            ...config.environments[env]?.variables,
            [name]: value
          }
        }
      }
    };
    onUpdate(updatedConfig);
  };
  
  const handleDeleteVariable = (env, name) => {
    const variables = { ...config.environments[env]?.variables };
    delete variables[name];
    
    const updatedConfig = {
      ...config,
      environments: {
        ...config.environments,
        [env]: {
          ...config.environments[env],
          variables
        }
      }
    };
    onUpdate(updatedConfig);
    showToast('Variable deleted', 'success');
  };
  
  return (
    <div className={`p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto">
        {/* Environment Tabs */}
        <div className="flex items-center gap-4 mb-6">
          {environments.map(env => (
            <button
              key={env}
              onClick={() => setSelectedEnv(env)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                selectedEnv === env
                  ? theme === 'dark'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{env.toUpperCase()}</span>
                {config.environments[env]?.promoted && (
                  <span className="text-xs bg-white bg-opacity-20 px-2 py-0.5 rounded-full">
                    Promoted
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
        
        <div className={`rounded-lg shadow-sm border p-6 ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          {/* Environment Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {selectedEnv.toUpperCase()} Environment Variables
              </h3>
              <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Configure environment-specific variables and secrets
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSecrets(!showSecrets)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  theme === 'dark' 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showSecrets ? 'Hide' : 'Show'} Secrets
              </button>
              <button
                onClick={() => handleAddVariable(selectedEnv)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Variable
              </button>
            </div>
          </div>
          
          {/* Variables Grid */}
          <div className="space-y-3">
            {Object.entries(config.environments[selectedEnv]?.variables || {}).map(([name, value]) => {
              const isSecret = name.toLowerCase().includes('key') || 
                               name.toLowerCase().includes('secret') || 
                               name.toLowerCase().includes('password');
              
              return (
                <div
                  key={name}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <label className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {name}
                      </label>
                      {isSecret && (
                        <Lock className="w-3 h-3 text-yellow-500" />
                      )}
                    </div>
                    <input
                      type={isSecret && !showSecrets ? 'password' : 'text'}
                      value={value}
                      onChange={(e) => handleUpdateVariable(selectedEnv, name, e.target.value)}
                      placeholder="Enter value..."
                      className={`w-full px-3 py-2 rounded border ${
                        theme === 'dark' 
                          ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <button
                    onClick={() => handleDeleteVariable(selectedEnv, name)}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'dark' 
                        ? 'hover:bg-gray-600 text-gray-400 hover:text-red-400' 
                        : 'hover:bg-gray-200 text-gray-500 hover:text-red-500'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
            
            {Object.keys(config.environments[selectedEnv]?.variables || {}).length === 0 && (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <Key className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No environment variables configured</p>
                <p className="text-sm mt-1">Click "Add Variable" to create one</p>
              </div>
            )}
          </div>
          
          {/* Environment Info */}
          {config.environments[selectedEnv]?.promoted && (
            <div className={`mt-6 p-4 rounded-lg ${
              theme === 'dark' ? 'bg-blue-900 bg-opacity-20' : 'bg-blue-50'
            }`}>
              <div className="flex items-center gap-2">
                <GitMerge className="w-4 h-4 text-blue-500" />
                <p className={`text-sm ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                  Promoted from {config.environments[selectedEnv].promotedFrom?.toUpperCase()} on{' '}
                  {new Date(config.environments[selectedEnv].lastPromotion).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Test Suite Manager Component
const TestSuiteManager = ({ config, onUpdate, environment, theme, showToast }) => {
  const [selectedSuite, setSelectedSuite] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  
  const handleCreateSuite = () => {
    const name = prompt('Test suite name:');
    if (name) {
      const newSuite = {
        id: `suite_${Date.now()}`,
        name,
        description: '',
        testCases: [],
        createdAt: new Date().toISOString()
      };
      
      onUpdate({
        ...config,
        testSuites: [...(config.testSuites || []), newSuite]
      });
      
      setSelectedSuite(newSuite);
      showToast('Test suite created', 'success');
    }
  };
  
  const handleAddTestCase = (suiteId) => {
    const suite = config.testSuites.find(s => s.id === suiteId);
    if (!suite) return;
    
    const newTestCase = {
      id: `tc_${Date.now()}`,
      name: 'New Test Case',
      input: {},
      expectedOutput: {},
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    const updatedSuites = config.testSuites.map(s =>
      s.id === suiteId
        ? { ...s, testCases: [...s.testCases, newTestCase] }
        : s
    );
    
    onUpdate({
      ...config,
      testSuites: updatedSuites
    });
    
    showToast('Test case added', 'success');
  };
  
  const handleRunTests = async (suiteId) => {
    setIsRunning(true);
    
    // Simulate test execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const updatedSuites = config.testSuites.map(suite => {
      if (suite.id === suiteId) {
        const updatedTestCases = suite.testCases.map(tc => ({
          ...tc,
          status: Math.random() > 0.2 ? 'passed' : 'failed',
          lastRun: new Date().toISOString(),
          executionTime: Math.floor(Math.random() * 500) + 100
        }));
        
        return { ...suite, testCases: updatedTestCases };
      }
      return suite;
    });
    
    onUpdate({
      ...config,
      testSuites: updatedSuites
    });
    
    setIsRunning(false);
    showToast('Test execution completed', 'success');
  };
  
  return (
    <div className={`p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Test Suites
          </h3>
          <button
            onClick={handleCreateSuite}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Test Suite
          </button>
        </div>
        
        {config.testSuites && config.testSuites.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Test Suites List */}
            <div className="lg:col-span-1">
              <div className="space-y-3">
                {config.testSuites.map(suite => {
                  const passedTests = suite.testCases.filter(tc => tc.status === 'passed').length;
                  const totalTests = suite.testCases.length;
                  
                  return (
                    <div
                      key={suite.id}
                      onClick={() => setSelectedSuite(suite)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedSuite?.id === suite.id
                          ? theme === 'dark'
                            ? 'bg-gray-700 border-blue-500'
                            : 'bg-blue-50 border-blue-500'
                          : theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {suite.name}
                        </h4>
                        <TestTube className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                      </div>
                      
                      {totalTests > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                              {passedTests}/{totalTests} passed
                            </span>
                            <span className={`font-medium ${
                              passedTests === totalTests ? 'text-green-500' :
                              passedTests > 0 ? 'text-yellow-500' : 'text-red-500'
                            }`}>
                              {totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                passedTests === totalTests ? 'bg-green-500' :
                                passedTests > 0 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${totalTests > 0 ? (passedTests / totalTests) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Test Cases */}
            {selectedSuite && (
              <div className="lg:col-span-2">
                <div className={`rounded-lg border p-6 ${
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {selectedSuite.name}
                      </h4>
                      <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {selectedSuite.testCases.length} test cases
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleAddTestCase(selectedSuite.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                          theme === 'dark' 
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                        Add Test
                      </button>
                      <button
                        onClick={() => handleRunTests(selectedSuite.id)}
                        disabled={isRunning || selectedSuite.testCases.length === 0}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors ${
                          isRunning || selectedSuite.testCases.length === 0
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {isRunning ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Running...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            Run Tests
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Test Cases List */}
                  <div className="space-y-3">
                    {selectedSuite.testCases.map((testCase, index) => (
                      <div
                        key={testCase.id}
                        className={`p-4 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <input
                            type="text"
                            value={testCase.name}
                            onChange={(e) => {
                              const updatedSuites = config.testSuites.map(s =>
                                s.id === selectedSuite.id
                                  ? {
                                      ...s,
                                      testCases: s.testCases.map(tc =>
                                        tc.id === testCase.id
                                          ? { ...tc, name: e.target.value }
                                          : tc
                                      )
                                    }
                                  : s
                              );
                              onUpdate({ ...config, testSuites: updatedSuites });
                            }}
                            className={`font-medium bg-transparent border-none outline-none ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}
                          />
                          <div className="flex items-center gap-2">
                            {testCase.status === 'passed' && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                            {testCase.status === 'failed' && (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                            {testCase.status === 'pending' && (
                              <Circle className="w-5 h-5 text-gray-400" />
                            )}
                            {testCase.executionTime && (
                              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {testCase.executionTime}ms
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={`block text-xs font-medium mb-1 ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              Input
                            </label>
                            <textarea
                              value={JSON.stringify(testCase.input, null, 2)}
                              onChange={(e) => {
                                try {
                                  const parsed = JSON.parse(e.target.value);
                                  const updatedSuites = config.testSuites.map(s =>
                                    s.id === selectedSuite.id
                                      ? {
                                          ...s,
                                          testCases: s.testCases.map(tc =>
                                            tc.id === testCase.id
                                              ? { ...tc, input: parsed }
                                              : tc
                                          )
                                        }
                                      : s
                                  );
                                  onUpdate({ ...config, testSuites: updatedSuites });
                                } catch (e) {
                                  // Invalid JSON
                                }
                              }}
                              className={`w-full px-2 py-1 text-xs font-mono rounded border ${
                                theme === 'dark' 
                                  ? 'bg-gray-800 border-gray-600 text-white' 
                                  : 'bg-white border-gray-300'
                              }`}
                              rows={3}
                            />
                          </div>
                          <div>
                            <label className={`block text-xs font-medium mb-1 ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              Expected Output
                            </label>
                            <textarea
                              value={JSON.stringify(testCase.expectedOutput, null, 2)}
                              onChange={(e) => {
                                try {
                                  const parsed = JSON.parse(e.target.value);
                                  const updatedSuites = config.testSuites.map(s =>
                                    s.id === selectedSuite.id
                                      ? {
                                          ...s,
                                          testCases: s.testCases.map(tc =>
                                            tc.id === testCase.id
                                              ? { ...tc, expectedOutput: parsed }
                                              : tc
                                          )
                                        }
                                      : s
                                  );
                                  onUpdate({ ...config, testSuites: updatedSuites });
                                } catch (e) {
                                  // Invalid JSON
                                }
                              }}
                              className={`w-full px-2 py-1 text-xs font-mono rounded border ${
                                theme === 'dark' 
                                  ? 'bg-gray-800 border-gray-600 text-white' 
                                  : 'bg-white border-gray-300'
                              }`}
                              rows={3}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {selectedSuite.testCases.length === 0 && (
                      <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No test cases yet</p>
                        <p className="text-sm mt-1">Click "Add Test" to create one</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <TestTube className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>No test suites configured yet</p>
            <button
              onClick={handleCreateSuite}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Create Test Suite
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Test Suites Dashboard Component
const TestSuitesDashboard = ({ configs, onUpdateConfig, theme, showToast }) => {
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [isRunningAll, setIsRunningAll] = useState(false);
  
  const handleRunAllTests = async () => {
    setIsRunningAll(true);
    
    for (const config of configs) {
      for (const suite of config.testSuites || []) {
        // Simulate test execution
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const updatedTestCases = suite.testCases.map(tc => ({
          ...tc,
          status: Math.random() > 0.2 ? 'passed' : 'failed',
          lastRun: new Date().toISOString(),
          executionTime: Math.floor(Math.random() * 500) + 100
        }));
        
        const updatedConfig = {
          ...config,
          testSuites: config.testSuites.map(s =>
            s.id === suite.id ? { ...s, testCases: updatedTestCases } : s
          )
        };
        
        onUpdateConfig(updatedConfig);
      }
    }
    
    setIsRunningAll(false);
    showToast('All tests executed', 'success');
  };
  
  const allTestStats = useMemo(() => {
    let total = 0;
    let passed = 0;
    let failed = 0;
    
    configs.forEach(config => {
      config.testSuites?.forEach(suite => {
        suite.testCases?.forEach(tc => {
          total++;
          if (tc.status === 'passed') passed++;
          if (tc.status === 'failed') failed++;
        });
      });
    });
    
    return { total, passed, failed, pending: total - passed - failed };
  }, [configs]);
  
  return (
    <div className={`p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Total Tests</p>
              <p className={`text-2xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {allTestStats.total}
              </p>
            </div>
            <TestTube className={`w-8 h-8 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-500'}`} />
          </div>
        </div>
        
        <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Passed</p>
              <p className={`text-2xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {allTestStats.passed}
              </p>
            </div>
            <CheckCircle className={`w-8 h-8 ${theme === 'dark' ? 'text-green-400' : 'text-green-500'}`} />
          </div>
        </div>
        
        <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Failed</p>
              <p className={`text-2xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {allTestStats.failed}
              </p>
            </div>
            <XCircle className={`w-8 h-8 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`} />
          </div>
        </div>
        
        <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Success Rate</p>
              <p className={`text-2xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {allTestStats.total > 0 ? Math.round((allTestStats.passed / allTestStats.total) * 100) : 0}%
              </p>
            </div>
            <TrendingUp className={`w-8 h-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
          </div>
        </div>
      </div>
      
      {/* Actions Bar */}
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Test Suites Overview
        </h3>
        <button
          onClick={handleRunAllTests}
          disabled={isRunningAll || allTestStats.total === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors ${
            isRunningAll || allTestStats.total === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isRunningAll ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running All Tests...
            </>
          ) : (
            <>
              <PlayCircle className="w-4 h-4" />
              Run All Tests
            </>
          )}
        </button>
      </div>
      
      {/* Test Suites by API */}
      <div className="space-y-6">
        {configs.map(config => {
          if (!config.testSuites || config.testSuites.length === 0) return null;
          
          return (
            <div
              key={config.id}
              className={`rounded-lg border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {config.name}
                    </h4>
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {config.testSuites.length} test suites
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    config.status === 'published' 
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {config.status}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {config.testSuites.map(suite => {
                    const passedTests = suite.testCases.filter(tc => tc.status === 'passed').length;
                    const totalTests = suite.testCases.length;
                    const successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
                    
                    return (
                      <div
                        key={suite.id}
                        className={`p-4 rounded-lg border ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h5 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {suite.name}
                          </h5>
                          <TestTube className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                              Tests: {totalTests}
                            </span>
                            <span className={`font-medium ${
                              successRate === 100 ? 'text-green-500' :
                              successRate >= 80 ? 'text-yellow-500' : 'text-red-500'
                            }`}>
                              {successRate}%
                            </span>
                          </div>
                          
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                successRate === 100 ? 'bg-green-500' :
                                successRate >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${successRate}%` }}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-green-500">{passedTests} passed</span>
                            <span className="text-red-500">
                              {suite.testCases.filter(tc => tc.status === 'failed').length} failed
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
        
        {configs.every(c => !c.testSuites || c.testSuites.length === 0) && (
          <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <TestTube className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg mb-2">No test suites configured</p>
            <p className="text-sm">Create test suites in the API Studio for each API configuration</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Subscriber API View
const SubscriberView = ({ config, theme, onExit, showToast }) => {
    const [inputValues, setInputValues] = useState({});
    const [apiResponse, setApiResponse] = useState(null);
    const [isTesting, setIsTesting] = useState(false);
    const [activeTab, setActiveTab] = useState('request');
    const [activeCodeLang, setActiveCodeLang] = useState('shell');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Initialize input fields with example values from schema
        const initialInputs = {};
        if (config.inputSchema) {
            Object.entries(config.inputSchema).forEach(([key, schema]) => {
                initialInputs[key] = schema.example || '';
            });
        }
        setInputValues(initialInputs);
    }, [config.inputSchema]);

    const handleInputChange = (name, value) => {
        setInputValues(prev => ({ ...prev, [name]: value }));
    };

    const handleTestApi = async () => {
        setIsTesting(true);
        setApiResponse(null);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

        const mockResponse = {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'X-Request-Id': `req_${Date.now()}` },
            data: {
                status: "success",
                data: {
                    message: `Data retrieved for ${Object.values(inputValues).join(', ')}.`,
                    ...config.outputSchema
                }
            },
            responseTime: `${Math.floor(Math.random() * 200) + 50}ms`
        };

        setApiResponse(mockResponse);
        setIsTesting(false);
    };

    const copyToClipboard = (text) => {
        // Using a temporary textarea for broader browser support, including within iframes
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            setCopied(true);
            showToast('Copied to clipboard!', 'success');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            showToast('Failed to copy!', 'error');
        }
        document.body.removeChild(textArea);
    };

    const generateCodeSnippet = useCallback((language) => {
        const baseUrl = `https://api-builder.dev.naqp.toyota.com/execute/${config.id}`;
        const headers = { 'Authorization': 'Bearer YOUR_API_KEY', 'Content-Type': 'application/json' };
        const body = JSON.stringify(inputValues, null, 2);

        switch (language) {
            case 'shell':
                return `curl -X POST '${baseUrl}' \\\n-H 'Authorization: Bearer YOUR_API_KEY' \\\n-H 'Content-Type: application/json' \\\n-d '${JSON.stringify(inputValues)}'`;
            case 'javascript':
                return `fetch('${baseUrl}', {\n  method: 'POST',\n  headers: ${JSON.stringify(headers, null, 2)},\n  body: ${body}\n})\n.then(response => response.json())\n.then(data => console.log(data))\n.catch(error => console.error('Error:', error));`;
            case 'typescript':
                return `import fetch from 'node-fetch';\n\nconst url: string = '${baseUrl}';\n\nconst options: RequestInit = {\n  method: 'POST',\n  headers: {\n    'Authorization': 'Bearer YOUR_API_KEY',\n    'Content-Type': 'application/json'\n  },\n  body: ${body}\n};\n\nasync function callApi() {\n  try {\n    const response = await fetch(url, options);\n    const data = await response.json();\n    console.log(data);\n  } catch (error) {\n    console.error('Error:', error);\n  }\n}\n\ncallApi();`;
            case 'python':
                return `import requests\nimport json\n\nurl = "${baseUrl}"\nheaders = ${JSON.stringify(headers, null, 2)}\npayload = ${JSON.stringify(inputValues)}\n\nresponse = requests.post(url, headers=headers, data=json.dumps(payload))\n\nprint(response.json())`;
            case 'java':
                 return `import java.net.URI;\nimport java.net.http.HttpClient;\nimport java.net.http.HttpRequest;\nimport java.net.http.HttpResponse;\n\npublic class ApiClient {\n    public static void main(String[] args) throws Exception {\n        HttpClient client = HttpClient.newHttpClient();\n        String requestBody = """\n${JSON.stringify(inputValues, null, 4)}\n""";\n\n        HttpRequest request = HttpRequest.newBuilder()\n                .uri(URI.create("${baseUrl}"))\n                .header("Authorization", "Bearer YOUR_API_KEY")\n                .header("Content-Type", "application/json")\n                .POST(HttpRequest.BodyPublishers.ofString(requestBody))\n                .build();\n\n        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());\n\n        System.out.println(response.body());\n    }\n}`;
            default:
                return '';
        }
    }, [inputValues, config.id]);

    const renderSchemaTable = (schema) => (
        <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
                <thead className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <th className="text-left p-2 font-medium">Field</th>
                        <th className="text-left p-2 font-medium">Type</th>
                        <th className="text-left p-2 font-medium">Description</th>
                    </tr>
                </thead>
                <tbody>
                    {schema && Object.entries(schema).map(([key, value]) => (
                        <tr key={key} className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                            <td className={`p-2 font-mono ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{key}</td>
                            <td className={`p-2 font-mono ${theme === 'dark' ? 'text-purple-400' : 'text-purple-500'}`}>{value.type}</td>
                            <td className="p-2">{value.description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className={`flex flex-col h-full ${theme === 'dark' ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-800'}`}>
            {/* Header */}
            <header className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 sm:px-6 py-3 flex items-center gap-4 flex-shrink-0`}>
                <button onClick={onExit} className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className={`text-lg sm:text-xl font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{config.name}</h2>
            </header>

            {/* Main Content */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
                {/* Left Panel: Documentation */}
                <div className="p-4 sm:p-6 overflow-y-auto">
                    <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{config.description}</p>
                    <div className="flex flex-wrap items-center gap-2 mb-6 text-sm">
                        <span className={`px-3 py-1 font-medium rounded-full ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>v{config.version}</span>
                        <span className={`px-3 py-1 font-medium rounded-full ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>{config.category}</span>
                    </div>
                    
                    <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>API Endpoint</h3>
                    <pre className={`w-full p-3 rounded-lg text-sm overflow-x-auto mb-6 ${theme === 'dark' ? 'bg-gray-800 text-green-400' : 'bg-gray-100 text-green-700'}`}>
                        <span className={`font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>POST</span> https://api-builder.dev.naqp.toyota.com/execute/{config.id}
                    </pre>

                    <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Input Schema</h3>
                    <div className={`rounded-lg border mb-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        {renderSchemaTable(config.inputSchema)}
                    </div>

                    <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Output Schema</h3>
                    <div className={`rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        {renderSchemaTable(config.outputSchema)}
                    </div>
                </div>

                {/* Right Panel: Interactive Playground */}
                <div className={`flex flex-col h-full ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} lg:border-l`}>
                    <div className={`flex border-b flex-shrink-0 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <button onClick={() => setActiveTab('request')} className={`flex-1 px-4 py-3 text-sm font-medium text-center ${activeTab === 'request' ? 'border-b-2 border-blue-500 text-blue-500' : (theme === 'dark' ? 'text-gray-400' : 'text-gray-500')}`}>Request</button>
                        <button onClick={() => setActiveTab('code')} className={`flex-1 px-4 py-3 text-sm font-medium text-center ${activeTab === 'code' ? 'border-b-2 border-blue-500 text-blue-500' : (theme === 'dark' ? 'text-gray-400' : 'text-gray-500')}`}>Code Snippets</button>
                    </div>

                    {activeTab === 'request' && (
                        <div className="flex-1 flex flex-col overflow-y-auto">
                            {/* Request Section */}
                            <div className="p-4 sm:p-6 space-y-4">
                                <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Parameters</h4>
                                {config.inputSchema && Object.entries(config.inputSchema).map(([key, schema]) => (
                                    <div key={key}>
                                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{key}</label>
                                        <input
                                            type="text"
                                            value={inputValues[key] || ''}
                                            placeholder={schema.example || ''}
                                            onChange={(e) => handleInputChange(key, e.target.value)}
                                            className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className={`p-4 sm:p-6 border-y ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                                <button onClick={handleTestApi} disabled={isTesting} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                                    {isTesting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                    {isTesting ? 'Sending...' : 'Send Request'}
                                </button>
                            </div>
                            
                            {/* Response Section */}
                            <div className="flex-1 p-4 sm:p-6 relative min-h-[200px]">
                                <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Response</h4>
                                {isTesting && (
                                    <div className="absolute inset-0 flex flex-col justify-center items-center">
                                        <div className="flex items-center gap-4 text-sm text-gray-400">
                                            <User className="w-6 h-6 animate-pulse" />
                                            <ArrowRight className="w-6 h-6 animate-pulse" style={{animationDelay: '0.2s'}} />
                                            <Server className="w-6 h-6 animate-pulse" style={{animationDelay: '0.4s'}} />
                                            <ArrowLeft className="w-6 h-6 animate-pulse" style={{animationDelay: '0.6s'}} />
                                            <ClipboardCheck className="w-6 h-6 animate-pulse" style={{animationDelay: '0.8s'}} />
                                        </div>
                                        <p className="mt-4 text-sm text-gray-400">Fetching response...</p>
                                    </div>
                                )}
                                {!isTesting && !apiResponse && (
                                    <div className="absolute inset-0 flex flex-col justify-center items-center text-center">
                                      <Zap className={`w-12 h-12 mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
                                      <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Response will be shown here.</p>
                                    </div>
                                )}
                                {apiResponse && (
                                    <div>
                                        <div className="flex items-center gap-4 text-sm mb-2">
                                            <span className={`font-medium ${apiResponse.status === 200 ? 'text-green-500' : 'text-red-500'}`}>Status: {apiResponse.status}</span>
                                            <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Time: {apiResponse.responseTime}</span>
                                        </div>
                                        <pre className={`w-full p-4 rounded-lg text-sm overflow-x-auto ${theme === 'dark' ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
                                            <code>{JSON.stringify(apiResponse.data, null, 2)}</code>
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'code' && (
                        <div className="p-4 sm:p-6 flex-1 flex flex-col overflow-hidden">
                            <div className={`flex items-center gap-1 p-1 rounded-lg mb-4 self-start flex-wrap ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                {['shell', 'javascript', 'typescript', 'python', 'java'].map(lang => (
                                    <button key={lang} onClick={() => setActiveCodeLang(lang)} className={`px-3 py-1.5 text-sm rounded-md capitalize ${activeCodeLang === lang ? (theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-white shadow-sm text-gray-800') : (theme === 'dark' ? 'text-gray-400' : 'text-gray-500')}`}>{lang}</button>
                                ))}
                            </div>
                            <div className="relative flex-1 min-h-0">
                                <pre className={`w-full h-full p-4 rounded-lg text-sm overflow-auto ${theme === 'dark' ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
                                    <code>{generateCodeSnippet(activeCodeLang)}</code>
                                </pre>
                                <button onClick={() => copyToClipboard(generateCodeSnippet(activeCodeLang))} className={`absolute top-3 right-3 p-2 rounded-lg transition-colors ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
                                    {copied ? <ClipboardCheck className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- CORE LAYOUT COMPONENTS ---

// Enhanced Dashboard Component
const Dashboard = ({ configs, onSelectConfig, onCreateNew, onDeleteConfig, theme, showToast, environment, searchTerm, persona, onSwitchView }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('executions');
  const [viewMode, setViewMode] = useState('grid');

  const handleDeleteClick = (e, config) => {
    e.stopPropagation();
    setShowDeleteModal(config);
  };

  const confirmDelete = () => {
    if (showDeleteModal) {
      onDeleteConfig(showDeleteModal.id);
      setShowDeleteModal(null);
    }
  };

  const filteredConfigs = useMemo(() => {
    let filtered = persona === 'subscriber' ? configs.filter(c => c.status === 'published') : configs;
    
    // Apply status filter
    if (filter !== 'all' && persona === 'builder') {
      filtered = filtered.filter(c => c.status === filter);
    }
    
    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'modified') {
        return new Date(b.modifiedAt) - new Date(a.modifiedAt);
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'status') {
        return a.status.localeCompare(b.status);
      } else if (sortBy === 'executions') {
        return (b.metrics?.executions?.total || 0) - (a.metrics?.executions?.total || 0);
      }
      return 0;
    });
    
    return filtered;
  }, [configs, filter, sortBy, persona]);

  const stats = useMemo(() => ({
    total: configs.length,
    published: configs.filter(c => c.status === 'published').length,
    draft: configs.filter(c => c.status === 'draft').length,
    totalExecutions: configs.reduce((sum, c) => sum + (c.metrics?.executions?.total || 0), 0),
    avgSuccessRate: configs.length > 0 ? configs.reduce((sum, c) => sum + (c.metrics?.reliability?.successRate || 0), 0) / configs.length : 0
  }), [configs]);

  // Subscriber Marketplace View
  if (persona === 'subscriber') {
    return (
        <div className={`p-4 sm:p-6 overflow-y-auto h-full ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>API Marketplace</h2>
                <div className="flex items-center gap-2 sm:gap-4">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className={`px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'} focus:ring-2 focus:ring-blue-500`}
                    >
                        <option value="executions">Most Popular</option>
                        <option value="modified">Recently Updated</option>
                        <option value="name">Alphabetical</option>
                    </select>
                    <div className={`flex items-center gap-1 p-1 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? (theme === 'dark' ? 'bg-gray-700 text-blue-400' : 'bg-white text-blue-600 shadow-sm') : (theme === 'dark' ? 'text-gray-400' : 'text-gray-500')}`}><Grid3x3 className="w-4 h-4" /></button>
                        <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? (theme === 'dark' ? 'bg-gray-700 text-blue-400' : 'bg-white text-blue-600 shadow-sm') : (theme === 'dark' ? 'text-gray-400' : 'text-gray-500')}`}><List className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>
            
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredConfigs.map(config => (
                        <div key={config.id} onClick={() => onSelectConfig(config)} className={`relative group rounded-lg shadow-sm border p-6 hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:border-blue-500' : 'bg-white border-gray-200 hover:border-blue-500'}`}>
                            <h3 className={`font-semibold pr-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{config.name}</h3>
                            <p className={`text-sm mt-2 mb-4 line-clamp-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{config.description || 'No description'}</p>
                            <div className={`flex items-center justify-between text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                                <span>v{config.version}</span>
                                <span>{config.category}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={`rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <table className="w-full">
                        <thead className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                            <tr>
                                <th className={`text-left px-6 py-3 text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Name</th>
                                <th className={`text-left px-6 py-3 text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Category</th>
                                <th className={`text-left px-6 py-3 text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Executions</th>
                                <th className={`text-left px-6 py-3 text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Last Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredConfigs.map((config, index) => (
                                <tr key={config.id} onClick={() => onSelectConfig(config)} className={`cursor-pointer transition-colors ${theme === 'dark' ? 'hover:bg-gray-700/50 border-gray-700' : 'hover:bg-gray-50 border-gray-200'} ${index < filteredConfigs.length - 1 ? 'border-b' : ''}`}>
                                    <td className={`px-6 py-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        <p className="font-medium">{config.name}</p>
                                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{config.description}</p>
                                    </td>
                                    <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{config.category}</td>
                                    <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{config.metrics.executions.total.toLocaleString()}</td>
                                    <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{new Date(config.modifiedAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
  }

  // Builder Dashboard
  return (
    <div className={`p-6 overflow-y-auto h-full ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center justify-between">
              <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Total APIs</p>
              <p className={`text-2xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stats.total}
              </p>
              </div>
              <Boxes className={`w-8 h-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
          </div>
          </div>
          
          <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center justify-between">
              <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Published</p>
              <p className={`text-2xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stats.published}
              </p>
              </div>
              <Cloud className={`w-8 h-8 ${theme === 'dark' ? 'text-green-400' : 'text-green-500'}`} />
          </div>
          </div>
          
          <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center justify-between">
              <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Total Executions</p>
              <p className={`text-2xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stats.totalExecutions.toLocaleString()}
              </p>
              </div>
              <Activity className={`w-8 h-8 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-500'}`} />
          </div>
          </div>
          
          <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center justify-between">
              <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Success Rate</p>
              <p className={`text-2xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stats.avgSuccessRate.toFixed(1)}%
              </p>
              </div>
              <TrendingUp className={`w-8 h-8 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-500'}`} />
          </div>
          </div>
      </div>
      
      {/* Filters and Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {/* Filter */}
          <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
              theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-200'
              } focus:ring-2 focus:ring-blue-500`}
          >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
          </select>
          
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700 text-white' 
                : 'bg-white border-gray-200'
            } focus:ring-2 focus:ring-blue-500`}
          >
            <option value="modified">Last Modified</option>
            <option value="name">Name</option>
            <option value="status">Status</option>
            <option value="executions">Executions</option>
          </select>
          
          {/* View Mode */}
          <div className={`flex items-center gap-1 p-1 rounded-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${
                viewMode === 'grid' 
                  ? theme === 'dark' ? 'bg-gray-700 text-blue-400' : 'bg-white text-blue-600 shadow-sm'
                  : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${
                viewMode === 'list' 
                  ? theme === 'dark' ? 'bg-gray-700 text-blue-400' : 'bg-white text-blue-600 shadow-sm'
                  : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <button
            onClick={onCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
        >
            <Plus className="w-4 h-4" />
            Create New API
        </button>
      </div>
      
      {/* API Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConfigs.map(config => (
            <div
              key={config.id}
              onClick={() => onSelectConfig(config)}
              className={`relative group rounded-lg shadow-sm border p-6 hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1 ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className={`font-semibold pr-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {config.name}
                </h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      config.status === 'published' 
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                      {config.status}
                  </span>
                   <button
                      onClick={(e) => handleDeleteClick(e, config)}
                      disabled={environment === 'prod'}
                      title={environment === 'prod' ? "Cannot delete APIs in Production environment" : "Delete API"}
                      className={`p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-20 disabled:cursor-not-allowed ${
                      theme === 'dark' 
                          ? 'hover:bg-gray-700 text-gray-400 hover:text-red-400' 
                          : 'hover:bg-gray-100 text-gray-500 hover:text-red-500'
                      }`}
                  >
                      <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <p className={`text-sm mb-4 line-clamp-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {config.description || 'No description provided'}
              </p>
              
              {/* Tags */}
              {config.tags && config.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {config.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className={`px-2 py-1 text-xs rounded-full ${
                        theme === 'dark' 
                          ? 'bg-gray-700 text-gray-300' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                  {config.tags.length > 3 && (
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      +{config.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
              
              <div className={`flex items-center justify-between text-sm ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
              }`}>
                <span>v{config.version}</span>
                <span>{config.category}</span>
              </div>
              
              {/* Metrics */}
              <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Executions</p>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {config.metrics.executions.total > 1000 
                        ? `${(config.metrics.executions.total / 1000).toFixed(1)}k` 
                        : config.metrics.executions.total}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Avg Time</p>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {config.metrics.performance.avgResponseTime}ms
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Success</p>
                    <p className={`text-sm font-medium ${
                      config.metrics.reliability.successRate >= 99 ? 'text-green-500' :
                      config.metrics.reliability.successRate >= 95 ? 'text-yellow-500' :
                      'text-red-500'
                    }`}>
                      {config.metrics.reliability.successRate}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {filteredConfigs.length === 0 && (
            <div className={`col-span-3 text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg mb-2">No API configurations found</p>
              <p className="text-sm">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Create your first API to get started'}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className={`rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <table className="w-full">
            <thead className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <tr>
                <th className={`text-left px-6 py-3 text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Name</th>
                <th className={`text-left px-6 py-3 text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Status</th>
                <th className={`text-left px-6 py-3 text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Category</th>
                <th className={`text-left px-6 py-3 text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Version</th>
                <th className={`text-left px-6 py-3 text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Executions</th>
                <th className={`text-left px-6 py-3 text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Success Rate</th>
                <th className={`text-left px-6 py-3 text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredConfigs.map((config, index) => (
                <tr 
                  key={config.id}
                  onClick={() => onSelectConfig(config)}
                  className={`cursor-pointer transition-colors ${
                    theme === 'dark' 
                      ? 'hover:bg-gray-700 border-gray-700' 
                      : 'hover:bg-gray-50 border-gray-200'
                  } ${index < filteredConfigs.length - 1 ? 'border-b' : ''}`}
                >
                  <td className={`px-6 py-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <div>
                      <p className="font-medium">{config.name}</p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {config.description || 'No description'}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      config.status === 'published' 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                      {config.status}
                      </span>
                  </td>
                  <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {config.category}
                  </td>
                  <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    v{config.version}
                  </td>
                  <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {config.metrics.executions.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${
                      config.metrics.reliability.successRate >= 99 ? 'text-green-500' :
                      config.metrics.reliability.successRate >= 95 ? 'text-yellow-500' :
                      'text-red-500'
                    }`}>
                      {config.metrics.reliability.successRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                      <button
                          onClick={(e) => handleDeleteClick(e, config)}
                          disabled={environment === 'prod'}
                          title={environment === 'prod' ? "Cannot delete APIs in Production environment" : "Delete API"}
                          className={`p-2 rounded-lg transition-colors disabled:opacity-20 disabled:cursor-not-allowed ${
                          theme === 'dark' 
                              ? 'hover:bg-gray-600 text-gray-400 hover:text-red-400' 
                              : 'hover:bg-gray-100 text-gray-500 hover:text-red-500'
                          }`}
                      >
                          <Trash2 className="w-4 h-4" />
                      </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredConfigs.length === 0 && (
            <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg mb-2">No API configurations found</p>
              <p className="text-sm">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Create your first API to get started'}
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all scale-100 ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Delete API Configuration
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Are you sure you want to delete "{showDeleteModal.name}"? All associated data including test suites and metrics will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete API
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced API Studio Component
const APIStudio = ({ config, configs, onUpdate, onExit, onDelete, environment, theme, showToast }) => {
  const [activeTab, setActiveTab] = useState('workflow');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState(null);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showJsonEditor, setShowJsonEditor] = useState(false);
  const [testInputs, setTestInputs] = useState({});
  
  const handleSave = () => {
    const updatedConfig = {
      ...config,
      modifiedAt: new Date().toISOString()
    };
    onUpdate(updatedConfig);
    showToast('API configuration saved', 'success');
  };
  
  const handlePublish = () => {
    setShowPublishModal(true);
  };
  
  const confirmPublish = () => {
    const updatedConfig = {
      ...config,
      status: config.status === 'published' ? 'draft' : 'published',
      modifiedAt: new Date().toISOString()
    };
    onUpdate(updatedConfig);
    setShowPublishModal(false);
    showToast(
      config.status === 'published' 
        ? 'API unpublished successfully' 
        : 'API published successfully',
      'success'
    );
  };
  
  const handleExecuteWorkflow = async () => {
    setIsExecuting(true);
    setExecutionResults(null);
    
    // Simulate workflow execution with animations
    const nodes = [...config.workflow.nodes];
    const results = {};
    
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      
      // Update node status to running
      let updatedNodes = config.workflow.nodes.map(n => 
        n.id === node.id ? { ...n, data: { ...n.data, status: 'running' } } : n
      );
      
      // Animate edges
      let updatedEdges = config.workflow.edges.map(e => ({
        ...e,
        animated: e.target === node.id
      }));
      
      onUpdate({
        ...config,
        workflow: { ...config.workflow, nodes: updatedNodes, edges: updatedEdges }
      });
      
      // Simulate node execution
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock result for the node
      if (node.type === 'api' || node.type === 'graphql') {
        results[node.id] = {
          status: 'success',
          data: {
            temperature: 22,
            location: { name: 'New York', country: 'USA' },
            forecast: [
              { day: 'Today', temp: 22, condition: 'Sunny' },
              { day: 'Tomorrow', temp: 20, condition: 'Cloudy' }
            ]
          },
          responseTime: Math.floor(Math.random() * 300) + 100
        };
      } else if (node.type === 'transform') {
        results[node.id] = {
          status: 'success',
          data: {
            temperature: 22,
            loc_name: 'New York',
            loc_country: 'USA'
          },
          transformations: node.data.transformations?.length || 0
        };
      }
      
      // Update node status to completed
      const completedNodes = updatedNodes.map(n => 
        n.id === node.id ? { ...n, data: { ...n.data, status: 'completed' } } : n
      );
      
      onUpdate({
        ...config,
        workflow: { ...config.workflow, nodes: completedNodes, edges: updatedEdges }
      });
    }
    
    // Reset animations and statuses
    setTimeout(() => {
      const resetNodes = config.workflow.nodes.map(n => ({
        ...n,
        data: { ...n.data, status: 'idle' }
      }));
      const resetEdges = config.workflow.edges.map(e => ({
        ...e,
        animated: false
      }));
      
      onUpdate({
        ...config,
        workflow: { ...config.workflow, nodes: resetNodes, edges: resetEdges }
      });
    }, 2000);
    
    setExecutionResults(results);
    setIsExecuting(false);
    showToast('Workflow executed successfully', 'success');
  };
  
  const handlePromoteEnvironment = (fromEnv, toEnv) => {
    const updatedConfig = {
      ...config,
      environments: {
        ...config.environments,
        [toEnv]: {
          ...config.environments[fromEnv],
          promoted: true,
          lastPromotion: new Date().toISOString(),
          promotedFrom: fromEnv
        }
      }
    };
    onUpdate(updatedConfig);
    setShowPromoteModal(false);
    showToast(`Configuration promoted from ${fromEnv.toUpperCase()} to ${toEnv.toUpperCase()}`, 'success');
  };

  const isPublished = config.status === 'published';

  return (
    <div className={`flex flex-col h-full ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Studio Header */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-2`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onExit}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
            <div>
              <input
                type="text"
                value={config.name}
                onChange={(e) => onUpdate({ ...config, name: e.target.value })}
                className={`text-md font-semibold bg-transparent border-none outline-none ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              />
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Last modified {new Date(config.modifiedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowJsonEditor(!showJsonEditor)}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                showJsonEditor
                  ? theme === 'dark' 
                    ? 'bg-gray-700 text-blue-400' 
                    : 'bg-gray-100 text-blue-600'
                  : theme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-700'
              } border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}
            >
              <Braces className="w-4 h-4" />
              JSON View
            </button>
            
            <div className="relative group">
              <button
                onClick={() => isPublished && setShowPromoteModal(true)}
                disabled={!isPublished}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors border ${
                  theme === 'dark' 
                    ? 'border-gray-600 text-gray-300' 
                    : 'border-gray-300 text-gray-700'
                } disabled:cursor-not-allowed disabled:opacity-50 ${isPublished ? (theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100') : ''}`}
              >
                <GitMerge className="w-4 h-4" />
                Promote
              </button>
              {!isPublished && (
                <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 text-xs text-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-800'}`}>
                  Publish to enable and promote
                  <div className={`absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 ${theme === 'dark' ? 'border-t-gray-600' : 'border-t-gray-800'}`}></div>
                </div>
              )}
            </div>
            
            <button
              onClick={handleExecuteWorkflow}
              disabled={isExecuting}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Execute
                </>
              )}
            </button>
            
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            
            <button
              onClick={handlePublish}
              disabled={environment === 'uat' || environment === 'prod'}
              title={ (environment === 'uat' || environment === 'prod') ? "Publishing is disabled in this environment" : (config.status === 'published' ? 'Unpublish API' : 'Publish API') }
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed ${
                config.status === 'published'
                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
              }`}
            >
              {config.status === 'published' ? (
                <>
                  <CloudOff className="w-4 h-4" />
                  Unpublish
                </>
              ) : (
                <>
                  <Cloud className="w-4 h-4" />
                  Publish
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        <WorkflowDesigner
          config={config}
          onUpdate={onUpdate}
          environment={environment}
          theme={theme}
          executionResults={executionResults}
          onCloseExecutionResults={() => setExecutionResults(null)}
          testInputs={testInputs}
          onUpdateTestInputs={setTestInputs}
          showToast={showToast}
        />
      </div>
      
      {/* Modals rendered on top */}
      {showJsonEditor && (
        <JsonEditor
          config={config}
          theme={theme}
          onClose={() => setShowJsonEditor(false)}
        />
      )}
      
      {showPromoteModal && (
        <PromoteModal
          config={config}
          onPromote={handlePromoteEnvironment}
          onClose={() => setShowPromoteModal(false)}
          theme={theme}
        />
      )}
      
      {showPublishModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-full ${
                config.status === 'published' 
                  ? 'bg-orange-100' 
                  : 'bg-purple-100'
              }`}>
                {config.status === 'published' ? (
                  <CloudOff className="w-6 h-6 text-orange-600" />
                ) : (
                  <Cloud className="w-6 h-6 text-purple-600" />
                )}
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {config.status === 'published' ? 'Unpublish API' : 'Publish API'}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {config.status === 'published' 
                    ? 'Make this API unavailable for use'
                    : 'Make this API available for use'}
                </p>
              </div>
            </div>
            
            <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {config.status === 'published' 
                ? 'Are you sure you want to unpublish this API? It will no longer be available for execution in production environments.'
                : 'Are you sure you want to publish this API? It will become available for execution in all environments.'}
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowPublishModal(false)}
                className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={confirmPublish}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors text-white ${
                  config.status === 'published'
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {config.status === 'published' ? 'Unpublish' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Workflow Designer Component
const WorkflowDesigner = ({ config, onUpdate, environment, theme, executionResults, onCloseExecutionResults, testInputs, onUpdateTestInputs, showToast }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [draggingNode, setDraggingNode] = useState(null);
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [view, setView] = useState({ x: 0, y: 0, zoom: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  
  const nodeTypes = [
    { type: 'api', label: 'REST API', icon: Globe, color: 'blue', description: 'Call REST endpoints' },
    { type: 'graphql', label: 'GraphQL', icon: Cpu, color: 'purple', description: 'Execute GraphQL queries' },
    { type: 'transform', label: 'Transform', icon: GitBranch, color: 'green', description: 'Transform data structure' },
    { type: 'filter', label: 'Filter', icon: Filter, color: 'orange', description: 'Filter data based on conditions' },
    { type: 'aggregate', label: 'Aggregate', icon: Database, color: 'red', description: 'Aggregate and combine data' },
    { type: 'condition', label: 'Condition', icon: Diamond, color: 'yellow', description: 'Conditional branching' }
  ];

  const handleZoom = (direction, factor = 0.1) => {
    setView(prev => {
        const newZoom = direction === 'in' ? prev.zoom * (1 + factor) : prev.zoom * (1 - factor);
        return { ...prev, zoom: Math.max(0.2, Math.min(2, newZoom)) };
    });
  };

  const handleFitToScreen = () => {
    if (!canvasRef.current || config.workflow.nodes.length === 0) {
        setView({ x: 0, y: 0, zoom: 1 });
        return;
    }

    const nodes = config.workflow.nodes;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(node => {
        minX = Math.min(minX, node.position.x);
        minY = Math.min(minY, node.position.y);
        maxX = Math.max(maxX, node.position.x + 180); // node width
        maxY = Math.max(maxY, node.position.y + 60);  // node height
    });

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    if (contentWidth <= 0 || contentHeight <= 0) return;

    const padding = 100;
    const zoomX = (canvasRect.width - padding) / contentWidth;
    const zoomY = (canvasRect.height - padding) / contentHeight;
    const newZoom = Math.min(zoomX, zoomY, 1.5); // Cap max zoom

    const newX = (canvasRect.width - contentWidth * newZoom) / 2 - minX * newZoom;
    const newY = (canvasRect.height - contentHeight * newZoom) / 2 - minY * newZoom;

    setView({ x: newX, y: newY, zoom: newZoom });
  };
  
  const handleDragStart = (e, nodeType) => {
    e.dataTransfer.setData('nodeType', nodeType.type);
    e.dataTransfer.effectAllowed = 'copy';
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    const nodeType = e.dataTransfer.getData('nodeType');
    if (!nodeType || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - view.x) / view.zoom;
    const y = (e.clientY - rect.top - view.y) / view.zoom;
    
    const newNode = {
      id: `${nodeType}_${Date.now()}`,
      type: nodeType,
      position: { x: x - 90, y: y - 30 }, // Adjust for node half-width/height
      data: {
        label: nodeTypes.find(n => n.type === nodeType)?.label || nodeType,
        status: 'idle'
      }
    };
    
    const updatedConfig = {
      ...config,
      workflow: {
        ...config.workflow,
        nodes: [...config.workflow.nodes, newNode]
      }
    };
    
    onUpdate(updatedConfig);
    setSelectedNode(newNode);
    showToast('Node added to workflow', 'success');
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };
  
  const handleNodeDragStart = (nodeId, e) => {
    const node = config.workflow.nodes.find(n => n.id === nodeId);
    if (!node || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    setDraggingNode({
      id: nodeId,
      offsetX: (e.clientX - rect.left - view.x) / view.zoom - node.position.x,
      offsetY: (e.clientY - rect.top - view.y) / view.zoom - node.position.y
    });
  };
  
  const handleCanvasMouseDown = (e) => {
    // Only pan if clicking on the background, not on a node or action
    if (e.target === e.currentTarget) {
      setIsPanning(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = useCallback((e) => {
    if (isPanning) {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      setView(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }

    if (draggingNode && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - view.x) / view.zoom - draggingNode.offsetX;
      const y = (e.clientY - rect.top - view.y) / view.zoom - draggingNode.offsetY;
      
      const updatedNodes = config.workflow.nodes.map(node => 
        node.id === draggingNode.id 
          ? { ...node, position: { x, y } }
          : node
      );
      
      onUpdate({
        ...config,
        workflow: {
          ...config.workflow,
          nodes: updatedNodes
        }
      });
    }
    
    if (connectingFrom && canvasRef.current) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        setConnectingFrom({
          ...connectingFrom,
          mouseX: e.clientX - rect.left,
          mouseY: e.clientY - rect.top
        });
      }
    }
  }, [draggingNode, isPanning, lastMousePos, view, connectingFrom, config, onUpdate]);
  
  const handleMouseUp = useCallback(() => {
    setDraggingNode(null);
    setIsPanning(false);
    setConnectingFrom(null);
  }, []);

  const handleWheel = (e) => {
    if (e.deltaY > 0) {
        handleZoom('out');
    } else {
        handleZoom('in');
    }
  };
  
  const handleNodeConnect = (fromNodeId, toNodeId) => {
    if (fromNodeId === toNodeId) return;
    
    const existingEdge = config.workflow.edges.find(
      e => e.source === fromNodeId && e.target === toNodeId
    );
    
    if (existingEdge) {
      showToast('Connection already exists', 'warning');
      return;
    }
    
    const newEdge = {
      id: `edge_${Date.now()}`,
      source: fromNodeId,
      target: toNodeId,
      animated: false
    };
    
    onUpdate({
      ...config,
      workflow: {
        ...config.workflow,
        edges: [...config.workflow.edges, newEdge]
      }
    });
    
    setConnectingFrom(null);
    showToast('Nodes connected', 'success');
  };
  
  const handleDeleteNode = (nodeId) => {
    const updatedNodes = config.workflow.nodes.filter(n => n.id !== nodeId);
    const updatedEdges = config.workflow.edges.filter(
      e => e.source !== nodeId && e.target !== nodeId
    );
    
    onUpdate({
      ...config,
      workflow: {
        nodes: updatedNodes,
        edges: updatedEdges
      }
    });
    
    setSelectedNode(null);
    showToast('Node deleted', 'success');
  };
  
  const handleDeleteEdge = (edgeId) => {
    const updatedEdges = config.workflow.edges.filter(e => e.id !== edgeId);
    
    onUpdate({
      ...config,
      workflow: {
        ...config.workflow,
        edges: updatedEdges
      }
    });
    
    showToast('Connection removed', 'success');
  };
  
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);
  
  return (
    <div className="flex h-full">
      {/* Node Library */}
      <div className={`w-56 border-r p-2 ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <h3 className={`font-semibold mb-2 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <Boxes className="w-5 h-5" />
          Components
        </h3>
        <div className="space-y-1">
          {nodeTypes.map(nodeType => (
            <div
              key={nodeType.type}
              draggable
              onDragStart={(e) => handleDragStart(e, nodeType)}
              className={`p-2 rounded-lg cursor-move transition-all hover:scale-105 ${
                theme === 'dark' 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg bg-${nodeType.color}-500 bg-opacity-20`}>
                  <nodeType.icon className={`w-4 h-4 text-${nodeType.color}-500`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{nodeType.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Test Panel Toggle */}
        <div className="mt-4">
          <button
            onClick={() => setShowTestPanel(!showTestPanel)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
              showTestPanel
                ? theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                : theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <PlayCircle className="w-4 h-4" />
              Test Inputs
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showTestPanel ? 'rotate-180' : ''}`} />
          </button>
          
          {showTestPanel && (
            <div className={`mt-2 p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="space-y-2">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    City (for weather API)
                  </label>
                  <input
                    type="text"
                    value={testInputs.city || ''}
                    onChange={(e) => onUpdateTestInputs({ ...testInputs, city: e.target.value })}
                    placeholder="e.g., London"
                    className={`w-full px-2 py-1 rounded border text-sm ${
                      theme === 'dark' 
                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 placeholder-gray-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    User ID (for GraphQL)
                  </label>
                  <input
                    type="text"
                    value={testInputs.userId || ''}
                    onChange={(e) => onUpdateTestInputs({ ...testInputs, userId: e.target.value })}
                    placeholder="e.g., user123"
                    className={`w-full px-2 py-1 rounded border text-sm ${
                      theme === 'dark' 
                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Canvas */}
      <div className="flex-1 flex">
        <div 
            className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
            ref={canvasRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onMouseDown={handleCanvasMouseDown}
            onWheel={handleWheel}
        >
          <div
            className={`absolute inset-0 ${
              theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
            }`}
            style={{
              backgroundImage: `radial-gradient(${
                theme === 'dark' ? '#374151' : '#e5e7eb'
              } 1px, transparent 1px)`,
              backgroundSize: `${20 * view.zoom}px ${20 * view.zoom}px`,
              backgroundPosition: `${view.x}px ${view.y}px`,
              transition: 'background-position 0.1s linear'
            }}
          >
            <div
                className="transition-transform duration-100"
                style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`, transformOrigin: 'top left' }}
            >
                {/* Render edges */}
                <svg className="absolute inset-0 pointer-events-none w-full h-full" style={{width: '10000px', height: '10000px'}}>
                  {config.workflow.edges.map(edge => {
                    const sourceNode = config.workflow.nodes.find(n => n.id === edge.source);
                    const targetNode = config.workflow.nodes.find(n => n.id === edge.target);
                    
                    if (!sourceNode || !targetNode) return null;
                    
                    const sourceX = sourceNode.position.x + 180;
                    const sourceY = sourceNode.position.y + 30;
                    const targetX = targetNode.position.x;
                    const targetY = targetNode.position.y + 30;
                    
                    const midX = (sourceX + targetX) / 2;
                    
                    return (
                      <g key={edge.id}>
                        <path
                          d={`M ${sourceX} ${sourceY} C ${midX} ${sourceY}, ${midX} ${targetY}, ${targetX} ${targetY}`}
                          fill="none"
                          stroke={theme === 'dark' ? '#4b5563' : '#9ca3af'}
                          strokeWidth="2"
                          className={edge.animated ? 'animate-flow' : ''}
                        />
                        <g
                          className="cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteEdge(edge.id)}
                          style={{ pointerEvents: 'auto' }}
                        >
                          <circle cx={midX} cy={(sourceY + targetY) / 2} r="10" fill={theme === 'dark' ? '#374151' : '#f3f4f6'}/>
                          <X className="w-3 h-3 text-red-500" style={{transform: `translate(${midX - 6}px, ${(sourceY + targetY) / 2 - 6}px)`}}/>
                        </g>
                      </g>
                    );
                  })}
                   {connectingFrom && (
                    <path
                        d={`M ${connectingFrom.x} ${connectingFrom.y} L ${connectingFrom.mouseX} ${connectingFrom.mouseY}`}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                    />
                  )}
                </svg>
                
                {/* Render nodes */}
                {config.workflow.nodes.map(node => {
                  const nodeType = nodeTypes.find(n => n.type === node.type);
                  const Icon = nodeType?.icon || Package;
                  const isRunning = node.data.status === 'running';
                  const isCompleted = node.data.status === 'completed';
                  const nodeResult = executionResults?.[node.id];
                  
                  return (
                    <div
                      key={node.id}
                      className={`absolute rounded-lg shadow-md border-2 transition-all ${
                        selectedNode?.id === node.id 
                          ? 'border-blue-500 shadow-lg scale-105' 
                          : theme === 'dark' 
                            ? 'border-gray-600 hover:border-gray-500' 
                            : 'border-gray-200 hover:border-gray-300'
                      } ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} ${
                        isRunning ? 'animate-pulse' : ''
                      }`}
                      style={{
                        left: `${node.position.x}px`,
                        top: `${node.position.y}px`,
                        width: '180px'
                      }}
                      onMouseDown={(e) => {
                        if (!e.target.closest('.node-action')) {
                          setSelectedNode(node);
                          handleNodeDragStart(node.id, e);
                        }
                      }}
                      onMouseUp={(e) => {
                        if (connectingFrom && connectingFrom.nodeId !== node.id) {
                            handleNodeConnect(connectingFrom.nodeId, node.id);
                        }
                      }}
                    >
                      {/* Node Header */}
                      <div className={`px-3 py-2 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`p-1 rounded bg-gradient-to-br from-${nodeType?.color}-500/20 to-transparent`}>
                              <Icon className={`w-4 h-4 text-${nodeType?.color}-500`} />
                            </div>
                            <span className={`font-medium text-sm truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {node.data.label}
                            </span>
                          </div>
                          
                          {/* Node Actions */}
                          {node.type !== 'start' && node.type !== 'end' && (
                            <button
                              className={`node-action p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 transition-colors`}
                              onClick={() => handleDeleteNode(node.id)}
                            >
                              <X className="w-3 h-3 text-red-500" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Node Content */}
                      <div className="px-3 py-2 text-xs">
                         {node.type === 'start' && <p className="text-gray-400">Workflow starts here</p>}
                         {node.type === 'end' && <p className="text-gray-400">Workflow ends here</p>}
                        {node.data.endpoint && (
                          <p className={`truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {node.data.method || ''} {node.data.endpoint}
                          </p>
                        )}
                        {node.data.transformations && (
                          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {node.data.transformations.length} transformations
                          </p>
                        )}
                        
                        {nodeResult && (
                          <div className={`mt-2 p-1 rounded text-xs ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                          }`}>
                            <p className={`font-medium ${nodeResult.status === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                              {nodeResult.status === 'success' ? '✓ Success' : '✗ Failed'}
                            </p>
                            {nodeResult.responseTime && (
                              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                {nodeResult.responseTime}ms
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Connection Points */}
                      {node.type !== 'end' && (
                        <div
                          className={`absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full border-2 cursor-crosshair
                            ${connectingFrom?.nodeId === node.id
                              ? 'bg-blue-500 border-blue-600'
                              : theme === 'dark' 
                                ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                                : 'bg-white border-gray-300 hover:bg-gray-100'
                            } transition-all hover:scale-125 node-action`}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            const rect = canvasRef.current?.getBoundingClientRect();
                            if (rect) {
                              setConnectingFrom({
                                nodeId: node.id,
                                x: (node.position.x + 180) * view.zoom + view.x,
                                y: (node.position.y + 30) * view.zoom + view.y,
                                mouseX: e.clientX,
                                mouseY: e.clientY
                              });
                            }
                          }}
                        />
                      )}
                      
                      {node.type !== 'start' && (
                        <div
                          className={`absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full border-2 
                            ${theme === 'dark' 
                              ? 'bg-gray-700 border-gray-600' 
                              : 'bg-white border-gray-300'
                            } node-action`}
                          onMouseUp={(e) => {
                            e.stopPropagation();
                            if (connectingFrom && connectingFrom.nodeId !== node.id) {
                              handleNodeConnect(connectingFrom.nodeId, node.id);
                            }
                          }}
                        />
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
           {/* Zoom Controls */}
           <div className="absolute bottom-4 right-4 flex items-center gap-1">
                <button onClick={() => handleZoom('out')} className={`p-2 rounded-lg shadow-md transition-colors ${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-600 hover:bg-gray-100'}`}><ZoomOut className="w-5 h-5" /></button>
                <button onClick={handleFitToScreen} className={`p-2 rounded-lg shadow-md transition-colors ${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-600 hover:bg-gray-100'}`}><Maximize2 className="w-5 h-5" /></button>
                <button onClick={() => handleZoom('in')} className={`p-2 rounded-lg shadow-md transition-colors ${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-600 hover:bg-gray-100'}`}><ZoomIn className="w-5 h-5" /></button>
            </div>
        </div>
        
        {/* Properties Panel */}
        {selectedNode && selectedNode.type !== 'start' && selectedNode.type !== 'end' && (
          <NodePropertiesPanel
            node={selectedNode}
            onUpdate={(updatedNode) => {
              const updatedNodes = config.workflow.nodes.map(n =>
                n.id === updatedNode.id ? updatedNode : n
              );
              onUpdate({
                ...config,
                workflow: {
                  ...config.workflow,
                  nodes: updatedNodes
                }
              });
            }}
            onClose={() => setSelectedNode(null)}
            theme={theme}
            showToast={showToast}
            config={config}
          />
        )}
        
        {/* Execution Results Panel */}
        {executionResults && (
          <ExecutionResultsPanel
            results={executionResults}
            onClose={onCloseExecutionResults}
            theme={theme}
          />
        )}
      </div>
    </div>
  );
};

// Enhanced Node Properties Panel
const NodePropertiesPanel = ({ node, onUpdate, onClose, theme, showToast, config }) => {
  const [testResponse, setTestResponse] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [activeTab, setActiveTab] = useState('config');

  const handleTestApi = async () => {
    setIsTesting(true);
    
    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockResponse = {
      status: 200,
      data: {
        current: {
          temp_c: 22,
          condition: { text: 'Sunny' },
          humidity: 65
        },
        location: {
          name: 'London',
          country: 'United Kingdom',
          lat: 51.52,
          lon: -0.11
        },
        forecast: {
          forecastday: [
            { date: '2024-01-20', day: { maxtemp_c: 23, mintemp_c: 15 } },
            { date: '2024-01-21', day: { maxtemp_c: 21, mintemp_c: 14 } }
          ]
        }
      }
    };
    
    setTestResponse(mockResponse);
    setIsTesting(false);
    showToast('API test successful', 'success');
    
    // Auto-detect schema
    if (node.type === 'api' || node.type === 'graphql') {
      onUpdate({
        ...node,
        data: {
          ...node.data,
          responseSchema: extractSchema(mockResponse.data)
        }
      });
    }
  };
  
  const extractSchema = (data, path = '') => {
    const schema = {};
    for (const [key, value] of Object.entries(data)) {
        const newPath = path ? `${path}.${key}` : key;
        const type = Array.isArray(value) ? 'array' : typeof value;

        if (type === 'object' && value !== null && !Array.isArray(value)) {
            Object.assign(schema, extractSchema(value, newPath));
        } else {
            schema[newPath] = { type };
        }
    }
    return schema;
  };
  
  const addTransformation = (type) => {
    const transformations = node.data.transformations || [];
    const newTransformation = {
      id: `transform_${Date.now()}`,
      type,
      config: {}
    };
    
    switch (type) {
      case 'rename':
        newTransformation.config = { from: '', to: '' };
        break;
      case 'flatten':
        newTransformation.config = { path: '', prefix: '' };
        break;
      case 'nest':
        newTransformation.config = { fields: [], as: '' };
        break;
      case 'filter':
        newTransformation.config = { condition: '' };
        break;
      case 'compute':
        newTransformation.config = { field: '', expression: '' };
        break;
      default:
        break;
    }
    
    onUpdate({
      ...node,
      data: {
        ...node.data,
        transformations: [...transformations, newTransformation]
      }
    });
  };
  
  const updateTransformation = (transformId, config) => {
    const transformations = node.data.transformations || [];
    const updated = transformations.map(t => 
      t.id === transformId ? { ...t, config } : t
    );
    
    onUpdate({
      ...node,
      data: {
        ...node.data,
        transformations: updated
      }
    });
  };
  
  const removeTransformation = (transformId) => {
    const transformations = node.data.transformations || [];
    const updated = transformations.filter(t => t.id !== transformId);
    
    onUpdate({
      ...node,
      data: {
        ...node.data,
        transformations: updated
      }
    });
  };

  const getSourceSchemaForTransform = () => {
    const incomingEdges = config.workflow.edges.filter(e => e.target === node.id);
    if (incomingEdges.length === 0) return {};

    const sourceNodeId = incomingEdges[0].source;
    const sourceNode = config.workflow.nodes.find(n => n.id === sourceNodeId);

    if (sourceNode?.data?.responseSchema) {
        return sourceNode.data.responseSchema;
    }
    
    // Fallback for demo
    return {
        "current.temp_c": { type: "number" },
        "current.condition.text": { type: "string" },
        "location.name": { type: "string" },
        "location.country": { type: "string" },
    };
  };
  
  return (
    <div className={`w-96 border-l ${
      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } overflow-y-auto`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Node Properties
          </h3>
          <button
            onClick={onClose}
            className={`p-1 rounded transition-colors ${
              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
        </div>
        
        {node.type === 'transform' && (
            <div className={`flex border-b mb-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button onClick={() => setActiveTab('config')} className={`flex-1 px-4 py-2 text-sm font-medium text-center ${activeTab === 'config' ? 'border-b-2 border-blue-500 text-blue-500' : (theme === 'dark' ? 'text-gray-400' : 'text-gray-500')}`}>Manual Config</button>
                <button onClick={() => setActiveTab('mapper')} className={`flex-1 px-4 py-2 text-sm font-medium text-center ${activeTab === 'mapper' ? 'border-b-2 border-blue-500 text-blue-500' : (theme === 'dark' ? 'text-gray-400' : 'text-gray-500')}`}>Schema Mapper</button>
            </div>
        )}

        {activeTab === 'mapper' && node.type === 'transform' ? (
            <SchemaMapper
                sourceSchema={getSourceSchemaForTransform()}
                targetSchema={{
                    "temperature": { type: "number" },
                    "condition": { type: "string" },
                    "city": { type: "string" },
                    "nation": { type: "string" },
                }}
                mappings={node.data.mappings || {}}
                onUpdateMappings={(newMappings) => onUpdate({ ...node, data: { ...node.data, mappings: newMappings }})}
                theme={theme}
            />
        ) : (
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Node Name
            </label>
            <input
              type="text"
              value={node.data.label || ''}
              onChange={(e) => onUpdate({
                ...node,
                data: { ...node.data, label: e.target.value }
              })}
              className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
              }`}
            />
          </div>
          
          {/* API/GraphQL Configuration */}
          {(node.type === 'api' || node.type === 'graphql') && (
            <>
              {node.type === 'api' && (
                <>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Method
                    </label>
                    <select
                      value={node.data.method || 'GET'}
                      onChange={(e) => onUpdate({
                        ...node,
                        data: { ...node.data, method: e.target.value }
                      })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="PATCH">PATCH</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Endpoint URL
                    </label>
                    <input
                      type="text"
                      value={node.data.endpoint || ''}
                      onChange={(e) => onUpdate({
                        ...node,
                        data: { ...node.data, endpoint: e.target.value }
                      })}
                      placeholder="https://api.example.com/data"
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </>
              )}
              
              {node.type === 'graphql' && (
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    GraphQL Query
                  </label>
                  <textarea
                    value={node.data.query || ''}
                    onChange={(e) => onUpdate({
                      ...node,
                      data: { ...node.data, query: e.target.value }
                    })}
                    placeholder="query GetData { ... }"
                    rows={6}
                    className={`w-full px-3 py-2 rounded-lg border font-mono text-sm ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              )}
              
              {/* Authentication */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Authentication
                </label>
                <select
                  value={node.data.authentication?.type || 'none'}
                  onChange={(e) => onUpdate({
                    ...node,
                    data: { 
                      ...node.data, 
                      authentication: { 
                        ...node.data.authentication,
                        type: e.target.value 
                      }
                    }
                  })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="none">None</option>
                  <option value="apiKey">API Key</option>
                  <option value="bearer">Bearer Token</option>
                  <option value="oauth2">OAuth 2.0</option>
                </select>
              </div>
              
              {/* Test API Button */}
              <button
                onClick={handleTestApi}
                disabled={isTesting}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isTesting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4" />
                    Test & Fetch Schema
                  </>
                )}
              </button>
              
              {/* Test Response */}
              {testResponse && (
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-500">
                      ✓ Response {testResponse.status}
                    </span>
                    <button
                      onClick={() => setTestResponse(null)}
                      className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      Clear
                    </button>
                  </div>
                  <pre className={`text-xs overflow-x-auto ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {JSON.stringify(testResponse.data, null, 2)}
                  </pre>
                </div>
              )}
            </>
          )}
          
          {/* Transform Configuration */}
          {node.type === 'transform' && (
            <>
              <div className="flex items-center justify-between">
                <h4 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Transformations
                </h4>
                <div className="relative">
                    <button
                        onClick={() => {
                            const menu = document.getElementById(`transform-menu-${node.id}`);
                            menu.classList.toggle('hidden');
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                            theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                        }`}
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                    {/* Transformation Type Menu */}
                    <div
                        id={`transform-menu-${node.id}`}
                        className={`hidden absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-50 ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                        }`}
                    >
                        <button onClick={() => { addTransformation('rename'); document.getElementById(`transform-menu-${node.id}`).classList.add('hidden'); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-opacity-10 hover:bg-blue-500 ${ theme === 'dark' ? 'text-gray-300' : 'text-gray-700' }`}><Type className="w-4 h-4 inline mr-2" />Rename Field</button>
                        <button onClick={() => { addTransformation('flatten'); document.getElementById(`transform-menu-${node.id}`).classList.add('hidden'); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-opacity-10 hover:bg-blue-500 ${ theme === 'dark' ? 'text-gray-300' : 'text-gray-700' }`}><Minimize2 className="w-4 h-4 inline mr-2" />Flatten</button>
                        <button onClick={() => { addTransformation('nest'); document.getElementById(`transform-menu-${node.id}`).classList.add('hidden'); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-opacity-10 hover:bg-blue-500 ${ theme === 'dark' ? 'text-gray-300' : 'text-gray-700' }`}><Boxes className="w-4 h-4 inline mr-2" />Nest Fields</button>
                        <button onClick={() => { addTransformation('filter'); document.getElementById(`transform-menu-${node.id}`).classList.add('hidden'); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-opacity-10 hover:bg-blue-500 ${ theme === 'dark' ? 'text-gray-300' : 'text-gray-700' }`}><Filter className="w-4 h-4 inline mr-2" />Filter</button>
                        <button onClick={() => { addTransformation('compute'); document.getElementById(`transform-menu-${node.id}`).classList.add('hidden'); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-opacity-10 hover:bg-blue-500 ${ theme === 'dark' ? 'text-gray-300' : 'text-gray-700' }`}><Hash className="w-4 h-4 inline mr-2" />Compute Field</button>
                    </div>
                </div>
              </div>
              <div className="space-y-2 mt-2">
                {(node.data.transformations || []).map((transform) => (
                  <div
                    key={transform.id}
                    className={`p-3 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {transform.type.charAt(0).toUpperCase() + transform.type.slice(1)}
                      </span>
                      <button
                        onClick={() => removeTransformation(transform.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Transformation Config */}
                    {transform.type === 'rename' && (
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" placeholder="From field" value={transform.config.from || ''} onChange={(e) => updateTransformation(transform.id, { ...transform.config, from: e.target.value })} className={`px-2 py-1 text-sm rounded border ${ theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300' }`} />
                        <input type="text" placeholder="To field" value={transform.config.to || ''} onChange={(e) => updateTransformation(transform.id, { ...transform.config, to: e.target.value })} className={`px-2 py-1 text-sm rounded border ${ theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300' }`} />
                      </div>
                    )}
                    
                    {transform.type === 'filter' && (
                      <input type="text" placeholder="Condition (e.g., value > 10)" value={transform.config.condition || ''} onChange={(e) => updateTransformation(transform.id, { ...transform.config, condition: e.target.value })} className={`w-full px-2 py-1 text-sm rounded border ${ theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300' }`} />
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Filter Configuration */}
          {node.type === 'filter' && (
            <div>
                <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                Filter Condition
                </label>
                <textarea
                value={node.data.filterCondition || ''}
                onChange={(e) => onUpdate({
                    ...node,
                    data: { ...node.data, filterCondition: e.target.value }
                })}
                placeholder="e.g., item.price > 100 && item.category === 'electronics'"
                rows={3}
                className={`w-full px-3 py-2 rounded-lg border font-mono text-sm ${
                    theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300'
                }`}
                />
            </div>
            )}
            
            {/* Aggregate Configuration */}
            {node.type === 'aggregate' && (
            <>
                <div>
                <label className={`block text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                    Aggregation Type
                </label>
                <select
                    value={node.data.aggregationType || 'merge'}
                    onChange={(e) => onUpdate({
                    ...node,
                    data: { ...node.data, aggregationType: e.target.value }
                    })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300'
                    }`}
                >
                    <option value="merge">Merge Objects</option>
                    <option value="concat">Concatenate Arrays</option>
                    <option value="sum">Sum Values</option>
                    <option value="average">Average Values</option>
                    <option value="count">Count Items</option>
                    <option value="group">Group By Field</option>
                </select>
                </div>
            </>
            )}

        </div>
        )}
      </div>
    </div>
  );
};


// --- MAIN APP COMPONENT ---

const App = () => {
  const [configs, setConfigs] = useState([]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [environment, setEnvironment] = useState('dev');
  const [theme, setTheme] = useState('light');
  const [searchTerm, setSearchTerm] = useState('');
  const [persona, setPersona] = useState('builder'); // 'builder' or 'subscriber'
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'API deployment successful', time: '5 min ago', read: false, type: 'success' },
    { id: 2, message: 'New subscriber added', time: '1 hour ago', read: false, type: 'info' },
    { id: 3, message: 'Test suite completed', time: '2 hours ago', read: true, type: 'success' }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Add CSS for animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes flow {
        0% { stroke-dashoffset: 0; }
        100% { stroke-dashoffset: -20; }
      }
      .animate-flow {
        stroke-dasharray: 5,5;
        animation: flow 1s linear infinite;
      }
      @keyframes slide-up {
        from { transform: translateY(100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .animate-slide-up {
        animation: slide-up 0.3s ease-out;
      }
      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  
  useEffect(() => {
    setLoading(true);
    // Load theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    
    // Initialize with demo configs
    const demoConfigs = [
       {
        id: 'api_demo_1',
        name: 'Weather Data Pipeline',
        description: 'Fetches weather data and transforms it for dashboard display.',
        version: '1.0.0',
        status: 'published',
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        category: 'External APIs',
        tags: ['weather', 'rest', 'transform'],
        inputSchema: { 
            city: { type: "string", required: true, description: "The city name for the weather forecast.", example: "London" },
            unit: { type: "string", required: false, description: "Temperature unit (celsius or fahrenheit).", example: "celsius" } 
        },
        outputSchema: { 
            temperature: { type: "number", description: "The current temperature." },
            condition: { type: "string", description: "The current weather condition." },
            unit: { type: "string", description: "The unit of temperature."}
        },
        workflow: {
          nodes: [
            { id: 'start_1', type: 'start', position: { x: 100, y: 200 }, data: { label: 'Start', status: 'idle' } },
            { id: 'api_1', type: 'api', position: { x: 300, y: 200 }, data: { label: 'Fetch Weather', apiType: 'REST', method: 'GET', endpoint: 'https://api.weatherapi.com/v1/forecast.json', headers: { 'X-API-Key': '{{WEATHER_API_KEY}}' }, queryParams: { q: '{{city}}', days: '3' }, authentication: { type: 'apiKey', keyLocation: 'header', keyName: 'X-API-Key' }, timeout: 5000, retries: 3, status: 'idle' } },
            { id: 'transform_1', type: 'transform', position: { x: 500, y: 200 }, data: { label: 'Transform Data', transformType: 'custom', transformations: [ { type: 'rename', from: 'current.temp_c', to: 'temperature' }, { type: 'flatten', path: 'location', prefix: 'loc_' }, { type: 'filter', condition: 'temperature > 0' } ], status: 'idle' } },
            { id: 'end_1', type: 'end', position: { x: 700, y: 200 }, data: { label: 'End', status: 'idle' } }
          ],
          edges: [
            { id: 'e1', source: 'start_1', target: 'api_1', animated: false },
            { id: 'e2', source: 'api_1', target: 'transform_1', animated: false },
            { id: 'e3', source: 'transform_1', target: 'end_1', animated: false }
          ]
        },
        
        environments: {
          dev: { active: true, variables: { WEATHER_API_KEY: 'dev_key_12345', BASE_URL: 'https://api-dev.weatherapi.com' }, promoted: false, lastDeployment: new Date().toISOString() },
          qa: { active: false, variables: { WEATHER_API_KEY: 'qa_key_67890', BASE_URL: 'https://api-qa.weatherapi.com' }, promoted: false },
          uat: { active: false, variables: {}, promoted: false },
          prod: { active: false, variables: {}, promoted: false }
        },
        
        testSuites: [
          { id: 'test_1', name: 'Basic Weather Test', description: 'Tests weather API with sample cities', testCases: [ { id: 'tc_1', name: 'London Weather', input: { city: 'London' }, expectedOutput: { temperature: 15, loc_name: 'London' }, status: 'passed', lastRun: new Date().toISOString() }, { id: 'tc_2', name: 'New York Weather', input: { city: 'New York' }, expectedOutput: { temperature: 22, loc_name: 'New York' }, status: 'passed', lastRun: new Date().toISOString() } ] }
        ],
        
        metrics: {
          executions: { total: 15234, successful: 15180, failed: 54 },
          performance: { avgResponseTime: 245, p95ResponseTime: 380, p99ResponseTime: 520 },
          reliability: { successRate: 99.6, uptime: 99.9 }
        }
      },
      {
        id: 'api_demo_2',
        name: 'User Data Aggregator',
        description: 'Combines user data from multiple sources with advanced transformations.',
        version: '2.1.0',
        status: 'draft',
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        category: 'Data Processing',
        tags: ['graphql', 'aggregation', 'multi-api'],
        inputSchema: { userId: {type: "string", required: true, description: "The ID of the user to fetch.", example: "user-123"} },
        outputSchema: { userData: {type: "object", description: "Aggregated user data."} },
        workflow: {
          nodes: [
            { id: 'start_1', type: 'start', position: { x: 50, y: 200 }, data: { label: 'Start', status: 'idle' } },
            { id: 'graphql_1', type: 'graphql', position: { x: 200, y: 200 }, data: { label: 'Fetch User Data', query: `query GetUser($id: ID!) { user(id: $id) { id name email profile { avatar bio } } }`, variables: { id: '{{userId}}' }, endpoint: 'https://api.example.com/graphql', status: 'idle' } },
            { id: 'api_2', type: 'api', position: { x: 400, y: 100 }, data: { label: 'Get Orders', apiType: 'REST', method: 'GET', endpoint: 'https://api.example.com/orders/{{userId}}', status: 'idle' } },
            { id: 'api_3', type: 'api', position: { x: 400, y: 300 }, data: { label: 'Get Preferences', apiType: 'REST', method: 'GET', endpoint: 'https://api.example.com/preferences/{{userId}}', status: 'idle' } },
            { id: 'aggregate_1', type: 'aggregate', position: { x: 600, y: 200 }, data: { label: 'Combine Data', aggregationType: 'merge', mergeStrategy: 'shallow', status: 'idle' } },
            { id: 'transform_2', type: 'transform', position: { x: 800, y: 200 }, data: { label: 'Final Transform', transformations: [ { type: 'nest', fields: ['orders', 'preferences'], as: 'userData' }, { type: 'compute', field: 'totalOrderValue', expression: 'userData.orders.reduce((sum, order) => sum + order.total, 0)' } ], status: 'idle' } },
            { id: 'end_1', type: 'end', position: { x: 1000, y: 200 }, data: { label: 'End', status: 'idle' } }
          ],
          edges: [
            { id: 'e1', source: 'start_1', target: 'graphql_1', animated: false },
            { id: 'e2', source: 'graphql_1', target: 'api_2', animated: false },
            { id: 'e3', source: 'graphql_1', target: 'api_3', animated: false },
            { id: 'e4', source: 'api_2', target: 'aggregate_1', animated: false },
            { id: 'e5', source: 'api_3', target: 'aggregate_1', animated: false },
            { id: 'e6', source: 'aggregate_1', target: 'transform_2', animated: false },
            { id: 'e7', source: 'transform_2', target: 'end_1', animated: false }
          ]
        },
        
        environments: {
          dev: { active: true, variables: {}, promoted: false },
          qa: { active: false, variables: {}, promoted: false },
          uat: { active: false, variables: {}, promoted: false },
          prod: { active: false, variables: {}, promoted: false }
        },
        
        testSuites: [],
        metrics: {
          executions: { total: 0, successful: 0, failed: 0 },
          performance: { avgResponseTime: 0, p95ResponseTime: 0, p99ResponseTime: 0 },
          reliability: { successRate: 100, uptime: 100 }
        }
      },
      {
        id: 'api_demo_3',
        name: 'E-commerce Product API',
        description: 'Provides access to product catalog, inventory, and pricing information for an e-commerce platform.',
        version: '1.2.0',
        status: 'published',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        modifiedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'Internal APIs',
        tags: ['products', 'e-commerce', 'inventory'],
        inputSchema: { productId: { type: "string", required: true, description: "The unique ID of the product.", example: "prod-987" } },
        outputSchema: { name: { type: "string", description: "Product name." }, price: { type: "number", description: "Product price." }, inStock: { type: "boolean", description: "Inventory status." } },
        workflow: { nodes: [], edges: [] },
        environments: { dev: {}, qa: {}, uat: {}, prod: {} },
        testSuites: [],
        metrics: {
            executions: { total: 258901, successful: 258800, failed: 101 },
            performance: { avgResponseTime: 89, p95ResponseTime: 150, p99ResponseTime: 220 },
            reliability: { successRate: 99.9, uptime: 99.98 }
        }
      },
      {
        id: 'api_demo_4',
        name: 'Social Media Connector',
        description: 'Draft API for posting updates to multiple social media platforms.',
        version: '0.5.0',
        status: 'draft',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        modifiedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'Connectors',
        tags: ['social', 'automation', 'draft'],
        inputSchema: {},
        outputSchema: {},
        workflow: { nodes: [], edges: [] },
        environments: { dev: {}, qa: {}, uat: {}, prod: {} },
        testSuites: [],
        metrics: {
            executions: { total: 500, successful: 450, failed: 50 },
            performance: { avgResponseTime: 450, p95ResponseTime: 700, p99ResponseTime: 950 },
            reliability: { successRate: 90.0, uptime: 100 }
        }
      },
      {
        id: 'api_demo_5',
        name: 'Payment Gateway Service',
        description: 'Handles credit card processing and transaction logging. High reliability.',
        version: '3.0.1',
        status: 'published',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        modifiedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'Financial',
        tags: ['payment', 'transactions', 'secure'],
        inputSchema: { amount: { type: "number", required: true, description: "Transaction amount.", example: 99.99 }, currency: { type: "string", required: true, description: "Currency code (e.g., USD).", example: "USD" } },
        outputSchema: { transactionId: { type: "string", description: "Unique transaction ID." }, status: { type: "string", description: "Transaction status." } },
        workflow: { nodes: [], edges: [] },
        environments: { dev: {}, qa: {}, uat: {}, prod: {} },
        testSuites: [],
        metrics: {
            executions: { total: 1204567, successful: 1204560, failed: 7 },
            performance: { avgResponseTime: 120, p95ResponseTime: 200, p99ResponseTime: 300 },
            reliability: { successRate: 99.99, uptime: 99.99 }
        }
      }
    ];
    
    setConfigs(demoConfigs);
    setLoading(false);
  }, []);

  const handleCreateNew = () => {
    const newConfig = {
      id: `api_${Date.now()}`,
      name: 'New API Integration',
      description: '',
      version: '1.0.0',
      status: 'draft',
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      category: 'Custom',
      tags: [],
      inputSchema: {},
      outputSchema: {},
      workflow: {
        nodes: [
          { id: 'start_1', type: 'start', position: { x: 100, y: 200 }, data: { label: 'Start', status: 'idle' } },
          { id: 'end_1', type: 'end', position: { x: 500, y: 200 }, data: { label: 'End', status: 'idle' } }
        ],
        edges: []
      },
      
      environments: {
        dev: { active: true, variables: {}, promoted: false },
        qa: { active: false, variables: {}, promoted: false },
        uat: { active: false, variables: {}, promoted: false },
        prod: { active: false, variables: {}, promoted: false }
      },
      
      testSuites: [],
      metrics: {
        executions: { total: 0, successful: 0, failed: 0 },
        performance: { avgResponseTime: 0, p95ResponseTime: 0, p99ResponseTime: 0 },
        reliability: { successRate: 100, uptime: 100 }
      }
    };
    
    setConfigs([...configs, newConfig]);
    setSelectedConfig(newConfig);
    setCurrentView('studio');
    showToast('New API configuration created', 'success');
  };

  const handleDeleteConfig = (configId) => {
    setConfigs(configs.filter(c => c.id !== configId));
    if (selectedConfig?.id === configId) {
      setSelectedConfig(null);
      setCurrentView('dashboard');
    }
    showToast('API configuration deleted', 'success');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const markNotificationsAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.notification-dropdown') && showNotifications) {
        setShowNotifications(false);
      }
      if (!e.target.closest('.profile-dropdown') && showProfile) {
        setShowProfile(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showNotifications, showProfile]);
  
  const displayedConfigs = useMemo(() => {
    if (!searchTerm) return configs;
    return configs.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.tags && c.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  }, [configs, searchTerm]);

  const renderContent = () => {
    if (loading) {
        return (
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                </div>
                <Skeleton className="h-12 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-48" />
                    <Skeleton className="h-48" />
                    <Skeleton className="h-48" />
                </div>
            </div>
        )
    }
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            configs={displayedConfigs}
            onSelectConfig={(config) => {
              setSelectedConfig(config);
              setCurrentView(persona === 'builder' ? 'studio' : 'subscriber');
            }}
            onCreateNew={handleCreateNew}
            onDeleteConfig={handleDeleteConfig}
            theme={theme}
            showToast={showToast}
            environment={environment}
            searchTerm={searchTerm}
            persona={persona}
          />
        );
      
      case 'studio':
        return selectedConfig ? (
          <APIStudio
            config={selectedConfig}
            configs={configs}
            onUpdate={(updatedConfig) => {
              setConfigs(configs.map(c => 
                c.id === updatedConfig.id ? updatedConfig : c
              ));
              setSelectedConfig(updatedConfig);
            }}
            onExit={() => {
              setSelectedConfig(null);
              setCurrentView('dashboard');
            }}
            onDelete={() => handleDeleteConfig(selectedConfig.id)}
            environment={environment}
            theme={theme}
            showToast={showToast}
          />
        ) : null;
      
      case 'subscriber':
        return selectedConfig ? (
            <SubscriberView
                config={selectedConfig}
                theme={theme}
                onExit={() => {
                    setSelectedConfig(null);
                    setCurrentView('dashboard');
                }}
                showToast={showToast}
            />
        ) : null;

      case 'test-suites':
        return (
          <TestSuitesDashboard
            configs={configs}
            onUpdateConfig={(updatedConfig) => {
              setConfigs(configs.map(c => 
                c.id === updatedConfig.id ? updatedConfig : c
              ));
            }}
            theme={theme}
            showToast={showToast}
          />
        );
      
      case 'subscriber-dashboard':
          return <SubscriberDashboard theme={theme} />;

      default:
        return null;
    }
  };

  const builderSidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, view: 'dashboard' },
    { id: 'test-suites', label: 'Test Suites', icon: TestTube, view: 'test-suites' }
  ];

  const subscriberSidebarItems = [
      { id: 'subscriber-dashboard', label: 'My Dashboard', icon: UserCheck, view: 'subscriber-dashboard' },
      { id: 'dashboard', label: 'API Marketplace', icon: Package, view: 'dashboard' },
  ];

  const sidebarItems = persona === 'builder' ? builderSidebarItems : subscriberSidebarItems;

  return (
    <div className={`flex flex-col h-screen ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-800'}`}>
      {/* Main Header */}
      <header className={`flex items-center justify-between px-4 py-2 ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="flex items-center gap-4">
            <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={`p-1.5 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
            >
                {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
                <Rocket className="w-6 h-6 text-blue-500" />
                <h1 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                    NAQ 
                    <NAQLogo animate={loading} />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">App Integrator</span>
                </h1>
            </div>
        </div>
        
        <div className="flex-1 flex justify-center px-8">
          {/* Search Bar in Header */}
          {currentView === 'dashboard' && (
            <div className="relative w-full max-w-md">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                    type="text"
                    placeholder="Search APIs by name, description, or tag..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    theme === 'dark' 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-200 placeholder-gray-500'
                    } focus:ring-2 focus:ring-blue-500`}
                />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1 p-1 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <button
                    onClick={() => { setPersona('builder'); setCurrentView('dashboard'); setSelectedConfig(null); }}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-all ${persona === 'builder' ? (theme === 'dark' ? 'bg-gray-700 text-blue-400' : 'bg-white text-blue-600 shadow-sm') : (theme === 'dark' ? 'text-gray-400' : 'text-gray-500')}`}
                >
                    <Building className="w-4 h-4" />
                    Builder
                </button>
                <button
                    onClick={() => { setPersona('subscriber'); setCurrentView('subscriber-dashboard'); setSelectedConfig(null); }}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-all ${persona === 'subscriber' ? (theme === 'dark' ? 'bg-gray-700 text-blue-400' : 'bg-white text-blue-600 shadow-sm') : (theme === 'dark' ? 'text-gray-400' : 'text-gray-500')}`}
                >
                    <UserCheck2 className="w-4 h-4" />
                    Subscriber
                </button>
            </div>
            <button
                onClick={toggleTheme}
                className={`flex items-center justify-center gap-2 p-2 rounded-lg transition-all ${
                theme === 'dark' 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
            >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          {/* Notifications */}
          <div className="relative notification-dropdown">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) markNotificationsAsRead();
              }}
              className={`relative p-2 rounded-lg transition-colors ${
                theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <Bell className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>
            
            {showNotifications && (
              <div className={`absolute right-0 mt-2 w-80 rounded-lg shadow-lg border z-50 ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map(notif => (
                    <div key={notif.id} className={`p-4 border-b ${
                      theme === 'dark' ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'
                    } transition-colors`}>
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          notif.type === 'success' ? 'bg-green-100 text-green-600' :
                          notif.type === 'error' ? 'bg-red-100 text-red-600' :
                          notif.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {notif.type === 'success' ? <CheckCircle className="w-4 h-4" /> :
                           notif.type === 'error' ? <XCircle className="w-4 h-4" /> :
                           notif.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                           <Info className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                            {notif.message}
                          </p>
                          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                            {notif.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={`p-3 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Profile */}
          <div className="relative profile-dropdown">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className={`flex items-center gap-2 p-1 rounded-full transition-colors ${
                theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500`}>
                <span className="text-white text-sm font-medium">SR</span>
              </div>
            </button>
            
            {showProfile && (
              <div className={`absolute right-0 mt-2 w-64 rounded-lg shadow-lg border z-50 ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Senthilkumar Rajendran
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    senthilkumar.rajendran@toyota.com
                  </p>
                </div>
                <div className="p-2">
                  <button className={`w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center gap-2 ${
                    theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'
                  }`}>
                    <User className="w-4 h-4" />
                    Profile Settings
                  </button>
                  <button className={`w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center gap-2 ${
                    theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'
                  }`}>
                    <Key className="w-4 h-4" />
                    API Keys
                  </button>
                  <hr className={`my-2 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`} />
                  <button className={`w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center gap-2 ${
                    theme === 'dark' ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-50 text-red-600'
                  }`}>
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-14' : 'w-56'} transition-all duration-300 ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-r flex flex-col`}>
        <nav className="flex-1 p-2">
            <div className="space-y-1">
            {sidebarItems.map(item => (
                <button
                key={item.id}
                onClick={() => setCurrentView(item.view)}
                className={`w-full flex items-center gap-3 py-3 rounded-md transition-colors relative ${
                    sidebarCollapsed ? 'justify-center px-2' : 'px-4'
                } ${
                    currentView === item.view
                    ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300'
                    : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'
                }`}
                >
                {currentView === item.view && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full"></div>
                )}
                <item.icon className="w-6 h-6" />
                {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                </button>
            ))}
            </div>
            
            {persona === 'builder' && !sidebarCollapsed && (
            <div className="mt-8">
                <h3 className={`px-3 text-xs font-semibold uppercase tracking-wider mb-2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                }`}>
                Environment
                </h3>
                <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg text-sm ${
                    theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-gray-50 border-gray-200'
                } border focus:ring-2 focus:ring-blue-500`}
                >
                <option value="dev">Development</option>
                <option value="qa">QA/Testing</option>
                <option value="uat">UAT/Staging</option>
                <option value="prod">Production</option>
                </select>
                
                {/* Environment Status Indicator */}
                <div className="mt-3 px-3">
                <div className="flex items-center justify-between text-xs">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Status</span>
                    <span className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${environment === 'prod' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{environment === 'prod' ? 'Locked' : 'Active'}</span>
                    </span>
                </div>
                </div>
            </div>
            )}
        </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {renderContent()}
        </main>
      </div>
      
      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default App;
