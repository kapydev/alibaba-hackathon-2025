@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

echo 📦 Building Docker images...

docker build -t hackathon-webapp:latest -f packages/webapp/Dockerfile .
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to build webapp
    EXIT /B %ERRORLEVEL%
)

docker build -t hackathon-backend:latest -f packages/backend/Dockerfile .
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to build backend
    EXIT /B %ERRORLEVEL%
)

echo ☸️ Deploying Kubernetes resources from .\k8s\...

kubectl apply -f k8s\
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to apply Kubernetes configs
    EXIT /B %ERRORLEVEL%
)

echo ✅ Deployment complete!