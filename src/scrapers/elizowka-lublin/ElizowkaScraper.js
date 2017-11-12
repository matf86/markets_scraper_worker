import cheerio from 'cheerio';
import Scraper from '../scraper';

export default class ElizowkaScraper extends Scraper
{
	constructor()
	{
		super();

		//Array of product types that we want to extract from scraped data.
		//List of product types that you can extract from "Agrohurt S.A.":
		//-warzywa 
		//-owoce 
		//-grzyby
		//-art. spozywcze
		this.accepted = ["owoce", "warzywa", "grzyby"];

		//Lookup object to set proper origin property for scraped offer
		this.orgins = {};

	    //Lookup object to set proper type property for scraped offer.
		this.types = {};
		//Url addresses which contain data to scrape.	    
		this.urls = {
	        notowania: "http://www.elizowka.pl/notowania-cen-produktow"
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

			let date = $('#notowania').find('small').text().match(/(\d{4}-\d{2}-\d{2})/)[0];

			super.setDate(date);
		}

		return this.extractOfferData($, $('#notowania'));
	}

	//Extract offers data from html code and normalize it.
	//
	//@prop $ - cheerio instance.
	//
	//return Array of offers objects.
	extractOfferData($,elem) {
		let offers = [];

		$(elem).children('.table').each((i, elem) => {
			let type = $(elem).prev().text();

			$(elem).find('.table tr').each((i, elem) => {
				let item = $(elem).children();

				if(item.first().text() == 'Lp.') return;

					let data = {
						name: item.eq(1).text().toLowerCase(),
						type: type,
						package: item.eq(2).text().toLowerCase(),
						price_min: item.eq(3).text().match(/(\d+\.\d+)/)[0],
						price_max: item.eq(4).text().match(/(\d+\.\d+)/)[0],
						price_avg: item.eq(5).text().match(/(\d+\.\d+)/)[0],
						price_avg_prev: item.eq(6).text().match(/(\d+\.\d+)/)[0],	
						price_avg_diff: item.last().text().match(/(\d+\.\d+)/)[0],	
					}
					
				if(this.arrayContains(data.type, this.accepted)) {
					offers.push(this.prepOffer(data));
				}
			});
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
			type: data.type.trim(),
			origin: 'b.d',
			package: data.package.trim(),
			price_min: data.price_min,
			price_max: data.price_max,
			date: this.date
		}
	}
}
