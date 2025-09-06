<?php
require 'config.php';
use Google\Service\Drive;
use Google\Service\Drive\DriveFile;

function createFolderIfNotExists($service, $parentId, $folderName) {
    // query: name and parent and mimeType
    $q = "name = '" . addslashes($folderName) . "' and '$parentId' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false";
    $resp = $service->files->listFiles(['q' => $q, 'fields' => 'files(id, name)']);
    if (count($resp->files) > 0) {
        return $resp->files[0]->id;
    }
    $fileMetadata = new DriveFile([
        'name' => $folderName,
        'mimeType' => 'application/vnd.google-apps.folder',
        'parents' => [$parentId]
    ]);
    $folder = $service->files->create($fileMetadata, ['fields' => 'id']);
    return $folder->id;
}
