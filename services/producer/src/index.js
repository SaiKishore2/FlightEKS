const { Kafka } = require('kafkajs');
const { v4: uuidv4 } = require('uuid');
const broker = process.env.KAFKA_BROKER || 'kafka:9092';
const topic = process.env.KAFKA_TOPIC || 'flight-events';
const kafka = new Kafka({ clientId: 'flight-producer', brokers: [broker] });
const producer = kafka.producer();
(async () => {
  await producer.connect();
  console.log('Producer connected to', broker);
  const airports = ['DEL','BOM','BLR','HYD'];
  setInterval(async () => {
    const event = { eventId: uuidv4(), airportId: airports[Math.floor(Math.random()*airports.length)], flightId: 'AI'+Math.floor(100+Math.random()*900), status: ['INBOUND','DELAYED','LANDED','DIVERTED'][Math.floor(Math.random()*4)], timestamp: Date.now(), eta: Date.now()+Math.floor(Math.random()*30*60*1000), metadata: null };
    await producer.send({ topic, messages: [{ key: event.flightId, value: JSON.stringify(event) }] });
    console.log('Produced', event.flightId, event.status, event.airportId);
  }, 1000);
})().catch(e=>{console.error(e);process.exit(1)});
