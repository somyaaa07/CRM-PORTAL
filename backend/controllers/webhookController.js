import dotenv from 'dotenv';
import {
  fetchLeadFromMeta,
  saveMetaLead,
} from '../services/metaService.js';
import { Notification } from '../models/index.js'

dotenv.config();

export const metaLeadNotifications = []
// ─── GET: Webhook Verify ───────────────────────────────────
export const verifyWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('📌 Verify request:', { mode, token });

  if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
    console.log('✅ Webhook verified!');
    return res.status(200).send(challenge);
  }

  console.log('❌ Verify failed!');
  res.sendStatus(403);
};

// ─── POST: Lead Receive ────────────────────────────────────
export const receiveWebhook = async (req, res) => {
  const body = req.body;

  // ✅ Pehle 200 bhejo
  res.sendStatus(200);

  console.log('📌 Webhook received:', JSON.stringify(body, null, 2));

  if (body.object !== 'page') return;

  for (const entry of body.entry || []) {
    for (const change of entry.changes || []) {
      if (change.field === 'leadgen') {
        const leadgenId = change.value?.leadgen_id;

        console.log('🎉 New Meta Lead! ID:', leadgenId);

        try {
          const leadData = await fetchLeadFromMeta(leadgenId);
          const result = await saveMetaLead(leadData);

          if (!result.duplicate) {
            const savedLead = result.lead;
            console.log('✅ Lead saved:', savedLead.id);
            //agent notification
            if (savedLead.assignedTo) {
              await Notification.create({
                userId: savedLead.assignedTo,
                title: 'New Meta ads leads',
                message: `${savedLead.name},${savedLead.phone}-from meta ads lead`,
                type: 'meta-lead',
                leadId: savedLead.id,
                isRead: false
              });
              console.log(`Agent ${savedLead.assignedTo}`);
              console.log('Agent recevied notification')

            }

            //admin Notification 
            const admins = await (
              await import('../models/index.js')
            ).User.findAll ({
              where:{role:'admin',isActive:true}
            })

            for (const admin of admins){
              await Notification.create({
                userId:admin.id,
                title:'New leads from meta ads',
                message:`${savedLead.name}`,
                type:'meta-lead',
                leadId:savedLead.id,
                isRead:false
              });
              console.log('Admin recevied notification')
              
            }

            // ← Notification store karo
            metaLeadNotifications.unshift({
              leadId: result.lead.id,
              name: result.lead.name,
              phone: result.lead.phone,
              source: 'Meta Ads',
              createdAt: new Date(),
            });

            // Sirf last 20 notifications rakho
            if (metaLeadNotifications.length > 20) {
              metaLeadNotifications.pop();
            }
          }
        } catch (err) {
          console.error('❌ Error:', err.message);
        }
      }
    }
  }
};