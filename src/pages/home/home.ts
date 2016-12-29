import { Component } from '@angular/core';
import { App, NavController, Tabs } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Badger } from '../../models/badger';
import { MM } from '../../models/mm';
import { File, Entry, FileError, Transfer } from 'ionic-native';
import { CamPage } from '../cam/cam';

declare var cordova: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: []
})

export class HomePage {

  // dogTransfer: Transfer = new Transfer();
  tattler: any;
  atlasTransfer: any;
  message: string;
  nubNotes: string;
  meta: any = {};
  showStart: boolean;
  bytes_free: any;
  fs2: any;
  areWeLocal: boolean;
  mm: any;

  constructor(
    public navCtrl: NavController,
    public db: Storage,
    private tabs: Tabs
  ) {
    try {
      this.areWeLocal = false;
      this.fs2 = cordova.file.externalDataDirectory;
      this.atlasTransfer = new Transfer();
    } catch (e) {
      this.areWeLocal = true;
      this.fs2 = "assets/";
    } finally {
      // console.log(`Home: Today's FS2 is: ${this.fs2}`);
    } //try

  } //constructor

  ionViewWillEnter() {
    // every time
    this.mm = MM.getInstance();
    this.mm.mmRead();
    this.message = '';
    if (this.areWeLocal == false) {
      this.checkDbFs();
    } else {
      // some other checkDb here?
    }
    this.db.get('mmJustBoxes')
      .then((ret) => {
        if (ret.length === 0) { this.tabs.select(2); }
        else { console.log(`justBoxes ${JSON.stringify(ret.length)}`); }
      })
      .catch((e) => {
        console.log(`justBoxes fail ${JSON.stringify(e)}`);
        this.tabs.select(2);
      })
  }

  ionViewDidEnter() {
    // every time
  }

  ionViewDidLoad() {
    // init only

  }

  ionViewWillLeave() {
    // this.mm.mmWrite();
  }

  async checkForBrokenImages() {
    // alternative to checkDbFs
  }

  /** how many Badgers in db versus how many images in ~/files */
  async checkDbFs() {
    let lenDb: number = 0;
    let lenFs: number = 0;
    let pathToImages: string = '';
    pathToImages = this.fs2;
    await this.db.get('mmBadgers')
      .then((res) => {
        if (res.hasOwnProperty('length') && res.length > 0) {
          // halfway
          lenDb = res.length;
        }
      })
      .catch((e) => {
        console.log(`checkDbFs DB.err ${JSON.stringify(e)}`);
      })
    await File.listDir(pathToImages, '')
      .then((ret) => {
        console.log(`listdir ${JSON.stringify(ret)}`);
        console.log(`listdir ${JSON.stringify(ret)}`);

        if (ret.hasOwnProperty('length') && ret.length > 0) {
          // other half
          lenFs = ret.length;
        }
      })
      .catch((e) => {
        console.log(`checkDbFs FS.err ${pathToImages} e: ${JSON.stringify(e)}`);
      })
    console.log(`checkDbFs -- lenDb ${lenDb}, lenFs ${lenFs}`);

    if (lenFs == 0 && lenDb !== 0) {
      // problem
      this.message = "There are no pictures in " + pathToImages + ", yet there's stuff in the database. Perhaps it should be emptied?"
    }

  }

  // listDir(path, dirName)

  emptyDatabase() {
    this.db.clear().then(() => {
      console.log('Database is now empty.');
      this.message = 'Database is now empty.';
    }).catch(function (err) {
      console.log(err);
    });
  }

