Flight PoC - Full deliverables (EKS + MSK Serverless + GenAI pipelines)
Region: us-east-1
VPC: Use existing VPC (supply vpc_id + private_subnet_ids + public_subnet_ids)
This archive contains:
- infra/terraform: Terraform files for EKS, MSK Serverless, S3, DynamoDB, SNS, IAM, IRSA (skeleton)
- lambdas/: transcribe_starter and bedrock_summarizer (Node.js)
- services/: producer, consumer, webhook (Node.js) with Dockerfiles
- k8s/helm-charts/: Helm chart for services (IRSA annotations placeholders)
- docker-compose/: local Kafka + Schema Registry for testing locally
- .github/workflows/: GitHub Actions for CI/CD
- runbooks/: local & AWS deploy instructions

Important: Fill terraform variables and IAM ARNs before deploying to AWS. See infra/terraform/variables.tf
