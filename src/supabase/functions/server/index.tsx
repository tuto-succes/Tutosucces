import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
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
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Supabase client for verifying user tokens
const supabaseAuth = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
);

// Helper to verify auth
async function verifyAuth(request: Request) {
  const authHeader = request.headers.get('Authorization');
  console.log('[Server Auth] Authorization header:', authHeader ? 'Present' : 'Missing');
  
  if (!authHeader) {
    console.log('[Server Auth] ✗ No Authorization header');
    return null;
  }
  
  const accessToken = authHeader.split(' ')[1];
  if (!accessToken) {
    console.log('[Server Auth] ✗ No token in Authorization header');
    return null;
  }
  
  console.log('[Server Auth] Token (first 20 chars):', accessToken.substring(0, 20) + '...');
  
  try {
    const { data: { user }, error } = await supabaseAuth.auth.getUser(accessToken);
    
    if (error) {
      console.error('[Server Auth] ✗ Error verifying token:', error.message);
      console.error('[Server Auth] Error code:', error.status);
      console.error('[Server Auth] Error name:', error.name);
      return null;
    }
    
    if (!user) {
      console.log('[Server Auth] ✗ No user found with token');
      return null;
    }
    
    console.log('[Server Auth] ✓ User verified:', user.email);
    return user;
  } catch (err: any) {
    console.error('[Server Auth] ✗ Exception during verification:', err.message);
    return null;
  }
}

// Health check endpoint
app.get("/make-server-385c5805/health", (c) => {
  return c.json({ status: "ok" });
});

// Test auth endpoint - requires valid token
app.get("/make-server-385c5805/test-auth", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    
    if (!user) {
      return c.json({ 
        error: 'Non autorisé',
        message: 'Token invalide ou manquant'
      }, 401);
    }

    return c.json({ 
      success: true,
      message: 'Authentification réussie',
      user: {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role,
        name: user.user_metadata?.name
      }
    });
  } catch (error: any) {
    console.error('Test auth error:', error);
    return c.json({ 
      error: 'Erreur serveur',
      message: error.message 
    }, 500);
  }
});

// ============== AUTH ==============

// Sign up
app.post("/make-server-385c5805/signup", async (c) => {
  try {
    const { email, password, name, role, profile } = await c.req.json();
    
    // Validate role
    if (!['student', 'tutor', 'admin'].includes(role)) {
      return c.json({ error: 'Invalid role' }, 400);
    }

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Error creating user during signup: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Store user profile in KV
    const userId = data.user.id;
    await kv.set(`user:${userId}`, {
      id: userId,
      email,
      name,
      role,
      createdAt: new Date().toISOString(),
      ...profile
    });

    // If tutor, create tutor profile
    if (role === 'tutor') {
      await kv.set(`tutor:${userId}`, {
        userId,
        bio: profile?.bio || '',
        subjects: profile?.subjects || [],
        levels: profile?.levels || [],
        rate: profile?.rate || 0,
        mode: profile?.mode || ['online'],
        experience: profile?.experience || '',
        diplomas: profile?.diplomas || '',
        active: true,
        rating: 0,
        reviewCount: 0,
        createdAt: new Date().toISOString()
      });
    }

    return c.json({ success: true, userId });
  } catch (error) {
    console.log(`Error in signup route: ${error}`);
    return c.json({ error: 'Signup failed' }, 500);
  }
});

// ============== USERS ==============

