# microservices-MERN-kubernetes-GCP
[Local test setup] A ticketing app which is built using microservices having docker containers running on google cloud platform. Typescript is used on server side. And a next js based react app for server side rendering.

Other tech:
1. For load balancer and routing requests: ingress-nginx
2. For constantly watching over synced and non-synced files: Skaffold
3. For expiration services and managing jobs: Bull JS and Redis
4. Kubernetes on GCP for managing docker containers
5. Test Workflows for PR requests (yaml configs)
6. Image rebuilds and push to dockerhub upon merge to master (yaml configs)
