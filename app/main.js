import path 		from 'path'
import scraper 		from './controllers/scraper'
import jsonManager 	from './controllers/jsonManager'

jsonManager.getUrls().then((urls) => {
		
	const promisesTab = []

	urls.map((url, index) => {
		console.log(`Produit ${index} en cours de chargement...`)
		promisesTab.push(scraper.getProduct(url.trim()))
	})

	Promise.all(promisesTab).then((products) => {
		jsonManager.addProducts(products)
	})

})
.catch((err) => {
	console.log(err)
})