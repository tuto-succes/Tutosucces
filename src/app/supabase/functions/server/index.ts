import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Supabase client for auth
const supabaseAuth = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
);

// Supabase client with service role (for querying database)
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get("/make-server-385c5805/health", (c) => {
  return c.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    message: "Server is running"
  });
});

// ============================================================================
// LOGIN
// ============================================================================

app.post("/make-server-385c5805/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    console.log('🔐 Login attempt:', email);

    // 1. Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('❌ Auth error:', authError.message);
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    console.log('✅ Auth success for:', email);

    // 2. Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      console.error('❌ Profile not found for:', email);
      return c.json({ error: 'Profile not found' }, 404);
    }

    console.log('✅ Profile found:', profile.role);

    // 3. Return user data with access token
    return c.json({
      access_token: authData.session.access_token,
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
      }
    });

  } catch (error: any) {
    console.error('❌ Login route error:', error);
    return c.json({ error: 'Login failed: ' + error.message }, 500);
  }
});

// ============================================================================
// GET PROFILE (with auth token)
// ============================================================================

app.get("/make-server-385c5805/profile", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'No authorization header' }, 401);
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const { data: { user }, error } = await supabaseAuth.auth.getUser(token);
    
    if (error || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', user.email)
      .single();

    if (profileError || !profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    return c.json({ user: profile });

  } catch (error: any) {
    console.error('❌ Profile route error:', error);
    return c.json({ error: 'Failed to get profile' }, 500);
  }
});

// ============================================================================
// START SERVER
// ============================================================================

console.log('🚀 Server starting...');
console.log('📍 Health check: /make-server-385c5805/health');
console.log('🔐 Login: /make-server-385c5805/login');
console.log('👤 Profile: /make-server-385c5805/profile');

Deno.serve(app.fetch);
