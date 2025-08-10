terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
  required_version = ">= 1.1.0"
}

provider "aws" {
  region = var.aws_region
}

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "21.0.0"
  cluster_name = "${var.project}-eks"
  cluster_version = "1.28"
  vpc_id = "vpc-0d9e2086b0b55b012"
  subnets = "subnet-0e13eb76512baaaf2"
  node_groups = {
    on_demand = {
      desired_capacity = 2
      max_capacity = 4
      instance_types = ["m6i.large"]
    }
  }
  manage_aws_auth = true
}

resource "aws_msk_serverless_cluster" "msk" {
  cluster_name = "${var.project}-msk-sls"
  vpc_config {
    subnet_ids = "subnet-0e13eb76512baaaf2"
    security_group_ids = ["sg-00776c97b0d425bfb"]
  }
}

resource "aws_s3_bucket" "pilot_uploads" {
  bucket = var.s3_bucket_name
  acl = "private"
  versioning { enabled = true }
}

resource "aws_dynamodb_table" "flight_state" {
  name = "${var.project}-flight-state"
  billing_mode = "PAY_PER_REQUEST"
  hash_key = "pk"
  range_key = "sk"
  attribute { name = "pk"; type = "S" }
  attribute { name = "sk"; type = "S" }
}

resource "aws_sns_topic" "alerts" {
  name = "${var.project}-alerts"
}

# Minimal IAM role for Lambdas (expand in production)
data "aws_iam_policy_document" "lambda_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals { type = "Service", identifiers = ["lambda.amazonaws.com"] }
  }
}

resource "aws_iam_role" "lambda_exec" {
  name = "${var.project}-lambda-exec"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

resource "aws_iam_role_policy_attachment" "lambda_basic_exec" {
  role = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Note: additional policies and IRSA resources must be added before production use.
