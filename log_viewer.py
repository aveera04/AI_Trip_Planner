#!/usr/bin/env python3
"""
Simple log viewer for AI Travel Planner
Usage: python log_viewer.py [options]
"""

import argparse
import json
import sys
from datetime import datetime, timedelta
from pathlib import Path
from logger.analysis import LogAnalyzer

def format_timestamp(timestamp_str):
    """Format timestamp for display"""
    try:
        dt = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
        return dt.strftime('%Y-%m-%d %H:%M:%S')
    except:
        return timestamp_str

def display_system_health():
    """Display system health status"""
    analyzer = LogAnalyzer()
    health = analyzer.get_system_health()
    
    print("\n🏥 SYSTEM HEALTH STATUS")
    print("=" * 50)
    print(f"Status: {health['status'].upper()}")
    print(f"Health Score: {health['health_score']}/100")
    
    print("\n📊 Last Hour Summary:")
    queries = health['last_hour_summary']['queries']
    errors = health['last_hour_summary']['errors']
    
    print(f"  Total Queries: {queries.get('total_queries', 0)}")
    print(f"  Successful: {queries.get('successful_responses', 0)}")
    print(f"  Failed: {queries.get('failed_queries', 0)}")
    print(f"  Success Rate: {queries.get('success_rate', 0):.1f}%")
    print(f"  Total Errors: {errors.get('total_errors', 0)}")
    
    print("\n💡 Recommendations:")
    for recommendation in health['recommendations']:
        print(f"  • {recommendation}")

def display_recent_logs(hours=1, log_type="system"):
    """Display recent logs"""
    analyzer = LogAnalyzer()
    end_time = datetime.now()
    start_time = end_time - timedelta(hours=hours)
    
    print(f"\n📋 RECENT {log_type.upper()} LOGS ({hours}h)")
    print("=" * 50)
    
    logs = analyzer.parse_structured_logs(start_time, end_time)
    
    if not logs:
        print("No logs found in the specified time range.")
        return
    
    # Filter by log type if specified
    if log_type == "error":
        logs = [log for log in logs if log['level'] in ['ERROR', 'CRITICAL']]
    elif log_type == "warning":
        logs = [log for log in logs if log['level'] == 'WARNING']
    
    # Display last 20 logs
    for log in logs[-20:]:
        timestamp = format_timestamp(log['timestamp'])
        level = log['level']
        message = log['message'][:100] + "..." if len(log['message']) > 100 else log['message']
        
        # Color coding for levels
        color = {
            'DEBUG': '\033[36m',    # Cyan
            'INFO': '\033[32m',     # Green  
            'WARNING': '\033[33m',  # Yellow
            'ERROR': '\033[31m',    # Red
            'CRITICAL': '\033[35m'  # Magenta
        }.get(level, '\033[0m')
        
        print(f"{timestamp} [{color}{level}\033[0m] {message}")

def display_query_analysis(hours=24):
    """Display query analysis"""
    analyzer = LogAnalyzer()
    analysis = analyzer.analyze_query_patterns(hours)
    
    print(f"\n🔍 QUERY ANALYSIS ({hours}h)")
    print("=" * 50)
    
    summary = analysis['summary']
    print(f"Total Queries: {summary['total_queries']}")
    print(f"Successful: {summary['successful_responses']}")
    print(f"Failed: {summary['failed_queries']}")
    print(f"Success Rate: {summary['success_rate']:.1f}%")
    
    times = analysis['processing_times']
    if times['count'] > 0:
        print(f"\n⏱️  Processing Times:")
        print(f"  Average: {times['average']:.2f}s")
        print(f"  Median: {times['median']:.2f}s")
        print(f"  Min: {times['min']:.2f}s")
        print(f"  Max: {times['max']:.2f}s")
    
    print(f"\n📈 Popular Query Patterns:")
    for pattern, count in analysis['popular_queries'][:10]:
        print(f"  {count:3d}x: {pattern[:60]}...")

def display_error_analysis(hours=24):
    """Display error analysis"""
    analyzer = LogAnalyzer()
    analysis = analyzer.analyze_error_patterns(hours)
    
    print(f"\n🚨 ERROR ANALYSIS ({hours}h)")
    print("=" * 50)
    
    summary = analysis['summary']
    print(f"Total Errors: {summary['total_errors']}")
    
    if summary['total_errors'] > 0:
        print(f"\n🔥 Error Types:")
        for error_type, count in summary['error_types'].items():
            print(f"  {count:3d}x: {error_type}")
        
        print(f"\n📦 Error Modules:")
        for module, count in summary['error_modules'].items():
            print(f"  {count:3d}x: {module}")
        
        print(f"\n🔧 Recent Errors:")
        for error in analysis['recent_errors']:
            timestamp = format_timestamp(error['timestamp'])
            print(f"  {timestamp} [{error['level']}] {error['message']}")

def main():
    parser = argparse.ArgumentParser(description='AI Travel Planner Log Viewer')
    parser.add_argument('--health', action='store_true', help='Show system health status')
    parser.add_argument('--logs', choices=['system', 'error', 'warning'], default='system', 
                       help='Show recent logs (default: system)')
    parser.add_argument('--hours', type=int, default=1, help='Hours to look back (default: 1)')
    parser.add_argument('--queries', action='store_true', help='Show query analysis')
    parser.add_argument('--errors', action='store_true', help='Show error analysis')
    parser.add_argument('--all', action='store_true', help='Show all information')
    
    args = parser.parse_args()
    
    try:
        if args.all:
            display_system_health()
            display_recent_logs(args.hours, args.logs)
            display_query_analysis(args.hours)
            display_error_analysis(args.hours)
        elif args.health:
            display_system_health()
        elif args.queries:
            display_query_analysis(args.hours)
        elif args.errors:
            display_error_analysis(args.hours)
        else:
            display_recent_logs(args.hours, args.logs)
            
    except KeyboardInterrupt:
        print("\n\nExiting...")
        sys.exit(0)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
