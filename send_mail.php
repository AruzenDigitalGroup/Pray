<?php
// =================================================================
// CONFIGURATION - À MODIFIER PAR LE PROPRIÉTAIRE DU SITE
// =================================================================

// L'adresse e-mail qui recevra les messages du formulaire.
$recipient_email = "info@egliseallianceavecchrist.org";

// L'adresse e-mail utilisée pour l'envoi.
// IMPORTANT : Pour une meilleure délivrabilité et pour éviter les spams,
// cette adresse DOIT être une adresse e-mail valide associée à votre nom de domaine.
// Par exemple, si votre site est "monsite.com", utilisez une adresse comme "noreply@monsite.com" ou "contact@monsite.com".
// Vous devrez peut-être créer cette adresse e-mail dans votre panneau d'hébergement (cPanel, etc.).
$sender_email = "contact-form@votredomaine.com";

// Le préfixe du sujet de l'e-mail que vous recevrez.
$subject_prefix = "Nouveau message depuis le site EAC";

// =================================================================
// FIN DE LA CONFIGURATION
// =================================================================

// --- Sécurité et Initialisation ---

// On s'assure que le script ne s'exécute que pour les requêtes POST.
if ($_SERVER["REQUEST_METHOD"] != "POST") {
    http_response_code(405); // Méthode non autorisée
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['status' => 'error', 'message' => 'Méthode non autorisée.']);
    exit;
}

// En production, il est recommandé de ne pas afficher les erreurs PHP à l'utilisateur.
// error_reporting(0);
// ini_set('display_errors', 0);

// --- Récupération et Nettoyage des Données ---

// On nettoie les entrées pour enlever les espaces superflus et les slashes.
$name = isset($_POST['name']) ? trim(stripslashes($_POST['name'])) : '';
$phone = isset($_POST['phone']) ? trim(stripslashes($_POST['phone'])) : '';
$message = isset($_POST['message']) ? trim(stripslashes($_POST['message'])) : '';
$email = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL) : '';

// --- Validation Côté Serveur ---

// 1. Vérifier que les champs obligatoires ne sont pas vides.
if (empty($name) || empty($phone) || empty($message)) {
    http_response_code(400); // Bad Request
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['status' => 'error', 'message' => 'Veuillez remplir tous les champs obligatoires.']);
    exit;
}

// 2. Vérifier que le numéro de téléphone a une longueur minimale raisonnable.
if (strlen($phone) < 5) {
    http_response_code(400);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['status' => 'error', 'message' => 'Le numéro de téléphone semble invalide.']);
    exit;
}

// --- Construction et Envoi de l'E-mail ---

// Sujet de l'e-mail (encodé pour bien afficher les caractères spéciaux et accents)
$subject = "=?UTF-8?B?".base64_encode($subject_prefix . " de " . $name)."?=";

// Corps du message
$email_body = "Vous avez reçu un nouveau message depuis le formulaire de contact du site EAC.\n\n";
$email_body .= "--------------------------------------------------\n";
$email_body .= "Nom: " . $name . "\n";
$email_body .= "Téléphone / WhatsApp: " . $phone . "\n";

// On ajoute l'e-mail seulement s'il a été fourni et s'il est valide.
if (!empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $email_body .= "E-mail: " . $email . "\n";
}

$email_body .= "--------------------------------------------------\n\n";
$email_body .= "Message:\n" . $message . "\n";

// En-têtes de l'e-mail
$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8" . "\r\n";
$headers .= "Content-Transfer-Encoding: 8bit" . "\r\n";
$headers .= "From: =?UTF-8?B?".base64_encode("Site Web EAC")."?= <" . $sender_email . ">" . "\r\n";

// Si l'utilisateur a fourni une adresse e-mail, on l'utilise pour le champ "Reply-To".
// Cela permet de répondre directement à l'utilisateur depuis le client mail.
if (!empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $headers .= "Reply-To: " . $name . " <" . $email . ">" . "\r\n";
}

// Envoi de l'e-mail
if (mail($recipient_email, $subject, $email_body, $headers)) {
    http_response_code(200);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['status' => 'success', 'message' => 'Votre message a été envoyé avec succès !']);
} else {
    http_response_code(500); // Erreur Interne du Serveur
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['status' => 'error', 'message' => 'Le serveur n\'a pas pu envoyer le message. Veuillez réessayer plus tard.']);
}

exit;
?>
