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

    // 2. Enviar para a Planilha do Google Sheets (se configurada)
    const googleSheetUrl = (typeof CONFIG !== 'undefined' && CONFIG.GOOGLE_SHEET_URL) 
      ? CONFIG.GOOGLE_SHEET_URL 
      : localStorage.getItem('munux_google_sheet_url');

    let enviouGoogle = false;
    if (googleSheetUrl) {
      try {
        const formData = new URLSearchParams();
        Object.keys(payload).forEach(key => formData.append(key, payload[key]));

        await fetch(googleSheetUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString()
        });
        enviouGoogle = true;
      } catch (errGoogle) {
        console.warn('Tentativa Google Sheets:', errGoogle);
      }
    }

    // 3. Tentar servidor local (se estiver em execução)
    try {
      await fetch('/api/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (_) {
      // Ignora silenciosamente se o servidor Python local estiver offline
    }

    // Feedback de sucesso
    feedbackMsg.hidden = false;
    feedbackMsg.className = 'feedback-msg success';
    feedbackMsg.textContent = enviouGoogle 
      ? '✨ Conexão salva na sua planilha com sucesso!' 
      : '❤️ Contato registrado com sucesso! Amei te conhecer!';
    formConnect.reset();

    setTimeout(() => {
      modalConnect.close();
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'Salvar & Conectar 🚀';
    }, 1800);
  });

  // Rastrear cliques nos links (LinkedIn, WhatsApp, GitHub, Currículo)
  document.querySelectorAll('.social-card').forEach(card => {
    card.addEventListener('click', () => {
      const channel = card.getAttribute('data-channel');
      // Enviar log em segundo plano
      fetch('/api/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: 'Visitante anônimo do evento',
          contato: 'N/A',
          tipo: 'clique_canal',
          detalhes: `Acessou: ${channel}`
        })
      }).catch(() => {});
    });
  });



  // Notificar visita inicial
  fetch('/api/registrar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nome: 'Scan de QR Code',
      contato: 'Acesso inicial',
      tipo: 'visita_pagina',
      detalhes: 'Leu QR code do evento'
    })
  }).catch(() => {});
});
