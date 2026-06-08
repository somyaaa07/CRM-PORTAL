import axios   from 'axios';
import dotenv  from 'dotenv';
import path    from 'path';
import { fileURLToPath } from 'url';
import { Lead, User } from '../models/index.js';

// ✅ Root .env point karo
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Baaki sab same rehne do...


// ─── Config ───────────────────────────────────────────────
const GRAPH_API_VERSION = 'v18.0';
const GRAPH_BASE_URL    = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

// ─── Token Selector ───────────────────────────────────────
// User token  → /me/accounts, long-lived exchange ke liye
// Page token  → Lead fetch, webhook subscribe ke liye
const getPageToken = () => process.env.META_PAGE_ACCESS_TOKEN;
const getUserToken = () => process.env.META_ACCESS_TOKEN;

// ─── 1. Page Token Verify Karo ────────────────────────────
export const verifyPageToken = async () => {
  try {
    const res = await axios.get(`${GRAPH_BASE_URL}/me`, {
      params: {
        access_token: getPageToken(),
        fields: 'id,name',
      },
    });
    console.log('✅ Page Token Valid:', res.data);
    return res.data;
  } catch (err) {
    console.error('❌ Page Token Invalid:', err.response?.data);
    throw err;
  }
};

// ─── 2. Lead Data Fetch Karo ──────────────────────────────
export const fetchLeadFromMeta = async (leadgenId) => {
  try {
    console.log('📌 Fetching lead:', leadgenId);

    const res = await axios.get(
      `${GRAPH_BASE_URL}/${leadgenId}`,
      {
        params: {
          
          fields:       'id,created_time,field_data,form_id',
          access_token: getPageToken(),
        },
      }
    );

    console.log('📌 Raw data:', JSON.stringify(res.data, null, 2));

    // ── Fields Extract Karo ──────────────────────────────
    const fields = {};
    res.data.field_data?.forEach((f) => {
      fields[f.name.toLowerCase()] = f.values?.[0] || '';
    });

    console.log('📌 Extracted fields:', fields);

    // ── Clean Lead Object ────────────────────────────────
    const lead = {
      name:
        fields['full_name']   ||
        fields['name']        ||
        `${fields['first_name'] || ''} ${fields['last_name'] || ''}`.trim() ||
        'Unknown',

      phone:
        fields['phone_number']  ||
        fields['phone']         ||
        fields['mobile_number'] ||
        fields['mobile']        || '',

      email:     fields['email'] || '',
      formId:    res.data.form_id,
      leadgenId: res.data.id,
      source:    'Meta Ads',
    };

    console.log('✅ Lead ready:', lead);
    return lead;

  } catch (err) {
    console.error('❌ Lead fetch error:',
      err.response?.data || err.message
    );
    throw err;
  }
};

// ─── 3. Round Robin Agent Assign ──────────────────────────
export const assignAgentRoundRobin = async () => {
  try {
    const agents = await User.findAll({
      where: { role: 'agent', isActive: true },
    });

    if (agents.length === 0) {
      console.log('⚠️ there is no active agent');
      return null;
    }

    const counts = await Promise.all(
      agents.map(async (agent) => ({
        agentId: agent.id,
        name:    agent.name,
        count:   await Lead.count({
          where: { assignedTo: agent.id },
        }),
      }))
    );

    // Sabse kam leads wala agent
    counts.sort((a, b) => a.count - b.count);
    console.log('📌 Agent counts:', counts);
    console.log('✅ Assigned to:', counts[0].name);

    return counts[0].agentId;
  } catch (err) {
    console.error('❌ Agent assign error:', err.message);
    return null;
  }
};

// ─── 4. Lead Save Karo ────────────────────────────────────
export const saveMetaLead = async (leadData) => {
  try {
    // Duplicate check
    if (leadData.phone) {
      const existing = await Lead.findOne({
        where: { phone: leadData.phone },
      });
      if (existing) {
        console.log('⚠️ Duplicate lead:', leadData.phone);
        return { duplicate: true, lead: existing };
      }
    }

    // Agent assign karo
    const assignedTo = await assignAgentRoundRobin();

    // Lead create karo
    const lead = await Lead.create({
      name:       leadData.name,
      phone:      leadData.phone      || null,
      email:      leadData.email      || null,
      source:     'Meta Ads',
      status:     'New',
      priority:   'Medium',
      assignedTo,
      notes: `Meta Ads Lead | Form: ${leadData.formId} | LeadgenID: ${leadData.leadgenId}`,
    });

    console.log('✅ Lead saved! ID:', lead.id);
    return { duplicate: false, lead };

  } catch (err) {
    console.error('❌ Lead save error:', err.message);
    throw err;
  }
};

// ─── 5. Page Subscribe Karo ───────────────────────────────
export const subscribePageToWebhook = async () => {
  try {
    const pageId = process.env.META_PAGE_ID;

    const res = await axios.post(
      `${GRAPH_BASE_URL}/${pageId}/subscribed_apps`,
      null,
      {
        params: {
          subscribed_fields: 'leadgen',
          access_token:      getPageToken(),
        },
      }
    );

    console.log('✅ Page subscribed:', res.data);
    return res.data;
  } catch (err) {
    console.error('❌ Subscribe error:', err.response?.data || err.message);
    throw err;
  }
};