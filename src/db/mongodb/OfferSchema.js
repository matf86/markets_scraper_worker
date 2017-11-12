import mongoose from 'mongoose';

let Schema = mongoose.Schema;

let offerSchema = new Schema({
	product: String,
	type: String,
	origin: String,
	package: String,
	price_min: Number,
	price_max: Number,
	date: Date,
	market_id: Schema.Types.ObjectId,
        
});

let Offer = mongoose.model('Offer', offerSchema);

export default Offer;