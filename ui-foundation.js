/* Phase 5.1 — framework-free interaction primitives for future UI modules. */
(function(){
  'use strict';

  var activeModal=null;
  var previousFocus=null;

  function ensureToastHost(){
    var host=document.querySelector('.ds-toast-host');
    if(host)return host;
    host=document.createElement('div');
    host.className='ds-toast-host';
    host.setAttribute('aria-live','polite');
    host.setAttribute('aria-atomic','false');
    document.body.appendChild(host);
    return host;
  }

  function toast(message,options){
    options=options||{};
    var host=ensureToastHost();
    var item=document.createElement('div');
    item.className='ds-toast'+(options.type?' ds-toast--'+options.type:'');
    item.setAttribute('role',options.type==='error'?'alert':'status');
    item.textContent=String(message||'');
    host.appendChild(item);
    var duration=Math.max(1200,Number(options.duration)||3200);
    window.setTimeout(function(){
      item.remove();
      if(!host.children.length)host.remove();
    },duration);
    return function(){item.remove();};
  }

  function getFocusable(root){
    return Array.prototype.slice.call(root.querySelectorAll(
      'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
    ));
  }

  function trapKeydown(event){
    if(!activeModal)return;
    if(event.key==='Escape'){
      closeModal();
      return;
    }
    if(event.key!=='Tab')return;
    var focusables=getFocusable(activeModal),first=focusables[0],last=focusables[focusables.length-1];
    if(!first)return;
    if(event.shiftKey&&document.activeElement===first){
      event.preventDefault();last.focus();
    }else if(!event.shiftKey&&document.activeElement===last){
      event.preventDefault();first.focus();
    }
  }

  function closeModal(){
    if(!activeModal)return;
    var current=activeModal;
    activeModal=null;
    document.removeEventListener('keydown',trapKeydown);
    document.body.classList.remove('ui-modal-open');
    current.remove();
    if(previousFocus&&typeof previousFocus.focus==='function'){
      try{previousFocus.focus();}catch{}
    }
    previousFocus=null;
  }

  function modal(options){
    options=options||{};
    closeModal();
    previousFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
    var overlay=document.createElement('div');
    overlay.className='ds-overlay';
    overlay.setAttribute('role','presentation');

    var dialog=document.createElement('div');
    dialog.className='ds-modal';
    dialog.setAttribute('role','dialog');
    dialog.setAttribute('aria-modal','true');

    var titleId='ds-modal-title-'+Date.now();
    if(options.labelledBy)dialog.setAttribute('aria-labelledby',options.labelledBy);
    else if(options.title){
      var header=document.createElement('div');
      header.className='ds-modal__header';
      var title=document.createElement('h2');
      title.className='ds-card__title';
      title.id=titleId;
      title.textContent=String(options.title);
      header.appendChild(title);
      var close=document.createElement('button');
      close.type='button';
      close.className='ds-modal__close';
      close.setAttribute('aria-label',options.closeLabel||'Close');
      close.textContent='×';
      close.addEventListener('click',closeModal);
      header.appendChild(close);
      dialog.appendChild(header);
      dialog.setAttribute('aria-labelledby',titleId);
    }

    var body=document.createElement('div');
    body.className='ds-modal__body';
    if(options.content instanceof Node)body.appendChild(options.content);
    else body.innerHTML=String(options.content||'');
    dialog.appendChild(body);
    overlay.appendChild(dialog);
    overlay.addEventListener('click',function(event){if(event.target===overlay&&options.dismissOnBackdrop!==false)closeModal();});
    document.body.appendChild(overlay);
    activeModal=dialog;
    document.body.classList.add('ui-modal-open');
    document.addEventListener('keydown',trapKeydown);
    window.setTimeout(function(){
      var focusables=getFocusable(dialog);
      (options.initialFocus instanceof HTMLElement?options.initialFocus:focusables[0])?.focus?.();
    },0);
    return {element:overlay,close:closeModal};
  }

  function drawer(options){
    options=options||{};
    var overlay=document.createElement('div');
    overlay.className='ds-drawer is-open';
    overlay.setAttribute('role','presentation');

    var panel=document.createElement('aside');
    panel.className='ds-drawer__panel';
    panel.setAttribute('role','dialog');
    panel.setAttribute('aria-modal','true');
    if(options.title){
      var title=document.createElement('h2');
      title.className='ds-card__title';
      title.textContent=String(options.title);
      panel.appendChild(title);
    }
    var body=document.createElement('div');
    if(options.content instanceof Node)body.appendChild(options.content);
    else body.innerHTML=String(options.content||'');
    panel.appendChild(body);
    overlay.appendChild(panel);

    function close(){
      overlay.remove();
      document.body.classList.remove('ui-modal-open');
      document.removeEventListener('keydown',onKey);
      if(previousFocus&&typeof previousFocus.focus==='function'){
        try{previousFocus.focus();}catch{}
      }
      previousFocus=null;
    }
    function onKey(event){
      if(event.key==='Escape')close();
    }
    previousFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
    overlay.addEventListener('click',function(event){if(event.target===overlay)close();});
    document.body.appendChild(overlay);
    document.body.classList.add('ui-modal-open');
    document.addEventListener('keydown',onKey);
    window.setTimeout(function(){
      var focusables=getFocusable(panel);
      if(focusables[0])focusables[0].focus();
    },0);
    return {element:overlay,close:close};
  }

  window.NihongoUI={
    toast:toast,
    modal:modal,
    drawer:drawer,
    closeModal:closeModal
  };
})();
