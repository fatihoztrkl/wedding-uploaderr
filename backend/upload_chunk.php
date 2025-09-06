<?php
require 'config.php';
require 'helpers.php';

// Basit: frontend her chunk'ı gönderir; backend sırasıyla Drive'a yazmalı.
// Bu dosya, gerçek prod için state (hangi dosyanın hangi offsette olduğu) saklamalı.
// Burada demo amaçlı basit bir append yöntemi yok; yerine frontend önce init_upload ile resumable URL almalı.
// Eğer fallback kullanılıyorsa backend kendisi resumable session başlatmalı ve parçaları sırayla iletmeli.
// Bu endpoint prod için daha fazla state yönetimi gerektirir.

echo json_encode(['status'=>'ok','note'=>'fallback endpoint placeholder. implement server-side resumable session state store.']);
