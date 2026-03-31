/**
 * projects.js — Project data + tech stack data
 */

export const PROJECTS = {
  gridshield: {
    name: 'GridShield AI',
    tagline: 'Power Outage Prediction System',
    description:
      'Compound weather event modeling for state-agnostic power outage prediction. Three-model ensemble combining XGBoost, LightGBM, and LSTM with attention mechanism. Features calibrated uncertainty quantification and cross-state generalization.',
    architecture: `Data Sources          ML Pipeline              Serving
─────────────     ──────────────────     ──────────
NOAA Storms  ─┐   ┌─ XGBoost ──────┐   FastAPI
EAGLE-I      ─┤   │  LightGBM ─────┼─→ WebSocket
ERCOT Grid   ─┼─→ │  LSTM+Attention┘   Next.js
Census ACS   ─┤   │                     Dashboard
NWS Alerts   ─┘   └─ Meta-Learner ──→ Calibrated
                     (Stacking)        Uncertainty`,
    metrics: [
      { value: '0.967', label: 'AUC-ROC' },
      { value: '0.947', label: 'F1 Score' },
      { value: '138', label: 'Features' },
      { value: '57', label: 'Tests' },
    ],
    tags: [
      'XGBoost', 'LightGBM', 'LSTM', 'FastAPI',
      'H3 Spatial', 'SHAP', 'TimescaleDB', 'Docker', 'Prometheus',
    ],
    demoUrl: 'https://darthaether.github.io/outage-prediction-system/',
    githubUrl: 'https://github.com/DarthAether/outage-prediction-system',
    color: '#f59e0b',
  },
  threatsight: {
    name: 'ThreatSight',
    tagline: 'AI Security Surveillance Platform',
    description:
      'Enterprise AI-powered security surveillance with real-time weapon detection using YOLOv5/ONNX Runtime, face recognition via DeepFace, and multi-channel alerting (email, WebSocket, webhook, sound). Features JWT/RBAC auth, circuit breaker pattern, and full observability stack.',
    architecture: `Camera Sources        Detection Pipeline       Alert System
──────────────     ──────────────────     ────────────
USB Camera  ─┐     ┌─ YOLOv5 ───────┐   Email
RTSP Stream ─┼──→  │  ONNX Runtime  │─→ WebSocket
             │     └────────────────┘   Webhook
             │     ┌─ DeepFace ─────┐   Sound
             └──→  │  Face Store DB │
                   └────────────────┘
                          ↓
                   Event Bus → Audit Log → PostgreSQL`,
    metrics: [
      { value: '12,383', label: 'Lines of Code' },
      { value: '213', label: 'Tests' },
      { value: '121', label: 'Files' },
      { value: '11', label: 'Prometheus Metrics' },
    ],
    tags: [
      'YOLOv5', 'ONNX Runtime', 'DeepFace', 'FastAPI',
      'PostgreSQL', 'Redis', 'Prometheus', 'Grafana', 'Docker',
    ],
    demoUrl: 'https://darthaether.github.io/threat-identification-system/',
    githubUrl: 'https://github.com/DarthAether/threat-identification-system',
    color: '#f43f5e',
  },
  iotguard: {
    name: 'IoTGuard',
    tagline: 'IoT Command Security Platform',
    description:
      'Enterprise IoT command security with dual-engine analysis: regex-based security rules engine and Google Gemini LLM for risk assessment. Features MQTT device bridge, per-command audit logging, and Redis-cached analysis results. JWT/RBAC auth with role-based device permissions.',
    architecture: `IoT Command           Analysis Pipeline        Execution
───────────        ──────────────────     ──────────
User Input ──→ Security Rules Engine     Execute
               (Regex Pattern Match)     ──or──
                      ↓                  Block
               Gemini AI Analysis ──→    ↓
               (Risk Assessment)      MQTT Bridge
                      ↓                  ↓
               Risk: NONE/LOW/MED/    IoT Device
                     HIGH/CRITICAL
                      ↓
               Audit Log → PostgreSQL`,
    metrics: [
      { value: '10,255', label: 'Lines of Code' },
      { value: '92', label: 'Files' },
      { value: '6', label: 'ORM Models' },
      { value: '5', label: 'Device Types' },
    ],
    tags: [
      'Gemini AI', 'MQTT', 'FastAPI', 'PostgreSQL',
      'Redis', 'Prometheus', 'Grafana', 'Docker', 'Pydantic',
    ],
    demoUrl: 'https://darthaether.github.io/IoTGuard/',
    githubUrl: 'https://github.com/DarthAether/IoTGuard',
    color: '#06b6d4',
  },
}

