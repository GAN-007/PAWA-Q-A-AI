from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from enum import Enum
import datetime
import uuid

# Provider Configuration
class ModelProvider(str, Enum):
    OLLAMA = "ollama"
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"
    HUGGINGFACE = "huggingface"

class LifecycleStatus(str, Enum):
    ACTIVE = "active"
    DEPRECATED = "deprecated"
    RETIRED = "retired"
    BETA = "beta"
    EXPERIMENTAL = "experimental"

class ModelArchitecture(str, Enum):
    TRANSFORMER = "transformer"
    CNN = "cnn"
    RNN = "rnn"
    MAMBA = "mamba"
    HYBRID = "hybrid"

class ModelType(str, Enum):
    TEXT = "text"
    IMAGE = "image"
    AUDIO = "audio"
    VIDEO = "video"
    MULTIMODAL = "multimodal"

# Core Request/Response Models
class QueryRequest(BaseModel):
    """Request model for LLM queries"""
    question: str
    model_name: str
    provider: ModelProvider = ModelProvider.OLLAMA
    temperature: float = 0.7
    max_tokens: Optional[int] = None
    stream: bool = False
    history: Optional[List[Dict[str, str]]] = None
    prompt_template: Optional[str] = None
    api_key: Optional[str] = None  # For cloud providers
    model_version: Optional[str] = None  # For versioned models
    system_prompt: Optional[str] = None  # Override default system prompt
    attachments: Optional[List[str]] = None  # File attachments
    user_id: Optional[str] = str(uuid.uuid4())  # Default user ID
    tenant_id: Optional[str] = None  # For multi-tenant support
    request_id: Optional[str] = str(uuid.uuid4())  # For request tracing

class QueryResponse(BaseModel):
    """Response model for LLM queries"""
    response: str
    model: str
    provider: ModelProvider
    tokens_used: int
    processing_time: float  # In seconds
    request_id: str
    timestamp: str = datetime.datetime.utcnow().isoformat()
    context_used: Optional[List[Dict]] = None  # For RAG systems
    warning: Optional[str] = None  # For deprecation warnings
    metadata: Optional[Dict[str, Any]] = None  # For provider-specific metadata

# Model Management Models
class ModelInfo(BaseModel):
    """Core model metadata"""
    name: str
    version: str
    provider: ModelProvider
    type: ModelType
    architecture: ModelArchitecture
    size: Optional[str] = None  # Human-readable size
    size_bytes: Optional[int] = None  # Raw bytes
    modified: Optional[str] = None  # ISO date string
    description: Optional[str] = None
    capabilities: Dict[str, List[str]] = {}  # e.g., {"vision": ["image_analysis"], "audio": ["speech_recognition"]}
    system_requirements: Dict[str, Any] = {
        "cpu": "4 cores",
        "ram": "8GB",
        "gpu": "Optional (for GPU acceleration)",
        "storage": "SSD recommended"
    }
    dependencies: List[str] = []
    license: Optional[str] = None
    governance_rules: Dict[str, Any] = {}
    status: LifecycleStatus = LifecycleStatus.ACTIVE
    tags: List[str] = []
    documentation_url: Optional[str] = None
    training_data: Optional[str] = None  # Dataset reference
    quantization: Optional[str] = None  # e.g., "q4_0"
    compatibility: Dict[str, List[str]] = {}  # Compatible providers
    performance_metrics: Dict[str, float] = {
        "inference_speed": 0.0,  # Tokens/second
        "accuracy": 0.0,
        "cost_per_1k_tokens": 0.0
    }

class ModelListResponse(BaseModel):
    """Paginated model list response"""
    models: List[ModelInfo]
    total: int
    page: int
    page_size: int
    total_pages: int
    filters: Dict[str, str] = {}
    sort_by: str = "name_asc"
    provider_status: Dict[ModelProvider, bool] = {}

class ModelInstallRequest(BaseModel):
    """Request model for model installation"""
    model_name: str
    provider: ModelProvider = ModelProvider.OLLAMA
    version: Optional[str] = None
    custom_config: Dict[str, Any] = {}
    priority: int = Field(ge=1, le=5, default=3)  # 1=high, 5=low
    install_path: Optional[str] = None
    dependencies: List[str] = []

