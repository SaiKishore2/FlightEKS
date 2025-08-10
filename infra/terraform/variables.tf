variable "aws_region" { type = string, default = "us-east-1" }
variable "project" { type = string, default = "flight-poc" }
variable "vpc_id" { type = string }
variable "private_subnet_ids" { type = list(string) }
variable "public_subnet_ids" { type = list(string) }
variable "msk_security_group_id" { type = string }
variable "s3_bucket_name" { type = string, default = "flight-poc-pilot-uploads-REPLACE_ME" }
variable "eks_node_role_arn" { type = string, default = "" }
variable "github_oidc_role_arn" { type = string, default = "" }