// Get user profile
app.get("/make-server-385c5805/users/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      console.log('User verification failed for /users/:id route');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userId = c.req.param('id');
    let profile = await kv.get(`user:${userId}`);
    
    // If profile doesn't exist, create it from auth metadata
    if (!profile) {
      console.log(`Profile not found for user ${userId}, creating from auth metadata`);
      const role = user.user_metadata?.role || 'student';
      const name = user.user_metadata?.name || user.email?.split('@')[0] || 'Utilisateur';
      
      profile = {
        id: userId,
        email: user.email,
        name: name,
        role: role,
        createdAt: new Date().toISOString()
      };
      
      await kv.set(`user:${userId}`, profile);
      
      // If tutor, create tutor profile
      if (role === 'tutor') {
        await kv.set(`tutor:${userId}`, {
          userId,
          bio: '',
          subjects: [],
          levels: [],
          rate: 0,
          mode: ['online'],
          experience: '',
          diplomas: '',
          active: true,
          rating: 0,
          reviewCount: 0,
          createdAt: new Date().toISOString()
        });
      }
    }

    return c.json(profile);
  } catch (error) {
    console.log(`Error fetching user profile: ${error}`);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

// Update user profile
app.put("/make-server-385c5805/users/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userId = c.req.param('id');
    if (user.id !== userId && user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const updates = await c.req.json();
    const currentProfile = await kv.get(`user:${userId}`);
    
    if (!currentProfile) {
      return c.json({ error: 'User not found' }, 404);
    }

    const updatedProfile = { ...currentProfile, ...updates, id: userId };
    await kv.set(`user:${userId}`, updatedProfile);

    return c.json(updatedProfile);
  } catch (error) {
    console.log(`Error updating user profile: ${error}`);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// Get all users (admin only)
app.get("/make-server-385c5805/users", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user || user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const users = await kv.getByPrefix('user:');
    return c.json(users);
  } catch (error) {
    console.log(`Error fetching users: ${error}`);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

// ============== TUTORS ==============

// Get all tutors (with filtering)
app.get("/make-server-385c5805/tutors", async (c) => {
  try {
    const subject = c.req.query('subject');
    const level = c.req.query('level');
    const mode = c.req.query('mode');

    let tutors = await kv.getByPrefix('tutor:');
    
    // Filter active tutors
    tutors = tutors.filter((t: any) => t.active);

    // Apply filters
    if (subject) {
      tutors = tutors.filter((t: any) => t.subjects?.includes(subject));
    }
    if (level) {
      tutors = tutors.filter((t: any) => t.levels?.includes(level));
    }
    if (mode) {
      tutors = tutors.filter((t: any) => t.mode?.includes(mode));
    }

    // Enrich with user data
    const enrichedTutors = await Promise.all(
      tutors.map(async (tutor: any) => {
        const userData = await kv.get(`user:${tutor.userId}`);
        return { ...tutor, user: userData };
      })
    );

    return c.json(enrichedTutors);
  } catch (error) {
    console.log(`Error fetching tutors: ${error}`);
    return c.json({ error: 'Failed to fetch tutors' }, 500);
  }
});

// Get tutor by ID
app.get("/make-server-385c5805/tutors/:id", async (c) => {
  try {
    const tutorId = c.req.param('id');
    const tutor = await kv.get(`tutor:${tutorId}`);
    
    if (!tutor) {
      return c.json({ error: 'Tutor not found' }, 404);
    }

    const userData = await kv.get(`user:${tutor.userId}`);
    return c.json({ ...tutor, user: userData });
  } catch (error) {
    console.log(`Error fetching tutor: ${error}`);
    return c.json({ error: 'Failed to fetch tutor' }, 500);
  }
});

// Update tutor profile
app.put("/make-server-385c5805/tutors/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const tutorId = c.req.param('id');
    if (user.id !== tutorId && user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const updates = await c.req.json();
    const currentProfile = await kv.get(`tutor:${tutorId}`);
    
    if (!currentProfile) {
      return c.json({ error: 'Tutor not found' }, 404);
    }

    const updatedProfile = { ...currentProfile, ...updates, userId: tutorId };
    await kv.set(`tutor:${tutorId}`, updatedProfile);

    return c.json(updatedProfile);
  } catch (error) {
    console.log(`Error updating tutor profile: ${error}`);
    return c.json({ error: 'Failed to update tutor' }, 500);
  }
});

// ============== SESSIONS ==============

// Create session
app.post("/make-server-385c5805/sessions", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { tutorId, date, duration, notes, subject } = await c.req.json();
    const sessionId = crypto.randomUUID();

    const session = {
      id: sessionId,
      studentId: user.id,
      tutorId,
      date,
      duration,
      notes: notes || '',
      subject,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    await kv.set(`session:${sessionId}`, session);

    return c.json(session);
  } catch (error) {
    console.log(`Error creating session: ${error}`);
    return c.json({ error: 'Failed to create session' }, 500);
  }
});

// Get sessions for user
app.get("/make-server-385c5805/sessions", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const role = user.user_metadata?.role;
    const status = c.req.query('status');

    let sessions = await kv.getByPrefix('session:');

    // Filter by role
    if (role === 'student') {
      sessions = sessions.filter((s: any) => s.studentId === user.id);
    } else if (role === 'tutor') {
      sessions = sessions.filter((s: any) => s.tutorId === user.id);
    }
    // admin gets all sessions

    // Filter by status if provided
    if (status) {
      sessions = sessions.filter((s: any) => s.status === status);
    }

    // Sort by date
    sessions.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return c.json(sessions);
  } catch (error) {
    console.log(`Error fetching sessions: ${error}`);
    return c.json({ error: 'Failed to fetch sessions' }, 500);
  }
});

// Update session status
app.put("/make-server-385c5805/sessions/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const sessionId = c.req.param('id');
    const updates = await c.req.json();
    const session = await kv.get(`session:${sessionId}`);

    if (!session) {
      return c.json({ error: 'Session not found' }, 404);
    }

    // Check permissions
    const role = user.user_metadata?.role;
    if (role !== 'admin' && session.studentId !== user.id && session.tutorId !== user.id) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const updatedSession = { ...session, ...updates, id: sessionId };
    await kv.set(`session:${sessionId}`, updatedSession);

    return c.json(updatedSession);
  } catch (error) {
    console.log(`Error updating session: ${error}`);
    return c.json({ error: 'Failed to update session' }, 500);
  }
});

// Add tutor comment to session
app.put("/make-server-385c5805/sessions/:id/comment", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const sessionId = c.req.param('id');
    const { comment } = await c.req.json();
    const session = await kv.get(`session:${sessionId}`);

    if (!session) {
      return c.json({ error: 'Session not found' }, 404);
    }

    // Only tutor can add comment
    if (session.tutorId !== user.id && user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Only the tutor can add comments' }, 403);
    }

    const updatedSession = { 
      ...session, 
      tutorComment: comment,
      commentAddedAt: new Date().toISOString(),
      id: sessionId 
    };
    await kv.set(`session:${sessionId}`, updatedSession);

    return c.json(updatedSession);
  } catch (error) {
    console.log(`Error adding comment to session: ${error}`);
    return c.json({ error: 'Failed to add comment' }, 500);
  }
});

// ============== MESSAGES ==============

// Send message
app.post("/make-server-385c5805/messages", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { recipientId, content } = await c.req.json();
    const messageId = crypto.randomUUID();

    const message = {
      id: messageId,
      senderId: user.id,
      recipientId,
      content,
      read: false,
      createdAt: new Date().toISOString()
    };

    await kv.set(`message:${messageId}`, message);

    return c.json(message);
  } catch (error) {
    console.log(`Error sending message: ${error}`);
    return c.json({ error: 'Failed to send message' }, 500);
  }
});

