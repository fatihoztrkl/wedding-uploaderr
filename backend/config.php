<?php
require __DIR__ . '/vendor/autoload.php';
use Google\Client;
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

function getGoogleClient() {
    $client = new Google\Client();
    $client->setClientId($_ENV['GOOGLE_CLIENT_ID']);
    $client->setClientSecret($_ENV['GOOGLE_CLIENT_SECRET']);
    $client->setAccessType('offline');
    $client->setPrompt('select_account consent');
    $client->addScope(Google\Service\Drive::DRIVE);
    // set refresh token if available
    if (!empty($_ENV['GOOGLE_REFRESH_TOKEN'])) {
        $client->fetchAccessTokenWithRefreshToken($_ENV['GOOGLE_REFRESH_TOKEN']);
        $token = $client->getAccessToken();
    }
    return $client;
}
