import { supabase } from './supabase';
import type { AppNotification, WorkOrder, WorkOrderStatus } from '../types';

export interface PushPreferences { enabled:boolean; soundEnabled:boolean; vibrationEnabled:boolean; statusUpdates:boolean; quoteUpdates:boolean; appointmentUpdates:boolean; emergencyAlerts:boolean; }
export interface PushNotificationPayload { title:string; body:string; type?:string; workOrderId?:string; }
export const DEFAULT_PUSH_PREFERENCES:PushPreferences={enabled:true,soundEnabled:true,vibrationEnabled:false,statusUpdates:true,quoteUpdates:true,appointmentUpdates:true,emergencyAlerts:true};
const key='rsc_push_preferences'; export const getPushPreferences=()=>{try{return {...DEFAULT_PUSH_PREFERENCES,...JSON.parse(localStorage.getItem(key)||'{}')}}catch{return DEFAULT_PUSH_PREFERENCES}}; export const savePushPreferences=(updates:Partial<PushPreferences>)=>{const next={...getPushPreferences(),...updates};localStorage.setItem(key,JSON.stringify(next));return next;};
export const playNotificationChime=()=>undefined;
export async function initializeFCM(){
  const supported = 'Notification' in window;
  return {success:true,supported,permission:Notification.permission,token:null,isSupported:supported};
}
export async function requestFCMPermission(){if(!('Notification'in window))return {success:false,error:'Browser notifications are not supported.'};const permission=await Notification.requestPermission();return {success:permission==='granted',permission,token:null};}
export function getStatusNotificationContent(status:WorkOrderStatus){return {title:'Request update',body:`Your service request is now ${status.replaceAll('_',' ').toLowerCase()}.`};}
export async function triggerWorkOrderStatusPushNotification(order:WorkOrder, status:WorkOrderStatus = order.status, note?: string){
  const effectiveStatus = status ?? order.status;
  const content=getStatusNotificationContent(effectiveStatus);
  const payload:PushNotificationPayload={...content,workOrderId:order.id};
  if (note) payload.body = `${payload.body} ${note}`;
  window.dispatchEvent(new CustomEvent('rsc_fcm_push',{detail:payload}));
  if(Notification.permission==='granted'&&getPushPreferences().enabled)new Notification(payload.title,{body:payload.body});
  const notification:Partial<AppNotification>={id:`notification-${Date.now()}`,userId:order.customerId,title:payload.title,message:payload.body,isRead:false,createdAt:new Date().toISOString()};
  await supabase.from('notifications').insert(notification).then(()=>undefined);
  return payload;
}
export async function sendTestPushNotification(order?:WorkOrder, status?:WorkOrderStatus){
  const payload:PushNotificationPayload={title:'Notifications are enabled',body: order && status ? `Your service request is now ${status.replaceAll('_',' ').toLowerCase()}.` : 'You will receive updates about your service requests.'};
  window.dispatchEvent(new CustomEvent('rsc_fcm_push',{detail:payload}));
  if(Notification.permission==='granted')new Notification(payload.title,{body:payload.body});
  return {success:true,payload};
}
