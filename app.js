// app.js - logique pour le générateur de grilles d'accords
// Auteur: proposition pour cochetantoine-design/chord-grid-generator

(() => {
  // Chromatic scale given in the spec:
  const SCALE = ['A','Bb','B','C','C#','D','Eb','E','F','F#','G','Ab'];

  // DOM
  const songNameInput = document.getElementById('songNameInput');
  const tempoInput = document.getElementById('tempoInput');
  const songTitleDisplay = document.getElementById('songTitleDisplay');
  const tempoDisplay = document.getElementById('tempoDisplay');
  const addPartBtn = document.getElementById('addPartBtn');
  const transposeUpBtn = document.getElementById('transposeUp');
  const transposeDownBtn = document.getElementById('transposeDown');
  const exportPdfBtn = document.getElementById('exportPdf');
  const content = document.getElementById('content');

  // Modal elements
  const modal = document.getElementById('measureModal');
  const chordInput = document.getElementById('chordInput');
  const splitCheckbox = document.getElementById('splitCheckbox');
  const ovalCheckbox = document.getElementById('ovalCheckbox');
  const saveMeasureBtn = document.getElementById('saveMeasureBtn');
  const deleteMeasureBtn = document.getElementById('deleteMeasureBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');

  // State: parts array
  // each part: { id, name, measuresTotal, measuresPerLine, measures: [ { chord: "", split:false, chord2:"", oval:false } ] }
  let parts = [];

  // editing context for modal
  let editing = { partId: null, measureIndex: null };

  // Helpers
  function makeId(){ return Math.random().toString(36).slice(2,9); }

  function clampMeasuresPerLine(n){
    n = Math.max(1, Math.min(10, n));
    return Math.floor(n);
  }

  function updateHeaderDisplays(){
    songTitleDisplay.textContent = (songNameInput.value || 'TITRE').toUpperCase();
    tempoDisplay.textContent = (tempoInput.value || 120) + ' BPM';
  }

  songNameInput.addEventListener('input', updateHeaderDisplays);
  tempoInput.addEventListener('input', updateHeaderDisplays);

  // Render full content
  function render(){
    content.innerHTML = '';
    parts.forEach(part => {
      const partEl = document.createElement('div');
      partEl.className = 'part';

      // Left column with part name
      const left = document.createElement('div');
      left.className = 'part-left';
      const nameBox = document.createElement('div');
      nameBox.className = 'part-name';
      nameBox.textContent = (part.name || 'PART').toUpperCase().slice(0,8);
      nameBox.title = 'Cliquez pour renommer (max 8 caractères)';
      nameBox.addEventListener('click', () => {
        const newName = prompt('Nom de la partie (MAJUSCULE, max 8 chars):', part.name || '');
        if(newName !== null){
          part.name = newName.toUpperCase().slice(0,8);
          render();
        }
      });
      left.appendChild(nameBox);

      // Controls: duplicate / remove / edit settings
      const ctrls = document.createElement('div');
      ctrls.className = 'part-controls';

      const dupBtn = document.createElement('button');
      dupBtn.className = 'small-btn no-print';
      dupBtn.textContent = 'Dupliquer';
      dupBtn.addEventListener('click', () => duplicatePart(part.id));

      const removeBtn = document.createElement('button');
      removeBtn.className = 'small-btn no-print';
      removeBtn.textContent = 'Supprimer';
      removeBtn.addEventListener('click', () => {
        if(confirm('Supprimer cette partie ?')) removePart(part.id);
      });

      const editBtn = document.createElement('button');
      editBtn.className = 'small-btn no-print';
      editBtn.textContent = 'Paramètres';
      editBtn.addEventListener('click', () => {
        const mt = parseInt(prompt('Nombre total de mesures:', part.measuresTotal),10);
        if(!Number.isNaN(mt) && mt > 0){
          let mpl = parseInt(prompt('Mesures par ligne (1-10):', part.measuresPerLine),10);
          mpl = clampMeasuresPerLine(mpl || 1);
          part.measuresTotal = mt;
          part.measuresPerLine = mpl;
          // resize measures array
          while(part.measures.length < mt) part.measures.push({ chord:'', split:false, chord2:'', oval:false });
          if(part.measures.length > mt) part.measures.length = mt;
          render();
        }
      });

      ctrls.appendChild(editBtn);
      ctrls.appendChild(dupBtn);
      ctrls.appendChild(removeBtn);
      left.appendChild(ctrls);

      // Right column: grid
      const right = document.createElement('div');
      right.className = 'part-right';

      // compute rows
      const rows = Math.ceil(part.measuresTotal / part.measuresPerLine);
      for(let r=0; r<rows; r++){
        const rowEl = document.createElement('div');
        rowEl.className = 'row';
        const start = r * part.measuresPerLine;
        const end = Math.min(start + part.measuresPerLine, part.measuresTotal);
        for(let i=start;i<end;i++){
          const m = part.measures[i] || { chord:'', split:false, chord2:'', oval:false };
          // compute whether measure contains at least one chord
          const hasChord = m.split
            ? ((m.chord || '').trim() !== '' || (m.chord2 || '').trim() !== '')
            : ((m.chord || '').trim() !== '');
          const mEl = document.createElement('div');
          mEl.className = 'measure' + (m.split ? ' split' : '') + (hasChord ? ' filled' : '');
          // clickable to edit
          mEl.addEventListener('click', (ev)=> {
            openMeasureModal(part.id, i);
            ev.stopPropagation();
          });
          if(m.split){
            const top = document.createElement('div');
            top.className = 'half top-left';
            top.textContent = (m.chord || '');
            if(m.oval) top.classList.add('oval');
            const bottom = document.createElement('div');
            bottom.className = 'half bottom-right';
            bottom.textContent = (m.chord2 || '');
            if(m.oval) bottom.classList.add('oval');
            mEl.appendChild(top);
            mEl.appendChild(bottom);
          }else{
            const c = document.createElement('div');
            c.className = 'chord' + (m.oval ? ' oval' : '');
            c.textContent = (m.chord || '');
            mEl.appendChild(c);
          }
          rowEl.appendChild(mEl);
        }
        right.appendChild(rowEl);
      }

      partEl.appendChild(left);
      partEl.appendChild(right);
      content.appendChild(partEl);
    });
  }

  // Part management
  function addPart(defaults){
    const id = makeId();
    const measuresTotal = defaults?.measuresTotal || 8;
    const measuresPerLine = clampMeasuresPerLine(defaults?.measuresPerLine || 4);
    const name = (defaults?.name || 'PART').toUpperCase().slice(0,8);
    const measures = [];
    for(let i=0;i<measuresTotal;i++) measures.push({ chord:'', split:false, chord2:'', oval:false });
    parts.push({ id, name, measuresTotal, measuresPerLine, measures });
    render();
  }

  function duplicatePart(id){
    const p = parts.find(x => x.id === id);
    if(!p) return;
    const copy = JSON.parse(JSON.stringify(p));
    copy.id = makeId();
    copy.name = (copy.name || 'PART').slice(0,8);
    parts.push(copy);
    render();
  }

  function removePart(id){
    parts = parts.filter(x => x.id !== id);
    render();
  }

  addPartBtn.addEventListener('click', ()=> addPart());

  // Modal logic
  function openMeasureModal(partId, measureIndex){
    editing = { partId, measureIndex };
    const part = parts.find(x => x.id === partId);
    if(!part) return;
    const m = part.measures[measureIndex];
    chordInput.value = m.split ? m.chord + ' | ' + m.chord2 : (m.chord || '');
    splitCheckbox.checked = !!m.split;
    ovalCheckbox.checked = !!m.oval;
    modal.classList.remove('hidden');
    chordInput.focus();
  }
  function closeModal(){
    modal.classList.add('hidden');
    editing = { partId:null, measureIndex:null };
    chordInput.value = '';
    splitCheckbox.checked = false;
    ovalCheckbox.checked = false;
  }
  closeModalBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if(e.target === modal) closeModal();
  });

  saveMeasureBtn.addEventListener('click', ()=>{
    if(!editing.partId) return;
    const part = parts.find(x => x.id === editing.partId);
    if(!part) return;
    const idx = editing.measureIndex;
    const raw = chordInput.value.trim();
    const split = splitCheckbox.checked;
    const oval = ovalCheckbox.checked;
    if(split){
      // allow user to input "A | B" or "A,B" or "A;B"
      const sep = raw.includes('|') ? '|' : (raw.includes(',') ? ',' : (raw.includes(';') ? ';' : null));
      let a='', b='';
      if(sep){
        const [x,y] = raw.split(sep);
        a = (x||'').trim();
        b = (y||'').trim();
      }else{
        const partsRaw = raw.split(/\s+/);
        a = partsRaw[0] || '';
        b = partsRaw[1] || '';
      }
      part.measures[idx] = { chord: a, split: true, chord2: b, oval: !!oval };
    }else{
      part.measures[idx] = { chord: raw, split: false, chord2:'', oval: !!oval };
    }
    closeModal();
    render();
  });

  deleteMeasureBtn.addEventListener('click', ()=>{
    if(!editing.partId) return;
    const part = parts.find(x => x.id === editing.partId);
    if(!part) return;
    if(confirm('Effacer cette mesure ?')){
      part.measures[editing.measureIndex] = { chord:'', split:false, chord2:'', oval:false };
      closeModal();
      render();
    }
  });

  // Allowed roots: A ; Bb ; B ; C ; C# ; D ; Eb ; E ; F ; F# ; G ; Ab
  // Extract root: check 2-letter roots first (Bb, C#, Eb, F#, Ab) then 1-letter.
  function extractRoot(chord){
    if(!chord) return null;
    chord = chord.trim();
    if(chord.length === 0) return null;
    const two = chord.slice(0,2);
    const one = chord[0];
    if(SCALE.includes(two)) return two;
    if(SCALE.includes(one)) return one;
    // try capitalizing first letter
    const altTwo = two[0].toUpperCase() + (two[1]||'');
    const altOne = one.toUpperCase();
    if(SCALE.includes(altTwo)) return altTwo;
    if(SCALE.includes(altOne)) return altOne;
    return null;
  }
  function normalizeChord(raw){
    if(!raw) return '';
    raw = raw.trim();
    // Standardize root capitalization (A..G, b for flat, #)
    const root = extractRoot(raw);
    if(!root) return raw; // leave as-is if unrecognized
    const suffix = raw.slice(root.length);
    return root + suffix;
  }

  // Transposition: shift roots by +1 or -1 according to SCALE order, preserving suffixes.
  function transposeAll(steps){
    parts.forEach(part => {
      part.measures = part.measures.map(m => {
        if(m.split){
          const r1 = extractRoot(m.chord);
          const r2 = extractRoot(m.chord2);
          const s1 = m.chord.slice(r1 ? r1.length : 0);
          const s2 = m.chord2.slice(r2 ? r2.length : 0);
          const new1 = r1 ? shiftRoot(r1, steps) + s1 : m.chord;
          const new2 = r2 ? shiftRoot(r2, steps) + s2 : m.chord2;
          return { ...m, chord: new1, chord2: new2 };
        }else{
          const r = extractRoot(m.chord);
          const sfx = r ? m.chord.slice(r.length) : '';
          const newch = r ? shiftRoot(r, steps) + sfx : m.chord;
          return { ...m, chord: newch };
        }
      });
    });
    render();
  }

  function shiftRoot(root, steps){
    const idx = SCALE.indexOf(root);
    if(idx === -1) return root;
    const n = ((idx + steps) % SCALE.length + SCALE.length) % SCALE.length;
    return SCALE[n];
  }

  transposeUpBtn.addEventListener('click', ()=> transposeAll(1));
  transposeDownBtn.addEventListener('click', ()=> transposeAll(-1));

  // Export to PDF via print
  exportPdfBtn.addEventListener('click', ()=>{
    // ensure header displays up-to-date
    updateHeaderDisplays();

    // add temporary class to force non-print styles to hide if needed
    document.body.classList.add('exporting-pdf');

    // call print; removal of the class is done after a short timeout to support browsers that don't block
    try {
      window.print();
    } finally {
      // remove class after a short delay to ensure print stylesheet had time to apply
      setTimeout(()=> document.body.classList.remove('exporting-pdf'), 250);
    }
  });

  // Initialize with an example part
  addPart({name:'INTRO', measuresTotal:8, measuresPerLine:4});
  addPart({name:'COUPLET', measuresTotal:16, measuresPerLine:8});

  // Keyboard Esc closes modal
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
  });

  // click outside any measure closes modal
  document.addEventListener('click', (e)=>{
    // nothing for now
  });

  // initial header
  updateHeaderDisplays();

  // Expose for debugging
  window._cgg = { parts, SCALE, transposeAll, addPart, duplicatePart };
})();