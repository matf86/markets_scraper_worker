import WgroScraper from '../scrapers/wgro-poznan/WgroScraper'; 
import LRHScraper from '../scrapers/zajazdowa-lodz/ZajazdowaScraper';
import AgrohurtScraper from '../scrapers/agrohurt-rzeszow/AgrohurtScraper';
import ElizowkaScraper from '../scrapers/elizowka-lublin/ElizowkaScraper';
import Logger from '../logger/logger'; 

export default class ScraperFactory 
{
	constructor()
	{
		this.marketsList = {
			'wgro': WgroScraper,
			'lrh': LRHScraper,
			'elizowka': ElizowkaScraper,
			'agrohurt': AgrohurtScraper
		};
	}

	init(market)
	{
		return new this.marketsList[market]().scrape().then(response => {
			new Logger().info('Rozpoczęto proces pobierania danych', market);
			return response
		}).catch(error => {
			new Logger().error(error, market);
		});
	}
}