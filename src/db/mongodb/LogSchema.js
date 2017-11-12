import mongoose from 'mongoose';

let Schema = mongoose.Schema;

let LogSchema = new Schema({
	message: String,
	category: String,
	created_at: { type: Date, default: Date.now },
	market_id: { type: Schema.Types.ObjectId, default: null },       
});

let Log = mongoose.model('Log', LogSchema);

export default Log;