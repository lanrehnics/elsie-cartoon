import { Component } from '@angular/core';
// import { App, NavController, Tabs } from 'ionic-angular';
import { NavController, Tabs } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Ute } from '../../models/badger';
import { File, Entry, FileError } from 'ionic-native';

declare var cordova: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: []
})

export class HomePage {

  nubNotes: string;
  meta: any = {};
  bytes_free: any;
  fs2: any;
  areWeLocal: boolean;
  ute: any;

  larry: any;
  moe: any;
  curly: any;

  constructor
    (
    public navCtrl: NavController,
    public db: Storage,
    private tabs: Tabs
    ) {
    this.ute = new Ute();
    this.checkDb();
    this.checkFs();
  }

  ionViewWillEnter() {
    this.checkDb();
  }

  async test() {
    let ans1: any;
    let ans2: any;
    await this.ute.dbKeys().then((res) => {
      if (res.dbKeys.length > 0) {
        ans1 = "OK"
      } else {
        ans1 = "no"
      }
      return ans1
    });
    await this.ute.dbGetGlob().then((res) => {
      console.log(`ans2 ${JSON.stringify(res)}`);
      ans2 = {};
      if (res.dbglob.curBox && res.dbglob.curBoxBadge) {
        ans2.curBox = res.dbglob.curBox;
      }
      if (res.dbglob.curThg && res.dbglob.curThgBadge) {
        ans2.curThg = res.dbglob.curThg;
      }
      return ans2
    })
    console.log(`ans1 ${ans1}, ans2 ${JSON.stringify(ans2)}`);

  }


  testFAIL() {
    console.log(`Home.test() moving checkDb into Ute!`);
    new Ute().dbChekFAIL().then((res) => {
      console.log(`Ute.dbChek says ${JSON.stringify(res)}`)
    })

  }

  async makeJayson() {
    let jef = new Ute();
    [this.larry, this.moe, this.curly] = await Promise.all([
      jef.dbSetGlob("dbglob", { monster: "bait and switch" })
        .then((res) => {
          this.larry = Object.assign({}, res);
          console.log(`L ${JSON.stringify(this.larry)}`);
        }),
      jef.dbGetGlob("dbglob").then((res) => {
        this.moe = Object.assign({}, res);
        console.log(`M ${JSON.stringify(this.moe)}`);
      }),
      jef.dbKeys().then((res) => {
        this.curly = Object.assign({}, res);
        console.log(`C ${JSON.stringify(this.curly)}`);
      })
    ]);
  }



  // async oldmakeJayson() {
  //   let joe = "b4";
  //   let moe = {};
  //   let curly = {};
  //   console.log(`moe Ute? ${JSON.stringify(moe)}`);
  //   await this.jGetGlob().then((res) => { moe = res });
  //   console.log(`moe Ute? ${JSON.stringify(moe)}`);

  //   // console.log(`joe Ute? ${JSON.stringify(joe)}`);
  //   console.log(`curly Ute? ${JSON.stringify(curly)}`);
  //   await this.jGetGlob().then((res) => { curly = res });
  //   console.log(`curly Ute? ${JSON.stringify(curly)}`);
  //   // await this.jKeys().then((res) => { joe = res; });
  //   // console.log(`joe Ute? ${JSON.stringify(joe)}`);
  //   // await
  //   // console.log(`there are bob ${bob.length} keys ----------------`);
  //   // console.log(`${ret.id} : ${ret.action} : ${ret.badge}`);
  // }

  checkFs() {
    // File.getFreeDiskSpace().then((data: any) => {
    //   this.bytes_free = data;
    // });
    try {
      this.areWeLocal = false;
      this.fs2 = cordova.file.externalDataDirectory;
    } catch (e) {
      this.areWeLocal = true;
      this.fs2 = "assets/";
    } finally {
      // console.log(`Home: Today's FS2 is: ${this.fs2}`);
    } //try
  }

  emptyDatabase() {
    this.db.clear().then(() => {
      // Run this code once the database has been entirely deleted.
      console.log('Database is now empty.');
    }).catch(function (err) {
      // This code runs if there were any errors
      console.log(err);
    });
  }

  checkDb() {
    this.db.keys()
      .then((ret) => {
        this.meta.allkeys = ret;
        // console.log(`allkeys: ${JSON.stringify(this.meta.allkeys)}`);
        if (this.meta.allkeys.length == 0) {
          this.meta.showStart = true;
          this.tabs.select(2);
        } else {
          this.meta.showStart = false;
          this.db.get("dbglob")
            .then((res) => {
              // console.log(`Home,checkDb,dbglob ${JSON.stringify(res)}`);
              if (res == undefined) {
                // do nothing
              } else {
                this.meta.glob = res;
              }
            })
        }
      });
  }

  // ex1() {
  //   let jay = new Badger();
  //   console.log('b4 ' + JSON.stringify(jay));
  //   jay.box = "jayBox"
  //   console.log('h4 ' + JSON.stringify(jay));
  // } // ex1

  // ex2() {
  //   console.log('wait for it...');

  //   setTimeout(function () {
  //     let bill = new Badger();
  //     console.log('b4 ' + JSON.stringify(bill));
  //     bill.box = "BillBox"
  //     console.log('h4 ' + JSON.stringify(bill));

  //   }, 5000);
  // } // ex2

  // toNewBox() {
  //   // this.navCtrl.getByIndex(2);
  //   // this.navCtrl.push(2)
  //   // let nav = this.app.getRootNav();
  //   // nav.push(BoxPage);
  //   this.tabs.select(2);
  // }

  // nuBox() {
  //   this.nubNotes = "1) new Badger, 2) 'nuBox', 3)start Camera, 3) move image to 'files/badge.jpg'";

  // }

  /**
   * the "j" series do/did work, but with a
   *    whole 'nother layer of Promises in teh middle.

    jKeys(): Promise<string> {
      return new Promise((resolve) => {
        new Ute().dbKeys().then((res) => {
          resolve(res);
        });
      })
    }
    jGetGlob(): Promise<Object> {
      console.log(`Home.jGetGlob `);
      return new Promise((resolve) => {
        new Ute().dbGetGlob("dbglob").then((res) => {
          console.log(`Home.jGetGlob2 ${JSON.stringify(res)}`);
          resolve(res);
        })
      });
    }
    jSetGlob(key, val): Promise<Object> {
      console.log(`Home.jSetGlob(), ignoring key: ${key} `);
      return new Promise((resolve) => {
        new Ute().dbSetGlob(key, val).then((res) => {
          console.log(`Home.jSetGlob2 ${JSON.stringify(res)}`);
          resolve(res);
        })
      });
    }

    async makeJaysonWORKS() {
      let obj = { name: 'silly', walk: 'erratic', best: 'not very' }
      let [larry, moe, curly] = await Promise.all([
        this.jSetGlob("petunia", obj),
        this.jGetGlob(),
        this.jKeys()
      ]);
      console.log(`larry Ute? ${JSON.stringify(larry)}`);
      console.log(`moe Ute? ${JSON.stringify(moe)}`);
      console.log(`curly Ute? ${JSON.stringify(curly)}`);
    }



   */



} // HomePage class

