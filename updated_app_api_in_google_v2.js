import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Plus, Minus, Save, Play, Settings, Database, Link2,
  ChevronRight, Copy, Download, Eye, EyeOff, Trash2,
  GitBranch, TestTube, Globe, Key, Shield, Clock,
  ArrowRight, Square, Circle, Diamond, Zap, Filter,
  Move, Maximize2, Minimize2, Code, Layers, Package,
  MoreVertical, Search, X, Check, AlertCircle, Loader2,
  ChevronDown, Activity, TrendingUp, Users, Lock,
  Sparkles, Command, Workflow, RefreshCw, BarChart3,
  Rocket, Send, ArrowUp, ExternalLink,
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
  FileInput, FileOutput, ZoomIn, ZoomOut,
  ClipboardCheck, GripVertical, FileStack, GitCommitVertical, Dot, Edit3,
} from 'lucide-react';

import envConfig from './env-config.json';
import logoLight from './app-integrator-logo-light.svg';
import logoDark from './app-integrator-logo-dark.svg';
import apiCatalog from './api-catalog.json';

// Base URL for executing integrator configurations
const INTEGRATOR_BASE_URL = 'https://appintegrator.example.com/execute';

const ENV_SETTINGS = Object.fromEntries(
  (envConfig.environments || []).map(e => [e.categoryId, e.categoryValues])
);

const getEnvPermissions = (env) => ENV_SETTINGS[env] || {};

// Registry of available transformation operations
const TRANSFORM_OPS = {
  rename_fields: {
    label: 'Rename Fields',
    defaultConfig: { mappings: [{ from: '', to: '' }] }
  },
  select_fields: {
    label: 'Select Fields',
    defaultConfig: { fields: [''] }
  },
  compute_field: {
    label: 'Compute Field',
    defaultConfig: { field: '', expression: '' }
  },
  array_take: {
    label: 'Array Take',
    defaultConfig: { count: 1 }
  }
};

// Utilities to convert between flat and nested representations
const nestSchema = (flat = {}) => {
  const nested = {};
  Object.entries(flat).forEach(([path, schema]) => {
    const parts = path.split('.');
    let current = nested;
    parts.forEach((part, idx) => {
      if (idx === parts.length - 1) {
        current[part] = { ...schema };
      } else {
        current[part] = current[part] || { type: 'object', fields: {} };
        current = current[part].fields;
      }
    });
  });
  return nested;
};

const flattenSchema = (nested = {}, prefix = '') => {
  let flat = {};
  Object.entries(nested).forEach(([key, schema]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (schema.type === 'object') {
      const { fields, ...rest } = schema;
      flat[path] = { type: 'object', ...rest };
      if (fields) {
        flat = { ...flat, ...flattenSchema(fields, path) };
      }
    } else {
      const { fields, ...rest } = schema;
      flat[path] = rest;
    }
  });
  return flat;
};

const nestValues = (flat = {}) => {
  const nested = {};
  Object.entries(flat).forEach(([path, value]) => {
    const parts = path.split('.');
    let current = nested;
    parts.forEach((part, idx) => {
      if (idx === parts.length - 1) {
        current[part] = value;
      } else {
        current[part] = current[part] || {};
        current = current[part];
      }
    });
  });
  return nested;
};

const flattenValues = (nested = {}, prefix = '') => {
  let flat = {};
  Object.entries(nested).forEach(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      flat = { ...flat, ...flattenValues(value, path) };
    } else {
      flat[path] = value;
    }
  });
  return flat;
};

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

const StyledSelect = ({ theme, className = '', children, ...props }) => (
  <div className="relative inline-block">
    <select
      {...props}
      className={`appearance-none pr-8 pl-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        theme === 'dark'
          ? 'bg-gray-800 border-gray-700 text-white'
          : 'bg-white border-gray-300 text-gray-700'
      } ${className}`}
    >
      {children}
    </select>
    <ChevronDown
      className={`w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
      }`}
    />
  </div>
);

