Template – Facture de services de tutorat - Tuto Succès B&D

Objectif: modèle compatible avec génération automatique après validation des séances complétées (un parent réserve X séances, une fois complétées, le site génère et envoie la facture).
A) Champs back end
Informations facture
●	invoice_id (Texte auto – ex.: TS-2025-00123)

●	invoice_date (Date) – Date d’émission

●	due_date (Date) – Date d’échéance (ex.: +7 jours)

●	payment_status (Liste: À payer / Partiellement payé / Payé)

●	payment_link_url (Texte) – Lien de paiement en ligne (pour le bouton “Payer maintenant”)

Informations Tuto-Succès B&D
●	company_name (Texte) – Tuto-Succès B&D

●	company_address (Texte) – En Ligne

●	company_phone (Texte) – 514-651-2401

●	company_email (Texte) – tutosuccesbd@gmail.com

●	company_website (Texte) – URL du futur site

●	company_registration_number (Texte, optionnel) – 514-651-2401

Informations client
●	client_name (Texte) – Nom du parent / responsable

●	client_address (Texte) – Adresse de facturation

●	client_email (Email) – Courriel pour l’envoi de la facture

●	student_name (Texte) – Nom de l’élève (ou des élèves, si plusieurs)

Détails des séances (table / lignes)
 Pour chaque ligne:
●	line_date (Date) – Date de la séance

●	line_student_name (Texte) – Élève

●	line_subject (Texte) – Matière

●	line_duration_hours (Nombre) – Durée en heures (ex.: 1, 1.5, 2)

●	line_rate (Nombre) – Tarif horaire (50 / 55 / 60)

●	line_total (Nombre) – Montant pour la ligne (auto: durée × tarif)

Totaux
●	subtotal (Nombre) – Somme des lignes

●	discount_amount (Nombre) – Rabais, s’il y en a (optionnel)

●	tax_rate_qst (Nombre, optionnel) – Taux TVQ si vous êtes inscrits

●	tax_rate_gst (Nombre, optionnel) – Taux TPS

●	tax_amount_qst (Nombre, auto)

●	tax_amount_gst (Nombre, auto)

●	total_due (Nombre) – Montant total à payer

Paiement
●	payment_methods_text (Texte) – Ex.: “Visa, Mastercard ou Interac”

●	payment_instructions (Texte) – Délai de paiement, notes, etc.

B) Modèle de rendu (PDF / email)
Tuto-Succès B&D
 Facture de services de tutorat
Informations Tuto-Succès B&D
 Tuto-Succès B&D
 [company_address]
 Téléphone : [company_phone]
 Courriel : [company_email]
 Site web : [company_website]
 Numéro d’entreprise (le cas échéant) : [company_registration_number]
Informations de la facture
 Numéro de facture : [invoice_id]
 Date d’émission : [invoice_date]
 Date d’échéance : [due_date]
 Statut : [payment_status]
Informations du client
 Nom du parent / responsable : [client_name]
 Adresse : [client_address]
 Courriel : [client_email]
 Élève(s) concerné(s) : [student_name]
Détails des séances
Tableau (colonne par colonne):
 Date | Élève | Matière | Durée (h) | Tarif horaire | Montant
●	[line_date] | [line_student_name] | [line_subject] | [line_duration_hours] | [line_rate] $ | [line_total] $

Sous-total : [subtotal] $
 Rabais : [discount_amount] $
 TPS (si applicable) : [tax_amount_gst] $
 TVQ (si applicable) : [tax_amount_qst] $
Total à payer : [total_due] $
Modes de paiement
 Le paiement peut être effectué de la manière suivante :
●	Carte de crédit : Visa ou Mastercard

●	Interac (virement ou débit, selon l’option intégrée à la plateforme): tutosuccesbd@gmail.com

Pour un paiement en ligne sécurisé, veuillez cliquer sur le lien suivant :
 [Payer maintenant] (bouton lié à [payment_link_url])
Conditions de paiement
 Merci d’effectuer le paiement au plus tard le [due_date].
 Pour toute question concernant cette facture ou les séances de tutorat, vous pouvez nous joindre à [company_email] ou au [company_phone].
Message de remerciement
 Merci de votre confiance envers Tuto-Succès B&D.
 L’effort, la persévérance et l’encadrement mènent à la réussite.