// Get conversations
app.get("/make-server-385c5805/messages", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const withUserId = c.req.query('with');

    let messages = await kv.getByPrefix('message:');

    // Filter messages for this user
    if (withUserId) {
      messages = messages.filter((m: any) => 
        (m.senderId === user.id && m.recipientId === withUserId) ||
        (m.recipientId === user.id && m.senderId === withUserId)
      );
    } else {
      messages = messages.filter((m: any) => 
        m.senderId === user.id || m.recipientId === user.id
      );
    }

    // Sort by date
    messages.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return c.json(messages);
  } catch (error) {
    console.log(`Error fetching messages: ${error}`);
    return c.json({ error: 'Failed to fetch messages' }, 500);
  }
});

// Mark message as read
app.put("/make-server-385c5805/messages/:id/read", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const messageId = c.req.param('id');
    const message = await kv.get(`message:${messageId}`);

    if (!message) {
      return c.json({ error: 'Message not found' }, 404);
    }

    if (message.recipientId !== user.id) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const updatedMessage = { ...message, read: true };
    await kv.set(`message:${messageId}`, updatedMessage);

    return c.json(updatedMessage);
  } catch (error) {
    console.log(`Error marking message as read: ${error}`);
    return c.json({ error: 'Failed to update message' }, 500);
  }
});

// ============== PAYMENTS ==============

// Create payment record
app.post("/make-server-385c5805/payments", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { sessionId, amount, method } = await c.req.json();
    const paymentId = crypto.randomUUID();

    const payment = {
      id: paymentId,
      sessionId,
      studentId: user.id,
      amount,
      method,
      status: 'completed',
      createdAt: new Date().toISOString()
    };

    await kv.set(`payment:${paymentId}`, payment);

    return c.json(payment);
  } catch (error) {
    console.log(`Error creating payment: ${error}`);
    return c.json({ error: 'Failed to create payment' }, 500);
  }
});

// Get payments
app.get("/make-server-385c5805/payments", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const role = user.user_metadata?.role;
    let payments = await kv.getByPrefix('payment:');

    // Filter by role
    if (role === 'student') {
      payments = payments.filter((p: any) => p.studentId === user.id);
    } else if (role === 'tutor') {
      // Get sessions for this tutor to find related payments
      const sessions = await kv.getByPrefix('session:');
      const tutorSessionIds = sessions
        .filter((s: any) => s.tutorId === user.id)
        .map((s: any) => s.id);
      payments = payments.filter((p: any) => tutorSessionIds.includes(p.sessionId));
    }
    // admin gets all payments

    // Sort by date
    payments.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json(payments);
  } catch (error) {
    console.log(`Error fetching payments: ${error}`);
    return c.json({ error: 'Failed to fetch payments' }, 500);
  }
});

// ============== REVIEWS ==============

// Create review
app.post("/make-server-385c5805/reviews", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { tutorId, sessionId, rating, comment } = await c.req.json();
    const reviewId = crypto.randomUUID();

    const review = {
      id: reviewId,
      tutorId,
      sessionId,
      studentId: user.id,
      rating,
      comment,
      createdAt: new Date().toISOString()
    };

    await kv.set(`review:${reviewId}`, review);

    // Update tutor rating
    const reviews = await kv.getByPrefix(`review:`);
    const tutorReviews = reviews.filter((r: any) => r.tutorId === tutorId);
    const avgRating = tutorReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / tutorReviews.length;

    const tutor = await kv.get(`tutor:${tutorId}`);
    if (tutor) {
      await kv.set(`tutor:${tutorId}`, {
        ...tutor,
        rating: avgRating,
        reviewCount: tutorReviews.length
      });
    }

    return c.json(review);
  } catch (error) {
    console.log(`Error creating review: ${error}`);
    return c.json({ error: 'Failed to create review' }, 500);
  }
});

// Get reviews for tutor
app.get("/make-server-385c5805/reviews/:tutorId", async (c) => {
  try {
    const tutorId = c.req.param('tutorId');
    const reviews = await kv.getByPrefix('review:');
    const tutorReviews = reviews.filter((r: any) => r.tutorId === tutorId);

    // Sort by date
    tutorReviews.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json(tutorReviews);
  } catch (error) {
    console.log(`Error fetching reviews: ${error}`);
    return c.json({ error: 'Failed to fetch reviews' }, 500);
  }
});

// ============== STATISTICS (Admin) ==============

