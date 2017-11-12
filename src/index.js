import ScraperFactory from './factory/ScraperFactory';
import MongoDB from './db/mongodb/MongoDB';
import Logger from './logger/logger'; 
import mongoose from 'mongoose';
require('dotenv').config()

mongoose.connect('mongodb://127.0.0.1/'+ process.env.MONGOOSE_DB, {useMongoClient: true});
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

let open = require('amqplib').connect('amqp://'+process.env.RABBIT_USERNAME+':'+process.env.RABBIT_PASSWORD+'@localhost/'+process.env.RABBIT_EXCHANGE);

let q = process.env.RABBIT_QUEUE; 

open.then(function(conn) {
  return conn.createChannel();
}).then(function(ch) {
  return ch.assertQueue(q).then(function(ok) {
    return ch.consume(q, function(msg) {
      if (msg !== null) {
        let data = JSON.parse(msg.content);	

        console.log(data);

    		data.markets.forEach(item => {
    			new ScraperFactory().init(item).then(response => {
    				new MongoDB().insertMany(item, response);
    			}).catch(error => {
    				new Logger().error(error.message, item);
    			})
    		});
        ch.ack(msg);
      } else {
      	new Logger().error('No message from exchange...', null);
      }
    });
  });
}).catch((error => {
	new Logger().error(error.message, null);
}));
