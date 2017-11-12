import cheerio from 'cheerio';
import Scraper from '../scraper';

export default class AHScraper extends Scraper
{
	constructor()
	{
		super();

		//Array of product types that we want to extract from scraped data.
		//List of product types that you can extract from "Agrohurt S.A.":
		//-warzywa importowanie
		//-owoce importowanie
		//-kwiaty cięte - detal
		//-kwiaty doniczkowe
		//-nabiał
		//-mięso i wędliny
		//-inne  
		this.accepted = ["owoce importowanie", "owoce krajowe", "warzywa importowanie", "warzywa krajowe"];
		
		//Lookup object to set proper origin property for scraped offer
		this.orgins = {
			"owoce importowanie": "import",
			"owoce krajowe": "kraj",
			"warzywa importowanie": "import",
			"warzywa krajowe": "kraj",
		};

	    //Lookup object to set proper type property for scraped offer.
		this.types = {
			"owoce importowanie": "owoce",
			"owoce krajowe": "owoce",
			"warzywa importowanie": "warzywa",
			"warzywa krajowe": "warzywa",
		};
		//Url addresses which contain data to scrape.	    
		this.urls = {
	        notowania: "http://www.agrohurtsa.pl/notowania"
	    };
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
			let date = $('header').find('p').text().match(/(\d{2}.\d{2}.\d{4})/)[0].split('.');

			date = date[2]+'-'+date[1]+'-'+date[0];

			super.setDate(date);
		}

		return this.extractOfferData($, $('table'));
	}

	//Extract offers data from html code and normalize it.
	//
	//@prop $ - cheerio instance.
	//
	//return Array of offers objects.
	extractOfferData($,elem) {

		let offers = [];

		$(elem).find('tbody tr').each((i, elem) => {
			let item = $(elem).children();
			let price_min = item.eq(3).text().replace(/,/g, '.');
			let price_max = item.eq(4).text().replace(/,/g, '.');
			let price_avg = item.eq(5).text().replace(/,/g, '.');

			let data = {
				name: item.eq(1).text().toLowerCase(),
				group: item.eq(2).text().toLowerCase(),	
				package: price_min.match(/\((.*)\)/)[1],
				price_min: price_min.match(/\d+[\.]\d+/)[0],
				price_max: price_max.match(/\d+[\.]\d+/)[0],
				price_avg: price_avg.match(/\d+[\.]\d+/)[0],
			}	

			if(this.arrayContains(data.group, this.accepted)) {
				offers.push(this.prepOffer(data));
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

