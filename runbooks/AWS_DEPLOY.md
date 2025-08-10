# AWS Deploy (high-level)
1. Fill infra/terraform/variables.tf or create terraform.tfvars with your vpc_id and subnet arrays and s3 bucket name.
2. From infra/terraform: terraform init && terraform apply
3. Build & push images to ECR or let GitHub Actions do it. Set secrets: AWS_ROLE_TO_ASSUME, ECR_REGISTRY, ECR_REPO_PREFIX
4. Helm deploy the chart with correct values (MSK bootstrap, SNS ARN, S3 bucket)
5. Configure IRSA roles for service accounts for pod access to AWS resources
