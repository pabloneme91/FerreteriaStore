var nodemailer = require('nodemailer');
var fs = require('fs');
var Promesa = require('bluebird');

module.exports = {

    enviarMail : function(mailInfo) {
        var transport = nodemailer.createTransport("SMTP",{
            service: 'Gmail',
            auth: {
    	           user : "xxx",
    	           pass : "xxx"
                  }
        });

        var mailOptions = {
            from: 'pablo <xxx>',
            to: 'xxx',
            
            subject: mailInfo.Asunto,
            text: mailInfo.Mensaje,
            }

        if(mailInfo.Archivo) {
            mailOptions.attachments = [{
                filename: mailInfo.Archivo.Nombre,
                streamSource : fs.createReadStream(mailInfo.Archivo.Ruta)
            }]
        }

        var promesaAux;

        promesaAux = new Promise(function(resolve,reject){
            transport.sendMail(mailOptions, (error, info) =>{
                if(error){
                    error.message = 'Error : Mail incorrecto';
                    reject(error);
                }
                else{
                    resolve(info);    
                }
            });
        })

        return promesaAux;

    },
}





