import cheerio from 'cheerio';
import Scraper from '../scraper';

export default class WgroScraper extends Scraper
{
	constructor()
	{
		super();
		//Lookup object to set proper origin property for scraped offer
	    this.origins = {
	        "Owoce z importu": "import",
	        "Warzywa z importu": "import",
	        "Bakalie z importu": "import",
	        "Grzyby": "kraj",
	        "Owoce krajowe": "kraj",
	        "Warzywa krajowe": "kraj",
	        "Bakalie krajowe": "kraj" 
	    },

	    //Lookup object to set proper type property for scraped offer.
	    this.types = {
	        "Grzyby": "grzyby",  
	        "Bakalie krajowe": "bakalie",
	        "Bakalie z importu": "bakalie",
	        "Warzywa krajowe": "warzywa",
	        "Warzywa z importu": "warzywa",
	        "Owoce krajowe": "owoce",
	        "Owoce z importu": "owoce"
	    }
		//Url addresses which contain data to scrape.	    
		this.urls = {
	        owoce: "http://www.wgro.com.pl/szablon.php?strona=cennik&id=1",
	        warzywa: "http://www.wgro.com.pl/szablon.php?strona=cennik&id=2"
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
			super.setDate($('.aktual b').text());
		}

		return this.extractOfferData($, $('.tabela_cennik_pole'));
	}

	//Extract offers data from html code and normalize it.
	//
	//@prop $ - cheerio instance.
	//
	//return Array of offers objects.
	extractOfferData($,elem) {
		let offers = [];

		elem.each((i, elem) => {
				if($(elem).children().first().text()) {
					let item = $(elem).children();

					let data = {
						name: item.first().text().toLowerCase(),
						group: item.eq(1).text(),
						package: item.eq(2).text().toLowerCase(),
						price_min: item.eq(3).text(),
						price_max: item.last().text()	
					}

					offers.push(this.prepOffer(data));
				}
			});

		return offers;
	}
	//Specify structure of returned by scraper offer object.
	//
	//@param data - Object of data extracted from html .
	//
	//return Object - single offer object.
	prepOffer(data) 
	{
		return {
			product: data.name.trim(),
			type: this.types[data.group].trim(),
			origin: this.origins[data.group].trim(),
			package: data.package.trim(),
			price_min: data.price_min,
			price_max: data.price_max,
			date: this.date
		}
	}
}

