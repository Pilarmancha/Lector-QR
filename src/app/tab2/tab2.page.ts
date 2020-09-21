import { Component } from '@angular/core';
import { DataLocalService } from '../services/data-local.service';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { AlertController } from '@ionic/angular';


@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  constructor( public dataLocal: DataLocalService,
               private socialSharing: SocialSharing,
               private alertController: AlertController) {}

  compartir() {
    this.dataLocal.compartir();
  }
  abrirRegistro( registro ) {
    this.dataLocal.abrirRegistro( registro );
  }
  deleteReg() {
    this.dataLocal.presentAlertConfirm();
  }

}