  test1() {
    console.log(`test1() CURRENTs`);
    console.log(`box ${this.mm.curBox}`);
    console.log(`boxbad ${this.fs2} +++ ${this.mm.curBoxBadge}`);
    console.log(`thg ${this.mm.curThg}`);
    console.log(`thgbad ${this.fs2} +++ ${this.mm.curThgBadge}`);
    if (this.areWeLocal) {
      console.log(`NOT touching FILE TRANSFER`);
    } else {
      let options = {
        fileKey: 'image',
        fileName: this.mm.curBoxBadge,
        headers: {}
      }
      let theFile = this.fs2 + this.mm.curBoxBadge;
      let urlSpot = "http://192.168.1.11/up";
      this.atlasTransfer.upload(theFile, urlSpot, options)
        .then((data) => {
          console.log(`fileTransfer got ${JSON.stringify(data)}`);
        }, (err) => {
          console.log(`fileTransferror ${JSON.stringify(err)}`);
        })
    }

  }//test1

  test2() {
    console.log(`ONE BOX`);
    let bob = this.mm.curBox;
    this.tattler = this.mm.curBox;
    this.mm.oneBox(bob)
      .then((zag) => {
        console.log(`TEST 2 ASKS FOR ${JSON.stringify(bob)},`);
        console.log(`  GOT ${JSON.stringify(zag.length)} badges`);
        if (this.areWeLocal) {
          console.log(`NOT touching FILE TRANSFER`);
          zag.forEach((v, k) => {
            console.log(`  ${v.action} i ${v.id} b ${v.box}`);
          });
        } else {
          let options = { fileKey: 'image', fileName: 'replacedInLoop', headers: {} }
          let theFile: string = '';
          let urlSpot = "http://192.168.1.11/up";
          zag.forEach((v, k) => {
            options.fileName = v.badge;
            theFile = this.fs2 + v.badge;
            this.atlasTransfer.upload(theFile, urlSpot, options)
              .then((data) => {
                console.log(`test2 ${JSON.stringify(data)}`);
              }), (err) => {
                console.log(`test2err ${JSON.stringify(err)}`);
              }
          })//zag.forEach
        }
      })
      .catch((err) => {
        console.log(`mm.oneBox err ${JSON.stringify(err)}`);
      });
  }


