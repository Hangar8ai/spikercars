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
export function roleHome(role){ return role === 'consumer' ? 'sell.html' : 'dealer.html'; }

export async function signOut(redirect = 'index.html'){
  await sb.auth.signOut();
  location.href = redirect;
}