app.get("/make-server-385c5805/stats", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user || user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const users = await kv.getByPrefix('user:');
    const sessions = await kv.getByPrefix('session:');
    const payments = await kv.getByPrefix('payment:');
    const tutors = await kv.getByPrefix('tutor:');

    const stats = {
      totalUsers: users.length,
      totalStudents: users.filter((u: any) => u.role === 'student').length,
      totalTutors: tutors.length,
      totalSessions: sessions.length,
      completedSessions: sessions.filter((s: any) => s.status === 'completed').length,
      totalRevenue: payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
      activeTutors: tutors.filter((t: any) => t.active).length
    };

    return c.json(stats);
  } catch (error) {
    console.log(`Error fetching stats: ${error}`);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

// ============== CONTACT ==============

app.post("/make-server-385c5805/contact", async (c) => {
  try {
    const { firstName, lastName, email, phone, message } = await c.req.json();

    console.log('Contact form received:', { firstName, lastName, email, phone: phone || 'N/A' });

    // Validate required fields
    if (!firstName || !lastName || !email || !message) {
      console.log('Missing required fields');
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Store contact message in KV first (always works)
    const contactId = crypto.randomUUID();
    await kv.set(`contact:${contactId}`, {
      id: contactId,
      firstName,
      lastName,
      email,
      phone: phone || '',
      message,
      status: 'new',
      createdAt: new Date().toISOString()
    });

    console.log('Contact message stored successfully with ID:', contactId);

    // Try to send emails, but don't fail if it doesn't work
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (resendApiKey && resendApiKey !== 'your-resend-api-key-here') {
      try {
        console.log('Attempting to send emails...');

        // Email to admin
        const adminEmailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`
          },
          body: JSON.stringify({
            from: 'Tuto-Succès B&D <onboarding@resend.dev>',
            to: ['delivered@resend.dev'], // Resend test email - emails will appear in your Resend dashboard
            subject: `Nouveau message de contact de ${firstName} ${lastName}`,
            html: `
              <h2>Nouveau message de contact</h2>
              <p><strong>Nom:</strong> ${firstName} ${lastName}</p>
              <p><strong>Email:</strong> ${email}</p>
              ${phone ? `<p><strong>Téléphone:</strong> ${phone}</p>` : ''}
              <p><strong>Message:</strong></p>
              <p>${message}</p>
              <hr />
              <p><em>Message ID: ${contactId}</em></p>
            `
          })
        });

        const adminEmailData = await adminEmailResponse.json();
        console.log('Admin email response:', adminEmailData);
        console.log('Admin email status:', adminEmailResponse.status);

        if (adminEmailResponse.ok) {
          console.log('✅ Admin email sent successfully!');
          
          // Confirmation email to user (using their actual email)
          const confirmationEmailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${resendApiKey}`
            },
            body: JSON.stringify({
              from: 'Tuto-Succès B&D <onboarding@resend.dev>',
              to: [email], // Send to the user's actual email
              subject: 'Confirmation de réception de votre message - Tuto-Succès B&D',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #2E5CA8;">Merci de nous avoir contactés, ${firstName}!</h2>
                  <p>Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.</p>
                  
                  <div style="background-color: #F8F9FA; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #2C3E50; margin-top: 0;">Votre message :</h3>
                    <p style="color: #7F8C8D;">${message}</p>
                  </div>
                  
                  <p>Notre équipe vous contactera à l'adresse : <strong>${email}</strong></p>
                  ${phone ? `<p>Téléphone : <strong>${phone}</strong></p>` : ''}
                  
                  <hr style="border: none; border-top: 1px solid #E0E0E0; margin: 30px 0;" />
                  
                  <p style="color: #7F8C8D; font-size: 14px;">
                    Cordialement,<br />
                    <strong style="color: #E74C3C;">L'équipe Tuto-Succès B&D</strong>
                  </p>
                </div>
              `
            })
          });

          const confirmationEmailData = await confirmationEmailResponse.json();
          console.log('Confirmation email response:', confirmationEmailData);
          console.log('Confirmation email status:', confirmationEmailResponse.status);
          
          if (confirmationEmailResponse.ok) {
            console.log(`✅ Confirmation email sent successfully to ${email}!`);
          } else {
            console.log(`❌ Confirmation email failed to ${email}:`, confirmationEmailData);
          }
        } else {
          console.log('❌ Admin email sending failed:', adminEmailData);
        }
      } catch (emailError) {
        console.log('Email error (non-fatal):', emailError);
      }
    } else {
      console.log('Email service not configured, but message is saved');
    }

    return c.json({ 
      success: true, 
      message: 'Votre message a été enregistré avec succès',
      contactId 
    });
  } catch (error) {
    console.log(`Error processing contact form: ${error}`);
    return c.json({ error: 'Failed to process contact form', details: error.message }, 500);
  }
});

// Get all contact messages (no auth required for now - can add admin check later)
app.get("/make-server-385c5805/contacts", async (c) => {
  try {
    const contacts = await kv.getByPrefix('contact:');
    
    // Sort by date (newest first)
    contacts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return c.json(contacts);
  } catch (error) {
    console.log(`Error fetching contact messages: ${error}`);
    return c.json({ error: 'Failed to fetch contacts' }, 500);
  }
});

// Update contact message status
app.put("/make-server-385c5805/contacts/:id", async (c) => {
  try {
    const contactId = c.req.param('id');
    const updates = await c.req.json();
    const contact = await kv.get(`contact:${contactId}`);

    if (!contact) {
      return c.json({ error: 'Contact message not found' }, 404);
    }

    const updatedContact = { ...contact, ...updates, id: contactId };
    await kv.set(`contact:${contactId}`, updatedContact);

    return c.json(updatedContact);
  } catch (error) {
    console.log(`Error updating contact message: ${error}`);
    return c.json({ error: 'Failed to update contact' }, 500);
  }
});

// Delete contact message
app.delete("/make-server-385c5805/contacts/:id", async (c) => {
  try {
    const contactId = c.req.param('id');
    await kv.del(`contact:${contactId}`);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting contact message: ${error}`);
    return c.json({ error: 'Failed to delete contact' }, 500);
  }
});

// ============== NEWSLETTER ==============

// Subscribe to newsletter
app.post("/make-server-385c5805/newsletter/subscribe", async (c) => {
  try {
    const { email } = await c.req.json();

    console.log('Newsletter subscription received:', email);

    // Validate email
    if (!email || !email.includes('@')) {
      console.log('Invalid email provided');
      return c.json({ error: 'Adresse e-mail invalide' }, 400);
    }

    // Check if email already subscribed
    const existingSubscription = await kv.get(`newsletter:${email}`);
    if (existingSubscription) {
      console.log('Email already subscribed:', email);
      return c.json({ error: 'Cette adresse e-mail est déjà inscrite à notre infolettre' }, 400);
    }

    // Store newsletter subscription in KV
    const subscriptionId = crypto.randomUUID();
    await kv.set(`newsletter:${email}`, {
      id: subscriptionId,
      email,
      status: 'active',
      subscribedAt: new Date().toISOString()
    });

    console.log('Newsletter subscription stored successfully for:', email);

    // Try to send notification email to admin (optional)
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (resendApiKey && resendApiKey !== 'your-resend-api-key-here') {
      try {
        console.log('Sending admin notification email...');

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`
          },
          body: JSON.stringify({
            from: 'Tuto-Succès B&D <onboarding@resend.dev>',
            to: ['delivered@resend.dev'], // Admin notification
            subject: `Nouvelle inscription à l'infolettre: ${email}`,
            html: `
              <h2>Nouvelle inscription à l'infolettre</h2>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleString('fr-CA')}</p>
              <hr />
              <p><em>Subscription ID: ${subscriptionId}</em></p>
            `
          })
        });

        console.log('✅ Admin notification sent for newsletter subscription');
      } catch (emailError) {
        console.log('Email notification error (non-fatal):', emailError);
      }
    }

    return c.json({ 
      success: true, 
      message: 'Merci de vous être inscrit à notre infolettre!'
    });
  } catch (error) {
    console.log(`Error processing newsletter subscription: ${error}`);
    return c.json({ error: 'Erreur lors de l\'inscription', details: error.message }, 500);
  }
});