  plan10() {
    let p10 = "oneBox 0: \"1482985400961\"";
    p10 += "oB1 looking for \"1482985400961\"";
    p10 += "raw ret";
    let p11 = [
      { "id": "1482896371686", "signetValue": "1482896371686", "action": "nuBox", "badge": "1482896393804.jpg", "thing": "", "box": "1482896393804.jpg", "signetHuman": "Tue Dec 27 2016 21:39:31 GMT-0600 (CST)" }, { "id": "1482896400039", "signetValue": "1482896400039", "action": "nuBox", "badge": "1482896407097.jpg", "thing": "", "box": "1482896407097.jpg", "signetHuman": "Tue Dec 27 2016 21:40:00 GMT-0600 (CST)" }, { "id": "1482896423908", "signetValue": "1482896423908", "action": "nuBox", "badge": "1482896433287.jpg", "thing": "", "box": "1482896433287.jpg", "signetHuman": "Tue Dec 27 2016 21:40:23 GMT-0600 (CST)" }, { "id": "1482896444285", "signetValue": "1482896444285", "action": "nuThg", "badge": "1482896444315.jpg", "thing": "1482896444315.jpg", "box": "1482896433287.jpg", "signetHuman": "Tue Dec 27 2016 21:40:44 GMT-0600 (CST)" }, { "id": "1482896444298", "signetValue": "1482896444298", "action": "moThg", "badge": "1482896450272.jpg", "thing": "1482896444315.jpg", "box": "1482896433287.jpg", "signetHuman": "Tue Dec 27 2016 21:40:44 GMT-0600 (CST)" }, { "id": "1482896444311", "signetValue": "1482896444311", "action": "moThg", "badge": "1482896460306.jpg", "thing": "1482896444315.jpg", "box": "1482896433287.jpg", "signetHuman": "Tue Dec 27 2016 21:40:44 GMT-0600 (CST)" }, { "id": "1482911116343", "signetValue": "1482911116343", "action": "nuThg", "badge": "1482911116392.jpg", "thing": "1482911116392.jpg", "box": "1482896433287.jpg", "signetHuman": "Wed Dec 28 2016 01:45:16 GMT-0600 (CST)" }, { "id": "1482911116356", "signetValue": "1482911116356", "action": "moThg", "badge": "1482911166316.jpg", "thing": "1482911116392.jpg", "box": "1482896433287.jpg", "signetHuman": "Wed Dec 28 2016 01:45:16 GMT-0600 (CST)" }, { "id": "1482911116369", "signetValue": "1482911116369", "action": "moThg", "badge": "1482911175142.jpg", "thing": "1482911116392.jpg", "box": "1482896433287.jpg", "signetHuman": "Wed Dec 28 2016 01:45:16 GMT-0600 (CST)" }, { "id": "1482985400960", "signetValue": "1482985400960", "action": "nuBox", "badge": "1482985411108.jpg", "thing": "", "box": "1482985411108.jpg", "signetHuman": "Wed Dec 28 2016 22:23:20 GMT-0600 (CST)" }, { "id": "1482989076874", "signetValue": "1482989076874", "action": "nuThg", "badge": "1482989076927.jpg", "thing": "1482989076927.jpg", "box": "1482985411108.jpg", "signetHuman": "Wed Dec 28 2016 23:24:36 GMT-0600 (CST)" }, { "id": "1482989076887", "signetValue": "1482989076887", "action": "moThg", "badge": "1482989087766.jpg", "thing": "1482989076927.jpg", "box": "1482985411108.jpg", "signetHuman": "Wed Dec 28 2016 23:24:36 GMT-0600 (CST)" }, { "id": "1482989076900", "signetValue": "1482989076900", "action": "moThg", "badge": "1482989094325.jpg", "thing": "1482989076927.jpg", "box": "1482985411108.jpg", "signetHuman": "Wed Dec 28 2016 23:24:36 GMT-0600 (CST)" }, { "id": "1482989113003", "signetValue": "1482989113003", "action": "nuThg", "badge": "1482989113015.jpg", "thing": "1482989113015.jpg", "box": "1482985411108.jpg", "signetHuman": "Wed Dec 28 2016 23:25:13 GMT-0600 (CST)" }, { "id": "1482989113016", "signetValue": "1482989113016", "action": "moThg", "badge": "1482989119537.jpg", "thing": "1482989113015.jpg", "box": "1482985411108.jpg", "signetHuman": "Wed Dec 28 2016 23:25:13 GMT-0600 (CST)" }, { "id": "1482989113029", "signetValue": "1482989113029", "action": "moThg", "badge": "1482989125110.jpg", "thing": "1482989113015.jpg", "box": "1482985411108.jpg", "signetHuman": "Wed Dec 28 2016 23:25:13 GMT-0600 (CST)" }];
    let p12 = "EXCEPTION: Uncaught (in promise): [object Object]";
    let p13 = "ORIGINAL STACKTRACE:"
    let p14 = "Error: Uncaught (in promise): [object Object]"

  }

