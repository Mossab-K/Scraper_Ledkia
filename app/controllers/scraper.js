import fs 	from "fs"
import path 	from "path"
import shortid  from "shortid"
import request  from "request"
import cheerio  from "cheerio"

const imagesDir = path.join(`${__dirname}/../products/`)
const scraper 	= {}

scraper.getProduct = (url) => {

	return new Promise((resolve, reject) => {

		request(url, (err, res, html) => {

			if (err)
				reject(err)
			else {

				const $ 	  	= cheerio.load(html)
				const product 		= {
					id 		: shortid.generate(),
					title 		: "",
					summary 	: "",
					description     : "",
					declinations    : [],
					images 		: [],
					pdf 		: [],
				}
				
				product.title 	= $("#pb-left-column").find("h1").text().trim()
				product.summary = $("#idTab1").find("p").first().text().trim()
				
				// Suppréssion du résumé pour ne pas l'avoir en doublon dans la description s'il y a plusieurs paragraphes
				if ($("#idTab1").find("p").length > 1)
					$("#idTab1").find("p").first().remove()

				// Dernier Paragraphe avec potentiellement le mot "Ledkia" à supprimer
				const lastP = $("#idTab1").find("p").last().text().trim()
				
				// Si le mot "Ledkia" est trouvé on supprime la div
				if (lastP.toLowerCase().includes("ledkia"))
					$("#idTab1").find("p").last().remove()
				
				// Récuperation de toute la description
				product.description = $("#idTab1").find("p").text().trim()
				
				// Récuperation de la liste de déclinaison du produit
				const declinations = $("#atributos-lista").find("ul").find("li")
				
				// Push des différentes déclinaisons dans product.declinaisons[]
				declinations.filter((index) => Number.isInteger(index))
					.map((index) => {
						product.declinations.push($(declinations[index]).eq(0).first().find("span").first().text().trim())
					})
				
				// Récuperation de la liste d'images
				const images = $("#thumbs_list").find("ul").find("li")
				
				// Push des différentes images dans product.images[]
				images.filter((index) => Number.isInteger(index))
				  	.map((index) => {
						product.images.push($(images[index]).eq(0).find("a").attr("href"))
				  	})

				// Récuperation des liens de téléchargement des pdf
				const pdfLinks = $("a[href*='attachment']")
				
				// Push des liens pdf dans product.pdf[]
				pdfLinks.filter((index) => Number.isInteger(index))
				  	.map((index) => {
				  		// Si le pdf est un document en Français on le push
			  			if ($(pdfLinks).eq(index).text().toLowerCase().includes("-fr"))
					  		product.pdf.push($(pdfLinks).eq(index).attr("href"))
				  	})

				// Création des dossiers oú seront stockés les images et les pdf
				fs.mkdirSync(path.join(`${imagesDir}/${product.id}`))
				fs.mkdirSync(path.join(`${imagesDir}/${product.id}/images`))
				fs.mkdirSync(path.join(`${imagesDir}/${product.id}/pdf`))
				
				// Téléchargement des images dans le dossier du produit
				product.images.map((imageLink, index) => {
					request(imageLink).pipe(fs.createWriteStream(path.join(`${imagesDir}/${product.id}/images/image-${index}.jpg`)))
				})

				// Téléchargement des pdf dans le dossier du produit
				product.pdf.map((pdfLink, index) => {
					request(pdfLink).pipe(fs.createWriteStream(path.join(`${imagesDir}/${product.id}/pdf/pdf-${index}.pdf`)))
				})
				
				resolve(product)
			}

		})

	}) 
}

export default scraper
