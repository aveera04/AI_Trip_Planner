"""
Logging utilities and decorators for the AI Travel Planner
"""

import time
import functools
from typing import Any, Callable, Optional
from .logger_config import get_logger, get_query_logger, get_access_logger

def log_execution_time(logger_name: str = "travel_planner"):
    """
    Decorator to log function execution time
    
    Args:
        logger_name: Name of the logger to use
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            logger = get_logger(logger_name)
            start_time = time.time()
            
            try:
                logger.debug(f"Starting execution of {func.__name__}")
                result = func(*args, **kwargs)
                execution_time = time.time() - start_time
                logger.debug(f"Completed {func.__name__} in {execution_time:.3f}s")
                return result
            except Exception as e:
                execution_time = time.time() - start_time
                logger.error(f"Error in {func.__name__} after {execution_time:.3f}s: {str(e)}")
                raise
        
        return wrapper
    return decorator

def log_api_call(logger_name: str = "api"):
    """
    Decorator to log API calls
    
    Args:
        logger_name: Name of the logger to use
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            logger = get_logger(logger_name)
            start_time = time.time()
            
            # Log the API call
            logger.info(f"API call: {func.__name__}")
            
            try:
                result = func(*args, **kwargs)
                execution_time = time.time() - start_time
                logger.info(f"API call {func.__name__} completed successfully in {execution_time:.3f}s")
                return result
            except Exception as e:
                execution_time = time.time() - start_time
                logger.error(f"API call {func.__name__} failed after {execution_time:.3f}s: {str(e)}")
                raise
        
        return wrapper
    return decorator

def log_query_processing(func: Callable) -> Callable:
    """
    Decorator specifically for query processing functions
    """
    @functools.wraps(func)
    def wrapper(*args, **kwargs) -> Any:
        query_logger = get_query_logger()
        start_time = time.time()
        
        # Extract query from arguments (assuming it's the first argument or in kwargs)
        query = None
        if args and hasattr(args[0], 'question'):
            query = args[0].question
        elif 'query' in kwargs:
            query = kwargs['query']
        elif args and isinstance(args[0], str):
            query = args[0]
        
        # Log query start
        if query:
            query_logger.log_query(query)
        
        try:
            result = func(*args, **kwargs)
            execution_time = time.time() - start_time
            
            # Log successful response
            if query and hasattr(result, 'get'):
                response = result.get('answer', str(result))
                query_logger.log_response(query, response, execution_time)
            
            return result
        except Exception as e:
            execution_time = time.time() - start_time
            
            # Log error
            if query:
                query_logger.log_error(query, str(e))
            
            raise
    
    return wrapper

class LoggerMixin:
    """
    Mixin class to add logging capabilities to any class
    """
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.logger = get_logger(self.__class__.__name__)
    
    def log_debug(self, message: str, **kwargs):
        """Log debug message"""
        self.logger.debug(message, extra={'extra_data': kwargs})
    
    def log_info(self, message: str, **kwargs):
        """Log info message"""
        self.logger.info(message, extra={'extra_data': kwargs})
    
    def log_warning(self, message: str, **kwargs):
        """Log warning message"""
        self.logger.warning(message, extra={'extra_data': kwargs})
    
    def log_error(self, message: str, **kwargs):
        """Log error message"""
        self.logger.error(message, extra={'extra_data': kwargs})
    
    def log_critical(self, message: str, **kwargs):
        """Log critical message"""
        self.logger.critical(message, extra={'extra_data': kwargs})

def setup_fastapi_logging():
    """
    Setup logging for FastAPI application
    """
    import logging
    
    # Configure uvicorn loggers
    uvicorn_access = logging.getLogger("uvicorn.access")
    uvicorn_access.handlers = []
    
    uvicorn_error = logging.getLogger("uvicorn.error")
    uvicorn_error.handlers = []
    
    # Use our custom handlers
    access_logger = get_access_logger()
    main_logger = get_logger("fastapi")
    
    # Add custom handler for uvicorn
    class UvicornAccessHandler(logging.Handler):
        def emit(self, record):
            if hasattr(record, 'args') and len(record.args) >= 3:
                method = record.args[1] if len(record.args) > 1 else "GET"
                path = record.args[2] if len(record.args) > 2 else "/"
                access_logger.log_request(method, path)
    
    uvicorn_access.addHandler(UvicornAccessHandler())
    
    return main_logger
