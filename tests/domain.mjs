import {dateForYear,yearForDate,formatYear,formatDate,interval,selectPeople,expandCategories,readState,stateUrl,fitYears} from '../src/domain.mjs';
import {validateCatalog,validateDataset,safeUrl,contentUrl} from '../src/validate.mjs';
import {messages} from '../src/locales.mjs';

// Explicitly synthetic fixtures. No historical content belongs in this repository.
const categories=[
  {id:'science',parent:null,icon:'science',name:{de:'Wissenschaft',en:'Science'},description:{de:'Test',en:'Test'}},
  {id:'math',parent:'science',icon:'mathematics',name:{de:'Mathematik',en:'Mathematics'},description:{de:'Test',en:'Test'}},
  {id:'philosophy',parent:null,icon:'philosophy',name:{de:'Philosophie',en:'Philosophy'},description:{de:'Test',en:'Test'}}
];
const person=(id,birth,death,cats)=>({id,name:id==='test-one'?'Émilie Test':'Example '+id,aliases:[],categories:cats,
  birth:{year:birth,precision:'year'},death:{year:death,precision:'year'},status:'deceased',
  summary:{de:'Testperson',en:'Synthetic person'},biography:{de:'Testdatensatz.',en:'Synthetic fixture.'},
  highlights:[],sources:[{title:'Synthetic test URL',url:'https://example.org/source'}]});
const people=[person('test-one',-100,10,['math','philosophy']),person('test-two',1,80,['philosophy']),person('test-three',1900,1980,['math'])];
const eq=(a,b)=>{if(JSON.stringify(a)!==JSON.stringify(b))throw new Error(JSON.stringify(a)+' !== '+JSON.stringify(b));};
const assert=value=>{if(!value)throw new Error('Assertion failed');};
const rejects=fn=>{let failed=false;try{fn();}catch{failed=true;}assert(failed);};
export function runTests(){
  const results=[];
  const test=(name,fn)=>{try{fn();results.push({name,ok:true});}catch(error){results.push({name,ok:false,error:error.message});}};
  test('Category union does not duplicate people',()=>eq(selectPeople(people,categories,['math','philosophy']).map(p=>p.id),['test-one','test-two','test-three']));
  test('Parents include descendants without duplicate assignments',()=>eq(selectPeople(people,categories,['science']).map(p=>p.id),['test-one','test-three']));
  test('Empty selection means empty results',()=>eq(selectPeople(people,categories,[]),[]));
  test('Search handles diacritics and all terms',()=>eq(selectPeople(people,categories,['math'],'emilie test','en').map(p=>p.id),['test-one']));
  test('Civil years round-trip, including BCE and years 1–99',()=>{for(const year of [-10000,-100,-2,-1,1,2,10,99,100,1900,2200])eq(yearForDate(dateForYear(year)),year);});
  test('1 BCE is followed by 1 CE with no year zero',()=>{eq(dateForYear(-1).getUTCFullYear(),0);eq(dateForYear(1).getUTCFullYear(),1);eq(formatYear(-1,'en'),'1 BCE');});
  test('Uncertain dates retain their qualification',()=>{eq(formatDate({precision:'approximate',year:370},'de'),'ca. 370');eq(formatDate({precision:'range',earliest:350,latest:370},'en'),'350–370');});
  test('Living status has an open end; unknown dates are not fabricated',()=>{
    eq(interval({...people[2],status:'living',death:null},2026).end,2026);
    eq(interval({...people[0],birth:{precision:'unknown'}}),null);
  });
  test('Bounded dates use their outer limits',()=>eq(interval({...people[0],birth:{precision:'range',earliest:-120,latest:-100}}).start,-120));
  test('URLs restore independent category, query, person, view and theme state',()=>{
    const state={view:'timeline',language:'en',categories:['math','philosophy'],query:'A & B',years:[-400,1950],person:'test-one',theme:'dark',display:'list'};
    eq(readState(stateUrl(state,'https://example.org/people/').href,categories),state);
  });
  test('Unsupported languages, categories and invalid ranges are handled',()=>{
    const state=readState('https://example.org/?lang=xx&categories=missing,math&from=0&to=100',categories);
    eq(state.language,'de');eq(state.categories,['math']);eq(state.years,null);
  });
  test('Normal datasets validate',()=>eq(validateDataset(categories,people).people.length,3));
  test('Duplicate IDs and dangling categories are rejected',()=>{
    rejects(()=>validateDataset(categories,[...people,people[0]]));
    rejects(()=>validateDataset(categories,[{...people[0],categories:['missing']}]));
  });
  test('Invalid dates and reversed lifespans are rejected',()=>{
    rejects(()=>validateDataset(categories,[person('zero',0,100,['math'])]));
    rejects(()=>validateDataset(categories,[person('reverse',200,100,['math'])]));
  });
  test('Category cycles are rejected and expansion terminates',()=>{
    const cycle=categories.map(c=>({...c,parent:c.id==='science'?'math':c.parent}));
    rejects(()=>validateDataset(cycle,people));eq([...expandCategories(['science'],cycle)],['science','math']);
  });
  test('Malformed records and executable source links are rejected',()=>{
    rejects(()=>validateDataset(categories,[{...people[0],sources:[{title:'bad',url:'javascript:alert(1)'}]}]));
    rejects(()=>validateDataset(categories,[{...people[0],biography:{en:'Missing German'}}]));
  });
  test('Content paths cannot escape the configured collection',()=>{
    eq(contentUrl('people/modern.json','https://example.org/data/catalog.json'),'https://example.org/data/people/modern.json');
    for(const path of ['../secret','/absolute','https://evil.test/x','%2e%2e/secret','file.json?other','x\\y'])rejects(()=>contentUrl(path,'https://example.org/catalog.json'));
    rejects(()=>safeUrl('javascript:alert(1)'));rejects(()=>safeUrl('https://user:password@example.org'));
  });
  test('Catalogue version mismatches are rejected',()=>rejects(()=>validateCatalog({schemaVersion:'99.0.0'})));
  test('Translation keys and interpolation placeholders match',()=>{
    eq(Object.keys(messages.en).sort(),Object.keys(messages.de).sort());
    for(const key of Object.keys(messages.en))eq((messages.en[key].match(/\{[^}]+\}/g)??[]).sort(),(messages.de[key].match(/\{[^}]+\}/g)??[]).sort());
  });
  test('Fit range contains every plottable lifespan',()=>{const [from,to]=fitYears(people);assert(from<=-100&&to>=1980);assert(from!==0&&to!==0);});
  return results;
}
