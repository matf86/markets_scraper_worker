import cheerio from 'cheerio';
import Scraper from '../scraper';

export default class LRHScraper extends Scraper
{
	constructor()
	{
		super();
		//Lookup object to set proper origin property for scraped offer
		this.orgins = {
			"owoce importowane": "import",
			"owoce krajowe": "kraj",
			"warzywa importowane": "import",
			"warzywa krajowe": "kraj"
		};

	    //Lookup object to set proper type property for scraped offer.
		this.types = {
			"owoce importowane": "owoce",
			"owoce krajowe": "owoce",
			"warzywa importowane": "warzywa",
			"warzywa krajowe": "warzywa",
		};
		//Url addresses which contain data to scrape.	    
		this.urls = {
	        notowania: "http://www.zjazdowa.com.pl/pl/serwis-cenowy"
	    }
	}

	//Load html to Cheerio module, extract date and offers data.
	//
	//@prop data - html response from called urls.  
	//
	//return Array - array of offers objects.
	parseHtml(data)
	{
		let $ = cheerio.load(data);

		if(this.date === '') {
			let date = $('div.col-sm-12').find('p.text-right')
										.text().match(/(\d{2}-\d{2}-\d{4})/)[0]
										.split('-');

			date = date[2]+'-'+date[1]+'-'+date[0];

			super.setDate(date);
		}

		return this.extractOfferData($, $('div.col-sm-6'));
	}

	//Extract offers data from html code and normalize it.
	//
	//@prop $ - cheerio instance.
	//
	//return Array of offers objects.
	extractOfferData($,elem) {
		let offers = [];

		elem.each((i, elem) => {
				if(i <= 3) {
					let group = $(elem).children().first().text().toLowerCase();

					$(elem).find('table tbody tr').each((i, elem) => {
						let item = $(elem).children();
						let price_min = item.eq(2).text().replace(/,/g, '.');
						let price_max = item.last().text().replace(/,/g, '.');

						let data = {
							name: item.first().text().toLowerCase(),
							group: group,
							package: item.eq(1).text().toLowerCase(),
							price_min: price_min,
							price_max: price_max	
						}

						offers.push(this.prepOffer(data));
					});
				}
			});

		return offers;
	}

	//Set structure of returned by scraper offer object.
	//
	//@param data - Object of data extracted from html .
	//
	//return Object - single offer object.
	prepOffer(data) 
	{
		return {
			product: data.name.trim(),
			type: this.types[data.group].trim(),
			origin: this.orgins[data.group].trim(),
			package: data.package.trim(),
			price_min: data.price_min,
			price_max: data.price_max,
			date: this.date
		}
	}
}

