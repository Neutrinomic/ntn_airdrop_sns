import L "mo:devefi-icrc-ledger";
import Principal "mo:base/Principal";
import Blob "mo:base/Blob";
import Float "mo:base/Float";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import I "mo:itertools/Iter";
import Nat8 "mo:base/Nat8";
import Nat64 "mo:base/Nat64";
import Array "mo:base/Array";

actor class() = this {
    type AirdropTarget = (Nat, Principal, ?Blob);

    var airdrop_total : Nat = 0;
    var airdrop_accounts : [AirdropTarget] = [];
    var blacklisted_amount : Nat = 0;

    let fee = 10_000; //TODO: Put getFee func inside library

    stable let lmem = L.LMem(); 
    let ledger = L.Ledger(lmem, "f54if-eqaaa-aaaaq-aacea-cai", #last);
    
    ledger.onReceive(func (t) {
        if (t.amount < 1_0000_0000) return;
        label sendloop for ((share, owner, subaccount) in airdrop_accounts.vals()) {
            // PROD:
            // let amount = t.amount * share / airdrop_total; // both coins are 8 decimals so no prob here
            // if (amount < fee*2) continue sendloop;
            // TEST:
            let amount = 20000;
            ignore ledger.send({ to = {owner; subaccount}; amount = amount; from_subaccount = t.to.subaccount; });
        }
    });
    
    ledger.start();

    var blacklisted : [Principal] = [];

    public shared({caller}) func start() : async () {
        assert(Principal.isController(caller));
        ledger.setOwner(this);
    };

    public shared({caller}) func set_blacklisted(bl : [Principal]) : async () {
        assert(Principal.isController(caller));
        assert(Array.size(blacklisted) == 0); // can't be set again
        blacklisted := bl;
    };

    public query func get_blacklisted() : async [Principal] {
        blacklisted;
    };

    public shared({caller}) func import_drop_targets(targets : [AirdropTarget]) : async () {
        assert(Principal.isController(caller));
        assert(Array.size(airdrop_accounts) == 0); // can't be set again

        airdrop_accounts := Array.filter<AirdropTarget>(targets, func((_, owner, _)) = Array.indexOf<Principal>(owner, blacklisted, Principal.equal) == null );
        airdrop_total := Array.foldRight<AirdropTarget, Nat>(airdrop_accounts, 0, func((share, _, _), acc) = share + acc);
        blacklisted_amount :=  Array.foldRight<AirdropTarget, Nat>(targets, 0, func((share, _, _), acc) = share + acc) - airdrop_total;
    };

    public query func get_amounts() : async {airdrop:Nat; blacklisted:Nat; total_accounts:Nat} {
        {airdrop = airdrop_total; blacklisted = blacklisted_amount; total_accounts = Array.size(airdrop_accounts)};
    };

    public func export_drop_targets() : async [AirdropTarget] {
        airdrop_accounts;
    };

    public query func getInfo() : async L.Info { 
        ledger.getInfo();
    };

    public query func getErrors() : async [Text] {
        ledger.getErrors();
    };


}