import {Timeline} from '../vendor/vis/timeline.mjs';
import moment from '../vendor/moment/moment.js';
import {dateForYear, yearForDate, formatYear, interval, lifespan, MIN_YEAR, MAX_YEAR, stateUrl} from './domain.mjs';

export class PeopleTimeline {
  constructor(container, people, state, onRange) {
    this.container = container;
    this.people = people;
    this.state = state;
    const {items,groups} = this.data(state.years);
    this.groupIds=groups.map(g=>g.id).join(',');
    this.timeline = new Timeline(container,items,groups,{
      height:'100%', min:dateForYear(MIN_YEAR), max:dateForYear(MAX_YEAR,true),
      start:dateForYear(state.years[0]),end:dateForYear(state.years[1],true),
      showCurrentTime:false, orientation:{axis:'top',item:'top'}, stack:false, groupOrder:'order',
      verticalScroll:true, horizontalScroll:false, zoomKey:'ctrlKey', zoomMin:1000*60*60*24*365*4,
      moveable:true, zoomable:true, editable:false, selectable:false,
      margin:{item:{horizontal:0,vertical:9},axis:12}, showMajorLabels:false,
      moment:value=>moment.utc(value), tooltip:{followMouse:false,delay:350},
      format:{minorLabels:(date,scale)=>scale === 'year' || moment.utc(date).month() === 0 ? formatYear(yearForDate(Number(date)),state.language) : '',majorLabels:()=>''},
      groupHeightMode:'auto'
    });
    this.timeline.on('click', event=>{
      if (!event.item) return;
      // The app handles navigation; retain one source of URL state.
      container.dispatchEvent(new CustomEvent('personselect',{bubbles:true,detail:String(event.item)}));
    });
    this.timeline.on('rangechanged',event=>{
      if (event.byUser) onRange([yearForDate(event.start),yearForDate(event.end)]);
    });
    // ResizeObserver is available in supported browsers. No polling or animation loop.
    this.observer = new ResizeObserver(()=>this.timeline.redraw());
    this.observer.observe(container);
  }
  data(years) {
    const items=[],groups=[],state=this.state;
    for (const [index,person] of this.people.entries()) {
      const span=interval(person);
      if(!span || span.start>years[1] || span.end<years[0])continue;
      const label=document.createElement('a');
      label.className='person-label';label.href=stateUrl({...state,person:person.id});label.dataset.person=person.id;
      const name=document.createElement('strong');name.textContent=person.name;
      const dates=document.createElement('span');dates.textContent=lifespan(person,state.language);
      label.append(name,dates);groups.push({id:person.id,content:label,order:index});
      const item=document.createElement('span');item.textContent=person.name;
      const title=document.createElement('span');title.textContent=person.name+' · '+lifespan(person,state.language);
      items.push({id:person.id,group:person.id,content:item,start:dateForYear(span.start),end:dateForYear(span.end,true),type:'range',
        className:(span.uncertain?'uncertain ':'')+(person.status==='living'?'living':''),title:title.innerHTML});
    }
    return {items,groups};
  }
  setYears(years, moveWindow=true) {
    this.state={...this.state,years};
    const {items,groups}=this.data(years),ids=groups.map(g=>g.id).join(',');
    if(ids!==this.groupIds){
      this.timeline.setItems(items);this.timeline.setGroups(groups);this.groupIds=ids;
    }
    if(moveWindow)this.timeline.setWindow(dateForYear(years[0]),dateForYear(years[1],true),{animation:false});
  }
  destroy() { this.observer.disconnect(); this.timeline.destroy(); }
}
