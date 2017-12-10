import Nightmare from 'nightmare';
import cheerio from 'cheerio';
import Scraper from '../scraper';
require('dotenv').config()

export default class BroniszeScraper extends Scraper
{
	constructor()
	{
		super();
        this.login = process.env.BRONISZE_LOGIN;
        this.pass = process.env.BRONISZE_PASS;
        this.types = ['warzywa', 'owoce'];
		this.urls = {
	        login: 'http://www.bronisze.com.pl/pl/sign_in/'
	    }
	}

	//Load html to Cheerio module, extract date and offers data.
	//
	//@prop data - html response from called urls.  
	//
	//return Array - array of offers objects.
	scrape()
	{
        let nightmare = Nightmare({show: true, waitTimeout: 600000});
        
        return nightmare.goto(this.urls.login)
                .type('#frontend_user_email', this.login)
                .type('#frontend_user_password', this.pass)
                .click('button.small.radius.button')
                .wait(5000)
                .evaluate(() => {
                return document.body.innerHTML;    
                }).end().then(response => {
                    return this.extractOfferData(response)
                }).catch(error => {
                    return error;
                });
	}

	//Extract offers data from html code and normalize it.
	//
	//@prop $ - cheerio instance.
	//
	//return Array of offers objects.
	extractOfferData(response) {
        let $ = cheerio.load(response);
        this.setDate($('#prices_date').val());
        let offers = [];

        for (let i in this.types) {
            $('#prices_table_'+this.types[i] +' .wrap-product-price table tbody tr').each((i, elm) => {
                
                if($(elm).children().is('td')) {
     
                 let data = {
                     product: $(elm).children().first().text(),
                     type: $(elm).children().eq(6).text(),
                     origin: $(elm).children().eq(6).text(),
                     package: $(elm).children().eq(5).text(),
                     price_min: $(elm).children().eq(1).text(),
                     price_max: $(elm).children().eq(2).text(),
                };
                 
                offers.push(this.prepOffer(data));
             }
             });
        }

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
            product: data.product.replace(/\(i\)/,"").trim(),
            type: data.type.match(/(\w+)/gu)[0].trim(),
            origin: data.origin.match(/(\w+)/gu)[1].trim(),
            package: data.package.trim(),
            price_min: data.price_min.match(/(\d+\.\d+)/)[0].trim(),
            price_max: data.price_max.match(/(\d+\.\d+)/)[0].trim(),
            date: this.date
		}
	}
}