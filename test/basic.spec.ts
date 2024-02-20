import { Principal } from '@dfinity/principal';
import { resolve } from 'node:path';
import { Actor, PocketIc, createIdentity } from '@hadronous/pic';
import { IDL } from '@dfinity/candid';
import { _SERVICE as TestService, idlFactory as TestIdlFactory, init } from './build/main.idl.js';
import {readFileSync} from "fs";
import {ICRCLedgerService, ICRCLedger} from "./icrc_ledger/ledgerCanister";
//@ts-ignore
import {toState} from "@infu/icblast";
// Jest can't handle multi threaded BigInts o.O That's why we use toState

const WASM_PATH = resolve(__dirname, "./build/main.wasm");

export async function TestCan(pic:PocketIc, ledgerCanisterId:Principal) {
    
    const fixture = await pic.setupCanister<TestService>({
        idlFactory: TestIdlFactory,
        wasm: WASM_PATH,
        arg: IDL.encode(init({ IDL }), [{ledgerId: ledgerCanisterId}]),
    });

    return fixture;
};


describe('Airdrop', () => {
    let pic: PocketIc;
    let user: Actor<TestService>;
    let ledger: Actor<ICRCLedgerService>;
    let userCanisterId: Principal;
    let ledgerCanisterId: Principal;

    const jo = createIdentity('superSecretAlicePassword');
    const bob = createIdentity('superSecretBobPassword');
  
    beforeAll(async () => {
      // console.log(`Jo Principal: ${jo.getPrincipal().toText()}`);
      // console.log(`Bob Principal: ${bob.getPrincipal().toText()}`);

      pic = await PocketIc.create({sns:true});
  
      // Ledger
      const ledgerfixture = await ICRCLedger(pic, jo.getPrincipal(), pic.getSnsSubnet()?.id);
      ledger = ledgerfixture.actor;
      ledgerCanisterId = ledgerfixture.canisterId;
      
      // Ledger User
      const fixture = await TestCan(pic, ledgerCanisterId);
      user = fixture.actor;
      userCanisterId = fixture.canisterId;


    });
  
    afterAll(async () => {
      await pic.tearDown();
    });
  
    it(`Check (minter) balance`  , async () => {
      const result = await ledger.icrc1_balance_of({owner: jo.getPrincipal(), subaccount: []});
      expect(toState(result)).toBe("100000000000")
    });

    it(`Send 25000 to Bob`, async () => { // 1262252741911
      ledger.setIdentity(jo);
      const result = await ledger.icrc1_transfer({
        to: {owner: bob.getPrincipal(), subaccount:[]},
        from_subaccount: [],
        amount: 25000_0001_0000n,
        fee: [],
        memo: [],
        created_at_time: [],
      });
      expect(toState(result)).toStrictEqual({Ok:"1"});
    });

    it(`Check Bob balance`  , async () => {
      const result = await ledger.icrc1_balance_of({owner: bob.getPrincipal(), subaccount: []});
      expect(toState(result)).toBe("2500000010000")
    });

    it(`start canister`, async () => {
   
      await passTime(1);
    
      const result = await user.start();

      await passTime(3);
      const result2 = await user.getInfo();
      expect(toState(result2.last_indexed_tx)).toBe("2");
      
    });

    it(`Import airdrop list`, async () => {
      let blacklist = [
      "3ejs3-eaaaa-aaaag-qbl2a-cai",
      "yv4mw-giaaa-aaaag-qcqjq-cai",
      "nx2w3-maaaa-aaaag-qcaqq-cai",
      "ob7gr-mqaaa-aaaag-qclja-cai",
      "p4xq4-gyaaa-aaaag-qchbq-cai",
      "32fn4-qqaaa-aaaak-ad65a-cai",
      "3xwpq-ziaaa-aaaah-qcn4a-cai"
      ];
      await user.set_blacklisted(blacklist.map(x => Principal.fromText(x)));
      

      let dropsCSV = readFileSync("../drop_targets.csv", "utf-8");
      let drops = dropsCSV.split("\n").map(x => parseCSVLine(x).map(x => x.trim())).map( ([a,b,c]) => ([a, ps(b.replaceAll('"','')), parseInt(c, 10)]));

      //@ts-ignore
      let ndrops = drops.map( ([a,b,c]) => ([parseInt(c, 10),Principal.fromText(a), hexStringToUint8Array(b)]));
      
      //@ts-ignore
      await user.import_drop_targets(ndrops);
      
    });

    it(`feed ledger user and check if it made the transactions`, async () => {
      ledger.setIdentity(bob);
      const result = await ledger.icrc1_transfer({
        to: {owner: userCanisterId, subaccount:[]},
        from_subaccount: [],
        amount: 25_000_0000_0000n,
        fee: [],
        memo: [],
        created_at_time: [],
      });

      await passTime(120);

      const result2 = await user.getInfo();

      expect(toState(result2.last_indexed_tx)).toBe("7795");
      
    }, 600*1000);


    it(`Check how much is left`  , async () => {
      const result = await ledger.icrc1_balance_of({owner: userCanisterId, subaccount: []});
      expect(toState(result)).toBe("1201426308")
    });
    

    it(`Check balances`, async () => {
      let b1 = await ledger.icrc1_balance_of({owner: Principal.fromText("dwka6-vtbfw-c6h7z-zwr5o-togu7-d5md2-qlji5-we6m3-rsub6-ikhxp-2ae"), subaccount: []});
      let b2 = await ledger.icrc1_balance_of({owner: Principal.fromText("7j6sj-4wjm5-liboq-ejq7m-af2ms-l3f73-ituyt-ogqyv-rid2n-ralsv-wqe"), subaccount: []});
      let b3 = await ledger.icrc1_balance_of({owner: Principal.fromText("yrkcc-sqvwv-brcqq-fomc2-fyqeh-n7z5m-omabd-qmdk7-2j4po-eb6js-eqe"), subaccount: []});
      let b4 = await ledger.icrc1_balance_of({owner: Principal.fromText("th65x-be7bq-thkki-clkqi-kpt5z-td2ji-rnz7r-jzk6i-zsj4o-fd3yb-uae"), subaccount: []});
      let b5 = await ledger.icrc1_balance_of({owner: Principal.fromText("32dcy-3ixgr-iaqwx-nz3bb-tga2u-57zlc-oqkc4-cg7js-bptei-so366-sae"), subaccount: []});

    });

    it('Check if error log is empty', async () => {
      let errs = await user.getErrors();
      expect(toState(errs)).toStrictEqual([]);
    });

    async function passTime(n:number) {
      for (let i=0; i<n; i++) {
        await pic.advanceTime(3*1000);
        await pic.tick(2);
      }
    }

    function ps(t:String) {
      if (t == "") return null;
       return t.split(",").map(x => parseInt(x.trim(),10));
    }

    function parseCSVLine(line:String) {
      // Regular expression to match either quoted fields or unquoted fields
      const regex = /(".*?"|[^",]+)(?=\s*,|\s*$)/g;
      
      // Get all matches
      let matches = line.match(regex);
      
      // Check if there are matches; if not, return an empty array
      if (!matches) return [];
      
      // Process matches to handle quoted strings and return the resulting array
      return matches.map(field => {
        // If the field is quoted, remove the quotes
        if (field.startsWith('"') && field.endsWith('"')) {
          return field.substring(1, field.length - 1);
        }
        // Return the field without modification if not quoted
        return field;
      });
    }
  
    function hexStringToUint8Array(hexString:String) {
      if (!hexString || hexString.length === 0) return [];
      if (hexString.length % 2 !== 0) {
        throw new Error("Invalid hex string length.");
      }
    
      const numBytes = hexString.length / 2;
      const uint8Array = new Uint8Array(numBytes);
    
      for (let i = 0; i < numBytes; i++) {
        const byteValue = parseInt(hexString.slice(i * 2, i * 2 + 2), 16);
        uint8Array[i] = byteValue;
      }
    
      return [uint8Array];
    }


});