class ModelInstallResponse(BaseModel):
    """Installation result with metadata"""
    model_name: str
    provider: ModelProvider
    status: str
    message: str
    download_progress: Dict[str, Any] = {}  # e.g., {"total": 1000, "downloaded": 500}
    installed_models: List[ModelInfo] = []
    processing_time: float
    error: Optional[str] = None

# API Key Management
class APIKeyRequest(BaseModel):
    """Request model for API key updates"""
    openai_key: Optional[str] = None
    anthropic_key: Optional[str] = None
    google_key: Optional[str] = None
    ollama_host: Optional[str] = None
    huggingface_key: Optional[str] = None
    encryption_key: Optional[str] = None  # For encrypted storage
    expiration_date: Optional[datetime.date] = None

class APIKeyResponse(BaseModel):
    """Response model for API key operations"""
    provider: ModelProvider
    status: str
    message: str
    keys: Dict[ModelProvider, bool] = {}
    last_updated: str = datetime.datetime.utcnow().isoformat()

# Chat History Models
class ChatMessage(BaseModel):
    """Individual chat message with metadata"""
    role: str  # "user", "assistant", "error"
    content: str
    timestamp: str = datetime.datetime.utcnow().isoformat()
    model: str
    provider: ModelProvider
    tokens_used: int = 0
    rating: Optional[int] = Field(None, ge=1, le=5)  # User feedback
    attachments: List[str] = []

class ChatHistoryRequest(BaseModel):
    """Request model for chat history operations"""
    user_id: str
    model_name: str
    provider: ModelProvider
    tenant_id: Optional[str] = None
    limit: int = Field(default=20, ge=1, le=100)
    offset: int = 0

class ChatHistoryResponse(BaseModel):
    """Response model for chat history"""
    user_id: str
    history: List[ChatMessage]
    total_conversations: int
    models_used: List[str] = []
    tenant_id: Optional[str] = None

# Model Lifecycle Models
class ModelLifecycleRequest(BaseModel):
    """Request model for model lifecycle actions"""
    model_name: str
    action: str  # "deprecate", "retire", "migrate", "rollback"
    replacement_model: Optional[str] = None
    target_version: Optional[str] = None
    force: bool = False
    backup: bool = True

class ModelLifecycleResponse(BaseModel):
    """Response model for lifecycle operations"""
    model_name: str
    old_version: Optional[str] = None
    new_version: Optional[str] = None
    action: str
    status: str
    message: str
    timestamp: str = datetime.datetime.utcnow().isoformat()
    backup_location: Optional[str] = None

# Governance & Compliance
class ModelGovernanceRules(BaseModel):
    """Governance rules for model usage"""
    allowed_regions: List[str] = ["global"]  # e.g., ["eu", "us", "asia"]
    max_input_length: int = 8192
    max_output_length: int = 4096
    allowed_use_cases: List[str] = ["general"]
    restricted_content: List[str] = ["hate", "violence", "sexual"]
    compliance: Dict[str, bool] = {
        "GDPR": False,
        "HIPAA": False,
        "SOC2": False
    }

class ModelComplianceReport(BaseModel):
    """Compliance status for a model"""
    model_name: str
    compliance: Dict[str, bool]
    issues: List[str] = []
    recommendations: List[str] = []
    timestamp: str = datetime.datetime.utcnow().isoformat()

# Analytics & Monitoring
class ModelUsageStats(BaseModel):
    """Model usage statistics"""
    model_name: str
    provider: ModelProvider
    total_requests: int = 0
    average_tokens: int = 0
    total_tokens: int = 0
    success_rate: float = 1.0
    error_rates: Dict[str, float] = {}
    last_used: Optional[str] = None
    active_users: int = 0

class ModelPerformanceMetrics(BaseModel):
    """Model performance metrics"""
    model_name: str
    provider: ModelProvider
    inference_speed: float  # tokens/second
    accuracy: float
    memory_usage: float  # MB
    cost_per_1k_tokens: float
    latency: float  # milliseconds
    version: str
    timestamp: str = datetime.datetime.utcnow().isoformat()

