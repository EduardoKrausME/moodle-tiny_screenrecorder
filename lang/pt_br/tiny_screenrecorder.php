<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <https://www.gnu.org/licenses/>.

/**
 * Portuguese (Brazil) strings for Screen Recorder.
 *
 * @package    tiny_screenrecorder
 * @copyright  2026 Eduardo Kraus
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$string['action:attach'] = 'Inserir no editor';
$string['action:download'] = 'Baixar';
$string['action:rerecord'] = 'Gravar novamente';
$string['action:start'] = 'Iniciar gravação';
$string['action:stop'] = 'Parar';
$string['buttontitle'] = 'Gravar tela';
$string['error:browser'] = 'A gravação de tela não está disponível neste navegador ou a página não está em um contexto seguro.';
$string['error:capture'] = 'Não foi possível iniciar a captura de tela: {$a}';
$string['error:durationlimit'] = 'A gravação ultrapassa a duração máxima configurada.';
$string['error:emptyrecording'] = 'O navegador gerou uma gravação vazia.';
$string['error:filesizelimit'] = 'A gravação ultrapassa o tamanho máximo de upload permitido neste contexto.';
$string['error:filestore'] = 'O Moodle não conseguiu armazenar a gravação.';
$string['error:invaliddraftitem'] = 'O editor não possui uma área de rascunho válida para arquivos.';
$string['error:invalidmime'] = 'O arquivo enviado não é uma gravação WebM ou MP4 válida.';
$string['error:microphone'] = 'Não foi possível abrir o microfone. A gravação continuará sem ele.';
$string['error:nofile'] = 'Nenhuma gravação foi recebida.';
$string['error:upload'] = 'Não foi possível enviar a gravação.';
$string['error:webcam'] = 'Não foi possível abrir a webcam. A gravação continuará sem ela.';
$string['limit:maxduration'] = 'Duração máxima: {$a}';
$string['modal:title'] = 'Gravador de tela';
$string['option:microphone'] = 'Incluir microfone';
$string['option:webcam'] = 'Incluir webcam';
$string['pluginname'] = 'Screen Recorder';
$string['privacy:metadata'] = 'O Screen Recorder não armazena dados próprios. As gravações são colocadas na área padrão de rascunho do usuário no Moodle e passam a pertencer ao componente dono do campo do editor quando o formulário é salvo.';
$string['screenrecorder:use'] = 'Usar o Screen Recorder';
$string['screenrecorder:usemicrophone'] = 'Incluir microfone nas gravações de tela';
$string['screenrecorder:usepresentation'] = 'Usar o modo de captura de apresentação';
$string['screenrecorder:usewebcam'] = 'Incluir webcam nas gravações de tela';
$string['settings:allowmicrophone'] = 'Permitir microfone';
$string['settings:allowmicrophone_desc'] = 'Permite que usuários com a capability de microfone misturem o áudio do microfone à gravação.';
$string['settings:allowppt'] = 'Permitir modo apresentação (PPT)';
$string['settings:allowppt_desc'] = 'Adiciona um modo de captura de apresentação que pede ao navegador uma janela de apresentação, sem enviar o arquivo para um visualizador externo.';
$string['settings:allowwebcam'] = 'Permitir webcam';
$string['settings:allowwebcam_desc'] = 'Permite que usuários com a capability de webcam adicionem a câmera em picture-in-picture ao vídeo final.';
$string['settings:maxduration'] = 'Duração máxima da gravação';
$string['settings:maxduration_desc'] = 'Tempo máximo de uma gravação de tela. O navegador interrompe o MediaRecorder automaticamente quando esse limite é atingido.';
$string['settings:maxduration_invalid'] = 'A duração máxima deve ser maior que zero.';
$string['source:presentation'] = 'Apresentação (PPT)';
$string['source:presentation_help'] = 'Abra a apresentação no PowerPoint, LibreOffice ou navegador e selecione a janela da apresentação no seletor de compartilhamento do navegador.';
$string['source:screen'] = 'Tela ou janela';
$string['status:acquiring'] = 'Aguardando permissão para compartilhar a tela...';
$string['status:preview'] = 'Gravação concluída. Revise antes de inserir no editor.';
$string['status:ready'] = 'Escolha a origem e inicie a gravação.';
$string['status:recording'] = 'Gravando';
$string['status:uploaded'] = 'Gravação inserida no editor.';
$string['status:uploading'] = 'Enviando {$a}%';
