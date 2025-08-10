const express = require('express'); const bodyParser = require('body-parser'); const app = express();
app.use(bodyParser.json());
app.post('/webhook', (req,res)=>{ console.log('Webhook received', req.body); res.status(200).send({ok:true}); });
const port = process.env.PORT || 4000; app.listen(port, ()=>console.log('Webhook listening on', port));