# Settings Management
class UserPreferences(BaseModel):
    """User-specific settings"""
    user_id: str
    theme: str = "light"
    default_model: str = "llama3.1"
    streaming: bool = True
    font_size: str = "normal"  # "small", "normal", "large"
    history_retention: int = Field(default=30, ge=7, le=365)  # Days
    notifications: Dict[str, bool] = {
        "updates": True,
        "security": True,
        "performance": False
    }
    provider_keys: Dict[ModelProvider, str] = {}

class SystemSettings(BaseModel):
    """System-wide configuration"""
    ollama_host: str = "http://localhost:11434"
    model_storage_path: str = "/models"
    max_concurrent_requests: int = 10
    enable_streaming: bool = True
    default_provider: ModelProvider = ModelProvider.OLLAMA
    log_level: str = "INFO"
    security: Dict[str, Any] = {
        "encryption": "AES-256",
        "audit_logging": True,
        "sensitive_data_masking": True
    }

# Model Training & Fine-tuning
class ModelTrainingConfig(BaseModel):
    """Configuration for model training"""
    model_name: str
    dataset: str  # Dataset identifier
    epochs: int = Field(default=3, ge=1)
    batch_size: int = Field(default=8, ge=1)
    learning_rate: float = 0.001
    validation_data: Optional[str] = None
    output_dir: str = f"/models/{uuid.uuid4()}"
    use_gpu: bool = True
    mixed_precision: bool = True

class ModelTrainingStatus(BaseModel):
    """Training status response"""
    training_id: str
    model_name: str
    status: str  # "queued", "running", "complete", "failed"
    progress: float = 0.0  # 0-100%
    current_step: int = 0
    total_steps: int = 0
    loss: Optional[float] = None
    metrics: Dict[str, float] = {}
    logs: List[str] = []
    error: Optional[str] = None
    created_at: str = datetime.datetime.utcnow().isoformat()
    updated_at: str = datetime.datetime.utcnow().isoformat()

# Model Versioning
class ModelVersion(BaseModel):
    """Model version details"""
    model_name: str
    version: str
    size: str
    hash: str
    modified: str = datetime.datetime.utcnow().isoformat()
    status: LifecycleStatus = LifecycleStatus.ACTIVE
    compatible_providers: List[ModelProvider] = [ModelProvider.OLLAMA]
    description: Optional[str] = None
    changelog: Optional[str] = None
    migration_plan: Optional[Dict] = None

# Multi-Tenancy
class TenantInfo(BaseModel):
    """Tenant-specific configuration"""
    tenant_id: str
    name: str
    models_allowed: List[ModelProvider] = [ModelProvider.OLLAMA]
    max_models: int = 100
    storage_limit: str = "500GB"
    created_at: str = datetime.datetime.utcnow().isoformat()
    updated_at: str = datetime.datetime.utcnow().isoformat()
    model_governance: ModelGovernanceRules = ModelGovernanceRules()
    quotas: Dict[str, Any] = {
        "daily_tokens": 100000,
        "hourly_rate_limit": 1000
    }

# Enhanced Response Models
class BaseResponse(BaseModel):
    """Standardized API response format"""
    success: bool
    timestamp: str = datetime.datetime.utcnow().isoformat()
    data: Optional[Any] = None
    error: Optional[str] = None
    request_id: Optional[str] = None
    diagnostics: Optional[Dict[str, Any]] = None

class ModelSearchRequest(BaseModel):
    """Advanced model search criteria"""
    query: str = ""
    provider: Optional[ModelProvider] = None
    type: ModelType = ModelType.TEXT
    size_range: Optional[Dict[str, int]] = {"min": 0, "max": 1024*1024*1024}  # In bytes
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
    sort_by: str = "name_asc"  # name_asc, size_desc, etc.

class ModelComparison(BaseModel):
    """Model comparison metrics"""
    model_a: ModelInfo
    model_b: ModelInfo
    metrics: Dict[str, float]  # e.g., {"accuracy": 0.5, "speed": 0.8}
    recommendations: List[str] = []

# Prompt Engineering
class PromptTemplate(BaseModel):
    """Prompt template definition"""
    name: str
    template: str
    description: str
    variables: List[str] = []
    provider: ModelProvider = ModelProvider.OLLAMA
    created_at: str = datetime.datetime.utcnow().isoformat()
    updated_at: Optional[str] = None

