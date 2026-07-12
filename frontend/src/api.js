// Frontend API client – all protected calls include the Supabase JWT
import { supabase } from "./lib/supabase";

const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Get the Authorization header from the current Supabase session.
 * Returns an empty object if no session exists.
 */
async function authHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    return { Authorization: `Bearer ${session.access_token}` };
  }
  return {};
}

/* =======================
   COMMUNITY ROUTES
   ======================= */

export async function getPosts() {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE_URL}/community/posts`, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function createPost(postData) {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE_URL}/community/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(postData),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function addComment(postId, commentData) {
  const headers = await authHeaders();
  const res = await fetch(
    `${API_BASE_URL}/community/posts/${postId}/comments`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(commentData),
    }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function getComments(postId) {
  const headers = await authHeaders();
  const res = await fetch(
    `${API_BASE_URL}/community/posts/${postId}/comments`,
    { headers }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function likePost(postId) {
  const headers = await authHeaders();
  const res = await fetch(
    `${API_BASE_URL}/community/posts/${postId}/like`,
    { method: "POST", headers }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function getLikedPosts() {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE_URL}/community/liked-posts`, {
    headers,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/* =======================
   EXPLORE ROUTES
   ======================= */

export async function chatAI(query) {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE_URL}/explore/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/* =======================
   HELP & SUPPORT ROUTES
   ======================= */

export async function getQuickHelp() {
  const res = await fetch(`${API_BASE_URL}/help/quick-help`);
  return res.json();
}

export async function getFAQs() {
  const res = await fetch(`${API_BASE_URL}/help/faqs`);
  return res.json();
}

export async function contactSupport(messageData) {
  const res = await fetch(`${API_BASE_URL}/help/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(messageData),
  });
  return res.json();
}

/* =======================
   PREDICT ROUTES
   ======================= */

export async function predictImage(file) {
  const headers = await authHeaders();
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/predict/predict`, {
    method: "POST",
    headers, // no Content-Type — browser sets multipart boundary
    body: formData,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function backendHealth() {
  const res = await fetch(`${API_BASE_URL}/predict/health`);
  return res.json();
}

/* =======================
   HISTORY ROUTES
   ======================= */

export async function getPredictionHistory() {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE_URL}/history`, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function getPredictionHistoryItem(id) {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE_URL}/history/${id}`, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function deletePredictionHistoryItem(id) {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE_URL}/history/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