  plan9() {
    let oB1lookingfor = "1482985400961";

    let rawret = [
      { "id": "1482896371686", "signetValue": "1482896371686", "action": "nuBox", "badge": "1482896393804.jpg", "thing": "", "box": "1482896393804.jpg", "signetHuman": "Tue Dec 27 2016 21:39:31 GMT-0600 (CST)" }, { "id": "1482896400039", "signetValue": "1482896400039", "action": "nuBox", "badge": "1482896407097.jpg", "thing": "", "box": "1482896407097.jpg", "signetHuman": "Tue Dec 27 2016 21:40:00 GMT-0600 (CST)" },
      { "id": "1482896423908", "signetValue": "1482896423908", "action": "nuBox", "badge": "1482896433287.jpg", "thing": "", "box": "1482896433287.jpg", "signetHuman": "Tue Dec 27 2016 21:40:23 GMT-0600 (CST)" },
      { "id": "1482896444285", "signetValue": "1482896444285", "action": "nuThg", "badge": "1482896444315.jpg", "thing": "1482896444315.jpg", "box": "1482896433287.jpg", "signetHuman": "Tue Dec 27 2016 21:40:44 GMT-0600 (CST)" },
      { "id": "1482896444298", "signetValue": "1482896444298", "action": "moThg", "badge": "1482896450272.jpg", "thing": "1482896444315.jpg", "box": "1482896433287.jpg", "signetHuman": "Tue Dec 27 2016 21:40:44 GMT-0600 (CST)" },
      { "id": "1482896444311", "signetValue": "1482896444311", "action": "moThg", "badge": "1482896460306.jpg", "thing": "1482896444315.jpg", "box": "1482896433287.jpg", "signetHuman": "Tue Dec 27 2016 21:40:44 GMT-0600 (CST)" },
      { "id": "1482911116343", "signetValue": "1482911116343", "action": "nuThg", "badge": "1482911116392.jpg", "thing": "1482911116392.jpg", "box": "1482896433287.jpg", "signetHuman": "Wed Dec 28 2016 01:45:16 GMT-0600 (CST)" },
      { "id": "1482911116356", "signetValue": "1482911116356", "action": "moThg", "badge": "1482911166316.jpg", "thing": "1482911116392.jpg", "box": "1482896433287.jpg", "signetHuman": "Wed Dec 28 2016 01:45:16 GMT-0600 (CST)" },
      { "id": "1482911116369", "signetValue": "1482911116369", "action": "moThg", "badge": "1482911175142.jpg", "thing": "1482911116392.jpg", "box": "1482896433287.jpg", "signetHuman": "Wed Dec 28 2016 01:45:16 GMT-0600 (CST)" },
      { "id": "1482985400960", "signetValue": "1482985400960", "action": "nuBox", "badge": "1482985411108.jpg", "thing": "", "box": "1482985411108.jpg", "signetHuman": "Wed Dec 28 2016 22:23:20 GMT-0600 (CST)" },
      { "id": "1482989076874", "signetValue": "1482989076874", "action": "nuThg", "badge": "1482989076927.jpg", "thing": "1482989076927.jpg", "box": "1482985411108.jpg", "signetHuman": "Wed Dec 28 2016 23:24:36 GMT-0600 (CST)" },
      { "id": "1482989076887", "signetValue": "1482989076887", "action": "moThg", "badge": "1482989087766.jpg", "thing": "1482989076927.jpg", "box": "1482985411108.jpg", "signetHuman": "Wed Dec 28 2016 23:24:36 GMT-0600 (CST)" },
      { "id": "1482989076900", "signetValue": "1482989076900", "action": "moThg", "badge": "1482989094325.jpg", "thing": "1482989076927.jpg", "box": "1482985411108.jpg", "signetHuman": "Wed Dec 28 2016 23:24:36 GMT-0600 (CST)" },
      { "id": "1482989113003", "signetValue": "1482989113003", "action": "nuThg", "badge": "1482989113015.jpg", "thing": "1482989113015.jpg", "box": "1482985411108.jpg", "signetHuman": "Wed Dec 28 2016 23:25:13 GMT-0600 (CST)" },
      { "id": "1482989113016", "signetValue": "1482989113016", "action": "moThg", "badge": "1482989119537.jpg", "thing": "1482989113015.jpg", "box": "1482985411108.jpg", "signetHuman": "Wed Dec 28 2016 23:25:13 GMT-0600 (CST)" },
      { "id": "1482989113029", "signetValue": "1482989113029", "action": "moThg", "badge": "1482989125110.jpg", "thing": "1482989113015.jpg", "box": "1482985411108.jpg", "signetHuman": "Wed Dec 28 2016 23:25:13 GMT-0600 (CST)" }];

  }

  test3() {
    console.log(`ONE THING`);
    let bob = "1482871670509"; // <---------- change me
    this.mm.oneThing(bob)
      .then((zig) => {
        console.log(`asked for ${JSON.stringify(bob)},`);
        console.log(`  got ${JSON.stringify(zig)} badges`);
      });
  }

