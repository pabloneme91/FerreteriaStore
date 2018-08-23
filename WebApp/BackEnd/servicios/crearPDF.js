var fs = require('fs');
PDFDocument = require('pdfkit');

module.exports = {

	crearPDF : function(factura) {

		var promesaAux;

		var doc = new PDFDocument;

        promesaAux = new Promise(function(resolve,reject){

        doc.pipe(fs.createWriteStream(getGenericPath() + factura.datosCarrito.idCarrito + '.pdf'));

		doc.fontSize(20)
		doc.text('Orden de Compra',200,50)

		doc.image('../../Cliente/vistas/Administrador/Logo.jpg', 470, 75, {fit: [100, 100]})
		   .stroke()

		doc.fontSize(8)
		doc.text('Factura N°: ' + factura.datosCarrito.idCarrito,50,95)

		doc.fontSize(8)
		doc.text('Fecha de Compra: ' + factura.datosCarrito.Fecha,50,115)

		doc.fontSize(8)
		doc.text('Cliente: ' + factura.Cliente.Nombre,50,135)

		doc.text('PRODUCTO', 50, 170);
		doc.text('CANTIDAD', 220, 170);
		doc.text('PRECIO UNITARIO', 370, 170);
		doc.text('SUBTOTAL', 490, 170);

		doc.moveTo(50, 190)     
		   .lineTo(570, 190) 
		   .stroke() 


		var posicionInicialLinea = 185;
		for(var x=0; x<factura.lineasCarrito.length; x++) {
			doc.text(factura.lineasCarrito[x].producto.Nombre, 50,posicionInicialLinea + 20);
			doc.text(factura.lineasCarrito[x].Cantidad, 220,posicionInicialLinea + 20);
			doc.text('$' + factura.lineasCarrito[x].producto.Precio,370,posicionInicialLinea + 20);
			doc.text('$' + factura.lineasCarrito[x].get('Total'), 500,posicionInicialLinea + 20);
			posicionInicialLinea +=20
		}

		doc.moveTo(50, posicionInicialLinea + 20)
		   .lineTo(570, posicionInicialLinea + 20)
		   .stroke() 

		doc.text('TOTAL =', 450,posicionInicialLinea + 40);
		doc.text('$' + factura.datosCarrito.get('Total'), 490,posicionInicialLinea + 40);
		doc.text('Se recuerda que dispone de 1 hora para retirar el encargo realizado a partir ' + 
			'del momento en que se hizo el pedido o a partir de la apertura del local ' + 
			'en el siguiente horario habil.', 50,posicionInicialLinea + 70);

		
		doc.end();

		resolve('OK');
		reject('Error');

        })

        return promesaAux;
		
	},

}
