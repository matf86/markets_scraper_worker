import LogSchema from '../db/mongodb/LogSchema';
import Markets from '../markets'; 

export default class Logger 
{
	constructor()
	{
		this.marketsIds = Markets;
	}

	info(message, market)
	{
		LogSchema.create({
			message: message,
			category: 'info',
			market_id: this.marketsIds[market]       
		});
	}

	error(message, market)
	{
		LogSchema.create({
			message: message,
			category: 'error',
			market_id: this.marketsIds[market]       
		});
	}

	success(message, market)
	{
		LogSchema.create({
			message: message,
			category: 'success',
			market_id: this.marketsIds[market]       
		});
	} 
}