  test4() {
    console.log(`test4() `);
  }

  //12-22 21:54:50.248: I/chromium(8764): [INFO:CONSOLE(49235)] "Error: Uncaught (in promise): [object Object]

  async writeJayson() {
    let jay = [];

    await this.db.get('mmBadgers')
      .then((res) => {
        jay = JSON.parse(JSON.stringify(res));
        jay.map((line) => { line.id = undefined; });
        console.log(` (((1a))) ${JSON.stringify(jay.length)} records to write`);
        console.log(` (((1b))) prepare to remove file ${this.fs2}jayson.txt`);
      })
      .catch((err) => { console.log(`db.get mmBadgers err ${JSON.stringify(err)}`); })

    await File.removeFile(this.fs2, "jayson.txt")
      .then((res) => {
        console.log(` (((2))) File.remove says ${JSON.stringify(res)}`);
      })
      .catch((err) => { console.log(`File.remove err ${JSON.stringify(err)}`); })

    await File.writeFile(this.fs2, "jayson.txt", JSON.stringify(jay), true)
      .then((val: Entry) => {
        console.log(` (((3))) File.write says ${JSON.stringify(val)}`);
      })
      .catch((err: FileError) => { console.log(`File.write.err ${JSON.stringify(err)}`); });

    console.log(`did the writing work out okay?`);

  }

  fileParts() {
    /**
    checkFile(path, file) Returns: Promise<boolean|FileError>

    createFile(path, fileName, replace) Returns: Promise<FileEntry|FileError>

    removeFile(path, fileName) Returns: Promise<RemoveResult|FileError>

    writeFile(path, fileName, text, options) Returns: Promise<any> Returns a Promise that resolves to updated file entry or rejects with an error. replace file if 'options' is set to true.

    writeExistingFile(path, fileName, text) Returns: Promise<void> Returns a Promise that resolves or rejects with an error.

    readAsText(path, file) Returns: Promise<string|FileError>
   */
  }

  prehistoric() {
    /**
    console.log('*maroon* getting ready to write JSON file');
    var maroonToSave = ({
      signetValue: signetValue.toString(),
      action: 'nuThg',
      badge: maroonie,
      thing: maroonie,
      box: $scope.boxKey,
      signetHuman: sigEstimateHuman
    });
    //"signetHuman": "Sat May 02 2015 09:54:12 GMT-0500 (CDT)"
    dir.getFile("jayson.txt", { create: true },
      function (file) {
        file.createWriter(
          function (fileWriter) {
            fileWriter.seek(fileWriter.length); fileWriter.write(JSON.stringify(maroonToSave) + "\n");
          },
          function (err) { console.log("maroon fileWriter fail"); });
      }, function (err) { console.log("maroon dir.getfile fail"); });
       */
  }


  /** OLD CODE HOME --------------- */

  checkFs() {
    // File.getFreeDiskSpace().then((data: any) => {
    //   this.bytes_free = data;
    // });
  }

  oldcheckDb() {
    this.db.keys()
      .then((ret) => {
        this.meta.allkeys = ret;
        // console.log(`allkeys: ${JSON.stringify(this.meta.allkeys)}`);
        if (this.meta.allkeys.length == 0) {
          this.showStart = true;
          this.tabs.select(2);
        } else {
          this.showStart = false;
          this.db.get("dbglob")
            .then((res) => {
              console.log(`Home,oldcheckDb,dbglob ${JSON.stringify(res)}`);
              if (res == undefined) {
                // do nothing
              } else {
                // this.meta.glob = res;
              }
            })
        }
      });
  }

  ex1() {
    let jay = new Badger();
    console.log('b4 ' + JSON.stringify(jay));
    jay.box = "jayBox"
    console.log('h4 ' + JSON.stringify(jay));
  } // ex1


} // HomePage class

