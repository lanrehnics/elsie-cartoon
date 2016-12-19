import { Component } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Badger, DRing } from '../../models/badger';
import { MediaCapture, MediaFile, CaptureError } from 'ionic-native';
import { File, Entry, FileError, Camera } from 'ionic-native';

declare var cordova: any;

@Component({
  selector: 'page-box',
  templateUrl: 'box.html',
  providers: []
})

/**
 * the Multi- returns tripe such as this:
 * file:/storage/emulated/0/DCIM/Camera/<name>.jpg */
export class BoxPage {
  meta: any = {};
  images: any[];
  curBox: any;
  fromPath: any;
  fs2: any;
  cats: string[];
  thePhoto: any;
  rawImage: any;
  box: Badger;
  dbBoxes: any[];
  dbId: any;
  areWeLocal: boolean;

  constructor(
    public navCtrl: NavController,
    public db: Storage,
    public toastCtrl: ToastController
  ) {
    this.cats = ["cats-1.jpg", "cats-2.jpg", "cats-3.jpg", "cats-4.jpg", "cats-5.jpg", "cats-6.jpg", "cats-7.jpg", "cats-8.jpg"];
    this.meta = { glob: { curBox: false, curBoxBadge: false, curThg: false, curThgBadge:false }, stanley: "steamer" };
    console.log(`constructed with  ${JSON.stringify(this.meta)}`);
    try {
      this.areWeLocal = false;
      this.fs2 = cordova.file.externalDataDirectory;
    } catch (e) {
      this.areWeLocal = true;
      this.fs2 = "assets/";
    } finally {
      console.log(`Today's FS2 is: ${this.fs2}`);
    } //try
  }
  ionViewDidEnter() {
    this.checkDb();
  }
  addBox() {
    this.box = new Badger();
    this.box.action = "nuBox"
    this.dbId = new Date().valueOf().toString();
    // console.log(`made nuBox: ${JSON.stringify(this.box)}`);
    // this.multiPix();
    this.singlePix();
  }

  /**
   * file:///storage/emulated/0/Android/data/ <name> /cache/imagenumber.jpg
   */
  singlePix() {
    if (this.areWeLocal == false) {
      let deviceFailureFlag = cordova.file.externalDataDirectory;
      Camera.getPicture({
        destinationType: Camera.DestinationType.FILE_URI,
        correctOrientation: true
      }).then((result) => {

        this.rawImage = this.slashName(result);
        this.box.badge = this.rawImage.name;
        this.box.box = this.rawImage.name;
        this.mvImageToSafePlace();
      }, (err) => {
        console.log(err);
      });
    } else {
      // fake result is file:/storage/emulated/0/DCIM/Camera/<name>.jpg
      this.areWeLocal = true;
      let thisCat = "assets/" + this.cats[Math.floor(Math.random() * this.cats.length)];
      this.rawImage = this.slashName(thisCat);
      this.box.badge = this.rawImage.name;
      this.box.box = this.rawImage.name;
      this.mvImageToSafePlace();
    }
  } //singlePix()

  mvImageToSafePlace() {
    if (this.fs2 !== this.rawImage.path) {
      console.log(`--Fr: ${this.rawImage.path} ${this.rawImage.name}`);
      console.log(`--To: ${this.fs2} ${this.rawImage.name}`);
      File.moveFile(this.rawImage.path, this.rawImage.name, this.fs2, this.rawImage.name).then(
        (val: Entry) => {
          console.log("** File.moveFile OK " + JSON.stringify(val));
        },
        (err: FileError) => { console.log(`FileError ${JSON.stringify(err)}`); }
      );
    }
    // console.log(`Box: ${JSON.stringify(this.box)}`);
    this.saveBoxObject();
  }

  saveBoxObject() {
    this.meta.glob.curBox = this.dbId;
    this.meta.glob.curBoxBadge = this.box.badge;
    this.db.set(this.dbId, this.box)
      .then((res) => {
        this.db.get(this.dbId)
          .then((res) => {
            if (this.areWeLocal) {
              console.log(`save/db.get ${this.dbId} -=> ${JSON.stringify(res.signetHuman)}`);
            } else {
              console.log(`save/db.get ${this.dbId} -=> ${JSON.stringify(res)}`);
            }

            this.checkDb(); // refresh current data; I wish it really did...

            // this.db.get("dbglob")
            //   .then((res) => {
            //     // look at res.curBox, res.curThg

            //     asdfasdf
            //   })
            //   .then((x) => {
            //     this.db.set("dbglob", something);
            // })

          })
      });
  }

