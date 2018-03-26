import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { RunPage} from '../run/run'

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
	static socket(arg0: any): any {
		throw new Error("Method not implemented.");
	}
  selectedItem: any;
  icons: string[];
  items: Array<{title: string, note: string, icon: string}>;
  socket: WebSocket;
  name: string
  runToJoin: string
  ready: boolean
  allReady: boolean
  runStarted: boolean

  constructor(public navCtrl: NavController, public navParams: NavParams,private toastCtrl: ToastController) {
    // If we navigated to this page, we will have an item available as a nav param
    this.selectedItem = navParams.get('item')
    this.socket = navParams.get(`socket`)
    this.name = navParams.get(`name`)
    this.runToJoin = navParams.get(`runid`)
    this.setRunHandlers(this.socket)
    this.ready = false
    this.allReady = false
    this.runStarted = false

    //set the user name for this session
    this.socket.send(JSON.stringify({'type':'setname', 'payload':{ 'name': this.name}}))

    this.items = [];
    this.items.push({
      title: this.name,
      note: 'Not ready',
      icon: 'wifi'
    });

  }

  setRunHandlers(socket){
    socket.onmessage = (message) =>{
        let msgAsJson = JSON.parse(message.data)
        let type = msgAsJson['type']

        switch(type){
          case 'joined':
            this.handleJoined(msgAsJson['payload'])
            break
          case 'getRunnerResponse':
            this.rebuildRunners(msgAsJson['payload'])
            break
          case 'runnerReadyResponse':
            this.setRunnerReady(msgAsJson['payload'])
            break;
          case 'runStarted':
            this.navCtrl.push(RunPage)
            break
          case 'error':
          case 'info':
            this.inform(msgAsJson['payload'].message)
            break
          default:
            console.log('No idea how to handle this message: ' + message.data)
        }
    }
  }

  setRunnerReady(payload){
    if(payload.name === this.name){
      this.ready = payload.state
    }
    this.items.forEach((item, index) => {
        if(item.title === payload.name){
          var value = payload.state ? 'Ready' : 'Not Ready'
          item.note = value
        }
    })

    this.allReady = this.allRunnersReady()
  }

  allRunnersReady(){
    return !this.items.find(e => e.note === 'Not Ready') || this.runStarted
  }

  rebuildRunners(payload){
      this.items = []
      payload.runners.forEach((item, index) => {
        this.items.push({
          title: item,
          note: 'Not Ready',
          icon: 'wifi'
        });
    });
  }

  handleJoined(payload){
    if(payload.name === this.name){
      this.socket.send(JSON.stringify({'type':'getRunners'}))
    } else {
      this.addRunner(payload.name)
    }
  }

  reinitRunners(){
      this.socket.send(JSON.stringify({'type':'join', 'payload':{'runtojoin':this.runToJoin}}))
  }

  addRunner(name){
    this.items.push({
      title: name,
      note: 'Not ready',
      icon: 'wifi'
    });
  }

  inform(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'top'
    });

    toast.onDidDismiss(() => {

    });

    toast.present();
  }

  joinRun(){
    if(this.allReady){
      this.socket.send(JSON.stringify({'type':'startRun'}))
    } else {
      this.socket.send(JSON.stringify({'type':'join', 'payload':{'runtojoin':this.runToJoin}}))
    }
  }

  itemTapped(event, item) {
    if(item.title === this.name){
      this.socket.send(JSON.stringify({'type':'runnerReady', 'payload':{'name':item.title, 'state':!this.ready}}))
    } else {
      this.inform('You cannot force other runners to be ready!')
    }

  }
}
