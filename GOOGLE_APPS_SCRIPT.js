/**
 * CÓDIGO DO GOOGLE APPS SCRIPT PARA O SEU APP DE EVENTOS
 * 
 * Como instalar no seu Google Drive (leva 2 minutinhos):
 * 1. Abra o Google Sheets (planilha nova): https://sheets.new
 * 2. Dê o nome de: "Contatos Eventos - Munique"
 * 3. Na primeira linha da planilha (cabeçalho), escreva nas colunas A até G:
 *    A1: Data e Hora
 *    B1: Nome
 *    C1: WhatsApp
 *    D1: Instagram
 *    E1: LinkedIn
 *    F1: Recado / Assunto
 *    G1: Contato Principal
 * 
 * 4. No menu superior da planilha, clique em: "Extensões" > "Apps Script"
 * 5. Apague o código que estiver lá e cole todo este arquivo abaixo.
 * 6. Clique no botão "Salvar" (ícone de disquete).
 * 7. Clique no botão azul "Implantar" (canto superior direito) > "Nova implantação".
 * 8. Clique no ícone de engrenagem ao lado de "Selecione o tipo" e escolha "App da Web".
 * 9. Configure assim:
 *    - Descrição: "API de Contatos do Evento"
 *    - Executar como: "Eu (seu e-mail)"
 *    - Quem pode acessar: "Qualquer pessoa" (MUITO IMPORTANTE!)
 * 10. Clique em "Implantar", autorize o acesso com a sua conta Google.
 * 11. Copie a URL do App da Web gerada (ela começa com https://script.google.com/macros/s/...)
 * 12. Cole essa URL no seu app.js e no admin.html!
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = {};
    
    if (e.postData && e.postData.contents) {
      try {
        data = jsonParseSafe(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e.parameter) {
      data = e.parameter;
    }

    var agora = Utilities.formatDate(new Date(), "America/Sao_Paulo", "dd/MM/yyyy HH:mm:ss");
    var nome = data.nome || "Colega do evento";
    var whatsapp = data.whatsapp || "";
    var instagram = data.instagram || "";
    var linkedin = data.linkedin || "";
    var recado = data.recado || "";
    var contatoPrincipal = data.contato || "";

    // Adiciona uma nova linha com os dados
    sheet.appendRow([
      agora,
      nome,
      whatsapp,
      instagram,
      linkedin,
      recado,
      contatoPrincipal
    ]);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Conexão gravada com sucesso na sua planilha Google!"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rows = sheet.getDataRange().getValues();
    var contatos = [];

    // Ignora a linha 1 (cabeçalho)
    for (var i = 1; i < rows.length; i++) {
      var r = rows[i];
      if (!r[1] && !r[2] && !r[3] && !r[4] && !r[5]) continue; // linha vazia

      contatos.push({
        id: i,
        criado_em: r[0],
        nome: r[1],
        whatsapp: r[2],
        instagram: r[3],
        linkedin: r[4],
        recado: r[5],
        contato: r[6] || r[2] || r[3] || r[4] || "Contato",
        tipo: "formulario_evento",
        detalhes: r[5] ? 'Recado: "' + r[5] + '"' : "Conexão do evento"
      });
    }

    // Retorna ordenado do mais recente para o mais antigo
    contatos.reverse();

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      total: contatos.length,
      conexoes: contatos
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString(),
      total: 0,
      conexoes: []
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function jsonParseSafe(str) {
  return JSON.parse(str);
}
