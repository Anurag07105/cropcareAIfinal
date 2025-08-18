// Base API URL from .env (fallback to local dev)
const API_BASE_URL = import.meta.env.VITE_API_URL;

// 🔍 DEBUG: Log environment variables
console.log('🔍 Environment Variables Check:');
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('API_BASE_URL:', API_BASE_URL);
console.log('All env vars:', import.meta.env);

/* =======================
   AUTHENTICATION ROUTES
   ======================= */

// Email Signup
export async function signupEmail(userData) {
  const fullURL = `${API_BASE_URL}/auth/signup/email`;
  console.log('🚀 Signup URL:', fullURL);
  
  try {
    const res = await fetch(fullURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    
    console.log('📡 Signup Response status:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Signup Error response:', errorText);
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    return res.json();
  } catch (error) {
    console.error('❌ Signup Network Error:', error);
    throw error;
  }
}

// Phone Signup
export async function signupPhone(userData) {
  const res = await fetch(`${API_BASE_URL}/auth/signup/phone`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return res.json();
}

// Send OTP
export async function sendOtp(phoneData) {
  const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(phoneData),
  });
  return res.json();
}

// Verify OTP
export async function verifyOtp(otpData) {
  const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(otpData),
  });
  return res.json();
}

/* =======================
   COMMUNITY ROUTES
   ======================= */

// Get all posts
export async function getPosts() {
  const res = await fetch(`${API_BASE_URL}/community/posts`);
  return res.json();
}

// Create a post
export async function createPost(postData) {
  const res = await fetch(`${API_BASE_URL}/community/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(postData),
  });
  return res.json();
}

// Add comment
export async function addComment(postId, commentData) {
  const res = await fetch(`${API_BASE_URL}/community/posts/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(commentData),
  });
  return res.json();
}

// Like post
export async function likePost(postId) {
  const res = await fetch(`${API_BASE_URL}/community/posts/${postId}/like`, {
    method: "POST",
  });
  return res.json();
}

/* =======================
   EXPLORE ROUTES
   ======================= */

// Chat AI - WITH DEBUG
export async function chatAI(query) {
  const fullURL = `${API_BASE_URL}/explore/chat`;
  console.log('🚀 AI Chat URL:', fullURL);
  console.log('🚀 Query:', query);
  
  try {
    const res = await fetch(fullURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    
    console.log('📡 AI Response status:', res.status);
    console.log('📡 AI Response headers:', [...res.headers.entries()]);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ AI Error response:', errorText);
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const jsonResponse = await res.json();
    console.log('✅ AI Success response:', jsonResponse);
    return jsonResponse;
  } catch (error) {
    console.error('❌ AI Network/Fetch Error:', error);
    throw error;
  }
}

/* =======================
   HELP & SUPPORT ROUTES
   ======================= */

// Get quick help options
export async function getQuickHelp() {
  const res = await fetch(`${API_BASE_URL}/help/quick-help`);
  return res.json();
}

// Get FAQs
export async function getFAQs() {
  const res = await fetch(`${API_BASE_URL}/help/faqs`);
  return res.json();
}

// Contact support
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

// Upload image for prediction
export async function predictImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/predict/predict`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

// Health check
export async function backendHealth() {
  const res = await fetch(`${API_BASE_URL}/predict/health`);
  return res.json();
}