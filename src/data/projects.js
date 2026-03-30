/**
 * projects.js — Static project data
 * All featured and grid projects for the portfolio
 */

const projects = [
  // ──── Featured Projects (3) ────
  {
    id: 'gridshield',
    num: '01',
    name: 'GridShield AI',
    tagline: 'Compound weather event modeling for power grid resilience',
    description:
      'State-agnostic power outage prediction system using compound weather event modeling. 138 engineered features, calibrated uncertainty quantification, and cross-state generalization validated across 3 US states.',
    metrics: [
      { label: 'AUC-ROC', value: 0.967 },
      { label: 'Features', value: 138 },
      { label: 'States Validated', value: 3 },
      { label: 'Tests Passing', value: 57 },
    ],
    tags: ['XGBoost', 'LightGBM', 'H3 Spatial', 'SHAP', 'FastAPI'],
    docsUrl: 'https://darthaether.github.io/outage-prediction-system/',
    githubUrl: 'https://github.com/DarthAether/outage-prediction-system',
    color: '#6366f1',
    year: 2026,
    featured: true,
  },
  {
    id: 'iotguard',
    num: '02',
    name: 'IoTGuard',
    tagline: 'BERT-powered IoT command risk analyzer',
    description:
      'Real-time threat classification for smart home IoT commands using fine-tuned BERT transformers. GUI interface for command analysis with risk scoring and category breakdown.',
    metrics: [
      { label: 'Model', value: 'BERT' },
      { label: 'Accuracy', value: '94.2%' },
    ],
    tags: ['BERT', 'NLP', 'IoT', 'Security'],
    docsUrl: null,
    githubUrl: 'https://github.com/DarthAether/IoTGuard',
    color: '#10b981',
    year: 2025,
    featured: true,
  },
  {
    id: 'threat-id',
    num: '03',
    name: 'Threat Identification System',
    tagline: 'Real-time AI surveillance with weapon detection',
    description:
      'AI-powered surveillance pipeline combining YOLOv5 weapon detection with DeepFace identity verification. Automated alerting with confidence thresholds and multi-camera support.',
    metrics: [
      { label: 'Detection', value: 'YOLOv5' },
      { label: 'Faces', value: 'DeepFace' },
    ],
    tags: ['YOLOv5', 'DeepFace', 'OpenCV', 'PyTorch'],
    docsUrl: null,
    githubUrl: 'https://github.com/DarthAether/threat-identification-system',
    color: '#ef4444',
    year: 2025,
    featured: true,
  },

  // ──── Grid Projects (4) ────
  {
    id: 'credit-risk',
    num: '04',
    name: 'Credit Risk XAI',
    tagline: 'Explainable credit risk classification',
    description:
      'Credit risk classification with Random Forest and SHAP explainability for regulatory-compliant financial decisions. Full pipeline from preprocessing to deployment-ready API.',
    metrics: [
      { label: 'Model', value: 'Random Forest' },
      { label: 'XAI', value: 'SHAP' },
    ],
    tags: ['Random Forest', 'SHAP', 'XAI', 'FinTech'],
    docsUrl: null,
    githubUrl: 'https://github.com/DarthAether/credit-risk-xai-project',
    color: '#f59e0b',
    year: 2025,
    featured: false,
  },
  {
    id: 'portfolio',
    num: '05',
    name: 'Portfolio v2',
    tagline: 'Cinematic developer portfolio',
    description:
      'Dark cinematic portfolio built with Vite, GSAP, Lenis smooth scroll, Three.js particle constellation, and modular ES6 architecture.',
    metrics: [
      { label: 'Stack', value: 'Vite + GSAP' },
      { label: '3D', value: 'Three.js' },
    ],
    tags: ['Vite', 'GSAP', 'Three.js', 'Lenis'],
    docsUrl: 'https://darthaether.github.io/',
    githubUrl: 'https://github.com/DarthAether/DarthAether.github.io',
    color: '#818cf8',
    year: 2026,
    featured: false,
  },
  {
    id: 'weather-pipeline',
    num: '06',
    name: 'Weather Data Pipeline',
    tagline: 'Multi-source weather data engineering',
    description:
      'Automated ETL pipeline for aggregating NOAA GHCN, Storm Events, and ASOS weather data. TimescaleDB storage with H3 spatial indexing for geospatial queries.',
    metrics: [
      { label: 'Sources', value: 3 },
      { label: 'Spatial', value: 'H3' },
    ],
    tags: ['ETL', 'TimescaleDB', 'H3', 'PostgreSQL'],
    docsUrl: null,
    githubUrl: null,
    color: '#06b6d4',
    year: 2026,
    featured: false,
  },
  {
    id: 'ieee-paper',
    num: '07',
    name: 'IEEE SPICES 2026 Paper',
    tagline: 'Compound weather events for outage prediction',
    description:
      'Research paper submitted to IEEE SPICES 2026 conference on compound weather event modeling for power infrastructure resilience. Paper #822.',
    metrics: [
      { label: 'Conference', value: 'IEEE' },
      { label: 'Paper', value: '#822' },
    ],
    tags: ['IEEE', 'Research', 'ML', 'Power Grid'],
    docsUrl: null,
    githubUrl: null,
    color: '#8b5cf6',
    year: 2026,
    featured: false,
  },
]

export default projects
export { projects }