// Get all newsletter subscriptions (admin only)
app.get("/make-server-385c5805/newsletter/subscriptions", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user || user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const subscriptions = await kv.getByPrefix('newsletter:');
    
    // Sort by date (newest first)
    subscriptions.sort((a: any, b: any) => 
      new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime()
    );
    
    return c.json(subscriptions);
  } catch (error) {
    console.log(`Error fetching newsletter subscriptions: ${error}`);
    return c.json({ error: 'Failed to fetch subscriptions' }, 500);
  }
});

// ============== TUTOR REGISTRATIONS ==============

// Submit tutor registration
app.post("/make-server-385c5805/registrations", async (c) => {
  try {
    const { prenom, nom, email, telephone, niveau, heures, service, matieres } = await c.req.json();

    console.log('Tutor registration received:', { prenom, nom, email, niveau, heures, service });

    // Validate required fields
    if (!email) {
      console.log('Missing required email field');
      return c.json({ error: 'L\'adresse e-mail est requise' }, 400);
    }

    // Store registration in KV
    const registrationId = crypto.randomUUID();
    const registration = {
      id: registrationId,
      prenom: prenom || '',
      nom: nom || '',
      email,
      telephone: telephone || '',
      niveau: niveau || '',
      heures: heures || '',
      service: service || '',
      matieres: matieres || [],
      status: 'new',
      createdAt: new Date().toISOString()
    };

    await kv.set(`registration:${registrationId}`, registration);

    console.log('Tutor registration stored successfully:', registrationId);

    // Try to send notification email to admin (optional)
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (resendApiKey && resendApiKey !== 'your-resend-api-key-here') {
      try {
        console.log('Sending admin notification email...');

        const matieresText = Array.isArray(matieres) ? matieres.join(', ') : matieres;

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`
          },
          body: JSON.stringify({
            from: 'noreply@tutosucces.com',
            to: 'admin@tutosucces.com',
            subject: `Nouvelle inscription - ${prenom} ${nom}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #E74C3C;">Nouvelle demande d'inscription</h2>
                <p>Une nouvelle inscription a été soumise sur le site Tuto-Succès B&D.</p>
                
                <div style="background-color: #F8F9FA; padding: 20px; border-radius: 10px; margin: 20px 0;">
                  <h3 style="color: #2C3E50; margin-top: 0;">Informations de l'élève</h3>
                  <p><strong>Nom:</strong> ${prenom} ${nom}</p>
                  <p><strong>E-mail:</strong> ${email}</p>
                  <p><strong>Téléphone:</strong> ${telephone || 'Non fourni'}</p>
                  <p><strong>Niveau:</strong> ${niveau}</p>
                  <p><strong>Heures souhaitées:</strong> ${heures}/semaine</p>
                  <p><strong>Service:</strong> ${service}</p>
                  <p><strong>Matières:</strong> ${matieresText}</p>
                  <p><strong>Date d'inscription:</strong> ${new Date().toLocaleString('fr-CA')}</p>
                </div>
                
                <p style="color: #7F8C8D; font-size: 12px;">
                  Cette inscription a été enregistrée automatiquement dans le système.
                </p>
              </div>
            `
          })
        });

        console.log('Admin notification email sent successfully');
      } catch (emailError) {
        console.log('Error sending admin email:', emailError);
        // Don't fail the request if email fails
      }
    } else {
      console.log('Email service not configured, but registration is saved');
    }

    return c.json({ 
      success: true, 
      message: 'Votre inscription a été enregistrée avec succès',
      registrationId 
    });
  } catch (error) {
    console.log(`Error processing registration: ${error}`);
    return c.json({ error: 'Failed to process registration', details: error.message }, 500);
  }
});

// Get all registrations (admin only)
app.get("/make-server-385c5805/registrations", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user || user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const registrations = await kv.getByPrefix('registration:');
    
    // Sort by date (newest first)
    registrations.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return c.json(registrations);
  } catch (error) {
    console.log(`Error fetching registrations: ${error}`);
    return c.json({ error: 'Failed to fetch registrations' }, 500);
  }
});

// Update registration status
app.put("/make-server-385c5805/registrations/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user || user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const registrationId = c.req.param('id');
    const updates = await c.req.json();
    const registration = await kv.get(`registration:${registrationId}`);

    if (!registration) {
      return c.json({ error: 'Registration not found' }, 404);
    }

    const updatedRegistration = { ...registration, ...updates, id: registrationId };
    await kv.set(`registration:${registrationId}`, updatedRegistration);

    return c.json(updatedRegistration);
  } catch (error) {
    console.log(`Error updating registration: ${error}`);
    return c.json({ error: 'Failed to update registration' }, 500);
  }
});

// Delete registration
app.delete("/make-server-385c5805/registrations/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user || user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const registrationId = c.req.param('id');
    await kv.del(`registration:${registrationId}`);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting registration: ${error}`);
    return c.json({ error: 'Failed to delete registration' }, 500);
  }
});

// ============== TUTOR AVAILABILITY ==============

// Get tutor availabilities
app.get("/make-server-385c5805/tutors/:id/availabilities", async (c) => {
  try {
    const tutorId = c.req.param('id');
    const availability = await kv.get(`availability:${tutorId}`);
    
    return c.json({ availabilities: availability?.timeSlots || [] });
  } catch (error) {
    console.log(`Error fetching availabilities: ${error}`);
    return c.json({ error: 'Failed to fetch availabilities' }, 500);
  }
});

// Update tutor availabilities
app.put("/make-server-385c5805/tutors/:id/availabilities", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const tutorId = c.req.param('id');
    if (user.id !== tutorId && user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const { availabilities } = await c.req.json();
    
    await kv.set(`availability:${tutorId}`, {
      userId: tutorId,
      timeSlots: availabilities,
      updatedAt: new Date().toISOString()
    });

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error updating availabilities: ${error}`);
    return c.json({ error: 'Failed to update availabilities' }, 500);
  }
});

// ============== SESSION REQUESTS ==============

// Create session request
app.post("/make-server-385c5805/session-requests", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { tutorId, subject, requestedDate, requestedTime, duration, notes } = await c.req.json();
    const requestId = crypto.randomUUID();

    // Get student info
    const studentProfile = await kv.get(`user:${user.id}`);

    const sessionRequest = {
      id: requestId,
      studentId: user.id,
      studentName: studentProfile?.name || user.email,
      studentEmail: user.email,
      tutorId,
      subject,
      requestedDate,
      requestedTime,
      duration,
      notes: notes || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    await kv.set(`sessionrequest:${requestId}`, sessionRequest);

    return c.json(sessionRequest);
  } catch (error) {
    console.log(`Error creating session request: ${error}`);
    return c.json({ error: 'Failed to create session request' }, 500);
  }
});

// Get session requests
app.get("/make-server-385c5805/session-requests", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const tutorId = c.req.query('tutorId');
    let requests = await kv.getByPrefix('sessionrequest:');

    // Filter by tutor if provided
    if (tutorId) {
      requests = requests.filter((r: any) => r.tutorId === tutorId);
    }

    // Sort by date
    requests.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json(requests);
  } catch (error) {
    console.log(`Error fetching session requests: ${error}`);
    return c.json({ error: 'Failed to fetch session requests' }, 500);
  }
});

// Accept session request
app.post("/make-server-385c5805/session-requests/:id/accept", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const requestId = c.req.param('id');
    const sessionRequest = await kv.get(`sessionrequest:${requestId}`);

    if (!sessionRequest) {
      return c.json({ error: 'Session request not found' }, 404);
    }

    // Verify the tutor is the one accepting
    if (sessionRequest.tutorId !== user.id) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    // Create a confirmed session
    const sessionId = crypto.randomUUID();
    const meetingId = crypto.randomUUID().substring(0, 8);
    const meetingLink = `https://meet.jit.si/tutosucces-${meetingId}`;

    const session = {
      id: sessionId,
      studentId: sessionRequest.studentId,
      tutorId: sessionRequest.tutorId,
      subject: sessionRequest.subject,
      date: sessionRequest.requestedDate,
      time: sessionRequest.requestedTime,
      duration: sessionRequest.duration,
      notes: sessionRequest.notes,
      status: 'confirmed',
      meetingLink,
      createdAt: new Date().toISOString()
    };

    await kv.set(`session:${sessionId}`, session);

    // Update request status
    await kv.set(`sessionrequest:${requestId}`, {
      ...sessionRequest,
      status: 'accepted',
      sessionId
    });

    return c.json({ success: true, sessionId, meetingLink });
  } catch (error) {
    console.log(`Error accepting session request: ${error}`);
    return c.json({ error: 'Failed to accept session request' }, 500);
  }
});

