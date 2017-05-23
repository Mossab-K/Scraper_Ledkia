import fs 			from "fs"
import path 		from "path"

const urlsJson 		= path.join(`${__dirname}/../models/urls.json`)
const productsJson 	= path.join(`${__dirname}/../models/products.json`)

const jsonManager = {}

jsonManager.getUrls = () => {
	
	return new Promise((resolve, reject) => {

		fs.readFile(urlsJson, 'utf-8', (err, data) => {
		  	if (err)
		  		reject(err)
			else {
				data = JSON.parse(data)
				if (data.urls)
					resolve(data.urls)
				else
					resolve([])
			}
		});

	})
}

jsonManager.addProducts = (products) => {

	fs.readFile(productsJson, 'utf-8', (err, data) => {
	  	if (err)
	  		console.log(err)
		else {
			
			data = JSON.parse(data)
			
			if (data.products) {
				
				data.products =  data.products.concat(products)

				fs.writeFile(productsJson, JSON.stringify(data), 'utf-8', function(err) {
					if (err)
						console.log("Erreur à l'ajout dans le Json !")
					else
						console.log('Produits ajoutés !')
				})
			}
		}
	});

}

export default jsonManager