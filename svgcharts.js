class Doughnut extends HTMLElement {
    constructor(){
        super();
        this.duration=500;
        this.formatnumbers=false;
        this.mapper=Doughnut.defaultmapper;
        this._data=Doughnut.defval;
        this._layout={c:'column',l:'row'};
        this._filters=[];
        this._listeners=[];
        this._aid;
    }
    static defval=[];
    static styles=`
        .svg-checkbox {
            display: inline-block;
            width: 12px;
            height: 12px;
            cursor: pointer;
            border-radius: 2px;
            transition: background 0.2s;
        }
        .svg-checkbox:hover {
            background: rgba(255, 255, 255, 0.05);
        }
        .svg-checkbox svg {
            width: 100%;
            height: 100%;
            display: block;
        }
        .svg-checkbox path {
            pointer-events: none;
            transition: d 0.5s cubic-bezier(0.4, 0, 0.2, 1), fill 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            d: path("M 19 2 L 5 2 A 3 3 0 0 0 2 5 L 2 19 A 3 3 0 0 0 5 22 L 19 22 A 3 3 0 0 0 22 19 L 22 5 A 3 3 0 0 0 19 2 Z M 6 19 C 5.735 19 5.48 18.895 5.293 18.707 C 5.105 18.52 5 18.265 5 18 L 5 6 C 5 5.735 5.105 5.48 5.293 5.293 C 5.48 5.105 5.735 5 6 5 L 18 5 C 18.265 5 18.52 5.105 18.707 5.293 C 18.895 5.48 19 5.735 19 6 L 19 18 C 19 18.265 18.895 18.52 18.707 18.707 C 18.52 18.895 18.265 19 18 19 L 6 19 Z");
            fill: #7f7f7f;
        }
        .svg-checkbox.checked path {
            d: path("M 19 2 L 5 2 A 3 3 0 0 0 2 5 L 2 19 A 3 3 0 0 0 5 22 L 19 22 A 3 3 0 0 0 22 19 L 22 5 A 3 3 0 0 0 19 2 Z M 10 17 C 9.167 16.167 8.333 15.333 7.5 14.5 C 6.667 13.667 5.833 12.833 5 12 L 7.01 9.99 C 7.508 10.488 8.007 10.987 8.505 11.485 C 9.003 11.983 9.502 12.482 10 12.98 L 17.59 5.39 C 17.925 5.725 18.26 6.06 18.595 6.395 C 18.93 6.73 19.265 7.065 19.6 7.4 L 17.2 9.8 C 16.4 10.6 15.6 11.4 14.8 12.2 C 14 13 13.2 13.8 12.4 14.6 L 10 17 Z");
            fill: var(--color-checked);
        }
        .svg-checkbox:not(.checked) ~ .diagram-label-label {
            text-decoration: line-through;
        }
        .svg-checkbox:not(.checked) ~ .diagram-label-count {
            text-decoration: line-through;
        }

        .diagram {
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
            min-width: 0;
        }
        .diagram-svg {
            flex: 2;
            pointer-events: all;
            min-width: 0;
        }
        .diagram-center {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            pointer-events: none;
        }
        .diagram-center-text {
            flex: 1;
            width:100%;
            height:100%;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
        }

        .diagram-labels-group-container {
            flex: 1;
            display: flex;
            flex-direction: row;
            height:100%;
            gap: 4px;
            min-width: 0;
            overflow: hidden;
        }
        .diagram-labels-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            min-width: 0;
            overflow: hidden;
        }
        .diagram-label-container {
            display: flex;
            flex-direction: row;
            align-items: center;
            width:100%;
        }

        .diagram-labels-group {
            text-align: center;
        }
        
        .diagram-labels-scrollable {
            display: flex;
            flex-direction: column;
            min-height: 50px;
            height: 100%;
            flex: 1 1 0;
            overflow-y: auto;
        }

        .diagram-labels-scrollable::-webkit-scrollbar { width: 6px; height: 6px; }
        .diagram-labels-scrollable::-webkit-scrollbar-track { background: #00000000; }
        .diagram-labels-scrollable::-webkit-scrollbar-thumb { background: #808080; border-radius: 3px; }
        .diagram-labels-scrollable::-webkit-scrollbar-thumb:hover { background: #3d3d3d; }

        .diagram-labels-total {
            display: flex;
            flex-direction: row;
            align-items: center;
            border: grey;
            border-top-width:1px;
            border-top-style: solid
        }
        .diagram-labels-total-label {
            flex: 1;
        }
        .diagram-labels-total-count {
            min-width: 24px;
            text-align: right;
            font-variant-numeric: tabular-nums;
        }
        
        .diagram-label-checkbox {
            width: 16px;
            height: 16px;
            margin: 0px;
            flex-shrink: 0;
        }
        .diagram-label-label {
            flex: 1;
            margin: 0px 0px 0px 4px;
            min-width: 0;
            display: inline-block;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
        }
        .diagram-label-count {
            min-width: 24px;
            text-align: right;
            font-variant-numeric: tabular-nums;
        }
    `;
    
    static array2color(alpha=true,prefix='#',padsl=2,padsc='0',delim='',suffix=''){ 
        return prefix+this.map((e,i)=>Math.floor(i<3 ? e : e*255).toString(16).padStart(padsl,padsc)).filter((_,i)=>alpha || i<3).join(delim)+suffix;
    }
    static addproperty(obj,key,value){ obj[key]=value; return obj; }
    static defaultmapper(data,filters){
        return data.map((g,j)=>g.map((e,i)=>filters.some((f)=>f.g===e.g && f.i===i) ? {...e,v:0,lv:e.v} : e));
    }
    static fcount(num,format=true){
        if(format && typeof num === 'number' && Number.isFinite(num)){
            const suffixes=['K','M','T','P']; var suffix='';
            for(let i=0;i<suffixes.length && num>1000;i++){
                num=num/1000; suffix=suffixes[i];
            }
            return num.toFixed(num>99 ? 0 : num>9 ? 1 : 2)+suffix;
        }else{
            return num;
        }
    }
    
    mouseover=(e)=>this.rendercentertext(true,e.target);
    mouseout=(e)=>this.rendercentertext(false,e.target);
    onclick=(e)=>this._listeners.forEach((l)=>l(e.target.data));
    change=(e)=>this.changed(e.target);
    changed(c){
        c.classList.toggle('checked');
        if(c.classList.contains('checked')){
            this._filters=this._filters.filter((e)=>e.g!=c.g || e.i!=c.i);
        }else{
            this._filters=this._filters.concat([{g:c.g,i:c.i,l:c.l}]);
        }
        this.render(this.mapper(this._data,this._filters),false);
    };

    static get observedAttributes() { return []; }
    get data(){
        return this._data;
    }

    set data(value){
        this.render(this.mapper(this._data=value,[]),true);
        this._filters=[];
    }

    layout(common,labels){
        this._layout={c:common==='row' ? 'row' : 'column',l:labels==='column' ? 'column' : 'row'};
    }

    addListener(l){
        const index=typeof l === 'function' ? this._listeners.indexOf(l) : 0;
        if(index===-1){this._listeners.push(l);}
    }
    removeListener(l){
        const index=this._listeners.indexOf(l);
        if(index!==-1){this._listeners.splice(index,1);}
    }
    
    removeEventListeners(){
        this.querySelectorAll('path').forEach((e)=>{
            e.removeEventListener('mouseover',this.mouseover);
            e.removeEventListener('mouseout',this.mouseout);
            e.removeEventListener('click',this.onclick);
        });
    }

    addEventListeners(){
        this.querySelectorAll('path').forEach((e)=>{
            e.addEventListener('mouseover',this.mouseover);
            e.addEventListener('mouseout',this.mouseout);
            e.addEventListener('click',this.onclick);
        });
    }

    connectedCallback() {

    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
        }
    }

    build(groups,layoutcommon='column',layoutlabels='row',checkboxes=true,clear=true){
        function element(ns,type,attrs,inner){
            const n=({'svg':'http://www.w3.org/2000/svg','html':'http://www.w3.org/1999/xhtml','mathml':'http://www.w3.org/1998/Math/MathML'});
            const e=document.createElementNS(n[ns] ?? n['html'],type);
            if(attrs){Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));}
            if(inner){if(typeof inner === 'string'){e.innerHTML=inner;}else if(Array.isArray(inner)){inner.forEach((el)=>e.appendChild(el));}else{e.append(inner);}}
            return e;
        }
        if(!document.head.querySelector('#svgcharts')){
            document.head.appendChild(element(null,'style',{"id":"svgcharts"},Doughnut.styles));
        }
        
        this.setAttribute("class","diagram");

        if(this.svg===undefined){
            this.svg = element('svg','svg',{"class":"diagram-svg","width":"100%","height":"100%","viewBox":"-110 -110 220 220","role":"img"});
            this.svgf = element('svg','foreignObject',{"class":"diagram-center","direction":"inherit","dx":"0","x":"-50","y":"-50","width":"100","height":"100"},this.svgc=element(null,"span",{"class":"diagram-center-text"},'No data'));
            this.appendChild(this.svg);
        }
        if(this.cl===undefined){
            this.appendChild(this.cl = element(null,'div',{"class":"diagram-labels-group-container"}));
        }
        
        while(this.svg.querySelectorAll('g').length<groups.length){
            this.svg.appendChild(element('svg','g',{"n":this.svg.querySelectorAll('g').length}));
        }
        while(this.cl.querySelectorAll('div.diagram-labels-container').length<groups.length){
            this.cl.appendChild(
                element(null,'div',{"class":"diagram-labels-container","n":this.cl.querySelectorAll('div.diagram-labels-container').length},[
                    element(null,'div',{"class":"diagram-labels-group"}),
                    element(null,'div',{"class":"diagram-labels-scrollable"}),
                    element(null,'div',{"class":"diagram-labels-total"},[
                        element(null,'div',{"class":"diagram-labels-total-label"},'Total:'),
                        element(null,'div',{"class":"diagram-labels-total-count"})
                    ])
                ])
            );
        }
        if(clear){
            Array.from(this.svg.querySelectorAll('.diagram-label-checkbox')).forEach((e)=>e.removeEventListener('click',this.change));
            Array.from(this.svg.querySelectorAll('.diagram-label-label')).forEach((e)=>e.removeEventListener('click',this.onclick));
            Array.from(this.svg.querySelectorAll('g')).filter((_,i)=>i>=groups.length).forEach((e)=>this.svg.removeChild(e));
            Array.from(this.cl.querySelectorAll('.diagram-labels-container')).filter((_,i)=>i>=groups.length).forEach((e)=>this.cl.removeChild(e));
        }
        
        groups.forEach((g,j)=>{
            const sum=g.reduce((s,e)=>s+e.v,0);
            const group=this.svg.querySelector(`g[n="${j}"]`);
            const gclabel=this.cl.querySelector(`.diagram-labels-container[n="${j}"]`);
            const gcg=gclabel.querySelector('.diagram-labels-group');
            const gcs=gclabel.querySelector('.diagram-labels-scrollable');
            const gct=gclabel.querySelector('.diagram-labels-total-count');
            gcg.innerHTML=g[0]?.g ?? '';
            gct.innerHTML=Doughnut.fcount(sum,this.formatnumbers);
            while(group.childElementCount<g.length){
                group.appendChild(element('svg','path',{"class":"segment","style":"fill: rgb(127, 127, 127); padding: 0px; stroke: rgb(0, 0, 0); stroke-width: 0;"}));
            }
            while(gcs.childElementCount<g.length){
                const checkbox = element('svg','svg',{"class":"svg-checkbox diagram-label-checkbox","viewBox":"2 2 20 20"},'<path/>');
                checkbox.classList.add('checked');
                checkbox.addEventListener('click',this.change);
                gcs.appendChild(
                    element(null,'div',{"class":"diagram-label-container"},[
                        checkbox,
                        element(null,'div',{"class":"diagram-label-label"}),
                        element(null,'div',{"class":"diagram-label-count"})
                    ])
                );
            }
            while(clear && group.childElementCount>g.length){
                group.removeChild(group.lastChild);
            }
            while(gcs.childElementCount>g.length){
                gcs.removeChild(gcs.lastChild);
            }
            Array.from(gcs.children).map((e)=>Array.from(e.children)).forEach((e,i)=>{
                e[0].children.item(0).style.setProperty('--color-checked',g[i].c);
                e[0].i=i;
                e[0].l=i<g.length ? g[i].l : undefined;
                e[0].g=i<g.length ? g[i].g : undefined;
                if(i<g.length){
                    if(typeof g[i].l==='string'){
                        e[1].innerHTML=g[i].l;
                    }else{
                        e[1].replaceChildren(g[i].l);
                    }
                }else{
                    e[1].innerHTML=''
                }
                e[1].data=g[i];
                e[1].addEventListener('click',this.onclick);
                e[2].innerHTML=Doughnut.fcount(i<g.length ? g[i].lv ?? g[i].v : '',this.formatnumbers);
            });

        });
        if(checkboxes){
            Array.from(this.querySelectorAll('.diagram-label-checkbox')).forEach((e)=>e.classList.add('checked'));
        }
        this.svg.appendChild(this.svgf);
        this.style.flexDirection=layoutcommon;
        this.querySelector('.diagram-labels-group-container').style.flexDirection=layoutlabels;
    }

    
    render(ns,cb=false,animate=true){
        cancelAnimationFrame(this._aid);
        ns.forEach((g)=>Array.isArray(g) && g.forEach((e)=>Object.defineProperty(e.c,'toString',{value:Doughnut.array2color})));
        this.removeEventListeners();
        this.build(ns,this._layout.c,this._layout.l,cb,!animate);
        if(animate && this.duration>0){
            const nps=ns.map((g,i)=>Doughnut.segments(g));
            const ops=Array.from(this.svg.querySelectorAll('g')).map((e)=>Array.from(e.children).map((e)=>e.data).filter((e)=>e)).map((e)=>({s:e.reduce((s,e)=>s+e.v,0),v:e}));
            const cps=Array.from({length:Math.max(nps.length,ops.length)},(_,i)=>({
                o:i<ops.length ? ops[i] : {s:0,v:[]},
                n:i<nps.length ? nps[i] : {s:0,v:[]},
            }));

            const starttime=performance.now(),duration=this.duration,d=this;
            function updatesvg(timestamp){
                const progress=(timestamp-starttime)/duration,interpolated=0.5*(Math.sin((progress-0.5)*Math.PI)+1);
                const ips=cps.map((e)=>Doughnut.intermediate(interpolated,e.o,e.n));
                ips.forEach((e,i)=>d.rendersegments(e,Array.from(d.svg.querySelector(`g[n="${i}"]`).children)));
                const sums=ips.map((e)=>Math.floor(e.s)),sum=sums.length > 0 ? Array.from(new Set(sums)).length > 1 ? sums : [sums[0]] : [];
                d.svgc.innerHTML=sum.map((e)=>Doughnut.fcount(e,d.formatnumbers)).join('</br>');

                if(progress<=1){
                    d._aid=requestAnimationFrame(updatesvg);
                }else{
                    d.render(ns,false,false);
                }
            }
            this._aid=requestAnimationFrame(updatesvg);
        }else{
            const nps=ns.map((g)=>Doughnut.segments(g));
            nps.forEach((e,i)=>this.rendersegments(e,Array.from(this.svg.querySelector(`g[n="${i}"]`).children)));
            const sums=nps.map((e)=>e.s),sum=sums.length > 0 ? Array.from(new Set(sums)).length > 1 ? sums : [sums[0]] : [];
            this.svgc.innerHTML=sum.filter((e)=>e>0).map((e)=>Doughnut.fcount(e,this.formatnumbers)).join('</br>');
            this.addEventListeners();
        }
    }

    rendercentertext(over,selected){
        selected.setAttribute("transform",over ? "scale(1.1,1.1)" : "scale(1,1)");
        const sums=Array.from(this.svg.querySelectorAll('g')).map((g)=>Array.from(g.children).reduce((s,e)=>s+e.data.v,0)).filter((e)=>e>0),sum=sums.length > 0 ? Array.from(new Set(sums)).length > 1 ? sums : [sums[0]] : [];  
        if(over && selected.data){
            const csum=Array.from(selected.parentNode.children).reduce((s,e)=>s+e.data.v,0);
            this.svgc.innerHTML=sum.length>1 ? Doughnut.fcount(selected.data.v,this.formatnumbers)+"</br>"+Doughnut.fcount(csum,this.formatnumbers) : Doughnut.fcount(selected.data.v,this.formatnumbers);
        }else{
            this.svgc.innerHTML=sum.map((e)=>Doughnut.fcount(e,this.formatnumbers)).join('</br>');
        }
    }

    /**
     * @param {Array} v - array of data with properties
     * @returns {Array} calculated parameters of the segments (shift angle and angular arc length)
    */
    rendersegments(s,nodes){
        function update(node,d){
            if(d){
                node.data=d; 
                const p=d.p,svgpath=Doughnut.segment(p.ro,p.ri,p.os,p.oe,p.is,p.ie,p.sa,p.al,p.cw);
                if(node.setPathData){
                    node.setPathData(svgpath);
                }else{
                    node.setAttribute("d",svgpath.join(' '));
                }
                node.style.fill=d.c;
            }
        }
        const se=s.v.length===0 ? 0 : 2*Math.PI;
        nodes.forEach((e,i)=>update(e,i<s.v.length ? s.v[i] : (e.data ? {...e.data,v:0,p:{...e.data.p,sa:e.data.p.sa+se,al:0}} : undefined)));
    }

    static intermediate(p,o,n){
        if(n.s!=undefined || o.s!=undefined){
            const se=o.v.length===0 || n.v.length===0 ? 0 : 2*Math.PI;
            return {
                s:o.s+(n.s-o.s)*p,
                v:Array.from(
                    {length:Math.max(o.v.length,n.v.length)},
                    (e,i)=>({
                        o:i<o.v.length ? o.v[i] : o.length>0 ? {...o.v[0],p:{...o.v[0].p,sa:o.v[0].p.sa+se,al:0}} : {...n.v[i],p:{...n.v[i].p,sa:n.v[0].p.sa+se,al:0}},
                        n:i<n.v.length ? n.v[i] : n.length>0 ? {...n.v[0],p:{...n.v[0].p,sa:n.v[0].p.sa+se,al:0}} : {...o.v[i],p:{...o.v[i].p,sa:o.v[0].p.sa+se,al:0}},
                    })
                ).map((e)=>this.intermediate(p,e.o,e.n))
            };
        }else{
            return {
                v:n.v,
                l:n.l,
                c:Object.defineProperty([0,0,0,0].map((e,i)=>({o:o.c[i] ?? n.c[i] ?? (i<3 ? 127:0.75), n:n.c[i] ?? o.c[i] ?? (i<3 ? 127:0.75)})).map((e)=>e.o+(e.n-e.o)*p),'toString',{value:Doughnut.array2color}),
                g:n.g,
                p:{
                    ro:o.p.ro+(n.p.ro-o.p.ro)*p,
                    ri:o.p.ri+(n.p.ri-o.p.ri)*p,
                    os:o.p.os+(n.p.os-o.p.os)*p,
                    oe:o.p.oe+(n.p.oe-o.p.oe)*p,
                    is:o.p.is+(n.p.is-o.p.is)*p,
                    ie:o.p.ie+(n.p.ie-o.p.ie)*p,
                    sa:o.p.sa+(n.p.sa-o.p.sa)*p,
                    al:o.p.al+(n.p.al-o.p.al)*p,
                    cw:n.p.cw
                }
            };
        }
    }

    /**
     * @param {Array} v - array of data with properties
     * @returns {Array} calculated parameters of the segments (shift angle and angular arc length)
    */
    static segments(v){
        if(Array.isArray(v)){
            const sum = v.reduce((s,e)=>s+e.v,0),pi2=2*Math.PI; let shift=v.length > 0 ? v[0].p.sa : 0,als,sas;
            return {s:sum, v:v.map((e,i,arr)=>{
                als=sum>0 ? i<arr.length-1  ? pi2*e.v/sum : Math.max(i>0 ? pi2+e.p.sa-shift : pi2,0) : 0;
                sas=shift; shift=sas+als; if(0<als && e.p.pa<als && als<pi2){als=als-e.p.pa; sas=sas+e.p.pa/2;}
                return {...e,p:{...e.p,sa:sas,al:als}}
            })};
        }else{
            return {s:0,v:[]};
        }
    }

    /**
     * @param {number} ro  - Outer segment radius
     * @param {number} ri  - Inner segment radius
     * @param {number} os  - border outer start radius
     * @param {number} oe  - border outer end   radius
     * @param {number} is  - border inner start radius
     * @param {number} ie  - border inner end   radius
     * @param {number} sa - shift angel
     * @param {number} al - angular arc length (angular length | angel of segment)
     * @param {boolean} cw - cw
     * @returns {string} svg path
    */
    static segment(ro,ri,os,oe,is,ie,sa,al,cw=false){
        let svg;
        if(Math.abs(al)>=Math.PI*2){
            svg=[
                {
                    'x':ro*Math.sin(sa),
                    'y':ro*Math.cos(sa),
                    'type': 'M'
                },
                {
                    'rx':ro,
                    'ry':ro,
                    'xr':0,
                    'laf':1,
                    'sf':0,
                    'x':ro*Math.sin(sa+Math.PI),
                    'y':ro*Math.cos(sa+Math.PI),
                    'type': 'A'
                },
                {
                    'rx':ro,
                    'ry':ro,
                    'xr':0,
                    'laf':1,
                    'sf':0,
                    'x':ro*Math.sin(sa),
                    'y':ro*Math.cos(sa),
                    'type': 'A'
                },
                {
                    'type': 'Z'
                },
                {
                    'x':ri*Math.sin(sa),
                    'y':ri*Math.cos(sa),
                    'type': 'M'
                },
                {
                    'rx':ri,
                    'ry':ri,
                    'xr':0,
                    'laf':1,
                    'sf':1,
                    'x':ri*Math.sin(sa+Math.PI),
                    'y':ri*Math.cos(sa+Math.PI),
                    'type': 'A'
                },
                {
                    'rx':ri,
                    'ry':ri,
                    'xr':0,
                    'laf':1,
                    'sf':1,
                    'x':ri*Math.sin(sa),
                    'y':ri*Math.cos(sa),
                    'type': 'A'
                },
                {
                    'type': 'Z'
                }
            ];
        } else {
            const ros=Math.sqrt(ro*ro-2*ro*os);
            const roe=Math.sqrt(ro*ro-2*ro*oe);
            const ris=Math.sqrt(ri*ri+2*ri*is);
            const rie=Math.sqrt(ri*ri+2*ri*ie);
            const tda=Math.tan(al),tos=os/ros,toe=oe/roe,tis=is/ris,tie=ie/rie;
            const ctda=-1/tda,ctos=-1/tos,ctoe=-1/toe,ctis=-1/tis,ctie=-1/tie;
            const aos=Math.atan(tos),aoe=Math.atan(toe), ais=Math.atan(tis),aie=Math.atan(tie);
            const ato=aos+aoe, ati=ais+aie;
            svg = [
                {
                    'x':ros*Math.sin(sa),
                    'y':ros*Math.cos(sa),
                    'type': 'M'
                },
                {
                    'rx':os,
                    'ry':os,
                    'xr':0,
                    'laf':0,
                    'sf':0,
                    'x':ro/(ro-os)*(ros*Math.sin(sa)+os*Math.cos(sa)),
                    'y':ro/(ro-os)*(ros*Math.cos(sa)-os*Math.sin(sa)),
                    'type': 'A'
                },
                {
                    'rx':ro,
                    'ry':ro,
                    'xr':0,
                    'laf': Math.max(al-ato,0) > Math.PI ? 1 : 0,
                    'sf':0,
                    'x':ro/(ro-oe)*(roe*Math.sin(sa+al)-oe*Math.cos(sa+al)),
                    'y':ro/(ro-oe)*(roe*Math.cos(sa+al)+oe*Math.sin(sa+al)),
                    'type': 'A'
                },
                {
                    'rx':oe,
                    'ry':oe,
                    'xr':0,
                    'laf':0,
                    'sf':0,
                    'x':roe*Math.sin(sa+al),
                    'y':roe*Math.cos(sa+al),
                    'type': 'A'
                },
                {
                    'x':rie*Math.sin(sa+al),
                    'y':rie*Math.cos(sa+al),
                    'type': 'L'
                },
                {
                    'rx':ie,
                    'ry':ie,
                    'xr':0,
                    'laf':0,
                    'sf':0,
                    'x':ri/(ri+ie)*(rie*Math.sin(sa+al)-ie*Math.cos(sa+al)),
                    'y':ri/(ri+ie)*(rie*Math.cos(sa+al)+ie*Math.sin(sa+al)),
                    'type': 'A'
                },
                {
                    'rx':ri,
                    'ry':ri,
                    'xr':0,
                    'laf': Math.max(al-ati,0) > Math.PI ? 1 : 0,
                    'sf':1,
                    'x':ri/(ri+is)*(ris*Math.sin(sa)+is*Math.cos(sa)),
                    'y':ri/(ri+is)*(ris*Math.cos(sa)-is*Math.sin(sa)),
                    'type': 'A'
                },
                {
                    'rx':is,
                    'ry':is,
                    'xr':0,
                    'laf':0,
                    'sf':0,
                    'x':ris*Math.sin(sa),
                    'y':ris*Math.cos(sa),
                    'type': 'A'
                },
                {
                    'type': 'Z'
                }
            ];

            if(aos+aoe>al){
                const als=al*aos/(aos+aoe),ale=al*aoe/(aos+aoe);

                svg[1].x=ro*Math.sin(sa+als);
                svg[1].y=ro*Math.cos(sa+als);
                svg[1].rx=ros*Math.sin(als);
                svg[1].xr=-(sa+als)*180/Math.PI;

                svg[2].x=svg[1].x;
                svg[2].y=svg[1].y;

                svg[3].rx=roe*Math.sin(ale);
                svg[3].xr=svg[1].xr   
            }

            if(ais+aie>al){
                const als=al*ais/(ais+aie),ale=al*aie/(ais+aie);

                svg[5].x=ri*Math.sin(sa+al-ale);
                svg[5].y=ri*Math.cos(sa+al-ale);
                svg[5].rx=rie*Math.sin(ale);
                svg[5].xr=-(sa+al-ale)*180/Math.PI;

                svg[6].x=svg[5].x;
                svg[6].y=svg[5].y;

                svg[7].rx=ris*Math.sin(als);
                svg[7].xr=svg[5].xr;
            }

            if(ros-ris<0){
                const d=(ro-ri)/(os+is);
                svg[0].x=(ri+d*is)*Math.sin(sa);
                svg[0].y=(ri+d*is)*Math.cos(sa);
                //svg[1].ry=???;
                svg[7].x=svg[0].x;
                svg[7].y=svg[0].y;
                //svg[7].ry=???;
            }

            if(roe-rie<0){
                const d=(ro-ri)/(oe+ie);
                svg[3].x=(ri+d*ie)*Math.sin(sa);
                svg[3].y=(ri+d*ie)*Math.cos(sa);
                //svg[3].ry=???;
                svg[4].x=svg[0].x;
                svg[4].y=svg[0].y;
                //svg[4].ry=???;
            }
        }

        return svg.map((e)=>({
            'M':(o)=>({type: o.type, values: (cw ? [o.x,-o.y] : [o.x,o.y])}),
            'A':(o)=>({type: o.type, values: (cw ? [o.rx,-o.ry,-o.xr,o.laf,1-o.sf,o.x,-o.y] : [o.rx,o.ry,o.xr,o.laf,o.sf,o.x,o.y])}),
            'L':(o)=>({type: o.type, values: (cw ? [o.x,-o.y] : [o.x,o.y])}),
            'Z':(o)=>({type: o.type, values: []}),
        }[e.type].call(null,e))).map((e)=>({...e,toString(){return this.type+' '+this.values.join(' ')}}));
    }

}