// Reject session request
app.post("/make-server-385c5805/session-requests/:id/reject", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const requestId = c.req.param('id');
    const sessionRequest = await kv.get(`sessionrequest:${requestId}`);

    if (!sessionRequest) {
      return c.json({ error: 'Session request not found' }, 404);
    }

    // Verify the tutor is the one rejecting
    if (sessionRequest.tutorId !== user.id) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    // Update request status
    await kv.set(`sessionrequest:${requestId}`, {
      ...sessionRequest,
      status: 'rejected'
    });

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error rejecting session request: ${error}`);
    return c.json({ error: 'Failed to reject session request' }, 500);
  }
});

// ============== SESSION REPORTS ==============

// Create session report
app.post("/make-server-385c5805/session-reports", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const {
      sessionId,
      sessionObjective,
      topicsCovered,
      workDone,
      studentEngagement,
      studentMood,
      difficulties,
      progress,
      homework,
      nextSessionFocus,
      parentSummary
    } = await c.req.json();

    // Get session details
    const session = await kv.get(`session:${sessionId}`);
    if (!session) {
      return c.json({ error: 'Session not found' }, 404);
    }

    // Verify tutor owns this session
    if (session.tutorId !== user.id) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    // Get student and tutor info
    const studentProfile = await kv.get(`user:${session.studentId}`);
    const tutorProfile = await kv.get(`user:${user.id}`);

    // Get session number (count previous sessions with same student/tutor)
    const allSessions = await kv.getByPrefix('session:');
    const sessionNumber = allSessions.filter((s: any) => 
      s.studentId === session.studentId && 
      s.tutorId === session.tutorId &&
      new Date(s.date) <= new Date(session.date)
    ).length;

    // Calculate duration
    const startTime = session.time || '00:00';
    const duration = session.duration || 60;
    const [hours, minutes] = startTime.split(':').map(Number);
    const endDate = new Date();
    endDate.setHours(hours, minutes + duration);
    const endTime = endDate.toTimeString().slice(0, 5);

    const reportId = crypto.randomUUID();
    const report = {
      id: reportId,
      sessionId,
      studentId: session.studentId,
      studentName: studentProfile?.name || 'Élève',
      tutorId: user.id,
      tutorName: tutorProfile?.name || 'Tuteur',
      subject: session.subject,
      sessionDate: session.date,
      startTime,
      endTime,
      sessionDuration: duration,
      sessionNumber,
      sessionObjective,
      topicsCovered,
      workDone,
      studentEngagement,
      studentMood,
      difficulties,
      progress,
      homework,
      nextSessionFocus,
      parentSummary,
      createdAt: new Date().toISOString()
    };

    await kv.set(`sessionreport:${reportId}`, report);

    return c.json(report);
  } catch (error) {
    console.log(`Error creating session report: ${error}`);
    return c.json({ error: 'Failed to create session report' }, 500);
  }
});

// Get session reports
app.get("/make-server-385c5805/session-reports", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const tutorId = c.req.query('tutorId');
    const studentId = c.req.query('studentId');

    let reports = await kv.getByPrefix('sessionreport:');

    // Filter by tutor or student
    if (tutorId) {
      reports = reports.filter((r: any) => r.tutorId === tutorId);
    }
    if (studentId) {
      reports = reports.filter((r: any) => r.studentId === studentId);
    }

    // Sort by date
    reports.sort((a: any, b: any) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());

    return c.json(reports);
  } catch (error) {
    console.log(`Error fetching session reports: ${error}`);
    return c.json({ error: 'Failed to fetch session reports' }, 500);
  }
});

// Get single session report
app.get("/make-server-385c5805/session-reports/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const reportId = c.req.param('id');
    const report = await kv.get(`sessionreport:${reportId}`);

    if (!report) {
      return c.json({ error: 'Report not found' }, 404);
    }

    // Verify user has access (tutor, student, or admin)
    const role = user.user_metadata?.role;
    if (role !== 'admin' && report.tutorId !== user.id && report.studentId !== user.id) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    return c.json(report);
  } catch (error) {
    console.log(`Error fetching session report: ${error}`);
    return c.json({ error: 'Failed to fetch session report' }, 500);
  }
});

// ============== INVOICES ==============

// Get invoices for user (student or tutor)
app.get("/make-server-385c5805/invoices", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userId = c.req.query('userId');
    const role = c.req.query('role');

    if (!userId || !role) {
      return c.json({ error: 'Missing userId or role' }, 400);
    }

    // Get all invoices
    const allInvoices = await kv.getByPrefix('invoice:');
    let invoices = [];

    if (role === 'student') {
      // Student sees invoices where they are the client
      invoices = allInvoices.filter((inv: any) => inv.studentId === userId);
    } else if (role === 'tutor') {
      // Tutor sees invoices where they provided services
      invoices = allInvoices.filter((inv: any) => inv.tutorId === userId);
    }

    // Sort by date (most recent first)
    invoices.sort((a: any, b: any) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());

    return c.json(invoices);
  } catch (error) {
    console.log(`Error fetching invoices: ${error}`);
    return c.json({ error: 'Failed to fetch invoices' }, 500);
  }
});

// Create invoice (admin only or automated)
app.post("/make-server-385c5805/invoices", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Only admin can create invoices manually
    const role = user.user_metadata?.role;
    if (role !== 'admin') {
      return c.json({ error: 'Only admins can create invoices' }, 403);
    }

    const invoiceData = await c.req.json();
    const invoiceId = `TS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;
    const id = crypto.randomUUID();

    const invoice = {
      id,
      invoiceId,
      invoiceDate: invoiceData.invoiceDate || new Date().toISOString(),
      dueDate: invoiceData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      paymentStatus: invoiceData.paymentStatus || 'À payer',
      clientName: invoiceData.clientName,
      clientAddress: invoiceData.clientAddress || 'En Ligne',
      clientEmail: invoiceData.clientEmail,
      studentName: invoiceData.studentName,
      studentId: invoiceData.studentId,
      tutorId: invoiceData.tutorId,
      lineItems: invoiceData.lineItems || [],
      subtotal: invoiceData.subtotal || 0,
      discountAmount: invoiceData.discountAmount || 0,
      taxRateGST: invoiceData.taxRateGST || 0.05,
      taxRateQST: invoiceData.taxRateQST || 0.09975,
      taxAmountGST: invoiceData.taxAmountGST || 0,
      taxAmountQST: invoiceData.taxAmountQST || 0,
      totalDue: invoiceData.totalDue || 0,
      paymentLinkUrl: invoiceData.paymentLinkUrl || '',
      paymentMethods: 'Visa, Mastercard, Interac',
      paymentInstructions: `Merci d'effectuer le paiement au plus tard le ${new Date(invoiceData.dueDate || Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}.`,
      createdAt: new Date().toISOString()
    };

    await kv.set(`invoice:${id}`, invoice);

    return c.json(invoice);
  } catch (error) {
    console.log(`Error creating invoice: ${error}`);
    return c.json({ error: 'Failed to create invoice' }, 500);
  }
});

