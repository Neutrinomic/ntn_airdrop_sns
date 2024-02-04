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

    //--- Test only
    let test_owner = Principal.fromText("vwng4-j5dgs-e5kv2-ofyq2-hc4be-7u2fn-mmncn-u7dhj-nzkyq-vktfa-xqe");
    private func test_subaccount(n:Nat64) : ?Blob {
        ?Blob.fromArray(Iter.toArray(I.pad<Nat8>( Iter.fromArray(ENat64(n)), 32, 0 : Nat8)));
    };

    private func ENat64(value : Nat64) : [Nat8] {
        return [
            Nat8.fromNat(Nat64.toNat(value >> 56)),
            Nat8.fromNat(Nat64.toNat((value >> 48) & 255)),
            Nat8.fromNat(Nat64.toNat((value >> 40) & 255)),
            Nat8.fromNat(Nat64.toNat((value >> 32) & 255)),
            Nat8.fromNat(Nat64.toNat((value >> 24) & 255)),
            Nat8.fromNat(Nat64.toNat((value >> 16) & 255)),
            Nat8.fromNat(Nat64.toNat((value >> 8) & 255)),
            Nat8.fromNat(Nat64.toNat(value & 255)),
        ];
    };

    let airdrop_accounts : [(Float, Principal, ?Blob)] = [
        (0.01, test_owner, null),
        (0.30, test_owner, test_subaccount(1)),
        (0.15, test_owner, test_subaccount(2)),
        (0.14, test_owner, test_subaccount(3)),
        (0.05, test_owner, test_subaccount(4)),
        (0.05, test_owner, test_subaccount(5)),
        (0.05, test_owner, test_subaccount(6)),
        (0.05, test_owner, test_subaccount(7)),
        (0.05, test_owner, test_subaccount(8)),
        (0.05, test_owner, test_subaccount(9)),
        (0.05, test_owner, test_subaccount(10)),
        (0.05, test_owner, test_subaccount(11)),
        (0.05, test_owner, test_subaccount(12)),
    ];

    let fee = 10_000; //TODO: Put getFee func inside library
    //---

    stable let lmem = L.LMem(); 
    let ledger = L.Ledger(lmem, "f54if-eqaaa-aaaaq-aacea-cai");
    
    ledger.onReceive(func (t) {
        label sendloop for ((share, owner, subaccount) in airdrop_accounts.vals()) {
            let amount = Int.abs(Float.toInt( Float.fromInt(t.amount) * share ));
            if (amount < fee*2) continue sendloop;
            ignore ledger.send({ to = {owner; subaccount}; amount = amount; from_subaccount = t.to.subaccount; });
        }
    });
    
    //---

    system func postupgrade() { ledger.start(this) };

    public query func get_errors() : async [Text] { 
        ledger.get_errors();
    };

    public query func de_bug() : async Text {
        ledger.de_bug();
    };


}