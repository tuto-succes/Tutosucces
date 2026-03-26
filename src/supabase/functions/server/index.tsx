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
    allowHeaders: ["Content-Type", "Authorization", "apikey", "x-client-info"],
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
// CREATE USER (admin only)
// ============================================================================

app.post("/make-server-385c5805/create-user", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name, role, phone, bio, rate, subjects, levels, student_level } = body;

    console.log('👤 Creating user:', email, 'with role:', role);

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (authError) {
      console.error('❌ Auth creation error:', authError.message);
      return c.json({ error: 'Failed to create user: ' + authError.message }, 400);
    }

    console.log('✅ Auth user created:', authData.user.id);

    // 2. Create profile in database with all fields
    const createdAt = new Date().toISOString();
    let profile = null;
    let profileError = null;

    const extendedFields: Record<string, any> = {};
    if (phone) extendedFields.phone = phone;
    if (subjects?.length) extendedFields.subjects = subjects;
    if (levels?.length) extendedFields.levels = levels;
    if (bio) extendedFields.bio = bio;
    if (rate != null) extendedFields.rate = rate;
    if (student_level) extendedFields.student_level = student_level;

    const profilePayloads = [
      {
        id: authData.user.id,
        user_id: authData.user.id,
        email,
        name,
        role,
        created_at: createdAt,
        ...extendedFields
      },
      {
        id: authData.user.id,
        email,
        name,
        role,
        created_at: createdAt,
        ...extendedFields
      },
      {
        user_id: authData.user.id,
        email,
        name,
        role,
        created_at: createdAt,
        ...extendedFields
      }
    ];

    for (const payload of profilePayloads) {
      const result = await supabase
        .from('profiles')
        .insert(payload)
        .select()
        .single();

      if (!result.error) {
        profile = result.data;
        profileError = null;
        break;
      }

      profileError = result.error;
    }

    if (profileError) {
      console.error('❌ Profile creation error:', profileError.message);
      return c.json({ error: 'Failed to create profile: ' + profileError.message }, 400);
    }

    console.log('✅ Profile created for:', email);

    return c.json({ 
      success: true,
      user: profile
    });

  } catch (error: any) {
    console.error('❌ Create user route error:', error);
    return c.json({ error: 'Failed to create user: ' + error.message }, 500);
  }
});

// ============================================================================
// CREATE TEST USERS (creates all test users at once)
// ============================================================================

app.post("/make-server-385c5805/create-test-users", async (c) => {
  try {
    console.log('🧪 Creating test users...');

    const testUsers = [
      { email: 'admin@tutosucces.com', password: 'Admin123!', name: 'Administrateur B&D', role: 'admin' },
      { email: 'marie.dubois@tutosucces.com', password: 'Tuteur123!', name: 'Marie Dubois', role: 'tutor' },
      { email: 'jean.martin@tutosucces.com', password: 'Tuteur123!', name: 'Jean Martin', role: 'tutor' },
      { email: 'sophie.bernard@tutosucces.com', password: 'Tuteur123!', name: 'Sophie Bernard', role: 'tutor' },
      { email: 'lucas.tremblay@gmail.com', password: 'Etudiant123!', name: 'Lucas Tremblay', role: 'student' },
      { email: 'emma.gagnon@gmail.com', password: 'Etudiant123!', name: 'Emma Gagnon', role: 'student' },
      { email: 'parent.tremblay@gmail.com', password: 'Parent123!', name: 'Pierre Tremblay', role: 'parent' },
      { email: 'parent.gagnon@gmail.com', password: 'Parent123!', name: 'Isabelle Gagnon', role: 'parent' },
    ];

    const results = [];
    const errors = [];

    for (const user of testUsers) {
      try {
        // 1. Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          user_metadata: { name: user.name },
          email_confirm: true
        });

        if (authError) {
          errors.push({ email: user.email, error: authError.message });
          continue;
        }

        // 2. Create profile in database
        let profile = null;
        let profileError = null;

        const profilePayloads = [
          {
            id: authData.user.id,
            user_id: authData.user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            created_at: new Date().toISOString()
          },
          {
            id: authData.user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            created_at: new Date().toISOString()
          },
          {
            user_id: authData.user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            created_at: new Date().toISOString()
          }
        ];

        for (const payload of profilePayloads) {
          const result = await supabase
            .from('profiles')
            .insert(payload)
            .select()
            .single();

          if (!result.error) {
            profile = result.data;
            profileError = null;
            break;
          }

          profileError = result.error;
        }

        if (profileError) {
          errors.push({ email: user.email, error: profileError.message });
          continue;
        }

        results.push({ 
          email: user.email, 
          role: user.role, 
          id: authData.user.id,
          success: true 
        });
        console.log('✅ Created:', user.email);

      } catch (err: any) {
        errors.push({ email: user.email, error: err.message });
      }
    }

    return c.json({
      success: true,
      message: `Created ${results.length} users`,
      results,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error('❌ Create test users error:', error);
    return c.json({ error: 'Failed to create test users: ' + error.message }, 500);
  }
});

// ============================================================================
// START SERVER
// ============================================================================

console.log('🚀 Server starting...');
console.log('📍 Health check: /make-server-385c5805/health');
console.log('🔐 Login: /make-server-385c5805/login');
console.log('👤 Profile: /make-server-385c5805/profile');
console.log('➕ Create User: /make-server-385c5805/create-user');
console.log('🧪 Create Test Users: /make-server-385c5805/create-test-users');

Deno.serve(app.fetch);