// Update invoice status (for payment processing)
app.put("/make-server-385c5805/invoices/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const invoiceId = c.req.param('id');
    const updates = await c.req.json();
    const invoice = await kv.get(`invoice:${invoiceId}`);

    if (!invoice) {
      return c.json({ error: 'Invoice not found' }, 404);
    }

    // Only admin can update invoices
    const role = user.user_metadata?.role;
    if (role !== 'admin') {
      return c.json({ error: 'Only admins can update invoices' }, 403);
    }

    const updatedInvoice = { ...invoice, ...updates, id: invoiceId };
    await kv.set(`invoice:${invoiceId}`, updatedInvoice);

    return c.json(updatedInvoice);
  } catch (error) {
    console.log(`Error updating invoice: ${error}`);
    return c.json({ error: 'Failed to update invoice' }, 500);
  }
});

// ============== TUTOR APPLICATIONS ==============

// Submit tutor application with CV
app.post("/make-server-385c5805/tutor-applications", async (c) => {
  try {
    const formData = await c.req.formData();
    
    const prenom = formData.get('prenom')?.toString() || '';
    const nom = formData.get('nom')?.toString() || '';
    const email = formData.get('email')?.toString() || '';
    const telephone = formData.get('telephone')?.toString() || '';
    const niveaux = JSON.parse(formData.get('niveaux')?.toString() || '[]');
    const heures = formData.get('heures')?.toString() || '';
    const matieres = JSON.parse(formData.get('matieres')?.toString() || '{}');
    const cvFile = formData.get('cv') as File;

    console.log('Tutor application received:', { prenom, nom, email, niveaux, heures });

    // Validate required fields
    if (!email || !prenom || !nom || !telephone) {
      console.log('Missing required fields');
      return c.json({ error: 'Tous les champs obligatoires doivent être remplis' }, 400);
    }

    if (!niveaux || niveaux.length === 0) {
      console.log('No levels selected');
      return c.json({ error: 'Veuillez sélectionner au moins un niveau d\'enseignement' }, 400);
    }

    if (!cvFile) {
      console.log('No CV file uploaded');
      return c.json({ error: 'Le CV est requis' }, 400);
    }

    // Generate application ID
    const applicationId = crypto.randomUUID();

    // Create bucket if it doesn't exist
    const bucketName = 'make-385c5805-tutor-cvs';
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log('Creating bucket:', bucketName);
      const { error: bucketError } = await supabase.storage.createBucket(bucketName, {
        public: false
      });
      if (bucketError) {
        console.log('Error creating bucket:', bucketError);
      }
    }

    // Upload CV to Supabase Storage
    const cvFileName = `${applicationId}-${cvFile.name}`;
    const cvBuffer = await cvFile.arrayBuffer();
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(cvFileName, cvBuffer, {
        contentType: cvFile.type,
        upsert: false
      });

    if (uploadError) {
      console.log('Error uploading CV:', uploadError);
      return c.json({ error: 'Erreur lors du téléchargement du CV' }, 500);
    }

    console.log('CV uploaded successfully:', uploadData.path);

    // Store application in KV
    await kv.set(`tutor-application:${applicationId}`, {
      id: applicationId,
      prenom,
      nom,
      email,
      telephone,
      niveaux,
      heures,
      matieres,
      cvPath: uploadData.path,
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    console.log('Application stored successfully with ID:', applicationId);

    return c.json({ 
      success: true, 
      message: 'Votre candidature a été envoyée avec succès',
      applicationId 
    });
  } catch (error) {
    console.log(`Error processing tutor application: ${error}`);
    return c.json({ error: 'Erreur lors du traitement de la candidature', details: error.message }, 500);
  }
});

// Get all tutor applications (admin only)
app.get("/make-server-385c5805/tutor-applications", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user || user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const applications = await kv.getByPrefix('tutor-application:');
    
    // Sort by date (newest first)
    applications.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return c.json(applications);
  } catch (error) {
    console.log(`Error fetching tutor applications: ${error}`);
    return c.json({ error: 'Failed to fetch applications' }, 500);
  }
});

