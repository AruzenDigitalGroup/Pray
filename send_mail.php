<?php
// On s'assure que les erreurs ne sont pas affichées en production pour la sécurité
// error_reporting(0);
// ini_set('display_errors', 0);

// On ne traite que les requêtes POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // --- CONFIGURATION ---
    // REMPLACEZ PAR VOTRE ADRESSE E-MAIL DE DESTINATION
    $recipient_email = "info@egliseallianceavecchrist.org"; 

    // Précisez un e-mail "From" qui utilise le nom de domaine de votre site pour une meilleure délivrabilité
    $sender_email = "contact-form@votredomaine.com"; 
    
    $subject_prefix = "Nouveau message depuis le site EAC";

    // --- RÉCUPÉRATION ET CORRECTION DES DONNÉES ---

    // CHANGEMENT ICI : On utilise stripslashes() pour enlever les antislashs automatiques (magic quotes).
    // On garde trim() pour enlever les espaces inutiles au début et à la fin.
    // On a retiré htmlspecialchars() car ce n'est pas nécessaire pour un e-mail en texte brut.
    $name = isset($_POST['name']) ? stripslashes(trim($_POST['name'])) : '';
    $phone = isset($_POST['phone']) ? stripslashes(trim($_POST['phone'])) : '';
    $message = isset($_POST['message']) ? stripslashes(trim($_POST['message'])) : '';

    // Pour l'e-mail, on continue de le filtrer spécifiquement
    $email = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL) : '';

    // --- VALIDATION CÔTÉ SERVEUR ---
    if (empty($name) || empty($phone) || empty($message)) {
        http_response_code(400); // Bad Request
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['status' => 'error', 'message' => 'Veuillez remplir tous les champs obligatoires.']);
        exit;
    }

    // --- CONSTRUCTION DE L'E-MAIL ---
    
    // Le sujet est toujours encodé en base64 pour garantir la compatibilité UTF-8
    $subject = "=?UTF-8?B?".base64_encode($subject_prefix . " de " . $name)."?=";

    // Le corps de l'e-mail avec les données nettoyées
    $email_body = "Vous avez reçu un nouveau message depuis le formulaire de contact du site EAC.\n\n";
    $email_body .= "--------------------------------------------------\n";
    $email_body .= "Nom: " . $name . "\n";
    $email_body .= "Téléphone / WhatsApp: " . $phone . "\n";
    
    // Ajouter l'e-mail seulement s'il est fourni et valide
    if (!empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $email_body .= "E-mail: " . $email . "\n";
    }
    
    $email_body .= "--------------------------------------------------\n\n";
    $email_body .= "Message:\n" . $message . "\n";

    // --- EN-TÊTES (HEADERS) ---
    // Cette partie reste inchangée, elle est déjà correcte pour l'UTF-8
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8" . "\r\n";
    $headers .= "Content-Transfer-Encoding: 8bit" . "\r\n";
    $headers .= "From: =?UTF-8?B?".base64_encode("Site Web EAC")."?= <" . $sender_email . ">" . "\r\n";
    
    if (!empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $headers .= "Reply-To: " . $name . " <" . $email . ">" . "\r\n";
    }

    // --- ENVOI ---
    if (mail($recipient_email, $subject, $email_body, $headers)) {
        http_response_code(200);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['status' => 'success', 'message' => 'Votre message a été envoyé avec succès !']);
    } else {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['status' => 'error', 'message' => 'Le serveur n\'a pas pu envoyer le message. Veuillez réessayer plus tard.']);
    }

} else {
    http_response_code(405);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['status' => 'error', 'message' => 'Méthode non autorisée.']);
}
?>