'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const modalConnect = document.getElementById('modal-connect');
  const btnOpenConnect = document.getElementById('btn-connect-modal');
  const btnCloseConnect = document.getElementById('btn-close-modal');
  const formConnect = document.getElementById('form-connect');
  const feedbackMsg = document.getElementById('connect-feedback');

  const modalQr = document.getElementById('modal-qr');
  const btnShowQr = document.getElementById('btn-show-qr');
  const btnCloseQr = document.getElementById('btn-close-qr');
  const qrDisplay = document.getElementById('qr-display');
  const qrLiveUrl = document.getElementById('qr-live-url');
  const btnCopyUrl = document.getElementById('btn-copy-url');



  // URL atual (seja localhost, IP do wifi, ou URL pública do cloudflare)
  const currentUrl = window.location.href;
  qrLiveUrl.textContent = currentUrl;

  // Gerar QR Code
  let qrCodeInstance = null;
  function renderQrCode(url) {
    if (!qrDisplay) return;
    qrDisplay.innerHTML = '';
    try {
      if (typeof QRCode !== 'undefined') {
        qrCodeInstance = new QRCode(qrDisplay, {
          text: url,
          width: 220,
          height: 220,
          colorDark: '#0d0714',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H
        });
      } else {
        qrDisplay.innerHTML = '<img src="./qrcode-evento-munique.png" alt="QR Code Munique" style="width:220px;height:220px;border-radius:12px;background:#fff;padding:8px;">';
      }
    } catch (err) {
      console.warn('Fallback para imagem de QR Code:', err);
      qrDisplay.innerHTML = '<img src="./qrcode-evento-munique.png" alt="QR Code Munique" style="width:220px;height:220px;border-radius:12px;background:#fff;padding:8px;">';
    }
  }
  renderQrCode(currentUrl);

  // Botão Copiar URL
  btnCopyUrl.addEventListener('click', () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      btnCopyUrl.textContent = 'Copiado!';
      setTimeout(() => btnCopyUrl.textContent = 'Copiar', 2000);
    });
  });

  // Modal QR
  btnShowQr.addEventListener('click', () => modalQr.showModal());
  btnCloseQr.addEventListener('click', () => modalQr.close());

  // Modal Conexão / Deixar Contato
  btnOpenConnect.addEventListener('click', () => {
    feedbackMsg.hidden = true;
    modalConnect.showModal();
  });
  btnCloseConnect.addEventListener('click', () => modalConnect.close());

  // Salvar formulário
  formConnect.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('inp-nome').value.trim();
    const whatsapp = document.getElementById('inp-whatsapp').value.trim();
    const instagram = document.getElementById('inp-instagram').value.trim();
    const linkedin = document.getElementById('inp-linkedin').value.trim();
    const recado = document.getElementById('inp-recado').value.trim();
    const btnSubmit = document.getElementById('btn-save-contact');

    // Validação suave: pelo menos um campo preenchido
    if (!nome && !whatsapp && !instagram && !linkedin && !recado) {
      feedbackMsg.hidden = false;
      feedbackMsg.className = 'feedback-msg';
      feedbackMsg.style.color = '#ff66ad';
      feedbackMsg.textContent = 'Preencha pelo menos um campo ou rede pra gente se conectar! ✨';
      return;
    }

    const canais = [];
    if (whatsapp) canais.push(`WhatsApp: ${whatsapp}`);
    if (instagram) canais.push(`Instagram: ${instagram}`);
    if (linkedin) canais.push(`LinkedIn: ${linkedin}`);

    const contatoPrincipal = canais.join(' · ') || (recado ? `Recado: ${recado}` : 'Contato do evento');
    const detalhes = recado ? `Recado: "${recado}"` : 'Preencheu formulário no evento';

    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Gravando...';

    const payload = {
      nome: nome || 'Colega do evento',
      contato: contatoPrincipal,
      whatsapp: whatsapp,
      instagram: instagram,
      linkedin: linkedin,
      recado: recado,
      tipo: 'formulario_evento',
      detalhes: detalhes,
      criado_em: new Date().toLocaleString('pt-BR')
    };

    // 1. Sempre salvar no backup local (localStorage)
    try {
      const backupAntigo = JSON.parse(localStorage.getItem('munux_contatos_locais') || '[]');
      backupAntigo.unshift(payload);
      localStorage.setItem('munux_contatos_locais', JSON.stringify(backupAntigo));
    } catch (errStorage) {
      console.warn('Erro ao salvar no localStorage:', errStorage);
    }

    // 2. Enviar para a Nuvem (Google Sheets) e Servidor Local
    await registrarInteracao(payload);

    // Feedback de sucesso
    feedbackMsg.hidden = false;
    feedbackMsg.className = 'feedback-msg success';
    feedbackMsg.textContent = '✨ Conexão salva com sucesso! Amei te conhecer!';
    formConnect.reset();

    setTimeout(() => {
      modalConnect.close();
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'Salvar & Conectar 🚀';
    }, 1800);
  });

  // Função centralizada para registrar conexões na nuvem apenas quando a pessoa submete o formulário
  async function registrarInteracao(dataPayload) {
    const googleSheetUrl = (typeof CONFIG !== 'undefined' && CONFIG.GOOGLE_SHEET_URL) 
      ? CONFIG.GOOGLE_SHEET_URL 
      : localStorage.getItem('munux_google_sheet_url');

    if (googleSheetUrl) {
      try {
        const formData = new URLSearchParams();
        Object.keys(dataPayload).forEach(key => formData.append(key, dataPayload[key] || ''));

        await fetch(googleSheetUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString()
        });
      } catch (errGoogle) {
        console.warn('Tentativa Google Sheets:', errGoogle);
      }
    }

    try {
      await fetch('/api/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataPayload)
      });
    } catch (_) {}
  }
});