const HelpModal = ({ onClose, theme }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className={`max-w-3xl w-full max-h-[80vh] overflow-y-auto rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}>
      <div className={`flex items-center justify-between p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <h2 className="text-lg font-semibold">Component Reference</h2>
        <button onClick={onClose} className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-4 space-y-6 text-sm">
        <section>
          <h3 className="font-medium mb-1">REST API</h3>
          <p>Invoke external HTTP endpoints using methods like GET or POST.</p>
          <ul className="list-disc ml-6 mt-2">
            <li><code>method</code>: GET, POST, PUT, DELETE</li>
            <li><code>headers</code>: HTTP headers object</li>
            <li><code>query</code>: URL query parameters</li>
            <li><code>body</code>: JSON payload for write operations</li>
          </ul>
          <pre className={`mt-2 p-2 rounded ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>{`fetch('https://api.example.com/users?active=true', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ name: 'Ada' })\n})`}</pre>
        </section>
        <section>
          <h3 className="font-medium mb-1">GraphQL</h3>
          <p>Execute GraphQL queries or mutations against a GraphQL endpoint.</p>
          <ul className="list-disc ml-6 mt-2">
            <li><code>endpoint</code>: GraphQL server URL</li>
            <li><code>query</code>: query or mutation string</li>
            <li><code>variables</code>: optional variables object</li>
            <li><code>headers</code>: optional HTTP headers</li>
          </ul>
          <pre className={`mt-2 p-2 rounded ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>{`fetch('https://api.example.com/graphql', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({\n    query: '{ items { id name } }',\n    variables: { limit: 10 }\n  })\n})`}</pre>
        </section>
        <section>
          <h3 className="font-medium mb-1">Transform</h3>
          <p>Modify incoming data using operations like rename, flatten, nest or compute.</p>
          <ul className="list-disc ml-6 mt-2">
            <li><code>rename</code>: change field name <code>from</code> → <code>to</code></li>
            <li><code>flatten</code>/<code>nest</code>: convert between nested and dot paths</li>
            <li><code>compute</code>: derive new field from expression</li>
          </ul>
          <pre className={`mt-2 p-2 rounded ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>{`Input: { user: { name: 'Ada', age: 30 } }\nTransform: rename user.name -> username, compute isAdult: age > 18\nOutput: { username: 'Ada', age: 30, isAdult: true }`}</pre>
        </section>
        <section>
          <h3 className="font-medium mb-1">Filter</h3>
          <p>Keep or drop records based on a where clause.</p>
          <ul className="list-disc ml-6 mt-2">
            <li><code>mode</code>: keep or drop matching records</li>
            <li><code>where</code>: expression or predicate tree</li>
            <li><code>post_limit</code>: optional offset/limit after filtering</li>
          </ul>
          <pre className={`mt-2 p-2 rounded ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>{`Input: [{ price: 50 }, { price: 150 }]\nFilter: mode='keep' where=price > 100\nResult: [{ price: 150 }]`}</pre>
        </section>
        <section>
          <h3 className="font-medium mb-1">Aggregate</h3>
          <p>Combine or summarize data such as merging objects or summing values.</p>
          <ul className="list-disc ml-6 mt-2">
            <li><code>merge</code>: combine objects</li>
            <li><code>concat</code>: join arrays</li>
            <li><code>sum/avg/count</code>: math on field values</li>
            <li><code>groupBy</code>: bucket items by field</li>
          </ul>
          <pre className={`mt-2 p-2 rounded ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>{`Input: [{ cat: 'a', val: 1 }, { cat: 'a', val: 2 }]\nAggregate: groupBy=cat sum=val\nResult: { a: 3 }`}</pre>
        </section>
        <section>
          <h3 className="font-medium mb-1">Condition</h3>
          <p>Branch the workflow based on an expression.</p>
          <ul className="list-disc ml-6 mt-2">
            <li><code>expression</code>: boolean logic to evaluate</li>
            <li><code>trueStep</code>: step run when true</li>
            <li><code>falseStep</code>: step run when false</li>
          </ul>
            <pre className={`mt-2 p-2 rounded ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>{`Condition: user.age > 18\nTrue -> call /adult\nFalse -> call /minor`}</pre>
          </section>
        </div>
      </div>
    </div>
  );

// --- MODAL & PANEL COMPONENTS ---

// Execution Results Panel
const ExecutionResultsPanel = ({ results, onClose, theme }) => {
  return (
    <div className={`fixed top-0 right-0 h-full w-full sm:w-96 md:w-[28rem] border-l ${
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
const parseWhereInput = (input) => {
    if (typeof input === 'object' && input !== null) return input;
    if (!input || (typeof input === 'string' && input.trim() === '')) return null;
    try {
        return JSON.parse(input);
    } catch {
        return { expr: String(input).trim() };
    }
};

const hasPredicate = (where) => {
    if (!where) return false;
    if (typeof where === 'string') return where.trim().length > 0;
    if (where.expr && String(where.expr).trim() !== '') return true;
    if (Array.isArray(where.predicates) && where.predicates.length > 0) return true;
    if (where.path && where.op) return true;
    const combinators = where.and || where.or;
    if (Array.isArray(combinators)) return combinators.some(hasPredicate);
    return false;
};

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
                            const { op, target, config, onError } = t;
                            transformations.push({ op, target, config, onError });
                        });
                    }
                    break;

                case 'filter': {
                    const where = parseWhereInput(node.data.where ?? node.data.whereInput);
                    if (hasPredicate(where)) {
                        transformations.push({
                            op: 'filter',
                            target: '',
                            config: {
                                mode: node.data.mode || 'keep',
                                where
                            },
                            onError: node.data.onError || 'continue'
                        });
                        if (node.data.offset != null || node.data.limit != null) {
                            transformations.push({
                                op: 'post_limit',
                                target: '',
                                config: {
                                    ...(node.data.offset != null ? { offset: node.data.offset } : {}),
                                    ...(node.data.limit != null ? { limit: node.data.limit } : {})
                                }
                            });
                        }
                    }
                    break;
                }

                case 'aggregate':
                    transformations.push({
                        op: 'group_by',
                        target: node.data.target || '',
                        config: {
                            groupBy: node.data.groupBy || [],
                            metrics: node.data.metrics || [],
                            ...(node.data.having
                                ? { having: Array.isArray(node.data.having)
                                    ? node.data.having
                                    : [{ expression: node.data.having }] }
                                : {}),
                            ...(node.data.orderBy && node.data.orderBy.length
                                ? { orderBy: node.data.orderBy }
                                : {}),
                            ...(node.data.limit != null ? { limit: node.data.limit } : {}),
                            ...(node.data.pivot ? { pivot: node.data.pivot } : {}),
                            ...(node.data.rollup ? { rollup: true } : {})
                        },
                        onError: node.data.onError || 'continue'
                    });
                    break;

                case 'condition':
                    transformations.push({
                        op: 'condition',
                        target: '',
                        config: {
                            if: node.data.if || { field: "status", operator: "equals", value: "active" },
                            then: node.data.then || { set: { "isActive": true } },
                            else: node.data.else || { set: { "isActive": false } }
                        },
                        onError: node.data.onError || 'continue'
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

// Generate an output schema for a group_by configuration
const generateGroupByOutputSchema = (nodeData = {}) => {
    const properties = {};

    (nodeData.groupBy || []).forEach(field => {
        properties[field] = { type: 'string', description: `Group key ${field}` };
    });

    (nodeData.metrics || []).forEach(metric => {
        const alias = metric.alias || `${metric.op}_${metric.field}`;
        properties[alias] = { type: 'number', description: `${metric.op} of ${metric.field}` };
    });

    if (nodeData.rollup) {
        properties._isTotal = { type: 'boolean', description: 'Indicates grand total row' };
    }

    return {
        grouped: {
            type: 'array',
            description: 'Grouped results',
            items: { type: 'object', properties }
        }
    };
};

// Generate a minimal OpenAPI specification from current configuration
const generateApiSpec = (config) => {
    const paths = {};
    (config.workflow?.nodes || []).forEach(node => {
        if (node.type === 'api' || node.type === 'graphql') {
            const method = (node.data.method || (node.type === 'graphql' ? 'POST' : 'GET')).toLowerCase();
            const endpoint = node.data.endpoint || '/';
            paths[endpoint] = paths[endpoint] || {};
            paths[endpoint][method] = {
                summary: node.data.label || node.id,
                responses: { '200': { description: 'Successful response' } }
            };
        }
    });
    return {
        openapi: '3.0.0',
        info: {
            title: config.name || 'API',
            version: config.versions?.find(v => v.isCurrent)?.version?.toString() || '1.0.0'
        },
        paths
    };
};

const ApiSpecModal = ({ config, theme, onClose }) => {
  const spec = useMemo(() => generateApiSpec(config), [config]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(spec, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`max-w-3xl w-full max-h-[80vh] overflow-y-auto rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}>
        <div className={`flex items-center justify-between p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className="text-lg font-semibold">API Specification</h2>
          <div className="flex items-center gap-2">
            <button onClick={handleCopy} className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
            <button onClick={onClose} className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-4 space-y-6 text-sm">
          <pre className={`text-xs overflow-x-auto p-2 rounded ${theme === 'dark' ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
            {JSON.stringify(spec, null, 2)}
          </pre>
          <section>
            <h3 className="font-medium mb-1">API Specifications</h3>
            <p>Browse available APIs with details and code snippets:</p>
            <ul className="list-disc ml-6 mt-2">
              <li><code>id</code> &amp; <code>name</code>: identifiers</li>
              <li><code>endpoint</code>: request URL</li>
              <li><code>inputSchema</code> / <code>outputSchema</code>: JSON structures</li>
              <li><code>code snippets</code>: ready-to-use calls</li>
            </ul>
            {apiCatalog.restApis.map(api => (
              <div key={api.id} className="mt-2">
                <h4 className="font-medium">{api.name}</h4>
                <p>URL: {api.endpoint}</p>
                <h5 className="mt-2">Input</h5>
                <pre className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>{JSON.stringify(api.inputSchema, null, 2)}</pre>
                <h5 className="mt-2">Output</h5>
                <pre className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>{JSON.stringify(api.outputSchema, null, 2)}</pre>
                <h5 className="mt-2">Code Snippets</h5>
                <pre className={`p-2 rounded mb-1 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>{`TypeScript: fetch('${api.endpoint}?q=London&key=YOUR_API_KEY')`}</pre>
                <pre className={`p-2 rounded mb-1 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>{`JavaScript: fetch('${api.endpoint}?q=London&key=YOUR_API_KEY')`}</pre>
                <pre className={`p-2 rounded mb-1 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>{`Python: requests.get('${api.endpoint}', params={'q':'London','key':'YOUR_API_KEY'})`}</pre>
                <pre className={`p-2 rounded mb-1 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>{`Java: HttpClient.newHttpClient().send(...)`}</pre>
                <pre className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>{`curl: curl '${api.endpoint}?q=London&key=YOUR_API_KEY'`}</pre>
              </div>
            ))}
            {apiCatalog.graphqlApis.map(api => (
              <div key={api.id} className="mt-6">
                <h4 className="font-medium">{api.name}</h4>
                <p>URL: {api.endpoint}</p>
                <h5 className="mt-2">Input</h5>
                <pre className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>{JSON.stringify(api.inputSchema, null, 2)}</pre>
                <h5 className="mt-2">Output</h5>
                <pre className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>{JSON.stringify(api.outputSchema, null, 2)}</pre>
                <h5 className="mt-2">Code Snippets</h5>
                <pre className={`p-2 rounded mb-1 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>{`TypeScript: fetch('${api.endpoint}', { method: 'POST', body: JSON.stringify({ query: '${api.query}' }) })`}</pre>
                <pre className={`p-2 rounded mb-1 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>{`JavaScript: fetch('${api.endpoint}', { method: 'POST', body: JSON.stringify({ query: '${api.query}' }) })`}</pre>
                <pre className={`p-2 rounded mb-1 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>{`Python: requests.post('${api.endpoint}', json={'query':'${api.query}'})`}</pre>
                <pre className={`p-2 rounded mb-1 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>{`Java: HttpClient.newHttpClient().send(...)`}</pre>
                <pre className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>{`curl: curl -X POST '${api.endpoint}' -d '{"query":"${api.query}"}'`}</pre>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
};


// JSON Editor Component (MODIFIED to be a read-only view)
const JsonEditor = ({ config, theme, onClose, isReadOnly = true, onApply }) => {
  // Generate the user-facing JSON using the transformation logic
  const userFormattedJson = useMemo(() => {
    const formatted = transformConfigToUserFormat(config);
    return JSON.stringify(formatted, null, 2);
  }, [config]);

  const [jsonText, setJsonText] = useState(userFormattedJson);
  useEffect(() => {
    setJsonText(userFormattedJson);
  }, [userFormattedJson]);

  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const text = jsonText;
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
            {!isReadOnly && onApply && (
              <button
                onClick={() => {
                  try {
                    const parsed = JSON.parse(jsonText);
                    onApply(parsed);
                  } catch (e) {
                    alert('Invalid JSON');
                  }
                }}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-green-700 hover:bg-green-600 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                Apply
              </button>
            )}
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
              {isReadOnly
                ? 'This is a read-only view showing the final JSON structure based on your workflow configuration.'
                : 'Edit the configuration JSON below.'}
            </p>
          </div>
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            readOnly={isReadOnly}
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
const PromoteModal = ({ config, onPromote, onClose, theme, fromEnv, versions }) => {
  const promotionPaths = {
    dev: ['qa'],
    qa: ['uat'],
    uat: ['prod'],
    prod: [],
  };

  const availableTargets = promotionPaths[fromEnv] || [];
  const [toEnv, setToEnv] = useState(availableTargets[0] || '');
  const [selectedVersion, setSelectedVersion] = useState(versions.find(v => v.isCurrent)?.id || '');

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
            <input
              type="text"
              readOnly
              value={fromEnv.toUpperCase()}
              className={`w-full px-3 py-2 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-100 border-gray-300 text-gray-500'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Select Version to Promote
            </label>
            <select
                value={selectedVersion}
                onChange={(e) => setSelectedVersion(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                }`}
            >
                {versions.map(version => (
                    <option key={version.id} value={version.id}>
                        v{version.version} ({new Date(version.createdAt).toLocaleString()})
                    </option>
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
              disabled={availableTargets.length === 0}
              className={`w-full px-3 py-2 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
              }`}
            >
              {availableTargets.length > 0 ? (
                availableTargets.map(env => (
                  <option key={env} value={env}>{env.toUpperCase()}</option>
                ))
              ) : (
                <option>No promotion path</option>
              )}
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
            onClick={() => {
              if (window.confirm(`Promote to ${toEnv.toUpperCase()}?`)) {
                onPromote(fromEnv, toEnv, selectedVersion);
              }
            }}
            disabled={!toEnv || !selectedVersion}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
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
            <div className={`rounded-lg p-4 shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
                        <p className={`text-xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {value.toLocaleString()}<span className="text-base ml-1">{unit}</span>
                        </p>
                    </div>
                    <div className={`p-2 rounded-full ${iconBgColor}`}>
                      <Icon className="w-5 h-5 text-white" />
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
                            <StyledSelect
                                theme={theme}
                                value={selectedApi}
                                onChange={(e) => setSelectedApi(e.target.value)}
                            >
                                <option value="all">All API Configs</option>
                                {apiConfigs.map(api => (
                                    <option key={api.id} value={api.id}>{api.name}</option>
                                ))}
                            </StyledSelect>
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
const EnvironmentManager = ({ config, onUpdate, currentEnvironment, theme, showToast, onPromote }) => {
  const environments = envConfig.environments
    .map(e => e.categoryId)
    .filter(env => env !== 'uatdr' && env !== 'dr');
  const [selectedEnv, setSelectedEnv] = useState(currentEnvironment);
  const [showSecrets, setShowSecrets] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  
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

  const handleDepromote = (env) => {
    if (!window.confirm(`Depromote ${env.toUpperCase()} environment?`)) return;
    const history = config.environments[env]?.promotionHistory || [];
    const newHistory = history.slice(0, -1);
    const last = newHistory[newHistory.length - 1];
    const updatedConfig = {
      ...config,
      environments: {
        ...config.environments,
        [env]: {
          ...config.environments[env],
          promotedVersionId: last?.versionId || null,
          promotedFrom: last?.promotedFrom || null,
          lastPromotion: last?.date || null,
          promotionHistory: newHistory
        }
      }
    };
    onUpdate(updatedConfig);
    showToast('Environment depromoted', 'info');
  };

  const handleRollback = (env, index) => {
    const history = config.environments[env]?.promotionHistory || [];
    const target = history[index];
    if (!target) return;
    const versionNumber = config.versions.find(v => v.id === target.versionId)?.version;
    if (!window.confirm(`Rollback ${env.toUpperCase()} to version v${versionNumber}?`)) return;
    const newHistory = history.slice(0, index + 1);
    const updatedConfig = {
      ...config,
      environments: {
        ...config.environments,
        [env]: {
          ...config.environments[env],
          promotionHistory: newHistory,
          promotedVersionId: target.versionId,
          promotedFrom: target.promotedFrom,
          lastPromotion: target.date
        }
      }
    };
    onUpdate(updatedConfig);
    showToast(`Rolled back ${env.toUpperCase()} to v${versionNumber}`, 'info');
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
                {config.environments[env]?.promotedVersionId && (
                  <span className="text-xs bg-white bg-opacity-20 px-2 py-0.5 rounded-full">
                    v{config.versions.find(v => v.id === config.environments[env].promotedVersionId)?.version}
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
                disabled={selectedEnv !== 'dev'}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Add Variable
              </button>
              <button
                onClick={() => setShowPromoteModal(true)}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors border ${
                  theme === 'dark'
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <GitMerge className="w-4 h-4" />
                Promote
              </button>
              {selectedEnv !== 'dev' && config.environments[selectedEnv]?.promotedVersionId && (
                <button
                  onClick={() => handleDepromote(selectedEnv)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <GitBranch className="w-4 h-4" />
                  Depromote
                </button>
              )}
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
                      readOnly={selectedEnv !== 'dev'}
                      placeholder="Enter value..."
                      className={`w-full px-3 py-2 rounded border ${
                        theme === 'dark' 
                          ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300'
                      } ${selectedEnv !== 'dev' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                    />
                  </div>
                  <button
                    onClick={() => handleDeleteVariable(selectedEnv, name)}
                    disabled={selectedEnv !== 'dev'}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'dark' 
                        ? 'hover:bg-gray-600 text-gray-400 hover:text-red-400' 
                        : 'hover:bg-gray-200 text-gray-500 hover:text-red-500'
                    } disabled:opacity-30 disabled:cursor-not-allowed`}
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
          {config.environments[selectedEnv]?.promotedVersionId && (
            <div className={`mt-6 p-4 rounded-lg ${
              theme === 'dark' ? 'bg-blue-900 bg-opacity-20' : 'bg-blue-50'
            }`}>
              <div className="flex items-center gap-2">
                <GitMerge className="w-4 h-4 text-blue-500" />
                <p className={`text-sm ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                  This environment is running version v{config.versions.find(v => v.id === config.environments[selectedEnv]?.promotedVersionId)?.version} promoted from {config.environments[selectedEnv].promotedFrom?.toUpperCase()} on {' '}
                  {new Date(config.environments[selectedEnv].lastPromotion).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
          {/* Promotion History */}
          {(config.environments[selectedEnv]?.promotionHistory || []).length > 0 && (
            <div className="mt-6">
              <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                Promotion History
              </h4>
              <div className="space-y-2">
                {config.environments[selectedEnv].promotionHistory.map((entry, idx) => {
                  const version = config.versions.find(v => v.id === entry.versionId);
                  const isCurrent = idx === config.environments[selectedEnv].promotionHistory.length - 1;
                  return (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        v{version?.version} from {entry.promotedFrom?.toUpperCase()} on {new Date(entry.date).toLocaleDateString()}
                      </span>
                      {!isCurrent && (
                        <button
                          onClick={() => handleRollback(selectedEnv, idx)}
                          className="text-blue-600 hover:underline text-xs"
                        >
                          Rollback
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      {showPromoteModal && (
        <PromoteModal
          config={config}
          onPromote={onPromote}
          onClose={() => setShowPromoteModal(false)}
          theme={theme}
          fromEnv={selectedEnv}
          versions={config.versions}
        />
      )}
    </div>
  );
};

// Test Suite Manager Component
const TestSuiteManager = ({ config, onUpdate, environment, theme, showToast }) => {
  const [selectedSuite, setSelectedSuite] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const permissions = getEnvPermissions(environment);
  
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
            disabled={!permissions.allowEdit}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                        disabled={!permissions.allowEdit}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                          theme === 'dark' 
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        } disabled:opacity-30 disabled:cursor-not-allowed`}
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
    const [inputMode, setInputMode] = useState('form');
    const [jsonInput, setJsonInput] = useState('{}');
    const [executionSteps, setExecutionSteps] = useState([]);
    const nestedInputSchema = useMemo(() => nestSchema(config.inputSchema || {}), [config.inputSchema]);

    useEffect(() => {
        // Initialize input fields with example values from schema
        const initialInputs = {};
        if (config.inputSchema) {
            Object.entries(config.inputSchema).forEach(([key, schema]) => {
                initialInputs[key] = schema.example || '';
            });
        }
        setInputValues(initialInputs);
        setJsonInput(JSON.stringify(nestValues(initialInputs), null, 2));
    }, [config.inputSchema]);

    const switchToJson = () => {
        setJsonInput(JSON.stringify(nestValues(inputValues), null, 2));
        setInputMode('json');
    };

    const switchToForm = () => {
        try {
            setInputValues(flattenValues(JSON.parse(jsonInput || '{}')));
            setInputMode('form');
        } catch (e) {
            showToast('Invalid JSON', 'error');
        }
    };

    const handleInputChange = (name, value) => {
        setInputValues(prev => ({ ...prev, [name]: value }));
    };

    const handleTestApi = async () => {
        setIsTesting(true);
        setApiResponse(null);
        setExecutionSteps([]);

        let payload = inputMode === 'json' ? null : nestValues(inputValues);
        if (inputMode === 'json') {
            try {
                payload = JSON.parse(jsonInput || '{}');
            } catch (e) {
                showToast('Invalid JSON input', 'error');
                setIsTesting(false);
                return;
            }
        }

        try {
            const res = await fetch(`${INTEGRATOR_BASE_URL}/${config.name}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(config.token ? { 'Authorization': `Bearer ${config.token}` } : {})
                },
                body: JSON.stringify({ input: payload, config })
            });
            const data = await res.json();
            const steps = data.steps || [];
            for (const step of steps) {
                setExecutionSteps(prev => [...prev, { name: step.name || `Step ${prev.length + 1}`, status: 'running' }]);
                await new Promise(r => setTimeout(r, 500));
                setExecutionSteps(prev => prev.map((s, idx) => idx === prev.length - 1 ? { ...s, status: 'success' } : s));
            }
            setApiResponse({
                status: res.status,
                headers: Object.fromEntries(res.headers.entries()),
                data,
                responseTime: data.responseTime || ''
            });
            showToast('Request completed', 'success');
        } catch (err) {
            setApiResponse({ status: 500, data: { error: err.message } });
            showToast('Request failed', 'error');
        } finally {
            setIsTesting(false);
        }
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
        const baseUrl = `${INTEGRATOR_BASE_URL}/${config.name}`;
        const headers = { 'Authorization': 'Bearer YOUR_API_KEY', 'Content-Type': 'application/json' };
        let values;
        try {
            values = inputMode === 'json' ? JSON.parse(jsonInput || '{}') : nestValues(inputValues);
        } catch {
            values = {};
        }
        const body = JSON.stringify(values, null, 2);

        switch (language) {
            case 'shell':
                return `curl -X POST '${baseUrl}' \\\n-H 'Authorization: Bearer YOUR_API_KEY' \\\n-H 'Content-Type: application/json' \\\n-d '${JSON.stringify(values)}'`;
            case 'javascript':
                return `fetch('${baseUrl}', {\n  method: 'POST',\n  headers: ${JSON.stringify(headers, null, 2)},\n  body: ${body}\n})\n.then(response => response.json())\n.then(data => console.log(data))\n.catch(error => console.error('Error:', error));`;
            case 'typescript':
                return `import fetch from 'node-fetch';\n\nconst url: string = '${baseUrl}';\n\nconst options: RequestInit = {\n  method: 'POST',\n  headers: {\n    'Authorization': 'Bearer YOUR_API_KEY',\n    'Content-Type': 'application/json'\n  },\n  body: ${body}\n};\n\nasync function callApi() {\n  try {\n    const response = await fetch(url, options);\n    const data = await response.json();\n    console.log(data);\n  } catch (error) {\n    console.error('Error:', error);\n  }\n}\n\ncallApi();`;
            case 'python':
                return `import requests\nimport json\n\nurl = "${baseUrl}"\nheaders = ${JSON.stringify(headers, null, 2)}\npayload = ${JSON.stringify(values)}\n\nresponse = requests.post(url, headers=headers, data=json.dumps(payload))\n\nprint(response.json())`;
            case 'java':
                 return `import java.net.URI;\nimport java.net.http.HttpClient;\nimport java.net.http.HttpRequest;\nimport java.net.http.HttpResponse;\n\npublic class ApiClient {\n    public static void main(String[] args) throws Exception {\n        HttpClient client = HttpClient.newHttpClient();\n        String requestBody = """\n${JSON.stringify(values, null, 4)}\n""";\n\n        HttpRequest request = HttpRequest.newBuilder()\n                .uri(URI.create("${baseUrl}"))\n                .header("Authorization", "Bearer YOUR_API_KEY")\n                .header("Content-Type", "application/json")\n                .POST(HttpRequest.BodyPublishers.ofString(requestBody))\n                .build();\n\n        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());\n\n        System.out.println(response.body());\n    }\n}`;
            default:
                return '';
        }
    }, [inputValues, jsonInput, inputMode, config.id]);

    const renderInputFields = (schema, parentPath = '') => {
        return Object.entries(schema).map(([key, value]) => {
            const path = parentPath ? `${parentPath}.${key}` : key;
            if (value.type === 'object' && value.fields) {
                return (
                    <div key={path} className="pl-4">
                        <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{key}</label>
                        {renderInputFields(value.fields, path)}
                    </div>
                );
            }
            return (
                <div key={path} className="mb-2" style={{ marginLeft: parentPath ? '1rem' : 0 }}>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{key}</label>
                    <input
                        type="text"
                        value={inputValues[path] || ''}
                        placeholder={value.example || ''}
                        onChange={(e) => handleInputChange(path, e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                </div>
            );
        });
    };

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
                    </div>
                    
                    <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>API Endpoint</h3>
                    <pre className={`w-full p-3 rounded-lg text-sm overflow-x-auto mb-6 ${theme === 'dark' ? 'bg-gray-800 text-green-400' : 'bg-gray-100 text-green-700'}`}>
                        <span className={`font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>POST</span> {`${INTEGRATOR_BASE_URL}/${config.name}`}
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
                                <div className="flex items-center justify-between">
                                    <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Parameters</h4>
                                    <div className="flex gap-2 text-xs">
                                        <button onClick={switchToForm} className={inputMode === 'form' ? 'text-blue-500' : ''}>Form</button>
                                        <button onClick={switchToJson} className={inputMode === 'json' ? 'text-blue-500' : ''}>JSON</button>
                                    </div>
                                </div>
                                {inputMode === 'form' ? (
                                    renderInputFields(nestedInputSchema)
                                ) : (
                                    <textarea
                                        value={jsonInput}
                                        onChange={(e) => setJsonInput(e.target.value)}
                                        className={`w-full h-40 px-3 py-2 rounded-lg border font-mono text-sm ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                    />
                                )}
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
                                {executionSteps.length > 0 && (
                                    <div className="mt-4">
                                        <h5 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Execution Steps</h5>
                                        <ol className="space-y-1">
                                            {executionSteps.map((step, idx) => (
                                                <li key={idx} className="text-xs flex items-center gap-2">
                                                    {step.status === 'success' ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Loader2 className="w-3 h-3 animate-spin" />}
                                                    <span>{step.name || `Step ${idx + 1}`}</span>
                                                </li>
                                            ))}
                                        </ol>
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

// Version Dropdown
const VersionDropdown = ({ config, theme, onClose, onSelectVersion, viewingVersion, onCloneVersion, onMakeActive, environment }) => {
    const dropdownRef = useRef(null);
    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [onClose]);

    const currentActiveVersionId = config.versions.find(v => v.isCurrent)?.id;
    const permissions = getEnvPermissions(environment);

    const getEnvBadges = (versionId) => {
        const badges = [];
        if (currentActiveVersionId === versionId) {
            badges.push('DEV');
        }
        Object.entries(config.environments || {}).forEach(([env, envData]) => {
            if (envData.promotedVersionId === versionId) {
                badges.push(env.toUpperCase());
            }
        });
        return badges;
    };

    return (
        <div ref={dropdownRef} className={`absolute right-0 mt-2 w-72 max-h-64 overflow-auto rounded-lg shadow-lg border z-50 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            {config.versions.sort((a,b) => b.version - a.version).map(version => (
                <div
                    key={version.id}
                    className={`p-2 text-sm flex items-center justify-between cursor-pointer ${viewingVersion?.id === version.id ? (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100') : ''}`}
                    onClick={() => onSelectVersion(viewingVersion?.id === version.id ? null : version)}
                >
                    <span className="flex items-center gap-1">
                        v{version.version}
                        {getEnvBadges(version.id).map(badge => (
                            <span
                                key={badge}
                                className={`text-[10px] px-1.5 py-0.5 rounded ${theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'}`}
                            >
                                {badge}
                            </span>
                        ))}
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); onCloneVersion(version); }}
                            disabled={!permissions.allowClone}
                            className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'} disabled:opacity-50 disabled:cursor-not-allowed`}
                            title="Clone"
                        >
                            <Copy className="w-3 h-3" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onMakeActive(version.id); }}
                            disabled={!permissions.allowEdit || currentActiveVersionId === version.id}
                            className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700 text-blue-400' : 'hover:bg-gray-100 text-blue-600'} disabled:opacity-50 disabled:cursor-not-allowed`}
                            title="Make Active"
                        >
                            <GitBranch className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};


const CloneModal = ({ onClose, onClone, theme }) => {
    const [name, setName] = useState('');
    const [app, setApp] = useState('Q1TIS');
    const [tags, setTags] = useState('');
    const appOptions = ['Q1TIS', 'Q1TAS', 'CPS'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`rounded-lg shadow-xl p-6 w-full max-w-md ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                        <Copy className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Clone API Configuration
                        </h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Create a new API from an existing one
                        </p>
                    </div>
                </div>
                
                <div className="space-y-4 mb-6">
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                            New API Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., New User Data API"
                            className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                                theme === 'dark' 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300'
                            }`}
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                            Associated App
                        </label>
                        <select
                            value={app}
                            onChange={(e) => setApp(e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                                theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300'
                            }`}
                        >
                            {appOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                            Tags
                        </label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="e.g., analytics, user"
                            className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                                theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300'
                            }`}
                        />
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
                        onClick={() => onClone(name, app, tags.split(',').map(t => t.trim()).filter(Boolean))}
                        disabled={!name}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Clone API
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- CORE LAYOUT COMPONENTS ---

// Enhanced Dashboard Component
const Dashboard = ({ configs, onSelectConfig, onCreateNew, onDeleteConfig, onCloneConfig, theme, showToast, environment, onEnvironmentChange, searchTerm, onPublish, onUnpublish }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('modified');
  const [viewMode, setViewMode] = useState('grid');
  const [showUnpublishModal, setShowUnpublishModal] = useState(null);
  const [showCloneModal, setShowCloneModal] = useState(null);
  const permissions = getEnvPermissions(environment);
  const [totalConfigs, setTotalConfigs] = useState(configs.length);
  const [totalPublished, setTotalPublished] = useState(
    configs.filter(c => c.status === 'published').length
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const query = `\n          query ConfigStats {\n            totalConfigs\n            totalPublished\n          }\n        `;
        const res = await fetch('/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        });
        const data = await res.json();
        setTotalConfigs(data.data.totalConfigs);
        setTotalPublished(data.data.totalPublished);
      } catch (err) {
        setTotalConfigs(configs.length);
        setTotalPublished(configs.filter(c => c.status === 'published').length);
      }
    };
    fetchStats();
  }, [configs]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, sortBy, configs]);

  const handleDeleteClick = (e, config) => {
    e.stopPropagation();
    setShowDeleteModal(config);
  };

  const handleUnpublishClick = (e, config) => {
    e.stopPropagation();
    setShowUnpublishModal(config);
  };
  
  const handleCloneClick = (e, configId) => {
    e.stopPropagation();
    setShowCloneModal(configId);
  };
  
  const handleCloneConfirm = (newName, newApp, tags) => {
      onCloneConfig(showCloneModal, newName, newApp, tags);
      setShowCloneModal(null);
  };

  const confirmDelete = () => {
    if (showDeleteModal) {
      onDeleteConfig(showDeleteModal.id);
      setShowDeleteModal(null);
    }
  };

  const confirmUnpublish = () => {
    if (showUnpublishModal) {
      onUnpublish(showUnpublishModal.id);
      setShowUnpublishModal(null);
    }
  };

  const filteredConfigs = useMemo(() => {
    let filtered = configs;

    // Apply status filter
    if (filter !== 'all') {
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
      }
      return 0;
    });

    return filtered;
  }, [configs, filter, sortBy]);

  const totalPages = Math.ceil(filteredConfigs.length / itemsPerPage) || 1;
  const paginatedConfigs = useMemo(
    () =>
      filteredConfigs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      ),
    [filteredConfigs, currentPage]
  );


  // Builder Dashboard
  return (
    <div className={`p-6 overflow-y-auto h-full ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Filters, stats and actions */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <StyledSelect
              theme={theme}
              value={environment}
              onChange={(e) => onEnvironmentChange(e.target.value)}
            >
              <option value="dev">Development</option>
              <option value="qa">QA</option>
              <option value="uat">UAT</option>
              <option value="prod">PROD</option>
            </StyledSelect>
          </div>
          {/* Filter */}
          <StyledSelect
            theme={theme}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
          </StyledSelect>
          
          {/* Sort */}
          <StyledSelect
            theme={theme}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="modified">Last Modified</option>
            <option value="name">Name</option>
            <option value="status">Status</option>
          </StyledSelect>
          {/* Config statistics */}
          <div className="flex gap-6 items-center">
            <div
              className={`flex flex-col items-center justify-center w-20 h-20 rounded-full border-4 ${
                theme === 'dark'
                  ? 'border-blue-500 text-white'
                  : 'border-blue-600 text-gray-900'
              }`}
            >
              <span className="text-xl font-bold">{totalConfigs}</span>
              <span className="text-xs text-center">Total Configs</span>
            </div>
            <div
              className={`flex flex-col items-center justify-center w-20 h-20 rounded-full border-4 ${
                theme === 'dark'
                  ? 'border-green-500 text-white'
                  : 'border-green-600 text-gray-900'
              }`}
            >
              <span className="text-xl font-bold">{totalPublished}</span>
              <span className="text-xs text-center">Published</span>
            </div>
          </div>

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
            disabled={!permissions.allowCreate}
            title={!permissions.allowCreate ? "API creation is disabled in this environment" : "Create New API"}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed"
        >
            <Plus className="w-4 h-4" />
            Create New API
        </button>
      </div>

      {/* API Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedConfigs.map(config => (
            <div
              key={config.id}
              onClick={() => onSelectConfig(config, 'view')}
              className={`relative group flex flex-col rounded-xl overflow-hidden p-4 transition-transform cursor-pointer ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:shadow-xl hover:-translate-y-1'
                  : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:shadow-xl hover:-translate-y-1'
              }`}
            >
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 opacity-20 rounded-full blur-2xl"></div>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <h3 className={`font-semibold pr-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {config.name}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      config.status === 'published' 
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                      {config.status}
                  </span>
                </div>
                
                <p className={`text-sm mb-3 line-clamp-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {config.description || 'No description provided'}
                </p>

                <div>
                    <h4 className={`text-xs font-semibold mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>APPLICATIONS</h4>
                    <div className="flex flex-wrap gap-2">
                        {config.applications.map((app, index) => (
                            <span key={index} className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                <Package className="w-3 h-3"/>
                                {app}
                            </span>
                        ))}
                    </div>
                </div>
              </div>
              
              <div className={`mt-3 pt-3 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
                 <span className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>v{config.versions.find(v => v.isCurrent)?.version}</span>
                   <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); onSelectConfig(config, 'view'); }} title="View" className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><Eye className="w-4 h-4"/></button>
                      {config.status === 'published' && permissions.allowEdit && (
                        <button onClick={(e) => handleUnpublishClick(e, config)} title="Unpublish" className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-orange-400' : 'hover:bg-gray-100 text-orange-500'}`}><CloudOff className="w-4 h-4"/></button>
                    )}
                    <button
                        onClick={(e) => { e.stopPropagation(); onSelectConfig(config, 'edit'); }}
                        title={config.status === 'published' ? "Unpublish to edit" : "Edit"}
                        disabled={config.status === 'published' || !permissions.allowEdit}
                        className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} disabled:opacity-30 disabled:cursor-not-allowed`}
                    >
                        <Edit3 className="w-4 h-4"/>
                    </button>
                    <button onClick={(e) => handleCloneClick(e, config.id)} title="Clone" disabled={!permissions.allowClone} className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} disabled:opacity-30 disabled:cursor-not-allowed`}><Copy className="w-4 h-4"/></button>
                    <button onClick={(e) => handleDeleteClick(e, config)} title="Delete" disabled={environment === 'prod'} className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-500'} disabled:opacity-30 disabled:cursor-not-allowed`}><Trash2 className="w-4 h-4"/></button>
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
        <div className={`rounded-lg border overflow-hidden ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <table className="min-w-full text-sm">
            <thead className={`${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
              <tr>
                <th className="text-left px-6 py-3 font-medium">Name</th>
                <th className="text-left px-6 py-3 font-medium">Status</th>
                <th className="text-left px-6 py-3 font-medium">Version</th>
                <th className="text-left px-6 py-3 font-medium">Applications</th>
                <th className="text-right px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className={`${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'} divide-y`}>
              {paginatedConfigs.map((config) => (
                <tr
                  key={config.id}
                  onClick={() => onSelectConfig(config, 'view')}
                  className={`transition-colors cursor-pointer ${
                    theme === 'dark'
                      ? 'hover:bg-gray-700/50'
                      : 'hover:bg-gray-50'
                  }`}
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
                    v{config.versions.find(v => v.isCurrent)?.version}
                  </td>
                  <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {config.applications.join(', ')}
                  </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                          <button onClick={(e) => { e.stopPropagation(); onSelectConfig(config, 'view'); }} title="View" className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><Eye className="w-4 h-4"/></button>
                          {config.status === 'published' && permissions.allowEdit && (
                            <button onClick={(e) => handleUnpublishClick(e, config)} title="Unpublish" className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-orange-400' : 'hover:bg-gray-100 text-orange-500'}`}><CloudOff className="w-4 h-4"/></button>
                        )}
                        <button
                            onClick={(e) => { e.stopPropagation(); onSelectConfig(config, 'edit'); }}
                            title={config.status === 'published' ? "Unpublish to edit" : "Edit"}
                            disabled={config.status === 'published' || !permissions.allowEdit}
                            className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} disabled:opacity-30 disabled:cursor-not-allowed`}
                        >
                            <Edit3 className="w-4 h-4"/>
                        </button>
                        <button onClick={(e) => handleCloneClick(e, config.id)} title="Clone" disabled={!permissions.allowClone} className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} disabled:opacity-30 disabled:cursor-not-allowed`}><Copy className="w-4 h-4"/></button>
                        <button onClick={(e) => handleDeleteClick(e, config)} title="Delete" disabled={environment === 'prod'} className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-500'} disabled:opacity-30 disabled:cursor-not-allowed`}><Trash2 className="w-4 h-4"/></button>
                    </div>
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

      {filteredConfigs.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md border text-sm transition-colors ${
                theme === 'dark'
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md border text-sm transition-colors ${
                theme === 'dark'
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Next
            </button>
          </div>
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

      {/* Unpublish Confirmation Modal */}
      {showUnpublishModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all scale-100 ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <CloudOff className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Unpublish API
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Make this API unavailable
                </p>
              </div>
            </div>
            <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Are you sure you want to unpublish "{showUnpublishModal.name}"? This API will no longer be available for execution and will become editable.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUnpublishModal(null)}
                className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={confirmUnpublish}
                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                Unpublish
              </button>
            </div>
          </div>
        </div>
      )}

      {showCloneModal && (
          <CloneModal 
            onClose={() => setShowCloneModal(null)}
            onClone={handleCloneConfirm}
            theme={theme}
          />
      )}
    </div>
  );
};

// Enhanced API Studio Component
const APIStudio = ({ config, configs, onUpdate, onExit, onDelete, environment, theme, showToast, mode, onPublish, onUnpublish, onPromote, onMakeVersionActive, onCloneFromVersion, onModeChange, onShowHelp }) => {
  const [activeTab, setActiveTab] = useState('workflow');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState(null);
  const [executionSteps, setExecutionSteps] = useState([]);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showJsonEditor, setShowJsonEditor] = useState(false);
  const [showApiSpec, setShowApiSpec] = useState(false);
  const [testInputs, setTestInputs] = useState({});
  const [showVersionDropdown, setShowVersionDropdown] = useState(false);
  const [viewingVersion, setViewingVersion] = useState(null);
  const [cloningVersion, setCloningVersion] = useState(null);
  const currentVersion = useMemo(() => config.versions.find(v => v.isCurrent), [config.versions]);
  const permissions = getEnvPermissions(environment);

  // Determine if the studio is in a read-only state based on mode, status, and environment.
  const isReadOnly = useMemo(() => {
      if (mode === 'view') return true;
      if (!permissions.allowEdit) return true;
      if (config.status === 'published') return true;
      return false;
  }, [mode, config.status, permissions]);

  useEffect(() => {
    if (viewingVersion && currentVersion && viewingVersion.id === currentVersion.id) {
      setViewingVersion({
        ...currentVersion,
        content: {
          workflow: config.workflow,
          inputSchema: config.inputSchema,
          outputSchema: config.outputSchema
        }
      });
    }
  }, [config.workflow, config.inputSchema, config.outputSchema, currentVersion, viewingVersion]);


  const handleSave = () => {
    const content = {
      workflow: config.workflow,
      inputSchema: config.inputSchema,
      outputSchema: config.outputSchema
    };

    let updatedConfig;

    if (config.wasPublished) {
      const newVersionNumber = (config.versions.length > 0 ? Math.max(...config.versions.map(v => v.version)) : 0) + 1;
      const newVersion = {
        id: `v_${Date.now()}`,
        version: newVersionNumber,
        createdAt: new Date().toISOString(),
        description: `Saved changes as v${newVersionNumber}`,
        content
      };
      updatedConfig = {
        ...config,
        versions: [
          ...config.versions.map(v => ({ ...v, isCurrent: false })),
          { ...newVersion, isCurrent: true }
        ],
        modifiedAt: new Date().toISOString()
      };
    } else {
      const updatedVersions = config.versions.map(v =>
        v.isCurrent ? { ...v, content } : v
      );
      updatedConfig = {
        ...config,
        versions: updatedVersions,
        modifiedAt: new Date().toISOString()
      };
    }

    onUpdate(updatedConfig);
    showToast('API configuration saved', 'success');
  };

  const handlePublishToggle = () => {
      if (config.status === 'published') {
          if (window.confirm('Unpublish this API?')) {
              onUnpublish(config.id);
          }
      } else {
          if (window.confirm('Publish this API?')) {
              onPublish(config.id);
          }
      }
  };
  
  const handleExecuteWorkflow = async () => {
    setIsExecuting(true);
    setExecutionResults(null);
    setExecutionSteps([]);
    try {
      const res = await fetch(`${INTEGRATOR_BASE_URL}/${config.name}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.token ? { 'Authorization': `Bearer ${config.token}` } : {})
        },
        body: JSON.stringify({ input: testInputs, config })
      });
      const data = await res.json();
      const steps = data.steps || [];
      for (const step of steps) {
        setExecutionSteps(prev => [...prev, { name: step.name || `Step ${prev.length + 1}`, status: 'running' }]);
        await new Promise(r => setTimeout(r, 500));
        setExecutionSteps(prev => prev.map((s, idx) => idx === prev.length - 1 ? { ...s, status: 'success' } : s));
      }
      setExecutionResults({ result: { status: 'success', data: data.output || data } });
      showToast('Workflow executed successfully', 'success');
    } catch (err) {
      showToast('Workflow execution failed', 'error');
    } finally {
      setIsExecuting(false);
    }
  };
  
    const handlePromoteEnvironment = (fromEnv, toEnv, versionId) => {
      const promotedVersion = config.versions.find(v => v.id === versionId);
      if (!promotedVersion) return;
      if (!window.confirm(`Promote version v${promotedVersion.version} from ${fromEnv.toUpperCase()} to ${toEnv.toUpperCase()}?`)) return;

      const timestamp = new Date().toISOString();
      const targets = [toEnv];
      if (toEnv === 'uat') targets.push('uatdr');
      if (toEnv === 'prod') targets.push('dr');

      const updatedEnvironments = { ...config.environments };
      targets.forEach(target => {
        const history = [
          ...(config.environments[target]?.promotionHistory || []),
          { versionId: promotedVersion.id, promotedFrom: fromEnv, date: timestamp }
        ];
        updatedEnvironments[target] = {
          ...config.environments[target],
          promotedVersionId: promotedVersion.id,
          lastPromotion: timestamp,
          promotedFrom: fromEnv,
          promotionHistory: history
        };
      });

      const updatedConfig = {
        ...config,
        environments: updatedEnvironments
      };
      onUpdate(updatedConfig);
      setShowPromoteModal(false);
      showToast(`Configuration version v${promotedVersion.version} promoted from ${fromEnv.toUpperCase()} to ${targets.map(t => t.toUpperCase()).join(', ')}`, 'success');
    };

  const handleDepromote = () => {
    if (!window.confirm(`Depromote environment ${environment.toUpperCase()}?`)) return;
    const history = config.environments[environment]?.promotionHistory || [];
    const newHistory = history.slice(0, -1);
    const last = newHistory[newHistory.length - 1];
    const updatedConfig = {
      ...config,
      environments: {
        ...config.environments,
        [environment]: {
          ...config.environments[environment],
          promotedVersionId: last?.versionId || null,
          promotedFrom: last?.promotedFrom || null,
          lastPromotion: last?.date || null,
          promotionHistory: newHistory
        }
      }
    };
    onUpdate(updatedConfig);
    showToast(`Environment ${environment.toUpperCase()} depromoted`, 'info');
  };
  
  const handleCloneConfirm = (newName, newApp, tags) => {
      if (cloningVersion) {
          onCloneFromVersion(cloningVersion, newName, newApp, tags);
          setCloningVersion(null);
      }
  };

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
                readOnly={isReadOnly}
                onChange={(e) => onUpdate({ ...config, name: e.target.value })}
                className={`text-md font-semibold bg-transparent border-none outline-none ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                } ${isReadOnly ? 'cursor-default' : ''}`}
              />
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Last modified {new Date(config.modifiedAt).toLocaleDateString()}
              </p>
              <input
                type="text"
                value={(config.tags || []).join(', ')}
                readOnly={isReadOnly}
                onChange={(e) => onUpdate({ ...config, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                placeholder="tags (comma separated)"
                className={`mt-1 text-xs px-2 py-1 rounded border ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-gray-300'
                    : 'bg-white border-gray-300 text-gray-700'
                } ${isReadOnly ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full">
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

            {permissions.allowEdit && (
              <button
                onClick={() => onModeChange(mode === 'view' ? 'edit' : 'view')}
                disabled={mode === 'view' && config.status === 'published'}
                title={
                  mode === 'view'
                    ? (config.status === 'published' ? 'Unpublish to edit' : 'Switch to edit mode')
                    : 'Switch to view mode'
                }
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors border ${
                  theme === 'dark'
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {mode === 'view' ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {mode === 'view' ? 'Edit' : 'View'}
              </button>
            )}

            <div className="relative">
              <button
                onClick={() => setShowVersionDropdown(!showVersionDropdown)}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors border ${
                  theme === 'dark'
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                } ${
                  viewingVersion && viewingVersion.id !== currentVersion?.id
                    ? theme === 'dark'
                      ? 'bg-yellow-900 border-yellow-700 text-yellow-300'
                      : 'bg-yellow-100 border-yellow-300 text-yellow-800'
                    : ''
                }`}
              >
                <FileStack className="w-4 h-4" />
                {viewingVersion ? `v${viewingVersion.version}` : 'Versions'}
              </button>
              {showVersionDropdown && (
                <VersionDropdown
                  config={config}
                  theme={theme}
                  onClose={() => setShowVersionDropdown(false)}
                  onSelectVersion={setViewingVersion}
                  viewingVersion={viewingVersion}
                  onCloneVersion={(version) => { setShowVersionDropdown(false); setCloningVersion(version); }}
                  onMakeActive={(versionId) => { setShowVersionDropdown(false); onMakeVersionActive(versionId); }}
                  environment={environment}
                />
              )}
            </div>
            {viewingVersion && (
              <span
                className={`text-xs px-2 py-0.5 rounded border ${
                  viewingVersion.id === currentVersion?.id
                    ? theme === 'dark'
                      ? 'border-green-700 text-green-300'
                      : 'border-green-300 text-green-700'
                    : theme === 'dark'
                      ? 'border-yellow-700 text-yellow-300'
                      : 'border-yellow-300 text-yellow-800'
                }`}
              >
                Viewing v{viewingVersion.version}
                {viewingVersion.id === currentVersion?.id ? '' : ' (not active)'}
              </span>
            )}

            <div className="flex items-center gap-2 ml-auto">
              {permissions.allowEdit ? (
                <>
                  <button
                    onClick={handleExecuteWorkflow}
                    disabled={isExecuting}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    Execute
                  </button>

                  {!isReadOnly && (
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                  )}

                  <button
                    onClick={handlePublishToggle}
                    title={config.status === 'published' ? 'Unpublish to make changes' : 'Publish API'}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      config.status === 'published'
                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                    }`}
                  >
                    {config.status === 'published' ? <CloudOff className="w-4 h-4" /> : <Cloud className="w-4 h-4" />}
                    {config.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowPromoteModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <GitMerge className="w-4 h-4" />
                    Promote
                  </button>
                  {config.environments[environment]?.promotedVersionId && (
                    <button
                      onClick={handleDepromote}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <GitBranch className="w-4 h-4" />
                      Depromote
                    </button>
                  )}
                </>
              )}

              <button
                onClick={() => setShowApiSpec(true)}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <FileCode className="w-5 h-5" />
              </button>

              <button
                onClick={onShowHelp}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
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
          executionSteps={executionSteps}
          onCloseExecutionResults={() => setExecutionResults(null)}
          testInputs={testInputs}
          onUpdateTestInputs={setTestInputs}
          showToast={showToast}
          isReadOnly={isReadOnly}
        />
      </div>
      
      {/* Modals rendered on top */}
      {showJsonEditor && (
        <JsonEditor
          config={viewingVersion ? { ...config, ...viewingVersion.content } : config}
          theme={theme}
          onClose={() => setShowJsonEditor(false)}
          isReadOnly={isReadOnly}
          onApply={(updated) => { onUpdate(updated); setShowJsonEditor(false); }}
        />
      )}

      {showApiSpec && (
        <ApiSpecModal
          config={viewingVersion ? { ...config, ...viewingVersion.content } : config}
          theme={theme}
          onClose={() => setShowApiSpec(false)}
        />
      )}

      {showPromoteModal && (
        <PromoteModal
          config={config}
          onPromote={handlePromoteEnvironment}
          onClose={() => setShowPromoteModal(false)}
          theme={theme}
          fromEnv={environment}
          versions={config.versions}
        />
      )}
      {cloningVersion && (
          <CloneModal
            onClose={() => setCloningVersion(null)}
            onClone={handleCloneConfirm}
            theme={theme}
          />
      )}
    </div>
  );
};

// Enhanced Workflow Designer Component
const WorkflowDesigner = ({ config, onUpdate, environment, theme, executionResults, executionSteps, onCloseExecutionResults, testInputs, onUpdateTestInputs, showToast, isReadOnly }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [draggingNode, setDraggingNode] = useState(null);
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [view, setView] = useState({ x: 0, y: 0, zoom: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const dragStartPos = useRef(null);
  const canvasRef = useRef(null);
  
  const nodeTypes = [
    { type: 'api', label: 'REST API', icon: Globe, color: 'blue', description: 'Call REST endpoints' },
    { type: 'graphql', label: 'GraphQL', icon: Cpu, color: 'purple', description: 'Execute GraphQL queries' },
    { type: 'transform', label: 'Transform', icon: GitBranch, color: 'green', description: 'Transform data structure' },
    { type: 'filter', label: 'Filter', icon: Filter, color: 'orange', description: 'Filter data using predicates' },
    { type: 'aggregate', label: 'Group By', icon: Database, color: 'red', description: 'Group data with metrics' },
    { type: 'condition', label: 'Condition', icon: Diamond, color: 'yellow', description: 'Conditional branching' }
  ];

  const handleZoom = (direction, factor = 0.1) => {
    setView(prev => {
        const newZoom = direction === 'in' ? prev.zoom * (1 + factor) : prev.zoom * (1 - factor);
        return { ...prev, zoom: Math.max(0.2, Math.min(2, newZoom)) };
    });
  };

  const handleFitToScreen = () => {
    if (!canvasRef.current || config.workflow?.nodes?.length === 0) {
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

  const handleBeautify = () => {
    if (!config.workflow?.nodes) return;

    const nodes = config.workflow.nodes;
    const edges = config.workflow.edges || [];

    const spacingX = 220;
    const spacingY = 120;

    const adjacency = {};
    edges.forEach(e => {
      adjacency[e.source] = adjacency[e.source] || [];
      adjacency[e.source].push(e.target);
    });

    const startNode = nodes.find(n => n.type === 'start') || nodes[0];
    const levels = {};
    const queue = [startNode.id];
    levels[startNode.id] = 0;
    while (queue.length) {
      const id = queue.shift();
      (adjacency[id] || []).forEach(t => {
        if (levels[t] == null) {
          levels[t] = levels[id] + 1;
          queue.push(t);
        }
      });
    }

    const grouped = {};
    nodes.forEach(n => {
      const lvl = levels[n.id] ?? 0;
      grouped[lvl] = grouped[lvl] || [];
      grouped[lvl].push(n);
    });

    const positioned = nodes.map(n => {
      const lvl = levels[n.id] ?? 0;
      const idx = grouped[lvl].indexOf(n);
      return {
        ...n,
        position: {
          x: lvl * spacingX,
          y: idx * spacingY
        }
      };
    });

    onUpdate({ ...config, workflow: { ...config.workflow, nodes: positioned } });
    setTimeout(() => handleFitToScreen(), 0);
  };
  
  const handleDragStart = (e, nodeType) => {
    if(isReadOnly) return;
    e.dataTransfer.setData('nodeType', nodeType.type);
    e.dataTransfer.effectAllowed = 'copy';
  };
  
  const handleDrop = (e) => {
    if(isReadOnly) return;
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
        status: 'idle',
        ...(nodeType === 'filter'
          ? { mode: 'keep', where: null, whereInput: '', offset: undefined, limit: undefined }
          : {})
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
    if(isReadOnly) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };
  
  const handleNodeDragStart = (nodeId, e) => {
    if(isReadOnly) return;
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

    if (draggingNode && canvasRef.current && !isReadOnly) {
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
    
    if (connectingFrom && canvasRef.current && !isReadOnly) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        setConnectingFrom({
          ...connectingFrom,
          mouseX: e.clientX - rect.left,
          mouseY: e.clientY - rect.top
        });
      }
    }
  }, [draggingNode, isPanning, lastMousePos, view, connectingFrom, config, onUpdate, isReadOnly]);
  
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
    if(isReadOnly) return;
    if (fromNodeId === toNodeId) return;
    
    const existingEdge = config.workflow?.edges?.find(
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
        edges: [...(config.workflow?.edges || []), newEdge]
      }
    });
    
    setConnectingFrom(null);
    showToast('Nodes connected', 'success');
  };
  
  const handleDeleteNode = (nodeId) => {
    if(isReadOnly) return;
    const updatedNodes = (config.workflow?.nodes || []).filter(n => n.id !== nodeId);
    const updatedEdges = (config.workflow?.edges || []).filter(
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
    if(isReadOnly) return;
    const updatedEdges = (config.workflow?.edges || []).filter(e => e.id !== edgeId);
    
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
              draggable={!isReadOnly}
              onDragStart={(e) => handleDragStart(e, nodeType)}
              className={`p-2 rounded-lg transition-all ${isReadOnly ? 'cursor-not-allowed opacity-50' : 'cursor-move hover:scale-105'} ${
                theme === 'dark' 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg bg-gradient-to-br from-${nodeType.color}-500/20 to-transparent`}>
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
            className={`flex-1 relative overflow-hidden ${isReadOnly ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}`}
            ref={canvasRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onMouseDown={handleCanvasMouseDown}
            onWheel={handleWheel}
        >
          <div className="absolute top-2 left-2 z-10 px-2 py-1 text-xs font-semibold rounded bg-blue-600 text-white">
            {environment.toUpperCase()}
          </div>
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
                  {(config.workflow?.edges || []).map(edge => {
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
                        {!isReadOnly && (
                          <g
                            className="cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteEdge(edge.id)}
                            style={{ pointerEvents: 'auto' }}
                          >
                            <circle cx={midX} cy={(sourceY + targetY) / 2} r="10" fill={theme === 'dark' ? '#374151' : '#f3f4f6'}/>
                            <X className="w-3 h-3 text-red-500" style={{transform: `translate(${midX - 6}px, ${(sourceY + targetY) / 2 - 6}px)`}}/>
                          </g>
                        )}
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
                {(config.workflow?.nodes || []).map(node => {
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
                      } ${isReadOnly ? '' : 'cursor-move'}`}
                      style={{
                        left: `${node.position.x}px`,
                        top: `${node.position.y}px`,
                        width: '180px'
                      }}
                      onMouseDown={(e) => {
                        if (!e.target.closest('.node-action') && !isReadOnly) {
                          dragStartPos.current = { x: e.clientX, y: e.clientY };
                          handleNodeDragStart(node.id, e);
                        }
                      }}
                      onMouseUp={(e) => {
                        if (connectingFrom && connectingFrom.nodeId !== node.id) {
                            handleNodeConnect(connectingFrom.nodeId, node.id);
                        }
                        if (!isReadOnly && dragStartPos.current) {
                          const dx = Math.abs(e.clientX - dragStartPos.current.x);
                          const dy = Math.abs(e.clientY - dragStartPos.current.y);
                          if (dx < 5 && dy < 5) {
                            setSelectedNode(node);
                          }
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
                          {node.type !== 'start' && node.type !== 'end' && !isReadOnly && (
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
                      {!isReadOnly && node.type !== 'end' && (
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
                      
                      {!isReadOnly && node.type !== 'start' && (
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
        {executionSteps.length > 0 && (
          <div className={`absolute top-4 right-4 p-4 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <h4 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Execution Progress</h4>
            <ol className="space-y-1">
              {executionSteps.map((step, idx) => (
                <li key={idx} className="text-xs flex items-center gap-2">
                  {step.status === 'success' ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Loader2 className="w-3 h-3 animate-spin" />}
                  <span>{step.name}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
          {/* Zoom Controls */}
           <div className="absolute bottom-4 right-4 flex items-center gap-1">
                <button onClick={() => handleZoom('out')} className={`p-2 rounded-lg shadow-md transition-colors ${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-600 hover:bg-gray-100'}`}><ZoomOut className="w-5 h-5" /></button>
                <button onClick={handleFitToScreen} className={`p-2 rounded-lg shadow-md transition-colors ${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-600 hover:bg-gray-100'}`}><Maximize2 className="w-5 h-5" /></button>
                <button onClick={handleBeautify} className={`p-2 rounded-lg shadow-md transition-colors ${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-600 hover:bg-gray-100'}`}><Sparkles className="w-5 h-5" /></button>
                <button onClick={() => handleZoom('in')} className={`p-2 rounded-lg shadow-md transition-colors ${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-600 hover:bg-gray-100'}`}><ZoomIn className="w-5 h-5" /></button>
            </div>
        </div>
        
        {/* Properties Panel */}
        {selectedNode && selectedNode.type !== 'end' && (
          <NodePropertiesPanel
            node={selectedNode}
            environment={environment}
            onUpdate={(updated) => {
              if (selectedNode.type === 'start') {
                onUpdate({
                  ...config,
                  inputSchema: updated
                });
              } else {
                const updatedNodes = (config.workflow?.nodes || []).map(n =>
                  n.id === updated.id ? updated : n
                );
                let newConfig = {
                  ...config,
                  workflow: {
                    ...config.workflow,
                    nodes: updatedNodes
                  }
                };
                if (updated.type === 'aggregate') {
                  newConfig = {
                    ...newConfig,
                    outputSchema: generateGroupByOutputSchema(updated.data)
                  };
                }
                onUpdate(newConfig);
              }
            }}
            onClose={() => setSelectedNode(null)}
            theme={theme}
            showToast={showToast}
            config={config}
            isReadOnly={isReadOnly}
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
const NodePropertiesPanel = ({ node, onUpdate, onClose, theme, showToast, config, isReadOnly, environment }) => {
  const [testResponse, setTestResponse] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [activeTab, setActiveTab] = useState('config');
  const [schemaMode, setSchemaMode] = useState('form');
  const [localSchema, setLocalSchema] = useState({});
  const [schemaJson, setSchemaJson] = useState('{}');
  const [panelWidth, setPanelWidth] = useState(448);
  const resizingRef = useRef(false);

  const startResize = (e) => {
    resizingRef.current = true;
    e.preventDefault();
  };

  useEffect(() => {
    const handleMove = (e) => {
      if (!resizingRef.current) return;
      const newWidth = Math.min(Math.max(300, window.innerWidth - e.clientX), 800);
      setPanelWidth(newWidth);
    };
    const stopResize = () => {
      resizingRef.current = false;
    };
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', stopResize);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', stopResize);
    };
  }, []);

  useEffect(() => {
    const nested = nestSchema(config.inputSchema || {});
    setLocalSchema(nested);
    setSchemaJson(JSON.stringify(nested, null, 2));
  }, [config.inputSchema]);

  if (node.type === 'start') {
    const updateSchema = (updater) => {
      setLocalSchema(prev => {
        const copy = JSON.parse(JSON.stringify(prev));
        updater(copy);
        onUpdate(flattenSchema(copy));
        setSchemaJson(JSON.stringify(copy, null, 2));
        return copy;
      });
    };

    const handleFieldNameChange = (pathArr, newName) => {
      updateSchema(schema => {
        const parent = pathArr.slice(0, -1).reduce((acc, key) => {
          if (key === 'items') return acc.items.fields;
          return acc[key].fields;
        }, schema);
        const field = parent[pathArr[pathArr.length - 1]];
        delete parent[pathArr[pathArr.length - 1]];
        parent[newName] = field;
      });
    };

    const handleTypeChange = (pathArr, newType) => {
      updateSchema(schema => {
        const field = pathArr.reduce((acc, key, idx) => {
          return idx === pathArr.length - 1 ? acc[key] : acc[key].fields;
        }, schema);
        field.type = newType;
        if (newType === 'object') {
          field.fields = field.fields || {};
          delete field.items;
        } else if (newType === 'array') {
          field.items = field.items || { type: 'string' };
          delete field.fields;
        } else {
          delete field.fields;
          delete field.items;
        }
      });
    };

    const handleItemTypeChange = (pathArr, newType) => {
      updateSchema(schema => {
        const field = pathArr.reduce((acc, key, idx) => {
          return idx === pathArr.length - 1 ? acc[key] : acc[key].fields;
        }, schema);
        field.items = field.items || {};
        field.items.type = newType;
        if (newType === 'object') {
          field.items.fields = field.items.fields || {};
        } else {
          delete field.items.fields;
        }
      });
    };

    const handleDelete = (pathArr) => {
      updateSchema(schema => {
        const parent = pathArr.slice(0, -1).reduce((acc, key) => {
          if (key === 'items') return acc.items.fields;
          return acc[key].fields;
        }, schema);
        delete parent[pathArr[pathArr.length - 1]];
      });
    };

    const handleAddField = (pathArr) => {
      updateSchema(schema => {
        const parent = pathArr.reduce((acc, key) => {
          if (!key) return acc;
          if (key === 'items') {
            acc.items = acc.items || { type: 'object', fields: {} };
            acc.items.fields = acc.items.fields || {};
            return acc.items.fields;
          }
          acc[key] = acc[key] || { type: 'object', fields: {} };
          acc[key].fields = acc[key].fields || {};
          return acc[key].fields;
        }, schema);
        let idx = 1;
        let fieldName;
        do {
          fieldName = `field_${idx++}`;
        } while (parent[fieldName]);
        parent[fieldName] = { type: 'string' };
      });
    };

    const renderFields = (schema, path = []) => (
      Object.entries(schema).map(([key, value]) => {
        const currentPath = [...path, key];
        const level = path.length;
        return (
          <div key={currentPath.join('.')} className="space-y-1">
            <div className="flex items-center gap-2" style={{ marginLeft: level * 12 }}>
              <input
                type="text"
                value={key}
                readOnly={isReadOnly}
                onChange={(e) => handleFieldNameChange(currentPath, e.target.value)}
                className={`flex-1 px-2 py-1 text-sm rounded border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300'
                } ${isReadOnly ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
              />
              <select
                value={value.type || 'string'}
                disabled={isReadOnly}
                onChange={(e) => handleTypeChange(currentPath, e.target.value)}
                className={`px-2 py-1 text-sm rounded border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300'
                } ${isReadOnly ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
              >
                <option value="string">string</option>
                <option value="number">number</option>
                <option value="boolean">boolean</option>
                <option value="object">object</option>
                <option value="array">array</option>
              </select>
              {value.type === 'array' && (
                <select
                  value={value.items?.type || 'string'}
                  disabled={isReadOnly}
                  onChange={(e) => handleItemTypeChange(currentPath, e.target.value)}
                  className={`px-2 py-1 text-sm rounded border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300'
                  } ${isReadOnly ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                >
                  <option value="string">string</option>
                  <option value="number">number</option>
                  <option value="boolean">boolean</option>
                  <option value="object">object</option>
                </select>
              )}
              {!isReadOnly && (
                <button onClick={() => handleDelete(currentPath)} className="text-red-500 hover:text-red-600">
                  <X className="w-4 h-4" />
                </button>
              )}
              {value.type === 'object' && !isReadOnly && (
                <button onClick={() => handleAddField(currentPath)} className="text-xs px-1">
                  + Field
                </button>
              )}
              {value.type === 'array' && value.items?.type === 'object' && !isReadOnly && (
                <button onClick={() => handleAddField([...currentPath, 'items'])} className="text-xs px-1">
                  + Field
                </button>
              )}
            </div>
            {value.type === 'object' && value.fields && renderFields(value.fields, currentPath)}
            {value.type === 'array' && value.items?.type === 'object' && value.items.fields && (
              renderFields(value.items.fields, [...currentPath, 'items'])
            )}
          </div>
        );
      })
    );

    const ensureObjectFields = (schema) => {
      Object.values(schema).forEach(field => {
        if (field.type === 'object') {
          field.fields = field.fields || {};
          ensureObjectFields(field.fields);
        } else if (field.type === 'array' && field.items?.type === 'object') {
          field.items.fields = field.items.fields || {};
          ensureObjectFields(field.items.fields);
        }
      });
    };

    const applyJson = () => {
      try {
        const parsed = JSON.parse(schemaJson || '{}');
        ensureObjectFields(parsed);
        setLocalSchema(parsed);
        onUpdate(flattenSchema(parsed));
      } catch (e) {
        showToast('Invalid JSON', 'error');
      }
    };

    return (
      <div
        className={`fixed top-0 right-0 h-full border-l ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } overflow-y-auto`}
        style={{ width: panelWidth }}
      >
        <div
          className="absolute left-0 top-0 h-full w-1 cursor-ew-resize"
          onMouseDown={startResize}
        />
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Input Structure</h3>
            <div className="flex gap-2 text-xs">
              <button onClick={() => setSchemaMode('form')} className={schemaMode === 'form' ? 'text-blue-500' : ''}>Form</button>
              <button onClick={() => setSchemaMode('json')} className={schemaMode === 'json' ? 'text-blue-500' : ''}>JSON</button>
            </div>
            <button
              onClick={onClose}
              className={`p-1 rounded transition-colors ${
                theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          </div>

          {schemaMode === 'form' ? (
            <div className="space-y-2">
              {renderFields(localSchema)}
              {!isReadOnly && (
                <button
                  onClick={() => handleAddField([])}
                  className={`px-2 py-1 text-sm rounded border w-full text-left ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-gray-300'
                      : 'bg-white border-gray-300 text-gray-700'
                  }`}
                >
                  + Add Field
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                value={schemaJson}
                onChange={(e) => setSchemaJson(e.target.value)}
                className={`w-full h-40 px-3 py-2 rounded-lg border font-mono text-sm ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                readOnly={isReadOnly}
              />
              {!isReadOnly && (
                <button
                  onClick={applyJson}
                  className={`px-2 py-1 text-sm rounded border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-gray-300'
                      : 'bg-white border-gray-300 text-gray-700'
                  }`}
                >
                  Apply
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

    const handleTestApi = async () => {
      setIsTesting(true);
      setTestResponse(null);
      try {
        const res = await fetch(`${INTEGRATOR_BASE_URL}/${config.name}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(config.token ? { 'Authorization': `Bearer ${config.token}` } : {})
          },
          body: JSON.stringify({ config, nodeId: node.id })
        });
        const data = await res.json();
        setTestResponse({ status: res.status, data });
        showToast('API test successful', 'success');
        if (node.type === 'api' || node.type === 'graphql') {
          onUpdate({
            ...node,
            data: {
              ...node.data,
              responseSchema: extractSchema(data)
            }
          });
        }
      } catch (err) {
        setTestResponse({ status: 500, data: { error: err.message } });
        showToast('API test failed', 'error');
      } finally {
        setIsTesting(false);
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
  
  const addTransformation = (op) => {
    const transformations = node.data.transformations || [];
    const def = TRANSFORM_OPS[op];
    if (!def) return;

    const newTransformation = {
      id: `transform_${Date.now()}`,
      op,
      target: '',
      config: JSON.parse(JSON.stringify(def.defaultConfig)),
      onError: 'continue'
    };

    onUpdate({
      ...node,
      data: {
        ...node.data,
        transformations: [...transformations, newTransformation]
      }
    });
  };

  const updateTransformation = (transformId, updates) => {
    const transformations = node.data.transformations || [];
    const updated = transformations.map(t => {
      if (t.id !== transformId) return t;
      const def = TRANSFORM_OPS[t.op] || { defaultConfig: {} };
      const allowed = Object.keys(def.defaultConfig || {});
      const newT = { ...t };
      if (updates.target !== undefined) newT.target = updates.target;
      if (updates.onError !== undefined) newT.onError = updates.onError;
      if (updates.config) {
        const clean = {};
        Object.entries(updates.config).forEach(([k, v]) => {
          if (allowed.includes(k)) clean[k] = v;
        });
        newT.config = { ...t.config, ...clean };
      }
      return newT;
    });

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
    const incomingEdges = config.workflow?.edges.filter(e => e.target === node.id);
    if (!incomingEdges || incomingEdges.length === 0) return {};

    const sourceNodeId = incomingEdges[0].source;
    const sourceNode = config.workflow?.nodes.find(n => n.id === sourceNodeId);

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

  const availableFields = Object.keys(getSourceSchemaForTransform());
  const fieldOptionsId = `field-options-${node.id}`;
  
    return (
      <div
        className={`fixed top-0 right-0 h-full border-l ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } overflow-y-auto`}
        style={{ width: panelWidth }}
      >
      <div
        className="absolute left-0 top-0 h-full w-1 cursor-ew-resize"
        onMouseDown={startResize}
      />
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
          <datalist id={fieldOptionsId}>
            {availableFields.map(f => (
              <option key={f} value={f} />
            ))}
          </datalist>
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Node Name
            </label>
            <input
              type="text"
              value={node.data.label || ''}
              readOnly={isReadOnly}
              onChange={(e) => onUpdate({
                ...node,
                data: { ...node.data, label: e.target.value }
              })}
              className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
              } ${isReadOnly ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
            />
          </div>

          {(node.type === 'api' || node.type === 'graphql') && (
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Predefined {node.type === 'api' ? 'REST' : 'GraphQL'} API
              </label>
              <select
                value={node.data.predefinedId || ''}
                disabled={isReadOnly}
                onChange={(e) => {
                  const id = e.target.value;
                  if (!id) {
                    onUpdate({ ...node, data: { ...node.data, predefinedId: '' } });
                    return;
                  }
                  const catalog = node.type === 'api' ? apiCatalog.restApis : apiCatalog.graphqlApis;
                  const api = catalog.find(a => a.id === id);
                  if (api) {
                    onUpdate({
                      ...node,
                      data: {
                        ...node.data,
                        predefinedId: id,
                        method: api.method || node.data.method,
                        endpoint: api.environments ? (api.environments[environment] || api.endpoint) : api.endpoint,
                        query: api.query || node.data.query,
                        authentication: api.auth || node.data.authentication
                      }
                    });
                  }
                }}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } ${isReadOnly ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
              >
                <option value="">Custom</option>
                {(node.type === 'api' ? apiCatalog.restApis : apiCatalog.graphqlApis).map(api => (
                  <option key={api.id} value={api.id}>{api.name}</option>
                ))}
              </select>
            </div>
          )}

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
                      disabled={isReadOnly}
                      onChange={(e) => onUpdate({
                        ...node,
                        data: { ...node.data, method: e.target.value }
                      })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300'
                      } ${isReadOnly ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
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
                      readOnly={isReadOnly}
                      onChange={(e) => onUpdate({
                        ...node,
                        data: { ...node.data, endpoint: e.target.value }
                      })}
                      placeholder="https://api.example.com/data"
                      className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300'
                      } ${isReadOnly ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
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
                    readOnly={isReadOnly}
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
                    } ${isReadOnly ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
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
                  disabled={isReadOnly}
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
                  } ${isReadOnly ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
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
                disabled={isTesting || isReadOnly}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isTesting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white disabled:bg-gray-400 disabled:cursor-not-allowed`}
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
                {!isReadOnly && (
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
                            {Object.entries(TRANSFORM_OPS).map(([op, def]) => (
                                <button
                                    key={op}
                                    onClick={() => {
                                        addTransformation(op);
                                        document.getElementById(`transform-menu-${node.id}`).classList.add('hidden');
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-opacity-10 hover:bg-blue-500 ${ theme === 'dark' ? 'text-gray-300' : 'text-gray-700' }`}
                                >
                                    {def.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
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
                        {TRANSFORM_OPS[transform.op]?.label || transform.op}
                      </span>
                      {!isReadOnly && (
                        <button
                          onClick={() => removeTransformation(transform.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <input
                        type="text"
                        list={fieldOptionsId}
                        placeholder="Target path"
                        value={transform.target || ''}
                        readOnly={isReadOnly}
                        onChange={(e) => updateTransformation(transform.id, { target: e.target.value })}
                        className={`w-full px-2 py-1 text-sm rounded border ${ theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300' } ${isReadOnly ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                      />

                      <select
                        value={transform.onError || 'continue'}
                        disabled={isReadOnly}
                        onChange={(e) => updateTransformation(transform.id, { onError: e.target.value })}
                        className={`w-full px-2 py-1 text-sm rounded border ${ theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300' } ${isReadOnly ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                      >
                        <option value="continue">Continue</option>
                        <option value="skip">Skip</option>
                        <option value="stop">Stop</option>
                      </select>

                      {transform.op === 'rename_fields' && (
                        <div className="space-y-2">
                          {(transform.config.mappings || []).map((m, idx) => (
                            <div key={idx} className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                list={fieldOptionsId}
                                placeholder="From field"
                                value={m.from || ''}
                                readOnly={isReadOnly}
                                onChange={(e) => {
                                  const mappings = [...(transform.config.mappings || [])];
                                  mappings[idx] = { ...m, from: e.target.value };
                                  updateTransformation(transform.id, { config: { mappings } });
                                }}
                                className={`px-2 py-1 text-sm rounded border ${ theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300' } ${isReadOnly ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                              />
                              <input
                                type="text"
                                placeholder="To field"
                                value={m.to || ''}
                                readOnly={isReadOnly}
                                onChange={(e) => {
                                  const mappings = [...(transform.config.mappings || [])];
                                  mappings[idx] = { ...m, to: e.target.value };
                                  updateTransformation(transform.id, { config: { mappings } });
                                }}
                                className={`px-2 py-1 text-sm rounded border ${ theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300' } ${isReadOnly ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                              />
                            </div>
                          ))}
                          {!isReadOnly && (
                            <button
                              onClick={() => {
                                const mappings = [...(transform.config.mappings || []), { from: '', to: '' }];
                                updateTransformation(transform.id, { config: { mappings } });
                              }}
                              className="text-xs text-blue-500"
                            >
                              Add Mapping
                            </button>
                          )}
                        </div>
                      )}

                      {transform.op === 'select_fields' && (
                        <div className="space-y-2">
                          {(transform.config.fields || []).map((f, idx) => (
                            <input
                              key={idx}
                              type="text"
                              list={fieldOptionsId}
                              placeholder="Field path"
                              value={f || ''}
                              readOnly={isReadOnly}
                              onChange={(e) => {
                                const fields = [...(transform.config.fields || [])];
                                fields[idx] = e.target.value;
                                updateTransformation(transform.id, { config: { fields } });
                              }}
                              className={`w-full px-2 py-1 text-sm rounded border ${ theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300' } ${isReadOnly ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                            />
                          ))}
                          {!isReadOnly && (
                            <button
                              onClick={() => {
                                const fields = [...(transform.config.fields || []), ''];
                                updateTransformation(transform.id, { config: { fields } });
                              }}
                              className="text-xs text-blue-500"
                            >
                              Add Field
                            </button>
                          )}
                        </div>
                      )}

                      {transform.op === 'compute_field' && (
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Output field"
                            value={transform.config.field || ''}
                            readOnly={isReadOnly}
                            onChange={(e) => updateTransformation(transform.id, { config: { field: e.target.value } })}
                            className={`w-full px-2 py-1 text-sm rounded border ${ theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300' } ${isReadOnly ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                          />
                          <input
                            type="text"
                            placeholder="Expression"
                            value={transform.config.expression || ''}
                            readOnly={isReadOnly}
                            onChange={(e) => updateTransformation(transform.id, { config: { expression: e.target.value } })}
                            className={`w-full px-2 py-1 text-sm rounded border font-mono ${ theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300' } ${isReadOnly ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                          />
                        </div>
                      )}

                      {transform.op === 'array_take' && (
                        <input
                          type="number"
                          min="1"
                          placeholder="Count"
                          value={transform.config.count ?? 1}
                          readOnly={isReadOnly}
                          onChange={(e) => updateTransformation(transform.id, { config: { count: Number(e.target.value) } })}
                          className={`w-full px-2 py-1 text-sm rounded border ${ theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300' } ${isReadOnly ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Filter Configuration */}
          {node.type === 'filter' && (
            <div className="space-y-2">
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Mode
              </label>
              <select
                value={node.data.mode || 'keep'}
                disabled={isReadOnly}
                onChange={(e) =>
                  onUpdate({
                    ...node,
                    data: { ...node.data, mode: e.target.value }
                  })
                }
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300'
                } ${isReadOnly ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
              >
                <option value="keep">keep</option>
                <option value="drop">drop</option>
              </select>

              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Where
              </label>
              <textarea
                value={node.data.whereInput || ''}
                readOnly={isReadOnly}
                onChange={(e) => {
                  const text = e.target.value;
                  const parsed = parseWhereInput(text);
                  onUpdate({
                    ...node,
                    data: { ...node.data, where: parsed, whereInput: text }
                  });
                }}
                placeholder="expr or predicate JSON"
                className={`w-full px-3 py-2 rounded-lg border font-mono text-sm ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300'
                } ${isReadOnly ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
              />

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className={`block text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Offset
                  </label>
                  <input
                    type="number"
                    value={node.data.offset ?? ''}
                    readOnly={isReadOnly}
                    onChange={(e) =>
                      onUpdate({
                        ...node,
                        data: {
                          ...node.data,
                          offset: e.target.value === '' ? undefined : Number(e.target.value)
                        }
                      })
                    }
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300'
                    } ${isReadOnly ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                  />
                </div>
                <div className="flex-1">
                  <label className={`block text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Limit
                  </label>
                  <input
                    type="number"
                    value={node.data.limit ?? ''}
                    readOnly={isReadOnly}
                    onChange={(e) =>
                      onUpdate({
                        ...node,
                        data: {
                          ...node.data,
                          limit: e.target.value === '' ? undefined : Number(e.target.value)
                        }
                      })
                    }
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300'
                    } ${isReadOnly ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                  />
                </div>
              </div>
            </div>
          )}
            
            {/* Group By Configuration */}
            {node.type === 'aggregate' && (
            <>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Target
                  </label>
                  <input
                    type="text"
                    value={node.data.target || ''}
                    readOnly={isReadOnly}
                    onChange={(e) => onUpdate({
                      ...node,
                      data: { ...node.data, target: e.target.value }
                    })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300'
                    } ${isReadOnly ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                  />
                </div>

                <div className="mt-2">
                  <label className={`block text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Group By Fields
                  </label>
                  <input
                    type="text"
                    value={(node.data.groupBy || []).join(',')}
                    readOnly={isReadOnly}
                    onChange={(e) => onUpdate({
                      ...node,
                      data: { ...node.data, groupBy: e.target.value.split(',').map(f => f.trim()).filter(Boolean) }
                    })}
                    placeholder="field1,field2"
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300'
                    } ${isReadOnly ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                  />
                </div>

                <div className="mt-2">
                  <label className={`block text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Metrics
                  </label>
                  {(node.data.metrics || []).map((m, idx) => (
                    <div key={idx} className="flex items-center gap-2 mb-1">
                      <input
                        type="text"
                        placeholder="alias"
                        value={m.alias || ''}
                        readOnly={isReadOnly}
                        onChange={(e) => {
                          const metrics = [...(node.data.metrics || [])];
                          metrics[idx] = { ...metrics[idx], alias: e.target.value };
                          onUpdate({ ...node, data: { ...node.data, metrics } });
                        }}
                        className={`flex-1 px-2 py-1 rounded border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300'
                        } ${isReadOnly ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                      />
                      <select
                        value={m.op || 'count'}
                        disabled={isReadOnly}
                        onChange={(e) => {
                          const metrics = [...(node.data.metrics || [])];
                          metrics[idx] = { ...metrics[idx], op: e.target.value };
                          onUpdate({ ...node, data: { ...node.data, metrics } });
                        }}
                        className={`px-2 py-1 rounded border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300'
                        } ${isReadOnly ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                      >
                        <option value="count">count</option>
                        <option value="sum">sum</option>
                        <option value="avg">avg</option>
                        <option value="min">min</option>
                        <option value="max">max</option>
                      </select>
                      <input
                        type="text"
                        placeholder="field"
                        value={m.field || ''}
                        readOnly={isReadOnly}
                        onChange={(e) => {
                          const metrics = [...(node.data.metrics || [])];
                          metrics[idx] = { ...metrics[idx], field: e.target.value };
                          onUpdate({ ...node, data: { ...node.data, metrics } });
                        }}
                        className={`flex-1 px-2 py-1 rounded border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300'
                        } ${isReadOnly ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                      />
                      {!isReadOnly && (
                        <button
                          onClick={() => {
                            const metrics = [...(node.data.metrics || [])];
                            metrics.splice(idx, 1);
                            onUpdate({ ...node, data: { ...node.data, metrics } });
                          }}
                          className="text-red-500"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  {!isReadOnly && (
                    <button
                      onClick={() => {
                        const metrics = [...(node.data.metrics || [])];
                        metrics.push({ alias: '', op: 'count', field: '' });
                        onUpdate({ ...node, data: { ...node.data, metrics } });
                      }}
                      className={`mt-1 px-2 py-1 text-xs rounded border border-dashed ${
                        theme === 'dark'
                          ? 'border-gray-600 text-gray-300'
                          : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      Add Metric
                    </button>
                  )}
                </div>

                <div className="mt-2">
                  <label className={`block text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Having
                  </label>
                  <input
                    type="text"
                    value={node.data.having || ''}
                    readOnly={isReadOnly}
                    onChange={(e) => onUpdate({ ...node, data: { ...node.data, having: e.target.value } })}
                    placeholder="e.g., count > 10"
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300'
                    } ${isReadOnly ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                  />
                </div>

                <div className="mt-2">
                  <label className={`block text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Order By
                  </label>
                  {(node.data.orderBy || []).map((o, idx) => (
                    <div key={idx} className="flex items-center gap-2 mb-1">
                      <input
                        type="text"
                        value={o.field || ''}
                        readOnly={isReadOnly}
                        onChange={(e) => {
                          const order = [...(node.data.orderBy || [])];
                          order[idx] = { ...order[idx], field: e.target.value };
                          onUpdate({ ...node, data: { ...node.data, orderBy: order } });
                        }}
                        className={`flex-1 px-2 py-1 rounded border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300'
                        } ${isReadOnly ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                      />
                      <select
                        value={o.direction || 'asc'}
                        disabled={isReadOnly}
                        onChange={(e) => {
                          const order = [...(node.data.orderBy || [])];
                          order[idx] = { ...order[idx], direction: e.target.value };
                          onUpdate({ ...node, data: { ...node.data, orderBy: order } });
                        }}
                        className={`px-2 py-1 rounded border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300'
                        } ${isReadOnly ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                      >
                        <option value="asc">asc</option>
                        <option value="desc">desc</option>
                      </select>
                      {!isReadOnly && (
                        <button
                          onClick={() => {
                            const order = [...(node.data.orderBy || [])];
                            order.splice(idx, 1);
                            onUpdate({ ...node, data: { ...node.data, orderBy: order } });
                          }}
                          className="text-red-500"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  {!isReadOnly && (
                    <button
                      onClick={() => {
                        const order = [...(node.data.orderBy || [])];
                        order.push({ field: '', direction: 'asc' });
                        onUpdate({ ...node, data: { ...node.data, orderBy: order } });
                      }}
                      className={`mt-1 px-2 py-1 text-xs rounded border border-dashed ${
                        theme === 'dark'
                          ? 'border-gray-600 text-gray-300'
                          : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      Add Order
                    </button>
                  )}
                </div>

                <div className="mt-2">
                  <label className={`block text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Limit
                  </label>
                  <input
                    type="number"
                    value={node.data.limit ?? ''}
                    readOnly={isReadOnly}
                    onChange={(e) => onUpdate({
                      ...node,
                      data: { ...node.data, limit: e.target.value ? Number(e.target.value) : undefined }
                    })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300'
                    } ${isReadOnly ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                  />
                </div>

                <div className="mt-2">
                  <label className={`block text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Pivot Field (optional)
                  </label>
                  <input
                    type="text"
                    value={node.data.pivot || ''}
                    readOnly={isReadOnly}
                    onChange={(e) => onUpdate({ ...node, data: { ...node.data, pivot: e.target.value } })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300'
                    } ${isReadOnly ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                  />
                </div>

                <div className="mt-2 flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={node.data.rollup || false}
                    disabled={isReadOnly}
                    onChange={(e) => onUpdate({
                      ...node,
                      data: { ...node.data, rollup: e.target.checked }
                    })}
                  />
                  <label className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Include grand total rollup
                  </label>
                </div>
            </>
            )}

          {node.type === 'condition' && (
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Condition Expression
              </label>
              <input
                type="text"
                list={fieldOptionsId}
                value={node.data.condition || ''}
                readOnly={isReadOnly}
                onChange={(e) => onUpdate({
                  ...node,
                  data: { ...node.data, condition: e.target.value }
                })}
                placeholder="e.g., user.age > 18"
                className={`w-full px-3 py-2 rounded-lg border font-mono text-sm ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300'
                } ${isReadOnly ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
              />
              <p className={`text-xs mt-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                True branch follows the 'Yes' connection.
              </p>
            </div>
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
  const [studioMode, setStudioMode] = useState('view'); // 'view' or 'edit'
  const [environment, setEnvironment] = useState('dev');
  const [theme, setTheme] = useState('light');
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'API deployment successful', time: '5 min ago', read: false, type: 'success' },
    { id: 2, message: 'New subscriber added', time: '1 hour ago', read: false, type: 'info' },
    { id: 3, message: 'Test suite completed', time: '2 hours ago', read: true, type: 'success' }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
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
        wasPublished: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        modifiedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['weather', 'rest', 'transform'],
        applications: ['Dashboard App'],
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
            { id: 'transform_1', type: 'transform', position: { x: 500, y: 200 }, data: { label: 'Transform Data', transformType: 'custom', transformations: [ { op: 'rename_fields', target: '', config: { mappings: [{ from: 'current.temp_c', to: 'temperature' }] }, onError: 'continue' }, { op: 'compute_field', target: '', config: { field: 'isHot', expression: 'temperature > 30' }, onError: 'continue' }, { op: 'array_take', target: 'forecast.forecastday', config: { count: 3 }, onError: 'continue' } ], status: 'idle' } },
            { id: 'end_1', type: 'end', position: { x: 700, y: 200 }, data: { label: 'End', status: 'idle' } }
          ],
          edges: [
            { id: 'e1', source: 'start_1', target: 'api_1', animated: false },
            { id: 'e2', source: 'api_1', target: 'transform_1', animated: false },
            { id: 'e3', source: 'transform_1', target: 'end_1', animated: false }
          ]
        },
        
        environments: {
          dev: { active: true, variables: { WEATHER_API_KEY: 'dev_key_12345', BASE_URL: 'https://api-dev.weatherapi.com' }, promotedVersionId: null, promotedFrom: null, lastPromotion: null, promotionHistory: [] },
          qa: { active: false, variables: { WEATHER_API_KEY: 'qa_key_67890', BASE_URL: 'https://api-qa.weatherapi.com' }, promotedVersionId: null, promotedFrom: null, lastPromotion: null, promotionHistory: [] },
          uat: { active: false, variables: {}, promotedVersionId: null, promotedFrom: null, lastPromotion: null, promotionHistory: [] },
          prod: { active: false, variables: {}, promotedVersionId: null, promotedFrom: null, lastPromotion: null, promotionHistory: [] }
        },
        versions: [
            { id: 'v1', version: 1, createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), description: 'Initial version', content: { 
                workflow: { nodes: [], edges: []},
                inputSchema: {},
                outputSchema: {}
            } },
            { id: 'v2', version: 2, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), description: 'Added weather endpoint', content: { 
                 workflow: {
                    nodes: [
                        { id: 'start_1', type: 'start', position: { x: 100, y: 200 }, data: { label: 'Start', status: 'idle' } },
                        { id: 'api_1', type: 'api', position: { x: 300, y: 200 }, data: { label: 'Fetch Weather', apiType: 'REST', method: 'GET', endpoint: 'https://api.weatherapi.com/v1/forecast.json', headers: { 'X-API-Key': '{{WEATHER_API_KEY}}' }, queryParams: { q: '{{city}}', days: '3' }, authentication: { type: 'apiKey', keyLocation: 'header', keyName: 'X-API-Key' }, timeout: 5000, retries: 3, status: 'idle' } },
                        { id: 'transform_1', type: 'transform', position: { x: 500, y: 200 }, data: { label: 'Transform Data', transformType: 'custom', transformations: [ { op: 'rename_fields', target: '', config: { mappings: [{ from: 'current.temp_c', to: 'temperature' }] }, onError: 'continue' }, { op: 'compute_field', target: '', config: { field: 'isHot', expression: 'temperature > 30' }, onError: 'continue' }, { op: 'array_take', target: 'forecast.forecastday', config: { count: 3 }, onError: 'continue' } ], status: 'idle' } },
                        { id: 'end_1', type: 'end', position: { x: 700, y: 200 }, data: { label: 'End', status: 'idle' } }
                    ],
                    edges: [
                        { id: 'e1', source: 'start_1', target: 'api_1', animated: false },
                        { id: 'e2', source: 'api_1', target: 'transform_1', animated: false },
                        { id: 'e3', source: 'transform_1', target: 'end_1', animated: false }
                    ]
                 },
                 inputSchema: { 
                    city: { type: "string", required: true, description: "The city name for the weather forecast.", example: "London" },
                    unit: { type: "string", required: false, description: "Temperature unit (celsius or fahrenheit).", example: "celsius" } 
                },
                outputSchema: { 
                    temperature: { type: "number", description: "The current temperature." },
                    condition: { type: "string", description: "The current weather condition." },
                    unit: { type: "string", description: "The unit of temperature."}
                },
             } , isCurrent: true},
        ],
        testSuites: [
          { id: 'test_1', name: 'Basic Weather Test', description: 'Tests weather API with sample cities', testCases: [ { id: 'tc_1', name: 'London Weather', input: { city: 'London' }, expectedOutput: { temperature: 15, loc_name: 'London' }, status: 'passed', lastRun: new Date().toISOString() }, { id: 'tc_2', name: 'New York Weather', input: { city: 'New York' }, expectedOutput: { temperature: 22, loc_name: 'New York' }, status: 'passed', lastRun: new Date().toISOString() } ] }
        ],
      },
      {
        id: 'api_demo_2',
        name: 'User Data Aggregator',
        description: 'Combines user data from multiple sources with advanced transformations.',
        version: '2.1.0',
        status: 'draft',
        wasPublished: false,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        modifiedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['graphql', 'aggregation', 'multi-api'],
        applications: ['CRM'],
        inputSchema: { userId: {type: "string", required: true, description: "The ID of the user to fetch.", example: "user-123"} },
        outputSchema: { grouped: {type: "array", description: "Grouped results."} },
        workflow: {
          nodes: [
            { id: 'start_1', type: 'start', position: { x: 50, y: 200 }, data: { label: 'Start', status: 'idle' } },
            { id: 'graphql_1', type: 'graphql', position: { x: 200, y: 200 }, data: { label: 'Fetch User Data', query: `query GetUser($id: ID!) { user(id: $id) { id name email profile { avatar bio } } }`, variables: { id: '{{userId}}' }, endpoint: 'https://api.example.com/graphql', status: 'idle' } },
            { id: 'api_2', type: 'api', position: { x: 400, y: 100 }, data: { label: 'Get Orders', apiType: 'REST', method: 'GET', endpoint: 'https://api.example.com/orders/{{userId}}', status: 'idle' } },
            { id: 'api_3', type: 'api', position: { x: 400, y: 300 }, data: { label: 'Get Preferences', apiType: 'REST', method: 'GET', endpoint: 'https://api.example.com/preferences/{{userId}}', status: 'idle' } },
            { id: 'aggregate_1', type: 'aggregate', position: { x: 600, y: 200 }, data: { label: 'Group Users', target: 'data', groupBy: ['status'], metrics: [{ alias: 'count', op: 'count', field: '*' }], status: 'idle' } },
            { id: 'transform_2', type: 'transform', position: { x: 800, y: 200 }, data: { label: 'Final Transform', transformations: [ { op: 'rename_fields', target: '', config: { mappings: [{ from: 'orders', to: 'userOrders' }] }, onError: 'continue' }, { op: 'select_fields', target: '', config: { fields: ['userOrders', 'preferences'] }, onError: 'continue' } ], status: 'idle' } },
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
          dev: { active: true, variables: {}, promotedVersionId: null, promotedFrom: null, lastPromotion: null, promotionHistory: [] },
          qa: { active: false, variables: {}, promotedVersionId: null, promotedFrom: null, lastPromotion: null, promotionHistory: [] },
          uat: { active: false, variables: {}, promotedVersionId: null, promotedFrom: null, lastPromotion: null, promotionHistory: [] },
          prod: { active: false, variables: {}, promotedVersionId: null, promotedFrom: null, lastPromotion: null, promotionHistory: [] }
        },
        versions: [
             { id: 'v1', version: 1, createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), description: 'Initial version', content: {
                workflow: { nodes: [], edges: []},
                inputSchema: {},
                outputSchema: {}
             } },
             { id: 'v2', version: 2, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), description: 'Updated workflow', content: { 
                workflow: {
                  nodes: [
                    { id: 'start_1', type: 'start', position: { x: 50, y: 200 }, data: { label: 'Start', status: 'idle' } },
                    { id: 'graphql_1', type: 'graphql', position: { x: 200, y: 200 }, data: { label: 'Fetch User Data', query: `query GetUser($id: ID!) { user(id: $id) { id name email profile { avatar bio } } }`, variables: { id: '{{userId}}' }, endpoint: 'https://api.example.com/graphql', status: 'idle' } },
                    { id: 'api_2', type: 'api', position: { x: 400, y: 100 }, data: { label: 'Get Orders', apiType: 'REST', method: 'GET', endpoint: 'https://api.example.com/orders/{{userId}}', status: 'idle' } },
                    { id: 'api_3', type: 'api', position: { x: 400, y: 300 }, data: { label: 'Get Preferences', apiType: 'REST', method: 'GET', endpoint: 'https://api.example.com/preferences/{{userId}}', status: 'idle' } },
                    { id: 'aggregate_1', type: 'aggregate', position: { x: 600, y: 200 }, data: { label: 'Group Users', target: 'data', groupBy: ['status'], metrics: [{ alias: 'count', op: 'count', field: '*' }], status: 'idle' } },
                    { id: 'transform_2', type: 'transform', position: { x: 800, y: 200 }, data: { label: 'Final Transform', transformations: [ { op: 'rename_fields', target: '', config: { mappings: [{ from: 'orders', to: 'userOrders' }] }, onError: 'continue' }, { op: 'select_fields', target: '', config: { fields: ['userOrders', 'preferences'] }, onError: 'continue' } ], status: 'idle' } },
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
                inputSchema: { userId: {type: "string", required: true, description: "The ID of the user to fetch.", example: "user-123"} },
                outputSchema: { grouped: {type: "array", description: "Grouped results."} },
             } , isCurrent: true},
        ],
        testSuites: [],
      },
      {
        id: 'api_demo_3',
        name: 'E-commerce Product API',
        description: 'Provides access to product catalog, inventory, and pricing information for an e-commerce platform.',
        version: '1.2.0',
        status: 'published',
        wasPublished: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        modifiedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['products', 'e-commerce', 'inventory'],
        applications: ['Web Storefront'],
        inputSchema: { productId: { type: "string", required: true, description: "The unique ID of the product.", example: "prod-987" } },
        outputSchema: { name: { type: "string", description: "Product name." }, price: { type: "number", description: "Product price." }, inStock: { type: "boolean", description: "Inventory status." } },
        workflow: { nodes: [], edges: [] },
        environments: { dev: {}, qa: {}, uat: {}, prod: {} },
        versions: [
             { id: 'v1', version: 1, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), description: 'Initial version', content: {
                workflow: { nodes: [], edges: []},
                inputSchema: {},
                outputSchema: {}
             } },
             { id: 'v2', version: 2, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), description: 'Added new product attributes', content: {
                workflow: { nodes: [], edges: []},
                inputSchema: { productId: { type: "string", required: true, description: "The unique ID of the product.", example: "prod-987" } },
                outputSchema: { name: { type: "string", description: "Product name." }, price: { type: "number", description: "Product price." }, inStock: { type: "boolean", description: "Inventory status." } },
             } , isCurrent: true},
        ],
        testSuites: [],
      },
      {
        id: 'api_demo_4',
        name: 'Social Media Connector',
        description: 'Draft API for posting updates to multiple social media platforms.',
        version: '0.5.0',
        status: 'draft',
        wasPublished: false,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        modifiedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['social', 'automation', 'draft'],
        applications: ['Social Scheduler'],
        inputSchema: { message: { type: "string", required: true, description: "Status update text.", example: "Hello world" } },
        outputSchema: { postId: { type: "string", description: "ID of created post." } },
        workflow: { nodes: [ { id: 'start_1', type: 'start', position: { x: 100, y: 200 }, data: { label: 'Start', status: 'idle' } }, { id: 'api_1', type: 'api', position: { x: 300, y: 200 }, data: { label: 'Post Update', apiType: 'REST', method: 'POST', endpoint: 'https://api.social.example.com/post', status: 'idle' } }, { id: 'end_1', type: 'end', position: { x: 500, y: 200 }, data: { label: 'End', status: 'idle' } } ], edges: [ { id: 'e1', source: 'start_1', target: 'api_1', animated: false }, { id: 'e2', source: 'api_1', target: 'end_1', animated: false } ] },
        environments: { dev: {}, qa: {}, uat: {}, prod: {} },
          versions: [
              { id: 'v1', version: 1, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), description: 'Initial draft', content: {
                workflow: { nodes: [ { id: 'start_1', type: 'start', position: { x: 100, y: 200 }, data: { label: 'Start', status: 'idle' } }, { id: 'api_1', type: 'api', position: { x: 300, y: 200 }, data: { label: 'Post Update', apiType: 'REST', method: 'POST', endpoint: 'https://api.social.example.com/post', status: 'idle' } }, { id: 'end_1', type: 'end', position: { x: 500, y: 200 }, data: { label: 'End', status: 'idle' } } ], edges: [ { id: 'e1', source: 'start_1', target: 'api_1', animated: false }, { id: 'e2', source: 'api_1', target: 'end_1', animated: false } ]},
                inputSchema: { message: { type: "string", required: true, description: "Status update text.", example: "Hello world" } },
                outputSchema: { postId: { type: "string", description: "ID of created post." } }
              } , isCurrent: true},
          ],
        testSuites: [],
      },
      {
        id: 'api_demo_5',
        name: 'Payment Gateway Service',
        description: 'Handles credit card processing and transaction logging. High reliability.',
        version: '3.0.1',
        status: 'published',
        wasPublished: true,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        modifiedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['payment', 'transactions', 'secure'],
        applications: ['Web Storefront'],
        inputSchema: { amount: { type: "number", required: true, description: "Transaction amount.", example: 99.99 }, currency: { type: "string", required: true, description: "Currency code (e.g., USD).", example: "USD" } },
        outputSchema: { transactionId: { type: "string", description: "Unique transaction ID." }, status: { type: "string", description: "Transaction status." } },
        workflow: { nodes: [], edges: [] },
        environments: { dev: {}, qa: {}, uat: {}, prod: {} },
        versions: [
             { id: 'v1', version: 1, createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(), description: 'Initial version', content: {
                workflow: { nodes: [], edges: []},
                inputSchema: {},
                outputSchema: {}
             } },
             { id: 'v2', version: 2, createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), description: 'Updated security protocols', content: {
                workflow: { nodes: [], edges: []},
                inputSchema: { amount: { type: "number", required: true, description: "Transaction amount.", example: 99.99 }, currency: { type: "string", required: true, description: "Currency code (e.g., USD).", example: "USD" } },
                outputSchema: { transactionId: { type: "string", description: "Unique transaction ID." }, status: { type: "string", description: "Transaction status." } },
             } , isCurrent: true},
        ],
        testSuites: [],
      }
    ];
    
    setConfigs(demoConfigs);
    setLoading(false);
  }, []);

  const handleCreateNew = () => {
    if (!getEnvPermissions(environment).allowCreate) {
      showToast('API creation is disabled in this environment', 'error');
      return;
    }
    const newConfig = {
      id: `api_${Date.now()}`,
      name: 'New API Integration',
      description: '',
      version: '1.0.0',
      status: 'draft',
      wasPublished: false,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      tags: [],
      applications: ['New App'],
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
        dev: { active: true, variables: {}, promotedVersionId: null, promotedFrom: null, lastPromotion: null, promotionHistory: [] },
        qa: { active: false, variables: {}, promotedVersionId: null, promotedFrom: null, lastPromotion: null, promotionHistory: [] },
        uat: { active: false, variables: {}, promotedVersionId: null, promotedFrom: null, lastPromotion: null, promotionHistory: [] },
        prod: { active: false, variables: {}, promotedVersionId: null, promotedFrom: null, lastPromotion: null, promotionHistory: [] },
        uatdr: { active: false, variables: {}, promotedVersionId: null, promotedFrom: null, lastPromotion: null, promotionHistory: [] },
        dr: { active: false, variables: {}, promotedVersionId: null, promotedFrom: null, lastPromotion: null, promotionHistory: [] },
      },
      versions: [
          { id: 'v1', version: 1, createdAt: new Date().toISOString(), description: 'Initial draft', content: {
            workflow: { nodes: [
                { id: 'start_1', type: 'start', position: { x: 100, y: 200 }, data: { label: 'Start', status: 'idle' } },
                { id: 'end_1', type: 'end', position: { x: 500, y: 200 }, data: { label: 'End', status: 'idle' } }
              ],
              edges: []
            },
            inputSchema: {},
            outputSchema: {}
          } , isCurrent: true},
      ],
      testSuites: [],
    };
    
    setConfigs([...configs, newConfig]);
    setSelectedConfig(newConfig);
    setStudioMode('edit');
    setCurrentView('studio');
    showToast('New API configuration created', 'success');
  };
  
  const handleCloneConfig = (configId, newName, newApp, tags = []) => {
    if (!getEnvPermissions(environment).allowClone) {
      showToast('Cloning is disabled in this environment', 'error');
      return;
    }
    const configToClone = configs.find(c => c.id === configId);
    if (configToClone) {
        const newConfig = {
            ...JSON.parse(JSON.stringify(configToClone)), // Deep clone
            id: `api_${Date.now()}`,
            name: newName,
            status: 'draft',
            wasPublished: false,
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
            applications: [newApp], // Set the selected app
            tags
        };
        newConfig.versions = [{
            id: `v_${Date.now()}`,
            version: 1,
            createdAt: new Date().toISOString(),
            description: `Cloned from ${configToClone.name} for ${newApp}`,
            content: { 
                workflow: configToClone.workflow, 
                inputSchema: configToClone.inputSchema, 
                outputSchema: configToClone.outputSchema 
            },
            isCurrent: true
        }];
        setConfigs([...configs, newConfig]);
        showToast(`Cloned "${configToClone.name}" as "${newName}" successfully`, 'success');
    }
  };
  
  const handleCloneFromVersion = (version, newName, newApp, tags = []) => {
    if(!selectedConfig || !version) return;
    if (!getEnvPermissions(environment).allowClone) {
      showToast('Cloning is disabled in this environment', 'error');
      return;
    }

    const newConfig = {
        ...JSON.parse(JSON.stringify(selectedConfig)), // Deep clone base config
        id: `api_${Date.now()}`,
        name: newName,
        status: 'draft',
        wasPublished: false,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        applications: [newApp],
        tags,
        // Use the specific version's content
        workflow: version.content.workflow,
        inputSchema: version.content.inputSchema,
        outputSchema: version.content.outputSchema,
    };
    
    // Create a new version history for the cloned API
    newConfig.versions = [{
        id: `v_${Date.now()}`,
        version: 1,
        createdAt: new Date().toISOString(),
        description: `Cloned from ${selectedConfig.name} v${version.version}`,
        content: version.content,
        isCurrent: true
    }];

    setConfigs(prev => [...prev, newConfig]);
    showToast(`Cloned from v${version.version} as "${newName}"`, 'success');
  };

  const handleDeleteConfig = (configId) => {
    setConfigs(configs.filter(c => c.id !== configId));
    if (selectedConfig?.id === configId) {
      setSelectedConfig(null);
      setCurrentView('dashboard');
    }
    showToast('API configuration deleted', 'success');
  };

  const handlePublish = (configId) => {
      setConfigs(prevConfigs => prevConfigs.map(c =>
          c.id === configId ? { ...c, status: 'published', wasPublished: true, modifiedAt: new Date().toISOString() } : c
      ));
      if (selectedConfig?.id === configId) {
          setSelectedConfig(prev => ({...prev, status: 'published', wasPublished: true}));
          setStudioMode('view');
      }
      showToast('API published successfully', 'success');
  };

  const handleUnpublish = (configId) => {
      setConfigs(prevConfigs => prevConfigs.map(c => 
          c.id === configId ? { ...c, status: 'draft', modifiedAt: new Date().toISOString() } : c
      ));
      if (selectedConfig?.id === configId) {
          setSelectedConfig(prev => ({...prev, status: 'draft'}));
          setStudioMode('edit');
      }
      showToast('API unpublished. It is now in an editable state.', 'success');
  };

  const handleMakeVersionActive = (versionId) => {
    if (!window.confirm('Make this version active?')) return;
    const newConfigs = configs.map(cfg => {
        if (cfg.id === selectedConfig.id) {
            const newVersions = cfg.versions.map(v => ({
                ...v,
                isCurrent: v.id === versionId
            }));
            const activeVersion = newVersions.find(v => v.isCurrent);
            return {
                ...cfg,
                versions: newVersions,
                workflow: activeVersion.content.workflow,
                inputSchema: activeVersion.content.inputSchema,
                outputSchema: activeVersion.content.outputSchema,
                modifiedAt: new Date().toISOString()
            };
        }
        return cfg;
    });
    setConfigs(newConfigs);
    setSelectedConfig(newConfigs.find(c => c.id === selectedConfig.id));
    showToast('Version made active. Remember to publish and promote to each environment.', 'info');
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
  
  const handleSelectConfig = (config, mode) => {
      setSelectedConfig(config);
      setStudioMode(mode);
      setCurrentView('studio');
  };

  const renderContent = () => {
    if (loading) {
        return (
            <div className="p-6">
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
            onSelectConfig={handleSelectConfig}
            onCreateNew={handleCreateNew}
            onDeleteConfig={handleDeleteConfig}
            onCloneConfig={handleCloneConfig}
            onPublish={handlePublish}
            onUnpublish={handleUnpublish}
            theme={theme}
            showToast={showToast}
            environment={environment}
            onEnvironmentChange={setEnvironment}
            searchTerm={searchTerm}
          />
        );
      
      case 'studio':
        return selectedConfig ? (
          <APIStudio
            config={selectedConfig}
            configs={configs}
            mode={studioMode}
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
            onPublish={handlePublish}
            onUnpublish={handleUnpublish}
            onPromote={handlePromoteEnvironment}
            onMakeVersionActive={handleMakeVersionActive}
            onCloneFromVersion={handleCloneFromVersion}
            onModeChange={setStudioMode}
            environment={environment}
            theme={theme}
            showToast={showToast}
            onShowHelp={() => setShowHelp(true)}
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
      
      case 'environments':
          return selectedConfig ? (
              <EnvironmentManager
                  config={selectedConfig}
                  onUpdate={(updatedConfig) => {
                      setConfigs(configs.map(c => 
                        c.id === updatedConfig.id ? updatedConfig : c
                      ));
                      setSelectedConfig(updatedConfig);
                  }}
                  onPromote={handlePromoteEnvironment}
                  currentEnvironment={environment}
                  theme={theme}
                  showToast={showToast}
              />
          ) : null;

      default:
        return null;
    }
  };

  const handlePromoteEnvironment = (fromEnv, toEnv, versionId) => {
    if (!window.confirm(`Promote from ${fromEnv.toUpperCase()} to ${toEnv.toUpperCase()}?`)) return;
    const updatedConfigs = configs.map(config => {
      if (config.id === selectedConfig?.id) {
        const timestamp = new Date().toISOString();
        const updatedHistory = [
          ...(config.environments[toEnv]?.promotionHistory || []),
          { versionId, promotedFrom: fromEnv, date: timestamp }
        ];
        const updatedConfig = {
          ...config,
          environments: {
            ...config.environments,
            [toEnv]: {
              ...config.environments[toEnv],
              promotedVersionId: versionId,
              lastPromotion: timestamp,
              promotedFrom: fromEnv,
              promotionHistory: updatedHistory
            }
          }
        };
        return updatedConfig;
      }
      return config;
    });
    setConfigs(updatedConfigs);
    setSelectedConfig(updatedConfigs.find(c => c.id === selectedConfig.id));
    showToast(`Configuration version promoted from ${fromEnv.toUpperCase()} to ${toEnv.toUpperCase()}`, 'success');
  };

  return (
    <div className={`flex flex-col h-screen ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-800'}`}>
      {/* Main Header */}
      <header className={`flex items-center justify-between px-4 py-2 ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <img src={theme === 'dark' ? logoDark : logoLight} alt="App Integrator Logo" className="w-8 h-8" />
                <h1 className={`font-bold text-xl uppercase ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>App Integrator</h1>
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
        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {showHelp && (
        <HelpModal onClose={() => setShowHelp(false)} theme={theme} />
      )}

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