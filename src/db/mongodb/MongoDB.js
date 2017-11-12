import Offer from './OfferSchema';
import Logger from '../../logger/logger';
import Markets from '../../markets'; 

export default class MongoDB 
{
	constructor()
	{
		this.marketsIds = Markets;
	}

	insertMany(market, offers)
	{
		if(offers.length > 0) {
			
			let marketId = this.marketsIds[market];
			let date = offers[0]['date'];

			return this.checkIfOfferExists(marketId, date).then(result => {
				if(result === 0) {
					
					let data = offers.map(item => {
						item.market_id = marketId;
						return item;
					});

					return Offer.insertMany(data).then(response => {
						new Logger().success('Dane pomyślnie zapisane', market);
					}).catch(error => {
					    new Logger().error(error.message, market);
					});
				}
				
				new Logger().info('Próba ponownego zapisania ofert z dnia już ujętego w bazie danych', market);
			});
		}
	}

	checkIfOfferExists(market, date)
	{
		return Offer.where('date',date).where('market_id', market).count().exec();
	}
}