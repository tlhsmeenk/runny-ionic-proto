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
    this.items = []
    this.socket = navParams.get(`socket`)
    this.setRunHandlers(this.socket)
    this.initGeo()
  }

  setRunHandlers(socket){
    socket.onmessage = (message) =>{
        let msgAsJson = JSON.parse(message.data)
        let type = msgAsJson['type']

        switch(type){
          case 'runner-update_response':
            this.onUpdate(msgAsJson['payload'])
            break
          default:
            console.log('No idea how to handle this message: ' + message.data)
        }
    }
  }

  initGeo() {
    this.geolocation.getCurrentPosition().then((resp) => {
     this.socket.send(JSON.stringify({'type': 'update', 'payload': { 'longtitude': resp.coords.longitude, 'latitude':  resp.coords.latitude}}))
    }).catch((error) => {
      console.log('Error getting location', error);
    });

    let watch = this.geolocation.watchPosition();
    watch.subscribe((data) => {
     this.socket.send(JSON.stringify({'type': 'update', 'payload': { 'longtitude': data.coords.longitude, 'latitude':  data.coords.latitude}}))
    });
  }

  onUpdate(payload){
    this.items.push({
      title: payload['runner'],
      note: payload['distance'],
      icon: 'ion-android-arrow-up'
    });
  }

  itemTapped(event, item) {

  }
}
