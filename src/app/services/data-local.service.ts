import { Injectable } from '@angular/core';
import { Registro } from '../models/registro.model';
import { Storage } from '@ionic/storage';
import { NavController } from '@ionic/angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { File } from '@ionic-native/file/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { AlertController } from '@ionic/angular';


@Injectable({
  providedIn: 'root'
})
export class DataLocalService {

  guardados: Registro[] = [];

  constructor( private storage: Storage,
               private navCtrl: NavController,
               private iab: InAppBrowser,
               private file: File,
               private socialSharing: SocialSharing,
               private alertController: AlertController) {

    this.cargarStorage();
   }

   async cargarStorage() {
     this.guardados = await this.storage.get('registros') || [];
    }


   async guardarRegistro( format: string, text: string ) {

    await this.cargarStorage();

    const nuevoRegistro = new Registro( format, text );
    this.guardados.unshift( nuevoRegistro );

    this.storage.set('registros', this.guardados);

    this.abrirRegistro( nuevoRegistro );
  }

  deleteReg() {
    this.storage.remove('registros');
    this.cargarStorage();
  }

  abrirRegistro( registro: Registro ) {

    this.navCtrl.navigateForward('/tabs/tab2');

    switch ( registro.type ) {

      case 'http':
        this.iab.create( registro.text, '_system' );
        break;

      case 'geo':
        this.navCtrl.navigateForward(`tabs/tab2/mapa/${ registro.text }`);
        break;

    }

  }
  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      message: '<strong>¿Desea eliminar el historial?</strong>',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
          }
        }, {
          text: 'Si',
          handler: () => {
            this.deleteReg();
          }
        }
      ]
    });
    await alert.present();
  }


  compartir() {
    const arrTemp = [];
    const titulos = 'Tipo, Formato, Creado en, Texto\n';

    arrTemp.push( titulos);

    this.guardados.forEach( registro => {

      const linea = `${ registro.type }, ${ registro.format },${ registro.created  }, ${ registro.text.replace(',', ' ') }\n`;

      arrTemp.push( linea );
      this.crearArchivoFisico( arrTemp.join('') );

    });
    this.socialSharing.share('', '', this.file.dataDirectory + 'registros.csv' );
  }

  borrarItem( i: number ) {
    this.guardados.splice( i, 1 );
    this.storage.set('registros', this.guardados);
  }
  openBrowser( registro: Registro ) {
   this.iab.create( registro.text, '_system' );
  }
  enviarCorreo() {

    const arrTemp = [];
    const titulos = 'Tipo, Formato, Creado en, Texto\n';

    arrTemp.push( titulos);

    this.guardados.forEach( registro => {

      const linea = `${ registro.type }, ${ registro.format },${ registro.created  }, ${ registro.text.replace(',', ' ') }\n`;

      arrTemp.push( linea );

    });

    this.crearArchivoFisico( arrTemp.join('') );

  }

  crearArchivoFisico( text: string ) {

    this.file.checkFile( this.file.dataDirectory, 'registros.csv' )
    .then( existe => {
      return this.escribirEnArchivo( text );
    })
    .catch( err => {

      return this.file.createFile( this.file.dataDirectory, 'registros.csv', false )
      .then( creado => this.escribirEnArchivo( text ) );

    });

  }

  async escribirEnArchivo( text: string ) {

    await this.file.writeExistingFile( this.file.dataDirectory, 'registros.csv', text );
  }

}
