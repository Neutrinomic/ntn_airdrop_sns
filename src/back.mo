import L "mo:devefi-icrc-ledger";
import Principal "mo:base/Principal";
import Blob "mo:base/Blob";
import Float "mo:base/Float";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import I "mo:itertools/Iter";
import Nat8 "mo:base/Nat8";
import Nat64 "mo:base/Nat64";

actor class() = this {

    let v = 1;
    //--- Test only
    let test_owner = Principal.fromText("z45mi-3hwqo-bsda6-saeqm-fambt-gp7rn-aynd3-v4oga-dfe24-voedf-mae");
   
    stable let lmem = L.LMem(); 
    let ledger = L.Ledger(lmem, "f54if-eqaaa-aaaaq-aacea-cai");
    
    ledger.onReceive(func (t) {
        ignore ledger.send({ to = {owner=test_owner; subaccount=null}; amount = t.amount; from_subaccount = t.to.subaccount; });
    });
    

    system func postupgrade() { ledger.start(this) };

    public query func get_errors() : async [Text] { 
        ledger.get_errors();
    };

    public query func de_bug() : async Text {
        ledger.de_bug();
    };


}