import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type AirdropTarget = [bigint, Principal, [] | [Uint8Array | number[]]];
export interface Info {
  'pending' : bigint,
  'last_indexed_tx' : bigint,
  'errors' : bigint,
  'lastTxTime' : bigint,
  'accounts' : bigint,
  'actor_principal' : [] | [Principal],
  'reader_instructions_cost' : bigint,
  'sender_instructions_cost' : bigint,
}
export interface anon_class_12_1 {
  'export_drop_targets' : ActorMethod<[], Array<AirdropTarget>>,
  'getErrors' : ActorMethod<[], Array<string>>,
  'getInfo' : ActorMethod<[], Info>,
  'get_amounts' : ActorMethod<
    [],
    { 'total_accounts' : bigint, 'airdrop' : bigint, 'blacklisted' : bigint }
  >,
  'get_blacklisted' : ActorMethod<[], Array<Principal>>,
  'giveback' : ActorMethod<[], undefined>,
  'import_drop_targets' : ActorMethod<[Array<AirdropTarget>], undefined>,
  'set_blacklisted' : ActorMethod<[Array<Principal>], undefined>,
  'start' : ActorMethod<[], undefined>,
}
export interface _SERVICE extends anon_class_12_1 {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: ({ IDL }: { IDL: IDL }) => IDL.Type[];
