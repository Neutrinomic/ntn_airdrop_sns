export const idlFactory = ({ IDL }) => {
  const AirdropTarget = IDL.Tuple(
    IDL.Nat,
    IDL.Principal,
    IDL.Opt(IDL.Vec(IDL.Nat8)),
  );
  const Info = IDL.Record({
    'pending' : IDL.Nat,
    'last_indexed_tx' : IDL.Nat,
    'errors' : IDL.Nat,
    'lastTxTime' : IDL.Nat64,
    'accounts' : IDL.Nat,
    'actor_principal' : IDL.Opt(IDL.Principal),
    'reader_instructions_cost' : IDL.Nat64,
    'sender_instructions_cost' : IDL.Nat64,
  });
  const anon_class_12_1 = IDL.Service({
    'export_drop_targets' : IDL.Func([], [IDL.Vec(AirdropTarget)], []),
    'getErrors' : IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
    'getInfo' : IDL.Func([], [Info], ['query']),
    'get_amounts' : IDL.Func(
        [],
        [
          IDL.Record({
            'total_accounts' : IDL.Nat,
            'airdrop' : IDL.Nat,
            'blacklisted' : IDL.Nat,
          }),
        ],
        ['query'],
      ),
    'get_blacklisted' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'giveback' : IDL.Func([], [], []),
    'import_drop_targets' : IDL.Func([IDL.Vec(AirdropTarget)], [], []),
    'set_blacklisted' : IDL.Func([IDL.Vec(IDL.Principal)], [], []),
    'start' : IDL.Func([], [], []),
  });
  return anon_class_12_1;
};
export const init = ({ IDL }) => {
  return [IDL.Record({ 'ledgerId' : IDL.Principal })];
};
