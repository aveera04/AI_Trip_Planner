# AI Travel Planner Logging System

This directory contains the comprehensive logging system for the AI Travel Planner application.

## Features

- **Structured Logging**: JSON-formatted logs for easy parsing and analysis
- **Multiple Log Levels**: DEBUG, INFO, WARNING, ERROR, CRITICAL
- **File Rotation**: Automatic log file rotation to prevent disk space issues
- **Colored Console Output**: Easy-to-read colored logs in the terminal
- **Specialized Loggers**: Different loggers for queries, access, and system events
- **Log Analysis**: Built-in tools for analyzing log patterns and system health

## Log Files

### System Logs
- `system.log` - General application logs with detailed information
- `structured.log` - JSON-formatted logs for automated processing
- `error.log` - Error and critical messages only

### Query Logs
- `queries.log` - Human-readable query logs
- `queries_structured.log` - JSON-formatted query logs with metadata

### Access Logs
- `access.log` - API request access logs

## Usage

### Basic Logging

```python
from logger import get_logger

# Get a logger instance
logger = get_logger("my_component")

# Log messages
logger.debug("Debug message")
logger.info("Info message")
logger.warning("Warning message")
logger.error("Error message")
logger.critical("Critical message")
```

### Query Logging

```python
from logger.logger_config import get_query_logger

query_logger = get_query_logger()

# Log a query
query_logger.log_query("Plan a trip to Paris for 5 days")

# Log a response
query_logger.log_response(
    query="Plan a trip to Paris for 5 days",
    response="Here's your 5-day Paris itinerary...",
    processing_time=2.5
)

# Log an error
query_logger.log_error(
    query="Plan a trip to Paris for 5 days",
    error="API rate limit exceeded"
)
```

### Using Decorators

```python
from logger.utils import log_execution_time, log_query_processing

@log_execution_time("api")
def my_api_function():
    # Your code here
    pass

@log_query_processing
def process_travel_query(query):
    # Your query processing code
    pass
```

### Access Logging

```python
from logger.logger_config import get_access_logger

access_logger = get_access_logger()

# Log an API request
access_logger.log_request(
    method="POST",
    path="/query",
    user_id="user123",
    ip_address="192.168.1.1"
)
```

## Log Analysis

### Real-time Analysis

```python
from logger.analysis import LogAnalyzer

analyzer = LogAnalyzer()

# Get system health status
health = analyzer.get_system_health()
print(f"System status: {health['status']}")

# Analyze query patterns
patterns = analyzer.analyze_query_patterns(hours=24)
print(f"Queries in last 24h: {patterns['summary']['total_queries']}")

# Analyze error patterns
errors = analyzer.analyze_error_patterns(hours=24)
print(f"Errors in last 24h: {errors['summary']['total_errors']}")
```

### Generate Reports

```python
from logger.analysis import LogAnalyzer

analyzer = LogAnalyzer()

# Export comprehensive analysis report
report_file = analyzer.export_analysis_report()
print(f"Report saved to: {report_file}")
```

## Configuration

### Log Levels
- `DEBUG`: Detailed information for debugging
- `INFO`: General information about system operation
- `WARNING`: Warnings about potential issues
- `ERROR`: Error messages for failed operations
- `CRITICAL`: Critical errors that may stop the application

### File Rotation
- System logs: 10MB files, 5 backups
- Query logs: 20MB files, 10 backups
- Error logs: 5MB files, 3 backups

## Integration with FastAPI

```python
from logger.utils import setup_fastapi_logging
from logger.logger_config import log_system_startup

# Setup logging for FastAPI
logger = setup_fastapi_logging()

# Log system startup
log_system_startup()
```

## Monitoring Dashboard

The logging system includes utilities for creating monitoring dashboards:

```python
from logger.analysis import generate_monitoring_dashboard_data

dashboard_data = generate_monitoring_dashboard_data()
# Use this data to create real-time monitoring dashboards
```

## Maintenance

### Log Cleanup

```python
from logger.analysis import cleanup_old_logs

# Clean up logs older than 30 days
cleaned_files = cleanup_old_logs(days=30)
```

### Log Directory Structure

```
logs/
├── system.log              # General system logs
├── structured.log          # JSON-formatted logs
├── error.log              # Error logs only
├── queries.log            # Query logs
├── queries_structured.log # JSON query logs
├── access.log            # API access logs
└── analysis_report_*.json # Generated analysis reports
```

## Best Practices

1. **Use appropriate log levels**: Don't log everything as INFO
2. **Include context**: Add relevant metadata to log messages
3. **Handle sensitive data**: Never log passwords or API keys
4. **Monitor log file sizes**: The system handles rotation automatically
5. **Regular analysis**: Use the analysis tools to monitor system health

## Troubleshooting

### Common Issues

1. **Permission errors**: Ensure the application has write access to the logs directory
2. **Disk space**: Monitor disk space usage, especially with high-traffic applications
3. **Log rotation**: If logs aren't rotating, check file permissions and disk space

### Performance Considerations

- JSON logging has a small performance overhead
- File I/O is asynchronous where possible
- Log rotation prevents individual files from becoming too large

## Future Enhancements

- Integration with log aggregation services (ELK stack, Splunk)
- Real-time alerting based on log patterns
- Machine learning-based anomaly detection
- Cloud storage integration for long-term log retention
