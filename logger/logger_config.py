"""
Comprehensive logging configuration for AI Travel Planner
Provides structured logging with file rotation, different log levels, and formatters
"""

import logging
import logging.handlers
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any
import json

# Log directory configuration
LOG_DIR = Path(__file__).parent / "logs"
LOG_DIR.mkdir(exist_ok=True)

# Log file paths
ACCESS_LOG_FILE = LOG_DIR / "access.log"
ERROR_LOG_FILE = LOG_DIR / "error.log"
QUERY_LOG_FILE = LOG_DIR / "queries.log"
SYSTEM_LOG_FILE = LOG_DIR / "system.log"

# Log levels mapping
LOG_LEVELS = {
    'DEBUG': logging.DEBUG,
    'INFO': logging.INFO,
    'WARNING': logging.WARNING,
    'ERROR': logging.ERROR,
    'CRITICAL': logging.CRITICAL
}

class JSONFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging"""
    
    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            'timestamp': datetime.fromtimestamp(record.created).isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno,
            'process_id': record.process,
            'thread_id': record.thread
        }
        
        # Add exception info if present
        if record.exc_info:
            log_entry['exception'] = self.formatException(record.exc_info)
        
        # Add extra fields if present
        if hasattr(record, 'extra_data'):
            log_entry['extra'] = record.extra_data
            
        return json.dumps(log_entry, ensure_ascii=False)

class ColoredFormatter(logging.Formatter):
    """Colored console formatter for better readability"""
    
    COLORS = {
        'DEBUG': '\033[36m',    # Cyan
        'INFO': '\033[32m',     # Green
        'WARNING': '\033[33m',  # Yellow
        'ERROR': '\033[31m',    # Red
        'CRITICAL': '\033[35m', # Magenta
        'RESET': '\033[0m'      # Reset
    }
    
    def format(self, record: logging.LogRecord) -> str:
        color = self.COLORS.get(record.levelname, self.COLORS['RESET'])
        reset = self.COLORS['RESET']
        
        # Format the message with colors
        record.levelname = f"{color}{record.levelname}{reset}"
        return super().format(record)

class TravelPlannerLogger:
    """Main logger class for the Travel Planner application"""
    
    def __init__(self, name: str = "travel_planner"):
        self.name = name
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.DEBUG)
        
        # Prevent duplicate handlers
        if not self.logger.handlers:
            self._setup_handlers()
    
    def _setup_handlers(self):
        """Setup all log handlers"""
        
        # Console handler with colored output
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)
        console_formatter = ColoredFormatter(
            fmt='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        console_handler.setFormatter(console_formatter)
        self.logger.addHandler(console_handler)
        
        # File handler for general system logs
        system_handler = logging.handlers.RotatingFileHandler(
            SYSTEM_LOG_FILE,
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5
        )
        system_handler.setLevel(logging.DEBUG)
        system_formatter = logging.Formatter(
            fmt='%(asctime)s - %(name)s - %(levelname)s - %(module)s:%(funcName)s:%(lineno)d - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        system_handler.setFormatter(system_formatter)
        self.logger.addHandler(system_handler)
        
        # JSON handler for structured logging
        json_handler = logging.handlers.RotatingFileHandler(
            LOG_DIR / "structured.log",
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5
        )
        json_handler.setLevel(logging.DEBUG)
        json_handler.setFormatter(JSONFormatter())
        self.logger.addHandler(json_handler)
        
        # Error handler for error-only logs
        error_handler = logging.handlers.RotatingFileHandler(
            ERROR_LOG_FILE,
            maxBytes=5*1024*1024,   # 5MB
            backupCount=3
        )
        error_handler.setLevel(logging.ERROR)
        error_handler.setFormatter(system_formatter)
        self.logger.addHandler(error_handler)
    
    def get_logger(self) -> logging.Logger:
        """Get the configured logger instance"""
        return self.logger

class QueryLogger:
    """Specialized logger for tracking API queries and responses"""
    
    def __init__(self):
        self.logger = logging.getLogger("query_logger")
        self.logger.setLevel(logging.INFO)
        
        if not self.logger.handlers:
            self._setup_handlers()
    
    def _setup_handlers(self):
        """Setup query-specific handlers"""
        
        # Query log file handler
        query_handler = logging.handlers.RotatingFileHandler(
            QUERY_LOG_FILE,
            maxBytes=20*1024*1024,  # 20MB
            backupCount=10
        )
        query_handler.setLevel(logging.INFO)
        query_formatter = logging.Formatter(
            fmt='%(asctime)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        query_handler.setFormatter(query_formatter)
        self.logger.addHandler(query_handler)
        
        # JSON handler for structured query logging
        json_handler = logging.handlers.RotatingFileHandler(
            LOG_DIR / "queries_structured.log",
            maxBytes=20*1024*1024,  # 20MB
            backupCount=10
        )
        json_handler.setLevel(logging.INFO)
        json_handler.setFormatter(JSONFormatter())
        self.logger.addHandler(json_handler)
    
    def log_query(self, query: str, user_id: Optional[str] = None, 
                  metadata: Optional[Dict[str, Any]] = None):
        """Log an incoming query"""
        extra_data = {
            'query': query,
            'user_id': user_id,
            'type': 'query_received',
            'metadata': metadata or {}
        }
        
        self.logger.info(
            f"Query received: {query[:100]}{'...' if len(query) > 100 else ''}",
            extra={'extra_data': extra_data}
        )
    
    def log_response(self, query: str, response: str, processing_time: float,
                     user_id: Optional[str] = None, metadata: Optional[Dict[str, Any]] = None):
        """Log a query response"""
        extra_data = {
            'query': query,
            'response': response,
            'processing_time': processing_time,
            'user_id': user_id,
            'type': 'query_response',
            'metadata': metadata or {}
        }
        
        self.logger.info(
            f"Query processed in {processing_time:.2f}s: {query[:50]}{'...' if len(query) > 50 else ''}",
            extra={'extra_data': extra_data}
        )
    
    def log_error(self, query: str, error: str, user_id: Optional[str] = None,
                  metadata: Optional[Dict[str, Any]] = None):
        """Log a query error"""
        extra_data = {
            'query': query,
            'error': error,
            'user_id': user_id,
            'type': 'query_error',
            'metadata': metadata or {}
        }
        
        self.logger.error(
            f"Query failed: {query[:50]}{'...' if len(query) > 50 else ''} - Error: {error}",
            extra={'extra_data': extra_data}
        )

class AccessLogger:
    """Logger for tracking API access patterns"""
    
    def __init__(self):
        self.logger = logging.getLogger("access_logger")
        self.logger.setLevel(logging.INFO)
        
        if not self.logger.handlers:
            self._setup_handlers()
    
    def _setup_handlers(self):
        """Setup access-specific handlers"""
        
        # Access log file handler
        access_handler = logging.handlers.RotatingFileHandler(
            ACCESS_LOG_FILE,
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5
        )
        access_handler.setLevel(logging.INFO)
        access_formatter = logging.Formatter(
            fmt='%(asctime)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        access_handler.setFormatter(access_formatter)
        self.logger.addHandler(access_handler)
    
    def log_request(self, method: str, path: str, user_id: Optional[str] = None,
                    ip_address: Optional[str] = None, user_agent: Optional[str] = None):
        """Log an API request"""
        message = f"{method} {path}"
        if user_id:
            message += f" - User: {user_id}"
        if ip_address:
            message += f" - IP: {ip_address}"
        if user_agent:
            message += f" - Agent: {user_agent}"
        
        self.logger.info(message)

# Global logger instances
_main_logger = None
_query_logger = None
_access_logger = None

def setup_logger(name: str = "travel_planner", level: str = "INFO") -> logging.Logger:
    """
    Setup and configure the main application logger
    
    Args:
        name: Logger name
        level: Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    
    Returns:
        Configured logger instance
    """
    global _main_logger
    
    if _main_logger is None:
        _main_logger = TravelPlannerLogger(name)
    
    # Set log level
    if level in LOG_LEVELS:
        _main_logger.logger.setLevel(LOG_LEVELS[level])
    
    return _main_logger.get_logger()

def get_logger(name: str = "travel_planner") -> logging.Logger:
    """
    Get or create a logger instance
    
    Args:
        name: Logger name
    
    Returns:
        Logger instance
    """
    return setup_logger(name)

def get_query_logger() -> QueryLogger:
    """Get the query logger instance"""
    global _query_logger
    
    if _query_logger is None:
        _query_logger = QueryLogger()
    
    return _query_logger

def get_access_logger() -> AccessLogger:
    """Get the access logger instance"""
    global _access_logger
    
    if _access_logger is None:
        _access_logger = AccessLogger()
    
    return _access_logger

def log_system_startup():
    """Log system startup information"""
    logger = get_logger("system")
    logger.info("=" * 50)
    logger.info("AI Travel Planner System Starting Up")
    logger.info(f"Python version: {sys.version}")
    logger.info(f"Log directory: {LOG_DIR}")
    logger.info(f"System time: {datetime.now().isoformat()}")
    logger.info("=" * 50)

def log_system_shutdown():
    """Log system shutdown information"""
    logger = get_logger("system")
    logger.info("=" * 50)
    logger.info("AI Travel Planner System Shutting Down")
    logger.info(f"Shutdown time: {datetime.now().isoformat()}")
    logger.info("=" * 50)
