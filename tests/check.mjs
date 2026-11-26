// Optional development runner. The browser app does not depend on Node.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {runTests} from './domain.mjs';
import {messages} from '../src/locales.mjs';
import {validateCatalog,validateDataset} from '../src/validate.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const json=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const results=runTests();
for(const result of results)console.log((result.ok?'PASS ':'FAIL ')+result.name+(result.error?': '+result.error:''));
if(results.some(x=>!x.ok))process.exitCode=1;
const manifest=json(path.join(root,'vendor/manifest.json'));
for(const file of manifest.files){
  const data=fs.readFileSync(path.join(root,file.path));
  if(data.length!==file.bytes||createHash('sha256').update(data).digest('hex')!==file.sha256)throw new Error('Vendor checksum mismatch: '+file.path);
}
const status=json(path.join(root,'i18n-status.json'));
const hash=createHash('sha256').update(JSON.stringify(messages.en)).digest('hex');
if(status.sourceSha256!==hash)throw new Error('UI source fingerprint changed: reconcile translations and i18n-status.json');
const content=process.env.ATLAS_CONTENT_DIR || path.resolve(root,'../people-atlas-content');
if(fs.existsSync(path.join(content,'catalog.json'))){
  const catalog=validateCatalog(json(path.join(content,'catalog.json')));
  const records=validateDataset(json(path.join(content,catalog.categories)),catalog.collections.flatMap(f=>json(path.join(content,f))));
  console.log('PASS companion content: '+records.people.length+' people');
}
console.log('PASS vendor checksums and UI translation fingerprint');