export const TECH_DATA = {
  xgboost: {
    name: 'XGBoost',
    desc: 'Gradient boosted decision trees for tabular outage prediction. Primary model in the GridShield ensemble achieving 0.967 AUC-ROC with temporal cross-validation.',
    projects: ['GridShield AI', 'Credit Risk XAI'],
  },
  lightgbm: {
    name: 'LightGBM',
    desc: 'Histogram-based gradient boosting for fast training on 138 engineered features. Second model in the stacking ensemble with leaf-wise growth strategy.',
    projects: ['GridShield AI'],
  },
  pytorch: {
    name: 'PyTorch',
    desc: 'LSTM with multi-head self-attention for sequential weather patterns. MC Dropout for uncertainty quantification in the temporal model branch.',
    projects: ['GridShield AI', 'ThreatSight'],
  },
  fastapi: {
    name: 'FastAPI',
    desc: 'Async REST API backbone for all 3 enterprise systems. JWT/RBAC auth, WebSocket streaming, Pydantic schemas, dependency injection, and OpenAPI docs.',
    projects: ['GridShield AI', 'ThreatSight', 'IoTGuard'],
  },
  threejs: {
    name: 'Three.js',
    desc: 'WebGL particle constellation in the portfolio hero. 1000 particles with proximity-based connections and mouse-reactive rotation.',
    projects: ['This Portfolio'],
  },
  gsap: {
    name: 'GSAP',
    desc: 'ScrollTrigger-driven animations throughout this portfolio. Text reveals, section fades, counter animations, and smooth scroll integration with Lenis.',
    projects: ['This Portfolio'],
  },
  docker: {
    name: 'Docker',
    desc: 'Multi-stage builds with non-root users and healthchecks. Docker Compose orchestrating API + PostgreSQL + Redis + Prometheus + Grafana stacks.',
    projects: ['GridShield AI', 'ThreatSight', 'IoTGuard'],
  },
  postgresql: {
    name: 'PostgreSQL',
    desc: 'Primary database for all systems. TimescaleDB hypertables for time-series in GridShield. Async SQLAlchemy with Alembic migrations across all projects.',
    projects: ['GridShield AI', 'ThreatSight', 'IoTGuard'],
  },
  redis: {
    name: 'Redis',
    desc: 'Caching layer for API responses, pub/sub for real-time WebSocket broadcasting, rate limiting, and alert deduplication across all 3 platforms.',
    projects: ['GridShield AI', 'ThreatSight', 'IoTGuard'],
  },
  prometheus: {
    name: 'Prometheus',
    desc: '11 custom metrics in ThreatSight: detection latency, FPS, alerts fired, active cameras. Pre-built Grafana dashboards for all 3 systems.',
    projects: ['GridShield AI', 'ThreatSight', 'IoTGuard'],
  },
  shap: {
    name: 'SHAP',
    desc: 'SHapley Additive exPlanations for model interpretability. Feature importance analysis on 138 features in GridShield and credit risk predictions.',
    projects: ['GridShield AI', 'Credit Risk XAI'],
  },
  onnx: {
    name: 'ONNX Runtime',
    desc: 'YOLOv5 model export to ONNX for 2-5x faster CPU inference in ThreatSight. Runtime-selectable backend: native PyTorch vs ONNX via configuration.',
    projects: ['ThreatSight'],
  },
  typescript: {
    name: 'TypeScript',
    desc: 'Strongly-typed JavaScript for production applications. Used across the full stack at VTAG Software with Next.js, React, NestJS, and Playwright test suites.',
    projects: ['VTAG Software'],
  },
  react: {
    name: 'React',
    desc: 'Component-based UI library for building interactive dashboards. Broker portal, property management, and lead attribution interfaces at VTAG Software.',
    projects: ['VTAG Software'],
  },
  nextjs: {
    name: 'Next.js',
    desc: 'React meta-framework with SSR and file-based routing. Production frontend for broker dashboards and property management at VTAG Software.',
    projects: ['VTAG Software', 'GridShield AI'],
  },
  nestjs: {
    name: 'NestJS',
    desc: 'Enterprise Node.js framework with dependency injection, decorators, and module system. Backend services for the Senior Living platform at VTAG Software.',
    projects: ['VTAG Software'],
  },
  graphql: {
    name: 'GraphQL',
    desc: 'Query language for APIs with typed schemas. Used with NestJS and Prisma for efficient data fetching across VTAG Software platforms.',
    projects: ['VTAG Software'],
  },
  playwright: {
    name: 'Playwright',
    desc: 'Cross-browser end-to-end testing framework. 695+ tests across 9 projects at VTAG Software covering critical user flows and regression detection.',
    projects: ['VTAG Software'],
  },
}
