<?php
header('Content-Type: application/json');
require 'config.php';
require 'helpers.php';

$body = json_decode(file_get_contents('php://input'), true);
$weddingId = $body['weddingId'] ?? null;
$username = $body['username'] ?? null;
$filename = $body['filename'] ?? 'file.bin';
$mimeType = $body['mimeType'] ?? 'application/octet-stream';

if (!$weddingId || !$username) {
    http_response_code(400);
    echo json_encode(['error'=>'missing']);
    exit;
}

$client = getGoogleClient();
$service = new Google\Service\Drive($client);

// 1) düğün ana klasör id'si (DRIVE_ROOT_FOLDER_ID + weddingId gibi mantık)
// Burada varsayılan: DRVIE_ROOT içindeki bir alt klasörün adı = weddingId
$root = $_ENV['DRIVE_ROOT_FOLDER_ID'];
$weddingFolderId = createFolderIfNotExists($service, $root, $weddingId);

// 2) kullanıcı klasörü
$userFolderId = createFolderIfNotExists($service, $weddingFolderId, $username);

// 3) resumable session oluştur
$accessToken = $client->getAccessToken()['access_token'];
$http = $client->getHttpClient();
$metadata = [
    'name' => $filename,
    'parents' => [$userFolderId]
];

try {
    $response = $http->post('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', [
        'headers' => [
            'Authorization' => 'Bearer ' . $accessToken,
            'Content-Type' => 'application/json; charset=UTF-8',
            'X-Upload-Content-Type' => $mimeType
        ],
        'body' => json_encode($metadata)
    ]);

    $uploadUrl = $response->getHeaderLine('Location'); // önemli: session URL
    echo json_encode(['uploadUrl' => $uploadUrl, 'folderId' => $userFolderId]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