class PromptEngineeringRequest(BaseModel):
    """Request for prompt engineering"""
    base_prompt: str
    task_type: str  # e.g., "summarization", "code_completion"
    style: Optional[str] = "default"
    variables: Dict[str, Any] = {}
    optimization: Dict[str, Any] = {
        "technique": "chain_of_thought",
        "max_iterations": 3
    }

# Model Capabilities
class ModelCapabilities(BaseModel):
    """Model capability definitions"""
    vision: bool = False
    audio: bool = False
    video: bool = False
    multimodal: bool = False
    streaming: bool = False
    chat: bool = True
    completion: bool = True
    fine_tuning: bool = False
    quantization: bool = False
    distillation: bool = False
    compression: bool = False

# System Monitoring
class SystemResources(BaseModel):
    """System resource metrics"""
    cpu_usage: float  # 0-100%
    ram_usage: float  # In GB
    disk_usage: float  # In GB
    gpu_usage: Optional[float] = None  # In GB
    active_models: List[str] = []
    active_connections: int = 0
    uptime: str = "0d 0h 0m"
    temperature: float = 45.0  # CPU/GPU temp

class SystemDiagnostics(BaseModel):
    """Comprehensive system diagnostics"""
    status: str = "healthy"
    resources: SystemResources = SystemResources()
    providers: Dict[ModelProvider, bool] = {}
    models: Dict[ModelProvider, List[ModelInfo]] = {}
    performance: Dict[str, float] = {}  # Provider-specific performance
    version: str = "2.0.0"
    build_date: str = "2025-05-01"
    environment: str = "prod"

# Model Optimization
class ModelOptimizationRequest(BaseModel):
    """Request model for model optimization"""
    model_name: str
    target_hardware: str  # e.g., "rtx_4090", "mac_m2", "cloud_t4"
    optimization_type: str = "auto"  # "quantize", "prune", "distill"
    preserve_accuracy: bool = True
    target_size: Optional[str] = None  # e.g., "4.7GB"
    output_format: str = "gguf"
    request_id: str = str(uuid.uuid4())

class ModelOptimizationResponse(BaseModel):
    """Response model for optimization operations"""
    model_name: str
    optimization_type: str
    original_size: str
    optimized_size: str
    status: str
    download_url: Optional[str] = None
    processing_time: float
    warnings: List[str] = []
    request_id: str

# Model Permissions
class ModelPermissions(BaseModel):
    """Model access permissions"""
    read: bool = True
    write: bool = False
    execute: bool = True
    admin: bool = False
    groups: List[str] = []
    users: List[str] = []

class ModelShareRequest(BaseModel):
    """Model sharing configuration"""
    model_name: str
    user_ids: List[str] = []
    group_ids: List[str] = []
    expiration: Optional[str] = None  # ISO 8601 date
    permissions: ModelPermissions = ModelPermissions()
    notification: bool = True
    request_id: str = str(uuid.uuid4())

# Chat Session
class ChatSessionRequest(BaseModel):
    """Request model for chat sessions"""
    model_name: str
    provider: ModelProvider = ModelProvider.OLLAMA
    session_id: str = str(uuid.uuid4())
    temperature: float = 0.7
    max_tokens: Optional[int] = None
    stream: bool = False
    system_prompt: Optional[str] = None
    history: List[Dict[str, str]] = []
    tenant_id: Optional[str] = None
    api_key: Optional[str] = None

class ChatSessionResponse(BaseModel):
    """Response model for chat sessions"""
    session_id: str
    model: ModelInfo
    status: str
    created_at: str = datetime.datetime.utcnow().isoformat()
    expires_in: str = "3600s"  # ISO duration
    message: str = "Session created successfully"

