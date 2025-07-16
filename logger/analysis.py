"""
Log analysis utilities for monitoring and debugging
"""

import json
import re
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from collections import defaultdict, Counter
import statistics

class LogAnalyzer:
    """Analyze log files for insights and monitoring"""
    
    def __init__(self, log_dir: Optional[Path] = None):
        self.log_dir = log_dir or Path(__file__).parent / "logs"
    
    def get_log_files(self) -> Dict[str, Path]:
        """Get all available log files"""
        log_files = {}
        for log_file in self.log_dir.glob("*.log"):
            log_files[log_file.stem] = log_file
        return log_files
    
    def parse_structured_logs(self, start_time: Optional[datetime] = None,
                             end_time: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """Parse structured JSON logs"""
        structured_log = self.log_dir / "structured.log"
        if not structured_log.exists():
            return []
        
        logs = []
        with open(structured_log, 'r', encoding='utf-8') as f:
            for line in f:
                try:
                    log_entry = json.loads(line.strip())
                    log_time = datetime.fromisoformat(log_entry['timestamp'])
                    
                    # Filter by time range
                    if start_time and log_time < start_time:
                        continue
                    if end_time and log_time > end_time:
                        continue
                    
                    logs.append(log_entry)
                except (json.JSONDecodeError, KeyError, ValueError):
                    continue
        
        return logs
    
    def analyze_query_patterns(self, hours: int = 24) -> Dict[str, Any]:
        """Analyze query patterns over the last N hours"""
        end_time = datetime.now()
        start_time = end_time - timedelta(hours=hours)
        
        query_log = self.log_dir / "queries_structured.log"
        if not query_log.exists():
            return {"error": "Query log file not found"}
        
        queries = []
        responses = []
        errors = []
        
        with open(query_log, 'r', encoding='utf-8') as f:
            for line in f:
                try:
                    log_entry = json.loads(line.strip())
                    log_time = datetime.fromisoformat(log_entry['timestamp'])
                    
                    if start_time <= log_time <= end_time:
                        if log_entry.get('extra', {}).get('type') == 'query_received':
                            queries.append(log_entry)
                        elif log_entry.get('extra', {}).get('type') == 'query_response':
                            responses.append(log_entry)
                        elif log_entry.get('extra', {}).get('type') == 'query_error':
                            errors.append(log_entry)
                except (json.JSONDecodeError, KeyError, ValueError):
                    continue
        
        # Calculate statistics
        total_queries = len(queries)
        successful_responses = len(responses)
        failed_queries = len(errors)
        
        # Calculate processing times
        processing_times = []
        for response in responses:
            if 'processing_time' in response.get('extra', {}):
                processing_times.append(response['extra']['processing_time'])
        
        # Query frequency analysis
        query_counts = Counter()
        for query in queries:
            query_text = query.get('extra', {}).get('query', '')
            # Normalize query for pattern analysis
            normalized = re.sub(r'\d+', 'X', query_text.lower())
            query_counts[normalized] += 1
        
        return {
            "time_range": {
                "start": start_time.isoformat(),
                "end": end_time.isoformat(),
                "hours": hours
            },
            "summary": {
                "total_queries": total_queries,
                "successful_responses": successful_responses,
                "failed_queries": failed_queries,
                "success_rate": (successful_responses / total_queries * 100) if total_queries > 0 else 0
            },
            "processing_times": {
                "count": len(processing_times),
                "average": statistics.mean(processing_times) if processing_times else 0,
                "median": statistics.median(processing_times) if processing_times else 0,
                "min": min(processing_times) if processing_times else 0,
                "max": max(processing_times) if processing_times else 0
            },
            "popular_queries": query_counts.most_common(10),
            "error_summary": {
                "total_errors": failed_queries,
                "error_rate": (failed_queries / total_queries * 100) if total_queries > 0 else 0
            }
        }
    
    def analyze_error_patterns(self, hours: int = 24) -> Dict[str, Any]:
        """Analyze error patterns"""
        end_time = datetime.now()
        start_time = end_time - timedelta(hours=hours)
        
        logs = self.parse_structured_logs(start_time, end_time)
        
        error_logs = [log for log in logs if log['level'] in ['ERROR', 'CRITICAL']]
        
        # Group errors by type
        error_types = Counter()
        error_modules = Counter()
        error_functions = Counter()
        
        for error in error_logs:
            # Extract error type from message
            message = error['message']
            if 'Exception' in message:
                error_type = message.split('Exception')[0].split()[-1] + 'Exception'
            elif 'Error' in message:
                error_type = message.split('Error')[0].split()[-1] + 'Error'
            else:
                error_type = 'Unknown'
            
            error_types[error_type] += 1
            error_modules[error['module']] += 1
            error_functions[error['function']] += 1
        
        return {
            "time_range": {
                "start": start_time.isoformat(),
                "end": end_time.isoformat(),
                "hours": hours
            },
            "summary": {
                "total_errors": len(error_logs),
                "error_types": dict(error_types.most_common(10)),
                "error_modules": dict(error_modules.most_common(10)),
                "error_functions": dict(error_functions.most_common(10))
            },
            "recent_errors": [
                {
                    "timestamp": error['timestamp'],
                    "level": error['level'],
                    "message": error['message'][:200] + "..." if len(error['message']) > 200 else error['message'],
                    "module": error['module'],
                    "function": error['function']
                }
                for error in error_logs[-10:]  # Last 10 errors
            ]
        }
    
    def get_system_health(self) -> Dict[str, Any]:
        """Get overall system health status"""
        # Analyze last 1 hour
        query_analysis = self.analyze_query_patterns(hours=1)
        error_analysis = self.analyze_error_patterns(hours=1)
        
        # Calculate health score
        success_rate = query_analysis.get('summary', {}).get('success_rate', 0)
        error_rate = error_analysis.get('summary', {}).get('total_errors', 0)
        
        # Simple health scoring
        health_score = max(0, min(100, success_rate - error_rate))
        
        if health_score >= 90:
            status = "healthy"
        elif health_score >= 70:
            status = "warning"
        else:
            status = "critical"
        
        return {
            "status": status,
            "health_score": health_score,
            "last_hour_summary": {
                "queries": query_analysis.get('summary', {}),
                "errors": error_analysis.get('summary', {})
            },
            "recommendations": self._get_health_recommendations(query_analysis, error_analysis)
        }
    
    def _get_health_recommendations(self, query_analysis: Dict[str, Any], 
                                  error_analysis: Dict[str, Any]) -> List[str]:
        """Generate health recommendations"""
        recommendations = []
        
        # Check success rate
        success_rate = query_analysis.get('summary', {}).get('success_rate', 0)
        if success_rate < 95:
            recommendations.append("Success rate is below 95%. Check for recurring errors.")
        
        # Check processing times
        avg_time = query_analysis.get('processing_times', {}).get('average', 0)
        if avg_time > 30:  # 30 seconds
            recommendations.append("Average processing time is high. Consider optimizing queries.")
        
        # Check error rate
        error_rate = error_analysis.get('summary', {}).get('total_errors', 0)
        if error_rate > 5:  # More than 5 errors per hour
            recommendations.append("High error rate detected. Check logs for recurring issues.")
        
        if not recommendations:
            recommendations.append("System is operating normally.")
        
        return recommendations
    
    def export_analysis_report(self, output_file: Optional[Path] = None) -> Path:
        """Export a comprehensive analysis report"""
        if output_file is None:
            output_file = self.log_dir / f"analysis_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        report = {
            "generated_at": datetime.now().isoformat(),
            "system_health": self.get_system_health(),
            "query_patterns_24h": self.analyze_query_patterns(hours=24),
            "error_patterns_24h": self.analyze_error_patterns(hours=24),
            "log_files": {name: str(path) for name, path in self.get_log_files().items()}
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        return output_file

def generate_monitoring_dashboard_data() -> Dict[str, Any]:
    """Generate data for a monitoring dashboard"""
    analyzer = LogAnalyzer()
    
    return {
        "timestamp": datetime.now().isoformat(),
        "health": analyzer.get_system_health(),
        "query_patterns": analyzer.analyze_query_patterns(hours=24),
        "error_patterns": analyzer.analyze_error_patterns(hours=24)
    }

def cleanup_old_logs(days: int = 30):
    """Clean up log files older than specified days"""
    log_dir = Path(__file__).parent / "logs"
    cutoff_date = datetime.now() - timedelta(days=days)
    
    cleaned_files = []
    for log_file in log_dir.glob("*.log*"):
        if log_file.stat().st_mtime < cutoff_date.timestamp():
            log_file.unlink()
            cleaned_files.append(str(log_file))
    
    return cleaned_files