// Get CV download URL
app.get("/make-server-385c5805/tutor-applications/:id/cv", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user || user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const applicationId = c.req.param('id');
    const application = await kv.get(`tutor-application:${applicationId}`);

    if (!application || !application.cvPath) {
      return c.json({ error: 'CV not found' }, 404);
    }

    const bucketName = 'make-385c5805-tutor-cvs';
    
    // Create signed URL (valid for 1 hour)
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(application.cvPath, 3600);

    if (error) {
      console.log('Error creating signed URL:', error);
      return c.json({ error: 'Failed to get CV URL' }, 500);
    }

    return c.json({ url: data.signedUrl });
  } catch (error) {
    console.log(`Error getting CV URL: ${error}`);
    return c.json({ error: 'Failed to get CV' }, 500);
  }
});

// Update application status
app.put("/make-server-385c5805/tutor-applications/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user || user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const applicationId = c.req.param('id');
    const updates = await c.req.json();
    const application = await kv.get(`tutor-application:${applicationId}`);

    if (!application) {
      return c.json({ error: 'Application not found' }, 404);
    }

    const updatedApplication = { ...application, ...updates, id: applicationId };
    await kv.set(`tutor-application:${applicationId}`, updatedApplication);

    return c.json(updatedApplication);
  } catch (error) {
    console.log(`Error updating application: ${error}`);
    return c.json({ error: 'Failed to update application' }, 500);
  }
});

// Delete application
app.delete("/make-server-385c5805/tutor-applications/:id", async (c) => {
  try {
    const user = await verifyAuth(c.req.raw);
    if (!user || user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const applicationId = c.req.param('id');
    const application = await kv.get(`tutor-application:${applicationId}`);

    if (application && application.cvPath) {
      // Delete CV from storage
      const bucketName = 'make-385c5805-tutor-cvs';
      await supabase.storage.from(bucketName).remove([application.cvPath]);
    }

    await kv.del(`tutor-application:${applicationId}`);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting application: ${error}`);
    return c.json({ error: 'Failed to delete application' }, 500);
  }
});

Deno.serve(app.fetch);