  /**
   * @param b is actually signetValue, so...
   *    let's loop thru the database to find a key in the haystack...
   */
  openBox(boxSignet) {
    this.db.keys()
      .then((res) => {
        let ak = res;
        res.forEach(oneKey => {
          this.db.get(oneKey)
            .then((ret) => {
              if (ret.signetValue == boxSignet) {
                this.meta.glob.curBox = oneKey;
                this.meta.glob.curBoxBadge = ret.badge;
              }
              this.db.set("dbglob", this.meta.glob); // set and forget?
            });
        });
      })
  }

  /**
   * EVERYTIME
   * 1. get the keys of the database
   * 2. use keys to create Boxes array (why? for the box.html list of boxes)
   * 3. use keys to fetch Current/Status record, update in-memory Status
   */

  checkDb(): void {
    this.meta.allkeys = [];
    this.dbBoxes = [];
    let dbGlobLocated = false;
    this.db.keys()
      .then((ret) => {
        this.meta.allkeys = ret;
        if (this.meta.allkeys.length == 0) {
          this.meta.showStart = true;
          this.freshDatabase();
        } else {
          console.log(`db has: ${JSON.stringify(this.meta.allkeys.length)} records.`);
          console.log(`reminder, fs2 is ${this.fs2}`);

          for (let i = this.meta.allkeys.length - 1; i >= 0; i--) {
            let rowNumber = this.meta.allkeys[i];
            this.db.get(rowNumber).then((record) => {
              // IS IT ONE OF OURS?
              if (record && record.hasOwnProperty('action')) {
                console.log(`${i} : ${rowNumber} : ${record.action} : ${record.badge} : ${this.myTime(record.signetValue)}`);
                // IS IT A BOX?
                if (record.action == "nuBox" || record.action == "unBox") {
                  this.dbBoxes.push(record);
                }
              } else {
                console.log(`${rowNumber} might be our global constant...`);
                if (rowNumber == "dbglob") {
                  // do something with dbglob, perhaps,
                  dbGlobLocated = true
                }
              } // one of ours?
            });
          } // done with allkeys

          // this.meta.glob.curBox;

          if (dbGlobLocated == false) {
            this.db.set("dbglob", this.meta.glob)
              .then((ret) => {
                this.db.get("dbglob")
                  .then((rec) => {
                    console.log(` "dbglob: ${JSON.stringify(rec)}`);
                    console.log(` "meta: ${JSON.stringify(this.meta)}`);
                  })
              });
          }
        }
      }); //dbkeys()
  }
  /**
   * End of the Actions --------------------
   */

  myTime(t: string): string {
    let slag = new Date(Number(t));
    return ("0" + slag.getHours()).slice(-2) + ":" + ("0" + slag.getMinutes()).slice(-2) + ":" + ("0" + slag.getSeconds()).slice(-2) + "." + ("00" + slag.getUTCMilliseconds()).slice(-3);
  }

  slashName(path) {
    let n = path.split('/').pop();
    let o = path.split('/').slice(0, -1).join('/') + '/';
    let p = o.replace(':', '://');
    return { 'name': n, 'path': p };
  }

  freshDatabase(): void {
    let toast = this.toastCtrl.create({
      message: 'Database Empty. U Make New Box.',
      duration: 2000,
      showCloseButton: true,
      position: 'middle'
    });
    toast.onDidDismiss(() => { /** console.log('Dismissed toast');*/ });
    toast.present();
  } //freshDatabase()

} // BoxPage

        // config.xml
        // <preference name="AndroidPersistentFileLocation" value="Internal" />
        // <preference name="iosPersistentFileLocation" value="Library" />
        // console.log(cordova.file.dataDirectory);


/** from CLACKULATOR
cordova-plugin-camera 2.3.0 "Camera"
cordova-plugin-compat 1.1.0 "Compat"
cordova-plugin-console 1.0.4 "Console"
cordova-plugin-crosswalk-webview 2.2.0 "Crosswalk WebView Engine"
cordova-plugin-device 1.1.3 "Device"
cordova-plugin-file 4.3.0 "File"
cordova-plugin-media-capture 1.4.0 "Capture"
cordova-plugin-splashscreen 4.0.0 "Splashscreen"
cordova-plugin-sqlite 1.0.3 "Cordova Sqllite Plugine"
cordova-plugin-statusbar 2.2.0 "StatusBar"
cordova-plugin-whitelist 1.3.0 "Whitelist"
ionic-plugin-keyboard 2.2.1 "Keyboard" */
