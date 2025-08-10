const { TranscribeClient, StartTranscriptionJobCommand } = require('@aws-sdk/client-transcribe');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const path = require('path');
const transcribe = new TranscribeClient({ region: process.env.AWS_REGION || 'us-east-1' });
const sns = new SNSClient({ region: process.env.AWS_REGION || 'us-east-1' });
exports.handler = async (event) => {
  console.log('Transcribe starter event:', JSON.stringify(event));
  for (const rec of event.Records || []) {
    const bucket = rec.s3.bucket.name; const key = rec.s3.object.key;
    if (!key.startsWith('uploads/audio/')) continue;
    const jobName = `transcribe-${path.basename(key)}-${Date.now()}`;
    const mediaUri = `s3://${bucket}/${key}`;
    try {
      await transcribe.send(new StartTranscriptionJobCommand({
        TranscriptionJobName: jobName,
        LanguageCode: 'en-US',
        Media: { MediaFileUri: mediaUri },
        OutputBucketName: process.env.TRANSCRIBE_OUTPUT_BUCKET || bucket
      }));
      await sns.send(new PublishCommand({ TopicArn: process.env.TRANSCRIBE_SNS_TOPIC, Message: JSON.stringify({ jobName, mediaUri, key }) }));
    } catch (err) { console.error('Transcribe error', err); }
  }
  return { status: 'ok' };
};
