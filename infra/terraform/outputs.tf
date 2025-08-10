output "eks_cluster_name" { value = module.eks.cluster_id }
output "msk_cluster_arn" { value = aws_msk_serverless_cluster.msk.arn }
output "s3_pilot_uploads" { value = aws_s3_bucket.pilot_uploads.bucket }
output "sns_alerts_arn" { value = aws_sns_topic.alerts.arn }
