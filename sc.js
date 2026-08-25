// SpikerCars shared client + helpers (ES module, imported by every page)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const SUPABASE_URL = 'https://ihefyrwfgllieowplwok.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_d0yEM0iEhqBebg13XIZv1g_qm9jW2m9';
export const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

export const $ = (id) => document.getElementById(id);
export const vNum = (v) => (v === '' || v == null) ? null : Number(v);
export const money = (v) => (v == null || v === '') ? '' : '$' + Number(v).toLocaleString();

export function escapeHtml(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
export function showMsg(el, text, kind){ if(!el) return; el.className = 'msg ' + kind; el.textContent = text; }
export function clearMsg(el){ if(!el) return; el.className = 'msg'; el.textContent = ''; }

export async function getUser(){
  const { data: { user } } = await sb.auth.getUser();
  return user;
}
export async function loadProfile(user){
  const { data } = await sb.from('profiles')
    .select('first_name,last_name,dealership,phone,role,email')
    .eq('id', user.id).maybeSingle();
  return data || { role: 'dealer', email: user.email };
}
// Where a given role belongs.
export function roleHome(role){ return role === 'consumer' ? 'garage.html' : 'dealer.html'; }

export async function signOut(redirect = 'index.html'){
  await sb.auth.signOut();
  location.href = redirect;
}

// Add a show/hide eye toggle to every password field on the page.
const EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
const EYE_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
export function enhancePasswordFields(){
  document.querySelectorAll('input[type="password"]').forEach(inp => {
    if (inp.dataset.pwEnhanced) return;
    inp.dataset.pwEnhanced = '1';
    const wrap = document.createElement('div');
    wrap.className = 'pw-wrap';
    inp.parentNode.insertBefore(wrap, inp);
    wrap.appendChild(inp);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pw-toggle';
    btn.setAttribute('aria-label', 'Show password');
    btn.innerHTML = EYE;
    wrap.appendChild(btn);
    btn.addEventListener('click', () => {
      const show = inp.type === 'password';
      inp.type = show ? 'text' : 'password';
      btn.innerHTML = show ? EYE_OFF : EYE;
      btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', enhancePasswordFields);
else enhancePasswordFields();

// ---- Modal ----
function escClose(e){ if (e.key === 'Escape') closeModal(); }
export function openModal(innerHtml){
  closeModal();
  const ov = document.createElement('div');
  ov.className = 'modal-ov'; ov.id = 'sc-modal-ov';
  ov.innerHTML = `<div class="modal-card">${innerHtml}</div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click', e => { if (e.target === ov) closeModal(); });
  document.addEventListener('keydown', escClose);
  return ov.querySelector('.modal-card');
}
export function closeModal(){ const ov = $('sc-modal-ov'); if (ov) ov.remove(); document.removeEventListener('keydown', escClose); }

// ---- Remove submission (soft delete via edge function) ----
export async function removeSubmission(type, id){
  const { data, error } = await sb.functions.invoke('remove-submission', { body: { type, id } });
  if (error) throw new Error(error.message || 'Remove failed');
  if (data && data.error) throw new Error(data.error);
  return data;
}
