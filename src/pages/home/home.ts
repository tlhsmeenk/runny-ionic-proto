import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { ListPage} from '../list/list'

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  host : string;
  name : string;
  socket: WebSocket;

  constructor(public navCtrl: NavController,private toastCtrl: ToastController) {
      //default dev host
      this.host = "ws://10.0.2.15:9000"
  }

  connect() {
    this.socket =new WebSocket(this.host);
    this.homepageOnMessageHandler(this.socket)
  }

  homepageOnMessageHandler(socket){
    this.socket.onmessage = (message) =>{
        let msgAsJson = JSON.parse(message.data)
        let type = msgAsJson['type']

        switch(type){
          case 'connected':
            this.informAndSwitchPage(msgAsJson['payload'].run_id)
            break
          case 'error':
          case 'info':
            console.log(msgAsJson['payload'].message)
            break
          default:
            console.log('No idea how to handle this message: ' + message.data)
        }
    }
  }

  informAndSwitchPage(runid) {
    let toast = this.toastCtrl.create({
      message: 'Connnected! :-D Let\'s join a run!',
      duration: 2000,
      position: 'top'
    });

    toast.onDidDismiss(() => {
      this.navCtrl.push(ListPage, { socket : this.socket, name : this.name, runid : runid })
    });

    toast.present();
  }

}
