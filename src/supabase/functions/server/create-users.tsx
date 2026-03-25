// Script pour créer tous les utilisateurs de test
// À exécuter UNE SEULE FOIS après la création des tables

import { createClient } from "npm:@supabase/supabase-js@2";
console.log(
  "SERVICE ROLE KEY:",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
);
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

const users = [
  // Admin
  {
    email: "admin@tutosucces.com",
    password: "Admin123!",
    user_metadata: {
      name: "Administrateur",
      role: "admin",
    },
  },
  // Étudiants
  {
    email: "eleve.test@example.com",
    password: "Eleve123!",
    user_metadata: {
      name: "Élève Test",
      role: "student",
    },
  },
  {
    email: "sophie.lapointe@example.com",
    password: "Sophie123!",
    user_metadata: {
      name: "Sophie Lapointe",
      role: "student",
    },
  },
  {
    email: "lucas.gagnon@example.com",
    password: "Lucas123!",
    user_metadata: {
      name: "Lucas Gagnon",
      role: "student",
    },
  },
  {
    email: "emma.tremblay@example.com",
    password: "Emma123!",
    user_metadata: {
      name: "Emma Tremblay",
      role: "student",
    },
  },
  // Tuteurs
  {
    email: "marie@example.com",
    password: "Marie123!",
    user_metadata: {
      name: "Marie Dubois",
      role: "tutor",
    },
  },
  {
    email: "jean@example.com",
    password: "Jean123!",
    user_metadata: {
      name: "Jean Tremblay",
      role: "tutor",
    },
  },
  {
    email: "sophie@example.com",
    password: "Sophie123!",
    user_metadata: {
      name: "Sophie Martin",
      role: "tutor",
    },
  },
  {
    email: "thomas@example.com",
    password: "Thomas123!",
    user_metadata: {
      name: "Thomas Gagnon",
      role: "tutor",
    },
  },
];

async function createUsers() {
  console.log("🚀 Création des utilisateurs de test...\n");

  for (const user of users) {
    try {
      const { data, error } =
        await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          user_metadata: user.user_metadata,
          email_confirm: true,
        });

      if (error || !data.user) {
        console.error(
          `❌ Erreur pour ${user.email}:`,
          error?.message,
        );
        continue;
      }

      // 🔥 AJOUT IMPORTANT : insertion dans profiles
      const insert = await supabase.from("profiles").insert({
        user_id: data.user.id, // ✅ UUID correct
        email: user.email,
        name: user.user_metadata.name,
        role: user.user_metadata.role,
      });

      if (insert.error) {
        console.error(
          `❌ Profile error pour ${user.email}:`,
          insert.error.message,
        );
      } else {
        console.log(
          `✅ ${user.email} créé avec succès (${user.user_metadata.role})`,
        );
      }
    } catch (err: any) {
      console.error(
        `❌ Exception pour ${user.email}:`,
        err.message,
      );
    }
  }

  console.log("\n🎉 Création des utilisateurs terminée !");
}