# Enhanced Model Capabilities
class ModelCard(BaseModel):
    """ML Model Card format"""
    model_name: str
    model_id: str
    version: str
    authors: List[str] = []
    contact: str = "https://github.com/neuralnexus" 
    date: str = datetime.datetime.utcnow().isoformat()
    description: str
    license: str = "Apache-2.0"
    model_details: Dict[str, Any] = {}
    model_parameters: Dict[str, Any] = {}
    evaluation: Dict[str, Any] = {}
    limitations: Dict[str, Any] = {}
    use_cases: List[str] = []
    technical_specifications: Dict[str, Any] = {}
    training_details: Dict[str, Any] = {}
    evaluation_details: Dict[str, Any] = {}
    dataset: str = "https://huggingface.co/datasets/..." 
    training_procedure: str = "Standard pretraining + fine-tuning"
    training_data: Dict[str, Any] = {
        "training_data": "OpenWebText",
        "data_size": "100GB",
        "validation_data": "5% split"
    }

# Model Training Results
class TrainingResult(BaseModel):
    """Model training output"""
    model_name: str
    provider: ModelProvider
    training_id: str
    status: str
    metrics: Dict[str, Any] = {}
    hyperparameters: Dict[str, Any] = {}
    logs: List[str] = []
    artifacts: List[str] = []
    created_at: str = datetime.datetime.utcnow().isoformat()
    updated_at: str = datetime.datetime.utcnow().isoformat()

# Model Migration
class ModelMigrationRequest(BaseModel):
    """Request model for model migration"""
    model_name: str
    target_version: str
    backup: bool = True
    verify_integrity: bool = True
    optimize: bool = True
    rollback: bool = False

class ModelMigrationResponse(BaseModel):
    """Response model for model migration"""
    model_name: str
    old_version: str
    new_version: str
    status: str
    message: str
    migration_id: str = str(uuid.uuid4())
    started_at: str = datetime.datetime.utcnow().isoformat()
    completed_at: Optional[str] = None
    rollback_available: bool = False
    artifacts: List[str] = []

# Model Evaluation
class ModelEvaluationRequest(BaseModel):
    """Request model for model evaluation"""
    model_name: str
    evaluation_type: str  # "benchmark", "custom", "compliance"
    metrics: List[str] = ["accuracy", "speed", "cost"]
    dataset: str = "MMLU"
    provider: ModelProvider = ModelProvider.OLLAMA
    parameters: Dict[str, Any] = {}
    baseline: Optional[str] = None  # For comparison

class ModelEvaluationResult(BaseModel):
    """Evaluation results for models"""
    model_name: str
    provider: ModelProvider
    evaluation_type: str
    score: float
    details: Dict[str, Any] = {}
    timestamp: str = datetime.datetime.utcnow().isoformat()
    passed: bool = True
    metrics: Dict[str, float] = {}
    logs: List[str] = []
    report: Dict[str, Any] = {}

# Model Documentation
class ModelDocumentationRequest(BaseModel):
    """Request model for documentation generation"""
    model_name: str
    documentation_type: str = "full"  # "api", "user_guide", "technical"
    format: str = "markdown"  # "json", "pdf", "html"
    sections: List[str] = ["overview", "usage", "performance", "limitations"]
    language: str = "en"
    output_path: Optional[str] = None

class ModelDocumentationResponse(BaseModel):
    """Response model for documentation operations"""
    model_name: str
    documentation_type: str
    content: str
    format: str
    length: int
    timestamp: str = datetime.datetime.utcnow().isoformat()
    status: str
    request_id: str

# Model Governance
class ModelGovernanceRequest(BaseModel):
    """Request model for model governance"""
    model_name: str
    governance_rules: ModelGovernanceRules
    validation: Dict[str, Any] = {}
    override: bool = False
    force: bool = False

class ModelGovernanceResponse(BaseModel):
    """Response model for governance operations"""
    model_name: str
    governance_rules: ModelGovernanceRules
    status: str
    message: str
    timestamp: str = datetime.datetime.utcnow().isoformat()
    validation_results: Dict[str, Any] = {}

# Model Benchmarking
class ModelBenchmarkRequest(BaseModel):
    """Request model for benchmarking"""
    model_name: str
    benchmark_type: str = "standard"  # "custom", "regression", "stress"
    test_suite: str = "MMLU"
    parameters: Dict[str, Any] = {}
    baseline: Optional[str] = None
    priority: int = Field(default=3, ge=1, le=5)
    timeout: str = "PT30M"  # ISO 8601 duration

