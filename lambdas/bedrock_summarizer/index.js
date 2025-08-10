const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const fetch = require('node-fetch');
const sns = new SNSClient({ region: process.env.AWS_REGION || 'us-east-1' });
const bedrock = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });
async function streamToString(stream) { const chunks = []; for await (const c of stream) chunks.push(typeof c === 'string' ? Buffer.from(c) : c); return Buffer.concat(chunks).toString('utf-8'); }
exports.handler = async (event) => {
  console.log('Bedrock handler event', JSON.stringify(event));
  const message = event.Records ? JSON.parse(event.Records[0].Sns.Message) : event;
  const transcriptUri = message.transcriptS3Uri || message.transcriptUri;
  let transcript = message.transcriptText || '';
  if (!transcript && transcriptUri) {
    const res = await fetch(transcriptUri); const body = await res.json();
    transcript = body.results && body.results.transcripts && body.results.transcripts[0].transcript;
  }
  const prompt = `Summarize the following pilot note into an actionable vendor alert (max 40 words). Remove personal data. Pilot note: "${transcript}"`;
  const modelId = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-v2';
  const cmd = new InvokeModelCommand({ modelId, contentType: 'application/json', body: JSON.stringify({ input: prompt, max_tokens_to_sample: 200 }) });
  try {
    const res = await bedrock.send(cmd);
    const bodyStr = await streamToString(res.body); let completion = bodyStr; try { completion = JSON.parse(bodyStr)?.completion || bodyStr; } catch(e) {}
    const alert = { message: completion, source: 'bedrock', context: message.context || {} };
    await sns.send(new PublishCommand({ TopicArn: process.env.ALERT_SNS_ARN, Message: JSON.stringify(alert) }));
    return { status: 'published', alert };
  } catch (err) {
    console.error('Bedrock invocation failed', err);
    const fallback = transcript ? transcript.slice(0,200) : 'No transcript available';
    await sns.send(new PublishCommand({ TopicArn: process.env.ALERT_SNS_ARN, Message: JSON.stringify({ message: fallback, source:'fallback' }) }));
    return { status: 'fallback', message: fallback };
  }
};
