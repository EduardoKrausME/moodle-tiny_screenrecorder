<?php
// Este arquivo faz parte do Moodle - http://moodle.org/
//
// O Moodle é software livre: você pode redistribuí-lo e/ou modificá-lo
// sob os termos da GNU General Public License publicada pela Free Software
// Foundation, versão 3 da licença ou qualquer versão posterior.

$string['pluginname'] = 'Screen Recorder';
$string['buttontitle'] = 'Gravar tela';
$string['modal:title'] = 'Gravador de tela';
$string['source:screen'] = 'Tela ou janela';
$string['source:presentation'] = 'Apresentação (PPT)';
$string['source:presentation_help'] = 'Abra a apresentação no PowerPoint, LibreOffice ou navegador e selecione a janela da apresentação no seletor de compartilhamento do navegador.';
$string['option:webcam'] = 'Incluir webcam';
$string['option:microphone'] = 'Incluir microfone';
$string['action:start'] = 'Iniciar gravação';
$string['action:stop'] = 'Parar';
$string['action:rerecord'] = 'Gravar novamente';
$string['action:download'] = 'Baixar';
$string['action:attach'] = 'Inserir no editor';
$string['status:ready'] = 'Escolha a origem e inicie a gravação.';
$string['status:acquiring'] = 'Aguardando permissão para compartilhar a tela...';
$string['status:recording'] = 'Gravando';
$string['status:preview'] = 'Gravação concluída. Revise antes de inserir no editor.';
$string['status:uploading'] = 'Enviando {$a}%';
$string['status:uploaded'] = 'Gravação inserida no editor.';
$string['limit:maxduration'] = 'Duração máxima: {$a}';
$string['error:browser'] = 'A gravação de tela não está disponível neste navegador ou a página não está em um contexto seguro.';
$string['error:capture'] = 'Não foi possível iniciar a captura de tela: {$a}';
$string['error:upload'] = 'Não foi possível enviar a gravação.';
$string['error:nofile'] = 'Nenhuma gravação foi recebida.';
$string['error:invalidmime'] = 'O arquivo enviado não é uma gravação WebM ou MP4 válida.';
$string['error:filesizelimit'] = 'A gravação ultrapassa o tamanho máximo de upload permitido neste contexto.';
$string['error:durationlimit'] = 'A gravação ultrapassa a duração máxima configurada.';
$string['error:invaliddraftitem'] = 'O editor não possui uma área de rascunho válida para arquivos.';
$string['error:filestore'] = 'O Moodle não conseguiu armazenar a gravação.';
$string['error:emptyrecording'] = 'O navegador gerou uma gravação vazia.';
$string['error:webcam'] = 'Não foi possível abrir a webcam. A gravação continuará sem ela.';
$string['error:microphone'] = 'Não foi possível abrir o microfone. A gravação continuará sem ele.';
$string['settings:maxduration'] = 'Duração máxima da gravação';
$string['settings:maxduration_desc'] = 'Tempo máximo de uma gravação de tela. O navegador interrompe o MediaRecorder automaticamente quando esse limite é atingido.';
$string['settings:maxduration_invalid'] = 'A duração máxima deve ser maior que zero.';
$string['settings:allowwebcam'] = 'Permitir webcam';
$string['settings:allowwebcam_desc'] = 'Permite que usuários com a capability de webcam adicionem a câmera em picture-in-picture ao vídeo final.';
$string['settings:allowmicrophone'] = 'Permitir microfone';
$string['settings:allowmicrophone_desc'] = 'Permite que usuários com a capability de microfone misturem o áudio do microfone à gravação.';
$string['settings:allowppt'] = 'Permitir modo apresentação (PPT)';
$string['settings:allowppt_desc'] = 'Adiciona um modo de captura de apresentação que pede ao navegador uma janela de apresentação, sem enviar o arquivo para um visualizador externo.';
$string['screenrecorder:use'] = 'Usar o Screen Recorder';
$string['screenrecorder:usewebcam'] = 'Incluir webcam nas gravações de tela';
$string['screenrecorder:usemicrophone'] = 'Incluir microfone nas gravações de tela';
$string['screenrecorder:usepresentation'] = 'Usar o modo de captura de apresentação';
$string['privacy:metadata'] = 'O Screen Recorder não armazena dados próprios. As gravações são colocadas na área padrão de rascunho do usuário no Moodle e passam a pertencer ao componente dono do campo do editor quando o formulário é salvo.';