class ModelBenchmarkResult(BaseModel):
    """Benchmark result model"""
    model_name: str
    provider: ModelProvider
    benchmark_type: str
    score: float
    metrics: Dict[str, float] = {}
    details: Dict[str, Any] = {}
    timestamp: str = datetime.datetime.utcnow().isoformat()
    passed: bool = True

# Chat Analytics
class ChatAnalyticsRequest(BaseModel):
    """Request model for analytics"""
    start_date: str = (datetime.datetime.utcnow() - datetime.timedelta(days=30)).isoformat()
    end_date: str = datetime.datetime.utcnow().isoformat()
    granularity: str = "daily"  # "hourly", "monthly"
    metrics: List[str] = ["token_usage", "response_time", "error_rate"]
    filters: Dict[str, Any] = {}

class ChatAnalyticsResponse(BaseModel):
    """Response model for chat analytics"""
    analytics: Dict[str, Any] = {}
    time_range: Dict[str, str] = {
        "start": (datetime.datetime.utcnow() - datetime.timedelta(days=30)).isoformat(),
        "end": datetime.datetime.utcnow().isoformat()
    }
    filters: Dict[str, Any] = {}
    timestamp: str = datetime.datetime.utcnow().isoformat()

# Model Compatibility
class ModelCompatibilityMatrix(BaseModel):
    """Model compatibility matrix"""
    model_name: str
    provider: ModelProvider
    compatible_versions: Dict[ModelProvider, List[str]] = {}
    dependencies: Dict[str, str] = {}
    hardware_requirements: Dict[str, Any] = {}
    software_requirements: Dict[str, Any] = {}
    status: str = "healthy"
    timestamp: str = datetime.datetime.utcnow().isoformat()

class ModelCompatibilityCheckRequest(BaseModel):
    """Request model for compatibility checks"""
    model_name: str
    target: str  # Target model name or version
    provider: ModelProvider = ModelProvider.OLLAMA
    check_type: str = "basic"  # "full", "quick", "version"
    request_id: str = str(uuid.uuid4())

# Model Export/Import
class ModelExportRequest(BaseModel):
    """Request model for model export"""
    model_name: str
    format: str = "ollama"  # "onnx", "gguf", "safetensors"
    output_path: Optional[str] = None
    include_metadata: bool = True
    include_weights: bool = True
    encryption: bool = False
    encryption_key: Optional[str] = None

class ModelExportResponse(BaseModel):
    """Response model for model export"""
    model_name: str
    file_path: str
    file_size: int  # Bytes
    hash: str
    status: str
    download_link: Optional[str] = None
    expiration: Optional[str] = None  # ISO 8601
    request_id: str

class ModelImportRequest(BaseModel):
    """Request model for model import"""
    source: str  # URL or local path
    target_name: Optional[str] = None
    provider: ModelProvider = ModelProvider.OLLAMA
    verify_integrity: bool = True
    optimize: bool = True
    quantization: str = "q4_0"
    request_id: str = str(uuid.uuid4())

class ModelImportResponse(BaseModel):
    """Response model for model import"""
    model_name: str
    provider: ModelProvider
    status: str
    message: str
    model_info: ModelInfo = ModelInfo()
    warnings: List[str] = []
    request_id: str

# Enhanced ModelInfo with relationships
class ModelInfo(ModelInfo):
    """Extended ModelInfo with full lifecycle support"""
    version: str = "1.0.0"
    tags: List[str] = []
    capabilities: ModelCapabilities = ModelCapabilities()
    governance: ModelGovernanceRules = ModelGovernanceRules()
    compatibility: ModelCompatibilityMatrix = ModelCompatibilityMatrix()
    performance: ModelPerformanceMetrics = ModelPerformanceMetrics()
    training: ModelTrainingStatus = ModelTrainingStatus()
    documentation: ModelDocumentationResponse = ModelDocumentationResponse()
    recommendations: List[str] = []
    audit_trail: List[Dict[str, Any]] = []

# Prompt Engineering Models
class PromptEngineeringRequest(PromptEngineeringRequest):
    """Extended prompt engineering request"""
    name: str = "default"
    description: Optional[str] = None
    output_format: str = "text"  # "json", "markdown", "html"
    advanced_options: Dict[str, Any] = {
        "temperature": 0.7,
        "top_p": 0.9,
        "repetition_penalty": 1.0
    }

