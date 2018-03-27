import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';

@Component({
  selector: 'page-list',
  templateUrl: 'run.html'
})
export class RunPage {
  items: Array<{title: string, note: string, icon: string}>;
  socket: WebSocket

  constructor(public navCtrl: NavController, public navParams: NavParams, private geolocation: Geolocation) {
    this.socket = navParams.get(`socket`)
    this.setRunHandlers(this.socket)
    this.initGeo()
  }

  setRunHandlers(socket){
    socket.onmessage = (message) =>{
        let msgAsJson = JSON.parse(message.data)
        let type = msgAsJson['type']

        switch(type){
          case 'update':
            this.onUpdate(msgAsJson['payload'])
            break
          default:
            console.log('No idea how to handle this message: ' + message.data)
        }
    }
  }

  initGeo() {
    console.log('setting up geo')
    this.geolocation.getCurrentPosition().then((resp) => {
     console.log('{initial}:' + resp.coords)
    }).catch((error) => {
      console.log('Error getting location', error);
    });

    let watch = this.geolocation.watchPosition();
    watch.subscribe((data) => {
     console.log('{initial}:'+data.coords)
     this.socket.send({'type': 'update', 'payload': { 'longtitude': data.coords.longitude, 'latitude':  data.coords.latitude}})
    });
  }

  onUpdate(payload){
    console.log(payload)
  }

  itemTapped(event, item) {

  }
}
