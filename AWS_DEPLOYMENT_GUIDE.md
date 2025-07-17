# 🚀 AWS Deployment Guide - AI Trip Planner

**Complete step-by-step guide to deploy your AI Trip Planner to AWS**

---

## 📋 Table of Contents

1. [Prerequisites](#-prerequisites)
2. [Architecture Overview](#-architecture-overview)
3. [AWS Setup](#-aws-setup)
4. [Backend Deployment (FastAPI)](#-backend-deployment-fastapi)
5. [Frontend Deployment (React)](#-frontend-deployment-react)
6. [Database Setup](#-database-setup)
7. [Domain & SSL Configuration](#-domain--ssl-configuration)
8. [Monitoring & Logging](#-monitoring--logging)
9. [Cost Optimization](#-cost-optimization)
10. [Troubleshooting](#-troubleshooting)

---

## 🔧 Prerequisites

### Required Tools
- AWS CLI v2 installed and configured
- Docker installed
- Node.js 18+ and npm
- Python 3.10+
- Git
- Domain name (optional but recommended)

### AWS Account Requirements
- Active AWS account with billing enabled
- IAM user with appropriate permissions
- Basic understanding of AWS services

---

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CloudFront    │    │   Application    │    │      RDS        │
│   (CDN/SSL)     │───▶│  Load Balancer   │───▶│   (Database)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   ECS Service    │
                       │  (FastAPI API)   │
                       └──────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   S3 Bucket      │
                       │ (React Frontend) │
                       └──────────────────┘
```

### AWS Services Used
- **S3**: Static website hosting (Frontend)
- **ECS**: Container orchestration (Backend)
- **RDS**: Database (PostgreSQL)
- **CloudFront**: CDN and SSL termination
- **Route 53**: DNS management
- **ALB**: Application Load Balancer
- **ECR**: Container registry
- **CloudWatch**: Monitoring and logging
- **IAM**: Identity and access management

---

## 🎯 AWS Setup

### Step 1: Install AWS CLI
```bash
# Windows (PowerShell)
winget install Amazon.AWSCLI

# Verify installation
aws --version
```

### Step 2: Configure AWS CLI
```bash
# Configure with your credentials
aws configure

# Enter your:
# AWS Access Key ID: [Your Access Key]
# AWS Secret Access Key: [Your Secret Key]
# Default region name: us-east-1
# Default output format: json
```

### Step 3: Create IAM User with Required Permissions
```bash
# Create deployment user
aws iam create-user --user-name ai-trip-planner-deploy

# Attach required policies
aws iam attach-user-policy --user-name ai-trip-planner-deploy --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
aws iam attach-user-policy --user-name ai-trip-planner-deploy --policy-arn arn:aws:iam::aws:policy/AmazonECS_FullAccess
aws iam attach-user-policy --user-name ai-trip-planner-deploy --policy-arn arn:aws:iam::aws:policy/AmazonRDSFullAccess
aws iam attach-user-policy --user-name ai-trip-planner-deploy --policy-arn arn:aws:iam::aws:policy/CloudFrontFullAccess
```

---

## 🔙 Backend Deployment (FastAPI)

### Step 1: Create Dockerfile for FastAPI
```dockerfile
# Create Dockerfile in project root
FROM python:3.10-slim

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Start application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Step 2: Create .dockerignore
```
# Create .dockerignore
frontend/
node_modules/
.git/
.venv/
__pycache__/
*.pyc
.env
.DS_Store
Thumbs.db
```

### Step 3: Build and Test Docker Image Locally
```bash
# Build the image
docker build -t ai-trip-planner-backend .

# Test locally
docker run -p 8000:8000 ai-trip-planner-backend

# Test endpoint
curl http://localhost:8000/health
```

### Step 4: Create ECR Repository
```bash
# Create ECR repository
aws ecr create-repository --repository-name ai-trip-planner-backend --region us-east-1

# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
```

### Step 5: Push Image to ECR
```bash
# Get your account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Tag the image
docker tag ai-trip-planner-backend:latest $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ai-trip-planner-backend:latest

# Push to ECR
docker push $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ai-trip-planner-backend:latest
```

### Step 6: Create ECS Cluster
```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name ai-trip-planner-cluster --capacity-providers FARGATE
```

### Step 7: Create Task Definition
```json
{
  "family": "ai-trip-planner-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "ai-trip-planner-backend",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/ai-trip-planner-backend:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "GROQ_API_KEY",
          "value": "your-groq-api-key"
        },
        {
          "name": "OPENAI_API_KEY",
          "value": "your-openai-api-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/ai-trip-planner",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Step 8: Create ECS Service
```bash
# Create log group
aws logs create-log-group --log-group-name /ecs/ai-trip-planner

# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster ai-trip-planner-cluster \
  --service-name ai-trip-planner-service \
  --task-definition ai-trip-planner-task \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
```

---

## 🎨 Frontend Deployment (React)

### Step 1: Prepare Frontend for Production
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create production build
npm run build

# Test build locally
npm install -g serve
serve -s dist -l 3000
```

### Step 2: Create S3 Bucket for Static Hosting
```bash
# Create S3 bucket (replace with your unique name)
aws s3 mb s3://ai-trip-planner-frontend-your-unique-id

# Enable static website hosting
aws s3 website s3://ai-trip-planner-frontend-your-unique-id --index-document index.html --error-document error.html
```

### Step 3: Configure S3 Bucket Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::ai-trip-planner-frontend-your-unique-id/*"
    }
  ]
}
```

```bash
# Apply bucket policy
aws s3api put-bucket-policy --bucket ai-trip-planner-frontend-your-unique-id --policy file://bucket-policy.json
```

### Step 4: Upload Frontend to S3
```bash
# Upload build files
aws s3 sync dist/ s3://ai-trip-planner-frontend-your-unique-id --delete

# Set proper MIME types
aws s3 cp s3://ai-trip-planner-frontend-your-unique-id s3://ai-trip-planner-frontend-your-unique-id --recursive --metadata-directive REPLACE --content-type "text/html" --exclude "*" --include "*.html"
```

### Step 5: Create CloudFront Distribution
```bash
# Create CloudFront distribution
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

CloudFront configuration:
```json
{
  "CallerReference": "ai-trip-planner-2025",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-ai-trip-planner-frontend",
        "DomainName": "ai-trip-planner-frontend-your-unique-id.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-ai-trip-planner-frontend",
    "ViewerProtocolPolicy": "redirect-to-https",
    "MinTTL": 0,
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    }
  },
  "Comment": "AI Trip Planner Frontend",
  "Enabled": true
}
```

---

## 💾 Database Setup

### Step 1: Create RDS PostgreSQL Instance
```bash
# Create DB subnet group
aws rds create-db-subnet-group \
  --db-subnet-group-name ai-trip-planner-subnet-group \
  --db-subnet-group-description "Subnet group for AI Trip Planner" \
  --subnet-ids subnet-12345 subnet-67890

# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier ai-trip-planner-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 14.9 \
  --master-username admin \
  --master-user-password YourSecurePassword123! \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-12345 \
  --db-subnet-group-name ai-trip-planner-subnet-group \
  --backup-retention-period 7 \
  --no-multi-az \
  --no-publicly-accessible
```

### Step 2: Create Database Schema
```sql
-- Connect to your RDS instance and create schema
CREATE DATABASE ai_trip_planner;

-- Create tables for query history
CREATE TABLE query_history (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255),
    query TEXT NOT NULL,
    response TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processing_time DECIMAL(5,2)
);

-- Create indexes for better performance
CREATE INDEX idx_query_history_user_id ON query_history(user_id);
CREATE INDEX idx_query_history_timestamp ON query_history(timestamp);
```

---

## 🌐 Domain & SSL Configuration

### Step 1: Configure Route 53 (Optional)
```bash
# Create hosted zone for your domain
aws route53 create-hosted-zone --name yourdomain.com --caller-reference $(date +%s)

# Create A record pointing to CloudFront
aws route53 change-resource-record-sets --hosted-zone-id Z123456789 --change-batch file://route53-change.json
```

### Step 2: Request SSL Certificate
```bash
# Request certificate
aws acm request-certificate \
  --domain-name yourdomain.com \
  --subject-alternative-names *.yourdomain.com \
  --validation-method DNS \
  --region us-east-1
```

### Step 3: Update CloudFront with Custom Domain
```bash
# Update CloudFront distribution with custom domain and SSL
aws cloudfront update-distribution --id E1234567890 --distribution-config file://cloudfront-update.json
```

---

## 📊 Monitoring & Logging

### Step 1: Set Up CloudWatch Alarms
```bash
# Create CPU alarm for ECS
aws cloudwatch put-metric-alarm \
  --alarm-name "ai-trip-planner-high-cpu" \
  --alarm-description "High CPU usage" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

### Step 2: Configure Log Retention
```bash
# Set log retention to 30 days
aws logs put-retention-policy --log-group-name /ecs/ai-trip-planner --retention-in-days 30
```

### Step 3: Create CloudWatch Dashboard
```bash
# Create dashboard for monitoring
aws cloudwatch put-dashboard --dashboard-name ai-trip-planner --dashboard-body file://dashboard.json
```

---

## 💰 Cost Optimization

### Monthly Cost Estimates (US East)
- **ECS Fargate**: $30-50/month (1 vCPU, 2GB RAM)
- **RDS t3.micro**: $15-20/month
- **S3 Storage**: $1-5/month
- **CloudFront**: $1-10/month (depending on traffic)
- **Route 53**: $0.50/month per hosted zone
- **Total Estimated**: $47-85/month

### Cost Optimization Tips
1. **Use Spot Instances**: For development environments
2. **Reserved Instances**: For production workloads
3. **Auto Scaling**: Scale down during low traffic
4. **S3 Lifecycle Policies**: Move old logs to cheaper storage
5. **CloudWatch Logs**: Set appropriate retention periods

---

## 🔧 Deployment Automation

### Step 1: Create Deployment Script
```bash
# Create deploy.sh
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Build and push backend
echo "📦 Building backend..."
docker build -t ai-trip-planner-backend .
docker tag ai-trip-planner-backend:latest $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ai-trip-planner-backend:latest
docker push $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ai-trip-planner-backend:latest

# Update ECS service
echo "🔄 Updating ECS service..."
aws ecs update-service --cluster ai-trip-planner-cluster --service ai-trip-planner-service --force-new-deployment

# Build and deploy frontend
echo "🎨 Building frontend..."
cd frontend
npm run build
aws s3 sync dist/ s3://ai-trip-planner-frontend-your-unique-id --delete

# Invalidate CloudFront cache
echo "🌐 Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id E1234567890 --paths "/*"

echo "✅ Deployment complete!"
```

### Step 2: Make Script Executable
```bash
# Make executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

---

## 🔧 Environment Variables

### Backend Environment Variables
```bash
# Required API keys
GROQ_API_KEY=your-groq-api-key-here
OPENAI_API_KEY=your-openai-api-key-here

# Database configuration
DATABASE_URL=postgresql://admin:password@your-rds-endpoint:5432/ai_trip_planner

# AWS configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Application settings
LOG_LEVEL=INFO
CORS_ORIGINS=https://yourdomain.com
```

### Frontend Environment Variables
```bash
# Create .env.production
VITE_API_URL=https://your-api-domain.com
VITE_ENVIRONMENT=production
```

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### Backend Container Won't Start
```bash
# Check ECS service logs
aws logs describe-log-streams --log-group-name /ecs/ai-trip-planner

# Get recent logs
aws logs get-log-events --log-group-name /ecs/ai-trip-planner --log-stream-name ecs/ai-trip-planner-backend/task-id
```

#### Frontend Not Loading
```bash
# Check S3 bucket policy
aws s3api get-bucket-policy --bucket ai-trip-planner-frontend-your-unique-id

# Check CloudFront distribution
aws cloudfront get-distribution --id E1234567890
```

#### Database Connection Issues
```bash
# Check RDS instance status
aws rds describe-db-instances --db-instance-identifier ai-trip-planner-db

# Check security group rules
aws ec2 describe-security-groups --group-ids sg-12345
```

#### SSL Certificate Issues
```bash
# Check certificate status
aws acm describe-certificate --certificate-arn arn:aws:acm:us-east-1:account:certificate/cert-id

# List certificates
aws acm list-certificates --region us-east-1
```

### Performance Monitoring
```bash
# Check ECS service metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --start-time 2025-01-01T00:00:00Z \
  --end-time 2025-01-01T23:59:59Z \
  --period 3600 \
  --statistics Average

# Check RDS performance
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name DatabaseConnections \
  --start-time 2025-01-01T00:00:00Z \
  --end-time 2025-01-01T23:59:59Z \
  --period 3600 \
  --statistics Average
```

---

## 🔐 Security Best Practices

### 1. IAM Security
- Use least privilege principle
- Rotate access keys regularly
- Enable MFA for root account
- Use IAM roles instead of access keys when possible

### 2. Network Security
- Use VPC with private subnets
- Configure security groups properly
- Enable VPC Flow Logs
- Use WAF for web application protection

### 3. Data Security
- Enable encryption at rest for RDS
- Use HTTPS/TLS for all communications
- Implement proper backup strategies
- Use AWS Secrets Manager for sensitive data

### 4. Application Security
- Input validation and sanitization
- Rate limiting on API endpoints
- Implement proper error handling
- Regular security updates

---

## 📈 Scaling Considerations

### Horizontal Scaling
```bash
# Scale ECS service
aws ecs update-service \
  --cluster ai-trip-planner-cluster \
  --service ai-trip-planner-service \
  --desired-count 3
```

### Auto Scaling Setup
```bash
# Create auto scaling target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/ai-trip-planner-cluster/ai-trip-planner-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 1 \
  --max-capacity 10

# Create scaling policy
aws application-autoscaling put-scaling-policy \
  --policy-name ai-trip-planner-scaling-policy \
  --service-namespace ecs \
  --resource-id service/ai-trip-planner-cluster/ai-trip-planner-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration file://scaling-policy.json
```

---

## 🚀 CI/CD Pipeline (Optional)

### GitHub Actions Workflow
```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Deploy to ECS
        run: |
          # Build and push Docker image
          docker build -t ai-trip-planner-backend .
          docker tag ai-trip-planner-backend:latest ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.us-east-1.amazonaws.com/ai-trip-planner-backend:latest
          docker push ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.us-east-1.amazonaws.com/ai-trip-planner-backend:latest
          
          # Update ECS service
          aws ecs update-service --cluster ai-trip-planner-cluster --service ai-trip-planner-service --force-new-deployment

      - name: Deploy Frontend
        run: |
          cd frontend
          npm install
          npm run build
          aws s3 sync dist/ s3://ai-trip-planner-frontend-${{ secrets.BUCKET_SUFFIX }} --delete
          aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"
```

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] AWS CLI configured
- [ ] Domain name registered (optional)
- [ ] API keys obtained (Groq, OpenAI)
- [ ] Docker installed and working
- [ ] Frontend build tested locally
- [ ] Backend tested locally

### AWS Setup
- [ ] IAM user created with permissions
- [ ] ECR repository created
- [ ] S3 bucket created and configured
- [ ] RDS instance created
- [ ] ECS cluster created
- [ ] CloudFront distribution created

### Deployment
- [ ] Docker image built and pushed
- [ ] ECS service deployed
- [ ] Frontend uploaded to S3
- [ ] Database schema created
- [ ] SSL certificate requested and configured
- [ ] DNS records configured

### Post-Deployment
- [ ] Health checks passing
- [ ] Monitoring set up
- [ ] Backup strategy implemented
- [ ] Log retention configured
- [ ] Cost monitoring enabled

---

## 🆘 Support & Resources

### AWS Documentation
- [ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [RDS Documentation](https://docs.aws.amazon.com/rds/)

### Useful Commands
```bash
# View ECS service status
aws ecs describe-services --cluster ai-trip-planner-cluster --services ai-trip-planner-service

# View RDS instance status
aws rds describe-db-instances --db-instance-identifier ai-trip-planner-db

# View CloudFront distribution
aws cloudfront list-distributions

# View S3 bucket contents
aws s3 ls s3://ai-trip-planner-frontend-your-unique-id --recursive
```

---

## 🎉 Conclusion

This guide provides a complete deployment strategy for your AI Trip Planner to AWS. The architecture is:

✅ **Scalable**: Can handle increased traffic with auto-scaling  
✅ **Secure**: Implements AWS security best practices  
✅ **Cost-Effective**: Optimized for small to medium workloads  
✅ **Maintainable**: Clear separation of concerns and monitoring  
✅ **Production-Ready**: Includes SSL, monitoring, and backup strategies  

**Total deployment time**: ~2-3 hours for first deployment  
**Estimated monthly cost**: $47-85 (depending on usage)  
**Maintenance effort**: Low (with proper monitoring)  

Your AI Trip Planner is now ready for production deployment on AWS! 🚀

---

**Questions or issues?** Check the troubleshooting section or refer to AWS documentation for specific service details.