# User Preferences with full settings
class UserPreferences(UserPreferences):
    """Extended user preferences"""
    interface: str = "default"  # "advanced", "simple"
    history_visibility: str = "private"  # "public", "shared"
    dark_mode: bool = False
    font_size: str = "normal"  # "small", "large"
    chat_history: bool = True
    auto_save: bool = True
    model_recommendations: Dict[str, Any] = {
        "enabled": True,
        "threshold": 0.7
    }
    notifications: Dict[str, bool] = {
        "model_updates": True,
        "security_alerts": True,
        "performance_alerts": False
    }
    provider_settings: Dict[ModelProvider, Dict[str, Any]] = {
        ModelProvider.OLLAMA: {"host": "localhost:11434"},
        ModelProvider.OPENAI: {"organization": "", "project": ""}
    }
    tenant_id: Optional[str] = None

# System Settings with full configuration
class SystemSettings(SystemSettings):
    """Extended system settings"""
    logging_level: str = "INFO"  # "DEBUG", "WARNING", "ERROR"
    retention_policies: Dict[str, int] = {
        "chat_history": 30,
        "model_versions": 90,
        "logs": 7
    }
    security: Dict[str, Any] = {
        "encryption": "AES-256",
        "audit_logging": True,
        "sensitive_data_masking": True
    }
    cache: Dict[str, Any] = {
        "enabled": True,
        "max_size": "10GB",
        "eviction_policy": "lru"
    }
    monitoring: Dict[str, Any] = {
        "enabled": True,
        "alert_thresholds": {
            "error_rate": 0.1,
            "latency": 2000  # ms
        },
        "export_metrics": True
    }
    tenant_id: Optional[str] = None

# Model Governance with full implementation
class ModelGovernanceRules(ModelGovernanceRules):
    """Full implementation of model governance"""
    allowed_regions: List[str] = ["global"]
    max_input_length: int = 8192
    max_output_length: int = 4096
    allowed_use_cases: List[str] = ["general"]
    restricted_content: List[str] = ["hate", "violence", "sexual"]
    compliance: Dict[str, bool] = {
        "GDPR": False,
        "HIPAA": False,
        "SOC2": False
    }
    data_retention: str = "365d"  # ISO duration
    rate_limits: Dict[str, Any] = {
        "requests_per_minute": 60,
        "tokens_per_minute": 100000,
        "concurrent_requests": 10
    }

# Model Capabilities with full implementation
class ModelCapabilities(ModelCapabilities):
    """Full implementation of model capabilities"""
    vision: bool = False
    audio: bool = False
    video: bool = False
    multimodal: bool = False
    chat: bool = True
    completion: bool = True
    fine_tuning: bool = False
    quantization: bool = False
    distillation: bool = False
    compression: bool = False

# Enhanced Chat History with full metadata
class ChatHistory(ChatHistory):
    """Enhanced ChatHistory with full metadata"""
    user_id: str
    query: str
    response: str
    model: str
    provider: ModelProvider
    timestamp: str = datetime.datetime.utcnow().isoformat()
    tokens_used: int = 0
    status: str = "success"  # "success", "error", "warning"
    error: Optional[str] = None
    duration: float = 0.0  # Seconds
    input_length: int = 0
    output_length: int = 0
    tenant_id: Optional[str] = None
    feedback: Optional[int] = Field(None, ge=1, le=5)
    rating_reason: Optional[str] = None
    session_id: str = str(uuid.uuid4())
    tags: List[str] = []
    attachments: List[str] = []

# Model Comparison with full implementation
class ModelComparison(ModelComparison):
    """Full implementation of model comparison"""
    model_a: ModelInfo
    model_b: ModelInfo
    metrics: Dict[str, float]
    recommendations: List[str] = []
    confidence: float = 0.0
    baseline: str = "default"
    comparison_date: str = datetime.datetime.utcnow().isoformat()

# Model Documentation with full implementation
class ModelDocumentationResponse(ModelDocumentationResponse):
    """Full implementation of model documentation response"""
    model_name: str
    content: str
    format: str
    length: int
    status: str
    request_id: str
    version: str
    last_updated: str = datetime.datetime.utcnow().isoformat()
    tags: List[str] = []
    related_models: List[str] = []