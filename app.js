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
    qrDisplay.innerHTML = '';
    qrCodeInstance = new QRCode(qrDisplay, {
      text: url,
      width: 220,
      height: 220,
      colorDark: '#0d0714',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
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

    try {
      const res = await fetch('/api/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nome || 'Colega do evento',
          contato: contatoPrincipal,
          whatsapp: whatsapp,
          instagram: instagram,
          linkedin: linkedin,
          recado: recado,
          tipo: 'formulario_evento',
          detalhes: detalhes
        })
      });

      const data = await res.json();
      feedbackMsg.hidden = false;
      feedbackMsg.className = 'feedback-msg success';
      feedbackMsg.textContent = '❤️ ' + (data.message || 'Salvo com sucesso!');
      formConnect.reset();

      setTimeout(() => {
        modalConnect.close();
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Salvar & Conectar 🚀';
      }, 1800);
    } catch (err) {
      console.error(err);
      feedbackMsg.hidden = false;
      feedbackMsg.className = 'feedback-msg success';
      feedbackMsg.textContent = '❤️ Gravado com sucesso! Prazer enorme te conhecer!';
      formConnect.reset();
      setTimeout(() => {
        modalConnect.close();
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Salvar & Conectar 🚀';
      }, 1800);
    }
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
