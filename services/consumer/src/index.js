const { Kafka } = require('kafkajs');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const kafkaBrokers = process.env.KAFKA_BROKER || 'kafka:9092';
const kafka = new Kafka({ clientId: 'flight-consumer', brokers: [kafkaBrokers] });
const consumer = kafka.consumer({ groupId: 'flight-consumer-group' });
const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
const sns = new SNSClient({ region: process.env.AWS_REGION || 'us-east-1' });
const UPLOAD_BUCKET = process.env.UPLOAD_BUCKET || 'flight-poc-pilot-uploads';
(async function run(){
  await consumer.connect();
  await consumer.subscribe({ topic: 'flight-events', fromBeginning: false });
  await consumer.run({ eachMessage: async ({ message }) => {
    try {
      const event = JSON.parse(message.value.toString());
      console.log('Consumed', event.flightId, event.status, event.airportId);
      // quick SNS alert (best-effort)
      const alert = { eventId: event.eventId, flightId: event.flightId, airportId: event.airportId, status: event.status, eta: event.eta, timestamp: Date.now() };
      try { await sns.send(new PublishCommand({ TopicArn: process.env.ALERT_SNS_ARN, Message: JSON.stringify(alert) })); } catch(e){ console.error('SNS publish failed', e.message); }
      if (event.metadata && event.metadata.pilotVoiceBase64) {
        const audioBuf = Buffer.from(event.metadata.pilotVoiceBase64, 'base64');
        const key = `uploads/audio/${event.flightId}_${Date.now()}.wav`;
        await s3.send(new PutObjectCommand({ Bucket: UPLOAD_BUCKET, Key: key, Body: audioBuf, ContentType: 'audio/wav' }));
        console.log('Uploaded pilot audio to', key);
      }
    } catch (err) { console.error('processing error', err); }
  }});
})().catch(e=>{console.error(e);process.exit(1)});
