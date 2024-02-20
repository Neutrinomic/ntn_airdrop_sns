import icblast, {toState, fileIdentity} from "@infu/icblast";
import Principal from "@dfinity/principal";
import {readFileSync} from "fs";


function ps(t) {
    if (t == "") return null;
     return t.split(",").map(x => parseInt(x.trim(),10));
  }

  function parseCSVLine(line) {
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

let identity = fileIdentity(5);
console.log(identity.getPrincipal().toText())
let ic = icblast({identity});

let user = await ic("66xzk-cqaaa-aaaal-qdfoa-cai");

let blacklist = [
    "3ejs3-eaaaa-aaaag-qbl2a-cai",
    "yv4mw-giaaa-aaaag-qcqjq-cai",
    "nx2w3-maaaa-aaaag-qcaqq-cai",
    "ob7gr-mqaaa-aaaag-qclja-cai",
    "p4xq4-gyaaa-aaaag-qchbq-cai",
    "32fn4-qqaaa-aaaak-ad65a-cai",
    "3xwpq-ziaaa-aaaah-qcn4a-cai"
    ];
await user.set_blacklisted(blacklist);


let dropsCSV = readFileSync("./drop_targets.csv", "utf-8");
let drops = dropsCSV.split("\n").map(x => parseCSVLine(x).map(x => x.trim())).map( ([a,b,c]) => ([a, ps(b.replaceAll('"','')), parseInt(c, 10)]));

//@ts-ignore
let ndrops = drops.map( ([a,b,c]) => ([parseInt(c, 10), a, b]));

//@ts-ignore
await user.import_drop_targets(ndrops);

let r = await user.export_drop_targets();

console.log(toState(r));

await user.start();