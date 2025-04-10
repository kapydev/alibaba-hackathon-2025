# General Overview

The backend and frontends are stateless, and main source of truth is the database, which is already scalable by itself.

```mermaid
graph TD
    subgraph Internet
        user[User]
    end

    subgraph Ingress Controller (NGINX)
        ingress[Ingress<br>webapp.local:80/443]
    end

    subgraph Kubernetes Cluster
        ingress --> websvc[Service: web-service]
        websvc --> web1[Pod: web (replica 1)]
        websvc --> web2[Pod: web (replica 2)]
        websvc --> webN[... auto-scaled by HPA]

        web1 --> apisvc[Service: api-service]
        web2 --> apisvc

        apisvc --> api1[Pod: api (replica 1)]
        apisvc --> api2[Pod: api (replica 2)]
        apisvc --> apiN[... auto-scaled by HPA]
    end

    user --> ingress
```

# Alibaba Cloud Integration

<!-- TODO: Update with more specific examples -->
We use Qwen LLM for AI related services, PAI for AI training, and deploy across several alibaba ECS instances by utilising AKS (Alibaba Kubernetes Service)

# Scalability

In the case that our single backend and frontends get overloaded, we can easily add Horizontal auto scaling to our kubernetes setup to take advantage of making new pods on Alibaba cloud.

That way, when a high CPU load is detected, it will spin up more frontend services/backend services as required.

```
kubectl autoscale deployment web-deployment \
  --cpu-percent=50 \
  --min=1 \
  --max=5
```

When more pods are available, the incoming requests are sent round-robin to each pod, so that each pod has takes on an even load of the incoming traffic.

# Security
