import axios from 'axios';
import lodash from 'lodash';

export default class Scraper
{
	constructor()
	{
		this.date ='';
	}

	//Get urls to scrape.
	getUrls() 
	{
		let urls = [];

		if(this.urls && Object.keys(this.urls).length > 0) {
			for(let url in this.urls) {
				urls.push(this.urls[url]);
			}
			return urls;
		}

		throw new Error("No urls to scrape defined.");  
	}

	//Make ajax requests to given urls.
	makeRequests() {
		let urls = this.getUrls();
	
		return urls.map((elem, i) => {	
			 return axios.get(elem);
		}); 
	}

	//Initialize scraping process for all given urls,
	//scraped html is passed to unique for every subclass parser,
	//and offer data is extracted and returned.  
	scrape()
	{
		return axios.all(this.makeRequests())
		.then(axios.spread((...response) => {
			let offers = [];
			for (let result in response) {
				offers.push(this.parseHtml(response[result].data));
			}
			return lodash.flattenDeep(offers); 
		})).then(response => response).catch(error => {
			throw new Error(error.message); 
		});
	}

	//Set date for scraped offers.
	//
	//@param date - string representing date ex. '2017-09-28'.
	setDate(date) 
	{
		this.date = new Date(date); 	
	}

	//Helpre function to check if array contains given value.
	arrayContains(needle, arrhaystack)
	{
    	return (arrhaystack.indexOf(needle) > -1);
	}
} 