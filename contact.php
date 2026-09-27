<?php
/*
 * Contact form handler for contact.html.
 *
 * Emails each enquiry to RECIPIENT using PHP's mail() function, which most
 * cPanel / Plesk hosting supports. Set RECIPIENT below before going live.
 *
 * Replies with JSON when the page sends the form with JavaScript, and
 * otherwise redirects back to contact.html#form-sent or #form-error.
 */

// Address that receives the messages, e.g. 'hello@yourdomain.com'.
const RECIPIENT = '';

// Optional sender address on your own domain. Leave empty to use
// no-reply@<this website's domain>.
const SENDER = '';

const SITE_NAME = 'HiCircus Studio';

const SERVICES = ['Architecture', 'Products', 'Motion', 'Immersive', 'AI Visualization', 'Not sure yet'];

header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function wants_json(): bool
{
    return strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false;
}

function respond(bool $ok, string $message, int $status): void
{
    if (wants_json()) {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => $ok, 'message' => $message]);
    } else {
        header('Location: contact.html#' . ($ok ? 'form-sent' : 'form-error'), true, 303);
    }
    exit;
}

// Character-aware length helpers (mbstring is optional on some hosts).
function text_length(string $text): int
{
    return function_exists('mb_strlen') ? mb_strlen($text, 'UTF-8') : strlen($text);
}

function text_cut(string $text, int $max): string
{
    return function_exists('mb_substr') ? mb_substr($text, 0, $max, 'UTF-8') : substr($text, 0, $max);
}

// Single-line text: no line breaks (they could inject mail headers).
function field(string $name, int $max): string
{
    $value = trim((string) ($_POST[$name] ?? ''));
    $value = preg_replace('/[\r\n\t]+/', ' ', $value);
    return text_cut($value, $max);
}

function encode_header(string $text): string
{
    return '=?UTF-8?B?' . base64_encode($text) . '?=';
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(false, 'Please use the form on the contact page.', 405);
}

// Spam trap: people never see this field, bots tend to fill it in.
if (trim((string) ($_POST['website'] ?? '')) !== '') {
    respond(true, 'Thank you. Your message has been sent.', 200);
}

$name = field('name', 100);
$email = field('email', 254);
$company = field('company', 120);
$service = field('service', 60);
$message = trim(str_replace("\r\n", "\n", (string) ($_POST['message'] ?? '')));
$consent = ($_POST['consent'] ?? '') === 'yes';

if ($name === '' || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    respond(false, 'Please enter your name and a valid email address.', 422);
}
if (text_length($message) < 10) {
    respond(false, 'Please tell us a little more about your project (at least 10 characters).', 422);
}
if (text_length($message) > 5000) {
    respond(false, 'Please keep your message under 5,000 characters.', 422);
}
if ($service !== '' && !in_array($service, SERVICES, true)) {
    $service = '';
}
if (!$consent) {
    respond(false, 'Please confirm that we may use your details to reply to you.', 422);
}

if (RECIPIENT === '') {
    respond(false, 'The contact form is not connected to an email address yet. Please try again later.', 503);
}

$host = strtolower(preg_replace('/[^A-Za-z0-9.\-]/', '', (string) ($_SERVER['SERVER_NAME'] ?? '')));
$host = preg_replace('/^www\./', '', $host) ?: 'localhost';
$from = SENDER !== '' ? SENDER : 'no-reply@' . $host;

$subject = 'New enquiry from ' . $name . ' — ' . SITE_NAME;
$body = implode("\n", [
    'Name: ' . $name,
    'Email: ' . $email,
    'Company: ' . ($company !== '' ? $company : '—'),
    'Service: ' . ($service !== '' ? $service : '—'),
    '',
    'Message:',
    $message,
    '',
    '—',
    'Sent from the contact form on ' . $host . ' on ' . gmdate('j F Y, H:i') . ' UTC.',
]);
$headers = implode("\r\n", [
    'From: ' . encode_header(SITE_NAME) . ' <' . $from . '>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
]);

if (!mail(RECIPIENT, encode_header($subject), $body, $headers)) {
    respond(false, 'Your message could not be sent. Please try again in a moment.', 500);
}

respond(true, 'Thank you. Your message has been sent and we’ll get back to you soon.', 200);
